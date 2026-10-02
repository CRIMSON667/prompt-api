const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route API
app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  // 1. Vercel API
  try {
    const response = await axios.get(`https://apis-samir.vercel.app/gemini?prompt=${encodeURIComponent(prompt)}`);
    if (response.data && response.data.result) {
      return res.json({ reply: response.data.result });
    }
  } catch (e) {}

  // 2. Popcat API
  try {
    const response = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(prompt)}&owner=CRIMSON&botname=CRIMSONAI`);
    if (response.data && response.data.response) {
      return res.json({ reply: response.data.response });
    }
  } catch (e) {}

  // 3. Sandip API
  try {
    const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(prompt)}`);
    if (response.data && response.data.answer) {
      return res.json({ reply: response.data.answer });
    }
  } catch (e) {}

  res.status(500).json({ error: 'Toutes les API ont échoué.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
