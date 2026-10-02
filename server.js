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
- Si l'utilisateur te fournit une image ou demande d'analyser/modifier un visuel, traite la demande avec la même rigueur.
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

    // 1. Génération d'une nouvelle image à partir de zéro
    if (isImageGenerationQuery) {
      try {
        const imgRes = await axios.post(CUSTOM_IMAGE_GEN_API, { prompt: prompt }, { timeout: 30000 });
        const imageUrl = imgRes.data.imageUrl || imgRes.data.url || imgRes.data.image || imgRes.data;

        return res.json({
          reply: "Voilà le visuel généré. Regarde si ça respecte tes exigences.",
          imageUrl: typeof imageUrl === 'string' ? imageUrl : JSON.stringify(imageUrl)
        });
      } catch (imgErr) {
        console.error("Erreur API Génération Image:", imgErr.message);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
        return res.json({
          reply: "Ton API de génération a mis trop de temps à répondre. Passage sur le moteur de secours.",
          imageUrl: fallbackUrl
        });
      }
    }

    let responseText = "";

    // 2. Traitement d'une image existante (Analyse ou Édition)
    if (image) {
      const imageUrlPrompt = prompt ? prompt : "Analyse cette image et donne ton avis sans pitié.";

      // Analyse textuelle de l'image via Gemini / OpenAI
      try {
        const textRes = await axios.post('https://text.pollinations.ai/', {
          messages: [
            { role: 'system', content: CRIMSON_SYSTEM },
            { role: 'user', content: `${imageUrlPrompt}\n[Image transmise]` }
          ],
          model: 'openai'
        }, { timeout: 15000 });

        responseText = typeof textRes.data === 'string' ? textRes.data : JSON.stringify(textRes.data);
      } catch (e) {
        responseText = "Image reçue pour traitement.";
      }

      // Si l'utilisateur demande une modification de l'image existante
      if (prompt && (
        prompt.toLowerCase().includes('modifie') ||
        prompt.toLowerCase().includes('transforme') ||
        prompt.toLowerCase().includes('refais') ||
        prompt.toLowerCase().includes('édit') ||
        prompt.toLowerCase().includes('edit') ||
        prompt.toLowerCase().includes('change')
      )) {
        try {
          // Appel de l'API d'édition d'image
          const editApiUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(image)}&prompt=${encodeURIComponent(prompt)}`;
          const editRes = await axios.get(editApiUrl, { timeout: 30000 });
          const editedImageUrl = editRes.data.imageUrl || editRes.data.url || editRes.data.result || editRes.data;

          return res.json({
            reply: responseText,
            imageUrl: typeof editedImageUrl === 'string' ? editedImageUrl : editApiUrl
          });
        } catch (editErr) {
          console.error("Erreur API Éditeur Image:", editErr.message);
          // Fallback direct vers l'URL si l'API renvoie le fichier directement
          const directEditUrl = `https://azadx69x.is-a.dev/api/editor?url=${encodeURIComponent(image)}&prompt=${encodeURIComponent(prompt)}`;
          return res.json({
            reply: responseText,
            imageUrl: directEditUrl
          });
        }
      }

      return res.json({ reply: responseText });
    }

    // 3. Traitement d'un prompt texte standard
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
      responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      return res.json({ reply: responseText });
    }

    res.status(500).json({ reply: "Tch. Aucune donnée retournée." });
  } catch (e) {
    console.error("Erreur Backend:", e.message);
    res.status(500).json({ reply: "Erreur système lors du traitement : " + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur CRIMSON AI prêt sur le port ${PORT}`);
});
