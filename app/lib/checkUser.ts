import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export const checkUser = async () => {
    const user = await currentUser()

    if (!user) return null

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    })
    
    if (existingUser) return existingUser

    const newUser = await prisma.user.create({
      data: {
        clerkUserId: user.id,
        firstName: user.firstName || "Default User",
        lastName: user.lastName || "Default User",
        email: user.emailAddresses[0].emailAddress,
      },
    })

    return newUser

  }
  