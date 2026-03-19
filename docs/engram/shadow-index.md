# Shadow Index — File Staleness Detection

> The agent grabbed a stale file via grep. A newer replacement exists two directories away, but it never appeared in the search results. The agent proceeds confidently with outdated premises. **What isn't visible doesn't exist.**

## Why This Happens

1. **grep/glob is a keyword trap** — Search queries are shaped by prior knowledge. If naming conventions changed, the old file hits and the new one doesn't.
2. **"Found = correct" bias** — Agents don't question the first hit.
3. **Metadata blindness** — `lastModified` exists on every file. Agents never check it.
4. **No metacognition** — Humans feel "something changed recently." AI agents lack this sense.

## Design Philosophy

- **No vector DB or LLM inference** — Operates on file metadata and path strings only
- **Presence signals, not warnings** — Quiet. Fires only when genuinely dangerous
- **Extend the existing PathHeatmap** — Same tree, additional index axes
- **Judgment stays with the agent** — Shadow Index says "something newer exists." It never says "you're wrong."

## Multi-Index HeatNode

Each file node in the PathHeatmap carries 6 dimensions:

```
/services/nodejs/src/config/db.js
  ├── accessCount: 12       [Axis 1: access frequency]
  ├── totalOpened: 3         [Axis 2: times the agent read this file]
  ├── totalModified: 7       [Axis 3: times the agent edited this file]
  ├── lastModified: 1710...  [Axis 4: filesystem mtime — ground truth]
  ├── lastAccess: 1710...    [Axis 5: last agent access — decay basis]
  └── lastTouchedState: "exploring"  [Axis 6: agent state at last access]
```

### Cross-Dimensional Analysis

Single axes are ambiguous. Meaning emerges at **intersections**:

| totalOpened | totalModified | Interpretation |
|:-:|:-:|---|
| High | High | **Safe** — actively working on this file |
| High | Low | **Trap signal** — reading repeatedly but never editing = referencing stale information |
| Low | High | **Blind spot** — frequently changing file the agent hasn't seen |
| Low | Low | Uninteresting. No signal needed |

Combined with `lastModified`:
- High opened × Low modified × Sibling has newer mtime → **Repeatedly falling into a stale file trap**
- Low opened × High modified × Recent mtime → **Active file outside the agent's awareness**

### Agent State Sensitivity

The `lastTouchedState` axis records what the agent was doing when it last accessed a file:

| State at Access | Sensitivity Multiplier | Rationale |
|:-:|:-:|---|
| `idle` | ×1.0 | Zero context. Most vulnerable |
| `exploring` | ×0.8 | Direction undefined |
| `delegating` | ×0.5 | Indirect knowledge via sub-agent |
| `stuck` | ×0.4 | Aware of problems |
| `deep_work` | ×0.1 | Rich context. Likely intentional |

## Three-Stage Scope Expansion

Sibling comparison alone misses files in other directories. The detector expands scope progressively — **each stage runs only if the previous found nothing**:

### Stage 1: Sibling Comparison

Compare files in the same directory. Cost: minimal (traverse `parent.children`).

```
/services/api/config/db.js      ← opened file
/services/api/config/db.old.js  ← detected: same parent
```

### Stage 2: Ancestor Traversal

Walk up 1-2 levels to find cousins.

```
/services/api/config/db.js      ← opened file
/services/api/settings/db.js    ← detected: same grandparent (api/)
```

### Stage 3: Filename Index (Cross-Directory)

A reverse map of `basename → Set<fullPath>` catches same-named files anywhere in the tree:

```
"db.js" → ["/services/api/config/db.js", "/services/worker/config/db.js"]
```

Falls back to Levenshtein distance for near-matches (`.old`, `.bak`, `.v1` suffixes).

### Detection Flow

```
File opened
  │
  ├─ Stage 1: siblings → compare lastModified
  │    └─ found → fire signal, stop
  │
  ├─ Stage 2: ancestors (depth ≤ 2) → compare
  │    └─ found → fire signal, stop
  │
  └─ Stage 3: filenameIndex.get(basename) → compare
       └─ found → fire signal, stop
       └─ nothing → silence
```

