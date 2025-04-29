import axios from "axios";
import { z } from "zod";

export type ResultCategory = "social" | "definition" | "news" | "web";

const DOMAIN_CATEGORIES: Record<string, ResultCategory> = {
    "reddit.com": "social",
    "merriam-webster.com": "definition",
    "x.com": "social",
    "investing.com": "news",
    "bloomberg.com": "news",
};

function categorizeUrl(url: string): ResultCategory {
    const domain = Object.keys(DOMAIN_CATEGORIES).find((domain) => url.includes(domain));
    return domain ? DOMAIN_CATEGORIES[domain] : "web";
}

export type SearchResult = {
    id: string;
    title: string;
    snippet: string;
    url: string;
    source: ResultCategory;
};

interface GoogleSearchItem {
    cacheId?: string;
    title: string;
    snippet: string;
    link: string;
}

// In-memory cache (replace with Redis for production)
const cache = new Map<string, { data: { results: SearchResult[]; summary: string | null }; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const searchSchema = z.object({
    query: z.string().min(1, "Search query cannot be empty."),
    filter: z.string().optional(),
});

export async function searchGoogleCustom({ query, filter }: { query: string; filter?: string }) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    if (!apiKey || !cseId) throw new Error("Missing Google API Key or CSE ID");

    const cacheKey = `${query}-${filter || "all"}`;
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
        return cachedEntry.data;
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1`;
    const params: Record<string, string> = {
        key: apiKey,
        cx: cseId,
        q: query,
    };

    // Add filter-specific logic if needed
    // if (filter === 'definition') params.q = `define ${query}`;

    const response = await axios.get(searchUrl, { params });
    const items: GoogleSearchItem[] = response.data.items || [];
    const results: SearchResult[] =
        items.map((item) => ({
            id: item.cacheId || Math.random().toString(36).substring(7),
            title: item.title,
            snippet: item.snippet,
            url: item.link,
            source: categorizeUrl(item.link),
        })) || [];

    let summary: string | null = null;
    if (filter === "definition") {
        // TODO: Integrate LLM summary here
        summary = `AI-generated definition for "${query}" would appear here.`;
    }

    const responseData = { results, summary };
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    return responseData;
}
