"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { LatestBarData, CompanyProfile } from "@/types/stock"

const formatTimestamp = (isoTimestamp?: string | null) => {
    if (!isoTimestamp) return "N/A"
    return new Date(isoTimestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
    })
}

export default function StockHeader({ symbol }: { symbol: string }) {
    const [latestBarData, setLatestBarData] = useState<LatestBarData | null>(null)
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [error, setError] = useState<string | null>(null)
    const isPositiveChange = latestBarData?.close ? latestBarData.close > 0 : false

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, barRes] = await Promise.all([
                    fetch(`/api/market/stock/header?symbol=${symbol}`),
                    fetch(`/api/market/stock?symbol=${symbol}&type=latestBar`)
                ])

                const profileData = await profileRes.json()
                const barData = await barRes.json()

                if (!profileRes.ok) throw new Error(profileData.error || `Failed to fetch profile (${profileRes.status})`)
                if (!barRes.ok) throw new Error(barData.error || `Failed to fetch data (${barRes.status})`)
                if (!barData.latestBar?.close) throw new Error("Invalid data received")

                setProfile(profileData.profile)
                setLatestBarData(barData.latestBar)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred")
            }
        }

        fetchData()
        const intervalId = setInterval(() => fetchData(), 60000)
        return () => clearInterval(intervalId)
    }, [symbol])

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">
                    {profile ? `${profile.exchange} • ${profile.currency} • ${profile.finnhubIndustry}` : "Loading..."}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        {profile?.logo && (
                            <Image
                                src={profile.logo}
                                alt={`${profile.name} logo`}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full"
                            />
                        )}
                        <h1 className="text-3xl font-bold">
                            {profile?.name || "Loading..."} ({symbol})
                        </h1>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                        <Star className="mr-2 h-4 w-4" />
                        Following
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                        Compare
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">
                            {error ? "Error" : latestBarData?.close?.toFixed(2) ?? "N/A"}
                        </span>
                        {!error && latestBarData?.close && (
                            <div className={`ml-3 flex items-center text-lg ${isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                                {isPositiveChange ? (
                                    <ArrowUpRight className="h-5 w-5 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-5 w-5 mr-1" />
                                )}
                                <span className="font-medium">
                                    {isPositiveChange ? "+" : "-"}
                                    {Math.abs(latestBarData.close).toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {error
                            ? `Error: ${error}`
                            : `Last updated: ${formatTimestamp(latestBarData?.timestamp)}`}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-help rounded-md px-3 py-1 text-sm flex items-center">
                                <Info className="h-3.5 w-3.5 mr-1" />
                                Time to buy {symbol}?
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Get AI-powered investment advice</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {profile?.weburl && (
                    <a
                        href={profile.weburl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        Visit website →
                    </a>
                )}
            </div>
        </div>
    )
}
