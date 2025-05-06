'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";

export async function addToWatchlist(symbol: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');
        if (!symbol) throw new Error('Symbol is required');

        const watchlistItem = await prisma.watchlist.create({
            data: {
                user: { connect: { clerkUserId: userId } },
                symbol: symbol.toUpperCase(),
            }
        });

        revalidatePath('/dashboard');
        return watchlistItem;
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error('Stock already in watchlist');
        }
        throw error;
    }
}

export async function getWatchlist() {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const watchlist = await prisma.watchlist.findMany({
            where: {
                user: {
                    clerkUserId: userId
                }
            },
            orderBy: {
                addedAt: 'desc'
            }
        });

        return watchlist;
    } catch (error) {
        console.error('Failed to fetch watchlist:', error);
        throw error;
    }
}

export async function removeFromWatchlist(symbol: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');
        if (!symbol) throw new Error('Symbol is required');

        await prisma.watchlist.deleteMany({
            where: {
                user: {
                    clerkUserId: userId
                },
                symbol: symbol.toUpperCase()
            }
        });

        revalidatePath('/dashboard');
        return true;
    } catch (error) {
        console.error('Failed to remove from watchlist:', error);
        throw error;
    }
}

export async function updateWatchlistItem(symbol: string, notes: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');
        if (!symbol) throw new Error('Symbol is required');

        const updated = await prisma.watchlist.updateMany({
            where: {
                user: {
                    clerkUserId: userId
                },
                symbol: symbol.toUpperCase()
            },
            data: {
                notes
            }
        });

        revalidatePath('/dashboard');
        return updated;
    } catch (error) {
        console.error('Failed to update watchlist item:', error);
        throw error;
    }
}