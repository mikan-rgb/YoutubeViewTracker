import { useEffect, useRef, useCallback } from "react";

interface SimpleFPSGameProps {
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver';
  onStatsUpdate: (stats: any) => void;
  onGameOver: () => void;
}

interface Player {
  x: number;
  y: number;
  angle: number;
  speed: number;
  health: number;
}

interface Enemy {
  x: number;
  y: number;
  health: number;
  speed: number;
  angle: number;
  lastShot: number;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
  angle: number;
  speed: number;
  isPlayer: boolean;
  alive: boolean;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  score: number;
  kills: number;
  ammo: number;
  level: number;
  shotsFired: number;
  shotsHit: number;
  lastShot: number;
  isReloading: boolean;
  reloadStart: number;
}

export default function SimpleFPSGame({ gameState, onStatsUpdate, onGameOver }: SimpleFPSGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: { x: 400, y: 300, angle: 0, speed: 3, health: 100 },
    enemies: [],
    bullets: [],
    score: 0,
    kills: 0,
    ammo: 30,
    level: 1,
    shotsFired: 0,
    shotsHit: 0,
    lastShot: 0,
    isReloading: false,
    reloadStart: 0
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;
  const ENEMY_SIZE = 20;
  const PLAYER_SIZE = 15;
  const BULLET_SIZE = 3;
  const BULLET_SPEED = 8;
  const ENEMY_SPEED = 1.5;

  const spawnEnemies = useCallback(() => {
    const game = gameStateRef.current;
    const enemyCount = 3 + game.level;
    
    for (let i = 0; i < enemyCount; i++) {
      let x, y;
      do {
        x = Math.random() * (MAP_WIDTH - 100) + 50;
        y = Math.random() * (MAP_HEIGHT - 100) + 50;
      } while (Math.abs(x - game.player.x) < 100 && Math.abs(y - game.player.y) < 100);

      game.enemies.push({
        x,
        y,
        health: 100,
        speed: ENEMY_SPEED + Math.random() * 0.5,
        angle: 0,
        lastShot: 0,
        alive: true
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      player: { x: 400, y: 300, angle: 0, speed: 3, health: 100 },
      enemies: [],
      bullets: [],
      score: 0,
      kills: 0,
      ammo: 30,
      level: 1,
      shotsFired: 0,
      shotsHit: 0,
      lastShot: 0,
      isReloading: false,
      reloadStart: 0
    };
    spawnEnemies();
  }, [spawnEnemies]);

  const shoot = useCallback(() => {
    const game = gameStateRef.current;
    const now = Date.now();
    
    if (now - game.lastShot < 200 || game.ammo <= 0 || game.isReloading) return;

    game.lastShot = now;
    game.ammo--;
    game.shotsFired++;

    // Create bullet
    const bulletSpeed = BULLET_SPEED;
    game.bullets.push({
      x: game.player.x,
      y: game.player.y,
      angle: game.player.angle,
      speed: bulletSpeed,
      isPlayer: true,
      alive: true
    });

    updateStats();
  }, []);

  const reload = useCallback(() => {
    const game = gameStateRef.current;
    if (game.isReloading || game.ammo >= 30) return;

    game.isReloading = true;
    game.reloadStart = Date.now();

    setTimeout(() => {
      game.ammo = 30;
      game.isReloading = false;
      updateStats();
    }, 2000);
  }, []);

  const updateStats = useCallback(() => {
    const game = gameStateRef.current;
    const accuracy = game.shotsFired > 0 ? (game.shotsHit / game.shotsFired) * 100 : 100;
    
    onStatsUpdate({
      score: game.score,
      kills: game.kills,
      accuracy,
      level: game.level,
      health: game.player.health,
      ammo: game.ammo
    });
  }, [onStatsUpdate]);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    const game = gameStateRef.current;

    // Update player movement
    let dx = 0, dy = 0;
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) dy = -game.player.speed;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) dy = game.player.speed;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) dx = -game.player.speed;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) dx = game.player.speed;

    // Move player with boundary checking
    game.player.x = Math.max(PLAYER_SIZE, Math.min(MAP_WIDTH - PLAYER_SIZE, game.player.x + dx));
    game.player.y = Math.max(PLAYER_SIZE, Math.min(MAP_HEIGHT - PLAYER_SIZE, game.player.y + dy));

    // Update player angle based on mouse
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      game.player.angle = Math.atan2(mouseRef.current.y - centerY, mouseRef.current.x - centerX);
    }

    // Update bullets
    game.bullets.forEach((bullet, index) => {
      if (!bullet.alive) return;

      bullet.x += Math.cos(bullet.angle) * bullet.speed;
      bullet.y += Math.sin(bullet.angle) * bullet.speed;

      // Remove bullets that go off screen
      if (bullet.x < 0 || bullet.x > MAP_WIDTH || bullet.y < 0 || bullet.y > MAP_HEIGHT) {
        bullet.alive = false;
      }
    });

    // Update enemies
    game.enemies.forEach((enemy, enemyIndex) => {
      if (!enemy.alive) return;

      // Move towards player
      const dx = game.player.x - enemy.x;
      const dy = game.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 30) {
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
      }

      enemy.angle = Math.atan2(dy, dx);

      // Enemy shoots at player
      const now = Date.now();
      if (distance < 200 && now - enemy.lastShot > 2000) {
        enemy.lastShot = now;
        game.bullets.push({
          x: enemy.x,
          y: enemy.y,
          angle: enemy.angle,
          speed: BULLET_SPEED * 0.7,
          isPlayer: false,
          alive: true
        });
      }

      // Damage player if enemy is close
      if (distance < 25) {
        game.player.health -= 0.5;
        if (game.player.health <= 0) {
          onGameOver();
        }
      }
    });

    // Check bullet collisions
    game.bullets.forEach((bullet, bulletIndex) => {
      if (!bullet.alive) return;

      if (bullet.isPlayer) {
        // Player bullet hitting enemies
        game.enemies.forEach((enemy, enemyIndex) => {
          if (!enemy.alive) return;

          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ENEMY_SIZE) {
            bullet.alive = false;
            enemy.health -= 25;
            game.shotsHit++;

            if (enemy.health <= 0) {
              enemy.alive = false;
              game.kills++;
              game.score += 100;
            }
          }
        });
      } else {
        // Enemy bullet hitting player
        const dx = bullet.x - game.player.x;
        const dy = bullet.y - game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < PLAYER_SIZE) {
          bullet.alive = false;
          game.player.health -= 10;
          if (game.player.health <= 0) {
            onGameOver();
          }
        }
      }
    });

    // Remove dead bullets and enemies
    game.bullets = game.bullets.filter(bullet => bullet.alive);
    game.enemies = game.enemies.filter(enemy => enemy.alive);

    // Check for level completion
    if (game.enemies.length === 0) {
      game.level++;
      game.score += 1000 * game.level;
      spawnEnemies();
    }

    updateStats();
  }, [gameState, onGameOver, spawnEnemies, updateStats]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const game = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Draw player direction
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(game.player.x, game.player.y);
    ctx.lineTo(
      game.player.x + Math.cos(game.player.angle) * 25,
      game.player.y + Math.sin(game.player.angle) * 25
    );
    ctx.stroke();

    // Draw enemies
    game.enemies.forEach(enemy => {
      if (!enemy.alive) return;

      ctx.fillStyle = `rgb(255, ${255 - (100 - enemy.health) * 2.55}, ${255 - (100 - enemy.health) * 2.55})`;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, ENEMY_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Draw enemy direction
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemy.x, enemy.y);
      ctx.lineTo(
        enemy.x + Math.cos(enemy.angle) * 20,
        enemy.y + Math.sin(enemy.angle) * 20
      );
      ctx.stroke();
    });

    // Draw bullets
    game.bullets.forEach(bullet => {
      if (!bullet.alive) return;

      ctx.fillStyle = bullet.isPlayer ? '#ffff00' : '#ff0000';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, BULLET_SIZE, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw reload indicator
    if (game.isReloading) {
      const progress = Math.min((Date.now() - game.reloadStart) / 2000, 1);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.fillRect(game.player.x - 20, game.player.y - 30, 40 * progress, 5);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(game.player.x - 20, game.player.y - 30, 40, 5);
    }
  }, []);

  const gameLoop = useCallback(() => {
    updateGame();
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyR') reload();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleClick = () => {
      if (gameState === 'playing') shoot();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [gameState, shoot, reload]);

  useEffect(() => {
    if (gameState === 'playing') {
      if (gameStateRef.current.enemies.length === 0) {
        resetGame();
      }
      gameLoop();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = MAP_WIDTH;
      canvas.height = MAP_HEIGHT;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        className="border border-gray-600 bg-gray-900"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}