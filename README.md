# Fern Hollow front desk

Fern Hollow Early Learning is a fictional early-learning center, and this is an AI front desk prototype for it. `/` is a parent chat with an assistant named Wren. `/staff` is a control center with a question log and an editable policy handbook. Live at https://fern-hollow.vercel.app.

## How it works

- All 12 of the center's policies go into the system prompt, and Wren answers only from them, saying so plainly when a question falls outside them.
- A reporting `cite` tool, which the model calls at the end of a reply, returns which policy ids grounded the answer, powering the "From the Parent Handbook" chip in the chat and the match column in the staff log.
- An `escalate` tool flags sensitive questions instead of answering them, powering the terracotta "Flagged for the front desk" card in the chat and the escalated badge in the staff log.
- Every question, answer, its citations, and its outcome are logged server-side in the stream's `onEnd` callback.
- Upstash Redis stores both the staff-edited policies and the question log.

At 10 policies, retrieval is a system prompt; at 10,000 it becomes a search tool, and the seam is already in `lib/prompt.ts`.

## Design

Palette and type come from the subject: a Pacific Northwest, forest-named center calls for deep pine greens, warm linen, and a serif display face for trust. The parent view is mobile-first because parents live on phones.

## Time spent

About three hours: a short provisioning evening plus a focused build session.

## Included

- Mobile-first layout, with safe-area and keyboard handling
- Voice input, with a live waveform, that transcribes speech into the composer where supported and hides itself where it is not
- Injection hardening: staff-edited policy text is escaped and fenced with a trust boundary before it enters the prompt, so a policy body cannot break out of its tag or issue instructions
- Accessibility: an announce-once status indicator instead of token-by-token screen-reader spam, focus returned to the input after send, reduced motion fallbacks, 4.5:1 contrast, and 44px touch targets
- Streaming with stop and retry-in-place
- Honest no-match behavior that becomes a staff to-do
- No real personal data anywhere

## Deliberately deferred

- Auth, since both views would sit behind a login in production
- Rate limiting, since a single-link prototype has no meaningful traffic to throttle
- An eval harness, which is what the production version gets
- Moving grounding out of the system prompt into tool results, so the model applies the skepticism it is trained to give retrieved content
- The native Citations API, which grounds answers at the document level rather than through a reporting tool
- Document ingestion, since policies are structured records here on purpose

A single shared store, last-writer-wins saves, and no versioning: all deliberate for a prototype.
