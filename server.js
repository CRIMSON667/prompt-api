const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";

app.post("/api/prompt", async (req, res) => {
    try {
        const { prompt } = req.body;
        const userPrompt = prompt || "Bonjour";

        console.log("-> Envoi du prompt :", userPrompt);

        // Test avec l'API en passant le texte en paramètre query si le post body ne suffit pas
        const response = await axios.get(AI_API_URL, {
            params: { text: userPrompt },
            timeout: 60000
        });

        const data = response.data;
        console.log("<- Réponse brute API :", data);

        let answer = data?.result?.answer || data?.answer || data?.result || data?.response || data?.message || data?.text;

        if (!answer) {
            throw new Error("L'API n'a renvoyé aucune réponse valide.");
        }

        res.json({ reply: answer });

    } catch (error) {
        console.error("❌ ERREUR API:", error?.response?.status, error?.response?.data || error.message);
        res.status(500).json({ error: error?.response?.data?.error || error.message || "Erreur interne." });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Crimson en ligne sur le port ${PORT}`);
});
