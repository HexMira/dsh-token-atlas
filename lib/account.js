/**
 * Account-wide usage from DeepSeek Platform.
 *
 * The local ledger only sees this machine's session logs. The Platform usage
 * APIs aggregate every device and API key signed into the same account, so
 * they are the source of truth for "account total". The access token stays in
 * the Host: this module never returns it to the browser.
 */
const DAY = 86_400
const TZ = 8 * 3_600
const CHUNK_DAYS = 30
const MAX_CHUNKS = 24 // two years of 30-day windows
const CACHE_MS = 5 * 60 * 1000
const RANGE_DAYS = { '7d': 7, '30d': 30 }
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'

function pad2(value) {
  return String(value).padStart(2, '0')
}

/** Beijing midnight after today, in epoch seconds (the Platform API's exclusive end). */
function bjTomorrow() {
  const shifted = Date.now() + TZ * 1000
  const dayStart = Math.floor(shifted / (DAY * 1000)) * (DAY * 1000)
  return Math.floor((dayStart - TZ * 1000) / 1000) + DAY
}

function dayKeyFromSec(sec) {
  const d = new Date((Number(sec) + TZ) * 1000)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

function addDayKey(day, offset) {
  const [y, m, d] = String(day).split('-').map(Number)
  const ts = Date.UTC(y, m - 1, d) + offset * DAY * 1000
  const date = new Date(ts)
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

function emptyTotals() {
  return {
    tokens: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
    cost: 0, costInput: 0, costOutput: 0, costCacheRead: 0, costCacheWrite: 0,
    unpricedTokens: 0, events: 0, requests: 0,
  }
}

function addUsage(target, usage) {
  const hit = Number(usage?.PROMPT_CACHE_HIT_TOKEN) || 0
  const miss = Number(usage?.PROMPT_CACHE_MISS_TOKEN) || 0
  const output = Number(usage?.RESPONSE_TOKEN) || 0
  const requests = Number(usage?.REQUEST) || 0
  target.cacheRead += hit
  target.input += miss
  target.output += output
  target.requests += requests
  target.events += requests
  target.tokens += hit + miss + output
  return { hit, miss, output, requests }
}

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function round6(n) {
  return Math.round((Number(n) || 0) * 1e6) / 1e6
}

function isDshKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'object') return false
  if (String(apiKey.key_type || '').toUpperCase() === 'DSH') return true
  return /deepseek\s*harness/i.test(String(apiKey.name || ''))
}

function keyLabel(apiKey) {
  const name = String(apiKey?.name || '').trim() || 'Unknown key'
  const type = String(apiKey?.key_type || '').toUpperCase() || 'UNKNOWN'
  return { name, type }
}

async function fetchJson(url, headers, timeout = 20_000) {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(timeout),
  })
  if (!res.ok) throw new Error(`Platform HTTP ${res.status}`)
  const body = await res.json()
  if (!body || body.code !== 0) throw new Error(body?.msg || 'Platform request failed')
  const data = body.data
  if (!data || data.biz_code !== 0) throw new Error(data?.biz_msg || 'Platform usage unavailable')
  return data.biz_data
}

function platformHeader() {
  if (process.platform === 'darwin') return 'darwin'
  if (process.platform === 'win32') return 'desktop-win'
  return 'web'
}

function headersFor(session) {
  const origin = String(session.origin || 'https://platform.deepseek.com').replace(/\/$/, '')
  return {
    ...(session.requestHeaders && typeof session.requestHeaders === 'object' ? session.requestHeaders : {}),
    'x-dsh-auth-token': session.token,
    accept: 'application/json',
    origin,
    referer: `${origin}/usage`,
    'x-client-platform': platformHeader(),
    'x-client-version': process.env.DSH_CLIENT_VERSION || '0.2.1-rc.2',
    'x-client-bundle-id': '',
    'x-client-locale': 'zh_CN',
    'x-client-timezone-offset': String(TZ),
    'user-agent': UA,
  }
}

