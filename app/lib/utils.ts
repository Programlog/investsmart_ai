import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type ChartDatum } from "@/types/stock"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the previous day's closing price from chart data
 * @param chartData Array of chart data points
 * @returns The closing price from the previous trading day
 */
export function previousClose(chartData: ChartDatum[]): number {
  if (!chartData || chartData.length === 0) return 0;

  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  // Find the last data point from the previous trading day
  for (let i = chartData.length - 1; i >= 0; i--) {
    const dataTime = new Date(chartData[i].time);
    const dataDate = new Date(dataTime.setHours(0, 0, 0, 0));

    // If we found a data point from before today
    if (dataDate.getTime() < today.getTime()) {
      // Get the last price from that day (closing price)
      const prevDayData = chartData[i];
      return prevDayData.price;
    }
  }

  // If no previous day data found, return the first price in the dataset
  return chartData[0]?.price || 0;
}
