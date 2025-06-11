import { users, videoHistory, type User, type InsertUser, type VideoHistory, type InsertVideoHistory } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video history methods
  getVideoHistory(): Promise<VideoHistory[]>;
  addVideoToHistory(video: InsertVideoHistory): Promise<VideoHistory>;
  clearVideoHistory(): Promise<void>;
  removeVideoFromHistory(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videoHistoryMap: Map<number, VideoHistory>;
  private currentUserId: number;
  private currentVideoHistoryId: number;

  constructor() {
    this.users = new Map();
    this.videoHistoryMap = new Map();
    this.currentUserId = 1;
    this.currentVideoHistoryId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getVideoHistory(): Promise<VideoHistory[]> {
    const history = Array.from(this.videoHistoryMap.values());
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addVideoToHistory(insertVideo: InsertVideoHistory): Promise<VideoHistory> {
    // Remove existing entry with same video ID if exists
    const existingEntries = Array.from(this.videoHistoryMap.entries());
    for (const [id, video] of existingEntries) {
      if (video.videoId === insertVideo.videoId) {
        this.videoHistoryMap.delete(id);
        break;
      }
    }

    const id = this.currentVideoHistoryId++;
    const video: VideoHistory = {
      ...insertVideo,
      id,
      timestamp: new Date(),
    };
    this.videoHistoryMap.set(id, video);

    // Keep only last 10 entries
    const allEntries = await this.getVideoHistory();
    if (allEntries.length > 10) {
      const entriesToRemove = allEntries.slice(10);
      for (const entry of entriesToRemove) {
        this.videoHistoryMap.delete(entry.id);
      }
    }

    return video;
  }

  async clearVideoHistory(): Promise<void> {
    this.videoHistoryMap.clear();
  }

  async removeVideoFromHistory(id: number): Promise<void> {
    this.videoHistoryMap.delete(id);
  }
}

export const storage = new MemStorage();
