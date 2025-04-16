"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  tools: [{ google_search: {} }] as any
});

let isAwaitingResponse = true;

// REAL function
export async function generateText(prompt: string, onChunk?: (chunk: string) => void): Promise<string> {
  isAwaitingResponse = true;
  try {
    const result = await chat.sendMessageStream(prompt)
    let text = "";

    for await (const chunk of result.stream) {
      const chunkOfText = await chunk.text();
      text += chunkOfText;
      onChunk?.(chunkOfText);
    }

    isAwaitingResponse = false;

    return text;
  } catch (error: any) {
    console.log("API error:", geminiApiKey);
    console.error("Error generating text:", error);
    throw new Error(error.message);
  }
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
    // Parse the AI's JSON response
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating investment profile:", error);
    throw error;
  }
}


// Function to search for investment terms and concepts
export async function searchInvestmentTerms(query: string) {
  try {
    // In a real app, this would call an API to search for investment terms
    // For demo purposes, we'll simulate a response

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock data
    return {
      results: [
        {
          id: "1",
          title: "What is an ETF?",
          snippet:
            "Exchange-traded funds (ETFs) are a type of investment fund and exchange-traded product, i.e., they are traded on stock exchanges...",
          url: "https://example.com/etf-guide",
          source: "article",
        },
        {
          id: "2",
          title: query + " Definition",
          snippet: "A comprehensive explanation of " + query + " in the context of investing and finance.",
          url: "#",
          source: "definition",
        },
      ],
    }
  } catch (error) {
    console.error("Error searching investment terms:", error)
    throw error
  }
}

// Function to get market data
export async function getMarketData() {
  try {
    // In a real app, this would call an API to get market data
    // For demo purposes, we'll simulate a response

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock data
    return {
      indices: [
        {
          id: "sp500",
          name: "S&P 500",
          value: 5123.45,
          change: 23.45,
          changePercent: 0.46,
        },
        {
          id: "dow",
          name: "Dow Jones",
          value: 38765.32,
          change: -125.68,
          changePercent: -0.32,
        },
      ],
      trending: [
        {
          id: "1",
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 175.5,
          change: 2.75,
          changePercent: 1.59,
        },
        {
          id: "2",
          symbol: "TSLA",
          name: "Tesla, Inc.",
          price: 245.75,
          change: 12.5,
          changePercent: 5.36,
        },
      ],
    }
  } catch (error) {
    console.error("Error getting market data:", error)
    throw error
  }
}

// Function to generate market commentary
export async function generateMarketCommentary(marketData: {
  indices: any[];
  trendingAssets: any[];
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