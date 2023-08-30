'use client'

import { FormEventHandler, useEffect, useRef, useState } from "react"

export default function Home() {
  const scrollableBoxRef = useRef<HTMLDivElement>(null)

  const [chatHistory, setChatHistory] = useState<{
    timestamp: number
    from: 'bot' | 'user'
    content: string
  }[]>([])
  const [questionInput, setQuestionInput] = useState('')
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false)

  const handleQuestionSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const question = questionInput.trim()

    setChatHistory(prevHistory => [
      ...prevHistory,
      {
        timestamp: Date.now(),
        from: 'user',
        content: question,
      },
    ])

    setQuestionInput('')
    setIsGeneratingAnswer(true)

    const answer = await fetch(`http://localhost:3000/api/open-ai?question=${question}`)
      .then(data => data.json())

    setIsGeneratingAnswer(false)
    
    setChatHistory(prevHistory => [
      ...prevHistory,
      {
        timestamp: Date.now(),
        from: 'bot',
        content: answer,
      },
    ])
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
            {chatHistory.map((item) => {
              return (
                <div
                  key={item.timestamp}
                  className={`flex mb-4 last:mb-0 ${item.from === 'bot' ? 'justify-end' : ''}`}
                >
                  <div className={`p-4 rounded-lg inline-block max-w-sm ${item.from === 'user' ? 'bg-indigo-500' : 'bg-yellow-600'}`}>{item.content}</div>
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
