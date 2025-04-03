import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { userId, symbol, quantity } = req.body

    const asset = await prisma.portfolio.create({
      data: {
        userId,
        symbol,
        quantity: parseFloat(quantity),
      },
    })

    res.status(200).json(asset)
  } catch (error) {
    console.error('Request error', error)
    res.status(500).json({ error: 'Error adding portfolio item' })
  }
}
