"use client"

import { useEffect, useState } from "react"
import { BarChart3, Search, LineChart, BookOpen, MessageSquare, BookMarked, Newspaper, MenuIcon } from "lucide-react"
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
        href: "#",
        icon: Search,
        value: "search"
    },
    {
        title: "Portfolio",
        href: "#",
        icon: BarChart3,
        value: "portfolio"
    },
    {
        title: "Watchlist",
        href: "#",
        icon: BookMarked,
        value: "watchlist"
    },
    {
        title: "Market",
        href: "#",
        icon: LineChart,
        value: "market"
    },
    {
        title: "Assistant",
        href: "#",
        icon: MessageSquare,
        value: "assistant"
    },
    {
        title: "Learning",
        href: "#",
        icon: BookOpen,
        value: "learning"
    },
    {
        title: "News",
        href: "#",
        icon: Newspaper,
        value: "news"
    },
]

interface DashboardSidebarNavProps {
    defaultTab?: string
    onTabChangeAction: (tab: string) => void
}

export function DashboardSidebarNav({ defaultTab = "portfolio", onTabChangeAction }: DashboardSidebarNavProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [activeTab, setActiveTab] = useState(defaultTab)

    // Load saved state from localStorage
    useEffect(() => {
        const savedExpanded = localStorage.getItem("dashboard-sidebar-expanded")
        if (savedExpanded !== null) {
            setIsExpanded(savedExpanded === "true")
        }

        const savedTab = localStorage.getItem("dashboard-active-tab")
        if (savedTab) {
            setActiveTab(savedTab)
            onTabChangeAction(savedTab)
        }
    }, [onTabChangeAction])

    // Save state to localStorage
    useEffect(() => {
        localStorage.setItem("dashboard-sidebar-expanded", isExpanded.toString())
    }, [isExpanded])

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    const handleTabClick = (value: string) => {
        setActiveTab(value)
        onTabChangeAction(value)
        localStorage.setItem("dashboard-active-tab", value)
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
                {navItems.map((item) => (
                    <Button
                        key={item.value}
                        variant="ghost"
                        onClick={() => handleTabClick(item.value)}
                        className={cn(
                            "w-full justify-start gap-4 transition-all duration-200",
                            activeTab === item.value ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                            !isExpanded && "justify-center px-2"
                        )}
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {isExpanded && <span>{item.title}</span>}
                    </Button>
                ))}
            </nav>
        </div>
    )
}