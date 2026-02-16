import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import { streamSSE } from "hono/streaming";

const app = new Hono<{ Bindings: Env }>();

// Sample card data for AI recommendations
const sampleCards = [
  {
    id: "card_1",
    name: "HDFC Millennia",
    bank: "HDFC Bank",
    network: "Visa",
    rewards: {
      dining: 5,
      groceries: 5,
      shopping: 2.5,
      travel: 1,
      fuel: 1,
      utilities: 1,
      entertainment: 5,
      others: 1,
    },
  },
  {
    id: "card_2",
    name: "Axis Flipkart",
    bank: "Axis Bank",
    network: "Mastercard",
    rewards: {
      shopping: 5,
      dining: 4,
      groceries: 1.5,
      travel: 1.5,
      fuel: 1.5,
      utilities: 1.5,
      entertainment: 1.5,
      others: 1.5,
    },
  },
  {
    id: "card_3",
    name: "ICICI Amazon Pay",
    bank: "ICICI Bank",
    network: "Visa",
    rewards: {
      shopping: 5,
      dining: 2,
      groceries: 2,
      travel: 1,
      fuel: 1,
      utilities: 1,
      entertainment: 2,
      others: 1,
    },
  },
];

app.post("/api/analyze", async (c) => {
  const { merchant, amount } = await c.req.json();

  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: "Gemini API key not configured" }, 500);
  }

  const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

  const systemInstruction = `You are a purchase category classifier for credit card rewards optimization.

Given a merchant name, determine the most likely purchase category from these options:
- dining (restaurants, food delivery, cafes)
- groceries (supermarkets, grocery stores)
- shopping (retail, e-commerce, clothing)
- travel (airlines, hotels, booking sites)
- fuel (gas stations, petrol pumps)
- utilities (electricity, water, telecom bills)
- entertainment (movies, streaming, events)
- others (anything else)

Indian merchants reference:
- Swiggy, Zomato, Dominos, McDonald's → dining
- BigBasket, DMart, More, Reliance Fresh → groceries
- Flipkart, Amazon, Myntra, Ajio → shopping
- MakeMyTrip, Goibibo, Airbnb, Uber → travel
- HP, Indian Oil, Bharat Petroleum → fuel
- Jio, Airtel, BSNL, electricity companies → utilities
- BookMyShow, Netflix, Hotstar, PVR → entertainment`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Classify this merchant: ${merchant}`,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 100,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            confidence: { type: "number" }
          },
          required: ["category", "confidence"]
        }
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("No response from AI");
    }

    const { category, confidence } = JSON.parse(text);

    // Find best card for this category
    let bestCard = sampleCards[0];
    let bestReward = 0;

    for (const card of sampleCards) {
      const reward = card.rewards[category as keyof typeof card.rewards] || 0;
      if (reward > bestReward) {
        bestReward = reward;
        bestCard = card;
      }
    }

    const estimatedReward = (parseFloat(amount) * bestReward) / 100;

    return c.json({
      category,
      confidence,
      recommendedCard: {
        id: bestCard.id,
        name: bestCard.name,
        bank: bestCard.bank,
      },
      estimatedReward: {
        value: estimatedReward.toFixed(2),
        unit: "INR",
        percentage: bestReward,
      },
      explanation: `${merchant} is categorized as ${category}. ${bestCard.name} offers ${bestReward}% cashback on ${category}.`,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return c.json({ error: "Failed to analyze purchase" }, 500);
  }
});

app.post("/api/chat", async (c) => {
  const { message } = await c.req.json();

  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: "Gemini API key not configured" }, 500);
  }

  const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

  const systemInstruction = `You are CardWise AI, a helpful assistant for credit card rewards optimization.

You have access to the user's credit cards:
${JSON.stringify(sampleCards, null, 2)}

When users ask which card to use for a purchase:
1. Identify the likely category (dining, groceries, shopping, travel, fuel, utilities, entertainment, others)
2. Find the card with the highest reward rate for that category
3. Provide a clear, concise recommendation with the estimated cashback/reward percentage
4. Be friendly and conversational

Keep responses brief and focused on card recommendations.`;

  return streamSSE(c, async (stream) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 1.0,
        maxOutputTokens: 500,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        await stream.writeSSE({
          data: chunk.text,
        });
      }
    }

    await stream.writeSSE({
      data: "[DONE]",
    });
  });
});

export default app;
