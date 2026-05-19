import { METHODS } from '../sources/index.js'
import tracer from '../feedback/tracer.js'
import { isMockMode, callLLMForText } from '../utils/llm.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Static analysis for real LLM mode ─────────────────────────

function analyzeStaticQuality(skillMd) {
  const text = skillMd.toLowerCase()
  const score = (keywords, weight = 10) => {
    const hits = keywords.filter(k => text.includes(k)).length
    return Math.round(Math.min(100, (hits / keywords.length) * 100 * weight / 10))
  }
  return {
    contract:     score(['precondition', 'postcondition', 'input:', 'output:', 'returns', 'type signature', 'interface', 'parameter'], 10),
    env:          score(['pip install', 'apt-get', 'requirements', 'setup', 'dependency', 'environment', 'install'], 10),
    grounding:    score(['source:', 'section', 'line', 'from ', 'chapter', 'extracted from', 'grounded', 'see '], 10),
    procedure:    score(['1.', '2.', '3.', 'step', 'first', 'then', 'finally', 'procedure', 'workflow'], 10),
    constraints:  score(['constraint', 'limit', 'range', 'must', 'only', 'never', 'error:', 'raises', 'validate'], 10),
    safety:       score(['warning', 'caution', 'do not', 'avoid', 'sensitive', 'sanitize', 'authorize', 'permission'], 10),
  }
}

// ── Build system prompt for real LLM skill generation ─────────

function buildSystemPrompt(method, setting) {
  const settingNote = setting === 'task-conditioned'
    ? 'The downstream task is provided — generate a skill focused specifically on that task.'
    : 'No downstream task is provided — generate a reusable skill library entry that works across tasks for this domain.'

  const methodPrompts = {
    naivePrompt: 'Generate a SKILL.md directly from the source material. Include usage, parameters, and setup.',
    evoSkill: 'Generate an initial skill, then add an evolved section noting what was refined. Show the evolution process with 3 cycles.',
    skillNet: 'Build a skill with strong grounding: reference specific source files and line numbers. Include a skill network connections section.',
    skillCreator: 'Focus on interface contracts: define precise preconditions, postconditions, and type signatures. Use test-case feedback to refine constraints.',
    skillSeekers: 'Search from 3 perspectives: code structure, dependency chain, and usage patterns. Ground every parameter and step in the source. Add safety notes.',
  }

  return `You are a skill generation AI implementing the ${METHODS[method.id]?.name || method} method from SkillGenBench.

${settingNote}

Method instruction: ${methodPrompts[method.id] || 'Generate a well-structured SKILL.md artifact.'}

Generate a complete SKILL.md file in markdown. Include:
- Description
- Interface / Parameters
- Setup / Environment
- Procedure / Steps
- Constraints / Safety notes
- Example usage

Output ONLY the SKILL.md content — no preamble or explanation.`
}

// ── Mock trace events for each method ─────────────────────────

async function runMethodTrace(method, source, setting) {
  const isRepo = source.type === 'repository'
  const artifactCount = isRepo ? 12 : 6

  const placeholders = {
    '{count}': artifactCount,
    '{n}': isRepo ? 8 : 5,
    '{edges}': isRepo ? 14 : 9,
    '{e}': method.staticScores.env,
    '{g}': method.staticScores.grounding,
    '{s}': method.staticScores.safety,
    '{c}': method.staticScores.contract,
    '{f}': Math.round((method.staticScores.contract + method.staticScores.grounding) / 2),
    '{p}': isRepo ? 5 : 8,
    '{q}': isRepo ? 3 : 6,
    '{tc1}': isRepo ? 'basic invocation with minimal params' : 'standard API call with required fields',
    '{r1}': isRepo ? '⚠ FAIL' : '✓ PASS',
    '{msg1}': isRepo ? 'Missing environment dependency' : 'Correct return schema',
    '{tc2}': isRepo ? 'type-checked invocation with all params' : 'edge case: empty result set',
    '{r2}': '✓ PASS',
    '{msg2}': isRepo ? 'All parameters correctly resolved' : 'Empty list returned gracefully',
  }

  const steps = method.traceSteps
  for (const [event, template] of steps) {
    const text = template.replace(/\{[a-z_0-9]+\}/g, m => placeholders[m] || m)
    await sleep(350 + Math.random() * 250)
    tracer.publish(event, text)
  }
}

