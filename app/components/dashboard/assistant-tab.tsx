"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addMessage, setMessages, resetConversation, AssistantMessage } from "@/lib/store/assistantSlice"
import type { RootState } from "@/lib/store/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getInvestmentProfile } from "@/actions/getInvestmentProfile"
import { InvestmentProfile } from "@/types/stock"
import { useUser } from "@clerk/nextjs"
import { AssistantChatMessages, AssistantChatInput, AssistantQuickActions, AssistantInvestmentProfile } from "../assistant"

export default function AssistantTab() {
  const dispatch = useDispatch()
  const messages = useSelector((state: RootState) => state.assistant.messages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUser()

  // Investment profile state
  const [investmentProfile, setInvestmentProfile] = useState<InvestmentProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

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
          <AssistantChatMessages
            messages={messages}
            userInitials={getUserInitials()}
            error={error}
          />
          <AssistantChatInput
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            onResetConversation={handleResetConversation}
            isLoading={isLoading}
          />
        </Card>
      </div>

      <div>
        <AssistantQuickActions
          onRegenerateProfile={handleRegenerateProfile}
          onSetInput={setInput}
          isRegenerating={isRegenerating}
        />

        <AssistantInvestmentProfile
          investmentProfile={investmentProfile}
          profileLoading={profileLoading}
          profileError={profileError}
          onRegenerateProfile={handleRegenerateProfile}
        />
      </div>
    </div>
  )
} 