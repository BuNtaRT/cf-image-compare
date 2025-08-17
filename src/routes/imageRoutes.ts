import { Router, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import { ImageService } from "../services/imageService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const imageService = new ImageService();
const FILE_SIZE_LIMIT_MB = parseInt(process.env.FILE_SIZE_LIMIT_MB || "10", 10);

const imageUpload = () => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new MulterError("LIMIT_UNEXPECTED_FILE", "image"));
      }
    },
  });

  return (req: any, res: any, next: NextFunction) => {
    upload.single("image")(req, res, (err: any) => {
      if (err instanceof MulterError) {
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      next();
    });
  };
};

/**
 * POST /hash - Computes pHash for an uploaded image
 */
router.post("/hash", imageUpload(), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Image not uploaded",
      });
    }

    const result = await imageService.calculateImageHash(req.file.buffer);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      hash: result.hash,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * POST /compare - Compares two images or hashes
 */
router.post("/compare", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hash1, hash2, threshold = 10 } = req.body;

    if (!hash1 || !hash2) {
      return res.status(400).json({
        success: false,
        error: "Two hashes must be provided (hash1 and hash2)",
      });
    }

    if (typeof hash1 !== "string" || typeof hash2 !== "string") {
      return res.status(400).json({
        success: false,
        error: "Hashes must be strings",
      });
    }

    if (Number.isNaN(threshold) || threshold < 0) {
      return res.status(400).json({
        success: false,
        error: "Threshold must be a positive number",
      });
    }

    const result = imageService.compareImageHashes(hash1, hash2, threshold);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      distance: result.distance,
      isSimilar: result.isSimilar,
      similarity: result.similarity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

export default router;
