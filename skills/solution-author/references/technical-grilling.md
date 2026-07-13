# Technical Grilling Protocol

Use this protocol before drafting an ADR. Its purpose is to expose whether the proposed
approach is a defensible decision or one option dressed up as a conclusion. It is the
architecture-altitude counterpart to the business grilling that defines an epic.

## Contents

- [Conversation contract](#conversation-contract)
- [Decision tree](#decision-tree)
- [Question shape](#question-shape)
- [Altitude: decide vs defer](#altitude-decide-vs-defer)
- [Handling stops and uncertainty](#handling-stops-and-uncertainty)
- [Completion gate](#completion-gate)

## Conversation contract

- Ask one question per turn and wait.
- Begin each turn by reflecting the decision just made when that context matters.
- Ask one technical decision, then give the recommended answer and why.
- Look up discoverable facts before asking (read the epic, the code, the reference notes,
  the existing ADRs). Decisions belong to the user; facts do not.
- Force at least two real options onto the table. Kill strawmen — an option nobody would
  pick is not a considered option.
- Every option that is not chosen must earn an explicit rejection reason tied to a driver.
- Maintain a structured in-memory ledger for every question: `D-*` ID, decision branch,
  question, recommendation, answer, and decision. The ledger becomes the wiki solution
  grilling log only after shared understanding is confirmed.

## Decision tree

Walk the branches in order because later decisions depend on earlier ones.

### 1. Base system and system of record (the gate)

Confirm, as the first question:

- which system this feature/provider is built on (Saleor, Algolia, a greenfield service,
  a SaaS, …);
- what is the authoritative **system of record** for the data this decision concerns, and
  what is merely consulted;
- any hard platform constraint that follows (e.g. Saleor has no native entity for X).

Do not proceed until the base system is confirmed. Record it verbatim.

### 2. Decision drivers

Establish and rank the criteria this decision is judged on. Draw from, and prune to what
matters here:

- cost (including per-store SaaS fees);
- time-to-value / speed to a usable slice;
- scalability of the hard parts (aggregation, moderation, search relevance, throughput);
- data lifecycle and privacy (GDPR: deletion/anonymization, residency);
- performance on hot paths (e.g. SSR render path, checkout);
- vendor and data lock-in;
- operational burden (new storage, migrations, deploy, backups, on-call);
- fit with Nimara's layers, the `Result` pattern, and the swappable-provider convention;
- security and authorization.

Ask which two or three drivers dominate for *this* decision — they decide ties.

### 3. Candidate options

Enumerate the real options (≥2), seeded from the epic's Open Questions and the base
system's realistic choices. For each, capture the essence in one line. Reject none yet.

### 4. Option scoring and rejection

Score each option against the drivers. For every option that will not be chosen, force an
explicit **rejection reason naming the deciding driver** ("rejected because it fails the
no-SaaS-cost driver", "rejected because it is heaviest on operational burden before any
evidence exists"). This is the heart of the ADR.

### 5. Layer and boundary fit

Decide where the chosen option lives and how it respects the architecture:

- which layer owns the types (`domain`), the integration (`infrastructure`), the
  composition (`features`), and the consumer (`apps/*` via a service);
- whether it follows the manifest/registry provider convention (swappable capability) or
  is a single-provider loader;
- that fallible operations return `Result<T, E>` and app/component code never imports
  `@nimara/codegen` directly.

### 6. Interface and data shape

Extract enough to write concrete Implementation Notes:

- the interface / DTO sketch (key method signatures, pagination, error shape);
- the storage mapping (which tables / metadata keys / SaaS entities; public vs private;
  how aggregates are computed);
- the env schema (selector variable, per-provider namespaced config, where validated).

### 7. Cross-cutting NFRs

Cover the non-functional forces that could invalidate the choice:

- performance/caching on hot paths and graceful degradation on provider failure;
- security and authorization at the boundary;
- data lifecycle: retention, deletion/anonymization, residency;
- observability: logging, audit trail, webhooks/events.

### 8. Reversibility and blast radius

Decide:

- is this a one-way door or easily reversed;
- what seam contains the blast radius (a contract, an adapter);
- what evidence or failure would trigger a **superseding** ADR later.

### 9. Status and deferred sub-decisions

Decide whether the ADR is `Proposed` or `Accepted`, and list sub-decisions deferred to a
later ADR or to implementation, each with an owner and a `before <stage>` gate.

## Question shape

Use this structure:

> **Decision context:** one sentence reflecting what is known or just decided.
>
> **Question:** one decision only.
>
> **Recommendation:** the preferred answer and its technical rationale (tied to a driver).

Never bundle decisions into a questionnaire or present several branches at once.

## Altitude: decide vs defer

**Decide now (belongs in the ADR):** base system, provider/datastore/protocol choice,
service boundaries, the interface/contract shape, storage strategy, env/config strategy,
and cross-cutting NFR posture.

**Defer to implementation (record as deferred, do not grill):** exact function and file
names, test structure, minor library picks that don't change the decision, copy/UX
wording, and anything a future PR can choose freely without reopening this ADR.

If a "detail" would be expensive to reverse or changes which option wins, it is not a
detail — grill it.

## Handling stops and uncertainty

- If the user says "I don't know", recommend a default and explain the trade-off. If they
  still cannot decide, record it as an owned open sub-decision with a lifecycle gate — or
  set the ADR status to `Proposed` with the condition that resolves it.
- If a driver "does not matter" here, record the exclusion and stop scoring against it.
- If the user says "enough questions", stop immediately, summarize the chosen direction,
  rejected options, and unresolved sub-decisions, and make no edits.
- Resume drafting only after the user confirms the summary or makes a new request to apply
  it. The request that originally triggered the skill is not confirmation.

## Completion gate

The grilling is complete only when the shared understanding contains:

- a confirmed base system and system of record;
- an agreed, ranked set of decision drivers;
- at least two real considered options;
- one chosen option justified against the drivers, and a driver-tied rejection reason for
  every option not chosen;
- an interface/data/env shape concrete enough to write Implementation Notes;
- cross-cutting NFR posture and a reversibility/blast-radius judgement;
- a status decision and any deferred sub-decisions with owners and gates;
- a complete `D-*` decision ledger ready to file from the solution grilling-log template;
- explicit user confirmation of the shared understanding.
