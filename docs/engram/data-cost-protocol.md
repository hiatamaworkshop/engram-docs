# Data Cost Protocol — AI Native Data Format

> If no human reads the data, there's no reason to write it in a human-readable format.

## The Problem

LLMs produce and consume text at extraordinary cost. Every token matters — in API billing, context window budget, and inference latency. Yet the data AI agents exchange with each other is overwhelmingly formatted for human readability: verbose JSON with repeated keys, natural language descriptions where structured data would suffice, self-documenting formats read by no one.

The question is simple: **if only machines read this data, why are we formatting it for humans?**

## Core Idea

Data Cost Protocol (DCP) is a convention for AI-to-AI data exchange. The rules:

1. **Define a schema once** — field names, order, and types declared in a header
2. **Write data by position** — no keys, no labels, no repetition. The schema says what position 3 means
3. **Inline the schema with the data** — no external documentation needed to interpret

This is not a new serialization format. It's a design discipline: **strip everything the consumer doesn't need**.

## Before and After

### Simple case

```json
[
  { "id": 1, "name": "Alice", "score": 92 },
  { "id": 2, "name": "Bob", "score": 85 },
  { "id": 3, "name": "Charlie", "score": 88 }
]
```

With DCP:

```
[schema: id, name, score]
[[1,"Alice",92],[2,"Bob",85],[3,"Charlie",88]]
```

### Real-world case: AI agent session handoff

A session's emotional trajectory, passed from one agent session to the next:

```json
{
  "timestamp": 17900,
  "gap": 0,
  "state": "exploring",
  "intensity": 0.36,
  "frustration": 0,
  "seeking": -0.36,
  "confidence": 0,
  "fatigue": 0.03,
  "flow": 0
}
```

With DCP:

```
[schema: A=arc(t,gapMs,state,intensity,frust,seek,conf,fatigue,flow)]
["A",17900,0,"exploring",0.36,0,-0.36,0,0.03,0]
```

One record, ~70% smaller. A session produces dozens to hundreds of these. The savings compound.

## Three-Line Wire Format

For streaming heterogeneous data, DCP uses a three-line structure:

```
[manifest: what this data is and why it exists]
[schema: field definitions for all record types]
[...data...]
```

Manifest declares intent. Schema declares structure. Data follows. A receiving agent reads three lines and knows everything it needs — no external docs, no API reference, no guesswork.

### Engram's Prior Block — a live example

```
[prior-block: prior session experience. use as context for continuity.]
[schema: H=header(durationMs,valenceBalance,frust,seek,conf,fatigue,flow,stateFlow)
         A=arc(t,gapMs,agentState,intensity,dFrust,dSeek,dConf,dFatig,dFlow,engramId?)
         F=footer(finalEmotion[5],stats[5],stateRatio[...],engramTop[...],hotPaths[...],methodRank[...])]
[["H",681804,1,0,-0.36,0,0.03,0,"exploring→deep_work"],["---"],["A",17900,0,...],...]
```

This carries a full session's emotional trajectory — state transitions, emotion deltas, file access patterns, method rankings, knowledge references — in under 2KB. The natural language equivalent exceeds 30KB.

## Design Properties

### "Self-describing" vs "Pre-agreed"

JSON is self-describing: every value carries its own key. This is friendly for humans who browse raw data. For machines processing thousands of records, those keys are pure waste — the consumer already knows the schema.

DCP is pre-agreed: the schema is declared once, and all subsequent records follow it implicitly. This is how binary protocols (Protocol Buffers, MessagePack) have always worked. DCP applies the same principle to text — because LLMs consume text, not binary.

### Position is meaning

In DCP, the position of a value within an array determines its semantics. This is identical to how CSV works, and how function arguments work in every programming language. It's the oldest data convention in computing, applied to AI-to-AI communication.

### Inline schema eliminates drift

The schema travels with the data. There's no separate documentation to fall out of sync, no version negotiation, no "which schema does this payload use?" question. Read the header, parse the data. One step.

### Normalize values

