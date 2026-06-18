import { NextResponse } from "next/server";
import OpenAI from "openai";

const FALLBACK_REPLY =
  "Sorry, I'm having trouble responding right now. You can still request a quote using the booking form.";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 10;

const ASSISTANT_INSTRUCTIONS = `You are Saskia Cleaning's website assistant for saskiaservices.com.

Be friendly, concise, and helpful. You help customers understand:
- residential cleaning
- standard cleaning
- deep cleaning
- move-in / move-out cleaning
- Airbnb turnover cleaning
- commercial cleaning
- laundry services
- add-ons
- pricing and estimates
- service areas in Massachusetts and Rhode Island
- referral rewards ($20 off for friends, $20 reward for referrers after completed service)

Encourage users to request a quote using the booking form on the website when they want pricing or to schedule service.

When a user asks for price, explain that prices depend on service type, rooms, add-ons, location, and date. Invite them to use the quote form for an estimate. Do not invent guaranteed final prices.

Do not promise unavailable services.

When a user wants to book, ask for name, location, service type, preferred date, and contact info. Direct them to the quote form when appropriate.

Keep replies under 90 words unless the user asks for more detail.

Do not collect payment.
Do not claim to be human.
Do not provide legal, medical, or emergency advice.

If the user asks about unrelated topics, gently redirect to Saskia Cleaning services.`;

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    (record.sender === "bot" || record.sender === "user") &&
    typeof record.text === "string"
  );
}

function sanitizeMessages(messages: unknown): ChatMessage[] | null {
  if (!Array.isArray(messages)) return null;

  const cleaned: ChatMessage[] = [];

  for (const item of messages) {
    if (!isChatMessage(item)) return null;

    const text = item.text.trim();
    if (!text) continue;

    if (text.length > MAX_MESSAGE_LENGTH) {
      return null;
    }

    cleaned.push({
      sender: item.sender,
      text,
    });
  }

  return cleaned.slice(-MAX_MESSAGES);
}

function toOpenAIInput(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.sender === "user" ? ("user" as const) : ("assistant" as const),
    content: message.text,
  }));
}

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const record = body as Record<string, unknown>;
    const messages = sanitizeMessages(record.messages);

    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    const client = new OpenAI({ apiKey });

    try {
      const response = await client.responses.create({
        model: "gpt-5.2",
        instructions: ASSISTANT_INSTRUCTIONS,
        input: toOpenAIInput(messages),
      });

      const reply = response.output_text?.trim();
      if (!reply) {
        return NextResponse.json({ reply: FALLBACK_REPLY });
      }

      return NextResponse.json({ reply });
    } catch (error) {
      console.error("OpenAI chatbot error:", error);
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }
  } catch (error) {
    console.error("Chatbot route error:", error);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
