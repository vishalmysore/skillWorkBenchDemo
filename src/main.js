import { runPipeline } from './generation/pipeline.js'
import tracer from './feedback/tracer.js'
import { PROVIDERS, setLLMConfig, getLLMConfig, getDefaultProxy, testConnection } from './utils/llm.js'
import SOURCES, { getSources, getRepoSources, getDocSources, METHODS, METHOD_LIST } from './sources/index.js'

let currentResult  = null
let pipelineRunning = false
let traceUnsub      = null
let activeSourceType = 'repository'
let activeSetting    = 'task-conditioned'

// ── LLM config ────────────────────────────────────────────────

function syncConfigFromUI() {
  setLLMConfig({
    provider: document.getElementById('provider').value,
    apiKey:   document.getElementById('apiKey').value.trim(),
    model:    document.getElementById('modelName').value,
    proxyUrl: document.getElementById('proxyUrl').value.trim() || getDefaultProxy(),
  })
}

function populateProviderModels(providerId) {
  const prov = PROVIDERS.find(p => p.id === providerId)
  const sel  = document.getElementById('modelName')
  sel.innerHTML = ''
  prov?.models.forEach(m => {
    const o = document.createElement('option'); o.value = m.id; o.textContent = m.name; sel.appendChild(o)
  })
  document.getElementById('apiKey').placeholder = prov?.keyPlaceholder || 'API key'
  const noKey = providerId === 'mock'
  document.getElementById('apiKey').disabled      = noKey
  document.getElementById('apiKey').style.opacity = noKey ? '0.4' : '1'
}

function syncConfigToUI() {
  const cfg = getLLMConfig()
  document.getElementById('provider').value = cfg.provider
  populateProviderModels(cfg.provider)
  if (cfg.model) document.getElementById('modelName').value = cfg.model
  document.getElementById('apiKey').value   = cfg.apiKey || ''
  document.getElementById('proxyUrl').value = cfg.proxyUrl || getDefaultProxy()
}

// ── Source & method management ─────────────────────────────────

function getActiveSources() {
  return activeSourceType === 'repository' ? getRepoSources() : getDocSources()
}

function getActiveSource() {
  const id = document.getElementById('sourceSelect').value
  return SOURCES[id] || getActiveSources()[0]
}

function getActiveMethod() {
  return METHODS[document.getElementById('methodSelect').value] || METHOD_LIST[0]
}

function populateSources() {
  const sel = document.getElementById('sourceSelect')
  sel.innerHTML = ''
  getActiveSources().forEach(s => {
    const o = document.createElement('option'); o.value = s.id
    o.textContent = `${s.icon} ${s.name} (${s.domain})`
    sel.appendChild(o)
  })
  updateSourceInfo()
}

function updateSourceInfo() {
  const source = getActiveSource()
  if (!source) return
  document.getElementById('sourceDesc').textContent = source.description
  document.documentElement.style.setProperty('--domain-color', source.color)
  updateTaskCard()
}

function updateTaskCard() {
  const source  = getActiveSource()
  const isAgnostic = activeSetting === 'task-agnostic'
  const card  = document.getElementById('taskCard')
  const title = document.getElementById('taskTitle')
  const desc  = document.getElementById('taskDesc')
  if (!source) return
  if (isAgnostic) {
    title.textContent = 'Task-Agnostic Mode'
    desc.textContent  = `No downstream task revealed. Skill library distilled from "${source.shortName}" source before tasks are known.`
  } else {
    title.textContent = `Task: ${source.task.title}`
    desc.textContent  = source.task.description
  }
}

function populateMethods() {
  const sel = document.getElementById('methodSelect')
  sel.innerHTML = ''
  METHOD_LIST.forEach(m => {
    const o = document.createElement('option'); o.value = m.id
    o.textContent = `${m.icon} ${m.name}`
    sel.appendChild(o)
  })
  updateMethodInfo()
}

