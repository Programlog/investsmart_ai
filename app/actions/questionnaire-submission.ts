'use server'

import { prisma as db } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const responseSchema = z.object({
  questionId: z.string(),
  answer: z.string()
})

type QuestionResponse = z.infer<typeof responseSchema>

export async function saveQuestionnaireResponses(responses: QuestionResponse[]) {
  try {
    // Validate all responses
    responses.forEach(response => {
      responseSchema.parse(response)
    })

    // Get authenticated user from Clerk
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      throw new Error('Unauthorized: User not authenticated')
    }

    // Find user by Clerk ID - assume they exist from webhook
    const user = await db.user.findUnique({
      where: { clerkUserId },
      select: { id: true }
    })

    if (!user) {
      throw new Error('User not found - Clerk webhook may have failed')
    }

    // Save responses in transaction
    const result = await db.$transaction(async (tx: { response: { deleteMany: (arg0: { where: { userId: any; questionId: { in: string[] } } }) => any; create: (arg0: { data: { userId: any; questionId: string; answer: string } }) => any } }) => {
      // Delete existing responses
      await tx.response.deleteMany({
        where: {
          userId: user.id,
          questionId: { in: responses.map(r => r.questionId) }
        }
      })

      // Create new responses
      const savedResponses = await Promise.all(
        responses.map(response =>
          tx.response.create({
            data: {
              userId: user.id,
              questionId: response.questionId,
              answer: response.answer,
            }
          })
        )
      )

      return { userId: user.id, count: savedResponses.length }
    })

    console.log(`Saved ${result.count} responses for user ${result.userId}`)
    revalidatePath('/dashboard')

    return { success: true, count: result.count }
  } catch (error) {
    console.error('Error saving questionnaire responses:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}