async function fetchSummary(origin, headers) {
  try {
    const data = await fetchJson(`${origin}/api/v0/users/get_user_summary`, headers, 15_000)
    const costs = Array.isArray(data?.total_costs) ? data.total_costs : []
    const cost = costs.find((item) => item && item.currency === 'CNY') || costs[0]
    const wallets = Array.isArray(data?.normal_wallets) ? data.normal_wallets : []
    const wallet = wallets.find((item) => item && item.currency === 'CNY') || wallets[0]
    return {
      totalCost: cost ? num(cost.amount) : null,
      currency: cost?.currency || wallet?.currency || 'CNY',
      balance: wallet ? num(wallet.balance) : null,
    }
  } catch {
    return null
  }
}

function buildRange(kind) {
  const end = bjTomorrow()
  if (kind === 'all') return { kind, end, start: null, days: null }
  const days = RANGE_DAYS[kind] || 30
  return { kind, end, start: end - days * DAY, days }
}

function isAuthFailure(error) {
  const text = String(error && error.message ? error.message : error)
  return /40003|invalid authorization|authorization failed/i.test(text)
}

function createAccumulator() {
  return {
    totals: emptyTotals(),
    dayMap: new Map(),
    modelMap: new Map(),
    keyMap: new Map(),
    functionMap: new Map(),
    currencies: new Set(),
    costByModel: new Map(),
    costByKey: new Map(),
    costByDay: new Map(),
    functionCostByDay: new Map(),
  }
}

function dayRecord(acc, day) {
  let rec = acc.dayMap.get(day)
  if (!rec) {
    rec = { day, tokens: 0, cacheRead: 0, input: 0, output: 0, cacheWrite: 0, requests: 0, cost: 0 }
    acc.dayMap.set(day, rec)
  }
  return rec
}

function modelRecord(acc, model) {
  let rec = acc.modelMap.get(model)
  if (!rec) {
    rec = { model, tokens: 0, cacheRead: 0, input: 0, output: 0, cacheWrite: 0, requests: 0, cost: 0 }
    acc.modelMap.set(model, rec)
  }
  return rec
}

function keyRecord(acc, apiKey) {
  const { name, type } = keyLabel(apiKey)
  const id = `${name}\u0000${type}`
  let rec = acc.keyMap.get(id)
  if (!rec) {
    rec = { name, type, tokens: 0, requests: 0, cost: 0, models: new Set() }
    acc.keyMap.set(id, rec)
  }
  return rec
}

function addAmount(acc, data, scope) {
  for (const series of Array.isArray(data?.series) ? data.series : []) {
    const apiKey = series?.api_key
    if (scope === 'dsh' && !isDshKey(apiKey)) continue
    const model = String(series?.model || 'unknown')
    const key = keyRecord(acc, apiKey)
    key.models.add(model)
    for (const bucket of Array.isArray(series?.buckets) ? series.buckets : []) {
      const day = dayKeyFromSec(bucket?.time)
      const usage = bucket?.usage || {}
      addUsage(acc.totals, usage)
      const d = dayRecord(acc, day)
      const m = modelRecord(acc, model)
      const hit = Number(usage.PROMPT_CACHE_HIT_TOKEN) || 0
      const miss = Number(usage.PROMPT_CACHE_MISS_TOKEN) || 0
      const output = Number(usage.RESPONSE_TOKEN) || 0
      const requests = Number(usage.REQUEST) || 0
      const tokens = hit + miss + output
      for (const target of [d, m]) {
        target.cacheRead += hit
        target.input += miss
        target.output += output
        target.requests += requests
        target.tokens += tokens
      }
      key.tokens += tokens
      key.requests += requests
    }
  }
}

