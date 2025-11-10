/**
 * @file server.js
 * @description Main server entry point.
 * Initializes Express application, sets up middleware, connects to MongoDB, Redis,
 * and configures Socket.IO for real-time communication. Also handles graceful shutdown.
 *
 * Key features:
 * - Express with security (helmet, cors), rate limiting (rate-limiter-flexible + rate-limit-redis)
 * - MongoDB connection via Mongoose
 * - Redis for rate limiting and Socket.IO
 * - Socket.IO server with Redis adapter
 * - Routes for RFID and student APIs
 * - Graceful shutdown on SIGINT / SIGTERM
 *
 * @usage
 * Start with `npm run dev` or `npx nodemon server.js` (after environment variables are configured).
 */

// Server Environment
import "dotenv/config";

// Dependencies
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import helmet from "helmet";
import Redis from "ioredis";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-streams-adapter";

// Loggers
import logger from "./utils/logger.js";
import { socketioLogger } from "./utils/logger.js";

// Socket handlers (organized)
import { initializeSocketHandlers } from "./socket/socketHandlers.js";

// Database configs
import { connectDB, disconnectDB } from "./config/mongodb.config.js";

// Routes
import rfidRoutes from "./routes/rfid.routes.js";
import studentRoutes from "./routes/student.routes.js";
import bookRoutes from "./routes/book.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import finesRoutes from "./routes/fines.routes.js";
import Section from "./models/section.model.js";
import { calculateFines } from "./controller/fines.controller.js";

// Connect MongoDB
await connectDB();
await calculateFines();

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 5000;
const server = http.createServer(app);

// Configure server timeouts and keep-alive
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds (must be > keepAliveTimeout)

// Redis connection with error handling
let redisClient;
try {
  redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on("error", (err) => {
    logger.error("Redis connection error:", err);
  });

  redisClient.on("connect", () => {
    logger.info("Redis client connected");
  });

  redisClient.on("ready", () => {
    logger.info("Redis client ready");
  });
} catch (error) {
  logger.error("Failed to create Redis client:", error);
  redisClient = null;
}

// Redis connection check (non-blocking)
if (!redisClient) {
  logger.warn("Redis client not available - some features may be limited");
} else {
  // Test Redis connection
  redisClient.ping().then(() => {
    logger.info(`Redis connected successfully at ${process.env.REDIS_URL || "redis://localhost:6379"}`);
  }).catch((err) => {
    logger.error(`Redis connection failed: ${err.message}`);
  });
}

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
const allowedOrigins = ["http://localhost:5173", "http://localhost:9090", "*"];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, origin);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   })
// );

app.use(cors()); // Allow all origins for testing; adjust in production

// Rate limiters (only if Redis is available)
let rateLimiter = null;
if (redisClient) {
  try {
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "middleware",
      points: 100,
      duration: 30,
      blockDuration: 15 * 60,
    });
  } catch (error) {
    logger.warn("Failed to create rate limiter:", error.message);
  }
}

// app.use((req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => next())
//     .catch(() => {
//       logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
//       res.status(429).json({ success: false, message: "Too many requests" });
//     });
// });

// Auth limiter (only if Redis is available)
let authLimiter = null;
if (redisClient) {
  try {
    authLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "auth_fail_limiter",
      points: 10,
      duration: 60 * 15,
      blockDuration: 60 * 15,
    });
  } catch (error) {
    logger.warn("Failed to create auth limiter:", error.message);
  }
}

app.use("/api/v1/auth", async (req, res, next) => {
  try {
    if (req.path === "/check-auth") return next();
    if (authLimiter) {
      await authLimiter.consume(req.ip);
    }
    next();
  } catch {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message:
        "Too many login/signup attempts. Please try again after 15 minutes.",
    });
  }
});

// Sensitive endpoints limiter (only if Redis is available)
let sensitiveEndpointsLimiter = null;
if (redisClient) {
  try {
    sensitiveEndpointsLimiter = rateLimit({
      windowMs: 30 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: ipKeyGenerator,
      handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        skipFailedRequests: true,
      }),
    });
  } catch (error) {
    logger.warn("Failed to create sensitive endpoints limiter:", error.message);
  }
}

// Logging requests
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(
    `Request body: ${req.body ? JSON.stringify(req.body, null, 2) : "N/A"}`
  );
  logger.info(`Request IP: ${req.ip}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/api/v1/rfid", rfidRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/issue", issueRoutes);
app.use("/api/v1/pir", sectionRoutes);
app.use("/api/v1/fines", finesRoutes);

// Global error handler middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  
  // Don't send error details in production
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// // System Metrics route (Prometheus)
// app.get("/metrics", async (req, res) => {
//   res.setHeader("Content-type", client.register.contentType);
//   const metrics = await client.register.metrics();
//   res.send(metrics);
// });

// --------------------- SOCKET.IO ---------------------
/**
 * @socketio Initialization
 * - Creates Socket.IO server attached to HTTP server
 * - Uses Redis adapter for scaling across instances (if available)
 * - Configures allowed origins and ping options
 */
let ioAdapter = undefined;
if (redisClient) {
  try {
    ioAdapter = createAdapter(redisClient);
    logger.info("Socket.IO Redis adapter initialized");
  } catch (error) {
    logger.warn("Failed to create Socket.IO Redis adapter, using default:", error.message);
  }
}

export const io = new Server(server, {
  adapter: ioAdapter,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PATCH", "HEAD", "PUT"],
    credentials: true,
  },
  pingInterval: 5000,
  pingTimeout: 20000,
  allowEIO3: true,
  connectTimeout: 45000,
  transports: ["websocket", "polling"],
});

// Initialize all socket event handlers
initializeSocketHandlers(io);

// --------------------- SERVER ---------------------
server.listen(SERVER_PORT, "0.0.0.0", () => {
  logger.info(
    `Server is running on http://0.0.0.0:${SERVER_PORT} [Env: ${process.env.NODE_ENV}]`
  );
  logger.info(`Server accessible at http://localhost:${SERVER_PORT}`);
});

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(`Port ${SERVER_PORT} is already in use`);
  } else {
    logger.error("Server error:", error);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // Don't exit - log and continue
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit - log and continue
});

// Graceful shutdown
const shutdown = async () => {
  logger.info(`Server shutting down... [Env: ${process.env.NODE_ENV}]`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    await disconnectDB();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcing shutdown...");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
