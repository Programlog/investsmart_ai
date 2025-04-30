// This is a mock service that simulates fetching stock data
// In a real application, you would connect to a financial data API

interface StockData {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    afterHoursPrice?: number
    afterHoursChange?: number
    afterHoursChangePercent?: number
    currency: string
    exchange: string
    previousClose: number
    open: number
    dayRange: {
        low: number
        high: number
    }
    weekRange: {
        low: number
        high: number
    }
    marketCap: string
    volume: number
    avgVolume: number
    peRatio: number
    eps: number
    dividend: number
    dividendYield: number
    earningsDate: string
    exDividendDate: string
    targetEstimate: number
    chartData: {
        time: string
        price: number
    }[]
}

// Mock data for a few popular stocks
const stocksData: Record<string, StockData> = {
    AAPL: {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 196.93,
        change: 2.66,
        changePercent: 1.37,
        afterHoursPrice: 197.25,
        afterHoursChange: 0.27,
        afterHoursChangePercent: 0.14,
        currency: "USD",
        exchange: "NASDAQ",
        previousClose: 194.27,
        open: 197.15,
        dayRange: {
            low: 194.42,
            high: 198.83,
        },
        weekRange: {
            low: 164.77,
            high: 260.1,
        },
        marketCap: "2.958T",
        volume: 52164675,
        avgVolume: 62385185,
        peRatio: 31.26,
        eps: 6.3,
        dividend: 1.0,
        dividendYield: 0.51,
        earningsDate: "May 1, 2025",
        exDividendDate: "Feb 10, 2025",
        targetEstimate: 237.39,
        chartData: generateChartData(194, 199),
    },
    MSFT: {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 425.82,
        change: 1.94,
        changePercent: 0.46,
        afterHoursPrice: 427.01,
        afterHoursChange: 1.19,
        afterHoursChangePercent: 0.28,
        currency: "USD",
        exchange: "NASDAQ",
        previousClose: 423.88,
        open: 425.1,
        dayRange: {
            low: 422.75,
            high: 427.95,
        },
        weekRange: {
            low: 320.15,
            high: 430.82,
        },
        marketCap: "3.16T",
        volume: 15887654,
        avgVolume: 22456789,
        peRatio: 36.78,
        eps: 11.58,
        dividend: 3.0,
        dividendYield: 0.7,
        earningsDate: "Apr 30, 2025",
        exDividendDate: "Feb 15, 2025",
        targetEstimate: 445.5,
        chartData: generateChartData(422, 428),
    },
    GOOGL: {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 165.42,
        change: -0.68,
        changePercent: -0.41,
        currency: "USD",
        exchange: "NASDAQ",
        previousClose: 166.1,
        open: 166.45,
        dayRange: {
            low: 164.78,
            high: 167.35,
        },
        weekRange: {
            low: 130.45,
            high: 168.55,
        },
        marketCap: "2.05T",
        volume: 19876543,
        avgVolume: 25678901,
        peRatio: 25.12,
        eps: 6.58,
        dividend: 0,
        dividendYield: 0,
        earningsDate: "Apr 26, 2025",
        exDividendDate: "N/A",
        targetEstimate: 180.45,
        chartData: generateChartData(164, 167),
    },
    AMZN: {
        symbol: "AMZN",
        name: "Amazon.com, Inc.",
        price: 182.75,
        change: 3.25,
        changePercent: 1.81,
        afterHoursPrice: 181.9,
        afterHoursChange: -0.85,
        afterHoursChangePercent: -0.47,
        currency: "USD",
        exchange: "NASDAQ",
        previousClose: 179.5,
        open: 180.15,
        dayRange: {
            low: 179.85,
            high: 184.2,
        },
        weekRange: {
            low: 135.3,
            high: 186.15,
        },
        marketCap: "1.89T",
        volume: 30251684,
        avgVolume: 35478921,
        peRatio: 48.35,
        eps: 3.78,
        dividend: 0,
        dividendYield: 0,
        earningsDate: "May 3, 2025",
        exDividendDate: "N/A",
        targetEstimate: 200.25,
        chartData: generateChartData(179, 184),
    },
    TSLA: {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        price: 150.36,
        change: -2.54,
        changePercent: -1.66,
        currency: "USD",
        exchange: "NASDAQ",
        previousClose: 152.9,
        open: 153.05,
        dayRange: {
            low: 149.5,
            high: 154.75,
        },
        weekRange: {
            low: 138.25,
            high: 275.5,
        },
        marketCap: "478.95B",
        volume: 45678123,
        avgVolume: 55123987,
        peRatio: 43.1,
        eps: 3.49,
        dividend: 0,
        dividendYield: 0,
        earningsDate: "Apr 23, 2025",
        exDividendDate: "N/A",
        targetEstimate: 168.75,
        chartData: generateChartData(149, 155),
    },
}

