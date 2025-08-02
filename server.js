import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS – Doit être placé avant les routes
app.use(cors({
  origin: 'https://baudo.cscpacman.fr'
}));

// Clé API et ID de chaîne YouTube
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCLVLCqbRs6E063eYdF0658w'; // @Dev_Baudo

// Route API pour récupérer les abonnés
app.get('/api/subscribers', async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCLVLCqbRs6E063eYdF0658w&key=AIzaSyCgN_GdkQ2XDt6SqU6fB_d03l2PvWsSbq4`;
    const response = await fetch(url);
    const data = await response.json();
    const count = data.items[0].statistics.subscriberCount;
    res.json({ subscriberCount: count });
  } catch (err) {
    res.status(500).json({ error: 'API error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