// ── Mock execution trials ───────────────────────────────────────

async function runMockTrials(source, method) {
  const trials = source.mockSkills[method.id]?.trials || []
  const passAt3 = method.passAt3[source.type === 'repository' ? 'repo' : 'doc']
  const passCount = trials.filter(t => t.pass).length

  tracer.publish('layer:execution', 'Loading generated skill into isolated execution environment...')
  await sleep(400)

  const trialResults = []
  for (let i = 0; i < trials.length; i++) {
    await sleep(500 + Math.random() * 300)
    const t = trials[i]
    const icon = t.pass ? '✓ PASS' : '✗ FAIL'
    const cls = t.pass ? 'layer:feedback' : 'layer:execution'
    tracer.publish(cls, `Trial ${i + 1}/3: ${icon} — ${t.msg}`)
    trialResults.push(t)
  }

  await sleep(300)
  const anyPass = trialResults.some(t => t.pass)
  tracer.publish('layer:feedback', `pass@3 score: ${passAt3.toFixed(1)}% (paper benchmark across 187 tasks, ${source.domain} domain)`)
  tracer.publish(anyPass ? 'agent:complete' : 'layer:feedback',
    anyPass ? `Skill execution: at least one trial passed. Instance counts toward pass@3.` :
              `Skill execution: all trials failed. This instance is in the ${(100 - passAt3).toFixed(0)}% failure mass — typical for ${source.type === 'repository' ? 'repository-grounded' : 'document-grounded'} tasks with this method.`)

  return { trialResults, passAt3, anyPass }
}

// ── Static diagnostics output ──────────────────────────────────

async function runStaticDiagnostics(method) {
  await sleep(300)
  tracer.publish('layer:feedback', 'Running static skill diagnostics (8 automated rule-based checks)...')
  await sleep(400)
  const s = method.staticScores
  tracer.publish('layer:feedback',
    `Static scores — Contract: ${s.contract}/100 · Env: ${s.env}/100 · Grounding: ${s.grounding}/100 · Procedure: ${s.procedure}/100 · Constraints: ${s.constraints}/100 · Safety: ${s.safety}/100`)
  const overall = Math.round(Object.values(s).reduce((a, b) => a + b, 0) / 6)
  tracer.publish('layer:feedback', `Overall static quality: ${overall}/100. Dynamic execution is the decisive metric.`)
}

// ── Build LLM generation prompt ────────────────────────────────

function buildUserMessage(source, setting) {
  const taskSection = setting === 'task-conditioned'
    ? `\n## Downstream Task\nTitle: ${source.task.title}\nDescription: ${source.task.description}\nInput: ${source.task.input}\nExpected output: ${source.task.expectedOutput}`
    : ''
  return `## Source: ${source.name} (${source.type === 'repository' ? 'Repository-Grounded' : 'Document-Grounded'})
Domain: ${source.domain}

${source.sourceContent}${taskSection}

Generate a SKILL.md artifact for this source.`
}

// ── Main pipeline entry point ──────────────────────────────────

