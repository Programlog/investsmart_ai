"use server";
import { GoogleGenAI, Type } from '@google/genai';
import { unstable_cache } from "next/cache";
import type { MarketIndex, TrendingAsset, StockRating, StockRatingRequest, InvestmentProfile } from "@/types/stock";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const systemInstruction = `You are a helpful AI chatbot specialized in finance and the economy. Your primary focus is to discuss topics such as investment strategies, market trends, and financial planning. 
  You can also engage in basic casual conversation, specifically responding to greetings and farewells or similar simple remarks. If a user asks about a topic outside of finance, 
  politely steer the conversation back to finance-related subjects. For example, you can say something like, 'That's an interesting topic, but let's get back to finance. 
  Is there anything you'd like to discuss about investments or financial planning?' or 'While that's not my area of expertise, I can definitely help you with questions about market trends or investment strategies.' 
  Keep your responses concise and helpful within the scope of finance and basic greetings/farewells. Important: keep your responses under 100 words. Responses should be in plain text, emojis are acceptable.`

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const stockRatingConfig = {
  temperature: 0,
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      rating: {
        type: Type.STRING,
      },
      reasoning: {
        type: Type.STRING,
      },
    },
  },
};

const InvestmentProfileConfig = {
  temperature: 0,
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      risk_tolerance: {
        type: Type.STRING,
        description: "User's risk tolerance in a 3-4 words.",
      },
      investment_goals: {
        type: Type.STRING,
        description: "User's investment goals in 3-4 words.",
      },
      time_horizon: {
        type: Type.INTEGER,
        description: "User's investment time horizon in years.",
      },
      recommended_allocation: {
        type: Type.OBJECT,
        properties: {
          stocks: {
            type: Type.INTEGER,
            description: "Recommended allocation in stocks as a percentage.",
          },
          bonds: {
            type: Type.INTEGER,
            description: "Recommended allocation in bonds as a percentage.",
          },
          cash: {
            type: Type.INTEGER,
            description: "Recommended allocation in cash as a percentage.",
          },
        },
        description: "Recommended asset allocation. Total percentage should equal 100.",
        required: ['stocks', 'bonds', 'cash'],
      },
    },
    required: ['risk_tolerance', 'investment_goals', 'time_horizon', 'recommended_allocation'],
  },
};


const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  config: {
    systemInstruction: systemInstruction,
    temperature: 0,
    maxOutputTokens: 225,
    tools: [{ googleSearch: {} }],
  },
});

export async function generateText(prompt: string, onChunk?: (chunk: string) => void): Promise<string> {
  const result = await chat.sendMessageStream({ message: prompt });
  let text = "";

  for await (const chunk of result) {
    if (chunk.text) {
      const chunkOfText = chunk.text;
      text += chunkOfText;
      onChunk?.(chunkOfText);
    }
  }

  return text;
}

export async function generateInvestmentProfile(answers: Record<string, string>): Promise<InvestmentProfile> {
  try {
    const prompt = `
      Based on these answers, generate a concise investment profile (type, description, recommended asset allocation, and a brief explanation):
      Risk tolerance: ${answers.risk_tolerance}
      Financial goals: ${answers.financial_goals}
      Investment experience: ${answers.investment_experience}
      Time horizon: ${answers.time_horizon}
      Income range: ${answers.income_range}
      Note: for risk_tolerance and recommended_allocation output user-friendly strings.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: InvestmentProfileConfig,
    });
    if (!response.text) {
      throw new Error("No response text received");
    }
    const parsedResponse: InvestmentProfile = JSON.parse(response.text);
    console.log("Parsed Investment Profile:", parsedResponse);
    return parsedResponse;
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


// Generate a buy/hold/sell rating for a stock using news and key metrics.
export async function generateStockRating(stockRatingRequest: StockRatingRequest): Promise<StockRating> {
  const { symbol, news, metrics } = stockRatingRequest;
  const newsSummaries = news && news.length > 0
    ? news.map((n) => `- ${n.title}: ${n.summary}`).join("\n")
    : "No recent news.";

  const prompt = `You are an advanced financial assistant. Given the following recent news and financial metrics for the stock ${symbol}, provide a JSON response with keys: Rating (buy, hold, or sell) and Reason (concise, <100 words):\n\nRecent News Headlines:\n${newsSummaries}\n\nKey Metrics:\n- Market Cap: ${metrics.marketCapitalization}\n- P/E (TTM): ${metrics.peTTM}\n- P/E (Annual): ${metrics.peAnnual}\n- EPS (TTM): ${metrics.epsTTM}\n- EPS (Annual): ${metrics.epsAnnual}\n- Dividend Yield: ${metrics.dividendYieldIndicatedAnnual}\n- Beta: ${metrics.beta}\n- 52-Week Range: ${metrics["52WeekLow"]} - ${metrics["52WeekHigh"]}\n- Profit Margin: ${metrics.netProfitMarginTTM}\n\nYour response must be valid JSON with exactly the format: {"Rating": "buy|hold|sell", "Reason": "your analysis"}. Capitalize "Rating" and "Reason" in the JSON keys.`;

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

  const response = await ai.models.generateContent({
    model,
    config: stockRatingConfig,
    contents,
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response text received");
  }
  return JSON.parse(text);
}

export { getCachedMarketCommentary }