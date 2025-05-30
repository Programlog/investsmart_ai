"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Search, LineChart, BookOpen, MessageSquare, BookMarked, Newspaper, MenuIcon, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type NavItem = {
    title: string
    href: string
    icon: React.ElementType
    value: string
}

const navItems: NavItem[] = [
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

export function DashboardSidebarNav() {
    const [isExpanded, setIsExpanded] = useState(true)
    const pathname = usePathname()

    // Load saved state from localStorage
    useEffect(() => {
        const savedExpanded = localStorage.getItem("dashboard-sidebar-expanded")
        if (savedExpanded !== null) {
            setIsExpanded(savedExpanded === "true")
        }
    }, [])

    // Save state to localStorage
    useEffect(() => {
        localStorage.setItem("dashboard-sidebar-expanded", isExpanded.toString())
    }, [isExpanded])

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    return (
        <div
            className={cn(
                "flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
                isExpanded ? "w-64" : "w-16"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="ml-auto"
                >
                    <MenuIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>
            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Button
                            key={item.value}
                            variant="ghost"
                            asChild
                            className={cn(
                                "w-full justify-start gap-4 transition-all duration-200",
                                isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                                !isExpanded && "justify-center px-2"
                            )}
                        >
                            <Link href={item.href}>
                                <item.icon className="h-5 w-5 shrink-0" />
                                {isExpanded && <span>{item.title}</span>}
                            </Link>
                        </Button>
                    )
                })}
            </nav>
        </div>
    )
}