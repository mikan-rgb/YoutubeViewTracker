import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import * as CANNON from "cannon-es";

interface FPSGameEngineProps {
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver';
  onStatsUpdate: (stats: any) => void;
  onGameOver: () => void;
}

interface GameStats {
  score: number;
  kills: number;
  accuracy: number;
  level: number;
  health: number;
  ammo: number;
}

interface Enemy {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  health: number;
  speed: number;
  lastShot: number;
  ai: {
    target: THREE.Vector3;
    moveTimer: number;
    shootTimer: number;
  };
}

interface Bullet {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  isPlayerBullet: boolean;
  damage: number;
  lifeTime: number;
}

const FPSGameEngine = forwardRef<any, FPSGameEngineProps>(({ gameState, onStatsUpdate, onGameOver }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const worldRef = useRef<CANNON.World>();
  const playerBodyRef = useRef<CANNON.Body>();
  const animationIdRef = useRef<number>();
  
  // Game state
  const gameStatsRef = useRef<GameStats>({
    score: 0,
    kills: 0,
    accuracy: 100,
    level: 1,
    health: 100,
    ammo: 30
  });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef({ x: 0, y: 0, sensitivity: 0.002 });
  const shotsFiredRef = useRef(0);
  const shotsHitRef = useRef(0);
  const lastShotRef = useRef(0);
  const isReloadingRef = useRef(false);
  const reloadStartRef = useRef(0);

  useImperativeHandle(ref, () => ({
    restart: () => {
      resetGame();
    }
  }));

  const resetGame = () => {
    gameStatsRef.current = {
      score: 0,
      kills: 0,
      accuracy: 100,
      level: 1,
      health: 100,
      ammo: 30
    };
    shotsFiredRef.current = 0;
    shotsHitRef.current = 0;
    isReloadingRef.current = false;
    
    // Clear enemies and bullets
    enemiesRef.current.forEach(enemy => {
      sceneRef.current?.remove(enemy.mesh);
      worldRef.current?.removeBody(enemy.body);
    });
    bulletsRef.current.forEach(bullet => {
      sceneRef.current?.remove(bullet.mesh);
      worldRef.current?.removeBody(bullet.body);
    });
    enemiesRef.current = [];
    bulletsRef.current = [];
    
    onStatsUpdate(gameStatsRef.current);
  };

  const initializeGame = () => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    sceneRef.current = scene;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera setup (FPS camera)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 0); // Eye level height
    cameraRef.current = camera;

    // Physics world setup
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    worldRef.current = world;

    // Player physics body
    const playerShape = new CANNON.Cylinder(0.5, 0.5, 1.8, 8);
    const playerBody = new CANNON.Body({ mass: 80 });
    playerBody.addShape(playerShape);
    playerBody.position.set(0, 1, 0);
    playerBody.material = new CANNON.Material({ friction: 0.4, restitution: 0.1 });
    world.addBody(playerBody);
    playerBodyRef.current = playerBody;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create arena
    createArena();
    
    // Spawn initial enemies
    spawnEnemies(3);

    // Event listeners
    setupEventListeners();
  };

  const createArena = () => {
    if (!sceneRef.current || !worldRef.current) return;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    sceneRef.current.add(ground);

    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    worldRef.current.addBody(groundBody);

    // Walls
    const wallHeight = 5;
    const wallThickness = 1;
    const arenaSize = 50;

    const wallPositions = [
      { x: 0, z: arenaSize / 2, rotY: 0 }, // North
      { x: 0, z: -arenaSize / 2, rotY: 0 }, // South
      { x: arenaSize / 2, z: 0, rotY: Math.PI / 2 }, // East
      { x: -arenaSize / 2, z: 0, rotY: Math.PI / 2 }, // West
    ];

    wallPositions.forEach(pos => {
      const wallGeometry = new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness);
      const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Saddle brown
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(pos.x, wallHeight / 2, pos.z);
      wall.rotation.y = pos.rotY;
      wall.castShadow = true;
      wall.receiveShadow = true;
      sceneRef.current!.add(wall);

      const wallShape = new CANNON.Box(new CANNON.Vec3(arenaSize / 2, wallHeight / 2, wallThickness / 2));
      const wallBody = new CANNON.Body({ mass: 0 });
      wallBody.addShape(wallShape);
      wallBody.position.set(pos.x, wallHeight / 2, pos.z);
      if (pos.rotY !== 0) {
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), pos.rotY);
      }
      worldRef.current!.addBody(wallBody);
    });

    // Cover objects
    for (let i = 0; i < 8; i++) {
      const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
      const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Dim gray
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15 + Math.random() * 10;
      box.position.set(
        Math.cos(angle) * radius,
        1,
        Math.sin(angle) * radius
      );
      box.castShadow = true;
      box.receiveShadow = true;
      sceneRef.current!.add(box);

      const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      const boxBody = new CANNON.Body({ mass: 0 });
      boxBody.addShape(boxShape);
      boxBody.position.copy(box.position as any);
      worldRef.current!.addBody(boxBody);
    }
  };

  const spawnEnemies = (count: number) => {
    if (!sceneRef.current || !worldRef.current) return;

    for (let i = 0; i < count; i++) {
      // Enemy mesh
      const enemyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
      const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4444 }); // Red
      const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
      
      // Random spawn position
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      enemyMesh.position.set(x, 1, z);
      enemyMesh.castShadow = true;
      sceneRef.current.add(enemyMesh);

      // Enemy physics
      const enemyShape = new CANNON.Cylinder(0.5, 0.5, 1.5, 8);
      const enemyBody = new CANNON.Body({ mass: 70 });
      enemyBody.addShape(enemyShape);
      enemyBody.position.set(x, 1, z);
      enemyBody.material = new CANNON.Material({ friction: 0.4, restitution: 0.1 });
      worldRef.current.addBody(enemyBody);

      const enemy: Enemy = {
        mesh: enemyMesh,
        body: enemyBody,
        health: 100,
        speed: 2 + Math.random() * 2,
        lastShot: 0,
        ai: {
          target: new THREE.Vector3(),
          moveTimer: 0,
          shootTimer: 0
        }
      };

      enemiesRef.current.push(enemy);
    }
  };

  const setupEventListeners = () => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.code] = true;
      
      if (event.code === 'KeyR' && !isReloadingRef.current && gameStatsRef.current.ammo < 30) {
        reload();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (gameState !== 'playing') return;
      
      mouseRef.current.x += event.movementX * mouseRef.current.sensitivity;
      mouseRef.current.y += event.movementY * mouseRef.current.sensitivity;
      mouseRef.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseRef.current.y));
    };

    const handleClick = () => {
      if (gameState === 'playing') {
        shoot();
      }
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement === rendererRef.current?.domElement) {
        document.addEventListener('mousemove', handleMouseMove);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    // Request pointer lock when clicking on canvas
    rendererRef.current?.domElement.addEventListener('click', () => {
      if (gameState === 'playing') {
        rendererRef.current?.domElement.requestPointerLock();
      }
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  };

  const shoot = () => {
    const now = Date.now();
    if (now - lastShotRef.current < 200 || gameStatsRef.current.ammo <= 0 || isReloadingRef.current) return;

    lastShotRef.current = now;
    gameStatsRef.current.ammo--;
    shotsFiredRef.current++;

    createBullet(true);
    onStatsUpdate(gameStatsRef.current);
  };

  const reload = () => {
    isReloadingRef.current = true;
    reloadStartRef.current = Date.now();
    
    setTimeout(() => {
      gameStatsRef.current.ammo = 30;
      isReloadingRef.current = false;
      onStatsUpdate(gameStatsRef.current);
    }, 2000);
  };

  const createBullet = (isPlayer: boolean) => {
    if (!sceneRef.current || !worldRef.current || !cameraRef.current) return;

    const bulletGeometry = new THREE.SphereGeometry(0.05);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
      color: isPlayer ? 0xFFFF00 : 0xFF0000 
    });
    const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

    let startPos: THREE.Vector3;
    let direction: THREE.Vector3;

    if (isPlayer) {
      startPos = cameraRef.current.position.clone();
      direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(cameraRef.current.quaternion);
    } else {
      // Enemy bullet logic would go here
      return;
    }

    bulletMesh.position.copy(startPos);
    sceneRef.current.add(bulletMesh);

    const bulletShape = new CANNON.Sphere(0.05);
    const bulletBody = new CANNON.Body({ mass: 0.1 });
    bulletBody.addShape(bulletShape);
    bulletBody.position.copy(startPos as any);
    bulletBody.velocity.set(
      direction.x * 100,
      direction.y * 100,
      direction.z * 100
    );
    worldRef.current.addBody(bulletBody);

    const bullet: Bullet = {
      mesh: bulletMesh,
      body: bulletBody,
      isPlayerBullet: isPlayer,
      damage: 25,
      lifeTime: 5000
    };

    bulletsRef.current.push(bullet);
  };

  const updateGame = (deltaTime: number) => {
    if (gameState !== 'playing') return;

    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateBullets(deltaTime);
    checkCollisions();
    updateCamera();
    
    // Update accuracy
    if (shotsFiredRef.current > 0) {
      gameStatsRef.current.accuracy = (shotsHitRef.current / shotsFiredRef.current) * 100;
    }

    // Spawn more enemies as levels progress
    if (enemiesRef.current.length === 0) {
      gameStatsRef.current.level++;
      gameStatsRef.current.score += 1000 * gameStatsRef.current.level;
      spawnEnemies(3 + gameStatsRef.current.level);
      onStatsUpdate(gameStatsRef.current);
    }
  };

  const updatePlayer = (deltaTime: number) => {
    if (!playerBodyRef.current || !cameraRef.current) return;

    const moveSpeed = 10;
    const velocity = new CANNON.Vec3();

    if (keysRef.current.KeyW) velocity.z -= moveSpeed;
    if (keysRef.current.KeyS) velocity.z += moveSpeed;
    if (keysRef.current.KeyA) velocity.x -= moveSpeed;
    if (keysRef.current.KeyD) velocity.x += moveSpeed;

    // Apply camera rotation to movement
    const cameraDirection = new THREE.Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(cameraRef.current.quaternion);
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(cameraRef.current.quaternion);

    const forward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
    const rightVec = new THREE.Vector3(right.x, 0, right.z).normalize();

    const moveVector = new CANNON.Vec3();
    moveVector.x = forward.x * velocity.z + rightVec.x * velocity.x;
    moveVector.z = forward.z * velocity.z + rightVec.z * velocity.x;

    playerBodyRef.current.velocity.x = moveVector.x;
    playerBodyRef.current.velocity.z = moveVector.z;

    // Update camera position to follow player
    cameraRef.current.position.copy(playerBodyRef.current.position as any);
    cameraRef.current.position.y += 0.8; // Eye offset
  };

  const updateEnemies = (deltaTime: number) => {
    if (!playerBodyRef.current || !cameraRef.current) return;

    const playerPos = playerBodyRef.current.position;

    enemiesRef.current.forEach(enemy => {
      const enemyPos = enemy.body.position;
      const distance = playerPos.distanceTo(enemyPos);

      // Simple AI: move towards player and shoot
      if (distance > 2) {
        const direction = new CANNON.Vec3();
        direction.copy(playerPos);
        direction.vsub(enemyPos);
        direction.y = 0;
        const unitDirection = direction.unit();

        enemy.body.velocity.x = unitDirection.x * enemy.speed;
        enemy.body.velocity.z = unitDirection.z * enemy.speed;
      } else {
        enemy.body.velocity.x = 0;
        enemy.body.velocity.z = 0;
      }

      // Update mesh position
      enemy.mesh.position.copy(enemy.body.position as any);
      enemy.mesh.quaternion.copy(enemy.body.quaternion as any);

      // Look at player
      enemy.mesh.lookAt(playerPos.x, enemy.mesh.position.y, playerPos.z);

      // Enemy damage to player
      if (distance < 2 && Math.random() < 0.01) {
        gameStatsRef.current.health -= 5;
        if (gameStatsRef.current.health <= 0) {
          onGameOver();
        }
        onStatsUpdate(gameStatsRef.current);
      }
    });
  };

  const updateBullets = (deltaTime: number) => {
    bulletsRef.current.forEach((bullet, index) => {
      bullet.mesh.position.copy(bullet.body.position as any);
      bullet.lifeTime -= deltaTime * 1000;

      if (bullet.lifeTime <= 0) {
        sceneRef.current?.remove(bullet.mesh);
        worldRef.current?.removeBody(bullet.body);
        bulletsRef.current.splice(index, 1);
      }
    });
  };

  const checkCollisions = () => {
    // Check bullet-enemy collisions
    bulletsRef.current.forEach((bullet, bulletIndex) => {
      if (!bullet.isPlayerBullet) return;

      enemiesRef.current.forEach((enemy, enemyIndex) => {
        const distance = bullet.body.position.distanceTo(enemy.body.position);
        
        if (distance < 1) {
          // Hit!
          enemy.health -= bullet.damage;
          shotsHitRef.current++;
          
          // Remove bullet
          sceneRef.current?.remove(bullet.mesh);
          worldRef.current?.removeBody(bullet.body);
          bulletsRef.current.splice(bulletIndex, 1);
          
          if (enemy.health <= 0) {
            // Enemy destroyed
            sceneRef.current?.remove(enemy.mesh);
            worldRef.current?.removeBody(enemy.body);
            enemiesRef.current.splice(enemyIndex, 1);
            
            gameStatsRef.current.kills++;
            gameStatsRef.current.score += 100;
            onStatsUpdate(gameStatsRef.current);
          }
        }
      });
    });
  };

  const updateCamera = () => {
    if (!cameraRef.current) return;

    cameraRef.current.rotation.order = 'YXZ';
    cameraRef.current.rotation.y = -mouseRef.current.x;
    cameraRef.current.rotation.x = -mouseRef.current.y;
  };

  const animate = () => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !worldRef.current) return;

    const deltaTime = 1/60; // Fixed timestep
    worldRef.current.step(deltaTime);
    updateGame(deltaTime);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      if (!sceneRef.current) {
        initializeGame();
      }
      animate();
    } else {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
});

FPSGameEngine.displayName = 'FPSGameEngine';

export default FPSGameEngine;