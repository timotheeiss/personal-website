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

The assistant's scope and refusal rules are in `api/_chat.ts`. The endpoint limits message length,
conversation history, output length, and requests per IP. Before public launch, also configure an API
project spend limit and consider durable rate limiting or bot protection.

## Knowledge base

`knowledge/timothee.md` is the single source of truth for the assistant. The server reads the complete
file for each question and includes the full text in the instructions sent with every OpenAI request.
There is no vector store, embedding, retrieval, or separate compact profile.

Keep the document factual and public. After editing it, restart the local development server or
redeploy the website so the server loads the updated contents.
