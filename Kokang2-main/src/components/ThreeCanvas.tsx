import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CropType, GameState } from '../types/game';
import { CROP_CONFIGS } from '../utils/cropConfigs';
import {
  createStoneKnifeMesh,
  createCropMesh,
  createSplitCropMeshes,
  createGrainBurstParticles,
} from '../utils/threeHelpers';
import { sound } from '../utils/audio';

interface ActiveCrop {
  id: string;
  type: CropType;
  group: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  radius: number;
  sliced: boolean;
  spawnTime: number;
}

interface SplitPart {
  group: THREE.Group;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface ParticleSystem {
  mesh: THREE.InstancedMesh;
  velocities: THREE.Vector3[];
  rotations: THREE.Vector3[];
  life: number;
  maxLife: number;
}

interface TrailPoint {
  pos: THREE.Vector3;
  time: number;
  width: number;
}

// Juicy paint / juice droplet splatter particle
interface SplashDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface SplashBlot {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  rotation: number;
  points: { r: number; angle: number }[];
}

interface SplatSystem {
  x: number;
  y: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  droplets: SplashDroplet[];
  blots: SplashBlot[];
}

interface ThreeCanvasProps {
  gameState: GameState;
  onScoreUpdate: (points: number, cropType: CropType) => void;
  onCombo: (count: number, bonus: number) => void;
  onHazardHit: (type: 'stone' | 'pest') => void;
  feverTimeLeft: number;
  slowMoTimeLeft: number;
  onTriggerFever: () => void;
  onTriggerSlowMo: () => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  gameState,
  onScoreUpdate,
  onCombo,
  onHazardHit,
  feverTimeLeft,
  slowMoTimeLeft,
  onTriggerFever,
  onTriggerSlowMo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable refs for high-frequency updates without tearing down the WebGL scene
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  const feverTimeLeftRef = useRef<number>(feverTimeLeft);
  feverTimeLeftRef.current = feverTimeLeft;

  const slowMoTimeLeftRef = useRef<number>(slowMoTimeLeft);
  slowMoTimeLeftRef.current = slowMoTimeLeft;

  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;

  const onComboRef = useRef(onCombo);
  onComboRef.current = onCombo;

  const onHazardHitRef = useRef(onHazardHit);
  onHazardHitRef.current = onHazardHit;

  const onTriggerFeverRef = useRef(onTriggerFever);
  onTriggerFeverRef.current = onTriggerFever;

  const onTriggerSlowMoRef = useRef(onTriggerSlowMo);
  onTriggerSlowMoRef.current = onTriggerSlowMo;

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const activeCropsRef = useRef<ActiveCrop[]>([]);
  const splitPartsRef = useRef<SplitPart[]>([]);
  const particlesRef = useRef<ParticleSystem[]>([]);
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const splatsRef = useRef<SplatSystem[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const currentDragStrokeRef = useRef<{
    slicedCrops: CropType[];
    points: { x: number; y: number; t: number }[];
  }>({ slicedCrops: [], points: [] });

  const knifeRef = useRef<THREE.Group | null>(null);
  const targetKnifePos = useRef<THREE.Vector3>(new THREE.Vector3(0, -10, 0));
  const knifeVelocity = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const lastMousePos = useRef<{ x: number; y: number; time: number } | null>(null);

  const screenShakeRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);

  // Generates organic paint splash droplets & irregular ink blotches
  const spawnPaintSplatter = useCallback((screenX: number, screenY: number, cropType: CropType, sliceDir: THREE.Vector2) => {
    const config = CROP_CONFIGS[cropType];
    const color = config.glowColor;

    // Organic splatter droplets bursting in a fan along slice normal
    const droplets: SplashDroplet[] = [];
    const dropletCount = cropType === 'golden_sheaf' ? 28 : cropType === 'stone' ? 12 : 22;
    const baseAngle = Math.atan2(sliceDir.y, sliceDir.x);

    for (let i = 0; i < dropletCount; i++) {
      // Fan out with bias in the slice direction
      const spread = (Math.random() - 0.5) * Math.PI * 1.4;
      const angle = baseAngle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2) + spread;
      const speed = 120 + Math.random() * 480;
      droplets.push({
        x: screenX + (Math.random() - 0.5) * 16,
        y: screenY + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3.5 + Math.random() * 9.5,
        color,
        alpha: 0.95,
      });
    }

    // Organic central impact blotches (star/blob polygon shape like real liquid splatter)
    const blots: SplashBlot[] = [];
    const blotCount = 3 + Math.floor(Math.random() * 3);
    for (let b = 0; b < blotCount; b++) {
      const blotRadius = 18 + Math.random() * 26;
      const numVerts = 10;
      const points: { r: number; angle: number }[] = [];
      for (let v = 0; v < numVerts; v++) {
        const vAngle = (v / numVerts) * Math.PI * 2;
        const radVar = blotRadius * (0.45 + Math.random() * 0.85);
        points.push({ r: radVar, angle: vAngle });
      }

      blots.push({
        x: screenX + (Math.random() - 0.5) * 24,
        y: screenY + (Math.random() - 0.5) * 24,
        radius: blotRadius,
        color,
        alpha: 0.85,
        rotation: Math.random() * Math.PI * 2,
        points,
      });
    }

    splatsRef.current.push({
      x: screenX,
      y: screenY,
      color,
      glowColor: config.glowColor,
      life: 0.65,
      maxLife: 0.65,
      droplets,
      blots,
    });
  }, []);

