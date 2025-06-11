import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoHistorySchema, insertGameScoreSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get video history
  app.get("/api/video-history", async (req, res) => {
    try {
      const history = await storage.getVideoHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to get video history" });
    }
  });

  // Add video to history
  app.post("/api/video-history", async (req, res) => {
    try {
      const videoData = insertVideoHistorySchema.parse(req.body);
      const video = await storage.addVideoToHistory(videoData);
      res.json(video);
    } catch (error) {
      res.status(400).json({ message: "Invalid video data" });
    }
  });

  // Remove video from history
  app.delete("/api/video-history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      await storage.removeVideoFromHistory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove video from history" });
    }
  });

  // Clear all video history
  app.delete("/api/video-history", async (req, res) => {
    try {
      await storage.clearVideoHistory();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear video history" });
    }
  });

  // Get game scores
  app.get("/api/game-scores", async (req, res) => {
    try {
      const scores = await storage.getGameScores();
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game scores" });
    }
  });

  // Add game score
  app.post("/api/game-scores", async (req, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.addGameScore(scoreData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  // Remove game score
  app.delete("/api/game-scores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid score ID" });
      }
      await storage.removeGameScore(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove game score" });
    }
  });

  // Clear all game scores
  app.delete("/api/game-scores", async (req, res) => {
    try {
      await storage.clearGameScores();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear game scores" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
