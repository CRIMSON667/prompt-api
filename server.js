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

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  // 1. Pollinations OpenAI Endpoint (Très stable depuis Render)
  try {
    const response = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai`, {
      headers,
      timeout: 10000
    });
    if (response.data) {
      const textResponse = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      return res.json({ reply: textResponse });
    }
  } catch (e) {
    console.log('Pollinations failed:', e.message);
  }

  // 2. Vercel Gemini API
  try {
    const response = await axios.get(`https://apis-samir.vercel.app/gemini?prompt=${encodeURIComponent(prompt)}`, {
      headers,
      timeout: 8000
    });
    if (response.data && response.data.result) {
      return res.json({ reply: response.data.result });
    }
  } catch (e) {
    console.log('Vercel failed:', e.message);
  }

  res.status(500).json({ reply: "Erreur d'accès aux moteurs d'IA. Réessaie dans quelques secondes." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
