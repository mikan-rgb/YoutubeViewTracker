import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const videoHistory = pgTable("video_history", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  channelName: text("channel_name"),
  duration: text("duration"),
  thumbnail: text("thumbnail"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVideoHistorySchema = createInsertSchema(videoHistory).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVideoHistory = z.infer<typeof insertVideoHistorySchema>;
export type VideoHistory = typeof videoHistory.$inferSelect;
