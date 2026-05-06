const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, JWT_CONFIG } = require("../config/jwt");

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

function generateAccessToken(userId, email) {
  return jwt.sign({ userId, email }, ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(userId, email) {
  return jwt.sign({ userId, email }, REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
  });
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getCookieOptions(isProduction) {
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax", // Use 'none' for cross-domain in production
    secure: isProduction, // Requires HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashResetToken,
  getCookieOptions,
};
