import { users, videoHistory, gameScores, type User, type InsertUser, type VideoHistory, type InsertVideoHistory, type GameScore, type InsertGameScore } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video history methods
  getVideoHistory(): Promise<VideoHistory[]>;
  addVideoToHistory(video: InsertVideoHistory): Promise<VideoHistory>;
  clearVideoHistory(): Promise<void>;
  removeVideoFromHistory(id: number): Promise<void>;
  
  // Game score methods
  getGameScores(): Promise<GameScore[]>;
  addGameScore(score: InsertGameScore): Promise<GameScore>;
  clearGameScores(): Promise<void>;
  removeGameScore(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videoHistoryMap: Map<number, VideoHistory>;
  private gameScoresMap: Map<number, GameScore>;
  private currentUserId: number;
  private currentVideoHistoryId: number;
  private currentGameScoreId: number;

  constructor() {
    this.users = new Map();
    this.videoHistoryMap = new Map();
    this.gameScoresMap = new Map();
    this.currentUserId = 1;
    this.currentVideoHistoryId = 1;
    this.currentGameScoreId = 1;
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
      id,
      videoId: insertVideo.videoId,
      url: insertVideo.url,
      title: insertVideo.title || null,
      channelName: insertVideo.channelName || null,
      duration: insertVideo.duration || null,
      thumbnail: insertVideo.thumbnail || null,
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

  async getGameScores(): Promise<GameScore[]> {
    const scores = Array.from(this.gameScoresMap.values());
    return scores.sort((a, b) => parseInt(b.score) - parseInt(a.score));
  }

  async addGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = this.currentGameScoreId++;
    const score: GameScore = {
      id,
      playerName: insertScore.playerName,
      score: insertScore.score,
      level: insertScore.level,
      kills: insertScore.kills,
      accuracy: insertScore.accuracy,
      timestamp: new Date(),
    };
    this.gameScoresMap.set(id, score);

    // Keep only top 20 scores
    const allScores = await this.getGameScores();
    if (allScores.length > 20) {
      const scoresToRemove = allScores.slice(20);
      for (const scoreEntry of scoresToRemove) {
        this.gameScoresMap.delete(scoreEntry.id);
      }
    }

    return score;
  }

  async clearGameScores(): Promise<void> {
    this.gameScoresMap.clear();
  }

  async removeGameScore(id: number): Promise<void> {
    this.gameScoresMap.delete(id);
  }
}

export const storage = new MemStorage();
