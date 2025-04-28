import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { prisma } from '@/lib/prisma';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';


export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req) as WebhookEvent;

        switch (evt.type) {
            case 'user.created':
                await prisma.user.create({
                    data: {
                        // id: evt.data.id,
                        clerkUserId: evt.data.id,
                        email: evt.data.email_addresses[0]?.email_address,
                        firstName: evt.data.first_name ?? "Default",
                        lastName: evt.data.last_name ?? "Default",
                    },
                });
                break;

            case 'user.updated':
                await prisma.user.update({
                    where: { clerkUserId: evt.data.id },
                    data: {
                        email: evt.data.email_addresses[0]?.email_address,
                        firstName: evt.data.first_name ?? "Default",
                        lastName: evt.data.last_name ?? "Default",
                    },
                });
                break;

            case 'user.deleted':
                await prisma.user.delete({
                    where: { clerkUserId: evt.data.id },
                });
                break;
        }

        return new Response('Webhook processed successfully', { status: 200 });
    } catch (err) {
        console.error('Error processing webhook:', err);
        return new Response(
            `Webhook error: ${err instanceof Error ? err.message : 'Unknown error'}`,
            { status: 500 }
        );
    }
}