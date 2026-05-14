import { GoogleGenAI } from "@google/genai";

let client = null;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 20000);

export const SYSTEM_PROMPTS = {
  weekly:
    "You are a warm, encouraging habit coach. Analyse the user's last 7 days of habit data and write a short progress summary.",
  suggestions:
    "You are a helpful habit coach. Based on the user's goals, productive time, and past struggles, suggest effective next steps.",
  recovery:
    "You are a compassionate habit recovery coach. The user broke a streak. Write a 3-day recovery plan tailored to them.",
  chat:
    "You are a helpful habit analysis assistant. Answer the user's question using ONLY the provided habit data.",
  morning:
    "You are a warm, motivating friend. Write a single short morning message (30-60 words) using the user's data.",
};

const fallbackContent = (system = "") => {
  if (system === SYSTEM_PROMPTS.weekly) {
    return "Nice progress this week. Keep focusing on small, repeatable wins and protect the habits that are already working. If one habit slipped, restart with the easiest version today.";
  }

  if (system === SYSTEM_PROMPTS.recovery) {
    return "Day 1: restart small and complete the easiest version of the habit. Day 2: repeat it at the same time and remove one obstacle. Day 3: return to your normal target only if the small version feels steady.";
  }

  if (system === SYSTEM_PROMPTS.chat) {
    return "Based on your habit data, consistency matters more than intensity. Your best next step is to keep the strongest habits easy and reduce friction around the habits with lower completion.";
  }

  if (system === SYSTEM_PROMPTS.morning) {
    return "Good morning! Start with one small win today. Check off the easiest habit first, build momentum, and let the rest of the day follow from that.";
  }

  return "Here are a few simple habit ideas to build momentum today.";
};

export const getClient = () => {
  if (process.env.AI_DISABLED === "true") return null;
  if (client) return client;

  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  client = new GoogleGenAI({ apiKey: key });
  return client;
};

export const isAIEnabled = () =>
  process.env.AI_DISABLED !== "true" && !!process.env.GEMINI_API_KEY;

export const parseJSON = (text) => {
  let cleaned = (text || "").trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
  }

  return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({ system, user, temperature = 0.7 }) => {
  const c = getClient();

  if (!c) {
    return {
      ok: false,
      content: fallbackContent(system),
    };
  }

  try {
    const res = await Promise.race([
      c.models.generateContent({
        model: MODEL,
        contents: user,
        config: {
          systemInstruction: system,
          temperature,
        },
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`AI request timed out after ${AI_TIMEOUT_MS}ms`)),
          AI_TIMEOUT_MS
        )
      ),
    ]);

    return {
      ok: true,
      content: res.text || fallbackContent(system),
    };
  } catch (err) {
    if (
      err.message?.includes("RESOURCE_EXHAUSTED") ||
      err.message?.includes("429")
    ) {
      console.warn("AI quota exhausted. Using static response.");
      return {
        ok: false,
        content: fallbackContent(system),
      };
    }

    console.error("AI error:", err.message);
    return {
      ok: false,
      content: fallbackContent(system),
    };
  }
};
