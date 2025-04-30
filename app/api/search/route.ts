import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { searchSchema, searchGoogleCustom } from "@/services/search-service";

export async function GET(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const filter = searchParams.get("filter") ?? undefined;

    // Validate input
    const validationResult = searchSchema.safeParse({ query, filter });
    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    try {
        const data = await searchGoogleCustom({
            query: validationResult.data.query,
            filter: validationResult.data.filter,
        });
        return NextResponse.json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch search results";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
