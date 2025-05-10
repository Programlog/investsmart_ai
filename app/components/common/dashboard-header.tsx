import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

export default function DashboardHeader() {
  return (
    <header className="border-b w-full">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span>InvestSmart AI</span>
        </Link>
        <UserButton showName />
      </div>
    </header>
  )
}

