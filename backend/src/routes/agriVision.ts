import express from 'express';
import axios from 'axios';

const router = express.Router();

// Analyze soil and provide recommendations
router.post('/analyze', async (req, res) => {
  try {
    const { imageBase64, soilTexture, location } = req.body;
    
    // Fetch environmental data from Ambee API
    const headers = {
      'x-api-key': process.env.AMBEE_API_KEY,
      'Content-type': 'application/json'
    };

    const environmentalData = await axios.get(
      `https://api.ambeedata.com/weather/latest/by-lat-lng?lat=${location.lat}&lng=${location.lng}`,
      { headers }
    );

    // Use OpenRouter API for soil analysis and recommendations
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: 'You are an agricultural expert. Analyze soil conditions and provide farming recommendations.'
          },
          {
            role: 'user',
            content: `Based on this soil image (${imageBase64.substring(0, 100)}...), soil texture: ${soilTexture}, and environmental data: ${JSON.stringify(environmentalData.data)}, what are your recommendations for crops and farming practices?`
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
    console.error('Error analyzing soil:', error);
    res.status(500).json({ error: 'Failed to analyze soil' });
  }
});

export default router;
