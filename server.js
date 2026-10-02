const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Tu es CRIMSON AI, un assistant direct, précis et efficace.",
      }
    });

    return res.json({ reply: response.text });
  } catch (err) {
    console.error("Erreur Gemini:", err);
    return res.status(500).json({ error: "Erreur lors du traitement de la réponse." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
