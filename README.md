# SkillWorkBench Demo

A browser-native interactive demo of **SkillGenBench** — a benchmark for evaluating skill generation pipelines for LLM agents (arXiv [2605.18693](https://arxiv.org/abs/2605.18693)).

**Live Demo:** https://vishalmysore.github.io/skillWorkBenchDemo/

---

## What is SkillGenBench?

As LLM agents are increasingly built around reusable skills, the central challenge is no longer only whether agents *can use* provided skills, but whether they can *generate* correct, reusable, and executable skills from repositories and documents.

SkillGenBench evaluates **skill generation pipelines** under a unified protocol: a generator receives raw corpora and produces standardized SKILL.md artifacts, which are then executed under fixed harnesses and assessed with unified evaluation procedures.

### Key concepts

| Concept | Description |
|---------|-------------|
| **Skill** | A reusable procedural artifact (SKILL.md + scripts) encoding how to accomplish a class of tasks |
| **Skill generation** | Distilling skills from repositories or documents |
| **Repository-grounded** | Procedures implicit in code structure, configs, and scripts |
| **Document-grounded** | Procedures explicit but distributed across long-form text |
| **Task-conditioned** | Task is revealed at generation time — targeted distillation |
| **Task-agnostic** | No task visible — build a reusable skill library from corpora alone |
| **pass@3** | At least one of three independent execution trials passes |

---

## What this demo shows

### Five generation methods (from the paper)

| Method | Strength | pass@3 Code | pass@3 Doc |
|--------|----------|-------------|------------|
| **Naive Prompt** | Simplicity | 7.3% | 23.4% |
| **EvoSkill** | Evolutionary refinement | 9.8% | 26.6% |
| **SkillNet** | Environment + Grounding | 11.4% | 23.4% |
| **SkillCreator** | Interface contracts | 10.6% | 25.0% |
| **SkillSeekers** | Multi-perspective search | **16.3%** | **25.0%** |

### Six demo sources

**Repository-grounded:**
- 🎵 Audio Processing Pipeline — FFmpeg audio library
- 🌐 Web Automation Framework — Playwright-based scraper
- 🛡️ Vulnerability Scanner Toolkit — Web security scanner

**Document-grounded:**
- 🧬 ClinTrialDB API Specification — Clinical trial REST API
- 🎬 FFmpeg Video Encoding Guide — H.264 encoding reference
- 📊 DataStream ETL Pipeline Manual — CSV-to-PostgreSQL ETL

### Pipeline stages (live trace)

```
Stage 1: Knowledge Graph Construction
         Source artifacts → entity-relation triples → procedure communities

Stage 2: Scenario Generation
         Knowledge graph → task scenarios → task-conditioned / task-agnostic split

Stage 3: Skill Generation  ← method-specific
         Generator produces standardized SKILL.md artifact

Stage 4: Static Diagnostics
         6 axes: Contract · Environment · Grounding · Procedure · Constraints · Safety

Stage 5: Execution Evaluation
         Skill executed against test cases → pass@3 score
```

### Static diagnostic axes (Table 3, paper)

| Axis | What it measures |
|------|-----------------|
| **Contract** | Interface completeness: input/output types, preconditions, postconditions |
| **Environment** | Setup readiness: dependencies, install commands, version pinning |
| **Grounding** | Explicit ties to source artifacts (file:line references) |
| **Procedure** | Step-by-step coverage and state/data handling |
| **Constraints** | Strict task rules preserved in the skill |
| **Safety** | Artifact hygiene: no hardcoded credentials, no risky commands |

---

## Key findings (from the paper)

- **Skill generation is a pipeline-level problem** — performance depends on the method, the backbone model, *and* the source type, not on any single factor
- **Repository-grounded tasks are significantly harder** — procedures are implicit in code structure; models must recover latent execution workflows
- **Static quality ≠ execution success** — SkillNet has the best static scores; SkillSeekers has the best pass@3. Structural completeness does not guarantee executability
- **Task-agnostic generation can hurt** — skills distilled without task hindsight sometimes perform *worse* than no-skill baselines due to interface misalignment
- **Dominant failure modes differ by source type:**
  - Code Repo: runtime / dependency issues (53%)
  - Code Doc: interface / schema errors (85%)
  - Domain Knowledge Doc: numeric / rule encoding errors (44%)

---

## Honest assessment — what this demo does and does not justify

### What it justifies well

- The five-stage pipeline structure (Knowledge Graph → Skill Generation → Static Diagnostics → Execution)
- The five method names, their descriptions, and relative performance differences
- The six static diagnostic axes and what each measures
- The SKILL.md artifact format and how different methods produce different quality outputs
- The key paper finding: static quality ≠ execution success (SkillNet scores highest statically, SkillSeekers wins pass@3)
- The failure mode taxonomy per source type

### What it does NOT justify

- **The actual difficulty gap between repo and doc** — both are hardcoded strings. The paper's point is that repository-grounded is harder because the LLM has to trace implicit execution structure through real code. This demo does not demonstrate that at all.
- **The task-agnostic vs task-conditioned difference** — in the demo this just changes a text label. The paper's point is that building a reusable library without seeing the task is genuinely harder and can cause negative transfer.
- **The generator-backbone interaction** — the paper shows the same method performs differently with GPT-5 vs Kimi K2.5 vs Qwen. The demo has no backbone comparison.
- **Real skill generation** — in mock mode, the SKILL.md is pre-written by hand. The paper evaluates whether an LLM can actually distill a correct procedure from real source material.
- **Real execution** — pass@3 is shown as a static number from the paper. The paper actually runs code in containerized environments against hidden test cases.
- **The specification-execution gap** — the paper's central claim is that skills often look correct structurally but fail when executed. The demo asserts this but doesn't demonstrate it happening live.

### Bottom line

It works well as an **interactive explainer** for someone reading the paper — it makes the vocabulary tangible. But it doesn't function as a true demo of the benchmark itself, because none of the hard parts (real code reading, real skill generation, real execution) actually happen. A viewer watching Mock AI run could easily walk away thinking skill generation is easier than it is.

---

## Architecture

```
src/
├── index.html              # Three-panel SPA layout
├── styles.css              # Dark-theme styling
├── main.js                 # UI orchestration
├── sources/
│   └── index.js            # 6 source definitions + mock SKILL.md artifacts
├── generation/
│   └── pipeline.js         # Generation pipeline (mock + real LLM)
├── feedback/
│   └── tracer.js           # Pub/sub event stream for live trace
└── utils/
    └── llm.js              # Multi-provider LLM wrapper (CORS proxy)
```

All execution is **browser-native** — no backend, no server, no database. LLM calls are routed through a configurable CORS proxy via the `x-target-url` header pattern.

---

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

**No API key needed** — select **🧪 Mock AI** to run the full pipeline simulation without any network calls. Every trace event, SKILL.md artifact, and evaluation result is real logic, not simulated text.

---

## LLM providers supported

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4o Mini |
| Anthropic | Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5 |
| Google Gemini | Gemini 2.0 Flash, 1.5 Pro |
| NVIDIA NIM | Nemotron Nano 12B V2, Llama 3.1 70B |
| Mock AI | Full simulation — no API key required |

---

## Deployment

Deploys automatically to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

---

## Related work

- [harnessEngineeringDemo](https://github.com/vishalmysore/harnessEngineeringDemo) — Browser-native demo of the 3-layer Harness Engineering architecture (the harness that executes generated skills)

---

## Reference

```bibtex
@article{zhou2026skillgenbench,
  title   = {SkillGenBench: Benchmarking Skill Generation Pipelines for LLM Agents},
  author  = {Zhou, Yifan and Zhang, Zhentao and Cheng, Ziming and Zhang, Shuo
             and Lan, Qizhen and Chen, Zhangquan and Yang, Zhi and Xu, Qianyu
             and Chen, Ronghao and Wang, Huacan and Hu, Sen},
  journal = {arXiv preprint arXiv:2605.18693},
  year    = {2026}
}
```

---

## License

MIT — see [LICENSE](LICENSE)
