"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"
import { debounce } from "lodash"

interface StockResult {
  symbol: string
  name: string
  type: string
  displaySymbol: string
}

export default function StockSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<StockResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setResults([])
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/search/stock?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch stock symbols")
        }
        
        const data = await response.json()
        setResults(data.results || [])
        setShowResults(true)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  ).current

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setLoading(true)
    debouncedSearch(query)
  }

  const handleSelectStock = (symbol: string) => {
    router.push(`/stock/${symbol}`)
    setShowResults(false)
    setSearchQuery("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results.length > 0) {
      handleSelectStock(results[0].symbol)
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto items-center space-x-2">
        <Input
          type="text"
          placeholder="Search for stocks (e.g. AAPL, MSFT, TSLA)"
          value={searchQuery}
          onChange={handleInputChange}
          className="flex-1"
          aria-label="Stock search"
          onFocus={() => setShowResults(true)}
        />
        <Button type="submit" disabled={loading || results.length === 0}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </form>

      {showResults && results.length > 0 && (
        <Card className="absolute w-full mt-1 z-50 max-h-60 overflow-auto">
          <CardContent className="p-0">
            <ul className="divide-y">
              {results.map((stock) => (
                <li
                  key={stock.symbol}
                  className="p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleSelectStock(stock.symbol)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{stock.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  )
} 