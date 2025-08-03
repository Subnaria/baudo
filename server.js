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

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

let cachedSubCount = 0;

async function updateSubCount() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    cachedSubCount = data.items[0].statistics.subscriberCount;
    console.log('✔️ Compteur mis à jour :', cachedSubCount);
  } catch (err) {
    console.error('❌ Erreur API YouTube :', err.message);
  }
}

updateSubCount();
setInterval(updateSubCount, 2 * 60 * 1000);

app.get('/api/subscribers', (req, res) => {
  res.json({ subscriberCount: cachedSubCount });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
