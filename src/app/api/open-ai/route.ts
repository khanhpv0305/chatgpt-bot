import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateText = async (content: string) => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content}],
    model: 'gpt-3.5-turbo',
  })

  return completion.choices[0].message.content
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const question = searchParams.get('question')

  const answer = await generateText(question || '')

  return NextResponse.json(answer);
}

// export const POST = async (request: NextRequest) => {
//   const { messages } = await request.json()

//   const stream = await openai.chat.completions.create({
//     model: 'gpt-4',
//     messages: [{ role: 'user', content }],
//     stream: true,
//   })
// }

export const revalidate = 60 * 30
