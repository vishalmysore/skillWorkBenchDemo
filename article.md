# SkillGenBench: Why Generating Skills Is Harder Than Using Them

> **Disclaimer:** The live demo at https://vishalmysore.github.io/skillWorkBenchDemo/ is an **interactive explainer**, not a reproduction of the benchmark. Sources are hardcoded text excerpts, SKILL.md artifacts in mock mode are pre-written by hand, pass@3 scores are taken directly from the paper's tables, and no code is actually executed. It is designed to make the paper's vocabulary and concepts tangible — not to demonstrate the benchmark's technical difficulty. See the [honest assessment](#honest-assessment) section for a full breakdown of what the demo does and does not justify.

---

## The shift nobody talks about

Most conversations about LLM agents focus on two things: which model to use, and how to prompt it.

A quieter question is starting to matter more: *how do you package what the agent knows, so it can be reused tomorrow by a different agent on a different task?*

That is the problem SkillGenBench is designed to study.

---

## What is a skill?

Anthropic's Agent Skills interface introduced the idea of packaging procedural knowledge as a portable artifact — a `SKILL.md` file together with optional scripts, references, and auxiliary resources (Anthropic, 2025). A skill is not a prompt and not a tool. It is closer to a documented procedure: a reusable record of *how to accomplish a class of tasks* that can be stored, versioned, audited, shared across agents and teams, and updated independently of the underlying model.

The practical advantages are significant. Skills can be cached. They can be composed into larger workflows. They can be reviewed by a human before deployment. And crucially, they persist across execution episodes — where raw in-context reasoning does not.

Early evidence shows both the promise and the fragility of this approach. CL-Bench (Dou et al., 2026) found that even when relevant evidence is explicitly present in context, models frequently fail to operationalize it into correct procedures. SkillsBench (Li et al., 2026) showed that curated skills can substantially improve downstream task performance — but automatically generated skills, especially those produced on the fly, are often unstable and can induce *negative transfer*: the agent performs worse with the skill than without it.

This raises an uncomfortable question. If skills are valuable when done well and harmful when done poorly, how do we know which is which? And how do we systematically improve the pipelines that generate them?

That is exactly the gap SkillGenBench fills.

---

## What SkillGenBench actually studies

SkillGenBench (Zhou et al., 2026) is a benchmark for evaluating **skill generation pipelines** — not the skills themselves, and not the agents that use them, but the *process* of distilling skills from raw source material.

The setup is deliberately simple. A generator receives raw corpora. It produces a standardized SKILL.md artifact. A separate executor loads that artifact and attempts downstream tasks. The generator and executor are decoupled: you can swap one without touching the other. This isolation is the key design choice — it lets the benchmark measure procedure-to-skill distillation directly, without conflating it with the executor's planning ability or the retrieval system's recall.

The benchmark spans **187 tasks** across eight domains (Audio, Image, Web, Security, BioMed, Video, Data, Reasoning) and two fundamentally different source types.

### Repository-grounded sources

The source material is a real code repository: Python files, configuration scripts, README files, dependency manifests. The procedures the agent needs to extract are **implicit** — they are not stated anywhere in plain English. They are encoded in how the code is structured: which functions call which, which entry points exist, which environment variables are required, which command conventions apply. The LLM must recover these latent workflows from distributed code artifacts and distill them into a callable, reusable skill.

This is genuinely hard. A model that can read documentation fluently may still fail here, because the relevant information is not in any sentence — it is in the *relationship between files*.

### Document-grounded sources

The source material is a long-form technical document: an API specification, a system manual, a domain reference guide. The procedures are **explicit** — they are written down. But they are scattered. A complete procedure for one task might require combining a constraint from Section 2, a parameter rule from Section 4, and a validation requirement from Section 8. The LLM must integrate these dispersed fragments into a single, self-contained skill without missing any of them.

This is easier than repository-grounded, but still non-trivial. Pass@3 on document sources averages around 23–27% across methods, compared to 7–16% on repository sources.

---

## The two generation settings

SkillGenBench evaluates generators under two conditions that test fundamentally different capabilities.

**Task-conditioned generation** reveals the downstream task to the generator. The model knows what it needs to accomplish, so it can filter the source for the most relevant procedures and distill a focused, task-specific skill. This is targeted distillation.

**Task-agnostic generation** hides the task entirely. The generator sees only the source material and must decide, without any task hint, which procedures are worth preserving and how to organize them into a reusable library. The resulting skill library is then used as-is when held-out tasks are revealed at execution time.

Task-agnostic is significantly harder. Without task hindsight, generators tend to produce skills that are structurally plausible but poorly aligned with what the executor actually needs — leading in some cases to performance *below* the no-skill baseline. More generation budget helps up to a point (roughly 24K–64K tokens), but capacity alone cannot compensate for the absence of task guidance.

---

## The five generation methods

SkillGenBench evaluates five generation pipelines, selected to cover prompt-based, workflow-based, and self-evolving approaches.

### Naive Prompt
The simplest baseline: send the source material directly to the LLM with a skill generation instruction. No iteration, no structure enforcement, no grounding checks. Surprisingly competitive on document-grounded tasks (23.4% pass@3), where the explicit text gives the model enough signal. Weak on repository sources (7.3%) where direct prompting cannot recover implicit structure.

