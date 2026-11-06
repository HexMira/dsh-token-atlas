/**
 * Durable token ledger for the DSH host.
 *
 * Reads every session log below $DSH_HOME/sessions (v4 JSONL, optionally
 * zstd-framed), folds provider-reported usage into per-day / per-model
 * aggregates, and persists the result to $DSH_HOME/token-atlas/ledger.json.
 *
 * The ledger is deliberately additive: a session file that disappears keeps
 * its already-counted usage, so "total consumed" never goes down merely
 * because a transcript was archived or deleted.
 */
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'

export const LEDGER_VERSION = 1
const DAY_MS = 86_400_000
const BJ_OFFSET_MS = 8 * 3_600_000
const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])

/** DeepSeek CNY list prices per million tokens: [valley, peak]. */
const PRICING = {
  'deepseek-v4-pro': { hit: [0.15, 0.30], miss: [4.5, 9], out: [13.5, 27] },
  'deepseek-pro': { hit: [0.15, 0.30], miss: [4.5, 9], out: [13.5, 27] },
  'deepseek-flash': { hit: [0.02, 0.04], miss: [1, 2], out: [4, 8] },
  'deepseek-v4-flash': { hit: [0.02, 0.04], miss: [1, 2], out: [4, 8] },
  'deepseek-v4-flash-vision-exp': { hit: [0.02, 0.04], miss: [1, 2], out: [4, 8] },
}
const PRICING_KEYS = Object.keys(PRICING).sort((a, b) => b.length - a.length)
/** Default matching for any other deepseek-* model: current Flash prices. */
const DEFAULT_DEEPSEEK = PRICING['deepseek-flash']

/** Chinese statutory holidays (valley all day) for 2026. */
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-02', '2026-01-03',
  '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
  '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
  '2026-04-04', '2026-04-05', '2026-04-06',
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
  '2026-06-19', '2026-06-20', '2026-06-21',
  '2026-09-25', '2026-09-26', '2026-09-27',
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
  '2026-10-05', '2026-10-06', '2026-10-07',
])

function pad2(n) {
  return String(n).padStart(2, '0')
}

/** Beijing calendar day key (YYYY-MM-DD). */
export function dayKey(ts) {
  const d = new Date(Number(ts) + BJ_OFFSET_MS)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

function dayParts(ts) {
  const d = new Date(Number(ts) + BJ_OFFSET_MS)
  return {
    day: `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`,
    dow: d.getUTCDay(),
    hour: d.getUTCHours(),
  }
}

/** Official peak windows: Mon-Fri 09:00-12:00 and 14:00-18:00 Beijing, excluding holidays. */
export function isPeak(ts) {
  const p = dayParts(ts)
  if (p.dow === 0 || p.dow === 6) return false
  if (HOLIDAYS.has(p.day)) return false
  return (p.hour >= 9 && p.hour < 12) || (p.hour >= 14 && p.hour < 18)
}

export function priceFor(model) {
  const name = String(model || '').toLowerCase()
  for (const key of PRICING_KEYS) {
    if (name.includes(key)) return PRICING[key]
  }
  if (name.includes('deepseek')) return DEFAULT_DEEPSEEK
  return null
}

/** Estimated CNY cost of one usage bucket, or null when the model has no list price. */
export function costOf(model, inp, out, cacheRead, cacheWrite, peak) {
  const price = priceFor(model)
  if (price === null) return null
  const i = peak ? 1 : 0
  return (
    (Number(inp) || 0) * price.miss[i] +
    (Number(cacheRead) || 0) * price.hit[i] +
    (Number(cacheWrite) || 0) * price.miss[i] +
    (Number(out) || 0) * price.out[i]
  ) / 1e6
}

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function round6(n) {
  return Math.round((Number(n) || 0) * 1e6) / 1e6
}

function zeroBucket() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, events: 0 }
}

function zeroTotal() {
  return {
    tokens: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
    cost: 0, costInput: 0, costOutput: 0, costCacheRead: 0, costCacheWrite: 0,
    unpricedTokens: 0, events: 0,
  }
}

function addBucket(target, b) {
  target.input += b.input
  target.output += b.output
  target.cacheRead += b.cacheRead
  target.cacheWrite += b.cacheWrite
  target.events += b.events
}

function bucketTokens(b) {
  return b.input + b.output + b.cacheRead + b.cacheWrite
}

/** Expand a concatenation of zstd frames (one appended batch per frame). */
function decompressZstd(buf) {
  if (typeof zlib.zstdDecompressSync !== 'function') {
    throw new Error('this Node runtime has no zstd support')
  }
  const starts = []
  let at = buf.indexOf(ZSTD_MAGIC)
  while (at !== -1) {
    starts.push(at)
    at = buf.indexOf(ZSTD_MAGIC, at + 1)
  }
  if (starts.length === 0) return buf.toString('utf8')
  const parts = []
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i]
    const end = i + 1 < starts.length ? starts[i + 1] : buf.length
    try {
      parts.push(zlib.zstdDecompressSync(buf.subarray(start, end)))
    } catch {
      // A partially flushed tail frame is normal while a session is live.
    }
  }
  return Buffer.concat(parts).toString('utf8')
}