  // Slice action handler
  const handleSliceCrop = useCallback((crop: ActiveCrop, sliceDir: THREE.Vector2) => {
    crop.sliced = true;
    const config = CROP_CONFIGS[crop.type];

    // Trigger juicy paint splash on 2D overlay at screen projection coordinate
    if (cameraRef.current && trailCanvasRef.current) {
      const v = crop.pos.clone().project(cameraRef.current);
      const sx = ((v.x + 1) * trailCanvasRef.current.width) / 2;
      const sy = ((-v.y + 1) * trailCanvasRef.current.height) / 2;
      spawnPaintSplatter(sx, sy, crop.type, sliceDir);
    }

    // Audio and special events
    if (crop.type === 'stone') {
      sound.playStoneHit();
      screenShakeRef.current = 0.45;
      onHazardHitRef.current('stone');
      return;
    } else if (crop.type === 'pest') {
      sound.playBomb();
      screenShakeRef.current = 0.7;
      onHazardHitRef.current('pest');
      return;
    } else if (crop.type === 'golden_sheaf') {
      sound.playFever();
      screenShakeRef.current = 0.3;
      onTriggerFeverRef.current();
    } else if (crop.type === 'frost_ear') {
      sound.playSlowMo();
      screenShakeRef.current = 0.2;
      onTriggerSlowMoRef.current();
    } else {
      sound.playSlice(crop.type);
    }

    // Register score and current stroke slice
    const points = config.points * (feverTimeLeftRef.current > 0 ? 2 : 1);
    onScoreUpdateRef.current(points, crop.type);
    currentDragStrokeRef.current.slicedCrops.push(crop.type);

    screenShakeRef.current = Math.max(screenShakeRef.current, 0.18);
  }, [spawnPaintSplatter]);

