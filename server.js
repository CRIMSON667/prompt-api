const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";
const IMG2PROMPT_API_URL = "https://smfahim.xyz/ai/img2prompt/v3";

async function analyzeImage(imageUrl) {
    try {
        const response = await axios.get(IMG2PROMPT_API_URL, {
            params: { imageUrl, language: "fr", model: 0 },
            timeout: 60000
        });
        const data = response.data;
        if (data?.success && typeof data?.prompt === "string") return data.prompt;
        if (typeof data?.prompt === "string") return data.prompt;
        if (typeof data?.result?.prompt === "string") return data.result.prompt;
        if (typeof data?.result === "string") return data.result;
        return null;
    } catch (error) {
        console.log("❌ Erreur analyse image :", error.message);
        return null;
    }
}

app.post("/api/prompt", async (req, res) => {
    try {
        const { prompt, imageBase64, mimeType } = req.body;
        let imageContext = "";

        const userPrompt = prompt || "Analyse cette image et donne-moi les informations importantes.";

        const fullPrompt = `
Tu es CRIMSON AI 🔴.
Réponds en français de manière directe et structurée.

${imageContext}

QUESTION :
${userPrompt}
`;

        const response = await axios.post(AI_API_URL, {
            prompt: fullPrompt
        }, {
            headers: { "Content-Type": "application/json" },
            timeout: 60000
        });

        const data = response.data;
        let answer = data?.result?.answer || data?.answer || data?.result || data?.response || data?.message || data?.text;

        if (!answer) {
            throw new Error("L'API IA n'a renvoyé aucune réponse valide.");
        }

        res.json({ reply: answer });

    } catch (error) {
        console.error("SERVER ERROR:", error.message);
        res.status(500).json({ error: error.message || "Erreur interne du serveur." });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Crimson en ligne sur le port ${PORT}`);
});
