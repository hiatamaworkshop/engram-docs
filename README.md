# Engram

Cross-session memory and behavioral intelligence for AI agents. Knowledge that is used survives. Knowledge that isn't, dies.

Persistent memory with metabolic lifecycle, real-time behavior monitoring, and predictive knowledge supply. Zero LLM inference in the infrastructure path.

> Source: [github.com/hiatamaworkshop/engram](https://github.com/hiatamaworkshop/engram)

## Documentation

**[https://engram-docs-8tj.pages.dev](https://engram-docs-8tj.pages.dev)**

- [Overview](https://engram-docs-8tj.pages.dev/engram/overview) — Architecture and design philosophy
- [Receptor Architecture](https://engram-docs-8tj.pages.dev/engram/receptor-architecture) — Emotion engine, neuron triangle, behavioral observation
- [Shadow Index](https://engram-docs-8tj.pages.dev/engram/shadow-index) — Pre-neuron file staleness detection
- [Predictive Inference](https://engram-docs-8tj.pages.dev/engram/predictive-inference) — Emotion-driven proactive knowledge retrieval

## Key Ideas

- **Metabolic memory** — Nodes gain weight through use, decay through neglect, die when irrelevant
- **Receptor** — Three-layer neuron model (A/B/C) observes agent behavior, tracks 5-axis emotion vector, predicts knowledge needs. All pure math, no LLM inference
- **Data Cost Protocol (DCP)** — Compact positional arrays for AI-to-AI communication. Schema registry with hash-based handshake. No natural language overhead
- **Persona / Prior Block** — Session experience distilled into reusable calibration data. No cold start
- **Sphere federation** — Metabolically filtered knowledge feeds into collective intelligence

## Local Development

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview build
```

Built with [VitePress](https://vitepress.dev). Deployed on [Cloudflare Pages](https://pages.cloudflare.com).