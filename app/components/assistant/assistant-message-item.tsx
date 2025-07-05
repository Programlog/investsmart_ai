import type React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AssistantMessage } from "@/lib/store/assistantSlice"
import ReactMarkdown from "react-markdown"

interface AssistantMessageItemProps {
  message: AssistantMessage
  userInitials: string
}

export function AssistantMessageItem({ message, userInitials }: AssistantMessageItemProps) {
  return (
    <div
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
              {userInitials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
} 