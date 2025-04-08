"use server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AddStockParams {
  userId: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
}

export async function addStockToPortfolio(stockData: AddStockParams) {
  try {
    return await prisma.portfolio.create({
      data: {
        user: { connect: { id: stockData.userId } },
        symbol: stockData.symbol,
        name: stockData.name,
        quantity: stockData.quantity,
        purchasePrice: stockData.purchasePrice,
      }
    });
  } catch (error) {
    console.error('Failed to add stock:', error);
    throw new Error('Failed to add stock to portfolio');
  }
}

export async function addAsset(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const assetData = {
    userId,
    symbol: formData.get("symbol") as string,
    name: formData.get("name") as string,
    quantity: Number(formData.get("quantity")),
    purchasePrice: Number(formData.get("purchasePrice")),
  };

  try {
    await addStockToPortfolio(assetData);
    return { success: true, message: "Asset added to portfolio" };
  } catch (error) {
    console.error("Add asset error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to add asset" 
    };
  }
}
