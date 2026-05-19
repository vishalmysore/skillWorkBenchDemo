const DEFAULT_PROXY = 'https://quantumstudio.visrow.workers.dev/'

export const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    keyPlaceholder: 'sk-…',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o',      name: 'GPT-4o (recommended)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (fast)' },
    ],
    format: 'openai',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧬',
    keyPlaceholder: 'sk-ant-…',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-opus-4-7',    name: 'Claude Opus 4.7 (most capable)' },
      { id: 'claude-sonnet-4-6',  name: 'Claude Sonnet 4.6 (recommended)' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (fast)' },
    ],
    format: 'anthropic',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✨',
    keyPlaceholder: 'AIza…',
    endpoint: 'https://generativelanguage.googleapis.com',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (recommended)' },
      { id: 'gemini-1.5-pro',   name: 'Gemini 1.5 Pro' },
    ],
    format: 'openai',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    icon: '🟢',
    keyPlaceholder: 'nvapi-…',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    models: [
      { id: 'nvidia/nemotron-nano-12b-v2-vl',      name: 'Nemotron Nano 12B V2' },
      { id: 'meta/llama-3.1-70b-instruct',          name: 'Llama 3.1 70B Instruct' },
    ],
    format: 'openai',
  },
  {
    id: 'mock',
    name: 'Mock AI',
    icon: '🧪',
    keyPlaceholder: 'No key needed',
    endpoint: 'mock',
    models: [
      { id: 'mock-skillgen', name: 'Mock SkillGen v1 (no API key required)' },
    ],
    format: 'mock',
  },
]

let _config = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
  proxyUrl: _loadProxyUrl(),
}

function _loadProxyUrl() {
  try { return localStorage.getItem('sgb_proxy_url') || DEFAULT_PROXY } catch { return DEFAULT_PROXY }
}

export function setLLMConfig(cfg) {
  _config = { ..._config, ...cfg }
  if (cfg.proxyUrl !== undefined) {
    try { localStorage.setItem('sgb_proxy_url', cfg.proxyUrl || DEFAULT_PROXY) } catch { /**/ }
  }
}

export function getLLMConfig() {
  return { ..._config, proxyUrl: _config.proxyUrl || DEFAULT_PROXY }
}

export function getDefaultProxy() { return DEFAULT_PROXY }

export function getProviderDef(providerId) {
  return PROVIDERS.find(p => p.id === (providerId || _config.provider))
}

export function isMockMode() {
  return getLLMConfig().provider === 'mock'
}

export async function callLLMForText(userMessage, systemPrompt) {
  const { provider, apiKey, model, proxyUrl } = getLLMConfig()
  const providerDef = getProviderDef(provider)
  if (!providerDef) throw new Error(`Unknown provider: ${provider}`)
  if (provider !== 'mock' && !apiKey) throw new Error('API key not configured.')

  const proxy = proxyUrl || DEFAULT_PROXY

  if (providerDef.format === 'anthropic') {
    const res = await fetch(proxy, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-target-url': providerDef.endpoint,
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, system: systemPrompt, messages: [{ role: 'user', content: userMessage }], max_tokens: 4096, temperature: 0.3 }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `Anthropic error ${res.status}`)
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n')
  }

  const targetUrl = providerDef.id === 'gemini'
    ? `${providerDef.endpoint}/v1beta/models/${model}:generateContent?key=${apiKey}`
    : providerDef.endpoint

  const headers = { 'Content-Type': 'application/json', 'x-target-url': targetUrl }
  if (providerDef.id !== 'gemini') headers['Authorization'] = `Bearer ${apiKey}`

  let body
  if (providerDef.id === 'gemini') {
    body = {
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
      generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
    }
  } else {
    body = { model, temperature: 0.3, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }] }
  }

  const res = await fetch(proxy, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `${providerDef.name} error ${res.status}`)

  if (providerDef.id === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return data.choices?.[0]?.message?.content || ''
}

export async function testConnection() {
  const { provider, apiKey, model, proxyUrl } = getLLMConfig()
  const providerDef = getProviderDef(provider)
  if (!providerDef) throw new Error(`Unknown provider: ${provider}`)

  if (provider === 'mock') {
    await new Promise(r => setTimeout(r, 600))
    return { text: 'OK (mock)', latencyMs: 600 }
  }

  if (!apiKey) throw new Error('No API key configured.')
  const proxy = proxyUrl || DEFAULT_PROXY
  const start = Date.now()

  if (providerDef.format === 'anthropic') {
    const res = await fetch(proxy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-target-url': providerDef.endpoint, 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 10, messages: [{ role: 'user', content: 'Say OK' }] }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `Anthropic error ${res.status}`)
    return { text: data.content?.[0]?.text || 'OK', latencyMs: Date.now() - start }
  }

  let targetUrl = providerDef.endpoint
  if (provider === 'gemini') targetUrl = `${providerDef.endpoint}/v1beta/models/${model}:generateContent?key=${apiKey}`
  const headers = { 'Content-Type': 'application/json', 'x-target-url': targetUrl }
  if (provider !== 'gemini') headers['Authorization'] = `Bearer ${apiKey}`

  let body = provider === 'gemini'
    ? { contents: [{ parts: [{ text: 'Say OK' }] }], generationConfig: { maxOutputTokens: 10 } }
    : { model, max_tokens: 10, messages: [{ role: 'user', content: 'Say OK' }] }

  const res = await fetch(proxy, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `${providerDef.name} error ${res.status}`)

  const text = provider === 'gemini'
    ? data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK'
    : data.choices?.[0]?.message?.content || 'OK'
  return { text: text.trim(), latencyMs: Date.now() - start }
}
