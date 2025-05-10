// Basic stock data interfaces
export interface StockMetrics {
    peAnnual: number
    peTTM: number
    marketCapitalization: number
    "52WeekLow": number
    "52WeekHigh": number
    beta: number
    "10DayAverageTradingVolume": number
    "3MonthAverageTradingVolume": number
    epsAnnual: number
    epsTTM: number
    dividendYieldIndicatedAnnual: number
    netProfitMarginTTM: number
    epsGrowthTTMYoy: number
    revenueGrowthTTMYoy: number
}

export interface StockStatsProps {
    symbol: string
}


// Chart related interfaces
export type ChartPeriod = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All"

export interface ChartDatum {
    time: string
    price: number
    open: number
    high: number
    low: number
    volume: number
}


export interface StockChartProps {
    symbol: string
}

// Market data interfaces
export interface MarketIndex {
    id: string
    name: string
    value: number
    change: number
    changePercent: number
}

export interface TrendingAsset {
    id: string
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: string
    sentiment: "positive" | "neutral" | "negative"
}

export type MarketNewsItem = {
    id: string
    headline: string
    source: string
    summary: string
    datetime: number
    url: string
  }

// News related interfaces
export interface NewsItem {
    id: string | number
    title: string
    source: string
    timestamp: string
    summary: string
    category: string
    url: string
    image: string
}

// Real-time data interfaces
export interface LatestBarData {
    symbol: string
    close: number | null
    timestamp: string | null
}

export interface StaticStockData {
    symbol: string
    name: string
    exchange: string
    currency: string
    change: number
    changePercent: number
}

export interface CompanyProfile {
    country: string
    currency: string
    exchange: string
    finnhubIndustry: string
    logo: string
    name: string
    ticker: string
    weburl: string
}

// Stock rating payload
export interface StockRatingRequest {
    symbol: string
    news: NewsItem[]
    metrics: StockMetrics
}

export interface StockRating {
    rating: string
    reasoning: string
}

export interface InvestmentProfile {
    risk_tolerance: string;
    investment_goals: string;
    time_horizon: number;
    recommended_allocation: {
        stocks: number;
        bonds: number;
        cash: number;
    };
}