function readSessionText(file) {
  const buf = fs.readFileSync(file)
  if (file.endsWith('.zstd')) return decompressZstd(buf)
  return buf.toString('utf8')
}

async function listSessionFiles(sessionsDir) {
  const out = []
  let workspaces
  try {
    workspaces = await fsp.readdir(sessionsDir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const ws of workspaces) {
    if (!ws.isDirectory() || ws.name.startsWith('.')) continue
    const wsDir = path.join(sessionsDir, ws.name)
    let sessions
    try {
      sessions = await fsp.readdir(wsDir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const sess of sessions) {
      if (!sess.isDirectory() || sess.name.startsWith('.')) continue
      const sessDir = path.join(wsDir, sess.name)
      let files
      try {
        files = await fsp.readdir(sessDir, { withFileTypes: true })
      } catch {
        continue
      }
      for (const file of files) {
        if (!file.isFile()) continue
        if (!file.name.includes('.jsonl')) continue
        out.push({
          file: path.join(sessDir, file.name),
          rel: path.relative(sessionsDir, path.join(sessDir, file.name)),
          workspace: ws.name,
          sessionId: sess.name,
        })
      }
    }
  }
  return out
}

/**
 * Parse one session transcript into a compact per-day/per-model aggregate.
 * Returns null when the file contains no usage at all.
 */
function parseSession({ file, rel, workspace, sessionId }, mtimeMs, size) {
  const text = readSessionText(file)
  const stats = {}
  let createdAt = null
  let cwd = null
  let title = null
  let firstAt = null
  let lastAt = null
  let events = 0

  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let event
    try {
      event = JSON.parse(line)
    } catch {
      continue
    }
    if (!event || typeof event !== 'object') continue
    if (event.type === 'session') {
      const at = Number(event.createdAt ?? event.data?.createdAt)
      if (Number.isFinite(at) && at > 0) createdAt = at
      if (typeof (event.cwd ?? event.data?.cwd) === 'string') cwd = event.cwd ?? event.data?.cwd
      continue
    }
    if (event.type === 'session/title') {
      const next = event.data?.title
      if (typeof next === 'string' && next.trim()) title = next.trim()
      continue
    }

    const usage = event.data?.usage ?? event.data?.message?.usage
    if (!usage || typeof usage !== 'object') continue
    const ts = Number(event.time)
    if (!Number.isFinite(ts) || ts <= 0) continue

    const source = event.data?.message?.source ?? event.data?.source
    const model = String(source?.model ?? event.data?.model ?? 'unknown')
    const provider = String(source?.provider ?? event.data?.provider ?? '')
    let input = num(usage.inputTokens ?? usage.promptTokens)
    const output = num(usage.outputTokens ?? usage.completionTokens)
    const cacheRead = num(usage.cacheReadTokens ?? usage.prompt_cache_hit_tokens ?? usage.cachedTokens)
    const cacheWrite = num(usage.cacheWriteTokens ?? usage.prompt_cache_miss_tokens ?? usage.cacheCreationInputTokens)
    const reportedTotal = num(usage.totalTokens)
    if (input === 0 && reportedTotal > 0) {
      input = Math.max(0, reportedTotal - output - cacheRead - cacheWrite)
    }
    if (input + output + cacheRead + cacheWrite === 0) continue

    const day = dayKey(ts)
    const peak = isPeak(ts) ? 'peak' : 'off'
    const modelKey = `${provider}\u0000${model}`
    const dayStats = stats[day] ?? (stats[day] = {})
    const modelStats = dayStats[modelKey] ?? (dayStats[modelKey] = {
      provider,
      model,
      peak: zeroBucket(),
      off: zeroBucket(),
    })
    const bucket = modelStats[peak]
    bucket.input += input
    bucket.output += output
    bucket.cacheRead += cacheRead
    bucket.cacheWrite += cacheWrite
    bucket.events += 1

    events += 1
    if (firstAt === null || ts < firstAt) firstAt = ts
    if (lastAt === null || ts > lastAt) lastAt = ts
  }

  return {
    rel,
    file,
    workspace,
    sessionId,
    title,
    cwd,
    createdAt,
    firstAt,
    lastAt,
    events,
    mtimeMs,
    size,
    scannedAt: Date.now(),
    missing: false,
    stats,
  }
}

function loadLedgerSync(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (parsed && parsed.version === LEDGER_VERSION && parsed.sessions && typeof parsed.sessions === 'object') {
      return { version: LEDGER_VERSION, sessions: parsed.sessions, updatedAt: Number(parsed.updatedAt) || 0 }
    }
  } catch {
    // Missing or malformed ledger: start fresh. Session logs are the source of truth.
  }
  return { version: LEDGER_VERSION, sessions: {}, updatedAt: 0 }
}

