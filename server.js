import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY. Add it to your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use("/api/", rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute and try again." }
}));

app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  index: "index.html"
}));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const language = typeof req.body?.language === "string" ? req.body.language : "en-IN";

    if (!message) return res.status(400).json({ error: "Please enter a message." });
    if (message.length > 8000) return res.status(400).json({ error: "Message is too long (maximum 8,000 characters)." });

    const languageInstruction = language === "te-IN"
      ? "Reply in natural Telugu. Keep technical terms in English when that makes the answer clearer."
      : "Reply in the same language as the user's message. If the user writes Telugu, answer in Telugu; if English, answer in English.";

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: message,
      config: {
        systemInstruction:
          "You are ULTRON, a helpful personal AI assistant. Be accurate, friendly, concise, and transparent about limitations. " +
          languageInstruction +
          " You cannot directly control the user's phone unless a separate, permissioned Android native integration is provided. " +
          "Never claim that you performed a phone action unless a real tool confirms it."
      }
    });

    const reply = response.text?.trim();
    if (!reply) return res.status(502).json({ error: "Gemini returned an empty response. Please try again." });
    return res.json({ reply });
  } catch (error) {
    console.error("Gemini request failed:", error?.message || error);
    const status = Number(error?.status) || 502;
    if (status === 429) return res.status(429).json({ error: "Gemini rate limit reached. Please wait and try again." });
    return res.status(502).json({ error: "Gemini could not answer right now. Check your API key, model access, quota, and internet connection." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ULTRON is running on http://localhost:${PORT}`);
});
