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

app.post('/api/prompt', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  // 1. Pollinations AI (Ultra rapide & stable)
  try {
    const response = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, { timeout: 8000 });
    if (response.data) {
      return res.json({ reply: response.data });
    }
  } catch (e) {}

  // 2. Vercel API
  try {
    const response = await axios.get(`https://apis-samir.vercel.app/gemini?prompt=${encodeURIComponent(prompt)}`, { timeout: 5000 });
    if (response.data && response.data.result) {
      return res.json({ reply: response.data.result });
    }
  } catch (e) {}

  // 3. Sandip API
  try {
    const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(prompt)}`, { timeout: 5000 });
    if (response.data && response.data.answer) {
      return res.json({ reply: response.data.answer });
    }
  } catch (e) {}

  res.status(500).json({ reply: "Désolé, les serveurs d'IA sont temporairement indisponibles. Réessaye dans un instant." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
