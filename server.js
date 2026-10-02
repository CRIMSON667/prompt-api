const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.post('/api/prompt', async (req, res) => {
  const { prompt, imageBase64, mimeType } = req.body;

  if (!prompt && !imageBase64) {
    return res.status(400).json({ error: 'Prompt ou image requis' });
  }

  try {
    // Utilisation du modèle gemini-2.5-flash mis à jour
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: "Tu es CRIMSON AI, un assistant direct, précis, rigoureux et sans détours."
    });

    let parts = [];

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }

    if (prompt) {
      parts.push({ text: prompt });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const replyText = response.text();

    return res.json({ reply: replyText });
  } catch (err) {
    console.error("Erreur serveur Gemini:", err);
    return res.status(500).json({ error: err.message || "Erreur interne du serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur CRIMSON prêt sur le port ${PORT}`);
});
