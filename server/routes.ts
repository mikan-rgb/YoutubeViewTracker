import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoHistorySchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
