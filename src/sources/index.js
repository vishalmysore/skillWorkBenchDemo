// ─────────────────────────────────────────────────────────────────
// Generation method definitions
// Scores from SkillGenBench paper (Table 3, 0-100 scale)
// ─────────────────────────────────────────────────────────────────

export const METHODS = {
  naivePrompt: {
    id: 'naivePrompt', name: 'Naive Prompt', icon: '💬', color: '#6b7280',
    description: 'Direct prompting: sends source material with a skill generation instruction. Simple but limited environment and constraint coverage.',
    passAt3: { repo: 7.3, doc: 23.4 },
    staticScores: { contract: 54.8, env: 19.5, grounding: 51.5, procedure: 67.9, constraints: 34.6, safety: 70.3 },
    traceSteps: [
      ['layer:info', 'Naive Prompt: assembling source material into generation request...'],
      ['layer:info', 'Flattening {count} source artifacts into single context window...'],
      ['layer:execution', 'Sending source material with skill generation instruction...'],
      ['layer:execution', 'Model generating SKILL.md from full context...'],
      ['layer:feedback', 'Extracting skill artifact from response...'],
    ],
  },
  evoSkill: {
    id: 'evoSkill', name: 'EvoSkill', icon: '🧬', color: '#f59e0b',
    description: 'Evolutionary skill discovery: generates an initial skill then refines it through fitness-scored mutation and crossover cycles.',
    passAt3: { repo: 9.8, doc: 26.6 },
    staticScores: { contract: 50.1, env: 32.9, grounding: 54.5, procedure: 59.3, constraints: 34.2, safety: 69.0 },
    traceSteps: [
      ['layer:info', 'EvoSkill: initializing evolutionary skill discovery...'],
      ['layer:info', 'Scanning source for latent procedure patterns...'],
      ['layer:execution', 'Generation Round 1: synthesizing initial skill candidate...'],
      ['layer:execution', 'Fitness evaluation — contract: {c}, grounding: {g}, environment: {e}...'],
      ['layer:execution', 'Generation Round 2: mutation — improving environment setup dependencies...'],
      ['layer:execution', 'Generation Round 3: crossover — merging best procedural patterns...'],
      ['layer:feedback', 'Evolution complete. Best candidate (fitness {f}) selected.'],
    ],
  },
  skillNet: {
    id: 'skillNet', name: 'SkillNet', icon: '🕸️', color: '#0ea5e9',
    description: 'Network-based skill creation: builds a skill knowledge graph, identifies reusable nodes, and synthesizes the optimal skill configuration.',
    passAt3: { repo: 11.4, doc: 23.4 },
    staticScores: { contract: 65.5, env: 52.9, grounding: 70.7, procedure: 60.9, constraints: 35.8, safety: 68.9 },
    traceSteps: [
      ['layer:info', 'SkillNet: constructing skill knowledge network from source...'],
      ['layer:info', 'Identified {n} skill nodes across source files...'],
      ['layer:execution', 'Evaluating node reusability scores...'],
      ['layer:execution', 'Building dependency graph: {edges} edges between skill nodes...'],
      ['layer:execution', 'Selecting optimal skill configuration (highest connectivity score)...'],
      ['layer:execution', 'Grounding environment setup from pinned dependency manifests...'],
      ['layer:feedback', 'Network synthesis complete. Environment score: {e}/100, Grounding: {g}/100.'],
    ],
  },
  skillCreator: {
    id: 'skillCreator', name: 'SkillCreator', icon: '🔨', color: '#ef4444',
    description: 'Contract-based skill creation: defines interface contracts first, then generates an implementation and iteratively refines via test-case feedback.',
    passAt3: { repo: 10.6, doc: 25.0 },
    staticScores: { contract: 69.1, env: 25.8, grounding: 49.8, procedure: 69.5, constraints: 38.1, safety: 71.9 },
    traceSteps: [
      ['layer:info', 'SkillCreator: extracting interface contracts from source...'],
      ['layer:info', 'Identified {p} preconditions, {q} postconditions from source spec...'],
      ['layer:execution', 'Generating initial skill with typed interface contract...'],
      ['layer:execution', 'Synthesizing test case 1: {tc1}...'],
      ['layer:execution', 'Test case 1 result: {r1} — {msg1}'],
      ['layer:execution', 'Revising procedure to satisfy failed constraints...'],
      ['layer:execution', 'Test case 2 result: {r2} — {msg2}'],
      ['layer:feedback', 'Contract verification complete. Constraint score: {c}/100.'],
    ],
  },
  skillSeekers: {
    id: 'skillSeekers', name: 'SkillSeekers', icon: '🔍', color: '#10b981',
    description: 'Multi-perspective skill search: mines repositories, documentation, and PDFs from three independent perspectives and synthesizes a grounded skill.',
    passAt3: { repo: 16.3, doc: 25.0 },
    staticScores: { contract: 44.4, env: 23.2, grounding: 67.2, procedure: 44.6, constraints: 15.1, safety: 72.8 },
    traceSteps: [
      ['layer:info', 'SkillSeekers: initializing multi-perspective source search...'],
      ['layer:execution', 'Perspective 1 (Code Structure): tracing entry points and call graphs...'],
      ['layer:execution', 'Perspective 2 (Dependency Chain): mapping import graph and env requirements...'],
      ['layer:execution', 'Perspective 3 (Usage Patterns): mining README, tests, examples for invocation patterns...'],
      ['layer:execution', 'Cross-referencing {n} source artifacts across all perspectives...'],
      ['layer:execution', 'Synthesizing perspectives into unified grounded skill...'],
      ['layer:feedback', 'Multi-perspective synthesis complete. Grounding: {g}/100, Safety: {s}/100.'],
    ],
  },
}

// ─────────────────────────────────────────────────────────────────
// Mock SKILL.md templates per method style
// ─────────────────────────────────────────────────────────────────

function skillNaive(name, domain, params, setup, usage, returnDesc) {
  return `# ${name}

${domain} processing skill — generated via direct prompting.

## Usage
\`\`\`python
${usage}
\`\`\`

## Parameters
${params}

## Returns
${returnDesc}

## Setup
\`\`\`bash
${setup}
\`\`\`

## Notes
Generated from source material. Interface may require adjustment for edge cases.
`
}

function skillEvo(name, domain, params, setup, usage, returnDesc, iterations) {
  return `# ${name} [EvoSkill v${iterations}]

${domain} skill evolved over ${iterations} refinement cycles.
Fitness-scored mutation improved environment coverage and parameter binding.

## Interface
\`\`\`python
${usage}
\`\`\`

## Environment
\`\`\`bash
${setup}
\`\`\`

## Parameters (Evolved)
${params}
Cycles 1→${iterations}: added typed params, improved error propagation, expanded format support.

## Returns
${returnDesc}

## Known Limitations (from evolution log)
- Batch processing not yet evolved — single item per call
- Windows: check platform-specific dependency notes in source README
`
}

function skillNet_(name, domain, sourceRef, params, setup, usage, returnDesc, networkPos) {
  return `# ${name}

**Source**: \`${sourceRef}\`
**Network position**: ${networkPos}

## Environment Setup
\`\`\`bash
# Pinned dependencies from source manifest
${setup}
\`\`\`

## Interface
\`\`\`python
${usage}
\`\`\`

## Grounded Parameters
*Extracted from source signatures and configuration:*
${params}

## Procedure
${returnDesc}

## Skill Network Connections
- Upstream: input validation skill
- Downstream: output formatting skill, batch orchestration skill
`
}

function skillCreator_(name, domain, params, setup, usage, prePost, constraints) {
  return `# ${name}

## Interface Contract

### Preconditions
${prePost.pre}

### Postconditions
${prePost.post}

### Type Signature
\`\`\`python
${usage}
\`\`\`

## Implementation
\`\`\`python
${setup}
\`\`\`

## Constraint Verification
${constraints}
`
}

function skillSeekers_(name, domain, sourceRef, params, procedure, safety) {
  return `# ${name}

**Sourced from**: ${sourceRef}

## Grounded Description
${domain} skill distilled from source via three-perspective search. Procedures extracted from code structure, dependency chain, and usage patterns.

## Core Procedure
*Extracted from source usage patterns and README:*

${procedure}

## Source-Grounded Parameters
*From source signatures and config:*
${params}

## Safety Notes
${safety}
`
}

// ─────────────────────────────────────────────────────────────────
// SOURCES — Repository-grounded (3) + Document-grounded (3)
// ─────────────────────────────────────────────────────────────────

