const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/prompt', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requis' });

  const cleanPrompt = prompt.toLowerCase();
  
  const isImageRequest = 
    cleanPrompt.startsWith('/image') || 
    cleanPrompt.includes('imagine') || 
    cleanPrompt.includes('génère') || 
    cleanPrompt.includes('dessine') || 
    cleanPrompt.includes('photo');

  if (isImageRequest) {
    let subject = prompt
      .replace(/\/image/gi, '')
      .replace(/imagine/gi, '')
      .replace(/génère une image de/gi, '')
      .replace(/dessine/gi, '')
      .replace(/photo de/gi, '')
      .trim();

    if (!subject) subject = 'a cute cat, high quality';

    const promptEn = subject
      .replace(/un chat/gi, 'a cat')
      .replace(/un chien/gi, 'a dog')
      .replace(/une voiture/gi, 'a car');

    const encoded = encodeURIComponent(promptEn);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true&model=flux`;

    return res.json({
      type: 'image',
      reply: `Visuel généré pour : "${subject}"`,
      url: imageUrl
    });
  }

  return res.json({
    type: 'text',
    reply: `Reçu : ${prompt}`
  });
});

app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
