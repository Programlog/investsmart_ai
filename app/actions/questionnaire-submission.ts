'use server'

import { prisma as db } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Response validator using Zod for input validation
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

    // Get user profile details from Clerk
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error('Failed to retrieve user details')
    }
    
    // Get primary email from Clerk
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
    if (!primaryEmail) {
      throw new Error('User email not available')
    }

    // Transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Try to find user by Clerk ID first
      let user = await tx.user.findUnique({
        where: { clerkUserId },
        select: { id: true }
      })

      // If not found, try to find by email
      if (!user) {
        const userByEmail = await tx.user.findUnique({
          where: { email: primaryEmail },
          select: { id: true }
        })

        if (userByEmail) {
          // User exists with this email but different Clerk ID
          // Update the Clerk ID to maintain the relationship
          user = await tx.user.update({
            where: { email: primaryEmail },
            data: { clerkUserId },
            select: { id: true }
          })
          console.log(`Updated existing user with new Clerk ID: ${clerkUserId}`)
        } else {
          // User doesn't exist at all, create new user
          console.log(`Creating new user with Clerk ID: ${clerkUserId}`)
          user = await tx.user.create({
            data: {
              clerkUserId,
              email: primaryEmail,
              firstName: clerkUser.firstName || '',
              lastName: clerkUser.lastName || '',
            },
            select: { id: true }
          })
        }
      }

      // Save all questionnaire responses
      // First, check if responses already exist and delete them to avoid duplicates
      await tx.response.deleteMany({
        where: {
          userId: user.id,
          questionId: { in: responses.map(r => r.questionId) }
        }
      })

      // Now create new responses
      const savedResponses = await Promise.all(
        responses.map(response => 
          tx.response.create({
            data: {
              userId: user!.id,
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