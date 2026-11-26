import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowHit, BowConfig, BowStats, GameMode, ArcheryTheme } from '../types';
import { archeryAudio } from '../utils/audio';
import { calculateBowStats } from '../utils/bowPresets';
import { Compass, RotateCcw, Crosshair, Award, Flame, Landmark, Clock, Target } from 'lucide-react';

interface ArcheryCanvasProps {
  bow: BowConfig;
  mode: GameMode;
  distance: number;
  onShotFired: (hit: ArrowHit) => void;
  onShotStarted: () => void;
  arrowHistory: ArrowHit[];
  onResetRound: () => void;
  onOpenModeSelection: () => void;
  isRoundActive: boolean;
  remainingSeconds: number;
  theme?: ArcheryTheme;
  onToggleTheme?: (theme: ArcheryTheme) => void;
}

interface WindState {
  speed: number;  // m/s (0 to 8)
  angle: number;  // radians (0 to 2PI)
}

interface FlightArrow {
  active: boolean;
  startX: number;
  startY: number;
  targetHitX: number; // canvas coord
  targetHitY: number; // canvas coord
  progress: number;   // 0 to 1
  speed: number;      // rate per frame
  relativeHitX: number; // -1 to 1 on target
  relativeHitY: number; // -1 to 1 on target
  score: number;
  isX: boolean;
}

export interface HorseTargetConfig {
  id: number;
  dist: number;
  label: string;
}

export const HORSE_TARGET_CONFIGS: HorseTargetConfig[] = [
  { id: 1, dist: 28, label: '제1 사목' },
  { id: 2, dist: 58, label: '제2 사목' },
  { id: 3, dist: 88, label: '제3 사목' },
];

export interface HorseTargetCalculatedState {
  id: number;
  label: string;
  dist: number;
  side: 'right' | 'left';
  relDist: number;
  targetRadius: number;
  targetCenterX: number;
  targetCenterY: number;
  opacity: number;
  inZone: boolean;
  hasPassed: boolean;
}

/**
 * Computes dynamic 3D target geometry during horseback gallop.
 * - Targets alternate strictly Left <-> Right for every sequential target.
 * - Approaching targets smoothly scale up from the horizon.
 * - Passed targets gracefully rush past to the side/rear, scaling up and fading out naturally.
 */
export function computeHorseTargetState(
  curDist: number,
  lap: number,
  width: number,
  height: number
): HorseTargetCalculatedState {
  let targetIndex = -1;
  let targetDist = 0;
  let relDist = 999;

  for (let i = 0; i < HORSE_TARGET_CONFIGS.length; i++) {
    const t = HORSE_TARGET_CONFIGS[i];
    const r = t.dist - curDist;
    // Keep target rendered until it has passed 13m behind the rider
    if (r > -13) {
      targetIndex = i;
      targetDist = t.dist;
      relDist = r;
      break;
    }
  }

  let totalIdx = 0;
  if (targetIndex !== -1) {
    totalIdx = (lap - 1) * HORSE_TARGET_CONFIGS.length + targetIndex;
  } else {
    // Rider near end of current 100m lap: prepare next lap's first target
    const first = HORSE_TARGET_CONFIGS[0];
    totalIdx = lap * HORSE_TARGET_CONFIGS.length;
    targetDist = 100 + first.dist;
    relDist = targetDist - curDist;
  }

  // Strict Alternating Left/Right side per target:
  // Target 1: Right, Target 2: Left, Target 3: Right, Target 4: Left, etc.
  const side: 'right' | 'left' = totalIdx % 2 === 0 ? 'right' : 'left';
  const sideDir = side === 'right' ? 1 : -1;
  const label = `제${(totalIdx % 3) + 1} 사목 (${side === 'right' ? '우측' : '좌측'})`;

  let targetRadius = 45;
  let targetCenterX = width * 0.5;
  let targetCenterY = height * 0.48;
  let opacity = 1;
  const hasPassed = relDist < 0;

  if (relDist >= 0) {
    // --- Approaching from the horizon (38m ~ 0m) ---
    const tProgress = Math.max(0, Math.min(1, 1 - (relDist / 38)));
    targetRadius = 24 + tProgress * 54; // Scales from 24px up to 78px
    // Widens outward toward rider's left or right lane
    targetCenterX = width * 0.5 + sideDir * (28 + Math.pow(tProgress, 1.35) * (width * 0.33));
    targetCenterY = height * 0.48 + tProgress * (height * 0.15);
    opacity = Math.min(1, 0.45 + tProgress * 0.55);
  } else {
    // --- Passing by and flying behind the rider (0m ~ -13m) ---
    // Smooth natural 3D fly-by: expands rapidly into peripheral view then fades behind
    const passRatio = Math.min(1, (-relDist) / 13);
    targetRadius = 78 + passRatio * 115; // Expands up to ~193px as it rushes by
    // Swings rapidly off-screen to the designated side
    targetCenterX = width * 0.5 + sideDir * (28 + (width * 0.33) + Math.pow(passRatio, 1.15) * (width * 0.48));
    targetCenterY = (height * 0.48 + height * 0.15) + Math.pow(passRatio, 1.25) * (height * 0.28);
    // Smooth cinematic opacity fade-out as target passes behind the camera
    opacity = Math.max(0, 1 - Math.pow(passRatio, 1.25));
  }

  // Optimal shooting zone: 3m to 24m ahead
  const inZone = relDist >= 3 && relDist <= 24;

  return {
    id: totalIdx + 1,
    label,
    dist: targetDist,
    side,
    relDist,
    targetRadius,
    targetCenterX,
    targetCenterY,
    opacity,
    inZone,
    hasPassed,
  };
}