const SOURCES = {

  // ── REPOSITORY-GROUNDED ──────────────────────────────────────

  'audio-repo': {
    id: 'audio-repo',
    name: 'Audio Processing Pipeline',
    shortName: 'audio-pipeline',
    type: 'repository',
    domain: 'Audio',
    icon: '🎵',
    color: '#7c3aed',
    description: 'FFmpeg-based audio library for format conversion, normalization, and filtering. 2,400 LOC across core.py, pipeline.py, config.yaml.',
    sourceContent: `# audio-pipeline v2.1 — Key Source Files

## core.py (lines 1-150)
class AudioProcessor:
    def __init__(self, config_path=None, log_level='INFO'):
        ...
    def convert(self, input_path: str, output_path: str, format: str,
                bitrate: int = 128, sample_rate: int = 44100,
                channels: int = 2, filters: list = []) -> ConvertResult:
        """Converts audio file via FFmpeg. Raises InputError, FormatError, FFmpegError."""
        ...
    def validate_input(self, path: str) -> bool: ...
    def normalize(self, input_path: str, target_lufs: float = -23.0) -> NormalizeResult: ...
    def batch(self, jobs: list[dict]) -> list[ConvertResult]: ...

SUPPORTED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma']

## config.yaml
defaults:
  bitrate: 128
  sample_rate: 44100
  channels: 2
  auto_create_dirs: true
rate_limit:
  max_concurrent: 4
ffmpeg:
  binary: ffmpeg
  timeout_seconds: 300

## requirements.txt
audio-pipeline==2.1.3
pydub==0.25.1

## System dependency: FFmpeg 4.4+`,
    task: {
      title: 'Batch WAV-to-MP3 Conversion with Normalization',
      description: 'Convert all WAV files in an input directory to MP3 at 192kbps, applying LUFS normalization to -23dB. Return list of output paths and any errors.',
      input: 'input_dir: str, output_dir: str, bitrate: int = 192, target_lufs: float = -23.0',
      expectedOutput: 'List[dict] with keys: input, output, success, error',
    },
    mockSkills: {
      naivePrompt: {
        skillMd: skillNaive(
          'Audio Conversion Skill',
          'Audio file format conversion',
          '- `input_path` (str): Input audio file\n- `output_path` (str): Destination path\n- `output_format` (str): mp3, wav, or flac\n- `bitrate` (int): Output bitrate kbps',
          'pip install audio-pipeline\n# Also requires FFmpeg',
          'from audio_pipeline import process_audio\nresult = process_audio(input_path, output_path, format=output_format)',
          'Dict with `success` (bool) and `output_path` (str).'
        ),
        trials: [
          { pass: false, msg: 'Interface mismatch: skill uses `process_audio()` but library exposes `AudioProcessor.convert()`. NameError on execution.' },
          { pass: false, msg: 'FFmpeg not found in PATH. Environment setup incomplete — system dependency not installed.' },
          { pass: false, msg: 'Missing `bitrate` parameter passed as positional arg; library expects keyword argument. TypeError.' },
        ],
      },
      evoSkill: {
        skillMd: skillEvo(
          'AudioConvert',
          'Audio format conversion with normalization',
          '- `input_path`: str — source file\n- `output_path`: str — destination\n- `format`: str — mp3|wav|flac|ogg|aac (evolved: expanded from mp3|wav)\n- `bitrate`: int = 128 kbps\n- `normalize`: bool = False (evolved: added in cycle 2)\n- `target_lufs`: float = -23.0 (evolved: added in cycle 3)',
          'pip install audio-pipeline>=2.0.0\napt-get install -y ffmpeg  # system dependency added in cycle 1',
          'from audio_pipeline.core import AudioProcessor\nproc = AudioProcessor()\nresult = proc.convert(\n    input_path=input_path,\n    output_path=output_path,\n    format=format,\n    bitrate=bitrate\n)\nif normalize:\n    proc.normalize(output_path, target_lufs)',
          '`ConvertResult(success, output_path, duration, error)` — added duration in cycle 2.',
          3
        ),
        trials: [
          { pass: false, msg: 'FFmpeg binary not resolved at runtime — apt-get install not available in this environment.' },
          { pass: true,  msg: 'Skill executed successfully with pre-installed FFmpeg. Output matched expected schema. Duration: 1.8s.' },
          { pass: false, msg: 'normalize() called after convert() but uses separate output_path — skill does not chain correctly for batch use.' },
        ],
      },
      skillNet: {
        skillMd: skillNet_(
          'AudioProcessor::convert',
          'Audio',
          'audio_pipeline/core.py:AudioProcessor.convert (lines 45–112)',
          '- `input_path`: str — absolute or relative path to source file\n- `output_path`: str — destination path (dirs auto-created per config.yaml:auto_create_dirs)\n- `format`: str — one of SUPPORTED_FORMATS constant (core.py:23)\n- `bitrate`: int = 128 — kbps, 32–320 for lossy, ignored for lossless\n- `sample_rate`: int = 44100 — Hz\n- `channels`: int = 2 — 1=mono, 2=stereo\n- `filters`: list = [] — FFmpeg filter chain entries',
          '# Pinned from requirements.txt\npip install audio-pipeline==2.1.3\npip install pydub==0.25.1\n\n# System (pinned to repo tested version)\napt-get install -y ffmpeg=4.4.2-0ubuntu0.1',
          'from audio_pipeline.core import AudioProcessor\n\nprocessor = AudioProcessor(\n    config_path=None,   # loads ./config.yaml if present\n    log_level="INFO"\n)\n\nresult = processor.convert(\n    input_path=input_path,\n    output_path=output_path,\n    format=format,\n    bitrate=bitrate,\n    sample_rate=sample_rate,\n    channels=channels,\n    filters=filters\n)',
          '1. Instantiate `AudioProcessor` (loads config.yaml defaults)\n2. Call `processor.validate_input(input_path)` — raises InputError on unsupported format\n3. Call `processor.convert()` with all parameters\n4. Check `result.success`; inspect `result.stderr` on failure',
          'Core conversion node → connects to normalize_node, batch_processor_node'
        ),
        trials: [
          { pass: false, msg: 'Version pin conflict: ffmpeg=4.4.2-0ubuntu0.1 not available in evaluation environment. Dependency resolution failed.' },
          { pass: true,  msg: 'Skill executed with compatible FFmpeg version. Correct output format, proper error propagation tested.' },
          { pass: false, msg: 'batch() method not invoked — skill generates single-file skill only, task requires batch processing loop.' },
        ],
      },
      skillCreator: {
        skillMd: skillCreator_(
          'Audio Batch Converter',
          'Audio',
          '- `input_dir`: str — directory containing WAV files\n- `output_dir`: str — destination directory\n- `bitrate`: int = 192 — kbps\n- `target_lufs`: float = -23.0 — normalization target',
          'from audio_pipeline.core import AudioProcessor\nimport os\n\nproc = AudioProcessor()\nresults = []\nfor wav in Path(input_dir).glob("*.wav"):\n    out = Path(output_dir) / wav.with_suffix(".mp3").name\n    r = proc.convert(str(wav), str(out), format="mp3", bitrate=bitrate)\n    if normalize:\n        proc.normalize(str(out), target_lufs)\n    results.append({"input": str(wav), "output": str(out), "success": r.success, "error": r.error})\nreturn results',
          {
            pre: '- `input_dir` exists and is readable\n- `output_dir` is writable (created if absent)\n- `bitrate` in range [32, 320]\n- FFmpeg binary accessible in PATH',
            post: '- Returns List[dict] with keys: input, output, success, error\n- `success=True` iff conversion completed without error\n- `error=None` on success; human-readable string on failure',
          },
          '- ✓ Format hardcoded to mp3 — task requirement\n- ✓ Batch loop handles empty directory (returns [])\n- ⚠ FFmpeg PATH not validated — check environment before invocation\n- ✓ output_dir created automatically if missing'
        ),
        trials: [
          { pass: false, msg: 'Missing `from pathlib import Path` import in skill. NameError: "Path" is not defined.' },
          { pass: true,  msg: 'Skill executed correctly. Batch loop, normalization, and error collection all function as specified.' },
          { pass: false, msg: 'normalize parameter not included in skill signature — implicit True, not parameterizable.' },
        ],
      },
      skillSeekers: {
        skillMd: skillSeekers_(
          'audio-pipeline Conversion Skill',
          'Audio format conversion and normalization',
          'audio-pipeline repo — `core.py` (lines 45–150), `config.yaml`, `README.md` "Quick Start" (lines 12–45)',
          '- `input_path`: str — from `core.py:47` signature\n- `output_path`: str — auto-creates dirs per `config.yaml:auto_create_dirs=true`\n- `format`: str — one of `SUPPORTED_FORMATS` constant (`core.py:23`): mp3|wav|flac|ogg|aac|m4a|wma\n- `bitrate`: int — default 128 from `config.yaml:defaults.bitrate`\n- `sample_rate`: int — default 44100 from `config.yaml:defaults.sample_rate`\n- `channels`: int — default 2 from `config.yaml:defaults.channels`',
          '1. Import and instantiate (`README.md` line 12):\n   ```python\n   from audio_pipeline.core import AudioProcessor\n   proc = AudioProcessor()  # or AudioProcessor(config_path="config.yaml")\n   ```\n2. Convert a file (`README.md` lines 18–22):\n   ```python\n   result = proc.convert(input_path, output_path, format="mp3", bitrate=192)\n   ```\n3. Normalize if required (`core.py:normalize()` line 98):\n   ```python\n   proc.normalize(output_path, target_lufs=-23.0)\n   ```\n4. Inspect result:\n   ```python\n   if result.success: print(result.output_path)\n   else: print(result.error)\n   ```',
          '- ⚠ No hardcoded paths — always pass as parameters\n- ⚠ Do not expose `result.stderr` to end users without sanitization\n- ⚠ Respect `config.yaml:rate_limit.max_concurrent=4` for batch jobs\n- ⚠ Do not use `wma` format on non-Windows — FFmpeg support varies'
        ),
        trials: [
          { pass: false, msg: 'Skill procedure is non-callable — distilled as documentation not a callable function. Executor cannot invoke.' },
          { pass: true,  msg: 'Skill adapted to callable form by executor. Correct parameters and output structure.' },
          { pass: true,  msg: 'Second trial: normalization step executed correctly. Output LUFS within tolerance.' },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────

  'web-repo': {
    id: 'web-repo',
    name: 'Web Automation Framework',
    shortName: 'webrunner',
    type: 'repository',
    domain: 'Web',
    icon: '🌐',
    color: '#0284c7',
    description: 'Playwright-based web automation library with session management, anti-detection, and structured data extraction. 3,100 LOC.',
    sourceContent: `# webrunner v1.4 — Key Source Files

## runner.py
class WebRunner:
    def __init__(self, headless=True, proxy=None, timeout=30):
        self.browser = None  # initialized on context entry
    async def __aenter__(self): ...
    async def __aexit__(self, *args): ...
    async def navigate(self, url: str, wait_for: str = 'networkidle') -> Page: ...
    async def extract(self, page: Page, selectors: dict) -> dict: ...
    async def fill_form(self, page: Page, fields: dict) -> None: ...
    async def screenshot(self, page: Page, path: str) -> None: ...
    async def wait_for_element(self, page: Page, selector: str, timeout=10): ...

class Page:  # wrapper around playwright Page
    url: str
    title: str
    async def evaluate(self, js: str) -> Any: ...

## selectors.py
class SelectorMap:
    def from_yaml(path: str) -> SelectorMap: ...
    def add(name: str, selector: str, multiple: bool = False): ...

## config.yaml
browser:
  headless: true
  viewport: {width: 1280, height: 720}
  user_agent: "Mozilla/5.0 ..."
timeouts:
  navigation: 30
  element: 10
  network_idle: 5000

## requirements.txt
webrunner==1.4.2
playwright==1.41.0`,
    task: {
      title: 'Product Price Scraper with Dynamic Content',
      description: 'Navigate to a product URL, wait for dynamic price element to load, extract price, availability status, and product title. Return structured dict.',
      input: 'url: str, selectors: dict = {"price": ".price", "title": "h1", "availability": ".stock-status"}',
      expectedOutput: 'dict with keys: price, title, availability, url, success',
    },
    mockSkills: {
      naivePrompt: {
        skillMd: skillNaive(
          'Web Scraper Skill',
          'Web page data extraction',
          '- `url` (str): Target page URL\n- `selectors` (dict): CSS selector map for data extraction',
          'pip install webrunner playwright\npython -m playwright install chromium',
          'from webrunner import WebRunner\nimport asyncio\nasync def scrape(url, selectors):\n    async with WebRunner() as runner:\n        page = await runner.navigate(url)\n        return await runner.extract(page, selectors)\nresult = asyncio.run(scrape(url, selectors))',
          'Dict with extracted values keyed by selector names.'
        ),
        trials: [
          { pass: false, msg: 'asyncio.run() inside skill conflicts with existing event loop in executor environment. RuntimeError.' },
          { pass: false, msg: 'Playwright Chromium not installed in evaluation container. Skill missing `playwright install` step.' },
          { pass: false, msg: 'No wait_for_element call — dynamic content not loaded before extraction. Empty results.' },
        ],
      },
      evoSkill: {
        skillMd: skillEvo(
          'DynamicPageScraper',
          'Dynamic web page scraping with wait logic',
          '- `url`: str — target page\n- `selectors`: dict — CSS selector map\n- `wait_selector`: str = None — wait for this element before extraction (evolved: cycle 2)\n- `timeout`: int = 30 — navigation timeout seconds\n- `headless`: bool = True — browser headless mode',
          'pip install webrunner==1.4.2 playwright==1.41.0\npython -m playwright install chromium  # added in cycle 1',
          'import asyncio\nfrom webrunner import WebRunner\n\nasync def _scrape():\n    async with WebRunner(headless=headless, timeout=timeout) as runner:\n        page = await runner.navigate(url, wait_for="networkidle")\n        if wait_selector:\n            await runner.wait_for_element(page, wait_selector)\n        return await runner.extract(page, selectors)\n\nreturn asyncio.get_event_loop().run_until_complete(_scrape())',
          'dict keyed by selector names with extracted text values.',
          3
        ),
        trials: [
          { pass: false, msg: 'event_loop.run_until_complete() deprecated in Python 3.12. Environment uses asyncio.run() pattern.' },
          { pass: true,  msg: 'Skill executed correctly with dynamic wait. All three selector fields extracted successfully.' },
          { pass: false, msg: 'Missing success/error fields in return dict. Schema mismatch with task expected output.' },
        ],
      },
      skillNet: {
        skillMd: skillNet_(
          'WebRunner::navigate+extract',
          'Web',
          'webrunner/runner.py:WebRunner.navigate+extract (lines 34–89)',
          '- `url`: str — fully qualified URL\n- `selectors`: dict — name→CSS selector map\n- `wait_for`: str = "networkidle" — Playwright wait condition\n- `wait_element`: str = None — additional CSS selector to wait before extraction\n- `timeout`: int = 30 — navigation timeout from config.yaml:timeouts.navigation\n- `headless`: bool = True — from config.yaml:browser.headless',
          '# Pinned from requirements.txt\npip install webrunner==1.4.2\npip install playwright==1.41.0\npython -m playwright install chromium  # browser binary',
          'import asyncio\nfrom webrunner.runner import WebRunner\n\nasync def run_scrape():\n    async with WebRunner(headless=headless, timeout=timeout) as runner:\n        page = await runner.navigate(url, wait_for=wait_for)\n        if wait_element:\n            await runner.wait_for_element(page, wait_element, timeout=10)\n        data = await runner.extract(page, selectors)\n        return {**data, "url": page.url, "success": True}\n\nreturn asyncio.run(run_scrape())',
          '1. Enter `WebRunner` async context (launches browser)\n2. `navigate(url, wait_for="networkidle")` — waits for page load\n3. Optionally wait for dynamic element via `wait_for_element()`\n4. `extract(page, selectors)` — returns dict of selector→text\n5. Exit context (browser closed automatically)',
          'Core scrape node → connects to form_filler_node, screenshot_node'
        ),
        trials: [
          { pass: true,  msg: 'Skill executed correctly. Dynamic content loaded before extraction. Correct return schema.' },
          { pass: false, msg: 'Second run: network timeout on test URL — not a skill defect, infrastructure issue.' },
          { pass: true,  msg: 'Third trial: successful extraction with wait_element parameter correctly applied.' },
        ],
      },
      skillCreator: {
        skillMd: skillCreator_(
          'Product Page Scraper',
          'Web',
          '- `url`: str — product page URL (must be fully qualified)\n- `selectors`: dict — keys: price, title, availability; values: CSS selectors\n- `timeout`: int = 30 — navigation timeout in seconds',
          'import asyncio\nfrom webrunner.runner import WebRunner\n\nasync def _extract():\n    async with WebRunner(headless=True) as runner:\n        page = await runner.navigate(url, wait_for="networkidle")\n        await runner.wait_for_element(page, selectors.get("price", ".price"), timeout=10)\n        data = await runner.extract(page, selectors)\n        return {"price": data.get("price"), "title": data.get("title"),\n                "availability": data.get("availability"), "url": url, "success": True}\n\ntry:\n    return asyncio.run(_extract())\nexcept Exception as e:\n    return {"success": False, "error": str(e), "url": url}',
          {
            pre: '- `url` is a valid, reachable HTTP/HTTPS URL\n- `selectors` contains at least one key-value pair\n- Network access available in execution environment\n- Playwright Chromium installed',
            post: '- Returns dict with keys: price, title, availability, url, success\n- `success=True` iff page loaded and all selectors extracted\n- On failure: `success=False` and `error` key present',
          },
          '- ✓ wait_for_element ensures dynamic content loaded before extraction\n- ✓ try/except wraps entire flow — no unhandled exceptions\n- ✓ return schema matches task specification exactly\n- ⚠ Playwright installation not verified in environment setup'
        ),
        trials: [
          { pass: false, msg: 'asyncio.run() creates new event loop — conflicts with executor environment. RuntimeError: cannot run nested event loop.' },
          { pass: false, msg: 'Same event loop conflict on retry with different asyncio strategy.' },
          { pass: false, msg: 'Third attempt: nest_asyncio workaround not in skill. Same failure mode.' },
        ],
      },
      skillSeekers: {
        skillMd: skillSeekers_(
          'webrunner Scrape Skill',
          'Dynamic web page extraction',
          'webrunner repo — `runner.py` (lines 1–120), `config.yaml`, `README.md` "Usage" section',
          '- `url`: str — from `runner.py:navigate()` line 34\n- `selectors`: dict — from `runner.py:extract()` line 67; name→CSS selector\n- `wait_for`: str — "networkidle"|"load"|"domcontentloaded" (`runner.py:36`)\n- `headless`: bool — default True from `config.yaml:browser.headless`\n- `timeout`: int — default 30 from `config.yaml:timeouts.navigation`',
          '1. Enter async context (`README.md` line 8):\n   ```python\n   async with WebRunner(headless=True) as runner:\n   ```\n2. Navigate and wait for content (`README.md` lines 12–15):\n   ```python\n   page = await runner.navigate(url, wait_for="networkidle")\n   await runner.wait_for_element(page, selectors["price"])  # dynamic wait\n   ```\n3. Extract data (`runner.py:extract()` line 67):\n   ```python\n   data = await runner.extract(page, selectors)\n   ```\n4. Return structured result with `url` and `success` fields.',
          '- ⚠ Always use async context manager — do not instantiate WebRunner directly\n- ⚠ Respect `config.yaml:browser.viewport` — do not override without reason\n- ⚠ Do not log page.evaluate() results — may contain sensitive data\n- ⚠ Handle TimeoutError from wait_for_element — element may not exist'
        ),
        trials: [
          { pass: true,  msg: 'Skill correctly grounded. Async context, dynamic wait, and extraction all function.' },
          { pass: false, msg: 'Return dict missing "success" field — skill procedure does not include schema wrapping.' },
          { pass: true,  msg: 'Executor adapted return schema. Core extraction logic correct and grounded.' },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────

  'security-repo': {
    id: 'security-repo',
    name: 'Vulnerability Scanner Toolkit',
    shortName: 'vulnscan',
    type: 'repository',
    domain: 'Security',
    icon: '🛡️',
    color: '#dc2626',
    description: 'Python security scanning toolkit for web vulnerability detection (XSS, SQLi, open ports, CVE lookup). 1,800 LOC.',
    sourceContent: `# vulnscan v0.9 — Key Source Files

## scanner.py
class VulnScanner:
    def __init__(self, target: str, timeout: int = 10, threads: int = 4):
        self.target = target
    def port_scan(self, ports: list = None, range: tuple = (1,1024)) -> list[PortResult]: ...
    def web_scan(self, paths: list = None, checks: list = ['xss','sqli','open-redirect']) -> list[VulnResult]: ...
    def cve_lookup(self, product: str, version: str) -> list[CVE]: ...
    def report(self, results: list, format: str = 'json') -> str: ...

class PortResult: port: int, open: bool, service: str, banner: str
class VulnResult: type: str, url: str, severity: str, payload: str, evidence: str
class CVE: id: str, score: float, description: str, published: str

## config.yaml
scan:
  default_ports: [21, 22, 80, 443, 3306, 5432, 8080, 8443]
  web_checks: [xss, sqli, open-redirect, path-traversal]
  user_agent: "VulnScanner/0.9"
  rate_limit_rps: 10`,
    task: {
      title: 'Web Vulnerability Assessment',
      description: 'Scan a target URL for XSS and SQL injection vulnerabilities on common paths. Return structured vulnerability report with severity scores.',
      input: 'target_url: str, paths: list = ["/", "/login", "/search", "/api"], checks: list = ["xss", "sqli"]',
      expectedOutput: 'dict with keys: target, vulnerabilities (list), scan_time, report_json',
    },
    mockSkills: {
      naivePrompt: {
        skillMd: skillNaive(
          'Web Vulnerability Scan Skill',
          'Web vulnerability detection',
          '- `target` (str): Target URL or hostname\n- `checks` (list): Vulnerability types to scan [xss, sqli, open-redirect]',
          'pip install vulnscan',
          'from vulnscan import VulnScanner\nscanner = VulnScanner(target)\nresults = scanner.web_scan(checks=checks)\nreturn scanner.report(results)',
          'JSON string with vulnerability findings.'
        ),
        trials: [
          { pass: false, msg: 'Missing authorization check — scanner used without verifying target is in scope. Execution rejected by harness.' },
          { pass: false, msg: 'rate_limit_rps not configured — scanner exceeded default rate, triggering WAF block on test target.' },
          { pass: false, msg: 'Return type is string not dict — task expects structured dict with vulnerabilities list and metadata.' },
        ],
      },
      evoSkill: {
        skillMd: skillEvo(
          'WebVulnScanner',
          'Web vulnerability detection with rate limiting',
          '- `target_url`: str — target URL (must be authorized for scanning)\n- `paths`: list = ["/", "/login", "/search"]\n- `checks`: list = ["xss", "sqli"] — vulnerability check types\n- `rate_limit`: int = 10 — requests per second (evolved: added in cycle 1)\n- `threads`: int = 4 — concurrent scan threads',
          'pip install vulnscan>=0.9.0',
          'from vulnscan.scanner import VulnScanner\nimport time\n\nscanner = VulnScanner(target_url, timeout=10, threads=threads)\nresults = scanner.web_scan(paths=paths, checks=checks)\nreport = scanner.report(results, format="json")\nimport json\nreturn {"target": target_url, "vulnerabilities": results, "report_json": report}',
          'dict with keys: target, vulnerabilities (list[VulnResult]), report_json (str)',
          2
        ),
        trials: [
          { pass: false, msg: 'VulnResult objects not JSON-serializable — evolution did not add serialization step.' },
          { pass: true,  msg: 'Skill executed with serialization fix. Correct vulnerability detection on test cases.' },
          { pass: false, msg: 'paths parameter not forwarded to web_scan() call in evolved skill. Scanned default paths only.' },
        ],
      },
      skillNet: {
        skillMd: skillNet_(
          'VulnScanner::web_scan',
          'Security',
          'vulnscan/scanner.py:VulnScanner.web_scan (lines 67–134)',
          '- `target`: str — hostname or URL (`scanner.py:__init__:11`)\n- `paths`: list — URL paths to probe (default: config.yaml:scan.default_paths)\n- `checks`: list — subset of scan.web_checks: [xss, sqli, open-redirect, path-traversal]\n- `timeout`: int = 10 — per-request timeout\n- `threads`: int = 4 — concurrent threads',
          '# Pinned dependency\npip install vulnscan==0.9.0\n# No system dependencies required',
          'from vulnscan.scanner import VulnScanner\nimport json, time\n\nstart = time.time()\nscanner = VulnScanner(target=target_url, timeout=timeout, threads=threads)\nvulns = scanner.web_scan(paths=paths, checks=checks)\nreport = scanner.report(vulns, format="json")\n\nreturn {\n    "target": target_url,\n    "vulnerabilities": [v.__dict__ for v in vulns],\n    "scan_time": round(time.time() - start, 2),\n    "report_json": report\n}',
          '1. Instantiate `VulnScanner(target, timeout, threads)`\n2. Call `web_scan(paths, checks)` — returns list[VulnResult]\n3. Serialize: `[v.__dict__ for v in vulns]` for JSON compatibility\n4. Generate report: `scanner.report(vulns, format="json")`\n5. Return structured dict matching task schema',
          'Primary scan node → connects to port_scan_node, cve_lookup_node, report_node'
        ),
        trials: [
          { pass: true,  msg: 'Skill executed correctly. Serialization, timing, and report generation all function as specified.' },
          { pass: true,  msg: 'Second trial: correct vulnerability detection. Schema matches task expected output exactly.' },
          { pass: false, msg: 'Third trial: different test target — scanner rate limit exceeded. Config not adjusted for this environment.' },
        ],
      },
      skillCreator: {
        skillMd: skillCreator_(
          'Web Vulnerability Assessment Skill',
          'Security',
          '- `target_url`: str — target URL (caller responsible for authorization)\n- `paths`: list — URL paths to test, e.g. ["/", "/login"]\n- `checks`: list — one or more of: xss, sqli, open-redirect, path-traversal\n- `threads`: int = 4 — concurrent threads (1–16)',
          'from vulnscan.scanner import VulnScanner\nimport json, time\n\nstart = time.time()\nscanner = VulnScanner(target=target_url, timeout=10, threads=threads)\nvulns = scanner.web_scan(paths=paths, checks=checks)\nreport_str = scanner.report(vulns, format="json")\n\nreturn {\n    "target": target_url,\n    "vulnerabilities": [{\n        "type": v.type, "url": v.url,\n        "severity": v.severity, "evidence": v.evidence\n    } for v in vulns],\n    "scan_time": round(time.time() - start, 2),\n    "report_json": report_str\n}',
          {
            pre: '- `target_url` is a reachable URL the caller is authorized to scan\n- `checks` contains only valid check names\n- `threads` in range [1, 16]',
            post: '- Returns dict with keys: target, vulnerabilities, scan_time, report_json\n- `vulnerabilities` is a list of dicts with keys: type, url, severity, evidence\n- `scan_time` is float seconds elapsed',
          },
          '- ✓ VulnResult objects serialized to plain dicts — no non-serializable objects\n- ✓ scan_time captured for performance metrics\n- ✓ report_json generated in structured format\n- ⚠ Authorization check delegated to caller — skill does not verify scope'
        ),
        trials: [
          { pass: false, msg: 'VulnScanner constructor raises TypeError — vulnscan 0.9 uses positional `target` not keyword. Interface error.' },
          { pass: true,  msg: 'Skill executed with positional fix. Correct schema output, serialization correct.' },
          { pass: false, msg: 'paths=[] passed to web_scan — skill scans empty path list, returns no results. Not caught by contract.' },
        ],
      },
      skillSeekers: {
        skillMd: skillSeekers_(
          'vulnscan Web Scan Skill',
          'Web vulnerability detection',
          'vulnscan repo — `scanner.py` (lines 1–150), `config.yaml`, `README.md` "Quick Scan" section',
          '- `target`: str — from `scanner.py:__init__:11` (positional, not keyword)\n- `paths`: list — from `web_scan()` signature; default from `config.yaml:scan.default_ports`\n- `checks`: list — from `config.yaml:scan.web_checks`: [xss, sqli, open-redirect, path-traversal]\n- `threads`: int = 4 — from `scanner.py:__init__:13`\n- `timeout`: int = 10 — from `scanner.py:__init__:12`',
          '1. Instantiate scanner (`README.md` line 6):\n   ```python\n   scanner = VulnScanner(target_url, timeout=10, threads=4)\n   ```\n2. Run web scan (`README.md` lines 9–11):\n   ```python\n   vulns = scanner.web_scan(paths=paths, checks=checks)\n   ```\n3. Serialize results (VulnResult has `.__dict__`):\n   ```python\n   vuln_list = [v.__dict__ for v in vulns]\n   ```\n4. Generate report:\n   ```python\n   report = scanner.report(vulns, format="json")\n   ```\n5. Return `{target, vulnerabilities: vuln_list, scan_time, report_json}`',
          '- ⚠ Caller must hold authorization before scanning any target\n- ⚠ Do not log `evidence` or `payload` fields without sanitization\n- ⚠ Respect `config.yaml:scan.rate_limit_rps=10` — do not override\n- ⚠ `path-traversal` checks may trigger WAF — use cautiously'
        ),
        trials: [
          { pass: true,  msg: 'Grounded skill correctly identifies VulnScanner constructor signature. Serialization and schema correct.' },
          { pass: false, msg: 'rate_limit_rps not set in environment — exceeded threshold. Infrastructure issue.' },
          { pass: true,  msg: 'Third trial in rate-limited environment: skill executed correctly. All schema fields present.' },
        ],
      },
    },
  },

  // ── DOCUMENT-GROUNDED ────────────────────────────────────────

  'biomed-doc': {
    id: 'biomed-doc',
    name: 'ClinTrialDB API Specification',
    shortName: 'ClinTrialDB v3.2',
    type: 'document',
    domain: 'BioMed',
    icon: '🧬',
    color: '#059669',
    description: 'REST API specification for clinical trial data retrieval, adverse event reporting, and eligibility screening. 180-page technical document.',
    sourceContent: `# ClinTrialDB REST API v3.2 — Specification Excerpt

## Authentication (Section 2)
All requests require Bearer token in Authorization header.
Token endpoint: POST /auth/token {client_id, client_secret}
Token TTL: 3600 seconds. Refresh via POST /auth/refresh {refresh_token}.

## Trial Search (Section 4.1)
GET /v3/trials/search
Query params: condition (str), phase (1|2|3|4), status (recruiting|active|completed),
  sponsor (str), country (str), min_enrollment (int), page (int), limit (int, max 100)
Response: {total, page, trials: [{nct_id, title, phase, status, condition,
  sponsor, enrollment, start_date, primary_completion_date, eligibility_summary}]}

## Eligibility Criteria (Section 4.3)
GET /v3/trials/{nct_id}/eligibility
Response: {nct_id, inclusion_criteria: [str], exclusion_criteria: [str],
  age_min, age_max, accepts_healthy_volunteers: bool, gender: all|male|female}

## Adverse Events (Section 5.1)
POST /v3/trials/{nct_id}/adverse-events
Body: {participant_id, event_type, severity (mild|moderate|severe|life-threatening),
  onset_date, description, relatedness (unrelated|possible|probable|definite)}
Response: {event_id, status: recorded|review_required, timestamp}

## Rate Limits (Section 8)
Search: 60 req/min. Eligibility: 120 req/min. POST: 30 req/min.`,
    task: {
      title: 'Active Trial Search with Eligibility Retrieval',
      description: 'Search for recruiting clinical trials by condition and phase, then retrieve eligibility criteria for each. Return structured list with trial metadata and eligibility.',
      input: 'condition: str, phase: int, base_url: str, token: str, max_trials: int = 10',
      expectedOutput: 'list of dicts: [{nct_id, title, status, eligibility: {inclusion, exclusion, age_min, age_max}}]',
    },
    mockSkills: {
      naivePrompt: {
        skillMd: skillNaive(
          'Clinical Trial Search Skill',
          'Clinical trial data retrieval',
          '- `condition` (str): Medical condition to search\n- `phase` (int): Trial phase 1-4\n- `token` (str): Bearer authentication token\n- `base_url` (str): API base URL',
          '# No packages required — uses built-in requests\npip install requests',
          'import requests\nheaders = {"Authorization": f"Bearer {token}"}\nresponse = requests.get(f"{base_url}/v3/trials/search",\n    params={"condition": condition, "phase": phase, "status": "recruiting"},\n    headers=headers)\nreturn response.json()["trials"]',
          'List of trial objects from API response.'
        ),
        trials: [
          { pass: true,  msg: 'Skill executed. Basic trial list returned. Phase param correctly passed.' },
          { pass: false, msg: 'Missing eligibility retrieval step — task requires fetching /eligibility for each trial. Incomplete procedure.' },
          { pass: false, msg: 'No pagination handling — only first page returned. max_trials param not applied.' },
        ],
      },
      evoSkill: {
        skillMd: skillEvo(
          'ClinTrialSearch',
          'Clinical trial search with eligibility retrieval',
          '- `condition`: str — medical condition keyword\n- `phase`: int — trial phase 1|2|3|4\n- `base_url`: str — API base URL\n- `token`: str — Bearer token (evolved: added explicit token param cycle 1)\n- `max_trials`: int = 10 — maximum trials to return (evolved: cycle 2)\n- `include_eligibility`: bool = True — fetch eligibility per trial (evolved: cycle 2)',
          'pip install requests  # standard library only',
          'import requests\nheaders = {"Authorization": f"Bearer {token}"}\n\ndef search(condition, phase, limit):\n    r = requests.get(f"{base_url}/v3/trials/search",\n        params={"condition": condition, "phase": phase,\n                "status": "recruiting", "limit": min(limit, 100)},\n        headers=headers)\n    r.raise_for_status()\n    return r.json()["trials"][:limit]\n\ntrials = search(condition, phase, max_trials)\nif include_eligibility:\n    for t in trials:\n        elig = requests.get(f"{base_url}/v3/trials/{t["nct_id"]}/eligibility",\n                            headers=headers).json()\n        t["eligibility"] = elig\nreturn trials',
          'list of trial dicts with optional eligibility nested.',
          3
        ),
        trials: [
          { pass: true,  msg: 'Skill executed correctly. Trial search and eligibility retrieval both work. Pagination applied.' },
          { pass: true,  msg: 'Second trial: token refresh not needed within limit. Results match expected schema.' },
          { pass: false, msg: 'include_eligibility=False path returns raw trial objects without eligibility key — schema mismatch.' },
        ],
      },
      skillNet: {
        skillMd: skillNet_(
          'ClinTrialDB::search+eligibility',
          'BioMed',
          'ClinTrialDB API Spec v3.2 — Sections 4.1 and 4.3',
          '- `condition`: str — Section 4.1 query param "condition"\n- `phase`: int — Section 4.1 "phase": 1|2|3|4\n- `base_url`: str — API root URL\n- `token`: str — Section 2 Bearer token\n- `max_trials`: int = 10 — limits results (API max 100 per page per Section 4.1)\n- `status`: str = "recruiting" — Section 4.1 status filter',
          '# No extra packages needed — Python stdlib\npip install requests>=2.28.0',
          'import requests\n\nheaders = {"Authorization": f"Bearer {token}",\n           "Content-Type": "application/json"}\n\n# Search trials (Section 4.1)\nr = requests.get(f"{base_url}/v3/trials/search",\n    params={"condition": condition, "phase": phase,\n            "status": status, "limit": min(max_trials, 100)},\n    headers=headers)\nr.raise_for_status()\ntrials = r.json()["trials"][:max_trials]\n\n# Fetch eligibility per trial (Section 4.3)\nresult = []\nfor t in trials:\n    er = requests.get(f"{base_url}/v3/trials/{t["nct_id"]}/eligibility",\n                      headers=headers)\n    er.raise_for_status()\n    elig = er.json()\n    result.append({\n        "nct_id": t["nct_id"], "title": t["title"], "status": t["status"],\n        "eligibility": {\n            "inclusion": elig["inclusion_criteria"],\n            "exclusion": elig["exclusion_criteria"],\n            "age_min": elig["age_min"],\n            "age_max": elig["age_max"]\n        }\n    })\nreturn result',
          '1. Authenticate: pass Bearer token in Authorization header\n2. Search: GET /v3/trials/search with condition, phase, status params\n3. Limit results to max_trials\n4. For each trial: GET /v3/trials/{nct_id}/eligibility\n5. Reshape to output schema: {nct_id, title, status, eligibility}',
          'Search node → eligibility_node → adverse_events_node'
        ),
        trials: [
          { pass: true,  msg: 'Full pipeline executed. Correct search, eligibility retrieval, and output schema.' },
          { pass: true,  msg: 'Second trial: rate limiting not an issue for 10 trials. All fields present.' },
          { pass: true,  msg: 'Third trial: edge case with 0 results handled gracefully. Returns empty list.' },
        ],
      },
      skillCreator: {
        skillMd: skillCreator_(
          'Clinical Trial Search + Eligibility Skill',
          'BioMed',
          '- `condition`: str — medical condition search term\n- `phase`: int — trial phase (1, 2, 3, or 4)\n- `base_url`: str — ClinTrialDB API base URL\n- `token`: str — valid Bearer authentication token\n- `max_trials`: int = 10 — maximum trials to return (1–100)',
          'import requests\n\ndef _get(url, params=None):\n    r = requests.get(url, params=params,\n                     headers={"Authorization": f"Bearer {token}"})\n    r.raise_for_status()\n    return r.json()\n\nraw = _get(f"{base_url}/v3/trials/search",\n          {"condition": condition, "phase": phase,\n           "status": "recruiting", "limit": min(max_trials, 100)})\ntrials = raw["trials"][:max_trials]\n\nout = []\nfor t in trials:\n    elig = _get(f"{base_url}/v3/trials/{t["nct_id"]}/eligibility")\n    out.append({\n        "nct_id": t["nct_id"], "title": t["title"], "status": t["status"],\n        "eligibility": {"inclusion": elig["inclusion_criteria"],\n                        "exclusion": elig["exclusion_criteria"],\n                        "age_min": elig["age_min"], "age_max": elig["age_max"]}\n    })\nreturn out',
          {
            pre: '- `token` is valid and not expired (TTL 3600s per Section 2)\n- `phase` is one of: 1, 2, 3, 4\n- `max_trials` in range [1, 100]\n- Network access to `base_url` available',
            post: '- Returns list of dicts with keys: nct_id, title, status, eligibility\n- `eligibility` contains: inclusion (list), exclusion (list), age_min, age_max\n- Empty list returned if no trials match criteria\n- HTTPError raised on authentication failure (401) or server error (5xx)',
          },
          '- ✓ max_trials capped at 100 — API limit per Section 4.1\n- ✓ raise_for_status() catches 4xx/5xx — clear error propagation\n- ✓ Output schema exactly matches task specification\n- ✓ Token refresh not handled — caller responsible (TTL 3600s sufficient for typical calls)'
        ),
        trials: [
          { pass: true,  msg: 'Skill executed correctly. All contract postconditions met. Schema exact match.' },
          { pass: true,  msg: 'Second trial: correct handling of 0-result case. Empty list returned.' },
          { pass: false, msg: 'Third trial: token expired mid-execution. 401 error propagated as HTTPError — not caught.' },
        ],
      },
      skillSeekers: {
        skillMd: skillSeekers_(
          'ClinTrialDB Search Skill',
          'Clinical trial search and eligibility retrieval',
          'ClinTrialDB API Spec v3.2 — Section 2 (Auth), Section 4.1 (Trial Search), Section 4.3 (Eligibility), Section 8 (Rate Limits)',
          '- `condition`: str — Section 4.1 "condition" query param\n- `phase`: int — Section 4.1 "phase" (1|2|3|4)\n- `base_url`: str — API root\n- `token`: str — Section 2 Bearer token (TTL 3600s, refresh via POST /auth/refresh)\n- `max_trials`: int = 10 — Section 4.1 "limit" max 100\n- `status`: str = "recruiting" — Section 4.1 status filter options',
          '1. Set auth header (Section 2):\n   ```python\n   headers = {"Authorization": f"Bearer {token}"}\n   ```\n2. Search trials (Section 4.1):\n   ```python\n   r = requests.get(f"{base_url}/v3/trials/search",\n       params={"condition": condition, "phase": phase,\n               "status": "recruiting", "limit": min(max_trials, 100)},\n       headers=headers)\n   trials = r.json()["trials"][:max_trials]\n   ```\n3. Fetch eligibility per trial (Section 4.3):\n   ```python\n   for t in trials:\n       elig = requests.get(f"{base_url}/v3/trials/{t["nct_id"]}/eligibility",\n                           headers=headers).json()\n       t["eligibility"] = {"inclusion": elig["inclusion_criteria"],\n                           "exclusion": elig["exclusion_criteria"],\n                           "age_min": elig["age_min"], "age_max": elig["age_max"]}\n   ```\n4. Return shaped list.',
          '- ⚠ Respect rate limits: 60 req/min search, 120 req/min eligibility (Section 8)\n- ⚠ Do not store or log participant data — API responses may include PII\n- ⚠ Token TTL 3600s — implement refresh if session exceeds 1 hour\n- ⚠ POST /adverse-events requires additional authorization (Section 5.1)'
        ),
        trials: [
          { pass: true,  msg: 'Grounded skill correctly implements auth, search, and eligibility retrieval from spec.' },
          { pass: true,  msg: 'Second trial: rate limit awareness noted in skill. Correct output schema.' },
          { pass: false, msg: 'Third trial: token in test environment used wrong format (no "Bearer " prefix) — skill does not validate.' },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────

  'video-doc': {
    id: 'video-doc',
    name: 'FFmpeg Video Encoding Guide',
    shortName: 'FFmpeg Encoding Spec',
    type: 'document',
    domain: 'Video',
    icon: '🎬',
    color: '#d97706',
    description: 'Technical encoding specification: codec selection, bitrate ladders, two-pass encoding, filter graphs, and streaming preparation. 95-page manual.',
    sourceContent: `# FFmpeg Video Encoding Technical Reference — Excerpts

## Chapter 3: H.264 Encoding
libx264 is invoked via: ffmpeg -i INPUT -c:v libx264 -crf CRF -preset PRESET OUTPUT
CRF (Constant Rate Factor): 0=lossless, 23=default, 51=worst. Range 18-28 for web.
Preset: ultrafast|superfast|veryfast|faster|fast|medium|slow|slower|veryslow
Audio: -c:a aac -b:a 128k for stereo; -c:a copy to pass through.
Two-pass: Pass1: ffmpeg -i IN -c:v libx264 -b:v BITRATE -pass 1 -f null /dev/null
          Pass2: ffmpeg -i IN -c:v libx264 -b:v BITRATE -pass 2 OUTPUT

## Chapter 4: Resolution and Scaling
Scale filter: -vf "scale=WIDTH:HEIGHT" or -vf "scale=1920:-2" (maintain AR, div by 2)
1080p: 1920x1080. 720p: 1280x720. 480p: 854x480.
Crop: -vf "crop=W:H:X:Y". Pad: -vf "pad=W:H:X:Y:color"

## Chapter 5: Bitrate Recommendations
1080p H.264: 4000-8000kbps for streaming; 8000-15000kbps for high quality
720p H.264: 2500-5000kbps streaming; 5000-8000kbps high quality
Audio: 128kbps stereo AAC for streaming; 192-320kbps high quality

## Chapter 7: Metadata and Container
-movflags +faststart  (required for HTTP streaming — moves moov atom to front)
-metadata title="TITLE" -metadata artist="ARTIST"`,
    task: {
      title: 'H.264 1080p Encode with Web Optimization',
      description: 'Encode a video file to H.264 1080p at CRF 23 with slow preset, AAC audio at 128kbps, and apply web streaming optimization (faststart). Return output path and encoding stats.',
      input: 'input_path: str, output_path: str, crf: int = 23, audio_bitrate: str = "128k"',
      expectedOutput: 'dict with keys: output_path, success, command, duration_seconds',
    },
    mockSkills: {
      naivePrompt: {
        skillMd: skillNaive(
          'Video Encode Skill',
          'H.264 video encoding',
          '- `input_path` (str): Source video file\n- `output_path` (str): Encoded output path\n- `crf` (int): CRF value 0-51 (default 23)\n- `preset` (str): Encoding preset',
          '# Requires FFmpeg installed on system\n# Install: https://ffmpeg.org/download.html',
          'import subprocess\ncmd = ["ffmpeg", "-i", input_path, "-c:v", "libx264",\n       "-crf", str(crf), "-preset", "medium",\n       "-c:a", "aac", output_path]\nsubprocess.run(cmd, check=True)',
          'None — runs subprocess in place.'
        ),
        trials: [
          { pass: true,  msg: 'Basic encoding command executed. Output file created. CRF applied correctly.' },
          { pass: false, msg: 'Missing -movflags +faststart — web optimization step absent. Moov atom at end of file.' },
          { pass: false, msg: 'Return type is None not dict — task expects structured output with success and duration fields.' },
        ],
      },
      evoSkill: {
        skillMd: skillEvo(
          'VideoEncode1080p',
          'H.264 1080p encoding with web optimization',
          '- `input_path`: str — source video\n- `output_path`: str — encoded output\n- `crf`: int = 23 — quality (0-51, lower=better)\n- `preset`: str = "slow" — encoding speed/quality trade-off (evolved: default changed cycle 2)\n- `audio_bitrate`: str = "128k" — AAC bitrate (evolved: added cycle 2)\n- `faststart`: bool = True — web streaming optimization (evolved: added cycle 3)',
          '# System requirement\n# FFmpeg must be in PATH\n# Install: apt-get install ffmpeg (Linux) or brew install ffmpeg (macOS)',
          'import subprocess, time\n\ncmd = ["ffmpeg", "-i", input_path,\n       "-c:v", "libx264", "-crf", str(crf),\n       "-preset", preset, "-c:a", "aac", "-b:a", audio_bitrate]\nif faststart:\n    cmd += ["-movflags", "+faststart"]\ncmd += ["-y", output_path]\n\nstart = time.time()\nresult = subprocess.run(cmd, capture_output=True, text=True)\nduration = round(time.time() - start, 2)\n\nreturn {\n    "output_path": output_path,\n    "success": result.returncode == 0,\n    "command": " ".join(cmd),\n    "duration_seconds": duration\n}',
          'dict with output_path, success, command, duration_seconds.',
          3
        ),
        trials: [
          { pass: true,  msg: 'Evolved skill correct. faststart applied, structured return, correct CRF and preset.' },
          { pass: true,  msg: 'Second trial: correct with different audio_bitrate param. Flexible and correct.' },
          { pass: false, msg: 'Third trial: -y flag overwrites existing file without warning. Safety issue flagged by harness.' },
        ],
      },
      skillNet: {
        skillMd: skillNet_(
          'FFmpeg H.264 Encode',
          'Video',
          'FFmpeg Encoding Guide — Chapters 3, 4, 5, 7',
          '- `input_path`: str — source video (Chapter 3: -i INPUT)\n- `output_path`: str — encoded output path\n- `crf`: int = 23 — Chapter 3 CRF, range 0-51 (18-28 for web)\n- `preset`: str = "slow" — Chapter 3: ultrafast|...|veryslow\n- `scale`: str = None — Chapter 4: e.g. "1920:-2" for 1080p maintaining AR\n- `audio_bitrate`: str = "128k" — Chapter 5: AAC bitrate\n- `faststart`: bool = True — Chapter 7: -movflags +faststart required for HTTP streaming',
          '# System dependency — FFmpeg must be in PATH\n# Chapter 3 baseline: libx264 codec\n# Verify: ffmpeg -version | grep libx264',
          'import subprocess, time\n\nfilters = []\nif scale:\n    filters.append(f"scale={scale}")\n\ncmd = ["ffmpeg", "-i", input_path]\nif filters:\n    cmd += ["-vf", ",".join(filters)]\ncmd += ["-c:v", "libx264", "-crf", str(crf), "-preset", preset,\n        "-c:a", "aac", "-b:a", audio_bitrate]\nif faststart:\n    cmd += ["-movflags", "+faststart"]\ncmd += ["-y", output_path]\n\nstart = time.time()\nr = subprocess.run(cmd, capture_output=True, text=True)\n\nreturn {\n    "output_path": output_path,\n    "success": r.returncode == 0,\n    "command": " ".join(cmd),\n    "duration_seconds": round(time.time() - start, 2)\n}',
          '1. Build filter chain (scale if specified — Chapter 4)\n2. Assemble FFmpeg command (Chapter 3 baseline)\n3. Apply faststart flag (Chapter 7 — required for HTTP streaming)\n4. Run via subprocess, capture returncode\n5. Return structured dict with command and timing',
          'Encode node → faststart_node → metadata_node → streaming_prep_node'
        ),
        trials: [
          { pass: true,  msg: 'Skill grounded correctly from spec chapters. faststart applied. Correct return schema.' },
          { pass: true,  msg: 'Second trial: scale parameter applied correctly for 1080p. AR maintained.' },
          { pass: true,  msg: 'Third trial: all parameters correctly parameterized. Output matches task specification.' },
        ],
      },
      skillCreator: {
        skillMd: skillCreator_(
          'H.264 Web Video Encoder',
          'Video',
          '- `input_path`: str — source video file path (must exist)\n- `output_path`: str — destination path (.mp4 recommended)\n- `crf`: int = 23 — quality (18–28 for web; lower=better)\n- `audio_bitrate`: str = "128k" — AAC audio bitrate',
          'import subprocess, time, os\n\ncmd = [\n    "ffmpeg", "-i", input_path,\n    "-c:v", "libx264",\n    "-crf", str(crf),\n    "-preset", "slow",\n    "-c:a", "aac", "-b:a", audio_bitrate,\n    "-movflags", "+faststart",\n    "-y", output_path\n]\nstart = time.time()\nr = subprocess.run(cmd, capture_output=True, text=True)\nreturn {\n    "output_path": output_path,\n    "success": r.returncode == 0,\n    "command": " ".join(cmd),\n    "duration_seconds": round(time.time() - start, 2)\n}',
          {
            pre: '- `input_path` is an existing readable video file\n- `crf` in range [0, 51]\n- FFmpeg with libx264 support available in PATH\n- `output_path` parent directory exists and is writable',
            post: '- Returns dict with keys: output_path, success, command, duration_seconds\n- `success=True` iff FFmpeg returncode == 0\n- Output file exists at output_path iff success=True\n- -movflags +faststart always applied (HTTP streaming requirement)',
          },
          '- ✓ -movflags +faststart applied unconditionally per task requirement\n- ✓ preset="slow" hardcoded per task (higher quality than "medium")\n- ✓ -y flag overwrites existing output — caller must handle\n- ✓ return schema matches task specification exactly\n- ⚠ FFmpeg PATH not validated at entry — will raise FileNotFoundError if absent'
        ),
        trials: [
          { pass: true,  msg: 'Skill executed correctly. All encoding parameters correct. faststart verified in output.' },
          { pass: true,  msg: 'Second trial: different CRF value. Correct parameterization.' },
          { pass: true,  msg: 'Third trial: contract postconditions all satisfied. Return schema exact match.' },
        ],
      },
      skillSeekers: {
        skillMd: skillSeekers_(
          'FFmpeg H.264 Encode Skill',
          'H.264 video encoding with web streaming optimization',
          'FFmpeg Encoding Guide — Chapter 3 (H.264), Chapter 5 (Bitrate), Chapter 7 (Metadata/Container)',
          '- `input_path`: str — Chapter 3: -i INPUT\n- `output_path`: str — final container path\n- `crf`: int = 23 — Chapter 3: CRF default 23; web range 18-28\n- `preset`: str = "slow" — Chapter 3: preset options (slower=better quality)\n- `audio_bitrate`: str = "128k" — Chapter 5: 128kbps stereo AAC for streaming\n- `faststart`: bool = True — Chapter 7: -movflags +faststart for HTTP streaming',
          '1. Build command from Chapter 3 baseline:\n   ```python\n   cmd = ["ffmpeg", "-i", input_path,\n          "-c:v", "libx264", "-crf", str(crf), "-preset", preset,\n          "-c:a", "aac", "-b:a", audio_bitrate]\n   ```\n2. Apply web optimization (Chapter 7):\n   ```python\n   if faststart:\n       cmd += ["-movflags", "+faststart"]\n   ```\n3. Run and capture:\n   ```python\n   r = subprocess.run(cmd + [output_path], capture_output=True, text=True)\n   return {"output_path": output_path, "success": r.returncode==0,\n           "command": " ".join(cmd), "duration_seconds": elapsed}\n   ```',
          '- ⚠ -y flag overwrites existing file — check output_path before calling\n- ⚠ Two-pass encoding (Chapter 3) preferred for CBR streaming — this skill uses CRF (VBR)\n- ⚠ Do not exceed Chapter 5 bitrate recommendations for target resolution\n- ⚠ libx264 license: ensure FFmpeg build includes GPL libx264'
        ),
        trials: [
          { pass: true,  msg: 'Grounded skill correctly maps spec chapters to command flags. All params correct.' },
          { pass: true,  msg: 'Second trial: faststart flag verified in output file moov atom position.' },
          { pass: false, msg: 'Third trial: -y flag not in skill — subprocess raises CalledProcessError when output exists.' },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────

  'data-doc': {
    id: 'data-doc',
    name: 'DataStream ETL Pipeline Manual',
    shortName: 'DataStream v4',
    type: 'document',
    domain: 'Data',
    icon: '📊',
    color: '#0891b2',
    description: 'System manual for the DataStream ETL platform: source connectors, transformation DSL, schema validation, and sink configuration. 240-page reference.',
    sourceContent: `# DataStream ETL v4 — System Manual Excerpts

## Part 2: Source Connectors
CSV Source: connector_type: csv, path: /data/input/*.csv, delimiter: ",",
  has_header: true, encoding: utf-8, null_values: ["", "NULL", "NA"]
DB Source: connector_type: postgres, host, port, database, user, password,
  query: "SELECT ...", batch_size: 1000

## Part 3: Transformation DSL
Transformations applied in order. Each step: {type, ...params}
rename: {type: rename, columns: {old: new}}
cast: {type: cast, column: name, to: int|float|str|date|bool}
filter: {type: filter, column: name, op: eq|ne|gt|lt|in|notnull, value: X}
derive: {type: derive, column: new_col, expression: "col_a + col_b"}
drop: {type: drop, columns: [col1, col2]}

## Part 4: Schema Validation
Rules: required (list of required column names), types (col: expected_type),
  range (col: {min, max}), pattern (col: regex_string), unique (list)
On violation: mode=fail|warn|skip_row. Default: fail.

## Part 5: Sink Connectors
Postgres sink: connector_type: postgres, host, port, database, user, password,
  table: target_table, mode: append|replace|upsert, upsert_key: [col_list]
CSV sink: connector_type: csv, path: /output/result.csv`,
    task: {
      title: 'CSV Ingest with Type Casting and PostgreSQL Load',
      description: 'Configure an ETL pipeline to read CSV files, cast columns to correct types, validate required fields, and load to PostgreSQL in append mode.',
      input: 'csv_path: str, pg_conn: dict, column_types: dict, required_cols: list, target_table: str',
      expectedOutput: 'dict with keys: rows_processed, rows_failed, success, pipeline_config (dict)',
    },
    mockSkills: {
      naivePrompt: {
        skillMd: skillNaive(
          'ETL Pipeline Skill',
          'CSV to PostgreSQL ETL',
          '- `csv_path` (str): Path to CSV input\n- `pg_conn` (dict): PostgreSQL connection params\n- `target_table` (str): Destination table',
          'pip install datastream',
          'from datastream import Pipeline\npipeline = Pipeline()\npipeline.source(connector_type="csv", path=csv_path)\npipeline.sink(connector_type="postgres", **pg_conn, table=target_table)\nresult = pipeline.run()\nreturn result',
          'Pipeline run result object.'
        ),
        trials: [
          { pass: true,  msg: 'Basic pipeline ran. CSV loaded to PostgreSQL.' },
          { pass: false, msg: 'Missing transformation step — column types not cast. Schema violation in target table.' },
          { pass: false, msg: 'Return type is result object not dict — task expects rows_processed, rows_failed, success, pipeline_config.' },
        ],
      },
      evoSkill: {
        skillMd: skillEvo(
          'CSVtoPostgres',
          'CSV ingest with type casting and validation',
          '- `csv_path`: str — CSV source path (glob supported)\n- `pg_conn`: dict — {host, port, database, user, password}\n- `column_types`: dict — {col: type} for casting (evolved: cycle 1)\n- `required_cols`: list — required column names for validation (evolved: cycle 2)\n- `target_table`: str — PostgreSQL target table\n- `mode`: str = "append" — sink mode: append|replace|upsert (evolved: cycle 3)',
          'pip install datastream>=4.0.0\n# Requires PostgreSQL client libs: libpq-dev (Linux)',
          'from datastream import Pipeline\n\n# Build transformations\ntransforms = []\nfor col, typ in column_types.items():\n    transforms.append({"type": "cast", "column": col, "to": typ})\n\n# Build validation rules\nvalidation = {"required": required_cols, "mode": "fail"}\n\np = Pipeline()\np.source(connector_type="csv", path=csv_path, has_header=True, null_values=["","NULL","NA"])\nfor t in transforms:\n    p.transform(**t)\np.validate(validation)\np.sink(connector_type="postgres", **pg_conn, table=target_table, mode=mode)\n\nr = p.run()\nreturn {\n    "rows_processed": r.rows_in,\n    "rows_failed": r.rows_failed,\n    "success": r.success,\n    "pipeline_config": p.config()\n}',
          'dict with rows_processed, rows_failed, success, pipeline_config.',
          3
        ),
        trials: [
          { pass: true,  msg: 'Full pipeline: CSV source, type casting, validation, and PostgreSQL sink all correct.' },
          { pass: true,  msg: 'Second trial: required_cols validation correctly rejected row with missing required field.' },
          { pass: false, msg: 'Third trial: p.config() method not available in DataStream v4 — evolved pipeline_config step incorrect.' },
        ],
      },
      skillNet: {
        skillMd: skillNet_(
          'DataStream::CSV-to-Postgres Pipeline',
          'Data',
          'DataStream ETL Manual v4 — Parts 2, 3, 4, 5',
          '- `csv_path`: str — Part 2 CSV connector "path" (glob supported, e.g. /data/*.csv)\n- `pg_conn`: dict — Part 5 Postgres sink params: {host, port, database, user, password}\n- `column_types`: dict — Part 3 cast transform: {column_name: "int|float|str|date|bool"}\n- `required_cols`: list — Part 4 schema validation "required" list\n- `target_table`: str — Part 5 sink "table"\n- `mode`: str = "append" — Part 5 sink mode: append|replace|upsert',
          '# DataStream SDK\npip install datastream>=4.0.0\n# PostgreSQL client\npip install psycopg2-binary  # Part 5 Postgres sink dependency',
          'from datastream import Pipeline\n\np = Pipeline()\n\n# Part 2: CSV Source\np.source(connector_type="csv", path=csv_path,\n         has_header=True, encoding="utf-8",\n         null_values=["", "NULL", "NA"])\n\n# Part 3: Type-cast each column\nfor col, typ in column_types.items():\n    p.transform(type="cast", column=col, to=typ)\n\n# Part 4: Schema validation\np.validate({"required": required_cols, "mode": "fail"})\n\n# Part 5: Postgres Sink\np.sink(connector_type="postgres", **pg_conn,\n       table=target_table, mode=mode)\n\nr = p.run()\nreturn {\n    "rows_processed": r.rows_in,\n    "rows_failed": r.rows_failed,\n    "success": r.success,\n    "pipeline_config": p.to_dict()\n}',
          '1. Configure CSV source (Part 2): set null_values and encoding\n2. Add cast transformations per Part 3 DSL\n3. Add validation rules per Part 4\n4. Configure Postgres sink per Part 5\n5. Run pipeline and return structured result',
          'CSV source node → cast_node → validate_node → postgres_sink_node'
        ),
        trials: [
          { pass: true,  msg: 'Full pipeline executed correctly. All parts correctly implemented.' },
          { pass: true,  msg: 'Second trial: null_values correctly parsed. Validation fail mode correctly applied.' },
          { pass: false, msg: 'Third trial: p.to_dict() raises AttributeError in DataStream v4.0 — method name is p.export_config().' },
        ],
      },
      skillCreator: {
        skillMd: skillCreator_(
          'CSV-to-PostgreSQL ETL Skill',
          'Data',
          '- `csv_path`: str — CSV source path or glob\n- `pg_conn`: dict — {host: str, port: int, database: str, user: str, password: str}\n- `column_types`: dict — {col_name: "int|float|str|date|bool"}\n- `required_cols`: list — column names that must not be null\n- `target_table`: str — PostgreSQL destination table',
          'from datastream import Pipeline\n\np = Pipeline()\np.source(connector_type="csv", path=csv_path, has_header=True,\n         null_values=["", "NULL", "NA"], encoding="utf-8")\nfor col, typ in column_types.items():\n    p.transform(type="cast", column=col, to=typ)\np.validate({"required": required_cols, "mode": "fail"})\np.sink(connector_type="postgres", host=pg_conn["host"],\n       port=pg_conn["port"], database=pg_conn["database"],\n       user=pg_conn["user"], password=pg_conn["password"],\n       table=target_table, mode="append")\n\nr = p.run()\nreturn {"rows_processed": r.rows_in, "rows_failed": r.rows_failed,\n        "success": r.success, "pipeline_config": r.config}',
          {
            pre: '- `csv_path` resolves to at least one readable CSV file\n- `pg_conn` contains all required keys: host, port, database, user, password\n- All values in `column_types` are valid DataStream types\n- Target PostgreSQL table exists or mode="replace" is used',
            post: '- Returns dict with: rows_processed (int), rows_failed (int), success (bool), pipeline_config (dict)\n- `success=False` if any validation error in fail mode\n- `rows_failed` counts rows rejected by validation\n- `pipeline_config` is serializable dict of pipeline definition',
          },
          '- ✓ null_values includes all common null representations per Part 2\n- ✓ Validation mode="fail" — strict by default\n- ✓ pg_conn spread as kwargs — matches Part 5 connector interface\n- ⚠ r.config may be None in some DataStream versions — verify API'
        ),
        trials: [
          { pass: true,  msg: 'Skill executed correctly. rows_in, rows_failed, success all correct. r.config populated.' },
          { pass: true,  msg: 'Second trial: type casting and validation both applied correctly.' },
          { pass: true,  msg: 'Third trial: validation rejection counted correctly in rows_failed.' },
        ],
      },
      skillSeekers: {
        skillMd: skillSeekers_(
          'DataStream ETL Pipeline Skill',
          'CSV ingest with type casting, validation, and PostgreSQL load',
          'DataStream ETL Manual v4 — Part 2 (CSV Source), Part 3 (Transform DSL), Part 4 (Validation), Part 5 (Postgres Sink)',
          '- `csv_path`: str — Part 2 "path"; supports glob\n- `pg_conn`: dict — Part 5 {host, port, database, user, password}\n- `column_types`: dict — Part 3 cast transform DSL: {col: "int|float|str|date|bool"}\n- `required_cols`: list — Part 4 validation "required" field\n- `target_table`: str — Part 5 "table"\n- `mode`: str = "append" — Part 5 append|replace|upsert',
          '1. Build pipeline (Part 2 source):\n   ```python\n   p = Pipeline()\n   p.source(connector_type="csv", path=csv_path, has_header=True,\n            null_values=["","NULL","NA"], encoding="utf-8")\n   ```\n2. Apply type casts (Part 3 DSL):\n   ```python\n   for col, typ in column_types.items():\n       p.transform(type="cast", column=col, to=typ)\n   ```\n3. Validate (Part 4):\n   ```python\n   p.validate({"required": required_cols, "mode": "fail"})\n   ```\n4. Configure sink (Part 5):\n   ```python\n   p.sink(connector_type="postgres", **pg_conn, table=target_table, mode=mode)\n   ```\n5. Run and return `{rows_processed, rows_failed, success, pipeline_config}`.',
          '- ⚠ Part 4 mode="fail" rejects entire batch on schema violation — use mode="skip_row" for tolerance\n- ⚠ Part 5 upsert_key required if mode="upsert" — not parameterized in this skill\n- ⚠ Do not log pg_conn — contains plaintext password\n- ⚠ Part 2 null_values list: add domain-specific null representations if needed'
        ),
        trials: [
          { pass: true,  msg: 'Skill correctly maps all four manual parts to pipeline steps. Execution successful.' },
          { pass: false, msg: 'Second trial: upsert mode selected but upsert_key not in skill — Part 5 requirement not captured.' },
          { pass: true,  msg: 'Third trial (append mode): all steps correct. rows_processed and rows_failed accurate.' },
        ],
      },
    },
  },
}

export default SOURCES

export function getSource(id) { return SOURCES[id] }
export function getSources() { return Object.values(SOURCES) }
export function getRepoSources() { return Object.values(SOURCES).filter(s => s.type === 'repository') }
export function getDocSources() { return Object.values(SOURCES).filter(s => s.type === 'document') }
export const METHOD_LIST = Object.values(METHODS)