function addCost(acc, data, scope) {
  const groups = Array.isArray(data?.data) ? data.data : []
  if (groups.length === 0) return
  const group = groups.find((item) => item && item.currency === 'CNY') || groups[0]
  const currency = String(group?.currency || 'CNY')
  acc.currencies.add(currency)

  for (const series of Array.isArray(group?.series) ? group.series : []) {
    const apiKey = series?.api_key
    if (scope === 'dsh' && !isDshKey(apiKey)) continue
    const model = String(series?.model || 'unknown')
    const key = keyRecord(acc, apiKey)
    for (const bucket of Array.isArray(series?.buckets) ? series.buckets : []) {
      const day = dayKeyFromSec(bucket?.time)
      const cost = num(bucket?.cost)
      if (cost === 0) continue
      acc.totals.cost += cost
      const d = dayRecord(acc, day)
      const m = modelRecord(acc, model)
      d.cost += cost
      m.cost += cost
      key.cost += cost
      acc.costByModel.set(model, (acc.costByModel.get(model) || 0) + cost)
      acc.costByKey.set(`${key.name}\u0000${key.type}`, (acc.costByKey.get(`${key.name}\u0000${key.type}`) || 0) + cost)
    }
  }

  for (const series of Array.isArray(group?.function_series) ? group.function_series : []) {
    const apiKey = series?.api_key
    if (scope === 'dsh' && !isDshKey(apiKey)) continue
    const model = String(series?.model || 'server-tool')
    const key = keyRecord(acc, apiKey)
    for (const bucket of Array.isArray(series?.buckets) ? series.buckets : []) {
      const day = dayKeyFromSec(bucket?.time)
      const cost = num(bucket?.cost)
      if (cost === 0) continue
      acc.totals.cost += cost
      const d = dayRecord(acc, day)
      d.cost += cost
      key.cost += cost
      const fn = acc.functionMap.get(model) || { model, cost: 0 }
      fn.cost += cost
      acc.functionMap.set(model, fn)
    }
  }
}

function summarize(acc, range, scope, summary) {
  const totals = acc.totals
  totals.cost = round6(totals.cost)
  const days = [...acc.dayMap.values()].map((rec) => ({ ...rec, cost: round6(rec.cost), cacheWrite: 0 }))
  days.sort((a, b) => (a.day < b.day ? -1 : 1))

  if (range.kind !== 'all') {
    const byDay = new Map(days.map((d) => [d.day, d]))
    const filled = []
    const startDay = dayKeyFromSec(range.start)
    const endDay = dayKeyFromSec(range.end - 1)
    for (let day = startDay; day <= endDay; day = addDayKey(day, 1)) {
      filled.push(byDay.get(day) || { day, tokens: 0, cacheRead: 0, input: 0, output: 0, cacheWrite: 0, requests: 0, cost: 0 })
    }
    days.length = 0
    days.push(...filled)
  }

  const models = [...acc.modelMap.values()]
    .filter((m) => m.tokens > 0 || m.cost > 0)
    .map((m) => ({ ...m, cost: round6(m.cost), cacheWrite: 0, unpricedTokens: 0 }))
    .sort((a, b) => b.tokens - a.tokens || b.cost - a.cost)

  const keys = [...acc.keyMap.values()]
    .filter((k) => k.tokens > 0 || k.cost > 0)
    .map((k) => ({ name: k.name, type: k.type, tokens: k.tokens, requests: k.requests, cost: round6(k.cost), models: k.models.size }))
    .sort((a, b) => b.tokens - a.tokens || b.cost - a.cost)

  const functions = [...acc.functionMap.values()].map((f) => ({ model: f.model, cost: round6(f.cost) })).sort((a, b) => b.cost - a.cost)
  const today = dayKeyFromSec(Date.now() / 1000)
  const todayRec = days.find((d) => d.day === today) || { day: today, tokens: 0, cacheRead: 0, input: 0, output: 0, cacheWrite: 0, requests: 0, cost: 0 }
  const firstDay = days.length > 0 ? days[0].day : null
  const lastDay = days.length > 0 ? days[days.length - 1].day : null

  totals.models = models.length
  totals.keys = keys.length
  totals.sessions = 0
  totals.cacheWrite = 0

  return {
    ok: true,
    available: true,
    source: 'platform',
    scope,
    currency: acc.currencies.has('CNY') ? 'CNY' : ([...acc.currencies][0] || 'CNY'),
    range: {
      kind: range.kind,
      days: range.kind === 'all' ? (firstDay && lastDay ? Math.max(1, Math.round((Date.parse(`${lastDay}T00:00:00Z`) - Date.parse(`${firstDay}T00:00:00Z`)) / 86400000) + 1) : 0) : range.days,
      startDay: firstDay,
      endDay: lastDay,
      startSec: range.start,
      endSec: range.end,
    },
    totals,
    today: todayRec,
    days,
    models,
    keys,
    functions,
    summary,
    fetchedAt: Date.now(),
  }
}