function updateMethodInfo() {
  const method = getActiveMethod()
  if (!method) return
  document.getElementById('methodDesc').textContent = method.description
}

function updateSettingInfo() {
  const desc = document.getElementById('settingDesc')
  if (activeSetting === 'task-conditioned') {
    desc.textContent = 'Task revealed at generation time. Targeted distillation: model filters source for task-relevant procedures.'
  } else {
    desc.textContent = 'No task visible. Generator builds a reusable skill library; held-out tasks revealed only at execution time.'
  }
  updateTaskCard()
}

// ── Trace panel ────────────────────────────────────────────────

function clearTrace() { document.getElementById('traceContainer').innerHTML = '' }

const LAYER_MAP = {
  'layer:info':      { label: 'INFO',      cls: 'trace-info' },
  'layer:execution': { label: 'GENERATE',  cls: 'trace-exec' },
  'layer:feedback':  { label: 'EVALUATE',  cls: 'trace-feedback' },
  'agent:start':     { label: 'PIPELINE START', cls: 'trace-start' },
  'agent:complete':  { label: 'COMPLETE ✓',     cls: 'trace-complete' },
  'agent:error':     { label: 'ERROR',          cls: 'trace-error' },
}

function appendTrace(event, data) {
  const container = document.getElementById('traceContainer')
  container.querySelector('.trace-empty')?.remove()
  const meta = LAYER_MAP[event] || { label: event.toUpperCase(), cls: 'trace-default' }
  const text = typeof data === 'string' ? data : JSON.stringify(data).substring(0, 160) + '…'
  const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const el = document.createElement('div')
  el.className = `trace-entry ${meta.cls}`
  el.innerHTML = `<span class="trace-time">${time}</span><span class="trace-label">[${meta.label}]</span><span class="trace-msg">${esc(text)}</span>`
  container.appendChild(el)
  container.scrollTop = container.scrollHeight
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// ── Skill output rendering ─────────────────────────────────────

function renderSkillOutput(result) {
  const panel  = document.getElementById('skillPanel')
  const method = result.method
  const source = result.source
  const s      = result.staticScores
  const passAt3 = result.passAt3

  const scoreColor = (v) => v >= 60 ? '#10b981' : v >= 40 ? '#f59e0b' : '#f85149'
  const barColor   = (v) => v >= 60 ? 'var(--accent)' : v >= 40 ? '#f59e0b' : '#f85149'

  const diagRows = [
    { name: 'Contract', val: s.contract },
    { name: 'Environ.', val: s.env },
    { name: 'Grounding', val: s.grounding },
    { name: 'Procedure', val: s.procedure },
    { name: 'Constraint', val: s.constraints },
    { name: 'Safety', val: s.safety },
  ].map(d => `
    <div class="diag-bar-row">
      <span class="diag-bar-name">${d.name}</span>
      <div class="diag-bar-track"><div class="diag-bar-fill" style="width:${d.val}%;background:${barColor(d.val)}"></div></div>
      <span class="diag-bar-val" style="color:${scoreColor(d.val)}">${d.val}</span>
    </div>`).join('')

  const trialRows = (result.trialResults || []).map((t, i) => `
    <div class="trial-row ${t.pass ? 'trial-pass' : 'trial-fail'}">
      <span class="trial-icon">${t.pass ? '✓' : '✗'} T${i + 1}</span>
      <span class="trial-msg">${esc(t.msg)}</span>
    </div>`).join('')

  const overall = Math.round(Object.values(s).reduce((a, b) => a + b, 0) / 6)
  const settingLabel = result.setting === 'task-conditioned' ? '🎯 Task-Conditioned' : '📦 Task-Agnostic'
  const sourceTypeLabel = source.type === 'repository' ? '📁 Repository' : '📄 Document'

  panel.innerHTML = `
    <div class="skill-output-header">
      <h3>${source.icon} ${source.shortName} — ${method.icon} ${method.name}</h3>
      <span class="method-chip chip-${method.id}">${settingLabel}</span>
    </div>

    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">pass@3</div>
        <div class="metric-value" style="color:${passAt3 >= 20 ? 'var(--accent)' : '#f59e0b'}">${passAt3.toFixed(1)}%</div>
        <div class="metric-sub">benchmark</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Static Quality</div>
        <div class="metric-value" style="color:${scoreColor(overall)}">${overall}/100</div>
        <div class="metric-sub">avg 6 axes</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Source Type</div>
        <div class="metric-value" style="font-size:13px;margin-top:4px">${sourceTypeLabel}</div>
        <div class="metric-sub">${source.domain}</div>
      </div>
    </div>

    <div class="diagnostics-section">
      <div class="diag-label-row">Static Skill Diagnostics (0–100)</div>
      ${diagRows}
    </div>

    ${result.trialResults?.length ? `
    <div class="trials-section">
      <div class="trials-label">Execution Trials (pass@3 evaluation)</div>
      ${trialRows}
    </div>` : ''}

    <div class="skill-md-section">
      <div class="skill-md-label">
        <span>Generated SKILL.md Artifact</span>
        <button class="copy-btn" id="copySkillBtn">⎘ Copy</button>
      </div>
      <pre class="skill-md-code" id="skillMdCode">${esc(result.skillMd)}</pre>
    </div>

    <div class="hitl-actions">
      <button id="approveBtn" class="btn btn-approve">✓ Accept Skill</button>
      <button id="flagBtn"    class="btn btn-flag">✗ Flag Issues</button>
    </div>
    <div id="correctionBox" class="correction-box hidden">
      <label>Describe the skill quality issue — what's missing or incorrect?</label>
      <textarea id="correctionText" rows="3" placeholder="e.g. Missing environment setup, incorrect interface contract, ungrounded procedure steps…"></textarea>
      <button id="submitFlag" class="btn-submit">Submit Flag</button>
    </div>
  `

  document.getElementById('approveBtn').addEventListener('click', handleApprove)
  document.getElementById('flagBtn').addEventListener('click', handleFlag)
  document.getElementById('copySkillBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(result.skillMd).then(() => {
      const btn = document.getElementById('copySkillBtn')
      btn.textContent = '✓ Copied'
      setTimeout(() => { btn.textContent = '⎘ Copy' }, 1500)
    })
  })
}

