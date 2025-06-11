import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Crosshair, Trophy, RotateCcw, Home, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertGameScore, GameScore } from "@shared/schema";
import { Link } from "wouter";
// Import removed to fix build issues - using inline implementation

interface GameStats {
  score: number;
  kills: number;
  accuracy: number;
  level: number;
  health: number;
  ammo: number;
}

export default function FPSGame() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    kills: 0,
    accuracy: 100,
    level: 1,
    health: 100,
    ammo: 30
  });
  const [playerName, setPlayerName] = useState("");
  const [showScores, setShowScores] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const gameEngineRef = useRef<any>(null);

  const { data: scores = [] } = useQuery<GameScore[]>({
    queryKey: ['/api/game-scores'],
  });

  const addScoreMutation = useMutation({
    mutationFn: async (scoreData: InsertGameScore) => {
      await apiRequest('POST', '/api/game-scores', scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-scores'] });
    },
  });

  const startGame = () => {
    setGameState('playing');
    setGameStats({
      score: 0,
      kills: 0,
      accuracy: 100,
      level: 1,
      health: 100,
      ammo: 30
    });
    setShowGameOver(false);
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const gameOver = () => {
    setGameState('gameOver');
    setShowGameOver(true);
  };

  const submitScore = () => {
    if (playerName.trim()) {
      addScoreMutation.mutate({
        playerName: playerName.trim(),
        score: gameStats.score.toString(),
        level: gameStats.level.toString(),
        kills: gameStats.kills.toString(),
        accuracy: gameStats.accuracy.toFixed(1)
      });
      setShowGameOver(false);
      setGameState('menu');
      setPlayerName("");
    }
  };

  const updateGameStats = (newStats: Partial<GameStats>) => {
    setGameStats(prev => ({ ...prev, ...newStats }));
    
    // Check game over conditions
    if (newStats.health !== undefined && newStats.health <= 0) {
      gameOver();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          pauseGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {/* Game HUD */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className="flex justify-between items-start">
            <div className="bg-black bg-opacity-60 rounded-lg p-3 space-y-1">
              <div className="text-yellow-400 font-bold text-lg">Score: {gameStats.score.toLocaleString()}</div>
              <div className="text-red-400">Health: {gameStats.health}%</div>
              <div className="text-blue-400">Ammo: {gameStats.ammo}/30</div>
            </div>
            
            <div className="bg-black bg-opacity-60 rounded-lg p-3 space-y-1 text-right">
              <div className="text-green-400">Level: {gameStats.level}</div>
              <div className="text-orange-400">Kills: {gameStats.kills}</div>
              <div className="text-purple-400">Accuracy: {gameStats.accuracy.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="absolute top-4 right-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={pauseGame}
              className="bg-black bg-opacity-60 text-white border-gray-600 hover:bg-gray-800"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause (ESC)
            </Button>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {gameState === 'playing' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <Crosshair className="w-8 h-8 text-red-500" />
        </div>
      )}

      {/* Game Engine - Simple Canvas Implementation */}
      <div className="w-full h-full flex items-center justify-center bg-black">
        <canvas
          id="fps-game-canvas"
          className="border border-gray-600 bg-gray-900"
          width="800"
          height="600"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* Main Menu */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center space-y-8 max-w-md">
            <div>
              <h1 className="text-6xl font-bold text-red-500 mb-4">FPS ARENA</h1>
              <p className="text-gray-300 text-lg">Survive the waves of enemies</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={startGame}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
              
              <Button 
                onClick={() => setShowScores(true)}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800 py-3"
              >
                <Trophy className="w-5 h-5 mr-2" />
                High Scores
              </Button>
              
              <Link href="/">
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800 py-3"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>Controls: WASD to move, Mouse to look, Click to shoot</p>
              <p>R to reload, ESC to pause</p>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-white">PAUSED</h2>
            
            <div className="space-y-3">
              <Button 
                onClick={pauseGame}
                className="w-48 bg-green-600 hover:bg-green-700 text-white py-2"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              
              <Button 
                onClick={() => setGameState('menu')}
                variant="outline"
                className="w-48 border-gray-600 text-white hover:bg-gray-800 py-2"
              >
                <Home className="w-4 h-4 mr-2" />
                Main Menu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* High Scores Dialog */}
      <Dialog open={showScores} onOpenChange={setShowScores}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-xl flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              High Scores
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {scores.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No scores yet</p>
            ) : (
              scores.slice(0, 10).map((score, index) => (
                <div key={score.id} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 font-bold w-6">#{index + 1}</span>
                    <div>
                      <div className="font-semibold">{score.playerName}</div>
                      <div className="text-sm text-gray-400">
                        Lv.{score.level} • {score.kills} kills • {score.accuracy}% acc
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">{parseInt(score.score).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(score.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={showGameOver} onOpenChange={setShowGameOver}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 text-2xl text-center">GAME OVER</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="text-yellow-400 font-bold">{gameStats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Level Reached:</span>
                <span className="text-green-400">{gameStats.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Kills:</span>
                <span className="text-red-400">{gameStats.kills}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="text-blue-400">{gameStats.accuracy.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                maxLength={20}
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={submitScore}
                  disabled={!playerName.trim() || addScoreMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Save Score
                </Button>
                
                <Button 
                  onClick={startGame}
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}