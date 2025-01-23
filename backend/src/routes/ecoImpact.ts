import express from 'express';
import axios from 'axios';

const router = express.Router();

// Submit eco-friendly action
router.post('/submit-action', async (req, res) => {
  try {
    const { imageBase64, actionType, location, userId } = req.body;

    // Verify submission using OpenRouter API
    const verificationResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-2',
        messages: [
          {
            role: 'system',
            content: 'You are an environmental action validator. Verify if the submitted image shows genuine eco-friendly actions.'
          },
          {
            role: 'user',
            content: `Verify this environmental action. Image: ${imageBase64.substring(0, 100)}..., Action Type: ${actionType}, Location: ${JSON.stringify(location)}`
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

    // TODO: Store verification result in Supabase
    // TODO: Update user points/badges
    // TODO: Update leaderboard

    res.json({
      status: 'success',
      verification: verificationResponse.data
    });
  } catch (error) {
    console.error('Error submitting eco action:', error);
    res.status(500).json({ error: 'Failed to submit eco action' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // TODO: Fetch leaderboard data from Supabase
    res.json({
      leaderboard: []
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
