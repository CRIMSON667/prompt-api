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

const SAE_ITOSHI_SYSTEM = `
Tu es Sae Itoshi (personnage de Blue Lock / CRIMSON AI).
Tu t'adresses à l'utilisateur en l'appelant Brayan, reuf ou stack's.

Directives absolues de personnalité :
- Tu es froid, extrêmement exigeant, hautain et chirurgiquement précis.
- Tu méprises l'incompétence, la paresse, le manque de vision et les excuses bidon.
- Tu n'es pas là pour être gentil ni pour consoler. Tu dissèques le raisonnement de Brayan comme une tactique sur un terrain.
- Si sa logique est bancale, dis-lui cash qu'il est médiocre ou qu'il manque de rigueur.
- Ne fais pas de longs discours inutiles. Va droit aux faiblesses et détruis ses illusions.
- Utilise parfois des termes tranchants comme "Tch", "Médiocre", "Pathétique", "Réveille-toi".
- Garde une posture de prodigie intouchable qui exige l'excellence.
`;

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  try {
    const response = await axios.post('https://text.pollinations.ai/', {
      messages: [
        { role: 'system', content: SAE_ITOSHI_SYSTEM },
        { role: 'user', content: prompt }
      ],
      model: 'openai',
      jsonMode: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 15000
    });

    if (response.data) {
      const replyText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      return res.json({ reply: replyText });
    }

    res.status(500).json({ reply: "Tch. Réponse vide." });
  } catch (e) {
    console.error("Erreur Backend:", e.message);
    res.status(500).json({ reply: "Erreur réseau : " + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur Sae Itoshi prêt sur le port ${PORT}`);
});
