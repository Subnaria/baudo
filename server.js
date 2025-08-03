import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://baudo.cscpacman.fr'
}));

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || console.warn('⚠️la clé API YouTube n’est pas définie');
const CHANNEL_ID = process.env.CHANNEL_ID || console.warn('⚠️ l’ID de la chaîne YouTube n’est pas défini');

if (!YOUTUBE_API_KEY) {
  console.warn('⚠️  Aucune clé API YouTube détectée. Les données seront mockées en local.');
}

app.get('/api/subscribers', async (req, res) => {
  if (!YOUTUBE_API_KEY) {
    // Mode dev local sans clé : mock de la réponse
    return res.json({ subscriberCount: "1234" });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || !data.items[0]) {
      console.error('❌ La réponse de l’API ne contient pas d’items valides:', data);
      return res.status(500).json({ error: 'Réponse API invalide', details: data });
    }

    const count = data.items[0].statistics.subscriberCount;
    res.json({ subscriberCount: count });
  } catch (err) {
    console.error('❌ Erreur API YouTube :', err.message);
    res.status(500).json({ error: 'API error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
