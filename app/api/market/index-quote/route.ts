import { NextResponse } from "next/server"

const FMP_API_KEY = process.env.FMP_API_KEY
const INDEX_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "^RUT"]

const fetchIndexQuote = async (symbol: string) => {
    const url = `https://financialmodelingprep.com/stable/quote-short?symbol=${encodeURIComponent(symbol)}&apikey=${FMP_API_KEY}`
    const res = await fetch(url, { next: { revalidate: 90 } }) // 90 seconds cache
    if (!res.ok) throw new Error(`Failed to fetch quote for ${symbol}`)
    const data = await res.json()
    return data && data[0] ? data[0] : null
}

type IndexQuote = {
    symbol: string;
    price: number;
    volume: number;
};

export async function GET() {
    const results: Record<string, IndexQuote | null> = {}
    for (const symbol of INDEX_SYMBOLS) {
        try {
            const quote = await fetchIndexQuote(symbol)
            if (quote) results[symbol] = quote
        } catch {
            results[symbol] = null
            console.error(`Failed to fetch index quote for ${symbol}`);
        }
    }
    return NextResponse.json(results)
}