async function fetchChunk(origin, headers, start, end, scope) {
  const [amount, cost] = await Promise.all([
    fetchJson(`${origin}/api/v0/usage/by_api_key/amount?start=${start}&end=${end}&tz=${TZ}`, headers),
    fetchJson(`${origin}/api/v0/usage/by_api_key/cost?start=${start}&end=${end}&tz=${TZ}`, headers),
  ])
  const acc = createAccumulator()
  addAmount(acc, amount, scope)
  addCost(acc, cost, scope)
  return acc
}

function mergeAccumulator(target, source) {
  // Merge totals.
  for (const key of Object.keys(target.totals)) {
    if (typeof target.totals[key] === 'number') target.totals[key] += source.totals[key] || 0
  }
  for (const [day, rec] of source.dayMap) {
    const t = dayRecord(target, day)
    for (const key of ['tokens', 'cacheRead', 'input', 'output', 'requests', 'cost']) t[key] += rec[key] || 0
  }
  for (const [model, rec] of source.modelMap) {
    const t = modelRecord(target, model)
    for (const key of ['tokens', 'cacheRead', 'input', 'output', 'requests', 'cost']) t[key] += rec[key] || 0
  }
  for (const rec of source.keyMap.values()) {
    const t = keyRecord(target, { name: rec.name, key_type: rec.type })
    t.tokens += rec.tokens
    t.requests += rec.requests
    t.cost += rec.cost
    for (const model of rec.models) t.models.add(model)
  }
  for (const [model, rec] of source.functionMap) {
    const t = target.functionMap.get(model) || { model, cost: 0 }
    t.cost += rec.cost
    target.functionMap.set(model, t)
  }
  for (const currency of source.currencies) target.currencies.add(currency)
}

export function createAccountUsage({ getSession, logger = console } = {}) {
  const cache = new Map()

  function cacheGet(key) {
    const hit = cache.get(key)
    if (!hit) return null
    if (Date.now() - hit.at > CACHE_MS) return null
    return hit.value
  }

  function cacheSet(key, value) {
    cache.set(key, { at: Date.now(), value })
    return value
  }

  async function signedOut(reason) {
    return { ok: false, available: false, reason, fetchedAt: Date.now() }
  }

  async function compute(rangeKind, scope) {
    let session
    try {
      session = await getSession()
    } catch (error) {
      return signedOut('account-error')
    }
    if (!session || !session.token || !session.origin) return signedOut('signed-out')

    const origin = String(session.origin).replace(/\/$/, '')
    const headers = headersFor(session)
    const range = buildRange(rangeKind)
    const summary = await fetchSummary(origin, headers)

    try {
      if (range.kind !== 'all') {
        const acc = await fetchChunk(origin, headers, range.start, range.end, scope)
        return summarize(acc, range, scope, summary)
      }

      const acc = createAccumulator()
      let end = range.end
      let empty = 0
      let chunks = 0
      while (chunks < MAX_CHUNKS) {
        const start = end - CHUNK_DAYS * DAY
        const chunk = await fetchChunk(origin, headers, start, end, scope)
        mergeAccumulator(acc, chunk)
        const hasData = chunk.totals.tokens > 0 || chunk.totals.cost > 0
        empty = hasData ? 0 : empty + 1
        chunks += 1
        end = start
        if (empty >= 3) break
      }
      const allRange = { kind: 'all', start: null, end: range.end, days: null }
      return summarize(acc, allRange, scope, summary)
    } catch (error) {
      if (isAuthFailure(error)) return signedOut('auth')
      throw error
    }
  }

  async function query({ range = '30d', scope = 'dsh', force = false } = {}) {
    const rangeKind = range === 'all' || range === '7d' ? range : '30d'
    const scopeKind = scope === 'all' ? 'all' : 'dsh'
    const key = `${rangeKind}:${scopeKind}`
    if (!force) {
      const cached = cacheGet(key)
      if (cached) return cached
    }
    const value = await compute(rangeKind, scopeKind)
    // Cache only usable data: a signed-out/unavailable result must be retried
    // on the next request so signing in never waits for a stale negative.
    if (value && value.available === true) cacheSet(key, value)
    return value
  }

  return { query }
}
