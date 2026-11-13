# Module 7 assessment mapping

| Requirement | Implementation and evidence |
|---|---|
| Planning, tool use, blocked, approval, running, completed, failed | Typed run state machine; status badge, plan timeline and checkpoint panels in Agent workspace |
| Step-by-step plan and progress | Up to four schema-validated AI steps, tool name/inputs, purpose summary, progress count and results |
| High-impact approval | Every mutation is a server-held proposal; separate approval request, ownership/revision/expiry revalidation; ARCHIVE confirmation |
| Pause/resume/cancel | Server-validated checkpoint transitions; pending writes declined on cancellation; sequential UI queues control during in-flight requests |
| Revise instructions and clarification | Blocked question with replacement instruction form; replanning clears outstanding proposal; completed changes remain |
| Tool results and safe summaries | Allowlisted result summaries, sample retrieval excerpts and board search output; no provider internals or hidden reasoning exposed |
| Traceability | Monotonic event sequence, run ID, checkpoint version, step, event, timestamp, duration and outcome; JSON export; latest 24 events |
| Live supervised AI | Separate deployment with real model checks recorded in verification.md and live-verification.json |

## Reviewer walkthrough

1. Allow provider processing and use the default launch request. Observe planning and the visible plan.
2. Pause, refresh, and resume. Inspect a tool's inputs/results.
3. At approval, compare the proposed change with the board. Confirm no task exists before approval. Approve and inspect completion and Project board.
4. Start another run and cancel before approval. Confirm no pending proposal remains.
5. Use “Missing instructions” practice to see clarification; revise instructions to continue. Practice uses a fixed plan, not the new text as AI input.
6. Use “Recover from a failure” practice; inspect failure and retry from its checkpoint.
7. Revise a real AI run at approval; verify the old approval disappears and a new plan is required.
8. Export the trace. Open Knowledge for the retained Module 6 retrieval interface.

This is Module 7, not a claim of durable full-stack orchestration (Module 13). Continuity follows the explicitly selected Tasklane product, with the earlier Module 1 exception recorded in README.
