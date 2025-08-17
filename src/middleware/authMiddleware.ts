import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  isAuthenticated?: boolean;
}

/**
 * Middleware for checking API key
 * If API_KEY is not set in env, no verification is performed
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    req.isAuthenticated = true;
    return next();
  }

  const providedKey =
    req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");

  if (!providedKey) {
    res.status(401).json({
      success: false,
      error: "API key not provided",
    });
    return;
  }

  if (providedKey !== apiKey) {
    res.status(403).json({
      success: false,
      error: "Invalid API key",
    });
    return;
  }

  req.isAuthenticated = true;
  next();
}
