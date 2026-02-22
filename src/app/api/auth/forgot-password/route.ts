import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  // Always return the same response — never reveal whether the email exists.
  const successResponse = NextResponse.json({
    message: "If that email is registered, you'll receive a reset link shortly.",
  });

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return successResponse;
    }

    // Generate a cryptographically random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store the SHA-256 hash — if the DB leaks, raw tokens stay safe
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Upsert: one active token per user (requesting again invalidates the old one)
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });

    // Build the reset URL
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get("host")}`;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Send the email
    const emailContent = buildPasswordResetEmail(resetUrl);
    const sent = await sendEmail({
      to: user.email,
      ...emailContent,
    });

    if (!sent) {
      console.error("[forgot-password] Failed to send email to", user.email);
    }

    return successResponse;
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    // Still return success to prevent information leakage
    return successResponse;
  }
}
