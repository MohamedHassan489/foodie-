import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

import authRoutes    from './routes/auth.js';
import recipeRoutes  from './routes/recipes.js';
import aiRoutes      from './routes/ai.js';
import userRoutes    from './routes/users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off — SPA loads inline scripts

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { error: 'Too many attempts, please try again in 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 15,
  message: { error: 'Too many AI requests, slow down a little.' },
});

app.use('/api/auth', authLimiter);
app.use('/api/ai',   aiLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(join(__dirname, '../client')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai',      aiRoutes);
app.use('/api/users',   userRoutes);

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍳 Foodie AI running → http://localhost:${PORT}\n`);
});
