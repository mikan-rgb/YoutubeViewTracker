import { useState } from "react";
import { Download, Package, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppDownloader() {
  const [showDialog, setShowDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStandaloneHTML = async () => {
    setIsGenerating(true);
    
    try {
      // Create a complete standalone HTML file
      const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media & Gaming Hub - Offline Version</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f9fafb;
            color: #1f2937;
        }
        
        .header {
            background: white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 0;
        }
        
        .header-content {
            max-width: 64rem;
            margin: 0 auto;
            padding: 0 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        .nav {
            display: flex;
            gap: 0.5rem;
        }
        
        .nav-btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .nav-btn.active {
            background: #dc2626;
            color: white;
        }
        
        .nav-btn:not(.active) {
            background: transparent;
            color: #6b7280;
        }
        
        .nav-btn:not(.active):hover {
            background: #f3f4f6;
        }
        
        .main {
            max-width: 64rem;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .section {
            display: none;
        }
        
        .section.active {
            display: block;
        }
        
        .card {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            margin-bottom: 2rem;
        }
        
        .card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        
        .card-description {
            color: #6b7280;
            font-size: 0.875rem;
        }
        
        .card-content {
            padding: 1.5rem;
        }
        
        .input-group {
            margin-bottom: 1rem;
        }
        
        .input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 1rem;
        }
        
        .input:focus {
            outline: none;
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: #dc2626;
            color: white;
        }
        
        .btn-primary:hover {
            background: #b91c1c;
        }
        
        .btn-block {
            width: 100%;
        }
        
        .game-canvas {
            border: 2px solid #6b7280;
            background: #1f2937;
            border-radius: 0.5rem;
            display: block;
            margin: 0 auto;
        }
        
        .game-hud {
            position: fixed;
            top: 1rem;
            left: 1rem;
            right: 1rem;
            z-index: 50;
            pointer-events: none;
        }
        
        .hud-stats {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
        }
        
        .game-menu {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        
        .menu-content {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        
        .menu-title {
            font-size: 2rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 1rem;
        }
        
        .hidden {
            display: none !important;
        }
        
        .video-player {
            aspect-ratio: 16/9;
            width: 100%;
            background: #000;
            border-radius: 0.5rem;
            margin: 1rem 0;
        }
        
        .youtube-red { color: #dc2626; }
        .text-center { text-align: center; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .bg-gray-50 { background-color: #f9fafb; }
        .text-sm { font-size: 0.875rem; }
        .font-semibold { font-weight: 600; }
        .text-gray-600 { color: #6b7280; }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <span style="color: #dc2626;">📺</span>
                Media & Gaming Hub
            </div>
            <nav class="nav">
                <button class="nav-btn active" onclick="showSection('video')" id="video-tab">
                    📺 Video Player
                </button>
                <button class="nav-btn" onclick="showSection('game')" id="game-tab">
                    🎮 FPS Arena
                </button>
            </nav>
        </div>
    </header>

    <main class="main">
        <!-- Video Player Section -->
        <div id="video-section" class="section active">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">YouTube Video Player</h2>
                    <p class="card-description">URLを入力してYouTube動画を再生</p>
                </div>
                <div class="card-content">
                    <div class="input-group">
                        <input 
                            type="url" 
                            id="video-url" 
                            class="input" 
                            placeholder="https://www.youtube.com/watch?v=..."
                        >
                    </div>
                    <button class="btn btn-primary btn-block" onclick="loadVideo()">
                        動画を読み込む
                    </button>
                    <div id="video-container" class="hidden">
                        <iframe 
                            id="video-player" 
                            class="video-player" 
                            frameborder="0" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            </div>
        </div>

        <!-- FPS Game Section -->
        <div id="game-section" class="section">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">FPS Arena Game</h2>
                    <p class="card-description">2D トップダウンシューターゲーム</p>
                </div>
                <div class="card-content">
                    <div id="game-menu" class="game-menu">
                        <div class="menu-content">
                            <h2 class="menu-title">FPS ARENA</h2>
                            <p class="mb-4 text-gray-600">敵の波を生き延びよう</p>
                            <button class="btn btn-primary btn-block mb-2" onclick="startGame()">
                                ゲーム開始
                            </button>
                            <p class="text-sm text-gray-600">
                                操作: WASD移動, マウス照準, クリック射撃, R リロード
                            </p>
                        </div>
                    </div>
                    
                    <div id="game-hud" class="game-hud hidden">
                        <div class="hud-stats">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <div>スコア: <span id="score">0</span></div>
                                    <div>体力: <span id="health">100</span>%</div>
                                    <div>弾薬: <span id="ammo">30</span>/30</div>
                                </div>
                                <div>
                                    <div>レベル: <span id="level">1</span></div>
                                    <div>キル数: <span id="kills">0</span></div>
                                    <div>命中率: <span id="accuracy">100</span>%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <canvas 
                        id="game-canvas" 
                        class="game-canvas hidden" 
                        width="800" 
                        height="600">
                    </canvas>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Navigation
        function showSection(section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(section + '-section').classList.add('active');
            document.getElementById(section + '-tab').classList.add('active');
        }

        // Video Player Functions
        function loadVideo() {
            const url = document.getElementById('video-url').value;
            const videoId = extractVideoId(url);
            
            if (videoId) {
                const iframe = document.getElementById('video-player');
                iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&modestbranding=1&rel=0\`;
                document.getElementById('video-container').classList.remove('hidden');
            } else {
                alert('有効なYouTube URLを入力してください');
            }
        }

        function extractVideoId(url) {
            const patterns = [
                /(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)([^&\\n?#]+)/,
                /youtube\\.com\\/v\\/([^&\\n?#]+)/,
                /youtube\\.com\\/shorts\\/([^&\\n?#]+)/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        // Game Variables
        let gameState = {
            isPlaying: false,
            player: { x: 400, y: 300, angle: 0, health: 100 },
            enemies: [],
            bullets: [],
            score: 0,
            kills: 0,
            level: 1,
            ammo: 30,
            shotsFired: 0,
            shotsHit: 0
        };

        let keys = {};
        let mouse = { x: 0, y: 0 };
        let canvas, ctx;

        // Game Functions
        function startGame() {
            canvas = document.getElementById('game-canvas');
            ctx = canvas.getContext('2d');
            
            document.getElementById('game-menu').classList.add('hidden');
            document.getElementById('game-hud').classList.remove('hidden');
            canvas.classList.remove('hidden');
            
            resetGame();
            gameState.isPlaying = true;
            spawnEnemies();
            setupGameControls();
            gameLoop();
        }

        function resetGame() {
            gameState = {
                isPlaying: true,
                player: { x: 400, y: 300, angle: 0, health: 100 },
                enemies: [],
                bullets: [],
                score: 0,
                kills: 0,
                level: 1,
                ammo: 30,
                shotsFired: 0,
                shotsHit: 0
            };
            updateHUD();
        }

        function spawnEnemies() {
            const count = 3 + gameState.level;
            for (let i = 0; i < count; i++) {
                let x, y;
                do {
                    x = Math.random() * 750 + 25;
                    y = Math.random() * 550 + 25;
                } while (Math.abs(x - gameState.player.x) < 100 && Math.abs(y - gameState.player.y) < 100);

                gameState.enemies.push({
                    x, y, health: 100, speed: 1.5 + Math.random() * 0.5, alive: true
                });
            }
        }

        function setupGameControls() {
            document.addEventListener('keydown', (e) => {
                keys[e.code] = true;
                if (e.code === 'KeyR' && gameState.ammo < 30) reload();
            });
            
            document.addEventListener('keyup', (e) => {
                keys[e.code] = false;
            });
            
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });
            
            canvas.addEventListener('click', () => {
                if (gameState.isPlaying) shoot();
            });
        }

        function shoot() {
            if (gameState.ammo <= 0) return;
            
            gameState.ammo--;
            gameState.shotsFired++;
            
            const angle = Math.atan2(mouse.y - gameState.player.y, mouse.x - gameState.player.x);
            gameState.bullets.push({
                x: gameState.player.x,
                y: gameState.player.y,
                angle: angle,
                speed: 8,
                isPlayer: true,
                alive: true
            });
            
            updateHUD();
        }

        function reload() {
            setTimeout(() => {
                gameState.ammo = 30;
                updateHUD();
            }, 1000);
        }

        function updateGame() {
            if (!gameState.isPlaying) return;

            // Player movement
            let dx = 0, dy = 0;
            if (keys['KeyW']) dy = -3;
            if (keys['KeyS']) dy = 3;
            if (keys['KeyA']) dx = -3;
            if (keys['KeyD']) dx = 3;
            
            gameState.player.x = Math.max(15, Math.min(785, gameState.player.x + dx));
            gameState.player.y = Math.max(15, Math.min(585, gameState.player.y + dy));
            gameState.player.angle = Math.atan2(mouse.y - gameState.player.y, mouse.x - gameState.player.x);

            // Update bullets
            gameState.bullets.forEach(bullet => {
                bullet.x += Math.cos(bullet.angle) * bullet.speed;
                bullet.y += Math.sin(bullet.angle) * bullet.speed;
                
                if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
                    bullet.alive = false;
                }
            });

            // Update enemies
            gameState.enemies.forEach(enemy => {
                const dx = gameState.player.x - enemy.x;
                const dy = gameState.player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 30) {
                    enemy.x += (dx / distance) * enemy.speed;
                    enemy.y += (dy / distance) * enemy.speed;
                }
                
                if (distance < 25) {
                    gameState.player.health -= 0.2;
                    if (gameState.player.health <= 0) gameOver();
                }
            });

            // Check collisions
            gameState.bullets.forEach(bullet => {
                if (!bullet.isPlayer || !bullet.alive) return;
                
                gameState.enemies.forEach((enemy, enemyIndex) => {
                    if (!enemy.alive) return;
                    
                    const dx = bullet.x - enemy.x;
                    const dy = bullet.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 20) {
                        bullet.alive = false;
                        enemy.health -= 25;
                        gameState.shotsHit++;
                        
                        if (enemy.health <= 0) {
                            enemy.alive = false;
                            gameState.kills++;
                            gameState.score += 100;
                        }
                    }
                });
            });

            // Clean up
            gameState.bullets = gameState.bullets.filter(b => b.alive);
            gameState.enemies = gameState.enemies.filter(e => e.alive);

            // Level progression
            if (gameState.enemies.length === 0) {
                gameState.level++;
                gameState.score += 1000 * gameState.level;
                spawnEnemies();
            }

            updateHUD();
        }

        function drawGame() {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, 800, 600);

            // Draw grid
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            for (let x = 0; x < 800; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, 600);
                ctx.stroke();
            }
            for (let y = 0; y < 600; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(800, y);
                ctx.stroke();
            }

            // Draw player
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(gameState.player.x, gameState.player.y, 15, 0, Math.PI * 2);
            ctx.fill();

            // Draw player direction
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(gameState.player.x, gameState.player.y);
            ctx.lineTo(
                gameState.player.x + Math.cos(gameState.player.angle) * 25,
                gameState.player.y + Math.sin(gameState.player.angle) * 25
            );
            ctx.stroke();

            // Draw enemies
            gameState.enemies.forEach(enemy => {
                ctx.fillStyle = \`rgb(255, \${255 - (100 - enemy.health) * 2.55}, \${255 - (100 - enemy.health) * 2.55})\`;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, 20, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw bullets
            gameState.bullets.forEach(bullet => {
                ctx.fillStyle = bullet.isPlayer ? '#ffff00' : '#ff0000';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function updateHUD() {
            document.getElementById('score').textContent = gameState.score;
            document.getElementById('health').textContent = Math.max(0, Math.floor(gameState.player.health));
            document.getElementById('ammo').textContent = gameState.ammo;
            document.getElementById('level').textContent = gameState.level;
            document.getElementById('kills').textContent = gameState.kills;
            
            const accuracy = gameState.shotsFired > 0 ? (gameState.shotsHit / gameState.shotsFired * 100) : 100;
            document.getElementById('accuracy').textContent = accuracy.toFixed(1);
        }

        function gameOver() {
            gameState.isPlaying = false;
            alert(\`ゲームオーバー！\\nスコア: \${gameState.score}\\nキル数: \${gameState.kills}\\nレベル: \${gameState.level}\`);
            
            document.getElementById('game-menu').classList.remove('hidden');
            document.getElementById('game-hud').classList.add('hidden');
            canvas.classList.add('hidden');
        }

        function gameLoop() {
            if (gameState.isPlaying) {
                updateGame();
                drawGame();
                requestAnimationFrame(gameLoop);
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Media & Gaming Hub - Offline Version Loaded');
        });
    </script>
</body>
</html>`;

      // Create and download the file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'media-gaming-hub-offline.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating HTML:', error);
      alert('HTMLファイルの生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        オフライン版をダウンロード
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-700">
              <Package className="w-5 h-5 mr-2" />
              アプリダウンロード
            </DialogTitle>
            <DialogDescription>
              スタンドアロンHTMLファイルとしてアプリをダウンロードできます
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center text-blue-700">
                  <FileCode className="w-4 h-4 mr-2" />
                  オフライン版の特徴
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• インターネット接続不要</li>
                  <li>• どのブラウザでも動作</li>
                  <li>• YouTube動画プレイヤー機能</li>
                  <li>• FPSゲーム完全版</li>
                  <li>• 1つのHTMLファイルに全て含む</li>
                </ul>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <Button 
                onClick={generateStandaloneHTML}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    HTMLファイルを生成・ダウンロード
                  </>
                )}
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                ダウンロード後、HTMLファイルをブラウザで開いてご利用ください
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}