const { pool } = require("../db");
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashResetToken,
  getCookieOptions,
} = require("../utils/authUtils");

const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.id, user.email);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
}

async function refresh(req, res) {
  // With token-based auth, we don't need refresh endpoint
  // Clients handle token expiration by re-logging in
  return res.status(401).json({ error: "Token expired. Please login again." });
}

async function getSession(req, res) {
  try {
    // Get token from Authorization header (token-based auth only)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const jwt = require("jsonwebtoken");
    const { ACCESS_TOKEN_SECRET } = require("../config/jwt");

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const { rows } = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [decoded.userId]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({
      accessToken: token,
      user: {
        id: rows[0].id,
        email: rows[0].email,
        role: rows[0].role,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);

    if (rows.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ message: "If email exists, reset link has been sent" });
    }

    const user = rows[0];
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [hashedToken, expiresAt, user.id]
    );

    // Send email with reset link
    try {
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset Your Password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the request, just log it
    }

    res.json({ message: "If email exists, reset link has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process forgot password" });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const hashedToken = hashResetToken(token);

    const { rows } = await pool.query(
      "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [hashedToken]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    const user = rows[0];
    const hashedPassword = await hashPassword(password);

    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

module.exports = {
  login,
  logout,
  refresh,
  getSession,
  forgotPassword,
  resetPassword,
};