### EvoSkill (Alzubi et al., 2026)
An evolutionary approach: generate an initial skill candidate, score it on fitness criteria, and iteratively mutate and recombine candidates across multiple rounds. Improves environment setup coverage over Naive Prompt (32.9 vs 19.5 on the Environment axis) and achieves the best pass@3 on document tasks (26.6%). Sensitive to backbone model choice — ranges from 10.2% to 20.3% pass@3 on repository tasks depending on which LLM drives the generator.

### SkillNet (Liang et al., 2026)
Builds a network of skill nodes from the source, scores each node for reusability, connects them in a dependency graph, and synthesizes the optimal configuration. Achieves the **strongest static scores overall** (59.1/100 average), with particularly high marks on Environment (52.9) and Grounding (70.7). Execution performance is more modest — 11.4% on repository tasks — illustrating the central tension the paper identifies: structural completeness does not guarantee executability.

### SkillCreator (Anthropic, 2026)
Defines interface contracts first — preconditions, postconditions, typed signatures — then generates an implementation and refines it through iterative test-case feedback. Scores highest on Contract (69.1) and Procedure (69.5) among all methods. Constraints score (38.1) is the best, reflecting its test-case-driven refinement. A strong choice when interface precision matters more than grounding.

### SkillSeekers (Karaaslan, 2026)
Mines the source from three independent perspectives — code structure, dependency chain, and usage patterns — then synthesizes a grounded skill from their intersection. Achieves the **best pass@3 on repository tasks** (16.3%) and ties for best on document tasks (25.0%). Has the highest Safety score (72.8) and strong Grounding (67.2), but weaker Contract (44.4) and Constraints (15.1). The mismatch between its strong dynamic performance and weaker static scores is one of the more interesting findings in the paper.

---

## The central finding: static quality is not execution success

Table 3 of the paper presents static diagnostic scores for each method across six axes:

| Method | Overall | Contract | Env | Grounding | Procedure | Constraints | Safety |
|--------|---------|----------|-----|-----------|-----------|-------------|--------|
| Naive Prompt | 49.8 | 54.8 | 19.5 | 51.5 | 67.9 | 34.6 | 70.3 |
| EvoSkill | 50.0 | 50.1 | 32.9 | 54.5 | 59.3 | 34.2 | 69.0 |
| **SkillNet** | **59.1** | **65.5** | **52.9** | **70.7** | 60.9 | 35.8 | 68.9 |
| SkillCreator | 54.0 | 69.1 | 25.8 | 49.8 | 69.5 | 38.1 | 71.9 |
| SkillSeekers | 44.6 | 44.4 | 23.2 | 67.2 | 44.6 | 15.1 | **72.8** |

SkillNet has the best overall static score. But Table 2 shows SkillSeekers has the best pass@3 on both Code and Doc tasks. A method with the worst static score overall outperforms every other method in actual execution.

This is not a coincidence or a measurement error. It reflects a genuine gap between *specification* and *execution*. A skill can look correct — well-structured, grounded, complete — and still fail when a real executor tries to run it. Conversely, a skill with weak static scores can succeed because it captures the precise procedural steps that the executor needs, even without a polished interface contract or detailed environment setup.

The paper's conclusion is direct: static diagnostics and execution-based evaluation play **complementary** roles. Neither alone is sufficient to judge skill quality.

---

## Why skills fail: a taxonomy

The paper analyses completed verifier failures — cases where the executor produced an answer under a generated skill, but the instance verifier rejected it. Three failure patterns dominate, and they differ sharply by source type.

**Repository sources (Code Repo):** Runtime or dependency issues account for 53% of failures. The skill was generated correctly in structure, but the execution environment it assumes does not match the one the executor runs in — wrong FFmpeg version, missing system library, import path mismatch. The second-largest category is interface or schema errors (27%).

**Code documentation sources:** Interface or schema errors dominate overwhelmingly at 85%. The source is documentation rather than code, so environment setup is easier to recover — but the exact API signature, parameter names, and return schema must be specified precisely, and small deviations cause silent failures.

**Domain knowledge documentation:** State or rule errors (44%) and numeric or formula errors (37%) dominate. These sources contain domain-specific constraints — valid ranges, calculation rules, conditional branches — that must be encoded exactly. Coarse procedural coverage is not enough; the skill must preserve the precise logic.

This taxonomy explains why improving static scores does not automatically improve pass@3. For repository tasks, the bottleneck is environment and dependency recovery — not textual quality. For code documentation, the bottleneck is exact interface compliance. For domain documentation, it is precise rule encoding. Each source type has a different weak point, and a method that addresses one may not address the others.

---

## The generator-backbone interaction

One of the more practically important findings is that no method dominates uniformly across backbone models. SkillSeekers achieves the highest pass@3 with Claude Sonnet 4.5, GPT-5, Kimi K2.5, and MiniMax M2.7. But SkillNet leads with Qwen3.6-Plus, and SkillCreator ties SkillSeekers on GLM-5.

