"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Search, LineChart, BookOpen, MessageSquare, BookMarked, Newspaper, User } from "lucide-react"

const navItems = [
  {
    title: "Search",
    href: "/dashboard/search",
    icon: Search,
    value: "search"
  },
  {
    title: "Portfolio",
    href: "/dashboard/portfolio",
    icon: BarChart3,
    value: "portfolio"
  },
  {
    title: "Watchlist",
    href: "/dashboard/watchlist",
    icon: BookMarked,
    value: "watchlist"
  },
  {
    title: "Market",
    href: "/dashboard/market",
    icon: LineChart,
    value: "market"
  },
  {
    title: "Assistant",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    value: "assistant"
  },
  {
    title: "Learning",
    href: "/dashboard/learning",
    icon: BookOpen,
    value: "learning"
  },
  {
    title: "News",
    href: "/dashboard/news",
    icon: Newspaper,
    value: "news"
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    value: "profile"
  },
]

export function MobileNavbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-full z-50 flex justify-around items-center border-t bg-background h-16 shadow-md md:hidden overflow-x-hidden">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Button
            key={item.value}
            asChild
            variant="ghost"
            size="icon"
            className={cn(
              "flex flex-col items-center justify-center p-0 h-12 w-12 flex-shrink-0 flex-grow-0 m-0",
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label={item.title}
          >
            <Link href={item.href} prefetch={false}>
              <item.icon className="h-6 w-6" />
            </Link>
          </Button>
        )
      })}
    </nav>
  )
} 