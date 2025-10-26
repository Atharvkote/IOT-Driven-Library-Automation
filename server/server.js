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

//Models
import Book from "./models/book.model.js";
import Students from "./models/student.model.js";
import BorrowedBook from "./models/borrowed-books.model.js";

// Loggers
import logger from "./utils/logger.js";
import { socketioLogger } from "./utils/logger.js";

// Database configs
import { connectDB, disconnectDB } from "./config/mongodb.config.js";

// Routes
import rfidRoutes from "./routes/rfid.routes.js";
import studentRoutes from "./routes/student.routes.js";
import bookRoutes from "./routes/book.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import Section from "./models/section.model.js";
import { calculateFines } from "./controller/fines.controller.js";

// Connect MongoDB
await connectDB();
await calculateFines();

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 5000;
const server = http.createServer(app);
const redisClient = new Redis(process.env.REDIS_URL);

// Redis connection check
if (!redisClient) {
  logger.error(
    `Redis connection failed at ${process.env.REDIS_URL} [Env: Docker]`
  );
} else {
  logger.info(
    `Redis connected successfully at ${process.env.REDIS_URL} [Env: Docker]`
  );
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

// Rate limiters
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 100,
  duration: 30,
  blockDuration: 15 * 60,
});

// app.use((req, res, next) => {
//   rateLimiter
//     .consume(req.ip)
//     .then(() => next())
//     .catch(() => {
//       logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
//       res.status(429).json({ success: false, message: "Too many requests" });
//     });
// });

// Auth limiter
const authLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "auth_fail_limiter",
  points: 10,
  duration: 60 * 15,
  blockDuration: 60 * 15,
});

app.use("/api/v1/auth", async (req, res, next) => {
  try {
    if (req.path === "/check-auth") return next();
    await authLimiter.consume(req.ip);
    next();
  } catch {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      message:
        "Too many login/signup attempts. Please try again after 15 minutes.",
    });
  }
});

// Sensitive endpoints limiter
const sensitiveEndpointsLimiter = rateLimit({
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
 * - Uses Redis adapter for scaling across instances
 * - Configures allowed origins and ping options
 */
export const io = new Server(server, {
  adapter: createAdapter(redisClient),
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PATCH", "HEAD", "PUT"],
    credentials: true,
  },
  pingInterval: 5000,
  pingTimeout: 20000,
  allowEIO3: true,
});

io.on("connection", (socket) => {
  socket.setMaxListeners(20);
  socketioLogger.info(`New socket connected: ${socket.id}`);

  const { studentId } = socket.handshake.query;
  console.log("Student ID from socket query:", studentId);

  // Get all borrow requests (admin)
  socket.on("getBorrowRequests", async () => {
    try {
      const requests = await BorrowedBook.find()
        .populate("student", "name email")
        .populate("book", "title author isbn availableCopies totalCopies")
        .sort({ createdAt: -1 });
      socket.emit("borrowRequests", requests);
    } catch (err) {
      console.error(err);
    }
  });

  // Get section stats
  socket.on("getSectionStats", async () => {
    try {
      const sections = await Section.find({
        sectionName: "Computer Science",
      }).select("sectionName visitCount booksBoughtCount shelfCount");
      socket.emit("sectionStats", sections);
    } catch (err) {
      console.error(err);
      socket.emit("sectionStatsError", {
        message: "Failed to fetch section stats",
      });
    }
  });

  // Get book details
  socket.on("getBookDetails", async (bookId) => {
    try {
      const book = await Book.findById(bookId).lean();
      if (!book) {
        socket.emit("bookDetails", { error: "Book not found" });
        return;
      }
      socket.emit("bookDetails", book);
    } catch (err) {
      console.error(err);
      socket.emit("bookDetails", { error: "Failed to fetch book details" });
    }
  });

  // Approve borrow request
  socket.on("approveBorrowRequest", async (requestId) => {
    try {
      const req = await BorrowedBook.findByIdAndUpdate(
        requestId,
        { status: "Approved" },
        { new: true }
      ).populate("book");
      if (req) socket.emit("borrowRequestsUpdated", req);
    } catch (err) {
      console.error(err);
    }
  });

  // Reject borrow request
  socket.on("rejectBorrowRequest", async (requestId) => {
    try {
      const req = await BorrowedBook.findByIdAndUpdate(
        requestId,
        { status: "Rejected" },
        { new: true }
      ).populate("book");
      if (req) socket.emit("borrowRequestsUpdated", req);
    } catch (err) {
      console.error(err);
    }
  });

  // Fetch borrow requests for this student
  socket.on("getMyBorrowRequests", async () => {
    try {
      if (!studentId) return;
      const student = await Students.findById(studentId).lean();
      if (!student) return;

      const requests = await BorrowedBook.find({ student: studentId })
        .populate("book")
        .sort({ createdAt: -1 })
        .lean();

      socket.emit("myBorrowRequests", { requests, student });
    } catch (err) {
      console.error("Error fetching borrow requests:", err);
    }
  });

  // Update borrow request status
  socket.on("updateBorrowRequest", async ({ requestId, newStatus }) => {
    try {
      const updated = await BorrowedBook.findByIdAndUpdate(
        requestId,
        { status: newStatus },
        { new: true }
      ).populate("book");
      if (!updated) return;

      // Emit update to student socket(s)
      for (const [id, s] of io.sockets.sockets) {
        if (s.handshake.query.studentId === updated.student.toString()) {
          s.emit("myBorrowRequestUpdated", updated);
        }
      }
    } catch (err) {
      console.error("Error updating borrow request:", err);
    }
  });

  // Search books
  socket.on("searchBooks", async (query) => {
    if (!query) return;
    try {
      const regex = new RegExp(query, "i");
      const books = await Book.find({
        $or: [{ title: regex }, { author: regex }, { isbn: regex }],
      }).limit(10);

      const user = studentId ? await Students.findById(studentId) : null;
      socket.emit("searchResults", books, user);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    socketioLogger.info(`Socket disconnected: ${socket.id}`);
  });
});

// --------------------- SERVER ---------------------
server.listen(SERVER_PORT, () => {
  logger.info(
    `Server is running on http://localhost:${SERVER_PORT} [Env: ${process.env.NODE_ENV}]`
  );
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
