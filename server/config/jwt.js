const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "your-super-secret-access-key-change-in-production";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production";

const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  RESET_TOKEN_EXPIRY: 3600, // 1 hour in seconds
};

module.exports = {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_CONFIG,
};
