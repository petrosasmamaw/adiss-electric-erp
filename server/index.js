const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { initSchema } = require("./schema");
const apiRoutes = require("./routes");

const app = express();
const port = Number(process.env.API_PORT || 4000);
const isProduction = process.env.NODE_ENV === "production";

// Parse FRONTEND_URLs from environment (comma-separated)
const frontendUrls = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map(url => url.trim());

// CORS with credentials enabled
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl requests, etc)
      if (!origin) return callback(null, true);
      
      // Allow if origin is in the list
      if (frontendUrls.includes(origin)) {
        return callback(null, true);
      }
      
      // In production, reject unknown origins
      if (isProduction) {
        return callback(new Error("Not allowed by CORS"));
      }
      
      // In development, allow any origin
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    await initSchema();
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
      console.log(`Allowed origins: ${frontendUrls.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to initialize API", error);
    process.exit(1);
  }
}

start();
