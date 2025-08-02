import express from 'express';
import fetch from 'node-fetch';
const app = express();
const PORT = process.env.PORT || 3000;

// Remplace par ta clé API YouTube Data v3
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCw7b6r9uVFeReyFZ8Y_TpLw'; // @Dev_Baudo

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
