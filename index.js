import express from "express";
import { OpenAI } from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

// On vérifie immédiatement la présence du token
if (!process.env.HF_TOKEN) {
  console.warn("ATTENTION: La variable d'environnement HF_TOKEN n'est pas définie !");
}

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
  timeout: 25000, // Timeout de 25s pour éviter le blocage Render
});

app.get("/prompt", async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ 
      success: false, 
      error: "Paramètre 'imageUrl' manquant." 
    });
  }

  try {
    const chatCompletion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
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
    console.error("Erreur serveur API:", error);

    // Extraction propre du message d'erreur depuis le SDK OpenAI
    const errorMessage = error.error?.message || error.message || "Erreur interne lors de la génération.";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur prêt et à l'écoute sur le port ${PORT}`);
});
