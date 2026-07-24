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

The assistant's scope and refusal rules are in `server/chat.ts`. The endpoint limits message length,
conversation history, output length, and requests per IP. Before public launch, also configure an API
project spend limit and consider durable rate limiting or bot protection.

## Knowledge base

For the current small profile, `server/profile-context.ts` is bundled directly with the assistant.
Keep it in sync with the public facts in `knowledge/timothee.md`. Add separate Markdown, text, PDF, or
Word files to `knowledge/` as the material grows—for example `projects.md`, `experience.md`, and a
public résumé. Do not add private contact details or anything you would not publish on the website.

To turn those files into a searchable OpenAI knowledge base:

```sh
npm run knowledge:upload
```

The command creates an OpenAI vector store, uploads every supported file in `knowledge/`, waits for
indexing, and prints a `vs_...` ID. Copy that value into `OPENAI_VECTOR_STORE_ID` in `.env.local` and
your deployment settings, then restart the app. The server will automatically enable OpenAI file
search for each answer.

When documents change, upload the updated set to a fresh vector store and replace the environment
variable. This avoids stale or duplicate chunks; delete the old store in the OpenAI dashboard once
you have verified the new one.
