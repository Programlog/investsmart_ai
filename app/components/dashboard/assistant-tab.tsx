"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addMessage, setMessages, resetConversation, AssistantMessage } from "@/store/assistantSlice"
import type { RootState } from "@/store/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, RefreshCw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AssistantTab() {
  const dispatch = useDispatch()
  const messages = useSelector((state: RootState) => state.assistant.messages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const promptInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const timer = setTimeout(() => {
      promptInputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date().toISOString(),
    }
    const assistantMessage: AssistantMessage = {
      id: `ai-${Date.now()}`,
      content: "",
      role: "assistant",
      timestamp: new Date().toISOString(),
    }
    dispatch(addMessage(userMessage))
    dispatch(addMessage(assistantMessage))
    setInput("")
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      })
      if (!response.ok) throw new Error("API request failed")
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let aiContent = ""
      while (!done && reader) {
        const { value, done: readDone } = await reader.read()
        done = readDone
        const chunk = decoder.decode(value)
        aiContent += chunk
        dispatch(setMessages([
          ...messages,
          userMessage,
          { ...assistantMessage, content: aiContent },
        ]))
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Unknown Error"))
      dispatch(setMessages([
        ...messages,
        userMessage,
        { ...assistantMessage, content: "Sorry, I encountered an error. Please try again" },
      ]))
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        promptInputRef.current?.focus()
      }, 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRegenerateProfile = async () => {
    setIsRegenerating(true)
    setTimeout(() => {
      const assistantMessage: AssistantMessage = {
        id: Date.now().toString(),
        content:
          "I've analyzed your questionnaire responses and investment history. Based on your moderate risk tolerance and long-term goals, I recommend a balanced portfolio with 60% stocks, 30% bonds, and 10% cash or cash equivalents. This allocation provides growth potential while maintaining stability. Would you like me to explain any part of this recommendation in more detail?",
        role: "assistant",
        timestamp: new Date().toISOString(),
      }
      dispatch(addMessage(assistantMessage))
      setIsRegenerating(false)
    }, 2000)
  }

  const handleResetConversation = () => {
    dispatch(resetConversation())
  }

  const quickActions = [
    {
      label: "Regenerate my investment profile",
      action: handleRegenerateProfile,
    },
    {
      label: "Explain ETFs",
      action: () => {
        setInput("Can you explain what ETFs are and how they work?")
      },
    },
    {
      label: "Investment strategies for beginners",
      action: () => {
        setInput("What are some good investment strategies for beginners?")
      },
    },
    {
      label: "How to diversify my portfolio",
      action: () => {
        setInput("How can I properly diversify my investment portfolio?")
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="border shadow-sm h-[600px] flex flex-col">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-lg">AI Investment Assistant</CardTitle>
            <CardDescription>Ask questions about investing, your portfolio, or financial concepts</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message: AssistantMessage) => (
                <div
                  key={message.id}
                  className={cn("flex", {
                    "justify-end": message.role === "user",
                  })}
                >
                  <div
                    className={cn("flex gap-3 max-w-[80%]", {
                      "flex-row-reverse": message.role === "user",
                    })}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn("rounded-lg px-3 py-2 text-sm", {
                        "bg-primary text-primary-foreground": message.role === "user",
                        "bg-muted": message.role === "assistant",
                      })}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {error && (
                <div className="text-red-500 text-sm">
                  Error: {error.message}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
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
              <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
              <Button size="icon" onClick={handleResetConversation} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Reset</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card className="border shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common questions and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={action.action}
                  disabled={isRegenerating && index === 0}
                >
                  {index === 0 ? (
                    <>
                      {isRegenerating ? (
                        <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-r-transparent animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                    </>
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Investment Profile</CardTitle>
            <CardDescription>Your personalized investment profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Risk Tolerance</h3>
                <p className="text-sm text-muted-foreground">Moderate</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Investment Goals</h3>
                <p className="text-sm text-muted-foreground">Long-term growth, Retirement</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Time Horizon</h3>
                <p className="text-sm text-muted-foreground">10+ years</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Recommended Allocation</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">60% Stocks</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">30% Bonds</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">10% Cash</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
