"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GoogleGenAI,
  Type,
} from '@google/genai';

import { unstable_cache } from "next/cache";
import type { MarketIndex, TrendingAsset, StockMetrics, NewsItem } from "@/types/stock";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const systemInstruction = `You are a helpful AI chatbot specialized in finance and the economy. Your primary focus is to discuss topics such as investment strategies, market trends, and financial planning. 
  You can also engage in basic casual conversation, specifically responding to greetings and farewells or similar simple remarks. If a user asks about a topic outside of finance, 
  politely steer the conversation back to finance-related subjects. For example, you can say something like, 'That's an interesting topic, but let's get back to finance. 
  Is there anything you'd like to discuss about investments or financial planning?' or 'While that's not my area of expertise, I can definitely help you with questions about market trends or investment strategies.' 
  Keep your responses concise and helpful within the scope of finance and basic greetings/farewells. Important: keep your responses under 100 words. Responses should be in plain text, emojis are acceptable.`

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: systemInstruction, })
const chat = model.startChat({
  history: [],
  generationConfig: {
    temperature: 0.0,
    maxOutputTokens: 200,
  },
  tools: [{ google_search: {} }] as unknown as object[]
});

export async function generateText(prompt: string, onChunk?: (chunk: string) => void): Promise<string> {
  const result = await chat.sendMessageStream(prompt)
  let text = "";

  for await (const chunk of result.stream) {
    const chunkOfText = await chunk.text();
    text += chunkOfText;
    onChunk?.(chunkOfText);
  }

  return text;
}

export async function generateInvestmentProfile(answers: Record<string, string>) {
  try {
    const prompt = `
      Based on these answers, generate a concise investment profile (type, description, recommended asset allocation as an array of {name, value, color}, and a brief explanation):
      Risk tolerance: ${answers.risk_tolerance}
      Financial goals: ${answers.financial_goals}
      Investment experience: ${answers.investment_experience}
      Time horizon: ${answers.time_horizon}
      Income range: ${answers.income_range}
      Respond in JSON format with keys: type, description, allocation, explanation.
    `;
    const response = await generateText(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating investment profile:", error);
    throw error;
  }
}

export async function generateMarketCommentary(marketData: {
  indices: MarketIndex[];
  trendingAssets: TrendingAsset[];
}): Promise<string> {
  const prompt = `
    Based on today's market data:
    
    Market Indices:
    ${marketData.indices.map(index =>
    `${index.name}: ${index.value.toFixed(2)} (${index.changePercent >= 0 ? '+' : ''}${index.changePercent.toFixed(2)}%)`
  ).join('\n')}
    
    Top Trending Stocks:
    ${marketData.trendingAssets.map(asset =>
    `${asset.symbol}: $${asset.price.toFixed(2)} (${asset.changePercent >= 0 ? '+' : ''}${asset.changePercent.toFixed(2)}%)`
  ).join('\n')}
    
    Provide a brief, insightful market commentary analyzing today's market performance and key trends. Include potential factors affecting the market and what investors should watch for. Do not write any introductions, dive straight into the commentary. Keep it concise and informative. Important: keep your response under 200 words. Responses should be in plain text, emojis are acceptable.';
  `;

  return generateText(prompt);
}

const getCachedMarketCommentary = unstable_cache(
  async (marketData: { indices: MarketIndex[]; trendingAssets: TrendingAsset[] }) => {
    return generateMarketCommentary(marketData);
  },
  ["market-commentary"],
  { revalidate: 60 * 60 * 5 } // 5 hours
);

/**
 * Generate a buy/hold/sell rating for a stock using news and key metrics.
 * @param symbol Stock ticker symbol
 * @param news Array of NewsItem
 * @param metrics StockMetrics
 */
export async function generateStockRating({ symbol, news, metrics, }: {
  symbol: string;
  news: NewsItem[];
  metrics: StockMetrics;
}): Promise<{ rating: string; reasoning: string }> {
  const newsSummaries = news && news.length > 0
    ? news.map((n) => `- ${n.title}: ${n.summary}`).join("\n")
    : "No recent news.";

  const prompt = `You are an advanced financial assistant. Given the following recent news and financial metrics for the stock ${symbol}, provide a JSON response with keys: rating (buy, hold, or sell) and reasoning (concise, <100 words):\n\nRecent News Headlines:\n${newsSummaries}\n\nKey Metrics:\n- Market Cap: ${metrics.marketCapitalization}\n- P/E (TTM): ${metrics.peTTM}\n- P/E (Annual): ${metrics.peAnnual}\n- EPS (TTM): ${metrics.epsTTM}\n- EPS (Annual): ${metrics.epsAnnual}\n- Dividend Yield: ${metrics.dividendYieldIndicatedAnnual}\n- 52W Range: ${metrics["52WeekLow"]} - ${metrics["52WeekHigh"]}\n- Beta: ${metrics.beta}\n- 10D Avg Volume: ${metrics["10DayAverageTradingVolume"]}\n- 3M Avg Volume: ${metrics["3MonthAverageTradingVolume"]}\n- Net Profit Margin (TTM): ${metrics.netProfitMarginTTM}\n- EPS Growth YoY: ${metrics.epsGrowthTTMYoy}\n- Revenue Growth YoY: ${metrics.revenueGrowthTTMYoy}\n\nRespond only in JSON.`;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    temperature: 0,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        Rating: {
          type: Type.STRING,
        },
        Reason: {
          type: Type.STRING,
        },
      },
    },
  };
  const model = 'gemini-2.0-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let text = "";
  for await (const chunk of response) {
    text += chunk.text;
  }
  return JSON.parse(text);
}

export { getCachedMarketCommentary }