import nodemailer from 'nodemailer';

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null; // dev mode — link logged to console
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT) || 587,
    secure: parseInt(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendResetEmail(email, resetUrl) {
  const transport = createTransport();

  if (!transport) {
    console.log(`\n🔑 Password reset link (dev — no SMTP configured):\n${resetUrl}\n`);
    return;
  }

  await transport.sendMail({
    from:    `"Foodie AI" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Reset your Foodie AI password',
    html:    `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#e85d2f">Reset your password</h2>
        <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#e85d2f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset password
        </a>
        <p style="color:#888;font-size:.85rem">If you didn't request this, ignore this email.</p>
      </div>`,
  });
}
