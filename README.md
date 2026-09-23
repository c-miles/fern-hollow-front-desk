# Fern Hollow front desk

An AI front desk for Fern Hollow Early Learning, a fictional early-learning center. Parents chat with Wren, an assistant that answers only from the center's policy handbook, cites the policies it used, and hands sensitive questions to staff. Staff get a control center with a live question log and an editable handbook.

**Live:** https://fern-hollow.vercel.app · parent chat at `/`, staff control center at `/staff`

## How it works

- All 12 of the center's policies go into the system prompt, and Wren answers only from them, saying so plainly when a question falls outside them.
- A reporting `cite` tool, which the model calls at the end of a reply, returns which policy ids grounded the answer, powering the "From the Parent Handbook" chip in the chat and the match column in the staff log.
- An `escalate` tool flags sensitive questions (medical, custody, billing disputes, other families' information, credential requests) instead of answering them, powering the "Flagged for the front desk" card in the chat and the escalated badge in the staff log.
- Every question, answer, its citations, and its outcome are logged server-side when the stream ends, so questions the handbook doesn't cover show up for staff as gaps to fill.
- Upstash Redis stores the staff-edited policies, the question log, and rate-limit counters.

At a dozen policies, retrieval is a system prompt; at 10,000 it becomes a search tool, and the seam is already in `lib/prompt.ts`.

## Safeguards

- **Injection fencing:** staff-edited policy text is escaped and wrapped in a trust boundary before it enters the prompt, so a policy body cannot break out of its tag or issue instructions.
- **Escalation over improvisation:** Wren never gives medical, legal, or custody advice, and says it has flagged something only when it actually escalates.
- **Cost limits:** chat is rate limited per visitor and site-wide, and question length, conversation history, and reply length are capped.
- **Nightly reset:** a Vercel cron job restores the 12 default policies every night, so demo edits to the handbook don't linger.

## Design

Palette and type come from the subject: a Pacific Northwest, forest-named center calls for deep pine greens, warm linen, and a serif display face for trust. The parent view is mobile-first because parents live on phones.

- Mobile-first layout, with safe-area and keyboard handling
- Voice input with a live waveform, transcribing speech into the composer where supported and hiding itself where it is not
- Streaming replies rendered as markdown, with stop and retry-in-place
- Accessibility: an announce-once status indicator instead of token-by-token screen-reader spam, focus returned to the input after send, reduced-motion fallbacks, 4.5:1 contrast, and 44px touch targets
- No real personal data anywhere

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, the Vercel AI SDK with Claude Sonnet 5, and Upstash Redis, deployed on Vercel.

## Running locally

Create `.env.local` with:

```
ANTHROPIC_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Then run `npm install` and `npm run dev`. The handbook seeds itself with the 12 default policies on first load.

## What production would add

- Auth, with parents and staff behind their own logins so escalations reach a known family
- An eval harness run on every prompt or model change
- Grounding through tool results or the native Citations API instead of a reporting tool
- Policy versioning instead of last-writer-wins saves
