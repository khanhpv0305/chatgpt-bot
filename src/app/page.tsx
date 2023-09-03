// Ref: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
'use client'

import { ChatCompletionRequestMessage } from "openai-edge"
import { FormEventHandler, useEffect, useRef, useState } from "react"

export default function Home() {
  const scrollableBoxRef = useRef<HTMLDivElement>(null)

  const [chatHistory, setChatHistory] = useState<ChatCompletionRequestMessage[]>([])
  const [questionInput, setQuestionInput] = useState('')

  const handleQuestionSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const question = questionInput.trim()
    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: question,
    }
    const messagesToBeSent = [
      ...chatHistory,
      userMessage,
    ]

    setChatHistory([
      ...messagesToBeSent,
      {
        role: 'assistant',
        content: '',
      },
    ])

    setQuestionInput('')

    fetch('/api/open-ai', {
      method: 'POST',
      headers: {
       'Content-type': 'application/json',
      },
      body: JSON.stringify({ messages: messagesToBeSent })
    })
      .then((response) => response.body)
      .then((responseBody) => {
        const reader = (responseBody as ReadableStream).getReader()
    
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                  return
                }
                controller.enqueue(value)
                const decodedString = new TextDecoder().decode(value)
                
                setChatHistory(prevHistory => {
                  const latestMessage = prevHistory[prevHistory.length - 1]

                  return [
                    ...prevHistory.slice(0, -1),
                    {
                      ...latestMessage,
                      content: latestMessage.content + decodedString,
                    },
                  ]
                })
                push()
              })
            }
    
            push()
          },
        })
      })
  }

  useEffect(() => {
    if (!scrollableBoxRef.current) return

    scrollableBoxRef.current.scroll(0, 999999)
  }, [chatHistory])

  return (
    <div className="container mx-auto max-w-lg py-4 h-full">
      <div className="bg-white/[.1] rounded-lg py-4 h-full">
        <div
          className="mb-4 flex flex-col justify-end"
          style={{ height: 'calc(100% - 56px)' }}
        >
          <div className="overflow-y-scroll px-4" ref={scrollableBoxRef}>
            {chatHistory.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`flex mb-4 last:mb-0 ${item.role === 'assistant' ? 'justify-end' : ''}`}
                >
                  <div className={`p-4 rounded-lg inline-block max-w-sm ${item.role === 'user' ? 'bg-indigo-500' : 'bg-yellow-600'}`}>{item.content}</div>
                </div>
              )
            })}
          </div>
        </div>

        <form className="px-4" onSubmit={handleQuestionSubmit}>
          <div className="flex h-10">
            <input
              className="grow rounded-lg mr-3 px-3 text-black/[.8] bg-white"
              name='question'
              value={questionInput}
              onChange={e => setQuestionInput(e.target.value)}
            />
            <button
              className="rounded-lg bg-black px-4"
              type='submit'
            >Send</button>
          </div>
        </form>
      </div>
    </div>
  )
}
