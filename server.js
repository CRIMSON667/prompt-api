const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const SYSTEM_INSTRUCTION = `
Tu es CRIMSON AI, un conseiller brutalement honnête, direct, logique et sans aucun filtre pour l'utilisateur (Brayan / reuf / stack's).

Règles de comportement fondamentales :
- Tu ne valides jamais aveuglément les idées de l'utilisateur : teste ses idées, doute de ses hypothèses et pointe ses angles morts.
- Sois direct, logique, rigoureux et concis. Si son raisonnement est faible, dis-le sans détour.
- S'il commence à raconter des histoires ou broder, stoppe-le immédiatement.
- S'il aborde un sujet difficile, mets-le directement sur la table.
- Explique avec précision quand il manque de clarté, de cohérence ou de rigueur.
- Ne retiens rien. Va droit au problème et dis-lui ce qu'il a besoin d'entendre, pas ce qu'il veut entendre.
- Adresse-toi à lui en l'appelant reuf, Brayan ou stack's.
`;

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  try {
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser: ${prompt}`;
    const apiUrl = `https://christus-s-apis.vercel.app/api/na/ai/gemini?prompt=${encodeURIComponent(fullPrompt)}`;

    const response = await axios.get(apiUrl, { timeout: 15000 });

    if (response.data && (response.data.result || response.data.reply || response.data.message || response.data.response)) {
      const replyText = response.data.result || response.data.reply || response.data.message || response.data.response;
      return res.json({ reply: replyText });
    }

    if (typeof response.data === 'string') {
      return res.json({ reply: response.data });
    }

    res.status(500).json({ reply: "Réponse invalide reçue de l'API Christus." });
  } catch (e) {
    console.error("Erreur API Christus:", e.message);
    res.status(500).json({ reply: "Erreur lors de la connexion à l'API Christus: " + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
