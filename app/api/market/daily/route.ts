import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

const fetchDailyCloses = unstable_cache(
    async (symbol: string) => {
        const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`;
        const res = await fetch(url, { next: { revalidate: 60 * 60 } }); // 1 hour cache
        if (!res.ok) throw new Error("Alpha Vantage fetch failed");
        const data = await res.json();

        if (data["Error Message"]) throw new Error("Alpha Vantage: Invalid symbol or request.");
        if (data["Note"]) throw new Error("Alpha Vantage: API call frequency limit reached. Please try again later.");

        const series = data["Time Series (Daily)"];
        if (!series) throw new Error("Invalid Alpha Vantage response");

        const closes = Object.entries(series)
            .slice(0, 100)
            .map(([date, ohlc]) => ({
                date,
                close: parseFloat((ohlc as Record<string, string>)["4. close"]),
            }))
            .reverse();

        return closes;
    },
    ["alpha-vantage-daily"],
    { revalidate: 60 * 60 }
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol") || "AAPL";
    try {
        const closes = await fetchDailyCloses(symbol);
        return NextResponse.json(closes);
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
