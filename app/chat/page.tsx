'use client'

import { useState } from 'react'
import Image from 'next/image'

type Blogger = {
  id: string
  name: string
  avatar_url: string
  description: string
}

type Message = {
  id: string
  sender: string
  content: string
  timestamp: Date
}

const bloggers: Blogger[] = [
  {
    id: 'scott-alexander',
    name: 'Scott Alexander',
    avatar_url: 'https://avatars.githubusercontent.com/u/0',
    description:
      'Rationalist blogger, psychiatrist, author of Astral Codex Ten',
  },
  {
    id: 'gwern',
    name: 'Gwern Branwen',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    description:
      'Research writer focusing on psychology, statistics, and technology',
  },
  {
    id: 'matt-levine',
    name: 'Matt Levine',
    avatar_url: 'https://avatars.githubusercontent.com/u/2',
    description: 'Bloomberg Opinion writer, focuses on finance and law',
  },
  {
    id: 'austin-chen',
    name: 'Austin Chen',
    avatar_url:
      'https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/10bd8a14-4002-47ff-af4a-92b227423a74/avatar',
    description: 'I made this site!',
  },
]

export default function ChatPage() {
  const [selectedBlogger, setSelectedBlogger] = useState<Blogger | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedBlogger) return

    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date(),
    }
    setMessages([...messages, newMessage])
    setInput('')

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input,
        bloggerId: selectedBlogger.id,
      }),
    })

    const data = await response.json()
    if (data.response) {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((msgs) => [...msgs, aiMessage])
    }
  }

  return (
    <div className="flex h-screen">
      {/* Blogger Selection Pane */}
      <div className="w-1/4 border-r bg-gray-50 p-4">
        <h2 className="text-xl font-bold mb-4">Select a Blogger</h2>
        <div className="space-y-2">
          {bloggers.map((blogger) => (
            <div
              key={blogger.id}
              className={`flex items-center p-3 rounded cursor-pointer hover:bg-gray-200 ${
                selectedBlogger?.id === blogger.id ? 'bg-gray-200' : ''
              }`}
              onClick={() => setSelectedBlogger(blogger)}
            >
              <Image
                src={blogger.avatar_url}
                alt={blogger.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <div>{blogger.name}</div>
                <div className="text-sm text-gray-500">
                  {blogger.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedBlogger ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{selectedBlogger.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Type a message..."
              />
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a blogger to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
