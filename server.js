const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const CRIMSON_SYSTEM = `
Tu es CRIMSON AI, un conseiller brutalement honnête, direct, logique, visuel et sans aucun filtre pour l'utilisateur (Brayan / reuf / stack's).

Directives absolues :
- Tu es froid, exigeant et chirurgiquement précis.
- Tu t'adresses à lui en l'appelant reuf, Brayan ou stack's.
`;

app.post('/api/prompt', async (req, res) => {
  const { prompt, image } = req.body;

  if (!prompt && !image) {
    return res.status(400).json({ error: 'Prompt ou image requis' });
  }

  try {
    const cleanPrompt = (prompt || '').toLowerCase().trim();

    const isImageGenerationQuery = prompt && (
      cleanPrompt.includes('génère') ||
      cleanPrompt.includes('genere') ||
      cleanPrompt.includes('généré') ||
      cleanPrompt.includes('crée') ||
      cleanPrompt.includes('cree') ||
      cleanPrompt.includes('créer') ||
      cleanPrompt.includes('dessine') ||
      cleanPrompt.includes('fais une image') ||
      cleanPrompt.includes('fais un dessin') ||
      cleanPrompt.includes('imagine') ||
      cleanPrompt.includes('generate') ||
      cleanPrompt.startsWith('photo de') ||
      cleanPrompt.startsWith('image de')
    ) && !image;

    // 1. Génération d'image ultra-fiable via Pollinations
    if (isImageGenerationQuery) {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      return res.json({
        reply: "Visuel généré :",
        imageUrl: imageUrl
      });
    }

    // 2. Traitement d'une image transmise
    if (image) {
      if (prompt) {
        try {
          const textRes = await axios.post('https://text.pollinations.ai/', {
            messages: [
              { role: 'system', content: CRIMSON_SYSTEM },
              { role: 'user', content: `${prompt}\n[L'utilisateur a transmis un visuel]` }
            ],
            model: 'openai'
          }, { timeout: 15000 });

          const responseText = typeof textRes.data === 'string' ? textRes.data : JSON.stringify(textRes.data);
          return res.json({ reply: responseText });
        } catch (e) {
          return res.json({ reply: "Incapable d'analyser le visuel pour l'instant." });
        }
      }
      return res.json({ reply: "Visuel reçu. Précise ton analyse." });
    }

    // 3. Prompt texte standard
    const response = await axios.post('https://text.pollinations.ai/', {
      messages: [
        { role: 'system', content: CRIMSON_SYSTEM },
        { role: 'user', content: prompt }
      ],
      model: 'openai'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    if (response.data) {
      const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      return res.json({ reply: responseText });
    }

    res.status(500).json({ reply: "Aucune réponse retournée." });
  } catch (e) {
    console.error("Erreur Backend:", e.message);
    res.status(500).json({ reply: "Erreur système : " + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur CRIMSON AI prêt sur le port ${PORT}`);
});
