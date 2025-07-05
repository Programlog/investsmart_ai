import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sparkles } from "lucide-react"

interface QuickAction {
  label: string
  action: () => void
}

interface AssistantQuickActionsProps {
  onRegenerateProfile: () => void
  onSetInput: (value: string) => void
  isRegenerating: boolean
}

export function AssistantQuickActions({ 
  onRegenerateProfile, 
  onSetInput, 
  isRegenerating 
}: AssistantQuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      label: "Regenerate my investment profile",
      action: onRegenerateProfile,
    },
    {
      label: "Explain ETFs",
      action: () => {
        onSetInput("Can you explain what ETFs are and how they work?")
      },
    },
    {
      label: "Investment strategies for beginners",
      action: () => {
        onSetInput("What are some good investment strategies for beginners?")
      },
    },
    {
      label: "How to diversify my portfolio",
      action: () => {
        onSetInput("How can I properly diversify my investment portfolio?")
      },
    },
  ]

  return (
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
  )
} 