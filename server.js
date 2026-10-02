const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt vide" });

    try {
        const response = await axios.post("https://christus-s-apis.vercel.app/api/na/ai/gemini", {
            prompt: prompt,
            image_url: null
        }, { timeout: 10000 });

        const data = response.data;
        let answer = typeof data === "string" ? data : (data.result?.answer || data.answer || data.response || "Pas de réponse");

        res.json({ reply: answer });
    } catch (err) {
        try {
            const popcatRes = await axios.get(`https://api.popcat.xyz/gemini?msg=${encodeURIComponent(prompt)}`);
            res.json({ reply: popcatRes.data.response || "Erreur serveur" });
        } catch (e) {
            res.status(500).json({ error: "Toutes les API ont échoué" });
        }
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur prêt sur http://localhost:${PORT}`));
