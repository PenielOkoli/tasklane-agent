# Tasklane Agent

**A little direction. A clear path forward.** FlexiSAF Module 7 — Agentic Frontend Orchestration.

Tasklane continues as a supervised project assistant: an AI-generated plan, inspectable tool calls, approval before every board change, pause/resume/cancel checkpoints, instruction revision, clarification, failure recovery, and an exportable activity trace. Knowledge and Board remain available.

- Repository: https://github.com/PenielOkoli/tasklane-agent
- Live deployment: https://tasklane-agent.vercel.app/
- [Submission and reviewer walkthrough](docs/modules/07/submission.md)
- [Assessment mapping](docs/modules/07/assessment.md)
- [Plan and architecture](docs/modules/07/plan.md)
- [Verification and limitations](docs/modules/07/verification.md)

## Workflow

Goal + provider consent → AI structured plan (up to four typed tools) → clarification or visible plan → one tool checkpoint at a time → read-only result or exact mutation preview → human approval → committed result → next step → completion.

`src/lib/run-engine.ts` owns allowed transitions. `src/app/api/run/route.ts` validates each command and dispatches only allowlisted tools. `src/lib/run-planner.ts` uses AI SDK structured output with Groq. The application orchestrator deliberately owns execution and approval; the model cannot approve itself. No raw chain-of-thought, system prompt, provider payloads or secrets are returned to the browser.

Read tools: `searchTasks`, `searchKnowledge`. Mutations: `createTask`, `setPriority`, `moveTask`, `archiveTask`. Every mutation uses the inherited schema validation, session ownership, expiring proposal and revision checks. Archive additionally requires typing `ARCHIVE`. AI practice scenarios are clearly labeled **fixed plans without a model call**.

## Run and verify

Node 22. Run `npm ci`, configure server-only `SESSION_SECRET` (32+ random characters) and `GROQ_API_KEY`, then `npm run dev`. Never use `NEXT_PUBLIC_` for secrets. `npm run check` checks types, tests and production build.

`node --import tsx scripts/verify-agent.ts <origin>` exercises demo HTTP checkpoints. Add `--live` for real Groq planning and clarification; it modifies only its own isolated test board. Evidence is saved under `docs/modules/07/` without cookies or credentials.

## Honest scope

- Fictional sample documents and isolated demo tasks, not private ingestion or live company data. Knowledge uses lexical retrieval and heuristic confidence.
- Encrypted HttpOnly cookies keep a bounded run checkpoint and board for up to 24 hours. Latest 24 run events and 10 board events only. Export before reset. No durable database or background worker.
- Use one browser tab. Requests are serialized by the UI, but cross-tab requests and replay of old cookies are not globally prevented. This is not production multi-user orchestration.
- Pause/cancel requested during an in-flight operation waits for that request to finish; no next step begins. Already approved changes remain. Board Undo can restore its latest change.
- Revising instructions invalidates the outstanding approval and creates a new plan; earlier committed changes remain. Failed steps require retry/revision. A failed approval remains reviewable and never bypasses its gate.
- AI plans can be wrong, ambiguous or fail schema validation. Approval is a human review checkpoint, not a guarantee of correctness. Practice results and real-model results are reported separately.

## Continuity and deployment

Starts from Tasklane Knowledge commit `538f1ad` in a new repository/project. Module 6 and earlier submissions are unchanged. This continues the user's selected Tasklane product; Tasklane itself was the user's new-product exception to original Module 1 continuity. ShelfSignal stays number 2, RoleBrief number 4, Tasklane number 5, and Tasklane Knowledge number 6.

Each project uses separate sensitive Production variables. GitHub-connected Vercel deployment is required; see verification for the actual deployed commit and connection evidence.
