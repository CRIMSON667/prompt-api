const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Utilise ta clé API Gemini stockée dans l'environnement (GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  const cleanPrompt = prompt.toLowerCase().trim();

  // Détection des requêtes d'image
  const isImageRequest = 
    cleanPrompt.startsWith('/image') || 
    cleanPrompt.includes('imagine') || 
    cleanPrompt.includes('génère') || 
    cleanPrompt.includes('dessine') || 
    cleanPrompt.includes('photo');

  if (isImageRequest) {
    let subject = prompt
      .replace(/\/image/gi, '')
      .replace(/imagine/gi, '')
      .replace(/génère une image de/gi, '')
      .replace(/dessine/gi, '')
      .replace(/photo de/gi, '')
      .trim();

    if (!subject) subject = 'a black and white cat';

    const promptEn = subject
      .replace(/un chat/gi, 'a cat')
      .replace(/un chien/gi, 'a dog')
      .replace(/une voiture/gi, 'a car');

    const encoded = encodeURIComponent(promptEn);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true&model=flux`;

    return res.json({
      type: 'image',
      reply: `Visuel généré pour : "${subject}"`,
      url: imageUrl
    });
  }

  // Traitement du texte via Gemini API
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Tu es CRIMSON AI, un assistant direct, précis et efficace.",
      }
    });

    return res.json({
      type: 'text',
      reply: response.text
    });
  } catch (err) {
    console.error("Erreur Gemini:", err);
    return res.status(500).json({
      type: 'text',
      reply: "Erreur lors du traitement de la réponse texte."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
