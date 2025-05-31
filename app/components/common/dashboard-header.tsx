"use client"

import Link from "next/link"
import { BarChart3, Moon, Sun } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"

export default function DashboardHeader() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="border-b w-full">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span>InvestSmart AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <UserButton showName />
        </div>
      </div>
    </header>
  )
}