// Helper function to generate mock chart data points
function generateChartData(min: number, max: number): { time: string; price: number }[] {
    const data: { time: string; price: number }[] = []
    const today = new Date()
    today.setHours(9, 30, 0, 0) // Market open at 9:30 AM

    // Generate data points for each minute of a trading day (9:30 AM - 4:00 PM)
    for (let i = 0; i < 390; i++) {
        const timePoint = new Date(today.getTime() + i * 60000)
        const price = min + Math.random() * (max - min)

        data.push({
            time: timePoint.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            price: Number.parseFloat(price.toFixed(2)),
        })
    }

    return data
}

// Function to fetch stock data
export async function getStockData(symbol: string): Promise<StockData | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return the stock data if it exists, otherwise return null
    return stocksData[symbol.toUpperCase()] || null
}

// Function to search stocks
export async function searchStocks(query: string): Promise<{ symbol: string; name: string }[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Filter stocks based on the query
    const results = Object.values(stocksData)
        .filter(
            (stock) =>
                stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
                stock.name.toLowerCase().includes(query.toLowerCase()),
        )
        .map((stock) => ({ symbol: stock.symbol, name: stock.name }))

    return results
}

// Function to fetch stock news
export async function getStockNews(symbol: string, category = "all"): Promise<any[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock news data
    const allNews = [
        {
            id: "1",
            title: `${stocksData[symbol.toUpperCase()]?.name || symbol} Reports Strong Q1 Earnings, Beats Expectations`,
            source: "Financial Times",
            timestamp: "2 hours ago",
            summary: "Company reports 15% growth in revenue, raises full-year outlook amid strong product demand.",
            category: "news",
            url: "#",
        },
        {
            id: "2",
            title: `${stocksData[symbol.toUpperCase()]?.name || symbol} Announces New Product Line`,
            source: "CNBC",
            timestamp: "5 hours ago",
            summary:
                "The company unveiled its latest innovation at a special event today, with availability expected next month.",
            category: "news",
            url: "#",
        },
        {
            id: "3",
            title: `${stocksData[symbol.toUpperCase()]?.name || symbol} to Participate in Upcoming Technology Conference`,
            source: "PR Newswire",
            timestamp: "1 day ago",
            summary: "Executive team to present at industry conference and hold investor meetings.",
            category: "press",
            url: "#",
        },
        {
            id: "4",
            title: `${stocksData[symbol.toUpperCase()]?.name || symbol} Files Quarterly Report`,
            source: "SEC",
            timestamp: "3 days ago",
            summary: "Form 10-Q filed with the Securities and Exchange Commission.",
            category: "filing",
            url: "#",
        },
        {
            id: "5",
            title: `${stocksData[symbol.toUpperCase()]?.name || symbol} Expands International Operations`,
            source: "Reuters",
            timestamp: "4 days ago",
            summary: "The company announced expansion into new markets, expecting significant revenue growth.",
            category: "news",
            url: "#",
        },
        {
            id: "6",
            title: `${stocksData[symbol.toUpperCase()]?.name || symbol} Declares Quarterly Dividend`,
            source: "PR Newswire",
            timestamp: "1 week ago",
            summary: "Board approves regular quarterly dividend payment to shareholders.",
            category: "press",
            url: "#",
        },
    ]

    // Filter news based on the category
    if (category === "all") {
        return allNews
    } else if (category === "news") {
        return allNews.filter((item) => item.category === "news")
    } else if (category === "press") {
        return allNews.filter((item) => item.category === "press")
    } else if (category === "filing") {
        return allNews.filter((item) => item.category === "filing")
    }

    return allNews
}
