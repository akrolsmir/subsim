import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const { message, bloggerId } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'assistant',
          content: `Pretend you are ${bloggerId}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    return NextResponse.json({ response: response.content[0].text })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    )
  }
}