## Firing Conditions

All conditions must be met (AND):

1. **Minimum siblings** — At least 3 files in the comparison group (avoid noise from sparse directories)
2. **Staleness percentile** — Target file's `lastModified` is in the bottom 25% of the group
3. **Minimum time delta** — At least 24 hours between target and newest sibling
4. **State multiplier** — Adjusted by agent state sensitivity

## Pattern Classification

When the detector fires, it classifies the pattern:

| Pattern | Condition | Meaning |
|---|---|---|
| `repeated-trap` | totalOpened ≥ 3, totalModified = 0 | Agent keeps reading a file it never edits — stuck in a reference loop |
| `blind-spot` | totalModified ≥ 3, totalOpened = 0 | A frequently-edited file the agent has never looked at |

## Pre-Neuron Monitor — Why It's Independent

This system operates **before** the neuron evaluation layer. This is not an optimization — it's a necessity:

- The staleness detector must run on **every** file access event
- An agent trapped by stale files appears "normal" — the neuron system sees no anomaly
- **The state that needs detection is precisely the state that the detection system (neuron) would never fire on**

Shadow Index signals are injected directly into the hot-memo system (Layer 7), bypassing the neuron pipeline entirely.

```
[Agent tool calls]
       │
       ▼
  pre-neuron monitors (always-on, lightweight)
  │
  │  PathHeatmap.record(event)
  │  ├── Update all 6 axes
  │  └── detectStaleness(path)
  │       ├── 3-stage scope expansion
  │       ├── Cross-dimensional analysis
  │       └── Signal → hot-memo Layer 7 → agent
  │
  ▼
  neuron evaluation (receives pre-neuron signals
                     alongside its own detections)
```

## Two-Tier Lifecycle

### Active HeatNode (48 hours)

Full 6-axis data, updated on every event. Time-decayed access counts via:

```
effectiveCount = count × exp(-(now - lastAccess) / halfLife)
```

Half-life: 2 hours. Old work areas cool naturally.

### Index Vector (2 weeks / 500 cap)

When an Active HeatNode expires, it's compressed to a 6-dimensional vector (percentile-normalized within siblings). Lightweight: one path string + 6 floats + timestamp.

**Purpose**: Detect recurring trap patterns across sessions. A new Active HeatNode matching a past Index Vector means "you fell into this exact pattern before."

The `filenameIndex` (Stage 3 reverse map) persists through Index Vector compression — deleted only when the Index Vector itself expires.

## Future: Immune System Extensions

### Antibody Memory — Engram Integration

Confirmed trap patterns can be persisted to engram as long-term immune memory, independent of the 48h/2-week lifecycle. On session start, pull past traps → seed heatmap with initial bias.

### Inflammatory Response — Neuron Sensitivity Modulation

Shadow Index alerts could feed back into the neuron system: raise input gain on frustration/seeking, lower thresholds locally for directories where anomalies were detected. Pre-neuron monitor modulating the neuron's own sensitivity — cytokine behavior.

### Signal Delivery Cascade

Single-channel delivery (hot-memo) risks being ignored. Multi-path delivery mirrors immune cascading: neuron-mediated indirect discomfort (ground preparation) → explicit hot-memo alert → escalation if ignored.

### Self vs Non-Self Discrimination

Distinguish agent's own edits from external changes (human edits, git pull, other processes). Detect when the agent operates on files modified externally with outdated assumptions. The existing `lastModified` mechanism naturally extends to this.

## Symmetry with Future Probe

| | Shadow Index | Future Probe |
|---|---|---|
| **Temporal direction** | Past — are the premises valid? | Future — will the consequences match expectations? |
| **Trigger** | File access events | Emotion signals (seeking, frustration) |
| **Detection** | Metadata comparison (mtime, access counts) | Centroid projection + similarity search |
| **Output** | "Something newer exists that you haven't seen" | "This action may not lead where you think" |

Together they form a **temporal safety net**: one validates what the agent is building on, the other validates where it's heading.