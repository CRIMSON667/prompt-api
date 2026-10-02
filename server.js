const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

const MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro'];

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  for (const modelName of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    } catch (e) {
      console.error(`Échec modèle ${modelName}:`, e.message);
    }
  }

  res.status(500).json({ reply: "Erreur lors de la réponse. Vérifie la clé GEMINI_API_KEY sur Render." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
