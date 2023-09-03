import { NextRequest, NextResponse } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import openai from '@/services/openai';

export const runtime = 'edge'

export const POST = async (request: NextRequest) => {
  const { messages } = await request.json()

  const aiResponse = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
    max_tokens: 500,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  })

  const stream = OpenAIStream(aiResponse)
 
  return new StreamingTextResponse(stream)
}

export const revalidate = 60 * 30