The spread within methods is also telling. EvoSkill ranges from 10.2% with Kimi K2.5 to 20.3% with GPT-5 — a 10-point spread. SkillSeekers stays within a 14.4–20.9% band across all six backbones. Methods differ not just in average performance but in how sensitive they are to the choice of backbone.

The practical implication: choosing a skill generation method is not separable from choosing the model that drives it. The benchmark treats this as a joint decision.

---

## How the demo was built

The live demo at https://vishalmysore.github.io/skillWorkBenchDemo/ is a browser-native single-page application built with Vite and deployed to GitHub Pages. The source is at https://github.com/vishalmysore/skillWorkBenchDemo.

### What it simulates

The demo walks through the five pipeline stages visually:

1. **Knowledge Graph Construction** — trace events describe extracting entity-relation triples from the source, with different messaging for repository sources ("procedures implicit in call relations") versus document sources ("procedures distributed across sections")
2. **Scenario Generation** — the task-conditioned vs task-agnostic split is shown in the trace with different descriptions of what the generator must do
3. **Skill Generation** — each method has a distinct trace pattern (evolutionary rounds for EvoSkill, network node scoring for SkillNet, contract extraction for SkillCreator, three-perspective search for SkillSeekers)
4. **Static Diagnostics** — scores from Table 3 of the paper are displayed as bar charts across the six axes
5. **Execution Trials** — three pre-scripted trial outcomes per source/method combination show representative pass and fail scenarios with realistic error messages

The generated SKILL.md artifacts are pre-written to reflect the structural differences between methods: SkillNet artifacts show strong source grounding and environment pinning; SkillCreator artifacts show typed interface contracts and precondition/postcondition blocks; SkillSeekers artifacts show three-perspective source references and safety notes.

### Technical architecture

```
src/
├── sources/index.js      — 6 source definitions with mock sourceContent and
│                           pre-written SKILL.md artifacts per method
├── generation/pipeline.js — Orchestrates the 5-stage trace; calls LLM in
│                           real mode, uses mock data otherwise
├── feedback/tracer.js    — Pub/sub event stream driving the live trace panel
└── utils/llm.js          — Multi-provider wrapper (OpenAI, Anthropic, Gemini,
                            NVIDIA NIM) via configurable CORS proxy
```

In real LLM mode, the demo sends `sourceContent` to the selected provider and displays whatever SKILL.md the model generates. Static scores are computed from keyword-based heuristics on the generated text. pass@3 is shown as the paper's reference value for that method and source type — real containerized execution is not available in a browser.

---

## Honest assessment

### What the demo justifies well

- The five-stage pipeline structure and what happens at each stage
- The five method names, their design philosophies, and relative performance differences
- The six static diagnostic axes and what each measures
- The SKILL.md artifact format and how different methods produce structurally different outputs
- The key finding: static quality ≠ execution success
- The failure mode taxonomy by source type

### What the demo does NOT justify

- **The actual difficulty gap between repository and document sources** — both are hardcoded text strings in `sources/index.js`. The paper's point is that repository-grounded tasks are harder because procedures are implicit in real code structure. This demo does not demonstrate that.
- **The task-agnostic vs task-conditioned difference** — in the demo this changes a trace message and a label. The paper's point is that building a reusable library without task hindsight causes measurable negative transfer.
- **The generator-backbone interaction** — the demo has no backbone comparison. The paper's finding that SkillNet beats SkillSeekers on Qwen3.6-Plus but loses on GPT-5 is not represented.
- **Real skill generation** — in mock mode, every SKILL.md was written by hand. The paper evaluates whether an LLM can distill a correct procedure from real source material.
- **Real execution** — pass@3 is a static number from the paper. The paper runs generated skills in containerized environments against hidden test cases.
- **The specification-execution gap in action** — the demo asserts this gap exists but does not demonstrate it happening live.

**Bottom line:** It works well as an interactive explainer for someone reading the paper. It does not function as a reproduction of the benchmark.

---

## Links

- **Live Demo:** https://vishalmysore.github.io/skillWorkBenchDemo/
- **Source Code:** https://github.com/vishalmysore/skillWorkBenchDemo
- **Paper:** SkillGenBench — arXiv 2605.18693
- **Related:** https://github.com/vishalmysore/harnessEngineeringDemo

---

## References

- Alzubi et al., 2026 — *EvoSkill: Automated Skill Discovery for Multi-Agent Systems*. arXiv:2603.02766
- Anthropic, 2025 — *Equipping Agents for the Real World with Agent Skills*. Anthropic Engineering Blog
- Anthropic, 2026 — *skill-creator*. Anthropic Agent Skills repository
- Dou et al., 2026 — *CL-Bench: A Benchmark for Context Learning*. arXiv:2602.03587
- Karaaslan, 2026 — *SkillSeekers*. GitHub repository
- Li et al., 2026 — *SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks*. arXiv:2602.12670
- Liang et al., 2026 — *SkillNet: Create, Evaluate, and Connect AI Skills*. arXiv:2603.04448
- Zhou et al., 2026 — *SkillGenBench: Benchmarking Skill Generation Pipelines for LLM Agents*. arXiv:2605.18693
