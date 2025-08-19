import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import imageRoutes from "./routes/imageRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_SIZE_LIMIT_MB = parseInt(process.env.FILE_SIZE_LIMIT_MB || "10");

app.use(cors());
app.use(express.json({ limit: `${FILE_SIZE_LIMIT_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${FILE_SIZE_LIMIT_MB}mb` }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(authMiddleware);

app.use("/api", imageRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Picture Compare API",
    version: "1.0.0",
    endpoints: {
      "POST /api/hash": "Computes pHash for an image",
      "POST /api/hash-batch": "Computes pHash for multiple images",
      "POST /api/compare": "Compares two image hashes",
      "POST /api/compare-batch": "Compares one hash with multiple candidate hashes",
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: `File too large. Limit: ${FILE_SIZE_LIMIT_MB}MB`,
      });
    }
  }

  res.status(500).json({
    success: false,
    error: "Internal error",
  });

  next(err);
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`API key ${process.env.API_KEY ? "is set" : "is not set"}`);
  console.log(`File size limit: ${FILE_SIZE_LIMIT_MB}MB`);
});
