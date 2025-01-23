import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Constants
const PORT = process.env.PORT || 5000;
const AMBEE_API_KEY = process.env.AMBEE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Routes
import ecoWellnessRoutes from './routes/ecoWellness';
import agriVisionRoutes from './routes/agriVision';
import ecoImpactRoutes from './routes/ecoImpact';

app.use('/api/eco-wellness', ecoWellnessRoutes);
app.use('/api/agri-vision', agriVisionRoutes);
app.use('/api/eco-impact', ecoImpactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
