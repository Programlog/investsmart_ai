"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink } from "lucide-react"

type SearchResult = {
  id: string
  title: string
  snippet: string
  url: string
  source: "article" | "social" | "definition" | "web"
}

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [activeFilter, setActiveFilter] = useState("all")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      // Mock search results
      const results: SearchResult[] = [
        {
          id: "1",
          title: "What is an ETF? Understanding Exchange-Traded Funds",
          snippet:
            "Exchange-traded funds (ETFs) are a type of investment fund and exchange-traded product, i.e., they are traded on stock exchanges...",
          url: "https://example.com/etf-guide",
          source: "article",
        },
        {
          id: "2",
          title: "ETF Definition",
          snippet:
            "An ETF (Exchange-Traded Fund) is a basket of securities that trades on an exchange just like a stock. ETFs can contain various investments including stocks, bonds, and commodities.",
          url: "#",
          source: "definition",
        },
        {
          id: "3",
          title: "Just bought my first ETF! Any advice for a beginner? #investing #personalfinance",
          snippet:
            "Excited to start my investment journey with VOO. Looking for tips from experienced investors on how to build a diversified portfolio.",
          url: "https://x.com/investor123/status/123456789",
          source: "social",
        },
        {
          id: "4",
          title: "Best ETFs for Beginners in 2025",
          snippet:
            "Our top picks for new investors looking to get started with ETFs. We cover low-cost index funds, dividend ETFs, and sector-specific options.",
          url: "https://example.com/best-etfs-2025",
          source: "web",
        },
        {
          id: "5",
          title: "ETF vs Mutual Fund: Understanding the Differences",
          snippet:
            "While both ETFs and mutual funds are investment vehicles that pool money from investors to buy a diversified portfolio, they differ in how they're traded, managed, and taxed.",
          url: "https://example.com/etf-vs-mutual-fund",
          source: "article",
        },
      ]

      setSearchResults(results)
      setIsSearching(false)
    }, 1000)
  }

  const filteredResults = searchResults.filter((result) => {
    if (activeFilter === "all") return true
    return result.source === activeFilter
  })

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "article":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Article</span>
      case "social":
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Social</span>
      case "definition":
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Definition</span>
        )
      case "web":
        return <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">Web</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Investment Terms</CardTitle>
          <CardDescription>Find information about investment concepts, assets, or topics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex w-full max-w-3xl mx-auto items-center space-x-2">
            <Input
              type="text"
              placeholder="Search for ETF, stocks, bonds, diversification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="article">Articles</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="definition">Definitions</TabsTrigger>
              <TabsTrigger value="web">Web</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{result.title}</h3>
                    {getSourceIcon(result.source)}
                  </div>
                  <p className="text-muted-foreground mb-4">{result.snippet}</p>
                  {result.url !== "#" ? (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      View Source <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">AI-generated definition</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No results found for "{searchQuery}". Try a different search term.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

