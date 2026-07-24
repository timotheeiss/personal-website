import { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey || apiKey === 'replace_me') {
  throw new Error('Add a real OPENAI_API_KEY to .env.local before uploading knowledge.')
}

const client = new OpenAI({ apiKey })
const knowledgeDirectory = new URL('../knowledge/', import.meta.url)
const fileNames = (await readdir(knowledgeDirectory))
  .filter((name) => ['.md', '.txt', '.pdf', '.docx'].includes(extname(name).toLowerCase()))

if (!fileNames.length) throw new Error('No supported files were found in the knowledge folder.')

const vectorStore = process.env.OPENAI_VECTOR_STORE_ID
  ? await client.vectorStores.retrieve(process.env.OPENAI_VECTOR_STORE_ID)
  : await client.vectorStores.create({ name: 'Timothee portfolio knowledge' })

for (const fileName of fileNames) {
  const filePath = join(knowledgeDirectory.pathname, fileName)
  process.stdout.write(`Uploading ${fileName}... `)
  const result = await client.vectorStores.files.uploadAndPoll(
    vectorStore.id,
    createReadStream(filePath),
  )
  console.log(result.status)
}

console.log(`\nKnowledge base ready: ${vectorStore.id}`)
console.log('Set OPENAI_VECTOR_STORE_ID to this value in .env.local and in your deployment.')
