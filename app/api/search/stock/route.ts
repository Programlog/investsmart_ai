import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

interface FinnhubSearchResult {
  symbol: string;
  description: string;
  type: string;
  displaySymbol: string;
}

interface StockSearchResponse {
  result?: FinnhubSearchResult[];
  count?: number;
}

// Cache stock search results to reduce API calls
const searchStocks = unstable_cache(
  async (query: string, apiKey: string): Promise<StockSearchResponse> => {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&exchange=US&token=${apiKey}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }
    
    return await response.json();
  },
  ["finnhub-stock-search"],
  { revalidate: 3600 } // Cache for 1 hour
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  
  // Basic validation
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Search query cannot be empty" }, { status: 400 });
  }
  
  const apiKey = process.env.FINNHUB_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "Finnhub API key not configured" }, { status: 500 });
  }
  
  try {
    const data = await searchStocks(query, apiKey);
    
    // Transform the response for the frontend
    const results = data.result?.map((item) => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
      displaySymbol: item.displaySymbol
    })) || [];
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching stock symbols:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock symbols" },
      { status: 500 }
    );
  }
} 