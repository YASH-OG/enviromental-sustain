import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get environmental data based on location
router.get('/environment/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const headers = {
      'x-api-key': process.env.AMBEE_API_KEY,
      'Content-type': 'application/json'
    };

    // Fetch air quality data
    const airQualityResponse = await axios.get(
      `https://api.ambeedata.com/latest/by-lat-lng?lat=${lat}&lng=${lng}`,
      { headers }
    );

    // Fetch pollen data
    const pollenResponse = await axios.get(
      `https://api.ambeedata.com/latest/pollen/by-lat-lng?lat=${lat}&lng=${lng}`,
      { headers }
    );

    // Fetch weather data
    const weatherResponse = await axios.get(
      `https://api.ambeedata.com/weather/latest/by-lat-lng?lat=${lat}&lng=${lng}`,
      { headers }
    );

    res.json({
      airQuality: airQualityResponse.data,
      pollen: pollenResponse.data,
      weather: weatherResponse.data
    });
  } catch (error) {
    console.error('Error fetching environmental data:', error);
    res.status(500).json({ error: 'Failed to fetch environmental data' });
  }
});

// Get personalized recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { environmentalData } = req.body;
    
    // Call OpenRouter API for personalized recommendations
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: 'You are a health and wellness advisor. Provide personalized recommendations based on environmental data.'
          },
          {
            role: 'user',
            content: `Based on this environmental data: ${JSON.stringify(environmentalData)}, what are your health and wellness recommendations?`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;