export async function runPipeline(source, method, setting) {
  tracer.clearLogs()
  tracer.publish('agent:start', { source: source.name, method: method.name, setting })
  tracer.publish('layer:info', `SkillGenBench pipeline started — Source: ${source.name} · Method: ${method.name} · Setting: ${setting}`)
  tracer.publish('layer:info', `Source type: ${source.type === 'repository' ? 'Repository-Grounded' : 'Document-Grounded'} · Domain: ${source.domain}`)

  await sleep(300)

  // Stage 1: Knowledge graph construction
  tracer.publish('layer:info', 'Stage 1: Constructing knowledge graph from source materials...')
  await sleep(500)

  if (source.type === 'repository') {
    tracer.publish('layer:info', 'Repository-grounded: extracting entity-relation triples from code structure, configs, and scripts...')
    await sleep(400)
    tracer.publish('layer:info', 'Procedures implicit in call relations and entry scripts — latent workflow recovery required.')
  } else {
    tracer.publish('layer:info', 'Document-grounded: extracting procedures from long-form text, conditional branches, and ordered steps...')
    await sleep(400)
    tracer.publish('layer:info', 'Procedures explicit but distributed across sections — integration required for unified skill.')
  }

  await sleep(300)
  tracer.publish('layer:info', 'Stage 2: Generating task scenarios from knowledge graph...')
  await sleep(400)

  const taskNote = setting === 'task-conditioned'
    ? `Task-conditioned: task revealed — "${source.task.title}". Targeted distillation mode.`
    : 'Task-agnostic: no downstream task visible — building reusable skill library. Cross-task abstraction required.'
  tracer.publish('layer:info', taskNote)

  await sleep(300)
  tracer.publish('layer:execution', `Stage 3: Running skill generation via ${method.name}...`)

  let skillMd
  let staticScores

  if (isMockMode()) {
    await runMethodTrace(method, source, setting)
    skillMd = source.mockSkills[method.id]?.skillMd || '# Skill\n\nGenerated skill artifact.\n'
    staticScores = method.staticScores
  } else {
    // Real LLM mode
    tracer.publish('layer:execution', 'Sending source material to LLM for skill generation...')
    try {
      const systemPrompt = buildSystemPrompt(method, setting)
      const userMessage = buildUserMessage(source, setting)
      const rawText = await callLLMForText(userMessage, systemPrompt)
      skillMd = rawText.trim()
      await sleep(300)
      tracer.publish('layer:execution', 'Skill artifact received from LLM. Analyzing quality...')
      staticScores = analyzeStaticQuality(skillMd)
    } catch (err) {
      tracer.publish('agent:error', `LLM call failed: ${err.message}`)
      throw err
    }
  }

  // Stage 4: Static diagnostics
  tracer.publish('layer:feedback', 'Stage 4: Running static skill diagnostics...')
  if (isMockMode()) {
    await runStaticDiagnostics(method)
  } else {
    await sleep(300)
    const s = staticScores
    tracer.publish('layer:feedback',
      `Static scores — Contract: ${s.contract}/100 · Env: ${s.env}/100 · Grounding: ${s.grounding}/100 · Procedure: ${s.procedure}/100 · Constraints: ${s.constraints}/100 · Safety: ${s.safety}/100`)
  }

  // Stage 5: Execution testing
  tracer.publish('layer:execution', 'Stage 5: Executing skill against test cases (pass@3 evaluation)...')
  let trialResults, passAt3, anyPass

  if (isMockMode()) {
    const execResult = await runMockTrials(source, method)
    trialResults = execResult.trialResults
    passAt3 = execResult.passAt3
    anyPass = execResult.anyPass
  } else {
    // Simulated execution for real LLM mode
    passAt3 = method.passAt3[source.type === 'repository' ? 'repo' : 'doc']
    trialResults = [
      { pass: false, msg: 'Real execution requires containerized environment — showing benchmark reference data.' },
      { pass: false, msg: 'Execution harness not available in browser — skill evaluated via static analysis only.' },
    ]
    anyPass = false
    tracer.publish('layer:feedback', `Reference pass@3 (paper benchmark): ${passAt3.toFixed(1)}% for ${method.name} on ${source.type === 'repository' ? 'Code Repo' : 'Doc'} tasks`)
  }

  tracer.publish('agent:complete', { method: method.name, source: source.name, passAt3, anyPass })

  return {
    skillMd,
    staticScores,
    trialResults,
    passAt3,
    anyPass,
    source,
    method,
    setting,
  }
}
