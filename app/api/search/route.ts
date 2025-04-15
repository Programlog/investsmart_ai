import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { z } from "zod";

// Basic in-memory cache (replace with Redis or similar for production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const searchSchema = z.object({
    query: z.string().min(1, "Search query cannot be empty."),
    filter: z.string().optional(), // Add more specific validation if needed
});

export async function GET(req: NextRequest) {
    const { userId } = getAuth(req);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const filter = searchParams.get("filter") ?? undefined; // Ensure optional works

    // Validate input
    const validationResult = searchSchema.safeParse({ query, filter });
    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const validatedQuery = validationResult.data.query;
    const validatedFilter = validationResult.data.filter;

    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;

    if (!apiKey || !cseId) {
        console.error("Missing Google API Key or CSE ID");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // --- Caching Logic ---
    const cacheKey = `${validatedQuery}-${validatedFilter || 'all'}`;
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION)) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return NextResponse.json(cachedEntry.data);
    }
    console.log(`Cache miss for key: ${cacheKey}`);
    // --- End Caching Logic ---


    try {
        // Fetch from Google Custom Search API
        const searchUrl = `https://www.googleapis.com/customsearch/v1`;
        const params: Record<string, string> = {
            key: apiKey,
            cx: cseId,
            q: validatedQuery,
        };

        // Add filter-specific logic if needed (e.g., modifying query for definitions)
        // if (validatedFilter === 'definition') {
        //   params.q = `define ${validatedQuery}`; // Example modification
        // }

        const response = await axios.get(searchUrl, { params });

        const results = response.data.items?.map((item: any) => ({
            id: item.cacheId || Math.random().toString(36).substring(7), // Use cacheId or generate one
            title: item.title,
            snippet: item.snippet,
            url: item.link,
            source: validatedFilter || "web", // Assign source based on filter or default
        })) || [];

        let summary: string | null = null;
        // Placeholder for LLM summary generation
        if (validatedFilter === "definition") {
            // TODO: Implement LLM call here
            console.log("Placeholder: LLM summary generation needed for definitions.");
            // summary = await generateLLMSummary(validatedQuery);
            summary = `AI-generated definition for "${validatedQuery}" would appear here.`; // Placeholder
        }

        const responseData = { results, summary };

        // Store in cache
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error("Error fetching search results:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.error?.message || "Failed to fetch search results";
        return NextResponse.json({ error: message }, { status });
    }
}
