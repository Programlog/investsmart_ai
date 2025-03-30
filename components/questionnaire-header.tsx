import Link from "next/link"
import { BarChart3 } from "lucide-react"

export default function QuestionnaireHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span>InvestSmart AI</span>
        </Link>
      </div>
    </header>
  )
}

