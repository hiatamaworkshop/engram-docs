# Engram — Immune System for AI Agents

External monitoring infrastructure that detects what the agent cannot see.

As AI agents become more capable, they decide faster — and become more vulnerable to information outside their search results. Engram provides a passive sensory layer that watches agent behavior and surfaces staleness signals, knowledge gaps, and blind spots without consuming LLM inference.

## Documentation

**[https://engram-docs-8tj.pages.dev](https://engram-docs-8tj.pages.dev)**

- [Overview](https://engram-docs-8tj.pages.dev/engram/overview) — Architecture and design philosophy
- [Receptor Architecture](https://engram-docs-8tj.pages.dev/engram/receptor-architecture) — Emotion engine, neuron triangle, behavioral observation
- [Shadow Index](https://engram-docs-8tj.pages.dev/engram/shadow-index) — Pre-neuron file staleness detection
- [Predictive Inference](https://engram-docs-8tj.pages.dev/engram/predictive-inference) — Emotion-driven proactive knowledge retrieval

## Key Ideas

- **No LLM in the monitoring path** — File metadata, decay functions, threshold comparisons only
- **Three-layer neuron model** (A/B/C) derived from bio-inspired audio processing
- **Shadow Index** detects stale file access that the neuron system structurally cannot see
- **Field coupling** — Layers modulate each other through shared state, not commands
- **Time decay as the sole weight mechanism** — No arbitrary coefficients

## Local Development

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview build
```

Built with [VitePress](https://vitepress.dev). Deployed on [Cloudflare Pages](https://pages.cloudflare.com).