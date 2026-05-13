import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

import authRoutes    from './routes/auth.js';
import recipeRoutes  from './routes/recipes.js';
import aiRoutes      from './routes/ai.js';
import userRoutes    from './routes/users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(join(__dirname, '../client')));

app.use('/api/auth',    authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai',      aiRoutes);
app.use('/api/users',   userRoutes);

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍳 Foodie AI running → http://localhost:${PORT}\n`);
});
