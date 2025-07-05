"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, RefreshCw } from "lucide-react"

interface AssistantChatInputProps {
  input: string
  setInput: (value: string) => void
  onSendMessage: () => void
  onResetConversation: () => void
  isLoading: boolean
}

export default function AssistantChatInput({ 
  input, 
  setInput, 
  onSendMessage, 
  onResetConversation, 
  isLoading 
}: AssistantChatInputProps) {
  const promptInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    promptInputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="p-4 border-t">
      <div className="flex w-full items-center space-x-2">
        <Input
          ref={promptInputRef}
          placeholder="Ask a question about investing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1"
        />
        <Button size="icon" onClick={onSendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
        <Button size="icon" onClick={onResetConversation} disabled={isLoading}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Reset</span>
        </Button>
      </div>
    </div>
  )
} 