/**
 * dsh-token-atlas — host half.
 *
 * Serves a read-only JSON snapshot of the durable token ledger at
 * /dsh-token-atlas/stats.json. The browser half (./client) renders it in the
 * left sidebar and in a main panel.
 */
import { createLedger } from './ledger.js'
import { createAccountUsage } from './account.js'

export const name = 'token-atlas'
export const inject = ['webServer']

const ROUTE = '/dsh-token-atlas/stats.json'
const ACCOUNT_ROUTE = '/dsh-token-atlas/account.json'
const CACHE_MS = 1000

function sendJson(res, status, body, head = false) {
  const data = Buffer.from(JSON.stringify(body))
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': data.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(head ? undefined : data)
}

function isLoopbackHost(hostHeader) {
  const raw = String(hostHeader || '').trim().toLowerCase()
  if (!raw) return false
  let hostname = raw
  if (hostname.startsWith('[')) {
    const end = hostname.indexOf(']')
    hostname = end === -1 ? hostname.slice(1) : hostname.slice(1, end)
  } else {
    hostname = hostname.split(':')[0]
  }
  return hostname === 'localhost' || hostname === '::1' || hostname === '0:0:0:0:0:0:0:1' ||
    hostname === '127.0.0.1' || hostname.startsWith('127.')
}

function isCrossSite(req) {
  const site = String(req.headers['sec-fetch-site'] || '').toLowerCase()
  if (site === 'cross-site') return true
  const origin = req.headers.origin
  if (typeof origin === 'string' && origin && origin !== 'null') {
    try {
      const originUrl = new URL(origin)
      // The desktop renderer runs on the trusted dsh-app: scheme; its fetch
      // bridge may forward that origin instead of the HTTP authority.
      if (originUrl.protocol === 'dsh-app:') return false
      const host = String(req.headers.host || '')
      if (originUrl.host.toLowerCase() !== host.toLowerCase()) return true
    } catch {
      return true
    }
  }
  return false
}

export function apply(ctx) {
  const ledger = createLedger({ logger: ctx.logger })
  const accountUsage = createAccountUsage({
    logger: ctx.logger,
    async getSession() {
      try {
        const account = typeof ctx.get === 'function' ? ctx.get('deepseekAccount') : undefined
        if (!account || typeof account.getPlatformSession !== 'function') return null
        return await account.getPlatformSession()
      } catch {
        return null
      }
    },
  })
  let cache = null
  let inflight = null

  async function snapshot(force) {
    const now = Date.now()
    if (!force && cache !== null && now - cache.at < CACHE_MS) return cache.value
    if (inflight !== null) return inflight
    inflight = ledger.refresh().then((value) => {
      cache = { at: Date.now(), value }
      return value
    }).finally(() => {
      inflight = null
    })
    return inflight
  }

  function rejected(req, res) {
    // A loopback Host is the local user's own browser (or curl on this
    // machine); the body is read-only usage data. A non-loopback Host must
    // pass the host's own connection fence.
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
    const desktopOrigin = origin.startsWith('dsh-app://')
    if (!isLoopbackHost(req.headers.host) && !desktopOrigin) {
      try {
        const connection = typeof ctx.get === 'function' ? ctx.get('connection') : undefined
        if (connection && typeof connection.requestRejection === 'function') {
          const code = connection.requestRejection(req)
          if (code !== undefined && code !== null && code !== false) {
            res.writeHead(typeof code === 'number' ? code : 403)
            res.end()
            return true
          }
        }
      } catch {
        // Fall through to the same-origin check.
      }
    }
    if (isCrossSite(req)) {
      res.writeHead(403)
      res.end()
      return true
    }
    return false
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD' })
        res.end()
        return
      }
      const head = req.method === 'HEAD'
      try {
        const url = new URL(String(req.url || ROUTE), 'http://localhost')
        const force = url.searchParams.get('force') === '1'
        const value = await snapshot(force)
        sendJson(res, 200, value, head)
      } catch (error) {
        try {
          if (ctx.logger && typeof ctx.logger.warn === 'function') {
            ctx.logger.warn('[token-atlas] snapshot failed', error)
          }
        } catch {
          // ignore logger failures
        }
        sendJson(res, 500, { ok: false, error: 'token statistics unavailable' }, head)
      }
    },
  }), `token-atlas: GET ${ROUTE}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ACCOUNT_ROUTE,
    handler: async (req, res) => {
      if (rejected(req, res)) return
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { Allow: 'GET, HEAD' })
        res.end()
        return
      }
      const head = req.method === 'HEAD'
      try {
        const url = new URL(String(req.url || ACCOUNT_ROUTE), 'http://localhost')
        const range = url.searchParams.get('range') || '30d'
        const scope = url.searchParams.get('scope') || 'dsh'
        const force = url.searchParams.get('force') === '1'
        const value = await accountUsage.query({ range, scope, force })
        sendJson(res, 200, value, head)
      } catch (error) {
        try {
          if (ctx.logger && typeof ctx.logger.warn === 'function') {
            ctx.logger.warn('[token-atlas] account usage failed', error)
          }
        } catch {
          // ignore logger failures
        }
        sendJson(res, 502, { ok: false, available: false, reason: 'error', error: 'account usage unavailable' }, head)
      }
    },
  }), `token-atlas: GET ${ACCOUNT_ROUTE}`)

  ctx.effect(() => () => ledger.dispose(), 'token-atlas: ledger persistence')
}
