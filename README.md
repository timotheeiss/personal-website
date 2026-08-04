# Timothee Issenmann — Portfolio

A responsive, interactive one-page portfolio built with React, TypeScript, Vite, and plain CSS.

## Local development

```sh
npm install
npm run dev
```

Run the verification suite with `npm test` and create a production build with `npm run build`.

Theme choices live in `src/data/themeOptions.ts`. Project content lives in `src/App.tsx`, and each
mockup placeholder can be replaced by passing an image, alt text, and optional link to
`MockupPlaceholder`.

## Portfolio assistant

The browser sends questions to the server-side `/api/chat` endpoint. The OpenAI API key is never
included in the client bundle.

1. Create an API key at https://platform.openai.com/api-keys.
2. In `.env.local`, replace `replace_me` with the key.
3. Restart `npm run dev` after changing environment variables.

`.env.local` is ignored by Git. Add the same variables as encrypted environment variables in the
deployment platform. The `api/chat.ts` route is ready for Vercel-compatible serverless deployment;
a static-only host cannot run the chat endpoint.

The assistant's scope and refusal rules are in `api/chat.ts`. The endpoint streams answer text to the
browser as it is generated and limits message length, conversation history, output length, and requests
per IP. Before public launch, also configure an API project spend limit and consider durable rate
limiting or bot protection.

### Chat transcripts

Every completed user/assistant exchange is stored in the connected Supabase project's `chat_turns`
table. The browser creates a random conversation ID per browser session; it is not an account or a
persistent visitor identifier. To enable recording, set these server-only environment variables locally
and in Vercel:

```sh
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

Use a Supabase secret key from **Settings → API Keys**, never a publishable key, and do not prefix it
with `VITE_`. For older Supabase projects, `SUPABASE_SERVICE_ROLE_KEY` is also supported. The chat still
answers if transcript recording is misconfigured, but the server logs the failure so visitor conversations
are never exposed or blocked by the logging integration.

## Knowledge base

`knowledge/timothee.md` is the single source of truth for the assistant. The server reads the complete
file for each question and includes the full text in the instructions sent with every OpenAI request.
There is no vector store, embedding, retrieval, or separate compact profile.

Keep the document factual and public. After editing it, restart the local development server or
redeploy the website so the server loads the updated contents.

## Contact form

The contact modal sends messages through the server-side `/api/contact` endpoint. To configure it:

1. Add and verify `timissenmann.com` in Resend.
2. Create a sending-only Resend API key.
3. Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in `.env.local` and in the
   deployment environment.
4. Restart the development server or redeploy after changing the variables.

The default sender is `Timothee Portfolio <contact@timissenmann.com>`. Messages are delivered to
`timothee.issenmann@gmail.com`, with the visitor's address set as `reply-to` so replies from the inbox
go directly to them. The endpoint validates input, includes a honeypot, and applies a basic per-IP
rate limit.