function handleApprove() {
  appendTrace('layer:feedback', `Skill ACCEPTED by reviewer. Trajectory: pass. Method: ${currentResult?.method?.name}, Source: ${currentResult?.source?.name}`)
  document.getElementById('approveBtn').disabled = true
  document.getElementById('flagBtn').disabled    = true
  document.getElementById('approveBtn').textContent = '✓ Accepted'
  document.getElementById('approveBtn').classList.add('approved')
}

function handleFlag() {
  document.getElementById('correctionBox').classList.remove('hidden')
  document.getElementById('submitFlag').addEventListener('click', () => {
    const text = document.getElementById('correctionText').value.trim()
    if (!text) return
    appendTrace('layer:feedback', `Skill FLAGGED: "${text.substring(0, 80)}…". Quality issue logged for method: ${currentResult?.method?.name}`)
    document.getElementById('correctionBox').classList.add('hidden')
    document.getElementById('flagBtn').disabled    = true
    document.getElementById('flagBtn').textContent = '✗ Flagged'
  }, { once: true })
}

// ── Test connection ────────────────────────────────────────────

async function handleTestConnection() {
  syncConfigFromUI()
  const cfg = getLLMConfig()
  const btn = document.getElementById('testBtn')
  if (cfg.provider !== 'mock' && !cfg.apiKey) { showTestResult('fail', '❌ Enter an API key first.'); return }
  btn.disabled = true; btn.textContent = '⟳ Testing…'
  document.getElementById('testResult').className = 'test-result hidden'
  try {
    const { text, latencyMs } = await testConnection()
    showTestResult('ok', `✅ Connected! "${text.slice(0, 40)}" (${latencyMs}ms)`)
  } catch (err) {
    showTestResult('fail', `❌ ${err.message}`)
  } finally {
    btn.disabled = false; btn.textContent = '🧪 Test'
  }
}

