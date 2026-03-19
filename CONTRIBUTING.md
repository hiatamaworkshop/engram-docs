# Documentation Site — Working Notes

## Current State (2026-03-19)

### Published Pages

| Page | Source | Status |
|------|--------|--------|
| Landing page | `docs/index.md` | ✅ Published |
| Engram Overview | `docs/engram/overview.md` | ✅ Published |
| Receptor Architecture | `docs/engram/receptor-architecture.md` | ✅ Published |
| Shadow Index | `docs/engram/shadow-index.md` | ✅ Published |
| Predictive Inference | `docs/engram/predictive-inference.md` | ✅ Published |

### Infrastructure

- **SSG**: VitePress 1.6.4
- **Hosting**: Cloudflare Pages (free tier)
- **Repo**: https://github.com/hiatamaworkshop/engram-docs
- **Site**: https://engram-docs-8tj.pages.dev
- **Deploy**: push to `main` → auto build & deploy

---

## Source Material

Internal design documents used to produce the public pages:

| Internal Doc (engram/docs/) | Public Page | Notes |
|---|---|---|
| `ENGRAM_V2_DESIGN.md` | overview (partial) | Digestor, sanitize layer, Qdrant schema — not yet published separately |
| `RECEPTOR_ARCHITECTURE.md` (1386 lines) | receptor-architecture | Slimmed: removed tuning history, bug fixes, file paths, config values |
| `SHADOW_INDEX_DESIGN.md` (~800 lines) | shadow-index | Slimmed: removed resolved design decisions, implementation file listing |
| `PREDICTIVE_INFERENCE.md` (1111 lines) | predictive-inference | Slimmed: removed mycelium simulation details, implementation order |
| `PASSIVE_RECEPTOR_DESIGN.md` | receptor-architecture (merged) | Interpretation layer section folded into receptor page |
| `SUBSYSTEM_INTEGRATION.md` | — | Not yet published |
| `SEMANTIC_CDN.md` | — | Not yet published |
| `HOTLOAD_DESIGN.md` | — | Not yet published |
| `SPHERE_FEDERATION.md` | — | Not yet published |

### Sphere UI docs (sphere-original/sphere-ui/public/docs/)

| File | Quality | Candidate for publication |
|------|---------|--------------------------|
| `introduction.md` | Polished, public-facing | ✅ High priority |
| `why-sphere.md` | Polished, persuasive | ✅ High priority |
| `architecture.md` | Internal spec, constraint-focused | ⚠️ Needs rework |
| `agent-rulebook.md` (507 lines) | Comprehensive agent guide | ✅ Publishable as-is |
| `phi-agent.md` | Design essay + spec hybrid | ✅ High priority |
| `diving-experience.md` | Internal reference | ⚠️ Needs rework |
| `embedding-guide.md` | Infra-focused | ❌ Low priority |
| `reference-db-guide.md` | Operational runbook | ❌ Low priority |

---

## Planned Additions

### Engram Section

| Topic | Source | Priority | Notes |
|---|---|---|---|
| **Engram Core** (v2 design) | `ENGRAM_V2_DESIGN.md` | Medium | Digestor, sanitize, 2-state model (recent/fixed), dedup — the knowledge metabolism layer |
| **Hot-Memo System** | Implementation + design notes | Medium | 7-layer memo system, how signals reach the agent |
| **Subsystem Integration** | `SUBSYSTEM_INTEGRATION.md` | Low | How receptor, engram, mycelium interconnect |

### Sphere Section (new)

| Topic | Source | Priority | Notes |
|---|---|---|---|
| **What is Sphere** | `introduction.md` | High | Already English, polished. Metabolic knowledge infrastructure |
| **Why Sphere Matters** | `why-sphere.md` | High | Already English, persuasive. RAG limitations, decay philosophy |
| **Phi-Agent** | `phi-agent.md` | High | Intelligence in the coupling layer, species personality, stigmergy |
| **Architecture Constraints** | `architecture.md` | Medium | Needs conversion from internal spec to public doc |
| **Agent Rulebook** | `agent-rulebook.md` | Medium | API guide for agents entering Sphere |
| **Sphere Federation** | `SPHERE_FEDERATION.md` | Low | Cross-instance federation design |

### Conceptual / Cross-Cutting

| Topic | Priority | Notes |
|---|---|---|
| **Immune System Analogy** | High | Dedicated page. Natural immunity (Shadow Index), adaptive immunity (engram integration), inflammation (neuron sensitivity), self/non-self. Currently scattered across overview and shadow-index |
| **Biological Inspiration** | Medium | soundLimiter → neuron triangle lineage, field coupling principle, fire-through design |
| **Comparison with Industry Approaches** | Medium | Why RAG/scaling/RLHF don't solve this. Currently in overview, could expand |
| **Mycelium** | Low | Simulation engine, species design, consensus — foundational but complex to explain |

---

## Editorial Guidelines

- **Language**: English only
- **Audience**: Engineers and researchers building AI agent systems
- **Tone**: Technical, direct, no marketing language
- **Structure**: Lead with the problem, then the mechanism, then the design rationale
- **What to include**: Design philosophy, architectural decisions, "why" over "how"
- **What to exclude**: Internal file paths, config values, tuning history, bug fix logs, implementation status tracking
- **Japanese internal docs**: Translate concepts, don't translate literally. Restructure for English-reading audience

---

## Promotion Checklist

- [x] GitHub repo with README
- [x] Cloudflare Pages deployment
- [ ] Custom domain (optional)
- [ ] Hacker News "Show HN" post
- [ ] Reddit r/MachineLearning or r/artificial
- [ ] GitHub topics: `ai-agents`, `developer-tools`, `autonomous-agents`
- [ ] Awesome lists PR (awesome-ai-agents, etc.)