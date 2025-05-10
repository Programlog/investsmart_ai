import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const searchStockSchema = z.object({
  q: z.string().min(1, "Search query cannot be empty."),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  
  // Validate input
  const validationResult = searchStockSchema.safeParse({ q: query });
  if (!validationResult.success) {
    return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
  }
  
  const apiKey = process.env.FINNHUB_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "Finnhub API key not configured" }, { status: 500 });
  }
  
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query as string)}&exchange=US&token=${apiKey}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Modify the response format to suit the frontend
    const results = data.result?.map((item: any) => ({
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