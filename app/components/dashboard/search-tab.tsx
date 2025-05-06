"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/store/store"
import { fetchSearchResults, clearSearchResults } from "@/lib/store/searchSlice"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const dispatch = useDispatch<AppDispatch>()
  const {
    results: searchResults,
    summary,
    loading: isSearching,
    error,
  } = useSelector((state: RootState) => state.search)

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults())
    }
  }, [dispatch])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    dispatch(fetchSearchResults({ query: searchQuery, filter: activeFilter }))
  }

  const filteredResults = searchResults.filter((result) => {
    if (activeFilter === "all") return true
    return result.source.toLowerCase() === activeFilter.toLowerCase()
  })

  const getSourceIcon = (source: string) => {
    const lowerSource = source?.toLowerCase() || "web"
    switch (lowerSource) {
      case "article":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Article</span>
      case "social":
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Social</span>
      case "definition":
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">Definition</span>
        )
      case "web":
      default:
        return <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">Web</span>
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
              aria-label="Search query"
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSearching && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && !error && (searchResults.length > 0 || summary) && (
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

          {summary && activeFilter === "definition" && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">AI Definition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-800">{summary}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-semibold flex-1">{result.title}</h3>
                    {getSourceIcon(result.source)}
                  </div>
                  <p className="text-muted-foreground mb-4">{result.snippet}</p>
                  {result.url ? (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      View Source <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Source link not available</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && !error && searchResults.length === 0 && !summary && searchQuery && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No results found for &quot;{searchQuery}&quot;. Try a different search term or filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