function writeLedgerSync(file, ledger) {
  const dir = path.dirname(file)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`
  fs.writeFileSync(tmp, JSON.stringify(ledger))
  fs.renameSync(tmp, file)
}

/**
 * Create one ledger instance. `refresh()` scans changed session files and
 * returns a UI-ready summary; `dispose()` flushes the ledger.
 */
export function createLedger({ home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), logger = console } = {}) {
  const sessionsDir = path.join(home, 'sessions')
  const ledgerDir = path.join(home, 'token-atlas')
  const ledgerPath = path.join(ledgerDir, 'ledger.json')
  const ledger = loadLedgerSync(ledgerPath)
  let saveTimer = null
  let dirty = false
  let refreshing = null
  let disposed = false

  function logWarn(message, error) {
    try {
      if (logger && typeof logger.warn === 'function') logger.warn(`[token-atlas] ${message}`, error)
      else if (logger && typeof logger.log === 'function') logger.log(`[token-atlas] ${message}`, error)
    } catch {
      // logging must never break statistics
    }
  }

  function scheduleSave() {
    dirty = true
    if (saveTimer !== null) return
    saveTimer = setTimeout(() => {
      saveTimer = null
      flush()
    }, 1500)
    if (typeof saveTimer.unref === 'function') saveTimer.unref()
  }

  function flush() {
    if (!dirty) return
    try {
      ledger.updatedAt = Date.now()
      writeLedgerSync(ledgerPath, ledger)
      dirty = false
    } catch (error) {
      logWarn('failed to persist ledger', error)
    }
  }

  function collectSummary() {
    const totals = zeroTotal()
    const dayMap = new Map()
    const modelMap = new Map()
    const sessionRows = []
    let firstAt = null
    let lastAt = null
    let activeFiles = 0

    const dayRec = (day) => {
      let rec = dayMap.get(day)
      if (!rec) {
        rec = { day, ...zeroTotal() }
        dayMap.set(day, rec)
      }
      return rec
    }

    const modelRec = (key, model, provider) => {
      let rec = modelMap.get(key)
      if (!rec) {
        rec = { key, model, provider, ...zeroTotal() }
        modelMap.set(key, rec)
      }
      return rec
    }

    for (const entry of Object.values(ledger.sessions)) {
      if (!entry || typeof entry !== 'object') continue
      if (!entry.missing) activeFiles += 1
      const sTotal = zeroTotal()
      const sModels = new Map()
      for (const [day, models] of Object.entries(entry.stats || {})) {
        for (const [key, modelStats] of Object.entries(models || {})) {
          for (const peakName of ['peak', 'off']) {
            const bucket = modelStats?.[peakName]
            if (!bucket) continue
            const sum = bucketTokens(bucket)
            if (sum === 0) continue
            const peak = peakName === 'peak'
            const cost = costOf(modelStats.model, bucket.input, bucket.output, bucket.cacheRead, bucket.cacheWrite, peak)
            const d = dayRec(day)
            const m = modelRec(key, modelStats.model, modelStats.provider)
            let ms = sModels.get(key)
            if (!ms) {
              ms = { model: modelStats.model, provider: modelStats.provider, tokens: 0 }
              sModels.set(key, ms)
            }

            for (const target of [totals, d, m, sTotal]) {
              target.input += bucket.input
              target.output += bucket.output
              target.cacheRead += bucket.cacheRead
              target.cacheWrite += bucket.cacheWrite
              target.events += bucket.events
              target.tokens += sum
              if (cost === null) target.unpricedTokens += sum
              else {
                target.cost += cost
                target.costInput += (bucket.input * (priceFor(modelStats.model)?.miss[peak ? 1 : 0] ?? 0)) / 1e6
                target.costCacheRead += (bucket.cacheRead * (priceFor(modelStats.model)?.hit[peak ? 1 : 0] ?? 0)) / 1e6
                target.costCacheWrite += (bucket.cacheWrite * (priceFor(modelStats.model)?.miss[peak ? 1 : 0] ?? 0)) / 1e6
                target.costOutput += (bucket.output * (priceFor(modelStats.model)?.out[peak ? 1 : 0] ?? 0)) / 1e6
              }
            }
            ms.tokens += sum
          }
        }
      }
      sTotal.cost = round6(sTotal.cost)
      sTotal.costInput = round6(sTotal.costInput)
      sTotal.costCacheRead = round6(sTotal.costCacheRead)
      sTotal.costCacheWrite = round6(sTotal.costCacheWrite)
      sTotal.costOutput = round6(sTotal.costOutput)
      if (entry.firstAt != null && (firstAt === null || entry.firstAt < firstAt)) firstAt = entry.firstAt
      if (entry.lastAt != null && (lastAt === null || entry.lastAt > lastAt)) lastAt = entry.lastAt
      if (entry.events > 0) {
        sessionRows.push({
          id: entry.sessionId,
          workspace: entry.workspace,
          title: entry.title || null,
          cwd: entry.cwd || null,
          createdAt: entry.createdAt,
          firstAt: entry.firstAt,
          lastAt: entry.lastAt,
          tokens: sTotal.tokens,
          cost: sTotal.cost,
          events: sTotal.events,
          missing: !!entry.missing,
          models: [...sModels.values()].sort((a, b) => b.tokens - a.tokens).slice(0, 3),
        })
      }
    }

    const roundTotal = (rec) => {
      rec.cost = round6(rec.cost)
      rec.costInput = round6(rec.costInput)
      rec.costCacheRead = round6(rec.costCacheRead)
      rec.costCacheWrite = round6(rec.costCacheWrite)
      rec.costOutput = round6(rec.costOutput)
      return rec
    }
    roundTotal(totals)
    for (const rec of dayMap.values()) roundTotal(rec)
    for (const rec of modelMap.values()) roundTotal(rec)

    const today = dayKey(Date.now())
    const monthPrefix = today.slice(0, 7)
    const month = { month: monthPrefix, ...zeroTotal() }
    for (const rec of dayMap.values()) {
      if (!rec.day.startsWith(monthPrefix)) continue
      for (const key of ['tokens', 'input', 'output', 'cacheRead', 'cacheWrite', 'cost', 'costInput', 'costCacheRead', 'costCacheWrite', 'costOutput', 'unpricedTokens', 'events']) {
        month[key] += rec[key] || 0
      }
    }
    roundTotal(month)

    const days = [...dayMap.values()].sort((a, b) => (a.day < b.day ? -1 : 1))
    const models = [...modelMap.values()].sort((a, b) => b.tokens - a.tokens)
    const last7 = []
    for (let i = 6; i >= 0; i -= 1) {
      const day = dayKey(Date.now() - i * DAY_MS)
      const rec = dayMap.get(day) || { day, ...zeroTotal() }
      last7.push(rec)
    }
    const last14 = []
    for (let i = 13; i >= 0; i -= 1) {
      const day = dayKey(Date.now() - i * DAY_MS)
      const rec = dayMap.get(day) || { day, ...zeroTotal() }
      last14.push(rec)
    }

    const sessions = sessionRows
      .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0))
      .slice(0, 20)

    return {
      ok: true,
      version: LEDGER_VERSION,
      generatedAt: Date.now(),
      currency: 'CNY',
      totals: {
        ...totals,
        sessions: sessionRows.length,
        activeSessions: activeFiles,
      },
      today: dayMap.get(today) || { day: today, ...zeroTotal() },
      month,
      days,
      last7,
      last14,
      models,
      sessions,
      firstAt,
      lastAt,
      backfill: {
        files: Object.keys(ledger.sessions).length,
        activeFiles,
        firstAt,
        lastAt,
        scannedAt: Date.now(),
        ledger: ledgerPath,
      },
    }
  }

  async function refresh() {
    if (refreshing) return refreshing
    refreshing = (async () => {
      const files = await listSessionFiles(sessionsDir)
      const seen = new Set()
      for (const item of files) {
        seen.add(item.rel)
        let before
        try {
          before = await fsp.stat(item.file)
        } catch {
          continue
        }
        const previous = ledger.sessions[item.rel]
        if (
          previous &&
          !previous.missing &&
          previous.mtimeMs === before.mtimeMs &&
          previous.size === before.size
        ) {
          continue
        }
        try {
          const entry = parseSession(item, before.mtimeMs, before.size)
          ledger.sessions[item.rel] = entry
          scheduleSave()
        } catch (error) {
          // Keep the previous aggregate (if any); retry on the next poll.
          if (!previous) logWarn(`failed to read ${item.rel}`, error)
        }
      }
      for (const [rel, entry] of Object.entries(ledger.sessions)) {
        if (seen.has(rel)) continue
        if (entry && !entry.missing) {
          entry.missing = true
          scheduleSave()
        }
      }
      return collectSummary()
    })().finally(() => {
      refreshing = null
    })
    return refreshing
  }

  function dispose() {
    if (disposed) return
    disposed = true
    if (saveTimer !== null) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    flush()
  }

  return {
    refresh,
    dispose,
    flush,
    get ledgerPath() {
      return ledgerPath
    },
    get sessionsDir() {
      return sessionsDir
    },
  }
}
