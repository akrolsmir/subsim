import { CoreMessage, streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { getBloggerPrompt } from './prompts'

export async function POST(req: Request) {
  try {
    const resp = await req.json()
    console.log('resp', resp)
    const { messages: userMessages, bloggerId, input } = resp

    const messages = [
      { role: 'assistant', content: getBloggerPrompt(bloggerId) },
      ...userMessages,
    ] as CoreMessage[]

    return streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages,
    }).toDataStreamResponse()
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
    })
  }
}
