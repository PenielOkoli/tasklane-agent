# Module 7 implementation plan

Continue Tasklane Knowledge from commit 538f1ad in a new repository and separate GitHub-connected Vercel project. No historical Git metadata, deployment identity, secrets or verification claims are copied. Module 1 continuity exception follows the user's earlier Tasklane selection.

## Acceptance criteria

- AI generates a bounded plan of up to four typed tools; clarification blocks execution.
- Visible planning, running, tool-use, blocked, approval, paused, completed, cancelled and failed states.
- Each server request advances at most one checkpoint. Writes require explicit approval of the exact proposal; archive additionally requires ARCHIVE.
- Pause/resume/cancel and revised instructions are server-validated. Revision discards unexecuted actions; completed work is retained and disclosed.
- Read tools search the isolated board and Module 6 sample corpus. Tool results and concise decision summaries are inspectable, without private reasoning or credentials.
- Session-bound encrypted checkpoints survive refresh for 24 hours; bounded trace log can be exported. This is a single-browser demo, not durable multi-user job infrastructure.
- Tests cover forbidden transitions, approvals, stale state, clarification, failure/retry, revisions and cancellation. Real model and live browser verification are recorded separately.

## Architecture

AI SDK structured planning with Groq; explicit application state machine and allowlisted tool dispatcher. Client serializes requests. Pause/cancel during an in-flight read queues the control until that read finishes; no subsequent tool begins. Approved writes are atomic checkpoints and cannot be interrupted or undone by cancellation. Existing board Undo is available for its latest change. Encrypted cookie checkpoints have no background worker and no global replay/concurrency prevention. Cross-tab use is unsupported and visibly disclosed.

## References consulted

- https://ai-sdk.dev/docs/agents/overview — model, tools and orchestration components.
- https://openai.github.io/openai-agents-js/guides/human-in-the-loop/ — interruption, human approval and continuation pattern. This implementation uses its own state machine, not the OpenAI Agents runtime.
