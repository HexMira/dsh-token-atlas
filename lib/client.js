/* dsh-token-atlas — browser half. Hand-written module-loader bundle (no build step). */
window.__ModuleLoader__.load({
  id: 'dsh-token-atlas',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const NS = 'tokenStats'
    const PANEL_ID = 'token-atlas'

    const zh = {
      'panel.title': 'Token 统计',
      'panel.subtitle': '本机全部会话的 token 用量与费用估算',
      'panel.refresh': '刷新',
      'panel.updated': '更新于',
      'panel.loading': '正在统计…',
      'panel.error': '统计暂不可用',
      'panel.retry': '重试',
      'panel.stale': '刷新失败，显示上次结果',
      'panel.empty': '还没有可统计的用量。',
      'total.tokens': '累计 Token',
      'total.cost': '估算消费',
      'total.sessions': '个会话',
      'total.events': '次模型调用',
      'cost.note': '按 DeepSeek 官方 CNY 峰谷价估算',
      'pricing.badge': '官方价目表',
      'today.title': '今日',
      'month.title': '本月',
      'sessions.title': '会话与调用',
      'sessions.active': '活跃',
      'sessions.files': '个会话文件',
      'coverage': '覆盖自',
      'breakdown.title': 'Token 构成',
      'breakdown.input': '输入（未缓存）',
      'breakdown.cacheRead': '缓存读取',
      'breakdown.cacheWrite': '缓存写入',
      'breakdown.output': '输出',
      'models.title': '模型分布',
      'chart.title': '最近 14 天',
      'chart.tokens': 'Token',
      'chart.cost': '费用',
      'sessions.recent': '最近会话',
      'sessions.untitled': '未命名会话',
      'sessions.tokens': 'Token',
      'sessions.cost': '费用',
      'note': '数据来自本机会话日志，已回溯历史会话；金额按 DeepSeek 官方 CNY 峰谷价估算。',
      'note.unpriced': '含未计价模型 {tokens} tokens，未计入金额。',
      'note.backfill': '已回溯 {files} 个会话文件。',
      'mini.kicker': 'Token 累计',
      'mini.aria': '打开 Token 统计',
      'models.unpriced': '未计价',
      'sessions.missing': '已归档',
      'chart.noData': '暂无每日数据',
      'mode.account': '账户总量',
      'mode.local': '本机会话',
      'range.7d': '近7天',
      'range.30d': '近30天',
      'range.all': '全部',
      'scope.dsh': '仅 DSH',
      'scope.all': '全部 API Key',
      'account.kicker': '账户 Token',
      'account.subtitle': 'DeepSeek 官方账户口径，含同一账号下所有设备',
      'account.tokens': '账户 Token 总量',
      'account.cost': '官方实际消费',
      'account.costNote': 'DeepSeek Platform 账单口径',
      'account.requests': '次请求',
      'account.rangeCost': '区间消费',
      'account.requestsCard': '请求数',
      'account.keys': 'API Key 分布',
      'account.keysHint': '按账号下的 API Key 汇总',
      'account.cumulative': '账户累计消费（全部 Key）',
      'account.functions': '工具费',
      'account.note': '账户总量来自 DeepSeek Platform 官方用量接口，包含同一账号下所有设备与 API Key；本机视图只统计当前设备的会话日志。',
      'account.localNote': '本机视图只统计当前设备；账户总量见「账户总量」标签。',
      'account.unavailable': '无法读取账户总量',
      'account.signedOut': '请先在 设置 → 账号与余额 登录 DeepSeek 账号。',
      'account.auth': '账号登录已失效，请重新登录。',
      'account.error': '账户用量接口暂不可用。',
      'account.switchLocal': '查看本机会话',
      'account.todayCost': '今日消费',
      'account.days': '{n} 天',
      'account.models': '个模型',
      'account.keysCount': '个 Key',
      'account.source': '官方账户口径',
      'account.loading': '正在读取账户总量…',
      'account.delay': '账户用量为官方采集，可能有几分钟延迟；点「刷新」可重新读取。',
      'local.badge': '本机日志',
      'local.hint': '不含其他设备',
    }

    const en = {
      'panel.title': 'Token usage',
      'panel.subtitle': 'Token counts and estimated cost for every session on this machine',
      'panel.refresh': 'Refresh',
      'panel.updated': 'Updated',
      'panel.loading': 'Measuring…',
      'panel.error': 'Statistics unavailable',
      'panel.retry': 'Retry',
      'panel.stale': 'Refresh failed — showing the last result',
      'panel.empty': 'No usage recorded yet.',
      'total.tokens': 'Total tokens',
      'total.cost': 'Estimated cost',
      'total.sessions': 'sessions',
      'total.events': 'model calls',
      'cost.note': 'Estimated from official DeepSeek CNY peak/off-peak prices',
      'pricing.badge': 'Official price list',
      'today.title': 'Today',
      'month.title': 'This month',
      'sessions.title': 'Sessions & calls',
      'sessions.active': 'active',
      'sessions.files': 'session files',
      'coverage': 'Since',
      'breakdown.title': 'Token breakdown',
      'breakdown.input': 'Input (uncached)',
      'breakdown.cacheRead': 'Cache read',
      'breakdown.cacheWrite': 'Cache write',
      'breakdown.output': 'Output',
      'models.title': 'Models',
      'chart.title': 'Last 14 days',
      'chart.tokens': 'Tokens',
      'chart.cost': 'Cost',
      'sessions.recent': 'Recent sessions',
      'sessions.untitled': 'Untitled session',
      'sessions.tokens': 'Tokens',
      'sessions.cost': 'Cost',
      'note': 'Built from local session logs, including historical sessions. Cost is estimated from official DeepSeek CNY peak/off-peak prices.',
      'note.unpriced': '{tokens} tokens from unpriced models are excluded from cost.',
      'note.backfill': 'Backfilled from {files} session files.',
      'mini.kicker': 'Tokens',
      'mini.aria': 'Open token usage',
      'models.unpriced': 'unpriced',
      'sessions.missing': 'archived',
      'chart.noData': 'No daily data yet',
      'mode.account': 'Account total',
      'mode.local': 'This device',
      'range.7d': '7 days',
      'range.30d': '30 days',
      'range.all': 'All time',
      'scope.dsh': 'DSH only',
      'scope.all': 'All API keys',
      'account.kicker': 'Account tokens',
      'account.subtitle': 'Official DeepSeek account usage across every device',
      'account.tokens': 'Account tokens',
      'account.cost': 'Actual spend',
      'account.costNote': 'DeepSeek Platform billing',
      'account.requests': 'requests',
      'account.rangeCost': 'Range spend',
      'account.requestsCard': 'Requests',
      'account.keys': 'API keys',
      'account.keysHint': 'Grouped by API key on this account',
      'account.cumulative': 'All-time spend (all keys)',
      'account.functions': 'Tool fees',
      'account.note': 'Account totals come from the official DeepSeek Platform usage API and include every device and API key on this account. This-device totals only read local session logs.',
      'account.localNote': 'This-device view only counts the current machine; account totals are on the Account total tab.',
      'account.unavailable': 'Account totals unavailable',
      'account.signedOut': 'Sign in to DeepSeek under Settings → Account & balance first.',
      'account.auth': 'The account sign-in expired. Please sign in again.',
      'account.error': 'The account usage API is unavailable right now.',
      'account.switchLocal': 'View this device',
      'account.todayCost': 'Today spend',
      'account.days': '{n} days',
      'account.models': 'models',
      'account.keysCount': 'keys',
      'account.source': 'Official account',
      'account.loading': 'Reading account totals…',
      'account.delay': 'Account usage is collected by Platform and may lag a few minutes; press Refresh to re-read.',
      'local.badge': 'This device',
      'local.hint': 'other devices excluded',
    }

    const CSS = `
.dts-root {
  width: 100%;
  max-width: 960px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  --dts-ink: var(--dsw-alias-label-primary, light-dark(#0f1115, #f9fafb));
  --dts-muted: var(--dsw-alias-label-secondary, light-dark(#61666b, #cfd3d6));
  --dts-tertiary: var(--dsw-alias-label-tertiary, light-dark(#81858c, #adb2b8));
  --dts-card: var(--dsw-alias-bg-module-platform, light-dark(#f8f9fa, #303136));
  --dts-card-strong: var(--dsw-alias-bg-module-platform, light-dark(#ffffff, #353638));
  --dts-border: var(--dsw-alias-border-l2, light-dark(rgba(0,0,0,.10), rgba(255,255,255,.12)));
  --dts-hover: var(--dsw-alias-interactive-bg-hover, light-dark(rgba(38,49,72,.06), rgba(255,255,255,.08)));
  --dts-blue: light-dark(#4d6bfe, #8ea1ff);
  --dts-blue-soft: color-mix(in srgb, var(--dts-blue) 13%, transparent);
  --dts-green: light-dark(#18a058, #5bd39a);
  --dts-orange: light-dark(#d97706, #f4b25e);
  --dts-violet: light-dark(#7c3aed, #b18cff);
  color: var(--dts-ink);
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  padding: 28px 32px 72px;
  margin: 0 auto;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
.dts-root *, .dts-mini * { box-sizing: border-box; }
.dts-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.dts-title { margin: 0; font-size: 26px; line-height: 32px; font-weight: 650; letter-spacing: -.02em; }
.dts-subtitle { margin: 7px 0 0; color: var(--dts-muted); font-size: 13px; line-height: 20px; }
.dts-actions { display: flex; align-items: center; gap: 10px; flex: none; padding-top: 3px; }
.dts-updated { color: var(--dts-tertiary); font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; }
.dts-button {
  appearance: none; border: 1px solid var(--dts-border); background: var(--dts-card-strong);
  color: var(--dts-ink); border-radius: 9px; height: 32px; padding: 0 12px;
  font: inherit; font-size: 12px; line-height: 30px; cursor: pointer;
}
.dts-button:hover { background: var(--dts-hover); }
.dts-button:disabled { opacity: .55; cursor: default; }
.dts-chip {
  display: inline-flex; align-items: center; gap: 6px; min-height: 22px; padding: 2px 9px;
  border-radius: 999px; background: var(--dts-blue-soft); color: var(--dts-blue);
  font-size: 11px; line-height: 16px; font-weight: 600; white-space: nowrap;
}
.dts-chip.is-warn { background: color-mix(in srgb, var(--dts-orange) 14%, transparent); color: var(--dts-orange); }
.dts-chip.is-ok { background: color-mix(in srgb, var(--dts-green) 13%, transparent); color: var(--dts-green); }
.dts-actions { flex-wrap: wrap; justify-content: flex-end; }
.dts-actions-center { justify-content: center; }
.dts-seg {
  display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: 10px;
  background: color-mix(in srgb, var(--dts-ink) 6%, transparent); border: 1px solid var(--dts-border);
}
.dts-seg button {
  appearance: none; border: 0; background: transparent; color: var(--dts-muted);
  font: inherit; font-size: 11px; line-height: 16px; padding: 4px 9px; border-radius: 8px;
  cursor: pointer; white-space: nowrap;
}
.dts-seg button:hover { color: var(--dts-ink); background: var(--dts-hover); }
.dts-seg button.is-active {
  color: var(--dts-ink); background: var(--dts-card-strong);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--dts-ink) 10%, transparent);
}
.dts-seg-small button { font-size: 10px; line-height: 15px; padding: 3px 8px; }
.dts-mode { flex: none; }
.dts-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: -2px 0 16px; min-height: 30px; }
.dts-toolbar-note { color: var(--dts-tertiary); font-size: 11px; line-height: 16px; white-space: nowrap; }
.dts-toolbar-spacer { flex: 1 1 8px; }
.dts-break-row.is-no-cost { grid-template-columns: 150px minmax(0, 1fr) 92px; }
.dts-keys { display: flex; flex-direction: column; }
.dts-key-row {
  display: grid; grid-template-columns: minmax(0, 1fr) 108px 92px 82px; gap: 12px;
  align-items: center; padding: 10px 0; border-top: 1px solid var(--dts-border);
}
.dts-key-row:first-child { border-top: 0; padding-top: 0; }
.dts-key-row:last-child { padding-bottom: 0; }
.dts-key-main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.dts-key-name { font-size: 12px; line-height: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-key-type { color: var(--dts-tertiary); font-size: 10px; line-height: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-key-requests, .dts-key-tokens { color: var(--dts-muted); font-size: 11px; line-height: 15px; text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-key-cost { font-size: 11px; line-height: 15px; text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-unavailable {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 10px; padding: 48px 24px; margin-top: 16px;
}
.dts-unavailable-icon {
  display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%;
  background: var(--dts-blue-soft); color: var(--dts-blue);
}
.dts-unavailable .dts-subtitle { margin: 0; max-width: 520px; }
.dts-hero { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 14px; margin-bottom: 14px; }
.dts-hero-card {
  position: relative; overflow: hidden; min-height: 178px; padding: 22px 24px;
  border: 1px solid var(--dts-border); border-radius: 16px; background: var(--dts-card-strong);
  display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
}
.dts-hero-card.is-main {
  background:
    radial-gradient(120% 160% at 100% 0%, color-mix(in srgb, var(--dts-blue) 16%, transparent), transparent 58%),
    var(--dts-card-strong);
}
.dts-hero-card.is-cost {
  background:
    radial-gradient(120% 160% at 0% 100%, color-mix(in srgb, var(--dts-green) 12%, transparent), transparent 60%),
    var(--dts-card-strong);
}
.dts-eyebrow { display: block; color: var(--dts-muted); font-size: 12px; line-height: 18px; font-weight: 550; letter-spacing: .02em; }
.dts-hero-number { display: block; margin-top: 2px; font-size: clamp(34px, 4.2vw, 46px); line-height: 1.04; font-weight: 680; letter-spacing: -.045em; font-variant-numeric: tabular-nums; }
.dts-hero-number.is-cost { color: var(--dts-green); }
.dts-hero-sub { display: block; margin-top: 7px; color: var(--dts-muted); font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; }
.dts-hero-foot { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--dts-tertiary); font-size: 11px; line-height: 16px; }
.dts-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 14px; }
.dts-card { border: 1px solid var(--dts-border); border-radius: 16px; background: var(--dts-card-strong); padding: 18px 20px; }
.dts-stat { display: flex; flex-direction: column; gap: 3px; min-height: 104px; justify-content: space-between; }
.dts-stat-label { color: var(--dts-muted); font-size: 12px; line-height: 18px; font-weight: 550; }
.dts-stat-value { font-size: 25px; line-height: 30px; font-weight: 650; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.dts-stat-value.is-small { font-size: 18px; line-height: 24px; letter-spacing: -.02em; }
.dts-stat-sub { color: var(--dts-tertiary); font-size: 11px; line-height: 16px; font-variant-numeric: tabular-nums; }
.dts-section { margin-bottom: 14px; }
.dts-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.dts-section-title { margin: 0; font-size: 15px; line-height: 22px; font-weight: 650; letter-spacing: -.01em; }
.dts-section-hint { color: var(--dts-tertiary); font-size: 11px; line-height: 16px; }
.dts-breakdown { display: flex; flex-direction: column; gap: 14px; }
.dts-break-row { display: grid; grid-template-columns: 150px minmax(0, 1fr) 92px 88px; align-items: center; gap: 12px; }
.dts-break-label { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--dts-muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-dot { display: inline-block; flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dts-blue); }
.dts-track { display: block; height: 8px; border-radius: 999px; background: color-mix(in srgb, var(--dts-ink) 8%, transparent); overflow: hidden; }
.dts-fill { display: block; height: 100%; border-radius: inherit; background: var(--dts-blue); }
.dts-break-value { text-align: right; font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-break-cost { text-align: right; color: var(--dts-tertiary); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-chart-scroll { overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; padding-bottom: 2px; }
.dts-chart { display: grid; grid-template-columns: repeat(14, minmax(0, 1fr)); gap: 0; height: 190px; align-items: end; padding: 4px 0 0; }
.dts-bar-col { display: flex; flex-direction: column; align-items: stretch; justify-content: flex-end; height: 100%; min-width: 0; padding: 0 1.5px; }
.dts-bar-track { flex: 1; display: flex; align-items: flex-end; border-radius: 6px 6px 3px 3px; background: color-mix(in srgb, var(--dts-ink) 5%, transparent); overflow: hidden; }
.dts-bar-fill { width: 100%; border-radius: 6px 6px 3px 3px; background: linear-gradient(180deg, color-mix(in srgb, var(--dts-blue) 86%, white), var(--dts-blue)); }
.dts-axis { position: relative; height: 18px; margin-top: 6px; }
.dts-axis-label { position: absolute; top: 0; color: var(--dts-tertiary); font-size: 10px; line-height: 14px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-models { display: flex; flex-direction: column; gap: 14px; }
.dts-model { display: flex; flex-direction: column; gap: 7px; }
.dts-model-head { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.dts-model-name { font-weight: 600; font-size: 12px; line-height: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-model-provider { color: var(--dts-tertiary); font-size: 10px; line-height: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-model-spacer { flex: 1; }
.dts-model-tokens { color: var(--dts-muted); font-size: 11px; line-height: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-model-cost { min-width: 66px; text-align: right; font-size: 11px; line-height: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.dts-model .dts-track { height: 6px; }
.dts-sessions { display: flex; flex-direction: column; }
.dts-session { display: grid; grid-template-columns: minmax(0, 1fr) 108px 86px 76px; align-items: center; gap: 14px; padding: 10px 0; border-top: 1px solid var(--dts-border); }
.dts-session:first-child { border-top: 0; padding-top: 0; }
.dts-session:last-child { padding-bottom: 0; }
.dts-session-main { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.dts-session-title { font-size: 12px; line-height: 17px; font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-session-sub { color: var(--dts-tertiary); font-size: 10px; line-height: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-session-date { color: var(--dts-muted); font-size: 11px; line-height: 15px; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.dts-session-tokens { color: var(--dts-muted); font-size: 11px; line-height: 15px; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.dts-session-cost { font-size: 11px; line-height: 15px; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.dts-note { color: var(--dts-tertiary); font-size: 11px; line-height: 17px; margin: 18px 0 0; }
.dts-note p { margin: 0 0 4px; }
.dts-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 56vh; text-align: center; }
.dts-spinner { width: 26px; height: 26px; border-radius: 50%; border: 2px solid color-mix(in srgb, var(--dts-ink) 12%, transparent); border-top-color: var(--dts-blue); animation: dts-spin .8s linear infinite; }
.dts-error { color: var(--dts-muted); font-size: 12px; line-height: 18px; max-width: 520px; }
@keyframes dts-spin { to { transform: rotate(360deg); } }
.dts-mini {
  all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px;
  width: 100%; min-height: 40px; padding: 5px 6px; border-radius: 10px; cursor: pointer;
  color: var(--dsw-alias-label-primary, light-dark(#0f1115, #f9fafb));
  font-family: inherit; -webkit-app-region: no-drag;
}
.dts-mini:hover { background: var(--dsw-alias-interactive-bg-hover, light-dark(rgba(38,49,72,.06), rgba(255,255,255,.08))); }
.dts-mini:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, light-dark(#0f1115, #f9fafb)); outline-offset: 1px; }
.dts-mini.is-rail { width: 36px; height: 36px; min-height: 36px; padding: 0; margin: 0 auto; justify-content: center; }
.dts-mini-icon {
  flex: none; display: grid; place-items: center; width: 27px; height: 27px; border-radius: 8px;
  background: color-mix(in srgb, #4d6bfe 13%, transparent); color: light-dark(#4d6bfe, #8ea1ff);
}
.dts-mini-body { min-width: 0; display: flex; flex-direction: column; gap: 1px; text-align: left; }
.dts-mini-kicker { color: var(--dsw-alias-label-tertiary, light-dark(#81858c, #adb2b8)); font-size: 10px; line-height: 13px; letter-spacing: .02em; }
.dts-mini-value { color: inherit; font-size: 12px; line-height: 16px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dts-glyph { display: block; }
@media (max-width: 820px) {
  .dts-root { padding: 22px 18px 56px; }
  .dts-hero { grid-template-columns: 1fr; }
  .dts-grid { grid-template-columns: 1fr; }
  .dts-break-row { grid-template-columns: 120px minmax(0, 1fr) 80px; }
  .dts-break-row.is-no-cost { grid-template-columns: 120px minmax(0, 1fr); }
  .dts-break-cost { display: none; }
  .dts-key-row { grid-template-columns: minmax(0, 1fr) 88px 72px; }
  .dts-key-requests { display: none; }
  .dts-session { grid-template-columns: minmax(0, 1fr) 84px 70px; }
  .dts-session-cost { display: none; }
  .dts-head { flex-direction: column; gap: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .dts-spinner { animation-duration: 2.4s; }
}
`

    function pad2(n) {
      return String(n).padStart(2, '0')
    }
    function bjDay(ts) {
      const d = new Date(Number(ts) + 8 * 3600 * 1000)
      return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
    }
    function formatDay(day) {
      return typeof day === 'string' ? day.slice(5) : ''
    }
    function formatAxisDay(day) {
      return typeof day === 'string' ? day.slice(5).replace('-', '/') : ''
    }
    function formatTokens(n) {
      const v = Number(n) || 0
      if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
      if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
      if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
      return String(Math.round(v))
    }
    function formatInt(n) {
      return (Number(n) || 0).toLocaleString('en-US')
    }
    function formatMoney(n) {
      const v = Number(n) || 0
      if (v > 0 && v < 0.005) return '<¥0.01'
      return `¥${v.toFixed(2)}`
    }
    function formatTime(ts) {
      if (!Number.isFinite(Number(ts)) || Number(ts) <= 0) return '—'
      const d = new Date(Number(ts) + 8 * 3600 * 1000)
      return `${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`
    }
    function formatClock(ts) {
      if (!Number.isFinite(Number(ts)) || Number(ts) <= 0) return ''
      const d = new Date(Number(ts) + 8 * 3600 * 1000)
      return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`
    }
    function pct(part, total) {
      const p = Number(part) || 0
      const t = Number(total) || 0
      return t > 0 ? Math.max(0, Math.min(100, (p / t) * 100)) : 0
    }
    function truncate(text, max) {
      const s = String(text || '')
      return s.length > max ? `${s.slice(0, max - 1)}…` : s
    }
    function workspaceName(cwd) {
      if (typeof cwd !== 'string' || !cwd) return ''
      const parts = cwd.replace(/[/\\]+$/, '').split(/[/\\]/)
      return parts[parts.length - 1] || cwd
    }

    function createStatsStore() {
      let state = { status: 'loading', data: null, error: null, updatedAt: 0 }
      const listeners = new Set()
      let timer = null
      let inflight = null
      const emit = (next) => {
        state = next
        for (const listener of listeners) {
          try { listener() } catch { /* a subscriber must not break others */ }
        }
      }
      async function refresh(force) {
        if (inflight !== null) return inflight
        const url = force ? '/dsh-token-atlas/stats.json?force=1' : '/dsh-token-atlas/stats.json'
        inflight = (async () => {
          try {
            const res = await fetch(url, { cache: 'no-store', headers: { accept: 'application/json' } })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            if (!data || data.ok !== true) throw new Error((data && data.error) || 'invalid response')
            emit({ status: 'ready', data, error: null, updatedAt: Date.now() })
          } catch (error) {
            emit({
              ...state,
              status: state.data ? 'stale' : 'error',
              error: String((error && error.message) || error || 'fetch failed'),
            })
          } finally {
            inflight = null
          }
        })()
        return inflight
      }
      function subscribe(listener) {
        listeners.add(listener)
        if (listeners.size === 1) {
          refresh(false)
          timer = setInterval(() => refresh(false), 5000)
        }
        return () => {
          listeners.delete(listener)
          if (listeners.size === 0 && timer !== null) {
            clearInterval(timer)
            timer = null
          }
        }
      }
      return {
        subscribe,
        getSnapshot: () => state,
        refresh,
      }
    }

    function createAccountStore() {
      let state = { status: 'idle', data: null, error: null, range: '30d', scope: 'dsh', updatedAt: 0 }
      const listeners = new Set()
      let timer = null
      let seq = 0
      const emit = (next) => {
        state = next
        for (const listener of listeners) {
          try { listener() } catch { /* a subscriber must not break others */ }
        }
      }
      async function load(force) {
        const my = ++seq
        const range = state.range
        const scope = state.scope
        const query = `/dsh-token-atlas/account.json?range=${encodeURIComponent(range)}&scope=${encodeURIComponent(scope)}${force ? '&force=1' : ''}`
        emit({ ...state, status: state.data ? 'refreshing' : 'loading', error: null })
        try {
          const res = await fetch(query, { cache: 'no-store', headers: { accept: 'application/json' } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          if (my !== seq) return
          if (!data || (data.ok !== true && data.available !== false)) {
            throw new Error((data && (data.error || data.reason)) || 'invalid response')
          }
          emit({ ...state, status: 'ready', data, error: null, updatedAt: Date.now() })
        } catch (error) {
          if (my !== seq) return
          emit({
            ...state,
            status: state.data ? 'stale' : 'error',
            error: String((error && error.message) || error || 'fetch failed'),
          })
        }
      }
      function subscribe(listener) {
        listeners.add(listener)
        if (listeners.size === 1) {
          load(false)
          timer = setInterval(() => load(false), 5 * 60 * 1000)
        }
        return () => {
          listeners.delete(listener)
          if (listeners.size === 0 && timer !== null) {
            clearInterval(timer)
            timer = null
          }
        }
      }
      function setRange(range) {
        if (range === state.range) return
        emit({ ...state, range })
        load(false)
      }
      function setScope(scope) {
        if (scope === state.scope) return
        emit({ ...state, scope })
        load(false)
      }
      return {
        subscribe,
        getSnapshot: () => state,
        refresh: (force = true) => load(force),
        setRange,
        setScope,
      }
    }

    function useStore(store) {
      return React.useSyncExternalStore(store.subscribe, store.getSnapshot)
    }

    function TokenIcon({ size = 18, active = false, className }) {
      return h('svg', {
        className: className || undefined,
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: active ? 2.1 : 1.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
        h('ellipse', { cx: 12, cy: 6, rx: 7, ry: 3 }),
        h('path', { d: 'M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6' }),
        h('path', { d: 'M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6' })
      )
    }

    function PanelGlyph({ size = 18, active = false }) {
      return h(TokenIcon, { size, active, className: 'dts-glyph' })
    }

    function MiniCard({ store, accountStore, open, wide, t }) {
      const tr = typeof t === 'function' ? t : (key) => key
      const snap = useStore(store)
      const account = useStore(accountStore)
      const accountData = account.data && account.data.available === true ? account.data : null
      const data = accountData || snap.data
      const tokens = data && data.totals ? data.totals.tokens : 0
      const cost = data && data.totals ? data.totals.cost : 0
      const kicker = accountData ? tr('account.kicker') : tr('mini.kicker')
      const value = data ? `${formatTokens(tokens)} · ${formatMoney(cost)}` : '—'
      const label = `${kicker} ${data ? value : ''}`.trim()
      return h('button', {
        type: 'button',
        className: wide ? 'dts-mini' : 'dts-mini is-rail',
        onClick: open,
        title: label,
        'aria-label': tr('mini.aria'),
      },
        h('span', { className: 'dts-mini-icon' }, h(TokenIcon, { size: wide ? 17 : 19 })),
        wide ? h('span', { className: 'dts-mini-body' },
          h('span', { className: 'dts-mini-kicker' }, kicker),
          h('span', { className: 'dts-mini-value' }, value)
        ) : null
      )
    }

    function StatCard({ label, value, sub, small }) {
      return h('div', { className: 'dts-card dts-stat' },
        h('span', { className: 'dts-stat-label' }, label),
        h('span', { className: small ? 'dts-stat-value is-small' : 'dts-stat-value' }, value),
        h('span', { className: 'dts-stat-sub' }, sub)
      )
    }

    function BreakdownCard({ totals, t, showCost = true }) {
      const parts = [
        { key: 'input', label: t('breakdown.input'), tokens: totals.input, cost: totals.costInput, color: 'var(--dts-blue)' },
        { key: 'cacheRead', label: t('breakdown.cacheRead'), tokens: totals.cacheRead, cost: totals.costCacheRead, color: 'var(--dts-green)' },
        { key: 'cacheWrite', label: t('breakdown.cacheWrite'), tokens: totals.cacheWrite, cost: totals.costCacheWrite, color: 'var(--dts-orange)' },
        { key: 'output', label: t('breakdown.output'), tokens: totals.output, cost: totals.costOutput, color: 'var(--dts-violet)' },
      ]
      return h('section', { className: 'dts-card dts-section' },
        h('div', { className: 'dts-section-head' },
          h('h2', { className: 'dts-section-title' }, t('breakdown.title')),
          h('span', { className: 'dts-section-hint' }, formatInt(totals.tokens))
        ),
        h('div', { className: 'dts-breakdown' },
          parts.map((part) => h('div', { className: showCost ? 'dts-break-row' : 'dts-break-row is-no-cost', key: part.key },
            h('span', { className: 'dts-break-label' },
              h('span', { className: 'dts-dot', style: { background: part.color } }),
              part.label
            ),
            h('span', { className: 'dts-track' },
              part.tokens > 0
                ? h('span', { className: 'dts-fill', style: { width: `${pct(part.tokens, totals.tokens)}%`, background: part.color } })
                : null
            ),
            h('span', { className: 'dts-break-value' }, formatTokens(part.tokens)),
            showCost ? h('span', { className: 'dts-break-cost' }, part.cost > 0 ? formatMoney(part.cost) : '—') : null
          ))
        )
      )
    }

    function ChartCard({ days, t, title, limit = 14 }) {
      const all = Array.isArray(days) ? days : []
      const slice = all.slice(-limit)
      const n = slice.length
      const max = slice.reduce((acc, d) => Math.max(acc, Number(d.tokens) || 0), 0) || 1
      const scrollable = n > 30
      const minWidth = scrollable ? `${n * 32 + 20}px` : '0'
      let ticks = []
      if (n > 0 && n <= 14) {
        ticks = slice.map((_, index) => ({ index }))
      } else if (n > 14) {
        const count = Math.min(8, n)
        const indices = new Set()
        for (let i = 0; i < count; i += 1) indices.add(Math.round((i * (n - 1)) / (count - 1)))
        ticks = [...indices].sort((a, b) => a - b).map((index) => ({ index }))
      }
      return h('section', { className: 'dts-card dts-section' },
        h('div', { className: 'dts-section-head' },
          h('h2', { className: 'dts-section-title' }, title || t('chart.title')),
          h('span', { className: 'dts-section-hint' }, `${t('chart.tokens')} / ${t('chart.cost')}`)
        ),
        n === 0
          ? h('div', { className: 'dts-section-hint' }, t('chart.noData'))
          : h('div', { className: 'dts-chart-scroll' },
            h('div', {
              className: 'dts-chart',
              style: { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, minWidth },
            },
              slice.map((day) => h('div', {
                className: 'dts-bar-col',
                key: day.day,
                title: `${day.day} · ${formatInt(day.tokens)} tokens · ${formatMoney(day.cost)}`,
              },
                h('span', { className: 'dts-bar-track' },
                  h('span', { className: 'dts-bar-fill', style: { height: day.tokens > 0 ? `${Math.max(2, pct(day.tokens, max))}%` : '0%' } })
                )
              ))
            ),
            h('div', { className: 'dts-axis', style: { minWidth } },
              ticks.map((tick) => h('span', {
                className: 'dts-axis-label',
                key: slice[tick.index].day,
                style: {
                  left: `${((tick.index + 0.5) / n) * 100}%`,
                  transform: 'translateX(-50%)',
                },
              }, formatAxisDay(slice[tick.index].day)))
            )
          )
      )
    }

    function ModelsCard({ models, totals, t }) {
      return h('section', { className: 'dts-card dts-section' },
        h('div', { className: 'dts-section-head' },
          h('h2', { className: 'dts-section-title' }, t('models.title')),
          h('span', { className: 'dts-section-hint' }, `${models.length}`)
        ),
        h('div', { className: 'dts-models' },
          models.map((model) => {
            const unpriced = Number(model.cost) <= 0 && Number(model.tokens) > 0 && model.unpricedTokens > 0
            return h('div', { className: 'dts-model', key: `${model.provider || ''}:${model.model}` },
              h('div', { className: 'dts-model-head' },
                h('span', { className: 'dts-model-name' }, model.model),
                model.provider && model.provider !== 'deepseek-account'
                  ? h('span', { className: 'dts-model-provider' }, model.provider)
                  : null,
                h('span', { className: 'dts-model-spacer' }),
                h('span', { className: 'dts-model-tokens' }, formatTokens(model.tokens)),
                h('span', { className: 'dts-model-cost' }, model.cost > 0 ? formatMoney(model.cost) : t('models.unpriced'))
              ),
              h('span', { className: 'dts-track' },
                h('span', { className: 'dts-fill', style: { width: `${pct(model.tokens, totals.tokens)}%` } })
              ),
              unpriced ? h('span', { className: 'dts-section-hint' },
                t('note.unpriced').replace('{tokens}', formatInt(model.unpricedTokens))
              ) : null
            )
          })
        )
      )
    }

    function SessionsCard({ sessions, t }) {
      const rows = sessions.slice(0, 8)
      return h('section', { className: 'dts-card dts-section' },
        h('div', { className: 'dts-section-head' },
          h('h2', { className: 'dts-section-title' }, t('sessions.recent')),
          h('span', { className: 'dts-section-hint' }, `${t('sessions.tokens')} · ${t('sessions.cost')}`)
        ),
        h('div', { className: 'dts-sessions' },
          rows.map((session) => {
            const title = session.title || t('sessions.untitled')
            const sub = [workspaceName(session.cwd), session.missing ? t('sessions.missing') : ''].filter(Boolean).join(' · ')
            return h('div', { className: 'dts-session', key: session.id },
              h('div', { className: 'dts-session-main' },
                h('span', { className: 'dts-session-title', title }, truncate(title, 72)),
                h('span', { className: 'dts-session-sub', title: sub }, sub || session.id)
              ),
              h('span', { className: 'dts-session-date' }, formatTime(session.lastAt)),
              h('span', { className: 'dts-session-tokens' }, formatTokens(session.tokens)),
              h('span', { className: 'dts-session-cost' }, session.cost > 0 ? formatMoney(session.cost) : '—')
            )
          })
        )
      )
    }

    function ModeSwitch({ mode, setMode, t }) {
      return h('div', { className: 'dts-seg dts-mode', role: 'tablist' },
        h('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': mode === 'account',
          className: mode === 'account' ? 'is-active' : '',
          onClick: () => setMode('account'),
        }, t('mode.account')),
        h('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': mode === 'local',
          className: mode === 'local' ? 'is-active' : '',
          onClick: () => setMode('local'),
        }, t('mode.local'))
      )
    }

    function AccountControls({ snap, store, t }) {
      const ranges = [['7d', 'range.7d'], ['30d', 'range.30d'], ['all', 'range.all']]
      const scopes = [['dsh', 'scope.dsh'], ['all', 'scope.all']]
      const range = snap.range || '30d'
      const scope = snap.scope || 'dsh'
      return h('div', { className: 'dts-toolbar' },
        h('div', { className: 'dts-seg dts-seg-small' },
          ranges.map(([value, key]) => h('button', {
            type: 'button',
            key: value,
            className: range === value ? 'is-active' : '',
            onClick: () => store.setRange(value),
          }, t(key)))
        ),
        h('span', { className: 'dts-toolbar-spacer' }),
        h('div', { className: 'dts-seg dts-seg-small' },
          scopes.map(([value, key]) => h('button', {
            type: 'button',
            key: value,
            className: scope === value ? 'is-active' : '',
            onClick: () => store.setScope(value),
          }, t(key)))
        )
      )
    }

    function LocalToolbar({ data, t }) {
      const files = data?.backfill?.activeFiles ?? data?.totals?.activeSessions ?? 0
      const first = data?.firstAt ? formatDay(bjDay(data.firstAt)) : '—'
      return h('div', { className: 'dts-toolbar' },
        h('span', { className: 'dts-chip is-ok' }, t('local.badge')),
        h('span', { className: 'dts-toolbar-note' }, `${formatInt(files)} ${t('sessions.files')}`),
        h('span', { className: 'dts-toolbar-note' }, `${t('coverage')} ${first}`),
        h('span', { className: 'dts-toolbar-spacer' }),
        h('span', { className: 'dts-toolbar-note' }, t('local.hint'))
      )
    }

    function KeysCard({ keys, t }) {
      return h('section', { className: 'dts-card dts-section' },
        h('div', { className: 'dts-section-head' },
          h('h2', { className: 'dts-section-title' }, t('account.keys')),
          h('span', { className: 'dts-section-hint' }, t('account.keysHint'))
        ),
        h('div', { className: 'dts-keys' },
          keys.map((key) => h('div', { className: 'dts-key-row', key: `${key.name}:${key.type}` },
            h('div', { className: 'dts-key-main' },
              h('span', { className: 'dts-key-name', title: key.name }, key.name),
              h('span', { className: 'dts-key-type' }, `${key.type} · ${key.models} ${t('account.models')}`)
            ),
            h('span', { className: 'dts-key-requests' }, `${formatInt(key.requests)} ${t('account.requests')}`),
            h('span', { className: 'dts-key-tokens' }, formatTokens(key.tokens)),
            h('span', { className: 'dts-key-cost' }, formatMoney(key.cost))
          ))
        )
      )
    }

    function AccountPanel({ store, setMode, t }) {
      const tr = typeof t === 'function' ? t : (key) => key
      const snap = useStore(store)
      const [busy, setBusy] = React.useState(false)
      const data = snap.data
      const onRefresh = async () => {
        setBusy(true)
        try { await store.refresh(true) } finally { setBusy(false) }
      }
      const header = h('header', { className: 'dts-head' },
        h('div', null,
          h('h1', { className: 'dts-title' }, tr('panel.title')),
          h('p', { className: 'dts-subtitle' }, tr('account.subtitle'))
        ),
        h('div', { className: 'dts-actions' },
          h(ModeSwitch, { mode: 'account', setMode, t: tr }),
          snap.status === 'stale' ? h('span', { className: 'dts-chip is-warn' }, tr('panel.stale')) : null,
          h('span', { className: 'dts-updated' }, `${tr('panel.updated')} ${formatClock(data && data.fetchedAt)}`),
          h('button', {
            type: 'button',
            className: 'dts-button',
            onClick: onRefresh,
            disabled: busy,
          }, busy ? '…' : tr('panel.refresh'))
        )
      )

      if (!data) {
        return h('div', { className: 'dts-root' },
          header,
          h('div', { className: 'dts-center' },
            h('div', { className: 'dts-spinner' }),
            h('div', { className: 'dts-subtitle' }, snap.status === 'error' ? tr('panel.error') : tr('account.loading')),
            snap.status === 'error' ? h('div', { className: 'dts-error' }, `${tr('panel.error')} · ${snap.error || ''}`) : null,
            snap.status === 'error' ? h('button', { type: 'button', className: 'dts-button', onClick: onRefresh }, tr('panel.retry')) : null
          )
        )
      }

      if (data.available === false) {
        const reason = data.reason === 'signed-out'
          ? tr('account.signedOut')
          : data.reason === 'auth'
            ? tr('account.auth')
            : tr('account.error')
        return h('div', { className: 'dts-root' },
          header,
          h('div', { className: 'dts-card dts-unavailable' },
            h('span', { className: 'dts-unavailable-icon' }, h(TokenIcon, { size: 30 })),
            h('h2', { className: 'dts-section-title' }, tr('account.unavailable')),
            h('p', { className: 'dts-subtitle' }, reason),
            h('div', { className: 'dts-actions dts-actions-center' },
              h('button', { type: 'button', className: 'dts-button', onClick: () => setMode('local') }, tr('account.switchLocal')),
              h('button', { type: 'button', className: 'dts-button', onClick: onRefresh, disabled: busy }, busy ? '…' : tr('panel.retry'))
            )
          )
        )
      }

      const totals = data.totals || {}
      const today = data.today || {}
      const models = Array.isArray(data.models) ? data.models : []
      const keys = Array.isArray(data.keys) ? data.keys : []
      const days = Array.isArray(data.days) ? data.days : []
      const range = data.range || {}
      const summary = data.summary || {}
      const rangeLabel = range.kind === '7d' ? tr('range.7d') : range.kind === 'all' ? tr('range.all') : tr('range.30d')
      const scopeLabel = data.scope === 'all' ? tr('scope.all') : tr('scope.dsh')
      const limit = range.kind === 'all' ? Math.min(Math.max(days.length, 1), 60) : (range.days || 30)
      const functionCost = Array.isArray(data.functions) && data.functions.length > 0
        ? data.functions.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
        : 0

      return h('div', { className: 'dts-root' },
        header,
        h(AccountControls, { snap, store, t: tr }),
        h('section', { className: 'dts-hero' },
          h('div', { className: 'dts-hero-card is-main' },
            h('div', null,
              h('span', { className: 'dts-eyebrow' }, tr('account.tokens')),
              h('strong', { className: 'dts-hero-number' }, formatTokens(totals.tokens)),
              h('span', { className: 'dts-hero-sub' }, `${formatInt(totals.tokens)} tokens · ${formatInt(totals.requests)} ${tr('account.requests')}`)
            ),
            h('div', { className: 'dts-hero-foot' },
              h('span', { className: 'dts-chip is-ok' }, rangeLabel),
              h('span', { className: 'dts-chip' }, `${totals.models || 0} ${tr('account.models')}`),
              h('span', { className: 'dts-chip' }, `${totals.keys || 0} ${tr('account.keysCount')}`),
              h('span', null, scopeLabel)
            )
          ),
          h('div', { className: 'dts-hero-card is-cost' },
            h('div', null,
              h('span', { className: 'dts-eyebrow' }, tr('account.cost')),
              h('strong', { className: 'dts-hero-number is-cost' }, formatMoney(totals.cost)),
              h('span', { className: 'dts-hero-sub' }, tr('account.costNote'))
            ),
            h('div', { className: 'dts-hero-foot' },
              h('span', { className: 'dts-chip' }, tr('account.source')),
              summary.totalCost != null ? h('span', null, `${tr('account.cumulative')} ${formatMoney(summary.totalCost)}`) : null
            )
          )
        ),
        h('section', { className: 'dts-grid' },
          h(StatCard, {
            label: tr('today.title'),
            value: formatTokens(today.tokens),
            sub: `${formatMoney(today.cost)} · ${formatInt(today.requests)} ${tr('account.requests')}`,
          }),
          h(StatCard, {
            label: tr('account.rangeCost'),
            value: formatMoney(totals.cost),
            sub: `${rangeLabel} · ${scopeLabel}`,
          }),
          h(StatCard, {
            label: tr('account.requestsCard'),
            value: formatInt(totals.requests),
            sub: `${totals.models || 0} ${tr('account.models')} · ${totals.keys || 0} ${tr('account.keysCount')}`,
            small: true,
          })
        ),
        h(BreakdownCard, { totals, t: tr, showCost: false }),
        h(ChartCard, {
          days,
          t: tr,
          title: rangeLabel,
          limit,
        }),
        h(ModelsCard, { models, totals, t: tr }),
        h(KeysCard, { keys, t: tr }),
        h('footer', { className: 'dts-note' },
          h('p', null, tr('account.note')),
          h('p', null, tr('account.delay')),
          summary.totalCost != null ? h('p', null, `${tr('account.cumulative')}: ${formatMoney(summary.totalCost)}`) : null,
          functionCost > 0 ? h('p', null, `${tr('account.functions')}: ${formatMoney(functionCost)}`) : null
        )
      )
    }

    function LocalPanel({ store, setMode, t }) {
      const tr = typeof t === 'function' ? t : (key) => key
      const snap = useStore(store)
      const [busy, setBusy] = React.useState(false)
      React.useEffect(() => { store.refresh(true) }, [store])

      const data = snap.data
      const onRefresh = async () => {
        setBusy(true)
        try { await store.refresh(true) } finally { setBusy(false) }
      }

      if (!data) {
        return h('div', { className: 'dts-root dts-center' },
          h('div', { className: 'dts-spinner' }),
          h('div', { className: 'dts-subtitle' }, snap.status === 'error' ? tr('panel.error') : tr('panel.loading')),
          snap.status === 'error' ? h('div', { className: 'dts-error' }, `${tr('panel.error')} · ${snap.error || ''}`) : null,
          snap.status === 'error' ? h('button', { type: 'button', className: 'dts-button', onClick: onRefresh }, tr('panel.retry')) : null
        )
      }

      const totals = data.totals || {}
      const today = data.today || {}
      const month = data.month || {}
      const models = Array.isArray(data.models) ? data.models : []
      const sessions = Array.isArray(data.sessions) ? data.sessions : []
      const days = Array.isArray(data.days) ? data.days : []
      const first = data.firstAt ? formatDay(bjDay(data.firstAt)) : '—'
      const unpricedNote = totals.unpricedTokens > 0
        ? tr('note.unpriced').replace('{tokens}', formatInt(totals.unpricedTokens))
        : ''

      return h('div', { className: 'dts-root' },
        h('header', { className: 'dts-head' },
          h('div', null,
            h('h1', { className: 'dts-title' }, tr('panel.title')),
            h('p', { className: 'dts-subtitle' }, tr('panel.subtitle'))
          ),
          h('div', { className: 'dts-actions' },
            h(ModeSwitch, { mode: 'local', setMode, t: tr }),
            snap.status === 'stale' ? h('span', { className: 'dts-chip is-warn' }, tr('panel.stale')) : null,
            h('span', { className: 'dts-updated' }, `${tr('panel.updated')} ${formatClock(data.generatedAt)}`),
            h('button', {
              type: 'button',
              className: 'dts-button',
              onClick: onRefresh,
              disabled: busy,
            }, busy ? '…' : tr('panel.refresh'))
          )
        ),
        h(LocalToolbar, { data, t: tr }),
        h('section', { className: 'dts-hero' },
          h('div', { className: 'dts-hero-card is-main' },
            h('div', null,
              h('span', { className: 'dts-eyebrow' }, tr('total.tokens')),
              h('strong', { className: 'dts-hero-number' }, formatTokens(totals.tokens)),
              h('span', { className: 'dts-hero-sub' }, `${formatInt(totals.tokens)} tokens`)
            ),
            h('div', { className: 'dts-hero-foot' },
              h('span', { className: 'dts-chip is-ok' }, `${totals.sessions || 0} ${tr('total.sessions')}`),
              h('span', { className: 'dts-chip' }, `${formatInt(totals.events)} ${tr('total.events')}`),
              h('span', null, `${tr('coverage')} ${first}`)
            )
          ),
          h('div', { className: 'dts-hero-card is-cost' },
            h('div', null,
              h('span', { className: 'dts-eyebrow' }, tr('total.cost')),
              h('strong', { className: 'dts-hero-number is-cost' }, formatMoney(totals.cost)),
              h('span', { className: 'dts-hero-sub' }, tr('cost.note'))
            ),
            h('div', { className: 'dts-hero-foot' },
              h('span', { className: 'dts-chip' }, tr('pricing.badge')),
              unpricedNote ? h('span', { className: 'dts-chip is-warn' }, tr('models.unpriced')) : null
            )
          )
        ),
        h('section', { className: 'dts-grid' },
          h(StatCard, {
            label: tr('today.title'),
            value: formatTokens(today.tokens),
            sub: `${formatMoney(today.cost)} · ${formatInt(today.events)} ${tr('total.events')}`,
          }),
          h(StatCard, {
            label: tr('month.title'),
            value: formatTokens(month.tokens),
            sub: `${formatMoney(month.cost)} · ${formatInt(month.events)} ${tr('total.events')}`,
          }),
          h(StatCard, {
            label: tr('sessions.title'),
            value: `${totals.sessions || 0}`,
            sub: `${formatInt(totals.activeSessions || 0)} ${tr('sessions.files')} · ${formatTokens(totals.cacheRead)} ${tr('breakdown.cacheRead')}`,
            small: true,
          })
        ),
        h(BreakdownCard, { totals, t: tr }),
        h(ChartCard, { days: Array.isArray(data.last14) ? data.last14 : days, t: tr }),
        h(ModelsCard, { models, totals, t: tr }),
        h(SessionsCard, { sessions, t: tr }),
        h('footer', { className: 'dts-note' },
          h('p', null, tr('note')),
          h('p', null, tr('account.localNote')),
          unpricedNote ? h('p', null, unpricedNote) : null,
          data.backfill ? h('p', null, tr('note.backfill').replace('{files}', String(data.backfill.files || 0))) : null
        )
      )
    }

    function Panel({ store, accountStore, t }) {
      const [mode, setMode] = React.useState('account')
      if (mode === 'account') return h(AccountPanel, { store: accountStore, setMode, t })
      return h(LocalPanel, { store, setMode, t })
    }

    function apply(ctx) {
      const styleId = 'dsh-token-atlas-style'
      const styleOwner = `token-atlas-${Date.now()}-${Math.random().toString(36).slice(2)}`
      let styleEl = document.getElementById(styleId)
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.dataset.dshTokenStatsOwner = styleOwner
      styleEl.textContent = CSS
      ctx.effect(() => () => {
        if (styleEl && styleEl.dataset.dshTokenStatsOwner === styleOwner && styleEl.parentNode) {
          styleEl.remove()
        }
      }, 'token-atlas: styles')

      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'token-atlas: dictionaries')
      const t = ctx.locale.bind(NS)
      const store = createStatsStore()
      const accountStore = createAccountStore()
      const open = () => {
        try { ctx.layout.selectPanel(PANEL_ID) } catch { /* panel not registered yet */ }
      }

      const PanelView = (props) => h(Panel, { ...props, store, accountStore, t })
      const MiniView = (props) => h(MiniCard, { ...props, store, accountStore, open, t })

      ctx.slots.inject('main', function* () {
        yield ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, PanelView)
      })

      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 10,
        label: () => t('panel.title'),
        locale: NS,
      }, PanelGlyph))

      ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: `${PANEL_ID}-mini`,
        order: 10,
        locale: NS,
      }, MiniView))
    }

    return {
      name: 'token-atlas',
      inject: ['slots', 'locale', 'layout'],
      apply,
    }
  },
})
