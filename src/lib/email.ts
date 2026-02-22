import { Resend } from "resend";

/**
 * Email transport — Resend in production, console in development.
 *
 * Required env var for production:
 *   RESEND_API_KEY — get one at https://resend.com/api-keys
 *
 * Optional:
 *   EMAIL_FROM — sender address (default: "The Mat <onboarding@resend.dev>")
 *                Use resend.dev domain until you verify your own domain in Resend.
 */

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || "The Mat <onboarding@resend.dev>";

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, text, html } = payload;

  // ── Production: send via Resend ──
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }

    return true;
  }

  // ── Development: console output ──
  console.log("\n══════════════════════════════════════════");
  console.log(`📧 EMAIL → ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   ${text}`);
  console.log("══════════════════════════════════════════\n");
  console.warn("[email] No RESEND_API_KEY set — email logged to console only. Set RESEND_API_KEY in your environment to send real emails.");

  return true;
}

/**
 * Build a password reset email.
 */
export function buildPasswordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your password — The Mat",
    text: `Reset your password by visiting this link (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #0f172a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #f97316, #ef4444); line-height: 40px; color: white; font-weight: bold; font-size: 18px;">M</div>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px;">Reset your password</h1>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Someone requested a password reset for your account. Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; border-radius: 12px; background: linear-gradient(to right, #3b82f6, #f97316); color: white; font-weight: 600; font-size: 14px; text-decoration: none;">
          Reset Password
        </a>
        <p style="color: #64748b; font-size: 12px; margin-top: 32px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
      </div>
    `.trim(),
  };
}
