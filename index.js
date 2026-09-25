import express from "express";
import { OpenAI } from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

app.get("/prompt", async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ success: false, message: "imageUrl est requise." });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "Qwen/Qwen2-VL-72B-Instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a detailed Midjourney prompt describing this image.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    });

    const prompt = chatCompletion.choices[0]?.message?.content || "Aucun prompt généré.";

    return res.json({ success: true, prompt });
  } catch (error) {
    console.error("Erreur API:", error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || "Erreur interne",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