  // Clear scene items when restarting to PLAYING
  const clearSceneItems = useCallback(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    for (const crop of activeCropsRef.current) {
      scene.remove(crop.group);
    }
    activeCropsRef.current = [];

    for (const sp of splitPartsRef.current) {
      scene.remove(sp.group);
    }
    splitPartsRef.current = [];

    for (const ps of particlesRef.current) {
      scene.remove(ps.mesh);
    }
    particlesRef.current = [];

    trailPointsRef.current = [];
    splatsRef.current = [];
    gameTimeRef.current = 0;
    nextSpawnTimeRef.current = 0.6;
  }, []);

  // Main Three.js setup - runs ONCE on mount
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera (perspective)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xFFEDD5, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFDBA74, 2.4);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x93C5FD, 0.8);
    rimLight.position.set(-8, -4, -4);
    scene.add(rimLight);

    // Stone Knife (반달돌칼)
    const knife = createStoneKnifeMesh();
    knife.position.set(0, -10, 0);
    scene.add(knife);
    knifeRef.current = knife;

    // Raycasting plane at Z = 0
    const gamePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !trailCanvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      trailCanvasRef.current.width = w;
      trailCanvasRef.current.height = h;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Trail canvas 2D context
    const trailCtx = trailCanvasRef.current?.getContext('2d');

    // Spawn pool
    const getSpawnPool = (): CropType[] => {
      const types: CropType[] = [];
      const keys = Object.keys(CROP_CONFIGS) as CropType[];
      keys.forEach((k) => {
        const count = CROP_CONFIGS[k].rarityWeight;
        for (let i = 0; i < count; i++) {
          types.push(k);
        }
      });
      return types;
    };
    const spawnPool = getSpawnPool();

    // Spawner function
    const spawnWave = () => {
      if (gameStateRef.current !== 'PLAYING') return;

      const isFever = feverTimeLeftRef.current > 0;
      const waveCount = isFever ? Math.floor(3 + Math.random() * 3) : Math.floor(1 + Math.random() * 2.5);

      for (let i = 0; i < waveCount; i++) {
        let selectedType: CropType;
        if (isFever) {
          const goldenPool: CropType[] = ['rice', 'barley', 'millet', 'sorghum', 'golden_sheaf'];
          selectedType = goldenPool[Math.floor(Math.random() * goldenPool.length)];
        } else {
          selectedType = spawnPool[Math.floor(Math.random() * spawnPool.length)];
        }

        const mesh = createCropMesh(selectedType);
        scene.add(mesh);

        const spawnX = (Math.random() - 0.5) * 11;
        const spawnY = -6.8 - Math.random() * 1.5;
        const spawnZ = (Math.random() - 0.5) * 1.5;

        mesh.position.set(spawnX, spawnY, spawnZ);

        const targetX = (Math.random() - 0.5) * 5;
        const vx = (targetX - spawnX) * 0.4 + (Math.random() - 0.5) * 1.2;
        const vy = 13.5 + Math.random() * 3.8;
        const vz = (Math.random() - 0.5) * 0.8;

        const rotVel = new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        );

        activeCropsRef.current.push({
          id: Math.random().toString(36).substring(2, 9),
          type: selectedType,
          group: mesh,
          pos: new THREE.Vector3(spawnX, spawnY, spawnZ),
          vel: new THREE.Vector3(vx, vy, vz),
          rotVel,
          radius: 0.95,
          sliced: false,
          spawnTime: gameTimeRef.current,
        });
      }

      const nextDelay = isFever ? 0.65 + Math.random() * 0.5 : 1.4 + Math.random() * 1.4;
      nextSpawnTimeRef.current = gameTimeRef.current + nextDelay;
    };

    // Animation frame loop
    let lastTime = performance.now();
    let animFrameId: number;

    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);

      const rawDelta = (now - lastTime) / 1000;
      lastTime = now;
      const delta = Math.min(rawDelta, 0.1);

      // If paused, keep rendering current scene without physics simulation updates
      const isPaused = gameStateRef.current === 'PAUSED';
      if (isPaused) {
        renderer.render(scene, camera);
        return;
      }

      const isFever = feverTimeLeftRef.current > 0;
      const isSlowMo = slowMoTimeLeftRef.current > 0;

      // Time dilation for slow-motion frost effect
      const timeScale = isSlowMo ? 0.4 : 1.0;
      const simDelta = delta * timeScale;

      if (gameStateRef.current === 'PLAYING') {
        gameTimeRef.current += simDelta;
      }

      // Camera Shake decay
      if (screenShakeRef.current > 0.001) {
        screenShakeRef.current *= 0.88;
        camera.position.x = (Math.random() - 0.5) * screenShakeRef.current;
        camera.position.y = (Math.random() - 0.5) * screenShakeRef.current;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }

      // Smooth knife position and angle tracking
      if (knifeRef.current) {
        knifeRef.current.position.lerp(targetKnifePos.current, 0.35);

        // Smoothly decay knife velocity when mouse/touch is stationary
        knifeVelocity.current.multiplyScalar(0.92);

        if (knifeVelocity.current.lengthSq() > 0.2) {
          const targetAngle = Math.atan2(knifeVelocity.current.y, knifeVelocity.current.x) + Math.PI / 2;
          let angleDiff = targetAngle - knifeRef.current.rotation.z;
          angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
          knifeRef.current.rotation.z += angleDiff * 0.25;

          knifeRef.current.rotation.y = Math.sin(now * 0.005) * 0.15;
          knifeRef.current.rotation.x = Math.PI * 0.12;
        } else {
          let angleDiff = 0 - knifeRef.current.rotation.z;
          angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
          knifeRef.current.rotation.z += angleDiff * 0.1;
        }

        // Fever mode visual glow on knife
        knifeRef.current.scale.setScalar(isFever ? 1.05 + Math.sin(now * 0.01) * 0.05 : 0.9);
      }

      // Spawning loop
      if (gameStateRef.current === 'PLAYING' && gameTimeRef.current >= nextSpawnTimeRef.current) {
        spawnWave();
      }

      // Physics update for active crops
      const gravity = new THREE.Vector3(0, -17.5, 0);
      const remainingCrops: ActiveCrop[] = [];

      for (const crop of activeCropsRef.current) {
        if (crop.sliced) {
          const { top, bottom } = createSplitCropMeshes(crop.type);
          top.position.copy(crop.group.position);
          bottom.position.copy(crop.group.position);
          scene.add(top);
          scene.add(bottom);

          const splitAngle = Math.random() * Math.PI * 2;
          const spread = 3.5;
          const topVel = crop.vel.clone().multiplyScalar(0.4).add(new THREE.Vector3(Math.cos(splitAngle) * spread, Math.sin(splitAngle) * spread + 2, 1));
          const botVel = crop.vel.clone().multiplyScalar(0.4).add(new THREE.Vector3(-Math.cos(splitAngle) * spread, -Math.sin(splitAngle) * spread - 1, -1));

          splitPartsRef.current.push({
            group: top,
            vel: topVel,
            rotVel: new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12),
            life: 1.2,
            maxLife: 1.2,
          });

          splitPartsRef.current.push({
            group: bottom,
            vel: botVel,
            rotVel: new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12),
            life: 1.2,
            maxLife: 1.2,
          });

          // Burst grain particles
          if (crop.type !== 'stone' && crop.type !== 'pest') {
            const burst = createGrainBurstParticles(crop.type, 26);
            burst.mesh.position.copy(crop.group.position);
            scene.add(burst.mesh);
            particlesRef.current.push({
              mesh: burst.mesh,
              velocities: burst.velocities,
              rotations: burst.rotations,
              life: 1.0,
              maxLife: 1.0,
            });
          }

          scene.remove(crop.group);
          continue;
        }

        // Apply physics
        crop.vel.addScaledVector(gravity, simDelta);
        crop.pos.addScaledVector(crop.vel, simDelta);
        crop.group.position.copy(crop.pos);

        crop.group.rotation.x += crop.rotVel.x * simDelta;
        crop.group.rotation.y += crop.rotVel.y * simDelta;
        crop.group.rotation.z += crop.rotVel.z * simDelta;

        // Check if dropped below bottom
        if (crop.pos.y < -7.5 && crop.vel.y < 0) {
          scene.remove(crop.group);
        } else {
          remainingCrops.push(crop);
        }
      }
      activeCropsRef.current = remainingCrops;

      // Update split parts
      const remSplit: SplitPart[] = [];
      for (const sp of splitPartsRef.current) {
        sp.life -= simDelta;
        if (sp.life <= 0) {
          scene.remove(sp.group);
        } else {
          sp.vel.addScaledVector(gravity, simDelta);
          sp.group.position.addScaledVector(sp.vel, simDelta);
          sp.group.rotation.x += sp.rotVel.x * simDelta;
          sp.group.rotation.y += sp.rotVel.y * simDelta;
          sp.group.rotation.z += sp.rotVel.z * simDelta;
          const alpha = sp.life / sp.maxLife;
          sp.group.scale.setScalar(Math.max(alpha * 0.85, 0.01));
          remSplit.push(sp);
        }
      }
      splitPartsRef.current = remSplit;

      // Update grain burst particles
      const remParticles: ParticleSystem[] = [];
      const dummy = new THREE.Object3D();
      for (const ps of particlesRef.current) {
        ps.life -= simDelta;
        if (ps.life <= 0) {
          scene.remove(ps.mesh);
        } else {
          const progress = 1 - ps.life / ps.maxLife;
          const count = ps.velocities.length;
          for (let i = 0; i < count; i++) {
            const v = ps.velocities[i];
            const r = ps.rotations[i];
            const px = v.x * progress;
            const py = v.y * progress - 9.8 * 0.5 * progress * progress;
            const pz = v.z * progress;

            dummy.position.set(px, py, pz);
            dummy.rotation.set(r.x * progress, r.y * progress, r.z * progress);
            const scale = Math.max(1 - progress, 0.05);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            ps.mesh.setMatrixAt(i, dummy.matrix);
          }
          ps.mesh.instanceMatrix.needsUpdate = true;
          remParticles.push(ps);
        }
      }
      particlesRef.current = remParticles;

      // Render 3D Scene
      renderer.render(scene, camera);

      // Render 2D Blade Swipe Trail and Juicy Paint Splatters on 2D Overlay
      if (trailCtx && trailCanvasRef.current) {
        trailCtx.clearRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);

        // 1. Render Juicy Paint Splatters (Blots & Droplets)
        const remainingSplats: SplatSystem[] = [];
        for (const splat of splatsRef.current) {
          splat.life -= delta;
          if (splat.life > 0) {
            const progress = 1 - splat.life / splat.maxLife;
            const fade = Math.pow(splat.life / splat.maxLife, 1.4);

            trailCtx.save();

            // Draw organic impact ink/juice blotches
            for (const blot of splat.blots) {
              trailCtx.save();
              trailCtx.translate(blot.x, blot.y);
              trailCtx.rotate(blot.rotation);
              trailCtx.fillStyle = blot.color;
              trailCtx.globalAlpha = blot.alpha * fade;
              trailCtx.shadowColor = splat.glowColor;
              trailCtx.shadowBlur = 14;

              trailCtx.beginPath();
              for (let vi = 0; vi < blot.points.length; vi++) {
                const pt = blot.points[vi];
                const grow = Math.min(1.0, progress * 4.0);
                const curRadius = pt.r * grow;
                const px = Math.cos(pt.angle) * curRadius;
                const py = Math.sin(pt.angle) * curRadius;
                if (vi === 0) trailCtx.moveTo(px, py);
                else trailCtx.lineTo(px, py);
              }
              trailCtx.closePath();
              trailCtx.fill();
              trailCtx.restore();
            }

            // Draw flying paint droplets with motion trails
            for (const d of splat.droplets) {
              d.x += d.vx * delta;
              d.y += d.vy * delta;
              // Air drag & gravity on droplets
              d.vx *= 0.94;
              d.vy += 320 * delta; // slight downward gravity for liquid feel

              const dropAlpha = d.alpha * fade;
              if (dropAlpha > 0.05) {
                trailCtx.save();
                trailCtx.fillStyle = d.color;
                trailCtx.globalAlpha = dropAlpha;
                trailCtx.shadowColor = splat.glowColor;
                trailCtx.shadowBlur = 8;

                // Tapered droplet stretched in movement direction
                const dropSpeed = Math.hypot(d.vx, d.vy);
                const dropAngle = Math.atan2(d.vy, d.vx);

                trailCtx.translate(d.x, d.y);
                trailCtx.rotate(dropAngle);

                trailCtx.beginPath();
                const stretch = Math.min(3.5, 1 + dropSpeed * 0.005);
                trailCtx.ellipse(0, 0, d.radius * stretch, d.radius * (1 - progress * 0.4), 0, 0, Math.PI * 2);
                trailCtx.fill();
                trailCtx.restore();
              }
            }

            trailCtx.restore();
            remainingSplats.push(splat);
          }
        }
        splatsRef.current = remainingSplats;

        // 2. Render Dynamic Organic Brush Swipe Trail (Tapered, fluid curved ribbon)
        const trailTime = now;
        trailPointsRef.current = trailPointsRef.current.filter((p) => trailTime - p.time < 220);

        const pts = trailPointsRef.current;
        if (pts.length > 2) {
          trailCtx.save();
          trailCtx.lineCap = 'round';
          trailCtx.lineJoin = 'round';

          // Convert points to 2D screen coordinates
          const screenPts = pts.map((p) => {
            const v = p.pos.clone().project(camera);
            return {
              x: ((v.x + 1) * trailCanvasRef.current!.width) / 2,
              y: ((-v.y + 1) * trailCanvasRef.current!.height) / 2,
              age: (trailTime - p.time) / 220,
              width: p.width,
            };
          });

          // Draw tapered fluid brush ribbon (outer aura)
          for (let i = 0; i < screenPts.length - 1; i++) {
            const p1 = screenPts[i];
            const p2 = screenPts[i + 1];
            const t = (p1.age + p2.age) / 2;
            const alpha = (1 - t) * (isFever ? 0.95 : 0.85);

            // Variable width based on speed and taper
            const baseW = isFever ? 28 : 22;
            const curWidth = Math.max(3, baseW * (1 - t) * (p1.width / 16));

            trailCtx.beginPath();
            trailCtx.moveTo(p1.x, p1.y);
            trailCtx.lineTo(p2.x, p2.y);
            trailCtx.strokeStyle = isFever
              ? `rgba(251, 191, 36, ${alpha})`
              : `rgba(224, 231, 255, ${alpha * 0.85})`;
            trailCtx.lineWidth = curWidth;
            trailCtx.shadowColor = isFever ? '#F59E0B' : '#60A5FA';
            trailCtx.shadowBlur = 18;
            trailCtx.stroke();
          }

          // Inner sharp crisp cut
          for (let i = 0; i < screenPts.length - 1; i++) {
            const p1 = screenPts[i];
            const p2 = screenPts[i + 1];
            const t = (p1.age + p2.age) / 2;
            const alpha = (1 - t);

            trailCtx.beginPath();
            trailCtx.moveTo(p1.x, p1.y);
            trailCtx.lineTo(p2.x, p2.y);
            trailCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            trailCtx.lineWidth = Math.max(2, 6 * (1 - t));
            trailCtx.shadowBlur = 0;
            trailCtx.stroke();
          }

          trailCtx.restore();
        }
      }
    };

    animFrameId = requestAnimationFrame(animate);

    // Pointer position updater
    const updatePointerPos = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      mouseNDC.set(x, y);

      raycaster.setFromCamera(mouseNDC, camera);
      const intersectPt = new THREE.Vector3();
      raycaster.ray.intersectPlane(gamePlane, intersectPt);

      if (intersectPt) {
        targetKnifePos.current.copy(intersectPt);

        const now = performance.now();

        if (lastMousePos.current) {
          const dt = Math.max((now - lastMousePos.current.time) / 1000, 0.001);
          const dx = intersectPt.x - lastMousePos.current.x;
          const dy = intersectPt.y - lastMousePos.current.y;
          knifeVelocity.current.set(dx / dt, dy / dt);

          const speed = knifeVelocity.current.length();
          if (speed > 28 && Math.random() < 0.25) {
            sound.playSwish(speed / 30);
          }

          // Dynamic brush width based on gesture speed
          const strokeWidth = Math.min(28, Math.max(12, speed * 0.45));
          trailPointsRef.current.push({
            pos: intersectPt.clone(),
            time: now,
            width: strokeWidth,
          });

          if (isDraggingRef.current && gameStateRef.current === 'PLAYING') {
            const p1 = new THREE.Vector2(lastMousePos.current.x, lastMousePos.current.y);
            const p2 = new THREE.Vector2(intersectPt.x, intersectPt.y);
            const segDir = p2.clone().sub(p1);
            const segLen = segDir.length();

            if (segLen > 0.05) {
              const segNorm = segDir.clone().normalize();

              for (const crop of activeCropsRef.current) {
                if (crop.sliced) continue;

                const cropPt = new THREE.Vector2(crop.pos.x, crop.pos.y);
                const toCrop = cropPt.clone().sub(p1);
                const proj = Math.max(0, Math.min(segLen, toCrop.dot(segNorm)));
                const closest = p1.clone().addScaledVector(segNorm, proj);
                const dist = cropPt.distanceTo(closest);

                if (dist < crop.radius) {
                  handleSliceCrop(crop, segNorm);
                }
              }
            }
          }
        } else {
          trailPointsRef.current.push({
            pos: intersectPt.clone(),
            time: now,
            width: 14,
          });
        }
        lastMousePos.current = { x: intersectPt.x, y: intersectPt.y, time: now };
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (gameStateRef.current === 'PAUSED') return;
      isDraggingRef.current = true;
      currentDragStrokeRef.current = { slicedCrops: [], points: [] };
      updatePointerPos(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (gameStateRef.current === 'PAUSED') return;
      updatePointerPos(e.clientX, e.clientY);
    };

    const finishStroke = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const sliced = currentDragStrokeRef.current.slicedCrops;
      const validCrops = sliced.filter((t) => t !== 'stone' && t !== 'pest');
      const count = validCrops.length;

      if (count >= 2) {
        const bonus = count === 2 ? 20 : count === 3 ? 50 : 100;
        sound.playCombo(count);
        onComboRef.current(count, bonus);
      }

      currentDragStrokeRef.current = { slicedCrops: [], points: [] };
    };

    const onPointerUp = () => {
      finishStroke();
    };

    const onPointerLeave = () => {
      finishStroke();
    };

    const container = containerRef.current;
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);

      scene.clear();
      renderer.dispose();
      sceneRef.current = null;
    };
  }, [handleSliceCrop]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair touch-none select-none overflow-hidden"
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* 2D Slice Trail & Splatter Canvas */}
      <canvas ref={trailCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none block z-10" />
    </div>
  );
};
