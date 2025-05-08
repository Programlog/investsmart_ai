"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateInvestmentProfile } from "@/services/ai-service";
import { InvestmentProfile } from "@/types/stock";


/**
 * Fetches user's questionnaire responses and generates an investment profile
 * based on those responses using AI
 */
export async function getInvestmentProfile(): Promise<{
    success: boolean;
    profile?: InvestmentProfile;
    error?: string;
}> {
    try {
        // Get authenticated user from Clerk
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return { success: false, error: "Unauthorized: User not authenticated" };
        }

        // Find user by Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkUserId },
            select: { id: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Fetch questionnaire responses
        const responses = await prisma.response.findMany({
            where: { userId: user.id },
            select: { questionId: true, answer: true },
        });

        if (responses.length === 0) {
            return { success: false, error: "No questionnaire responses found" };
        }

        // Convert to format expected by generateInvestmentProfile
        const answersRecord: Record<string, string> = {};
        responses.forEach((response) => {
            let key = response.questionId;
            answersRecord[key] = response.answer;
        });

        const profile = await generateInvestmentProfile(answersRecord);

        return { success: true, profile };
    } catch (error) {
        console.error("Error generating investment profile:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}