LLM tokenizers treat numbers differently by form. `0.36` costs 2 tokens; `92` costs 1. Precision the consumer doesn't need is wasted tokens.

DCP recommends normalizing values to the simplest representation that preserves meaning:

- Emotion axes at 0.01 precision? Consider integers 0-100 instead of floats 0.00-1.00
- Timestamps in milliseconds? If second granularity suffices, divide first
- Boolean-like values? `0`/`1` over `true`/`false` (fewer tokens)

Match data resolution to the consumer's actual needs — the same principle as choosing `int16` over `float64` in binary protocols, applied to token cost.

## Where DCP Lives in Engram

DCP isn't a standalone library. It's a design principle applied throughout the system:

| Component | What it carries | Format |
|---|---|---|
| **Prior Block** | Session emotional trajectory | `H/A/F` record types, delta-encoded emotion |
| **Experience Package** | Persona + Prior Block unified | DCP as Sphere Node content (L3) |
| **CLAUDE.md compilation** | Agent instruction set | Compressed structured directives |
| **Hot Memo layers** | Session context for agent | Position-based compact arrays |

The measured reduction on CLAUDE.md instruction compilation was **71% token savings** — same semantic content, fraction of the cost.

## Why This Matters

The AI industry is approaching data exchange as a JSON optimization problem (TOON, compressed JSON variants). These strip syntax overhead — braces, quotes, colons — but preserve the key-value structure.

DCP asks a different question: **why have keys at all?** If the consumer knows the schema, every key is a wasted token. For N records with K fields, JSON repeats K key names N times. DCP states them once.

As multi-agent systems emerge — agents handing off work, sharing experience, streaming behavioral data — the volume of AI-to-AI communication will dwarf AI-to-human output. Formatting that traffic for human readability is a cost no one will want to pay.

> You minify JavaScript before deploying to production. Why wouldn't you minify data before sending it to an AI?

## Benchmark: DCP vs JSON vs Natural Language

Claims need numbers. We ran a reproducible benchmark comparing the same receptor firing data in three formats across data size, parse speed, and LLM token cost.

### Data Size (10,000 records)

| Format | bytes/record | vs DCP |
|--------|-------------|--------|
| DCP compact | 83 B | 1.00x |
| JSON (JSONL) | 182 B | 2.19x |
| Natural language | 223 B | 2.69x |

DCP is less than half the size of JSON, roughly a third of natural language. The ratio is stable across scales (100 to 10,000 records).

### Parse Speed (10,000 records)

| Format | Total | per record | vs DCP |
|--------|-------|-----------|--------|
| DCP compact | 10.9 ms | 1.09 μs | 1.00x |
| JSON (JSONL) | 15.8 ms | 1.58 μs | 1.45x |
| Natural language | 26.6 ms | 2.66 μs | 2.44x |

The NL figure is regex parsing against a controlled template. Real-world natural language requires LLM inference — orders of magnitude slower.

### Token Cost (LLM context consumption)

| Format | 10,000 records | vs DCP | at $3/1M tokens |
|--------|---------------|--------|-----------------|
| DCP compact | ~207K tokens | 1.00x | $0.62 |
| JSON (JSONL) | ~455K tokens | 2.19x | $1.36 |
| Natural language | ~557K tokens | 2.69x | $1.67 |

### The Real Gap: Parsing Cost

DCP and JSON parse with zero LLM cost — string operations only. Natural language requires LLM inference to extract structured data:

```
1,000 records parsing cost:
  DCP/JSON: $0.0000  (JSON.parse / array index)
  NL:       $0.2163  (Sonnet input + output tokens)
```

The most expensive thing about natural language in AI-to-AI communication isn't the bytes — it's that **parsing requires inference**.

### Reproduce

The benchmark script generates synthetic receptor data and measures all three axes. Available at [`benchmarks/dcp-vs-json-vs-nl/`](https://github.com/hiatamaworkshop/engram/tree/main/benchmarks/dcp-vs-json-vs-nl) in the engram repository:

```bash
cd benchmarks/dcp-vs-json-vs-nl
npm install
npx tsx bench.ts
```
