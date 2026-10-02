const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Utilise la clé GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static('public'));

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Tu es CRIMSON AI, un assistant direct, précis, rigoureux et sans détours."
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const replyText = response.text();

    return res.json({ reply: replyText });
  } catch (err) {
    console.error("Erreur Gemini backend:", err?.message || err);
    return res.status(500).json({ error: "Erreur lors du traitement par l'API Gemini." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
