"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addMessage, setMessages, resetConversation, AssistantMessage } from "@/lib/store/assistantSlice"
import type { RootState } from "@/lib/store/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, RefreshCw, Sparkles, AlertCircle, Bot, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getInvestmentProfile } from "@/actions/getInvestmentProfile"
import { InvestmentProfile } from "@/types/stock"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from "@clerk/nextjs"
import ReactMarkdown from "react-markdown"

export default function AssistantTab() {
  const dispatch = useDispatch()
  const messages = useSelector((state: RootState) => state.assistant.messages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const promptInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()

  // Investment profile state
  const [investmentProfile, setInvestmentProfile] = useState<InvestmentProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  useEffect(() => {
    promptInputRef.current?.focus()
  }, [])

  // Fetch investment profile only once on mount
  useEffect(() => {
    fetchInvestmentProfile()
  }, [])

  // Function to fetch the investment profile
  const fetchInvestmentProfile = async () => {
    setProfileLoading(true)
    setProfileError(null)

    try {
      console.log("Fetching investment profile...")
      const result = await getInvestmentProfile()
      console.log("Investment Profile:", result)

      if (result.success && result.profile) {
        setInvestmentProfile(result.profile)
      } else {
        setProfileError(result.error || "Failed to load investment profile")
      }
    } catch (err) {
      setProfileError("An unexpected error occurred")
      console.error("Error fetching investment profile:", err)
    } finally {
      setProfileLoading(false)
    }
  }

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
    try {
      await fetchInvestmentProfile()

      // Add a message to the chat about the regenerated profile
      if (!profileError) {
        const assistantMessage: AssistantMessage = {
          id: Date.now().toString(),
          content: "I've refreshed your investment profile based on your latest questionnaire responses.",
          role: "assistant",
          timestamp: new Date().toISOString(),
        }
        dispatch(addMessage(assistantMessage))
      }
    } catch (error) {
      console.error("Error regenerating profile:", error)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleResetConversation = async () => {
    // Reset the UI state
    dispatch(resetConversation())
    
    // Also reset the conversation context on the server
    try {
      await fetch("/api/ai/reset", {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to reset AI conversation context:", error)
    }
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

  // Renders the allocation bars for the investment profile
  const renderAllocationBar = (value: number, label: string, color: string) => (
    <div className="flex items-center gap-2 mt-1">
      <div className="w-full bg-muted rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${value}%` }}></div>
      </div>
      <span className="text-xs text-muted-foreground min-w-[70px] text-right">{value}% {label}</span>
    </div>
  )

  const getUserInitials = () => {
    if (!user) return "U"
    
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    
    const firstInitial = firstName.charAt(0)
    const lastInitial = lastName.charAt(0)
    
    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`
    } else if (firstInitial) {
      return firstInitial
    } else {
      return "U"
    }
  }

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
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn("rounded-lg px-3 py-2 text-sm", {
                        "bg-primary text-primary-foreground": message.role === "user",
                        "bg-muted": message.role === "assistant",
                      })}
                    >
                      {message.role === "assistant" && message.content === "" ? (
                        <div className="flex items-center gap-2 py-1">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">Thinking...</span>
                        </div>
                      ) : message.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                          {getUserInitials()}
                        </AvatarFallback>
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Investment Profile</CardTitle>
              <CardDescription>Your personalized investment profile</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateProfile}
              disabled={profileLoading}
            >
              <RefreshCw className={cn("h-4 w-4", profileLoading && "animate-spin")} />
            </Button>
          </CardHeader>
          <CardContent>
            {profileError ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  {profileError}
                </AlertDescription>
              </Alert>
            ) : profileLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-2 bg-muted rounded w-full mt-4"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ) : investmentProfile ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Risk Tolerance</h3>
                  <p className="text-sm text-muted-foreground">{investmentProfile.risk_tolerance}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Investment Goals</h3>
                  <p className="text-sm text-muted-foreground">{investmentProfile.investment_goals}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Time Horizon</h3>
                  <p className="text-sm text-muted-foreground">{investmentProfile.time_horizon} years</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommended Allocation</h3>
                  {renderAllocationBar(investmentProfile.recommended_allocation.stocks, "Stocks", "bg-blue-500")}
                  {renderAllocationBar(investmentProfile.recommended_allocation.bonds, "Bonds", "bg-purple-500")}
                  {renderAllocationBar(investmentProfile.recommended_allocation.cash, "Cash", "bg-green-500")}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Complete the questionnaire to generate your investment profile</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleRegenerateProfile}
                >
                  Generate Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
