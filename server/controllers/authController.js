import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import { sendResetEmail } from '../services/email.js';

const registerSchema = z.object({
  name:     z.string().min(1, 'Name is required').max(50),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const { email, password, name } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({ data: { email, password: hashed, name } });

    res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  try {
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond the same — prevents email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data:  { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/#/reset-password?token=${token}`;
    await sendResetEmail(email, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
  if (password.length < 6)  return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
