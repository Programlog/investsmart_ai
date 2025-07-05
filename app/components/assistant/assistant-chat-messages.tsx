"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AssistantMessage } from "@/lib/store/assistantSlice"
import { AssistantMessageItem } from "./assistant-message-item"

interface AssistantChatMessagesProps {
  messages: AssistantMessage[]
  userInitials: string
  error?: Error | null
}

export function AssistantChatMessages({ messages, userInitials, error }: AssistantChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message: AssistantMessage) => (
          <AssistantMessageItem
            key={message.id}
            message={message}
            userInitials={userInitials}
          />
        ))}
        {error && (
          <div className="text-red-500 text-sm">
            Error: {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
} 