function showTestResult(status, msg) {
  const el = document.getElementById('testResult')
  el.textContent = msg
  el.className   = `test-result test-result-${status}`
}

// ── Execute pipeline ───────────────────────────────────────────

async function executePipeline() {
  if (pipelineRunning) return
  syncConfigFromUI()
  const cfg = getLLMConfig()
  if (cfg.provider !== 'mock' && !cfg.apiKey) {
    alert('Please enter your API key, or switch to 🧪 Mock AI to run without one.')
    return
  }

  const source = getActiveSource()
  const method = getActiveMethod()

  pipelineRunning = true
  currentResult   = null

  document.getElementById('executeBtn').disabled    = true
  document.getElementById('executeBtn').textContent = '⟳ Generating…'
  document.getElementById('skillPanelLabel').textContent = 'Generating Skill…'
  clearTrace()
  document.getElementById('skillPanel').innerHTML = `<div class="waiting-msg"><div class="waiting-icon">⟳</div><p>Skill generation pipeline running — trace streaming in real time…</p></div>`

  if (traceUnsub) traceUnsub()
  traceUnsub = tracer.subscribe('*', (event, data) => appendTrace(event, data))

  try {
    const result = await runPipeline(source, method, activeSetting)
    currentResult = result
    document.getElementById('skillPanelLabel').textContent = `Generated Skill — ${method.name}`
    renderSkillOutput(result)
  } catch (err) {
    appendTrace('agent:error', err.message)
    document.getElementById('skillPanel').innerHTML = `<div class="error-msg">⛔ ${esc(err.message)}</div>`
    document.getElementById('skillPanelLabel').textContent = 'Error'
  } finally {
    pipelineRunning = false
    document.getElementById('executeBtn').disabled    = false
    document.getElementById('executeBtn').textContent = '▶ Generate Skill'
  }
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Provider dropdown
  const provSel = document.getElementById('provider')
  PROVIDERS.forEach(p => {
    const o = document.createElement('option'); o.value = p.id; o.textContent = `${p.icon} ${p.name}`; provSel.appendChild(o)
  })

  syncConfigToUI()
  populateMethods()
  populateSources()
  updateSettingInfo()

  // Provider
  provSel.addEventListener('change', () => { populateProviderModels(provSel.value); syncConfigFromUI() })
  document.getElementById('apiKey').addEventListener('input', syncConfigFromUI)
  document.getElementById('modelName').addEventListener('change', syncConfigFromUI)
  document.getElementById('proxyUrl').addEventListener('input', syncConfigFromUI)
  document.getElementById('resetProxyBtn').addEventListener('click', () => {
    document.getElementById('proxyUrl').value = getDefaultProxy(); syncConfigFromUI()
  })

  // Source type toggle
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activeSourceType = btn.dataset.type
      populateSources()
    })
  })

  // Setting toggle
  document.querySelectorAll('.setting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.setting-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activeSetting = btn.dataset.setting
      updateSettingInfo()
    })
  })

  // Source & method selects
  document.getElementById('sourceSelect').addEventListener('change', updateSourceInfo)
  document.getElementById('methodSelect').addEventListener('change', updateMethodInfo)

  // How it works toggle
  document.getElementById('howToggle').addEventListener('click', () => {
    const content = document.getElementById('howContent')
    const btn     = document.getElementById('howToggle')
    const open    = !content.classList.contains('hidden')
    content.classList.toggle('hidden', open)
    btn.textContent = open ? 'ℹ How this demo works ▾' : 'ℹ How this demo works ▴'
  })

  // Execute
  document.getElementById('executeBtn').addEventListener('click', executePipeline)
  document.getElementById('testBtn').addEventListener('click', handleTestConnection)
})