export const ArcheryCanvas: React.FC<ArcheryCanvasProps> = ({
  bow,
  mode,
  distance,
  onShotFired,
  onShotStarted,
  arrowHistory,
  onResetRound,
  onOpenModeSelection,
  isRoundActive,
  remainingSeconds,
  theme = 'traditional',
  onToggleTheme,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stats = calculateBowStats(bow);
  const isTraditional = theme === 'traditional' || mode === 'horseback';

  // Aiming and drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawProgress, setDrawProgress] = useState<number>(0);
  const [fatigue, setFatigue] = useState<number>(0); // 0 to 1

  // Wind state
  const [wind, setWind] = useState<WindState>({ speed: 2.2, angle: Math.PI * 0.15 });

  // Moving target state (for 'moving_target' mode)
  const [targetOffset, setTargetOffset] = useState<number>(0);

  // Horseback Archery State
  const gallopDistRef = useRef<number>(0); // 0m to 100m track
  const gallopLapRef = useRef<number>(1);
  const lastHoofStepRef = useRef<number>(0);
  const lastHorseHudRef = useRef<number>(0);
  const [horsebackInfo, setHorsebackInfo] = useState<{
    dist: number;
    lap: number;
    targetName: string;
    side: 'right' | 'left';
    inZone: boolean;
    hasPassed: boolean;
    relDist: number;
  }>({
    dist: 0,
    lap: 1,
    targetName: '제1 사목 (우측)',
    side: 'right',
    inZone: false,
    hasPassed: false,
    relDist: 28,
  });

  // In-flight arrow
  const flightArrowRef = useRef<FlightArrow | null>(null);

  // Latest hit notification splash
  const [lastHitPopup, setLastHitPopup] = useState<{ score: number; isX: boolean; id: string; isTraditional?: boolean } | null>(null);

  // Aim point (normalized or canvas coords)
  const aimPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const drawStartTimeRef = useRef<number>(0);

  // Generate wind based on mode
  const refreshWind = useCallback(() => {
    const speed = 1.0 + Math.random() * 3.0; // 1.0 ~ 4.0 m/s
    const angle = Math.random() * Math.PI * 2;
    setWind({ speed: Number(speed.toFixed(1)), angle });
  }, []);

  // Set initial wind
  useEffect(() => {
    refreshWind();
  }, [refreshWind, distance]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      aimPosRef.current = { x: rect.width / 2, y: rect.height / 2 };
      mousePosRef.current = { x: rect.width / 2, y: rect.height / 2 };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Game Loop (Canvas Render & Physics)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let breathTime = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      breathTime += dt * 1.8;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const isHorseback = mode === 'horseback';
      const isTraditional = theme === 'traditional' || isHorseback;

      // Horseback galloping simulation physics
      let saddleBounceY = 0;
      let saddleBounceX = 0;
      let horseTargetState: HorseTargetCalculatedState | null = null;
      let horseRelDist = 28;
      let horseInZone = false;
      let activeHorseTargetName = '제1 사목 (우측 28m)';

      if (isHorseback) {
        const gallopSpeed = 10; // ~36 km/h (10 m/s)
        gallopDistRef.current += dt * gallopSpeed;
        if (gallopDistRef.current >= 100) {
          gallopDistRef.current = 0;
          gallopLapRef.current += 1;
        }

        // Hoofbeat sound synchronization
        if (time - lastHoofStepRef.current > 420) {
          lastHoofStepRef.current = time;
          archeryAudio.playGallopSound();
        }

        const curDist = gallopDistRef.current;
        horseTargetState = computeHorseTargetState(curDist, gallopLapRef.current, width, height);
        activeHorseTargetName = horseTargetState.label;
        horseRelDist = horseTargetState.relDist;
        horseInZone = horseTargetState.inZone;

        // Periodic HUD sync (every ~120ms)
        if (time - lastHorseHudRef.current > 120) {
          lastHorseHudRef.current = time;
          setHorsebackInfo({
            dist: Math.round(curDist),
            lap: gallopLapRef.current,
            targetName: horseTargetState.label,
            side: horseTargetState.side,
            inZone: horseTargetState.inZone,
            hasPassed: horseTargetState.hasPassed,
            relDist: Math.round(horseRelDist),
          });
        }

        // Rhythmic saddle & camera bounce
        const stridePhase = time * 0.009;
        saddleBounceY = Math.sin(stridePhase) * 6;
        saddleBounceX = Math.cos(stridePhase * 0.5) * 2;
      }

      // Target moving animation (for 'moving_target' mode)
      let currentTargetOffsetX = 0;
      if (mode === 'moving_target') {
        currentTargetOffsetX = Math.sin(time * 0.0015) * (width * 0.14);
        setTargetOffset(currentTargetOffsetX);
      }

      // Helper for dimensional rounded pill on canvas
      const drawRoundedPill = (
        rx: number,
        ry: number,
        rw: number,
        rh: number,
        rad: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(rx + rad, ry);
        ctx.lineTo(rx + rw - rad, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
        ctx.lineTo(rx + rw, ry + rh - rad);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
        ctx.lineTo(rx + rad, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
        ctx.lineTo(rx, ry + rad);
        ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
        ctx.closePath();
      };

      // Helper for 3D Wii-style tubular/sculpted strokes (supports any custom color cleanly)
      const strokeSculpted = (
        buildPath: () => void,
        color: string,
        lineW: number,
        withShadow = true
      ) => {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 1. Subtle drop shadow + clean ambient rim outline (keeps white/light bows readable)
        if (withShadow) {
          ctx.save();
          ctx.translate(1.5, 2);
          ctx.strokeStyle = 'rgba(15, 35, 75, 0.11)';
          ctx.lineWidth = lineW + 2.5;
          buildPath();
          ctx.stroke();
          ctx.restore();
        }

        ctx.strokeStyle = 'rgba(15, 35, 75, 0.20)';
        ctx.lineWidth = lineW + 1.8;
        buildPath();
        ctx.stroke();

        // 2. Base material coat
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        buildPath();
        ctx.stroke();

        // 3. Gentle lower-right 3D cylindrical shade band
        ctx.save();
        ctx.translate(lineW * 0.12, lineW * 0.12);
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.13)';
        ctx.lineWidth = lineW * 0.62;
        buildPath();
        ctx.stroke();
        ctx.restore();

        // 4. Upper-left lit body restore
        ctx.save();
        ctx.translate(-lineW * 0.09, -lineW * 0.09);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW * 0.62;
        buildPath();
        ctx.stroke();
        ctx.restore();

        // 5. Soft satin specular highlight ridge
        ctx.save();
        ctx.translate(-lineW * 0.20, -lineW * 0.20);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
        ctx.lineWidth = Math.max(1.2, lineW * 0.14);
        buildPath();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
      };

      // 1. Draw Archery Range Background (Traditional Joseon vs Wii Sports Resort Olympic)
      const horizonY = height * 0.55;
      if (isTraditional) {
        // --- Traditional Joseon Archery Range (국궁장 풍락헌 & Wii Resort 산수화) ---
        const joseonSky = ctx.createLinearGradient(0, 0, 0, horizonY);
        joseonSky.addColorStop(0, '#0284c7');
        joseonSky.addColorStop(0.4, '#7dd3fc');
        joseonSky.addColorStop(0.78, '#fde68a');
        joseonSky.addColorStop(1, '#fef9c3');
        ctx.fillStyle = joseonSky;
        ctx.fillRect(0, 0, width, horizonY);

        // Warm Morning Sun with multi-ring glow
        ctx.save();
        const sunX = width * 0.26;
        const sunY = height * 0.19;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 95);
        sunGlow.addColorStop(0, '#ffffff');
        sunGlow.addColorStop(0.22, 'rgba(254, 240, 138, 0.92)');
        sunGlow.addColorStop(0.55, 'rgba(253, 186, 116, 0.35)');
        sunGlow.addColorStop(1, 'rgba(253, 186, 116, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 95, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Volumetric sunlit Joseon clouds
        const drawSoftCloud = (cx: number, cy: number, s: number) => {
          ctx.save();
          ctx.fillStyle = 'rgba(254, 243, 199, 0.65)';
          ctx.beginPath();
          ctx.arc(cx, cy + 5 * s, 20 * s, 0, Math.PI * 2);
          ctx.arc(cx + 22 * s, cy + 2 * s, 23 * s, 0, Math.PI * 2);
          ctx.arc(cx + 44 * s, cy + 6 * s, 17 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          ctx.arc(cx, cy, 20 * s, 0, Math.PI * 2);
          ctx.arc(cx + 22 * s, cy - 6 * s, 24 * s, 0, Math.PI * 2);
          ctx.arc(cx + 44 * s, cy + 1 * s, 17 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };
        const jCloudShift = (time * 0.005) % (width + 220);
        drawSoftCloud(((width * 0.55 + jCloudShift) % (width + 220)) - 110, height * 0.14, 0.9);
        drawSoftCloud(((width * 0.1 + jCloudShift * 0.6) % (width + 220)) - 110, height * 0.24, 0.65);

        // Layer 1: Distant atmospheric Korean mountains with sunlit ridge gradient
        const farMtGrad = ctx.createLinearGradient(0, height * 0.32, 0, horizonY);
        farMtGrad.addColorStop(0, '#60a5fa');
        farMtGrad.addColorStop(0.55, '#93c5fd');
        farMtGrad.addColorStop(1, '#dbeafe');
        ctx.fillStyle = farMtGrad;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.52);
        ctx.lineTo(width * 0.16, height * 0.37);
        ctx.lineTo(width * 0.37, height * 0.45);
        ctx.lineTo(width * 0.58, height * 0.33);
        ctx.lineTo(width * 0.79, height * 0.43);
        ctx.lineTo(width, height * 0.35);
        ctx.lineTo(width, horizonY);
        ctx.lineTo(0, horizonY);
        ctx.fill();

        // Layer 2: Midground green-slate pine hills
        const midMtGrad = ctx.createLinearGradient(0, height * 0.40, 0, horizonY);
        midMtGrad.addColorStop(0, '#1e6b52');
        midMtGrad.addColorStop(0.6, '#15803d');
        midMtGrad.addColorStop(1, '#4ade80');
        ctx.fillStyle = midMtGrad;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width * 0.12, height * 0.44);
        ctx.lineTo(width * 0.32, height * 0.48);
        ctx.lineTo(width * 0.65, height * 0.41);
        ctx.lineTo(width * 0.88, height * 0.48);
        ctx.lineTo(width, height * 0.43);
        ctx.lineTo(width, horizonY);
        ctx.fill();

        // Horizon morning mist band
        const mistGrad = ctx.createLinearGradient(0, horizonY - 22, 0, horizonY);
        mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        mistGrad.addColorStop(1, 'rgba(255, 251, 235, 0.55)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, horizonY - 22, width, 22);

        // Sculpted 3D Joseon Pine Trees (소나무 / 낙락장송)
        const drawPine = (px: number, py: number, scale: number) => {
          ctx.save();
          // Ground shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.beginPath();
          ctx.ellipse(px + 6 * scale, py + 2, 18 * scale, 4 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Textured trunk + sunlit rim
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 4.5 * scale;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo(px + 8 * scale, py - 20 * scale, px + 4 * scale, py - 40 * scale);
          ctx.stroke();

          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 1.8 * scale;
          ctx.beginPath();
          ctx.moveTo(px - 1 * scale, py);
          ctx.quadraticCurveTo(px + 6.5 * scale, py - 20 * scale, px + 3 * scale, py - 40 * scale);
          ctx.stroke();

          // 3D layered foliage puffs (shadow base -> midtone -> sunlit cap)
          const puffs = [
            { dx: -16, dy: -34, r: 10 },
            { dx: -4, dy: -41, r: 12 },
            { dx: 10, dy: -36, r: 11 },
            { dx: 20, dy: -31, r: 9 },
          ];
          puffs.forEach(p => {
            const cx = px + p.dx * scale;
            const cy = py + p.dy * scale;
            const cr = p.r * scale;
            const pGrad = ctx.createRadialGradient(cx - cr * 0.3, cy - cr * 0.35, cr * 0.15, cx, cy, cr);
            pGrad.addColorStop(0, '#4ade80');
            pGrad.addColorStop(0.55, '#16a34a');
            pGrad.addColorStop(1, '#14532d');
            ctx.fillStyle = pGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        };

        drawPine(width * 0.08, height * 0.54, 0.95);
        drawPine(width * 0.16, height * 0.545, 0.72);
        drawPine(width * 0.87, height * 0.535, 0.88);

        // Dimensional Joseon Archery Pavilion (국궁 사정 射亭 - 풍락헌 豊樂軒)
        ctx.save();
        const pavX = width * 0.72;
        const pavY = height * 0.44;
        const pavW = 78;

        // Pavilion shadow on turf
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(pavX + pavW * 0.5, pavY + 33, pavW * 0.62, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone Foundation + Wood Platform
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(pavX - 7, pavY + 29, pavW + 14, 5);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(pavX - 5, pavY + 24, pavW + 10, 6);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pavX - 5, pavY + 24, pavW + 10, 2);

        // 3D Red Pillars (단청 기둥)
        [0, 0.33, 0.66, 1].forEach(ratio => {
          const colX = pavX + pavW * ratio;
          const pGrad = ctx.createLinearGradient(colX, 0, colX + 5, 0);
          pGrad.addColorStop(0, '#f87171');
          pGrad.addColorStop(0.5, '#dc2626');
          pGrad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = pGrad;
          ctx.fillRect(colX, pavY + 8, 5, 17);
        });

        // Dancheong brackets (단청 공포)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(pavX - 4, pavY + 5, pavW + 8, 4);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pavX - 4, pavY + 5, pavW + 8, 1.5);

        // Curved 3D Hanok Roof (기와 지붕)
        const roofGrad = ctx.createLinearGradient(0, pavY - 12, 0, pavY + 8);
        roofGrad.addColorStop(0, '#475569');
        roofGrad.addColorStop(0.6, '#1e293b');
        roofGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = roofGrad;
        ctx.beginPath();
        ctx.moveTo(pavX - 15, pavY + 6);
        ctx.quadraticCurveTo(pavX + pavW * 0.5, pavY - 15, pavX + pavW + 15, pavY + 6);
        ctx.lineTo(pavX + pavW + 10, pavY + 8);
        ctx.lineTo(pavX - 10, pavY + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pavX - 13, pavY + 5);
        ctx.quadraticCurveTo(pavX + pavW * 0.5, pavY - 14, pavX + pavW + 13, pavY + 5);
        ctx.stroke();

        // Hanging Plaque (현판: 풍락헌)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(pavX + pavW * 0.5 - 13, pavY + 9, 26, 7.5);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(pavX + pavW * 0.5 - 13, pavY + 9, 26, 7.5);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 5.5px "Noto Serif KR", serif';
        ctx.textAlign = 'center';
        ctx.fillText('豊樂軒', pavX + pavW * 0.5, pavY + 14.8);
        ctx.restore();

        // Glossy Five-Direction Flags (오방기)
        const drawFlag = (fx: number, fy: number, col: string) => {
          ctx.save();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(fx, fy - 33);
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(fx, fy - 33, 2.8, 0, Math.PI * 2);
          ctx.fill();

          const wave = Math.sin(time * 0.008 + fx) * 5;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(fx, fy - 31);
          ctx.quadraticCurveTo(fx + 14, fy - 31 + wave, fx + 27, fy - 27 + wave * 0.5);
          ctx.lineTo(fx + 27, fy - 14 + wave * 0.5);
          ctx.quadraticCurveTo(fx + 14, fy - 18 + wave, fx, fy - 18);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.18)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        };

        drawFlag(width * 0.22, height * 0.55, '#2563eb');
        drawFlag(width * 0.32, height * 0.55, '#f8fafc');
        drawFlag(width * 0.65, height * 0.55, '#dc2626');
        drawFlag(width * 0.78, height * 0.55, '#eab308');
      } else {
        // --- Nintendo Wii Sports Resort (Wuhu Island) Archery Arena ---
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.45, '#38bdf8');
        skyGrad.addColorStop(0.82, '#bae6fd');
        skyGrad.addColorStop(1, '#f0f9ff');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, horizonY);

        // Bright Resort Sun Glow (upper-left directional lighting)
        ctx.save();
        const sunX = width * 0.16;
        const sunY = height * 0.13;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 110);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.18, 'rgba(254, 249, 195, 0.9)');
        sunGrad.addColorStop(0.55, 'rgba(186, 230, 253, 0.35)');
        sunGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 110, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Volumetric 3D Fluffy Wii Sports Resort Clouds (shadow belly + bright puffy crown)
        const drawResortCloud = (cx: number, cy: number, s: number) => {
          ctx.save();
          // Pale sky-blue shaded belly
          ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
          ctx.beginPath();
          ctx.arc(cx, cy + 5 * s, 21 * s, 0, Math.PI * 2);
          ctx.arc(cx + 23 * s, cy + 2 * s, 25 * s, 0, Math.PI * 2);
          ctx.arc(cx + 48 * s, cy + 5 * s, 19 * s, 0, Math.PI * 2);
          ctx.arc(cx - 21 * s, cy + 7 * s, 15 * s, 0, Math.PI * 2);
          ctx.fill();

          // Bright sunlit white cloud puffs
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, cy, 22 * s, 0, Math.PI * 2);
          ctx.arc(cx + 22 * s, cy - 8 * s, 26 * s, 0, Math.PI * 2);
          ctx.arc(cx + 48 * s, cy, 20 * s, 0, Math.PI * 2);
          ctx.arc(cx - 22 * s, cy + 3 * s, 16 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };
        const cloudShift = (time * 0.008) % (width + 240);
        drawResortCloud(((width * 0.20 + cloudShift) % (width + 240)) - 120, height * 0.16, 1.05);
        drawResortCloud(((width * 0.66 + cloudShift * 0.7) % (width + 240)) - 120, height * 0.12, 0.82);
        drawResortCloud(((width * 0.44 + cloudShift * 0.5) % (width + 240)) - 120, height * 0.24, 0.64);

        // Far Wuhu Island Volcano / Mountain Range with atmospheric gradient
        const farHillsGrad = ctx.createLinearGradient(0, height * 0.36, 0, horizonY);
        farHillsGrad.addColorStop(0, '#60a5fa');
        farHillsGrad.addColorStop(0.6, '#93c5fd');
        farHillsGrad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = farHillsGrad;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.50);
        ctx.lineTo(width * 0.14, height * 0.39);
        ctx.lineTo(width * 0.33, height * 0.46);
        ctx.lineTo(width * 0.54, height * 0.36);
        ctx.lineTo(width * 0.74, height * 0.45);
        ctx.lineTo(width, height * 0.39);
        ctx.lineTo(width, horizonY);
        ctx.lineTo(0, horizonY);
        ctx.fill();

        // Midground Sunlit Emerald Hills
        const midHillsGrad = ctx.createLinearGradient(0, height * 0.43, 0, horizonY);
        midHillsGrad.addColorStop(0, '#4ade80');
        midHillsGrad.addColorStop(0.55, '#22c55e');
        midHillsGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = midHillsGrad;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.53);
        ctx.quadraticCurveTo(width * 0.22, height * 0.44, width * 0.48, height * 0.50);
        ctx.quadraticCurveTo(width * 0.76, height * 0.43, width, height * 0.51);
        ctx.lineTo(width, horizonY);
        ctx.lineTo(0, horizonY);
        ctx.fill();

        // Low distant shrub belt behind stadium fence
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= width; x += 24) {
          const h = 6 + Math.sin(x * 0.04) * 3 + Math.cos(x * 0.09) * 2.5;
          ctx.lineTo(x, horizonY - h);
        }
        ctx.lineTo(width, horizonY);
        ctx.closePath();
        ctx.fill();

        // Natural Varied Park & Evergreen Trees behind the Olympic Arena
        const drawBroadleafTree = (tx: number, baseY: number, s: number) => {
          ctx.save();
          // Tapered wooden trunk + Y-branching
          ctx.fillStyle = '#5c2d16';
          ctx.beginPath();
          ctx.moveTo(tx - 3.5 * s, baseY);
          ctx.lineTo(tx - 2 * s, baseY - 22 * s);
          ctx.lineTo(tx + 2 * s, baseY - 22 * s);
          ctx.lineTo(tx + 3.5 * s, baseY);
          ctx.closePath();
          ctx.fill();

          // Sunlit bark side
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tx - 2 * s, baseY - 20 * s, 1.8 * s, 20 * s);

          // Supporting branches
          ctx.strokeStyle = '#5c2d16';
          ctx.lineWidth = 2.2 * s;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tx, baseY - 16 * s);
          ctx.lineTo(tx - 8 * s, baseY - 25 * s);
          ctx.moveTo(tx, baseY - 18 * s);
          ctx.lineTo(tx + 7 * s, baseY - 26 * s);
          ctx.stroke();

          // Cohesive organic multi-lobed leafy crown (shadow silhouette -> main foliage -> sunlit top)
          const lobes = [
            { dx: -10, dy: -26, r: 9.5 },
            { dx: 10, dy: -25, r: 9 },
            { dx: -5, dy: -34, r: 10.5 },
            { dx: 6, dy: -33, r: 10 },
            { dx: 0, dy: -28, r: 11 },
          ];
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          lobes.forEach(l => {
            ctx.moveTo(tx + l.dx * s + l.r * s, baseY + l.dy * s + 2 * s);
            ctx.arc(tx + l.dx * s, baseY + l.dy * s + 2 * s, l.r * s, 0, Math.PI * 2);
          });
          ctx.fill();

          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          lobes.forEach(l => {
            ctx.moveTo(tx + l.dx * s + l.r * s, baseY + l.dy * s);
            ctx.arc(tx + l.dx * s, baseY + l.dy * s, l.r * s, 0, Math.PI * 2);
          });
          ctx.fill();

          // Upper-left sunlit leaf clusters
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(tx - 6 * s, baseY - 34 * s, 7.5 * s, 0, Math.PI * 2);
          ctx.arc(tx + 3 * s, baseY - 35 * s, 6.5 * s, 0, Math.PI * 2);
          ctx.arc(tx - 10 * s, baseY - 27 * s, 5.5 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        const drawEvergreenTree = (tx: number, baseY: number, s: number) => {
          ctx.save();
          // Trunk
          ctx.fillStyle = '#451a03';
          ctx.fillRect(tx - 2.5 * s, baseY - 12 * s, 5 * s, 12 * s);

          // 3 Stacked conifer bough tiers
          const tiers = [
            { y: -10, w: 16, h: 17 },
            { y: -21, w: 13, h: 16 },
            { y: -32, w: 9.5, h: 15 },
          ];
          tiers.forEach(t => {
            // Left sunlit half
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.moveTo(tx, baseY + (t.y - t.h) * s);
            ctx.lineTo(tx - t.w * s, baseY + t.y * s);
            ctx.quadraticCurveTo(tx - t.w * 0.4 * s, baseY + (t.y + 2) * s, tx, baseY + (t.y + 1) * s);
            ctx.closePath();
            ctx.fill();

            // Right shaded half
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.moveTo(tx, baseY + (t.y - t.h) * s);
            ctx.lineTo(tx + t.w * s, baseY + t.y * s);
            ctx.quadraticCurveTo(tx + t.w * 0.4 * s, baseY + (t.y + 2) * s, tx, baseY + (t.y + 1) * s);
            ctx.closePath();
            ctx.fill();
          });
          ctx.restore();
        };

        // Irregular natural tree placement along the arena perimeter
        const parkTrees: Array<{ xRatio: number; type: 'broad' | 'pine'; scale: number }> = [
          { xRatio: 0.04, type: 'broad', scale: 1.15 },
          { xRatio: 0.10, type: 'pine', scale: 1.0 },
          { xRatio: 0.16, type: 'broad', scale: 0.9 },
          { xRatio: 0.25, type: 'pine', scale: 0.85 },
          { xRatio: 0.34, type: 'broad', scale: 0.8 },
          { xRatio: 0.65, type: 'broad', scale: 0.82 },
          { xRatio: 0.74, type: 'pine', scale: 0.9 },
          { xRatio: 0.82, type: 'broad', scale: 1.05 },
          { xRatio: 0.90, type: 'pine', scale: 1.1 },
          { xRatio: 0.96, type: 'broad', scale: 0.95 },
        ];
        parkTrees.forEach(tree => {
          const tx = width * tree.xRatio;
          if (tree.type === 'broad') {
            drawBroadleafTree(tx, horizonY - 3, tree.scale);
          } else {
            drawEvergreenTree(tx, horizonY - 3, tree.scale);
          }
        });

        // Clean Olympic Stadium Low Perimeter Board (blue & white arena trim)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, horizonY - 5, width, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, horizonY - 6, width, 1.5);
      }

      // Ground & Track Rendering
      if (isHorseback) {
        // --- Horseback Archery Dirt Gallop Track (마상궁술 기사 주로) ---
        // Sunlit turf shoulders on outer edges + graded dirt track in center
        const shoulderGrad = ctx.createLinearGradient(0, height * 0.54, 0, height);
        shoulderGrad.addColorStop(0, '#16a34a');
        shoulderGrad.addColorStop(1, '#4ade80');
        ctx.fillStyle = shoulderGrad;
        ctx.fillRect(0, height * 0.54, width, height * 0.46);

        // Central Dirt Gallop Track in perspective trapezoid
        const dirtGrad = ctx.createLinearGradient(0, height * 0.54, 0, height);
        dirtGrad.addColorStop(0, '#78350f');
        dirtGrad.addColorStop(0.35, '#a16207');
        dirtGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = dirtGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 42, height * 0.54);
        ctx.lineTo(width * 0.5 + 42, height * 0.54);
        ctx.lineTo(width * 0.98, height);
        ctx.lineTo(width * 0.02, height);
        ctx.closePath();
        ctx.fill();

        // Lighter worn center gallop path
        const centerPathGrad = ctx.createLinearGradient(0, height * 0.54, 0, height);
        centerPathGrad.addColorStop(0, 'rgba(253, 224, 71, 0.14)');
        centerPathGrad.addColorStop(1, 'rgba(254, 240, 138, 0.28)');
        ctx.fillStyle = centerPathGrad;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 16, height * 0.54);
        ctx.lineTo(width * 0.5 + 16, height * 0.54);
        ctx.lineTo(width * 0.72, height);
        ctx.lineTo(width * 0.28, height);
        ctx.closePath();
        ctx.fill();

        // 3D Wooden Fence Rails (top highlight + shadow edge)
        const trackSpeed = (time * 0.04) % 40;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 38, height * 0.54);
        ctx.lineTo(width * 0.04, height);
        ctx.moveTo(width * 0.5 + 38, height * 0.54);
        ctx.lineTo(width * 0.96, height);
        ctx.stroke();

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 38, height * 0.54 - 1);
        ctx.lineTo(width * 0.04, height - 1);
        ctx.moveTo(width * 0.5 + 38, height * 0.54 - 1);
        ctx.lineTo(width * 0.96, height - 1);
        ctx.stroke();

        // Rushing 3D Wooden Fence Posts
        for (let i = 0; i < 7; i++) {
          const depth = ((i * 35 + trackSpeed) % 240) / 240;
          const py = height * 0.54 + Math.pow(depth, 1.8) * (height * 0.46);
          const lx = width * 0.5 - 38 - (width * 0.46) * depth;
          const rx = width * 0.5 + 38 + (width * 0.46) * depth;
          const postH = 8 + depth * 40;
          const postW = Math.max(3, 5 * (0.4 + depth * 0.9));

          // Post shadow
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.fillRect(lx + 2, py - 2, postW + 4, 4);
          ctx.fillRect(rx + 2, py - 2, postW + 4, 4);

          // Left & Right 3D Post
          [lx, rx].forEach(px => {
            ctx.fillStyle = '#451a03';
            ctx.fillRect(px - postW / 2, py - postH, postW, postH);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(px - postW / 2, py - postH, postW * 0.45, postH);
          });
        }

        // Warm Gallop Dust Puffs
        ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
        for (let d = 0; d < 8; d++) {
          const dx = width * 0.5 + Math.sin(time * 0.01 + d) * 120;
          const dy = height - 14 + Math.cos(time * 0.015 + d) * 10;
          ctx.beginPath();
          ctx.arc(dx, dy, 14 + (d % 3) * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // --- Wii Sports Resort 3D Perspective Mowed Lawn ---
        const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
        if (isTraditional) {
          groundGrad.addColorStop(0, '#15803d');
          groundGrad.addColorStop(0.45, '#16a34a');
          groundGrad.addColorStop(1, '#22c55e');
        } else {
          groundGrad.addColorStop(0, '#16a34a');
          groundGrad.addColorStop(0.4, '#22c55e');
          groundGrad.addColorStop(1, '#4ade80');
        }
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, horizonY, width, height - horizonY);

        // Alternating perspective mowed turf stripes converging toward vanishing point
        const stripeCount = 12;
        for (let s = -stripeCount; s <= stripeCount; s += 2) {
          const topX1 = width * 0.5 + s * 18;
          const topX2 = width * 0.5 + (s + 1) * 18;
          const botX1 = width * 0.5 + s * 115;
          const botX2 = width * 0.5 + (s + 1) * 115;
          ctx.fillStyle = isTraditional ? 'rgba(254, 240, 138, 0.06)' : 'rgba(255, 255, 255, 0.09)';
          ctx.beginPath();
          ctx.moveTo(topX1, horizonY);
          ctx.lineTo(topX2, horizonY);
          ctx.lineTo(botX2, height);
          ctx.lineTo(botX1, height);
          ctx.closePath();
          ctx.fill();
        }

        // Crisp white stadium lane lines
        ctx.strokeStyle = isTraditional ? 'rgba(254, 240, 138, 0.45)' : 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, horizonY);
        ctx.lineTo(width * 0.5, height);
        ctx.moveTo(width * 0.5 - 32, horizonY);
        ctx.lineTo(width * 0.08, height);
        ctx.moveTo(width * 0.5 + 32, horizonY);
        ctx.lineTo(width * 0.92, height);
        ctx.stroke();

        // Crisp Distance Markers with Wii pill badges
        const distMarkers = [
          { d: 70, y: height * 0.558, w: 96 },
          { d: 50, y: height * 0.595, w: 165 },
          { d: 30, y: height * 0.658, w: 265 },
          { d: 18, y: height * 0.76, w: 410 },
        ];
        distMarkers.forEach(m => {
          ctx.strokeStyle = isTraditional ? 'rgba(254, 240, 138, 0.35)' : 'rgba(255, 255, 255, 0.42)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(width * 0.5 - m.w / 2, m.y);
          ctx.lineTo(width * 0.5 + m.w / 2, m.y);
          ctx.stroke();

          const lx = width * 0.5 - m.w / 2 - 20;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          drawRoundedPill(lx - 15, m.y - 7, 30, 14, 7);
          ctx.fill();
          ctx.fillStyle = '#0369a1';
          ctx.font = 'bold 9px "Outfit", "Noto Sans KR", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${m.d}m`, lx, m.y + 3);
        });
      }

      // 2. Target Position & Geometry Calculation
      let targetCenterX = width * 0.5 + currentTargetOffsetX;
      let targetCenterY = height * 0.48;
      let targetRadius = 45;
      let targetOpacity = 1;

      if (isHorseback && horseTargetState) {
        targetRadius = horseTargetState.targetRadius;
        targetCenterX = horseTargetState.targetCenterX;
        targetCenterY = horseTargetState.targetCenterY;
        targetOpacity = horseTargetState.opacity;
      } else {
        const distRatio = (70 - distance) / (70 - 18);
        targetRadius = 38 + distRatio * 52;
        targetCenterY = height * 0.48 - distRatio * 15;
      }

      // 3. Draw 3D Archery Target & Stand
      ctx.save();
      if (isHorseback) {
        ctx.globalAlpha = targetOpacity;
      }

      // Soft elliptical ground shadow beneath tripod
      const groundShadowGrad = ctx.createRadialGradient(
        targetCenterX + 4,
        targetCenterY + targetRadius * 2.1,
        2,
        targetCenterX + 4,
        targetCenterY + targetRadius * 2.1,
        targetRadius * 1.25
      );
      groundShadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.34)');
      groundShadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = groundShadowGrad;
      ctx.beginPath();
      ctx.ellipse(targetCenterX + 4, targetCenterY + targetRadius * 2.1, targetRadius * 1.25, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3D Shaded Wooden Tripod Stand
      const drawWoodLeg = (x1: number, y1: number, x2: number, y2: number, w: number) => {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = w + 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = Math.max(1, w * 0.32);
        ctx.beginPath();
        ctx.moveTo(x1 - 0.8, y1);
        ctx.lineTo(x2 - 0.8, y2);
        ctx.stroke();
        ctx.restore();
      };
      drawWoodLeg(targetCenterX, targetCenterY + targetRadius * 0.45, targetCenterX, targetCenterY + targetRadius * 1.95, 4.5);
      drawWoodLeg(targetCenterX - targetRadius * 0.38, targetCenterY + targetRadius * 0.65, targetCenterX - targetRadius * 0.92, targetCenterY + targetRadius * 2.1, 5.5);
      drawWoodLeg(targetCenterX + targetRadius * 0.38, targetCenterY + targetRadius * 0.65, targetCenterX + targetRadius * 0.92, targetCenterY + targetRadius * 2.1, 5.5);

      // Target Backing (3D Physical Depth & Bevel)
      if (isTraditional) {
        // 3D Thickness Side Extrusion
        const bx = targetCenterX - targetRadius * 1.18;
        const by = targetCenterY - targetRadius * 1.18;
        const bw = targetRadius * 2.36;
        ctx.fillStyle = '#271206';
        drawRoundedPill(bx + 5, by + 6, bw, bw, 8);
        ctx.fill();

        // Main Wood Board Frame
        const woodGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bw);
        woodGrad.addColorStop(0, '#92400e');
        woodGrad.addColorStop(0.5, '#78350f');
        woodGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = woodGrad;
        drawRoundedPill(bx, by, bw, bw, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brass corner braces
        ctx.fillStyle = '#fbbf24';
        const cr = targetRadius * 1.18;
        ctx.fillRect(targetCenterX - cr + 2, targetCenterY - cr + 2, 9, 9);
        ctx.fillRect(targetCenterX + cr - 11, targetCenterY - cr + 2, 9, 9);
        ctx.fillRect(targetCenterX - cr + 2, targetCenterY + cr - 11, 9, 9);
        ctx.fillRect(targetCenterX + cr - 11, targetCenterY + cr - 11, 9, 9);

        // White parchment target surface
        ctx.fillStyle = '#fefce8';
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 1.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        const joseonRings = [
          { r: 0.9, col: '#18181b' },
          { r: 0.72, col: '#1d4ed8' },
          { r: 0.48, col: '#f8fafc' },
          { r: 0.25, col: '#dc2626' },
        ];
        joseonRings.forEach(item => {
          ctx.fillStyle = item.col;
          ctx.beginPath();
          ctx.arc(targetCenterX, targetCenterY, targetRadius * item.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = item.col === '#18181b' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Golden Inner Center
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(targetCenterX - 3.5, targetCenterY);
        ctx.lineTo(targetCenterX + 3.5, targetCenterY);
        ctx.moveTo(targetCenterX, targetCenterY - 3.5);
        ctx.lineTo(targetCenterX, targetCenterY + 3.5);
        ctx.stroke();

        // Directional 3D Lighting Sheen over Traditional Target Face
        const sheenGrad = ctx.createRadialGradient(
          targetCenterX - targetRadius * 0.35,
          targetCenterY - targetRadius * 0.35,
          targetRadius * 0.1,
          targetCenterX,
          targetCenterY,
          targetRadius * 1.15
        );
        sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        sheenGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
        ctx.fillStyle = sheenGrad;
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 1.04, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Olympic 3D Foam/Straw Boss Target Drum
        // 3D cylindrical drum depth extrusion behind face
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(targetCenterX + 5, targetCenterY + 5, targetRadius * 1.12, 0, Math.PI * 2);
        ctx.fill();

        // Outer white Wii ring rim
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 1.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Straw boss bevel rim
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 1.06, 0, Math.PI * 2);
        ctx.fill();

        const ringColors = [
          { r: 1.0, col: '#f8fafc' },
          { r: 0.8, col: '#1e293b' },
          { r: 0.6, col: '#0ea5e9' },
          { r: 0.4, col: '#ef4444' },
          { r: 0.2, col: '#facc15' },
        ];
        ringColors.forEach(item => {
          ctx.fillStyle = item.col;
          ctx.beginPath();
          ctx.arc(targetCenterX, targetCenterY, targetRadius * item.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = item.col === '#1e293b' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        for (let i = 1; i <= 10; i++) {
          const rFraction = (11 - i) / 10;
          ctx.beginPath();
          ctx.arc(targetCenterX, targetCenterY, targetRadius * rFraction, 0, Math.PI * 2);
          ctx.strokeStyle = i >= 3 && i <= 4 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.22)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Inner X-Ring
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 0.05, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Subtle Wii 3D Top-Left Specular Sheen + Bottom-Right Shading
        const targetSheen = ctx.createRadialGradient(
          targetCenterX - targetRadius * 0.35,
          targetCenterY - targetRadius * 0.35,
          targetRadius * 0.08,
          targetCenterX,
          targetCenterY,
          targetRadius * 1.12
        );
        targetSheen.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
        targetSheen.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
        targetSheen.addColorStop(1, 'rgba(15, 23, 42, 0.16)');
        ctx.fillStyle = targetSheen;
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Horseback Optimal Firing Zone Halo Indicator (Wii Glossy Badge)
      if (isHorseback && horseInZone) {
        const pulse = (Math.sin(time * 0.015) + 1) * 0.5;
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.45 + pulse * 0.5})`;
        ctx.lineWidth = 3.5 + pulse * 2;
        ctx.beginPath();
        ctx.arc(targetCenterX, targetCenterY, targetRadius * (1.2 + pulse * 0.15), 0, Math.PI * 2);
        ctx.stroke();

        const bx = targetCenterX - 58;
        const by = targetCenterY - targetRadius * 1.48 - 14;
        const badgeGrad = ctx.createLinearGradient(0, by, 0, by + 22);
        badgeGrad.addColorStop(0, '#4ade80');
        badgeGrad.addColorStop(1, '#16a34a');
        ctx.fillStyle = badgeGrad;
        drawRoundedPill(bx, by, 116, 22, 11);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Outfit", "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ 사격 적기 (${Math.max(0, Math.round(horseRelDist))}m)`, targetCenterX, by + 14.5);
      } else if (isHorseback && horseTargetState?.hasPassed) {
        const bx = targetCenterX - 60;
        const by = targetCenterY - targetRadius * 1.32 - 14;
        const badgeGrad = ctx.createLinearGradient(0, by, 0, by + 22);
        badgeGrad.addColorStop(0, '#fb923c');
        badgeGrad.addColorStop(1, '#dc2626');
        ctx.fillStyle = badgeGrad;
        drawRoundedPill(bx, by, 120, 22, 11);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Outfit", "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💨 과녁 통과 (배사 구역)', targetCenterX, by + 14.5);
      }

      // Wind Flag on top of target
      const flagX = targetCenterX;
      const flagY = targetCenterY - targetRadius * 1.1;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(flagX, flagY);
      ctx.lineTo(flagX, flagY - 25);
      ctx.stroke();

      const flagWave = Math.sin(time * 0.008 * (wind.speed + 1)) * 4;
      const windDirX = Math.cos(wind.angle);
      ctx.fillStyle = isTraditional ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(flagX, flagY - 25);
      ctx.quadraticCurveTo(
        flagX + windDirX * 16,
        flagY - 25 + flagWave,
        flagX + windDirX * 26,
        flagY - 19 + flagWave * 0.5
      );
      ctx.lineTo(flagX, flagY - 13);
      ctx.closePath();
      ctx.fill();

      // Previously landed arrows with 3D shadows & feathered fletchings
      arrowHistory.forEach((arr, idx) => {
        const landedX = targetCenterX + arr.x * targetRadius;
        const landedY = targetCenterY + arr.y * targetRadius;

        // Cast shadow across target face
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(landedX, landedY);
        ctx.lineTo(landedX - 7, landedY + 18);
        ctx.stroke();

        // 3D Arrow Shaft sticking out toward viewer
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(landedX, landedY);
        ctx.lineTo(landedX - 13, landedY + 15);
        ctx.stroke();

        ctx.strokeStyle = bow.arrowShaftColor;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(landedX, landedY);
        ctx.lineTo(landedX - 13, landedY + 15);
        ctx.stroke();

        // Fletching vanes
        ctx.fillStyle = bow.arrowFletchColor;
        ctx.beginPath();
        ctx.moveTo(landedX - 9, landedY + 11);
        ctx.lineTo(landedX - 18, landedY + 14);
        ctx.lineTo(landedX - 14, landedY + 19);
        ctx.lineTo(landedX - 12, landedY + 14);
        ctx.closePath();
        ctx.fill();

        // Crisp Wii number badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.beginPath();
        ctx.arc(landedX - 18, landedY + 23, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 8.5px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(idx + 1), landedX - 18, landedY + 26);
      });

      ctx.restore();

      // First-Person Horse POV (Rear perspective: Withers, Neck, Back of Head & Ears)
      if (isHorseback) {
        ctx.save();
        const stridePhase = time * 0.009;
        const horseX = width * 0.5 + Math.sin(stridePhase * 0.5) * 6;
        const horseY = height - 42 + Math.sin(stridePhase) * 16;
        const horseTilt = Math.sin(stridePhase) * 0.035;

        ctx.translate(horseX, horseY);
        ctx.rotate(horseTilt);
        ctx.scale(1.4, 1.4);

        // 1. Withers & Broad Upper Shoulders (volumetric Wii-style shading)
        const shoulderGrad = ctx.createRadialGradient(-8, -20, 12, 0, 20, 100);
        shoulderGrad.addColorStop(0, '#b45309');
        shoulderGrad.addColorStop(0.5, '#78350f');
        shoulderGrad.addColorStop(1, '#451a03');

        ctx.fillStyle = shoulderGrad;
        ctx.beginPath();
        ctx.moveTo(-82, 85);
        ctx.quadraticCurveTo(-45, 30, -36, -45);
        ctx.lineTo(36, -45);
        ctx.quadraticCurveTo(45, 30, 82, 85);
        ctx.closePath();
        ctx.fill();

        // Shoulder muscle contour highlights
        ctx.fillStyle = 'rgba(253, 186, 116, 0.16)';
        ctx.beginPath();
        ctx.ellipse(-28, 22, 16, 36, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(28, 10, 2, 0.35)';
        ctx.beginPath();
        ctx.ellipse(36, 26, 18, 38, 0.35, 0, Math.PI * 2);
        ctx.fill();

        // 2. Neck Crest (목덜미 능선)
        const neckGrad = ctx.createLinearGradient(-34, -80, 34, -60);
        neckGrad.addColorStop(0, '#b45309');
        neckGrad.addColorStop(0.45, '#92400e');
        neckGrad.addColorStop(1, '#5c260a');

        ctx.fillStyle = neckGrad;
        ctx.beginPath();
        ctx.moveTo(-36, -45);
        ctx.quadraticCurveTo(-30, -85, -24, -112);
        ctx.lineTo(24, -112);
        ctx.quadraticCurveTo(30, -85, 36, -45);
        ctx.closePath();
        ctx.fill();

        // Spine gloss highlight along neck crest
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.32)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-2, 48);
        ctx.lineTo(-1, -108);
        ctx.stroke();

        // 3. Back of the Poll / Crown (말 뒤통수)
        const pollGrad = ctx.createRadialGradient(-6, -120, 4, 0, -114, 26);
        pollGrad.addColorStop(0, '#b45309');
        pollGrad.addColorStop(0.65, '#78350f');
        pollGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = pollGrad;
        ctx.beginPath();
        ctx.ellipse(0, -114, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Back of the Ears (3D convex shading + rim highlight)
        const earFlick = Math.sin(stridePhase * 1.6) * 0.06;

        // Left ear
        ctx.save();
        const lEarGrad = ctx.createLinearGradient(-28, -155, -8, -115);
        lEarGrad.addColorStop(0, '#92400e');
        lEarGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = lEarGrad;
        ctx.beginPath();
        ctx.moveTo(-18, -112);
        ctx.quadraticCurveTo(-32 + earFlick * 14, -135, -25 + earFlick * 16, -164);
        ctx.quadraticCurveTo(-14 + earFlick * 10, -145, -7, -118);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(254, 215, 170, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-18, -116);
        ctx.quadraticCurveTo(-28 + earFlick * 14, -136, -25 + earFlick * 16, -160);
        ctx.stroke();

        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(-22 + earFlick * 15, -150);
        ctx.lineTo(-25 + earFlick * 16, -164);
        ctx.lineTo(-18 + earFlick * 12, -154);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Right ear
        ctx.save();
        const rEarGrad = ctx.createLinearGradient(8, -155, 28, -115);
        rEarGrad.addColorStop(0, '#92400e');
        rEarGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = rEarGrad;
        ctx.beginPath();
        ctx.moveTo(7, -118);
        ctx.quadraticCurveTo(14 - earFlick * 10, -145, 25 - earFlick * 16, -164);
        ctx.quadraticCurveTo(32 - earFlick * 14, -135, 18, -112);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(254, 215, 170, 0.25)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(10, -120);
        ctx.quadraticCurveTo(18 - earFlick * 10, -144, 25 - earFlick * 16, -160);
        ctx.stroke();

        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(18 - earFlick * 12, -154);
        ctx.lineTo(25 - earFlick * 16, -164);
        ctx.lineTo(22 - earFlick * 15, -150);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 5. Forelock & Flowing Mane
        const maneWave = Math.sin(time * 0.016) * 8;
        ctx.fillStyle = '#18181b';

        ctx.beginPath();
        ctx.moveTo(-8, -120);
        ctx.quadraticCurveTo(0, -134, maneWave * 0.3, -140);
        ctx.quadraticCurveTo(5, -132, 8, -120);
        ctx.quadraticCurveTo(0, -115, -8, -120);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-4, -114);
        ctx.quadraticCurveTo(-18 + maneWave * 0.6, -90, -28 + maneWave, -60);
        ctx.quadraticCurveTo(-38 + maneWave * 1.2, -20, -42 + maneWave * 0.8, 20);
        ctx.lineTo(-24, 25);
        ctx.quadraticCurveTo(-20, -20, -12, -60);
        ctx.quadraticCurveTo(-4, -90, 4, -114);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-2, -110);
        ctx.quadraticCurveTo(-15 + maneWave * 0.6, -80, -22 + maneWave, -40);
        ctx.moveTo(-6, -95);
        ctx.quadraticCurveTo(-26 + maneWave * 0.9, -50, -32 + maneWave, 0);
        ctx.stroke();

        // 6. Bridle Crownpiece & Glossy Brass Fittings
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-22, -105);
        ctx.quadraticCurveTo(0, -100, 22, -105);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(-22, -105, 3.8, 0, Math.PI * 2);
        ctx.arc(22, -105, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-23, -106, 1.3, 0, Math.PI * 2);
        ctx.arc(21, -106, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Red Joseon Tassel
        const tasselWave = Math.sin(time * 0.014) * 7;
        const tasselGrad = ctx.createLinearGradient(-22, -102, -25, -48);
        tasselGrad.addColorStop(0, '#ef4444');
        tasselGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = tasselGrad;
        ctx.beginPath();
        ctx.moveTo(-22, -102);
        ctx.quadraticCurveTo(-32 + tasselWave, -75, -28 + tasselWave * 1.3, -48);
        ctx.lineTo(-22 + tasselWave * 1.3, -48);
        ctx.quadraticCurveTo(-26 + tasselWave, -75, -18, -102);
        ctx.closePath();
        ctx.fill();

        // 7. 3D Leather Reins
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(-24, -98);
            ctx.quadraticCurveTo(-70, -30, -135, 80);
          },
          '#78350f',
          4,
          false
        );
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(24, -98);
            ctx.quadraticCurveTo(70, -30, 135, 80);
          },
          '#78350f',
          4,
          false
        );

        ctx.restore();
      }

      // 3. Draw Flight Arrow (Active Projectile)
      if (flightArrowRef.current && flightArrowRef.current.active) {
        const fa = flightArrowRef.current;
        fa.progress += fa.speed * dt * 60;

        if (fa.progress >= 1) {
          // Impact occurred!
          fa.active = false;
          fa.progress = 1;

          // Play impact sound & trigger score callback
          archeryAudio.playTargetHitSound(fa.score);

          if (isTraditional && fa.score >= 9) {
            archeryAudio.playJoseonGongSound();
          }

          if (fa.score >= 10) {
            try {
              confetti({
                particleCount: fa.isX ? 70 : 40,
                spread: fa.isX ? 80 : 55,
                origin: { y: 0.6 },
                colors: ['#eab308', '#facc15', '#ef4444', '#3b82f6', '#ffffff'],
              });
            } catch {
              // Confetti fallback
            }
          }

          setLastHitPopup({
            score: fa.score,
            isX: fa.isX,
            id: `hit_${Date.now()}`,
            isTraditional,
          });

          onShotFired({
            id: `shot_${Date.now()}`,
            score: fa.score,
            isX: fa.isX,
            x: fa.relativeHitX,
            y: fa.relativeHitY,
            distanceMeters: distance,
            windSpeed: wind.speed,
            windAngle: wind.angle,
            time: Date.now(),
          });
        } else {
          // Render arrow in 1st-person flight (flying away into the depth)
          const p = fa.progress;
          // Ballistic curve trajectory towards target
          const currX = fa.startX + (fa.targetHitX - fa.startX) * p;
          const currY = fa.startY + (fa.targetHitY - fa.startY) * p - Math.sin(p * Math.PI) * 14;

          // Arrow perspective scaling (shrinks as it flies away downrange)
          const scale = Math.max(0.2, 1 - p * 0.78);
          const shaftLen = 85 * scale;

          const dx = fa.targetHitX - fa.startX;
          const dy = fa.targetHitY - fa.startY;
          const dist = Math.hypot(dx, dy) || 1;
          const ux = dx / dist;
          const uy = dy / dist;

          const tailX = currX - ux * shaftLen;
          const tailY = currY - uy * shaftLen + (1 - p) * 12;

          ctx.save();
          // Arrow shaft
          ctx.strokeStyle = bow.arrowShaftColor;
          ctx.lineWidth = Math.max(2, 6 * scale);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(currX, currY);
          ctx.stroke();

          // Steel tip
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(currX, currY, Math.max(1.8, 3.5 * scale), 0, Math.PI * 2);
          ctx.fill();

          // Fletchings at tail
          ctx.fillStyle = bow.arrowFletchColor;
          ctx.beginPath();
          ctx.arc(tailX, tailY, Math.max(2.5, 6.5 * scale), 0, Math.PI * 2);
          ctx.fill();

          // Speed tracer trail
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tailX - ux * 20 * scale, tailY - uy * 20 * scale);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 4. Update Aiming & Breathing Tremor
      // Hand tremor formula:
      // Base tremor depends on bow.stability (0 ~ 100)
      const baseTremorAmp = (100 - stats.stability) * 0.16 + 2.0; // 2px to 18px tremor
      // Fatigue multiplier if drawn longer than staminaTime
      let currentFatigue = 0;
      if (isDrawing && drawStartTimeRef.current > 0) {
        const holdTime = (time - drawStartTimeRef.current) / 1000;
        if (holdTime > stats.staminaTime) {
          currentFatigue = Math.min(1.0, (holdTime - stats.staminaTime) / 3.0);
        }
      }
      setFatigue(currentFatigue);

      // Natural breathing sway (lissajous curve) + fatigue jitter
      const breathX = Math.sin(breathTime * 0.8) * baseTremorAmp * (1 + currentFatigue * 3.5);
      const breathY = Math.cos(breathTime * 1.6) * (baseTremorAmp * 0.8) * (1 + currentFatigue * 3.5);

      // Smooth cursor lerp
      const targetAimX = mousePosRef.current.x + breathX;
      const targetAimY = mousePosRef.current.y + breathY;
      aimPosRef.current.x += (targetAimX - aimPosRef.current.x) * 0.25;
      aimPosRef.current.y += (targetAimY - aimPosRef.current.y) * 0.25;

      const aimX = aimPosRef.current.x;
      const aimY = aimPosRef.current.y;

      // 5. Draw Complete First-Person Perspective (POV) Bow & Hand in Archer's View
      ctx.save();

      // In real first-person archery:
      // The archer looks along the line of sight (aimX, aimY).
      // The bow riser is held vertically in the left hand, just to the left of the aiming eye line.
      // The arrow points directly forward into the depth toward the target.
      const tension = drawProgress; // 0 (idle) to 1 (full draw)

      // Riser Anchor position relative to aim point
      const riserDistLeft = 68; // px to the left of sight pin
      const riserCenterX = aimX - riserDistLeft;
      const riserCenterY = aimY + 38;

      // Archer's Eye Anchor Point for the bowstring nock (near bottom-center / chin of viewer)
      // When drawn, the string comes right up to the archer's jaw/eye
      const idleNockX = riserCenterX + 8;
      const idleNockY = riserCenterY + 2;
      const fullDrawNockX = aimX + 18;
      const fullDrawNockY = height * 0.90;

      const nockX = idleNockX + (fullDrawNockX - idleNockX) * tension;
      const nockY = idleNockY + (fullDrawNockY - idleNockY) * tension;

      // Limb tip positions in 1st person
      // Upper limb rises high towards top of viewport
      // Lower limb drops towards bottom left
      const limbBendX = tension * 16;
      const limbBendY = tension * 32;

      const upperTipX = riserCenterX - 18 - limbBendX;
      const upperTipY = Math.max(15, riserCenterY - height * 0.58 + limbBendY);

      const lowerTipX = riserCenterX - 28 - limbBendX;
      const lowerTipY = Math.min(height - 15, riserCenterY + height * 0.56 - limbBendY);

      // --- A. Archer's Left Forearm & Hand (Clean Wii Sports Athletic Style) ---
      const gripX = riserCenterX + 4;
      const gripY = riserCenterY + 24;

      ctx.save();
      // Athletic white/sky-blue sleeve entering from bottom-left
      const sleeveGrad = ctx.createLinearGradient(-10, height, gripX - 24, gripY + 46);
      sleeveGrad.addColorStop(0, '#0284c7');
      sleeveGrad.addColorStop(0.55, '#38bdf8');
      sleeveGrad.addColorStop(1, '#f8fafc');

      ctx.fillStyle = sleeveGrad;
      ctx.beginPath();
      ctx.moveTo(-14, height + 12);
      ctx.lineTo(width * 0.11, height + 12);
      ctx.lineTo(gripX - 6, gripY + 46);
      ctx.lineTo(gripX - 38, gripY + 58);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 35, 75, 0.28)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Athletic Wristband
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(gripX - 20, gripY + 48, 20, 10, -Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Contoured Forearm Skin
      const skinGrad = ctx.createLinearGradient(gripX - 25, gripY + 42, gripX + 10, gripY + 15);
      skinGrad.addColorStop(0, '#e5a97c');
      skinGrad.addColorStop(0.5, '#fcd5b5');
      skinGrad.addColorStop(1, '#f4bc94');
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.moveTo(gripX - 34, gripY + 50);
      ctx.lineTo(gripX - 8, gripY + 40);
      ctx.lineTo(gripX + 10, gripY + 24);
      ctx.lineTo(gripX - 18, gripY + 34);
      ctx.closePath();
      ctx.fill();

      // Wii-style Fingerless Shooting Glove & Contoured Grip Hand
      const gloveGrad = ctx.createRadialGradient(gripX - 8, gripY + 10, 4, gripX - 4, gripY + 16, 24);
      gloveGrad.addColorStop(0, '#38bdf8');
      gloveGrad.addColorStop(0.65, '#0284c7');
      gloveGrad.addColorStop(1, '#075985');
      ctx.fillStyle = gloveGrad;
      ctx.beginPath();
      ctx.ellipse(gripX - 4, gripY + 15, 17, 22, -Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 35, 75, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Knuckle / thumb highlight wrapping around riser
      const thumbGrad = ctx.createRadialGradient(gripX + 6, gripY + 10, 1, gripX + 8, gripY + 12, 11);
      thumbGrad.addColorStop(0, '#fde2cc');
      thumbGrad.addColorStop(1, '#dca074');
      ctx.fillStyle = thumbGrad;
      ctx.beginPath();
      ctx.ellipse(gripX + 8, gripY + 12, 10, 7, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 35, 75, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // --- B. Stabilizer Rod (3D Shaded Cylindrical Perspective) ---
      if (bow.stabilizer !== 'none') {
        const rodBaseX = riserCenterX + 2;
        const rodBaseY = riserCenterY;
        const rodEndX = rodBaseX + 18;
        const rodEndY = rodBaseY - 22;

        ctx.save();
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(rodBaseX, rodBaseY);
            ctx.lineTo(rodEndX, rodEndY);
          },
          '#334155',
          9
        );

        // Stabilizer tip damper & 3D metallic gold weight disc
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(rodEndX, rodEndY, 9.5, 0, Math.PI * 2);
        ctx.fill();

        const weightGrad = ctx.createRadialGradient(rodEndX - 2.5, rodEndY - 2.5, 1, rodEndX, rodEndY, 7.5);
        weightGrad.addColorStop(0, '#fef08a');
        weightGrad.addColorStop(0.55, '#f59e0b');
        weightGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = weightGrad;
        ctx.beginPath();
        ctx.arc(rodEndX, rodEndY, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // V-bar side rods if equipped
        if (bow.stabilizer === 'vbar_multi') {
          strokeSculpted(
            () => {
              ctx.beginPath();
              ctx.moveTo(rodBaseX, rodBaseY);
              ctx.lineTo(rodBaseX - 35, rodBaseY + 28);
            },
            '#334155',
            5,
            false
          );
          strokeSculpted(
            () => {
              ctx.beginPath();
              ctx.moveTo(rodBaseX, rodBaseY);
              ctx.lineTo(rodBaseX - 10, rodBaseY + 45);
            },
            '#334155',
            5,
            false
          );
        }
        ctx.restore();
      }

      // --- C. Bow Limbs (3D Sculpted Tubular Upper & Lower Limbs) ---
      const riserTopX = riserCenterX - 10;
      const riserTopY = riserCenterY - 65;
      const riserBottomX = riserCenterX - 12;
      const riserBottomY = riserCenterY + 75;
      const limbW = bow.type === 'compound' ? 19 : 16;
      const isRoyalJoseon =
        bow.id === 'joseon_yegung' ||
        bow.name.includes('대사례') ||
        (bow.limbPattern === 'dragon' && bow.riserMaterial === 'gold');

      type Pt1P = [number, number];
      const upperCurve1P: [Pt1P, Pt1P, Pt1P, Pt1P] =
        bow.type === 'recurve' || bow.type === 'tactical'
          ? [
              [riserTopX, riserTopY],
              [riserCenterX - 32, riserCenterY - 180],
              [riserCenterX + 8 - limbBendX, riserCenterY - 320],
              [upperTipX, upperTipY],
            ]
          : bow.type === 'compound'
          ? [
              [riserTopX, riserTopY],
              [riserCenterX - 25, riserCenterY - 140],
              [riserCenterX - 10 - limbBendX, riserCenterY - 260],
              [upperTipX, upperTipY],
            ]
          : [
              [riserTopX, riserTopY],
              [riserCenterX - 45, riserCenterY - 140],
              [riserCenterX + 25 - limbBendX, riserCenterY - 260],
              [upperTipX, upperTipY],
            ];

      const lowerCurve1P: [Pt1P, Pt1P, Pt1P, Pt1P] =
        bow.type === 'recurve' || bow.type === 'tactical'
          ? [
              [riserBottomX, riserBottomY],
              [riserCenterX - 35, riserCenterY + 180],
              [riserCenterX + 4 - limbBendX, riserCenterY + 300],
              [lowerTipX, lowerTipY],
            ]
          : bow.type === 'compound'
          ? [
              [riserBottomX, riserBottomY],
              [riserCenterX - 28, riserCenterY + 150],
              [riserCenterX - 14 - limbBendX, riserCenterY + 250],
              [lowerTipX, lowerTipY],
            ]
          : [
              [riserBottomX, riserBottomY],
              [riserCenterX - 48, riserCenterY + 150],
              [riserCenterX + 20 - limbBendX, riserCenterY + 250],
              [lowerTipX, lowerTipY],
            ];

      const drawCurve1P = (c: [Pt1P, Pt1P, Pt1P, Pt1P]) => {
        ctx.beginPath();
        ctx.moveTo(c[0][0], c[0][1]);
        ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]);
      };

      const sampleCurve1P = (c: [Pt1P, Pt1P, Pt1P, Pt1P], t: number) => {
        const u = 1 - t;
        const x =
          u * u * u * c[0][0] +
          3 * u * u * t * c[1][0] +
          3 * u * t * t * c[2][0] +
          t * t * t * c[3][0];
        const y =
          u * u * u * c[0][1] +
          3 * u * u * t * c[1][1] +
          3 * u * t * t * c[2][1] +
          t * t * t * c[3][1];
        const dx =
          3 * u * u * (c[1][0] - c[0][0]) +
          6 * u * t * (c[2][0] - c[1][0]) +
          3 * t * t * (c[3][0] - c[2][0]);
        const dy =
          3 * u * u * (c[1][1] - c[0][1]) +
          6 * u * t * (c[2][1] - c[1][1]) +
          3 * t * t * (c[3][1] - c[2][1]);
        const len = Math.hypot(dx, dy) || 1;
        return { x, y, tx: dx / len, ty: dy / len, nx: -dy / len, ny: dx / len };
      };

      strokeSculpted(() => drawCurve1P(upperCurve1P), bow.limbColor, limbW);
      strokeSculpted(() => drawCurve1P(lowerCurve1P), bow.limbColor, limbW);

      // Limb Decals / Royal Oriental Pattern
      if (bow.limbPattern === 'dragon' || isRoyalJoseon) {
        const drawOriental1PLimb = (curve: [Pt1P, Pt1P, Pt1P, Pt1P]) => {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          const halfW = limbW * 0.44;

          const drawBand = (t: number, col: string, w: number) => {
            const p = sampleCurve1P(curve, t);
            ctx.strokeStyle = col;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(p.x - p.nx * halfW, p.y - p.ny * halfW);
            ctx.lineTo(p.x + p.nx * halfW, p.y + p.ny * halfW);
            ctx.stroke();
          };

          // Gold & Dancheong collar bands
          drawBand(0.07, '#d97706', 3.6);
          drawBand(0.07, '#fde047', 1.6);
          drawBand(0.11, '#10b981', 2.2);
          drawBand(0.15, '#d97706', 3.0);
          drawBand(0.15, '#fef08a', 1.2);

          drawBand(0.84, '#d97706', 3.0);
          drawBand(0.84, '#fef08a', 1.2);
          drawBand(0.88, '#10b981', 2.2);
          drawBand(0.92, '#d97706', 3.6);
          drawBand(0.92, '#fde047', 1.6);

          // Flowing Dangcho golden vine scroll
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          const steps = 26;
          for (let i = 0; i <= steps; i++) {
            const t = 0.19 + (i / steps) * 0.61;
            const p = sampleCurve1P(curve, t);
            const wave = Math.sin(i * 0.85) * (limbW * 0.22);
            const px = p.x + p.nx * wave;
            const py = p.y + p.ny * wave;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          ctx.strokeStyle = 'rgba(254, 249, 195, 0.72)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Royal diamond medallions & cloud spirals
          [0.26, 0.42, 0.58, 0.74].forEach((t, idx) => {
            const p = sampleCurve1P(curve, t);
            const r = isRoyalJoseon ? 3.8 : 3.0;
            ctx.fillStyle = '#fde047';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x + p.tx * r * 1.25, p.y + p.ty * r * 1.25);
            ctx.lineTo(p.x + p.nx * r, p.y + p.ny * r);
            ctx.lineTo(p.x - p.tx * r * 1.25, p.y - p.ty * r * 1.25);
            ctx.lineTo(p.x - p.nx * r, p.y - p.ny * r);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = idx % 2 === 0 ? '#10b981' : '#ef4444';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.restore();
        };

        drawOriental1PLimb(upperCurve1P);
        drawOriental1PLimb(lowerCurve1P);
      } else if (bow.limbPattern === 'stripes') {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = bow.riserColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(riserTopX - 4, riserCenterY - 140);
        ctx.lineTo(riserTopX + 6, riserCenterY - 165);
        ctx.moveTo(riserBottomX - 4, riserCenterY + 140);
        ctx.lineTo(riserBottomX + 6, riserCenterY + 165);
        ctx.stroke();
        ctx.restore();
      }

      // --- D. Compound Cams (3D Metallic Pulleys) in 1st Person ---
      if (bow.type === 'compound') {
        ctx.save();
        const drawCam = (cx: number, cy: number, angle: number) => {
          const camGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 18);
          camGrad.addColorStop(0, '#475569');
          camGrad.addColorStop(0.6, '#0f172a');
          camGrad.addColorStop(1, '#020617');
          ctx.fillStyle = camGrad;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 18, 12, angle, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Metallic hub pin
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        };

        drawCam(upperTipX, upperTipY, Math.PI / 4);
        drawCam(lowerTipX, lowerTipY, -Math.PI / 4);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(upperTipX, upperTipY);
        ctx.lineTo(lowerTipX + 12, lowerTipY - 30);
        ctx.moveTo(lowerTipX, lowerTipY);
        ctx.lineTo(upperTipX + 12, upperTipY + 30);
        ctx.stroke();
        ctx.restore();
      }

      // --- E. Bow Riser (3D Sculpted Central Handle Frame & Sight Window) ---
      const drawRiserPath = () => {
        ctx.beginPath();
        ctx.moveTo(riserTopX, riserTopY);
        ctx.lineTo(riserCenterX - 18, riserCenterY - 35);
        ctx.lineTo(riserCenterX - 22, riserCenterY - 10);
        ctx.lineTo(riserCenterX - 4, riserCenterY + 10);
        ctx.lineTo(riserCenterX + 4, riserCenterY + 28);
        ctx.lineTo(riserCenterX - 6, riserCenterY + 55);
        ctx.lineTo(riserBottomX, riserBottomY);
      };
      strokeSculpted(drawRiserPath, bow.riserColor, 25);

      // Royal Riser Gold Filigree & Dancheong Collars (1st Person)
      if (bow.limbPattern === 'dragon' || isRoyalJoseon) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(riserCenterX - 12, riserCenterY - 56);
        ctx.lineTo(riserCenterX - 19, riserCenterY - 34);
        ctx.lineTo(riserCenterX - 21, riserCenterY - 14);
        ctx.stroke();

        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(riserTopX - 10, riserTopY + 4);
        ctx.lineTo(riserTopX + 8, riserTopY + 4);
        ctx.moveTo(riserBottomX - 10, riserBottomY - 4);
        ctx.lineTo(riserBottomX + 8, riserBottomY - 4);
        ctx.stroke();
        ctx.restore();
      }

      // Ergonomic 3D Sculpted Grip Wrap
      strokeSculpted(
        () => {
          ctx.beginPath();
          ctx.moveTo(riserCenterX + 3, riserCenterY + 14);
          ctx.lineTo(riserCenterX + 5, riserCenterY + 38);
        },
        bow.gripColor,
        27,
        false
      );

      // Grip tactile wrap grooves or Royal Silk Diamond Brocade (금사 비단 매듭)
      ctx.save();
      if (bow.limbPattern === 'dragon' || isRoyalJoseon) {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(riserCenterX - 9, riserCenterY + 13);
        ctx.lineTo(riserCenterX + 16, riserCenterY + 13);
        ctx.moveTo(riserCenterX - 7, riserCenterY + 40);
        ctx.lineTo(riserCenterX + 18, riserCenterY + 40);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
        ctx.lineWidth = 1.4;
        for (let gy = riserCenterY + 15; gy <= riserCenterY + 32; gy += 8) {
          ctx.beginPath();
          ctx.moveTo(riserCenterX - 7, gy);
          ctx.lineTo(riserCenterX + 15, gy + 7);
          ctx.moveTo(riserCenterX + 15, gy);
          ctx.lineTo(riserCenterX - 7, gy + 7);
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 2;
        for (let gy = riserCenterY + 17; gy <= riserCenterY + 35; gy += 6) {
          ctx.beginPath();
          ctx.moveTo(riserCenterX - 7, gy);
          ctx.lineTo(riserCenterX + 15, gy);
          ctx.stroke();
        }
      }
      ctx.restore();

      // --- F. Arrow Rest / Shelf ---
      const arrowRestX = riserCenterX - 6;
      const arrowRestY = riserCenterY + 6;

      ctx.save();
      ctx.fillStyle = '#334155';
      drawRoundedPill(arrowRestX - 4, arrowRestY - 3.5, 14, 7, 3);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(arrowRestX + 8, arrowRestY, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- G. Sight Mounting Bracket & Sight Housing ---
      if (bow.sight !== 'none') {
        ctx.save();
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(riserCenterX - 18, aimY);
            ctx.lineTo(aimX - 22, aimY);
          },
          '#334155',
          5.5,
          false
        );

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(aimX - 22, aimY - 18);
        ctx.lineTo(aimX - 22, aimY + 18);
        ctx.stroke();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(aimX - 22, aimY);
        ctx.lineTo(aimX - 12, aimY);
        ctx.stroke();
        ctx.restore();
      }

      // --- H. The 3D Arrow in Foreshortened 1st-Person Perspective ---
      if (flightArrowRef.current?.active !== true) {
        const arrowDrawnOffset = tension * 42;
        const arrowTipX = arrowRestX + 55 - arrowDrawnOffset;
        const arrowTipY = aimY + 6;

        ctx.save();
        const shaftW = 9.5 - tension * 2.5;
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(nockX, nockY);
            ctx.lineTo(arrowTipX, arrowTipY);
          },
          bow.arrowShaftColor,
          shaftW
        );

        // Royal Gold & Jade Arrow Cresting Bands (왕실 예궁 화살 금박 띠)
        if (isRoyalJoseon) {
          const dx = arrowTipX - nockX;
          const dy = arrowTipY - nockY;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const halfS = shaftW * 0.48;
          [
            { t: 0.28, col: '#fbbf24', w: 3.2 },
            { t: 0.34, col: '#10b981', w: 2.2 },
            { t: 0.40, col: '#fde047', w: 3.4 },
          ].forEach(b => {
            const bx = nockX + dx * b.t;
            const by = nockY + dy * b.t;
            ctx.strokeStyle = b.col;
            ctx.lineWidth = b.w;
            ctx.beginPath();
            ctx.moveTo(bx - nx * halfS, by - ny * halfS);
            ctx.lineTo(bx + nx * halfS, by + ny * halfS);
            ctx.stroke();
          });
        }

        // 3D Faceted Steel Target Point (lit top facet + shaded bottom facet)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(arrowTipX, arrowTipY - 4.5);
        ctx.lineTo(arrowTipX + 17, arrowTipY);
        ctx.lineTo(arrowTipX, arrowTipY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(arrowTipX, arrowTipY);
        ctx.lineTo(arrowTipX + 17, arrowTipY);
        ctx.lineTo(arrowTipX, arrowTipY + 4.5);
        ctx.closePath();
        ctx.fill();

        // Sculpted 3D Fletchings with specular edge
        const fletchScale = 1.0 + tension * 0.4;
        const draw3DFletch = (pts: [number, number][]) => {
          ctx.fillStyle = bow.arrowFletchColor;
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(15, 35, 75, 0.20)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Soft vane highlight along outer edge
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pts[1][0], pts[1][1]);
          ctx.lineTo(pts[2][0], pts[2][1]);
          ctx.stroke();
        };

        draw3DFletch([
          [nockX - 4, nockY],
          [nockX - 28 * fletchScale, nockY - 6],
          [nockX - 58 * fletchScale, nockY - 14],
          [nockX - 48 * fletchScale, nockY],
        ]);
        draw3DFletch([
          [nockX, nockY - 4],
          [nockX + 10, nockY - 26 * fletchScale],
          [nockX + 18, nockY - 52 * fletchScale],
          [nockX + 4, nockY - 38 * fletchScale],
        ]);
        draw3DFletch([
          [nockX, nockY + 4],
          [nockX + 12, nockY + 22 * fletchScale],
          [nockX + 20, nockY + 44 * fletchScale],
          [nockX + 4, nockY + 32 * fletchScale],
        ]);

        // Glossy 3D Nock
        ctx.fillStyle = bow.arrowNockColor;
        ctx.beginPath();
        ctx.arc(nockX, nockY, 5.5 * fletchScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(nockX - 1.5, nockY - 1.5, 2 * fletchScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- I. Bowstring in 1st Person ---
      ctx.save();
      ctx.strokeStyle = 'rgba(15, 35, 75, 0.35)';
      ctx.lineWidth = 4.4;
      ctx.beginPath();
      ctx.moveTo(upperTipX, upperTipY);
      ctx.lineTo(nockX, nockY);
      ctx.lineTo(lowerTipX, lowerTipY);
      ctx.stroke();

      ctx.strokeStyle = bow.stringColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(upperTipX, upperTipY);
      ctx.lineTo(nockX, nockY);
      ctx.lineTo(lowerTipX, lowerTipY);
      ctx.stroke();

      // Brass Nocking Point Bead with highlight
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(nockX, nockY, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(nockX - 1.4, nockY - 1.4, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // Restore bow transform

      // 6. Draw Custom Sight Reticle (Crisp Wii Contrast Halo)
      ctx.save();
      if (bow.sight === 'optic_circle') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = bow.sightColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(aimX - 35, aimY);
        ctx.lineTo(aimX - 22, aimY);
        ctx.moveTo(aimX + 22, aimY);
        ctx.lineTo(aimX + 35, aimY);
        ctx.moveTo(aimX, aimY - 35);
        ctx.lineTo(aimX, aimY - 22);
        ctx.moveTo(aimX, aimY + 22);
        ctx.lineTo(aimX, aimY + 35);
        ctx.stroke();

        ctx.fillStyle = bow.sightColor;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (bow.sight === 'pin_single') {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(aimX, aimY + 28);
        ctx.lineTo(aimX, aimY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(aimX, aimY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = bow.sightColor;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 3.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (bow.sight === 'pin_multi') {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(aimX - 25, aimY);
        ctx.lineTo(aimX + 25, aimY);
        ctx.stroke();

        const pins = [
          { dy: -12, col: '#22c55e' },
          { dy: 0, col: bow.sightColor },
          { dy: 12, col: '#ef4444' },
        ];
        pins.forEach(p => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(aimX, aimY + p.dy, 4.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = p.col;
          ctx.beginPath();
          ctx.arc(aimX, aimY + p.dy, 3.3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (bow.sight === 'laser_dot') {
        ctx.strokeStyle = bow.sightColor;
        ctx.lineWidth = 2;
        const bSize = 16;
        ctx.beginPath();
        ctx.moveTo(aimX - bSize, aimY - bSize + 6);
        ctx.lineTo(aimX - bSize, aimY - bSize);
        ctx.lineTo(aimX - bSize + 6, aimY - bSize);
        ctx.moveTo(aimX + bSize - 6, aimY - bSize);
        ctx.lineTo(aimX + bSize, aimY - bSize);
        ctx.lineTo(aimX + bSize, aimY - bSize + 6);
        ctx.moveTo(aimX - bSize, aimY + bSize - 6);
        ctx.lineTo(aimX - bSize, aimY + bSize);
        ctx.lineTo(aimX - bSize + 6, aimY + bSize);
        ctx.moveTo(aimX + bSize - 6, aimY + bSize);
        ctx.lineTo(aimX + bSize, aimY + bSize);
        ctx.lineTo(aimX + bSize, aimY + bSize - 6);
        ctx.stroke();

        ctx.fillStyle = bow.sightColor;
        ctx.shadowColor = bow.sightColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(aimX, aimY, 8.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 7. Draw Pull Tension & Stamina Indicator HUD (Wii Glossy Gauge)
      if (isDrawing) {
        ctx.save();
        const hudX = aimX + 38;
        const hudY = aimY - 22;

        // Crisp white Wii gauge backing circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.shadowColor = 'rgba(15, 35, 75, 0.25)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(hudX, hudY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Track ring
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(hudX, hudY, 17, 0, Math.PI * 2);
        ctx.stroke();

        // Active Glossy Progress Arc
        const tensionCol = currentFatigue > 0.5 ? '#ef4444' : drawProgress > 0.9 ? '#22c55e' : '#0ea5e9';
        ctx.strokeStyle = tensionCol;
        ctx.lineCap = 'round';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(hudX, hudY, 17, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * drawProgress);
        ctx.stroke();

        // Text percentage
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(drawProgress * 100)}%`, hudX, hudY + 3.5);

        // Fatigue warning indicator as crisp Wii pill
        if (currentFatigue > 0.1) {
          ctx.fillStyle = '#ef4444';
          drawRoundedPill(aimX - 52, aimY - 46, 104, 19, 9.5);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px "Outfit", "Noto Sans KR", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('손떨림 발생 (피로)', aimX, aimY - 33);
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [bow, stats, distance, mode, isDrawing, drawProgress, wind, arrowHistory]);

  // Pointer / Mouse interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isRoundActive) return;
    if (flightArrowRef.current?.active) return; // Wait for current arrow to land
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePosRef.current = { x, y };
    setIsDrawing(true);
    setDrawProgress(0);
    drawStartTimeRef.current = performance.now();
    archeryAudio.playDrawSound(0.2);

    // Rapid draw accumulation
    const drawTimer = setInterval(() => {
      setDrawProgress(prev => {
        if (prev >= 1) {
          clearInterval(drawTimer);
          return 1;
        }
        return prev + 0.15;
      });
    }, 45);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (!isRoundActive) {
      setDrawProgress(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    // Release sound
    archeryAudio.playReleaseSound(bow.drawWeight);

    // Ballistic calculation:
    // Arrow flies towards targetCenter
    const distRatio = (70 - distance) / (70 - 18);
    let targetRadius = 38 + distRatio * 52;
    let targetCenterX = width * 0.5 + targetOffset;
    let targetCenterY = height * 0.48 - distRatio * 15;

    // Horseback Mode Dynamic Target Geometry & Inertia
    let horseTargetSide: 'right' | 'left' = 'right';
    if (mode === 'horseback') {
      const horseState = computeHorseTargetState(gallopDistRef.current, gallopLapRef.current, width, height);
      targetRadius = horseState.targetRadius;
      targetCenterX = horseState.targetCenterX;
      targetCenterY = horseState.targetCenterY;
      horseTargetSide = horseState.side;
    }

    // Aim offset from target center in pixels
    const aimX = aimPosRef.current.x;
    const aimY = aimPosRef.current.y;

    // Gravity drop:
    // Less draw weight or greater distance => more drop
    const dropFactor = (distance / 70) * (60 / stats.velocity) * 12;
    // If not fully drawn, heavy drop
    const underdrawDrop = (1 - drawProgress) * 45;

    // Wind drift:
    // Lateral drift vector based on wind speed & angle, reduced by bow.windResistance
    const windPushMagnitude = (wind.speed * (distance / 40) * 16) * (1 - stats.windResistance / 100);
    const windDriftX = Math.cos(wind.angle) * windPushMagnitude;
    const windDriftY = Math.sin(wind.angle) * windPushMagnitude * 0.4;

    // In horseback archery, add gallop momentum compensation
    const gallopMomentumX = mode === 'horseback' ? (horseTargetSide === 'right' ? 3 : -3) : 0;

    const finalTargetHitX = aimX + windDriftX + gallopMomentumX;
    const finalTargetHitY = aimY + dropFactor + underdrawDrop + windDriftY;

    // Compute relative distance on target from center
    const deltaX = finalTargetHitX - targetCenterX;
    const deltaY = finalTargetHitY - targetCenterY;
    const distanceToCenter = Math.hypot(deltaX, deltaY);
    const relativeRadius = distanceToCenter / targetRadius; // 0 (center) to 1.0 (ring 1)

    // Score calculation (World Archery 10-ring or Joseon Hongsim)
    let score = 0;
    let isX = false;
    if (relativeRadius <= 0.065) {
      score = 10;
      isX = true;
    } else if (relativeRadius <= 0.12) {
      score = 10;
    } else if (relativeRadius <= 0.22) {
      score = 9;
    } else if (relativeRadius <= 0.32) {
      score = 8;
    } else if (relativeRadius <= 0.42) {
      score = 7;
    } else if (relativeRadius <= 0.52) {
      score = 6;
    } else if (relativeRadius <= 0.62) {
      score = 5;
    } else if (relativeRadius <= 0.72) {
      score = 4;
    } else if (relativeRadius <= 0.82) {
      score = 3;
    } else if (relativeRadius <= 0.92) {
      score = 2;
    } else if (relativeRadius <= 1.02) {
      score = 1;
    } else {
      score = 0; // Miss
    }

    // Launch arrow projectile animation from 1st-person arrow rest position
    flightArrowRef.current = {
      active: true,
      startX: aimX - 22,
      startY: aimY + 6,
      targetHitX: finalTargetHitX,
      targetHitY: finalTargetHitY,
      progress: 0,
      speed: (stats.velocity / 300) * 0.05 + 0.03, // Flight duration ~0.35 - 0.55s
      relativeHitX: Number((deltaX / targetRadius).toFixed(3)),
      relativeHitY: Number((deltaY / targetRadius).toFixed(3)),
      score,
      isX,
    };

    onShotStarted();
    setDrawProgress(0);
  };

  return (
    <div
      ref={containerRef}
      id="archery-canvas-container"
      className="relative w-full h-[clamp(280px,64dvh,620px)] min-h-[280px] rounded-3xl overflow-hidden bg-sky-100 border-4 border-white shadow-[0_14px_40px_rgba(14,75,140,0.16)] select-none"
    >
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        id="archery-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full touch-none ${isRoundActive ? 'cursor-crosshair' : 'cursor-default'}`}
      />

      {/* Top HUD Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
        {/* Left: Distance, Mode Badge & Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              flightArrowRef.current = null;
              setIsDrawing(false);
              setDrawProgress(0);
              onOpenModeSelection();
            }}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-sky-200 bg-gradient-to-b from-sky-300 via-blue-400 to-blue-600 text-white shadow-[0_6px_12px_rgba(37,99,235,0.3)] transition hover:brightness-105 active:scale-95"
            aria-label="게임 모드 선택"
            title="게임 모드 선택"
          >
            <Target className="h-5 w-5 stroke-[2.4]" />
          </button>

          <div className="flex items-center gap-2 bg-white/92 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-sky-200/90 shadow-md">
            <Crosshair className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-extrabold text-slate-900 tracking-wide tabular-nums">
              {mode === 'horseback' ? `${horsebackInfo.dist}M` : `${distance}M`}
            </span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-xs font-bold text-slate-600">
              {mode === 'olympic'
                ? '올림픽 규격'
                : mode === 'moving_target'
                ? '이동 과녁'
                : `마상궁술 (기사 騎射 - Lap ${horsebackInfo.lap})`}
            </span>
          </div>

          <button
            id="reset-round-btn"
            type="button"
            onClick={() => {
              if (!isRoundActive) return;
              archeryAudio.playClickSound();
              flightArrowRef.current = null;
              setIsDrawing(false);
              setDrawProgress(0);
              onResetRound();
            }}
            disabled={!isRoundActive}
            className="p-2.5 rounded-2xl bg-white/92 backdrop-blur-md border-2 border-sky-200/90 text-slate-600 hover:text-sky-600 hover:border-sky-400 cursor-pointer transition-all shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            title="새 라운드 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Horseback Target Nav */}
        {mode === 'horseback' && (
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-sky-300 shadow-lg pointer-events-auto">
            {/* Left arrow if target is on the left */}
            {horsebackInfo.side === 'left' && (
              <span className="text-sm font-black text-amber-600 animate-pulse">◀ 좌측</span>
            )}

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">
                  {horsebackInfo.targetName}
                </span>
                {horsebackInfo.inZone ? (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-400 text-[10px] font-black text-emerald-700">
                    ⚡ 사격 적기!
                  </span>
                ) : horsebackInfo.hasPassed ? (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-400 text-[10px] font-black text-rose-700">
                    💨 배사 구역
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    {horsebackInfo.relDist}m 접근 중
                  </span>
                )}
              </div>
              <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-150"
                  style={{ width: `${(horsebackInfo.dist % 100)}%` }}
                />
              </div>
            </div>

            {/* Right arrow if target is on the right */}
            {horsebackInfo.side === 'right' && (
              <span className="text-sm font-black text-amber-600 animate-pulse">우측 ▶</span>
            )}
          </div>
        )}

        {/* Right: Wind Speed Compass (non-horseback) with Shot counter underneath */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {mode !== 'olympic' && (
            <div
              className="flex items-center gap-2 bg-white/92 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-sky-200/90 shadow-md"
              aria-live="polite"
              aria-label={`남은 시간 ${remainingSeconds}초`}
            >
              <Clock className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-black text-sky-700 tabular-nums">
                남은 시간 00:{String(remainingSeconds).padStart(2, '0')}
              </span>
            </div>
          )}

          {mode !== 'horseback' && (
            <div className="flex items-center gap-3 bg-white/92 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-sky-200/90 shadow-md">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-bold leading-none">
                    풍속 & 풍향
                  </span>
                  <span className="text-xs font-black text-sky-600 tabular-nums mt-0.5">
                    {wind.speed} m/s
                  </span>
                </div>
              </div>
              {/* Rotating Wind Arrow */}
              <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center border border-sky-200">
                <div
                  className="w-4 h-4 text-sky-600 font-bold transition-transform duration-500 flex items-center justify-center"
                  style={{ transform: `rotate(${wind.angle}rad)` }}
                >
                  ↑
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/92 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-sky-200/90 shadow-md">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-normal text-slate-800 tabular-nums">
              {mode === 'olympic'
                ? `화살 ${arrowHistory.length} / 9발`
                : `화살 ${arrowHistory.length}발 발사`}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Target Close-Up Scope Camera (Bottom-Right Inset) */}
      <div className="absolute bottom-4 right-4 bg-white/94 backdrop-blur-md p-3 rounded-3xl border-2 border-sky-200 shadow-xl pointer-events-auto w-44">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-extrabold text-sky-600 tracking-wide">
            {isTraditional ? '조선 웅후 과녁' : '과녁 스코프 뷰'}
          </span>
          <span className="text-[10px] font-bold text-slate-500 tabular-nums">
            {arrowHistory.length}개 적중
          </span>
        </div>

        {/* SVG Mini Target */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-sky-50 border border-sky-200/80 flex items-center justify-center">
          <svg viewBox="-1.15 -1.15 2.3 2.3" className="w-full h-full">
            {isTraditional ? (
              <>
                {/* Joseon Wooden Board Backing */}
                <rect x="-1.05" y="-1.05" width="2.1" height="2.1" rx="0.1" fill="#451a03" stroke="#78350f" strokeWidth="0.04" />
                <rect x="-1.02" y="-1.02" width="0.16" height="0.16" fill="#d97706" />
                <rect x="0.86" y="-1.02" width="0.16" height="0.16" fill="#d97706" />
                <rect x="-1.02" y="0.86" width="0.16" height="0.16" fill="#d97706" />
                <rect x="0.86" y="0.86" width="0.16" height="0.16" fill="#d97706" />

                {/* White Paper Canvas */}
                <circle cx="0" cy="0" r="0.95" fill="#fefce8" stroke="#78350f" strokeWidth="0.02" />
                {/* Traditional Joseon Scoring Rings */}
                <circle cx="0" cy="0" r="0.85" fill="#18181b" stroke="#3f3f46" strokeWidth="0.015" />
                <circle cx="0" cy="0" r="0.65" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="0.015" />
                <circle cx="0" cy="0" r="0.45" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.015" />
                {/* Crimson Hongsim (홍심) */}
                <circle cx="0" cy="0" r="0.22" fill="#b91c1c" stroke="#991b1b" strokeWidth="0.015" />
                <circle cx="0" cy="0" r="0.07" fill="#dc2626" />
                <circle cx="0" cy="0" r="0.02" fill="#fef08a" />
              </>
            ) : (
              <>
                {/* 1,2 White */}
                <circle cx="0" cy="0" r="1.0" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.02" />
                {/* 3,4 Black */}
                <circle cx="0" cy="0" r="0.8" fill="#18181b" stroke="#3f3f46" strokeWidth="0.02" />
                {/* 5,6 Blue */}
                <circle cx="0" cy="0" r="0.6" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.02" />
                {/* 7,8 Red */}
                <circle cx="0" cy="0" r="0.4" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.02" />
                {/* 9,10 Gold */}
                <circle cx="0" cy="0" r="0.2" fill="#eab308" stroke="#ca8a04" strokeWidth="0.02" />
                {/* Inner X */}
                <circle cx="0" cy="0" r="0.065" fill="none" stroke="#713f12" strokeWidth="0.02" strokeDasharray="0.03 0.02" />
              </>
            )}

            {/* Placed Arrow dots */}
            {arrowHistory.map((arr, idx) => (
              <g key={arr.id || idx}>
                <circle
                  cx={arr.x}
                  cy={arr.y}
                  r="0.045"
                  fill={arr.score >= 10 ? '#ef4444' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="0.015"
                />
                <text
                  x={arr.x}
                  y={arr.y + 0.015}
                  fontSize="0.04"
                  fill="#ffffff"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Controls Hint / Bottom Tutorial */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-white/92 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-sky-200/90 shadow-md pointer-events-auto">
        <div className="text-xs text-slate-700 flex items-center gap-2">
          <span className="font-extrabold text-sky-600">조작법</span>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="font-medium">
            마우스/터치를 <strong className="text-sky-600 font-bold">누르고 있으면 활시위 장전</strong> → 조준 후 <strong className="text-amber-600 font-bold">손을 떼면 발사!</strong>
          </span>
        </div>
      </div>

      {/* Score Impact Splash Badge (Wii Sports Resort Celebratory Callout) */}
      {lastHitPopup && (
        <div
          key={lastHitPopup.id}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center animate-bounce"
        >
          <div
            className={`px-7 py-3.5 rounded-3xl font-black text-2xl shadow-2xl border-4 border-white tabular-nums ${
              lastHitPopup.isX
                ? 'wii-gloss-orange text-slate-950'
                : lastHitPopup.score >= 9
                ? 'wii-gloss-orange text-slate-950'
                : lastHitPopup.score >= 7
                ? 'bg-gradient-to-b from-rose-400 to-rose-600 text-white'
                : lastHitPopup.score >= 5
                ? 'wii-gloss-blue text-white'
                : 'bg-white text-slate-800'
            }`}
          >
            {isTraditional ? (
              lastHitPopup.isX
                ? '🎯 貫中! 관중 (홍심 정중앙 X-10점!)'
                : lastHitPopup.score === 10
                ? '🌟 貫中! 관중 (홍심 10점 명중!)'
                : lastHitPopup.score >= 9
                ? `🎯 관중 (과녁 ${lastHitPopup.score}점)`
                : lastHitPopup.score > 0
                ? `🎯 변시 (${lastHitPopup.score}점)`
                : '💨 실사 (과녁 빗나감)'
            ) : (
              lastHitPopup.isX
                ? '🎯 PERFECT X-10점!'
                : lastHitPopup.score === 10
                ? '🌟 BULLSEYE 10점!'
                : lastHitPopup.score > 0
                ? `🎯 ${lastHitPopup.score}점!`
                : '💨 과녁 빗나감 (MISS)'
            )}
          </div>
        </div>
      )}
    </div>
  );
};
