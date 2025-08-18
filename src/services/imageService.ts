import sharp from "sharp";
import { imageHash } from "image-hash";
import { promisify } from "util";
import { calculateHammingDistance } from "../utils/hammingDistance.js";

const hashImage = promisify(imageHash);

export interface ImageHashResult {
  hash: string;
  success: boolean;
  error?: string;
}

export interface ImageComparisonResult {
  distance: number;
  isSimilar: boolean;
  success: boolean;
  similarity: number;
  error?: string;
}

export interface BatchComparisonResult {
  hash: string;
  distance: number;
  isSimilar: boolean;
  similarity: number;
}

export class ImageService {
  /**
   * Computes pHash for an image
   * @param imageBuffer Image buffer
   * @returns Result with hash or error
   */
  async calculateImageHash(imageBuffer: Buffer): Promise<ImageHashResult> {
    try {
      const processedImage = await sharp(imageBuffer).jpeg({ quality: 100 }).toBuffer();

      const hash = (await hashImage({ data: processedImage, name: "image.jpg" }, 16, 2)) as string;

      return {
        hash,
        success: true,
      };
    } catch (error) {
      return {
        hash: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Compares two images by their hashes
   * @param hash1 First hash
   * @param hash2 Second hash
   * @param threshold Threshold for determining similarity
   * @returns Comparison result
   */
  compareImageHashes(hash1: string, hash2: string, threshold: number = 10): ImageComparisonResult {
    try {
      if (!this.isValidHash(hash1) || !this.isValidHash(hash2)) {
        return {
          distance: -1,
          isSimilar: false,
          success: false,
          similarity: 1,
          error: "Invalid hash format. Expected 64-character hex string.",
        };
      }

      const distance = calculateHammingDistance(hash1, hash2);
      const isSimilar = distance <= threshold;
      const similarity = 1 - distance / 256;

      return {
        distance,
        isSimilar,
        similarity,
        success: true,
      };
    } catch (error) {
      return {
        distance: -1,
        isSimilar: false,
        success: false,
        similarity: 1,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Compares one hash with an array of candidate hashes
   * @param targetHash Hash to compare against
   * @param candidateHashes Array of candidate hashes
   * @param threshold Threshold for determining similarity
   * @returns Array of comparison results
   */
  compareHashWithCandidates(
    targetHash: string, 
    candidateHashes: string[], 
    threshold: number = 10
  ): BatchComparisonResult[] {
    if (!this.isValidHash(targetHash)) {
      return [];
    }

    return candidateHashes
      .filter(hash => this.isValidHash(hash))
      .map(hash => {
        const comparison = this.compareImageHashes(targetHash, hash, threshold);
        return {
          hash,
          distance: comparison.distance,
          isSimilar: comparison.isSimilar,
          similarity: comparison.similarity,
        };
      });
  }

  /**
   * Validates hash
   * @param hash Hash to validate
   * @returns true if hash is valid
   */
  private isValidHash(hash: string): boolean {
    return /^[0-9a-fA-F]{64}$/.test(hash);
  }
}
