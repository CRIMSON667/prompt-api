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

const CUSTOM_IMAGE_GEN_API = "https://gem-tw6a.onrender.com/generate";

app.post('/api/prompt', async (req, res) => {
  const { prompt, image } = req.body;

  if (!prompt && !image) {
    return res.status(400).json({ error: 'Prompt ou image requis' });
  }

  try {
    const isImageGenerationQuery = prompt && (
      prompt.toLowerCase().includes('crée une photo') ||
      prompt.toLowerCase().includes('génère une image') ||
      prompt.toLowerCase().includes('crée la photo') ||
      prompt.toLowerCase().includes('dessine') ||
      prompt.toLowerCase().includes('imagine une photo') ||
      prompt.toLowerCase().includes('generate image') ||
      prompt.toLowerCase().startsWith('photo de')
    ) && !image;

    // 1. Génération d'une nouvelle image
    if (isImageGenerationQuery) {
      try {
        const imgRes = await axios.post(CUSTOM_IMAGE_GEN_API, { prompt: prompt }, { timeout: 30000 });
        const imageUrl = imgRes.data.imageUrl || imgRes.data.url || imgRes.data.image || imgRes.data;

        return res.json({
          reply: "Visuel généré.",
          imageUrl: typeof imageUrl === 'string' ? imageUrl : JSON.stringify(imageUrl)
        });
      } catch (imgErr) {
        console.error("Erreur API Génération Image:", imgErr.message);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
        return res.json({
          reply: "Génération (Moteur Secours) :",
          imageUrl: fallbackUrl
        });
      }
    }

    // 2. Traitement d'une image transmise
    if (image) {
      if (prompt && image.startsWith('http')) {
        const editApiUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(image)}&prompt=${encodeURIComponent(prompt)}`;
        return res.json({
          reply: "Image modifiée :",
          imageUrl: editApiUrl
        });
      }

      if (prompt) {
        try {
          const textRes = await axios.post('https://text.pollinations.ai/', {
            messages: [
              { role: 'system', content: CRIMSON_SYSTEM },
              { role: 'user', content: `${prompt}\n[L'utilisateur a joint une image]` }
            ],
            model: 'openai'
          }, { timeout: 15000 });

          const responseText = typeof textRes.data === 'string' ? textRes.data : JSON.stringify(textRes.data);
          return res.json({ reply: responseText });
        } catch (e) {
          return res.json({ reply: "Incapable d'analyser le visuel pour l'instant." });
        }
      }

      return res.json({ reply: "Image reçue. Précise ce que tu veux que j'en fasse (analyse ou modification)." });
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
