import React, { useRef, useEffect, useState } from 'react';
import { BowConfig, BowStats } from '../types';
import { archeryAudio } from '../utils/audio';
import { Eye, Flame, Shield, Wind, Pencil } from 'lucide-react';

interface BowPreviewProps {
  bow: BowConfig;
  stats: BowStats;
  onRenameBow?: (name: string) => void;
}

export const BowPreview: React.FC<BowPreviewProps> = ({ bow, stats, onRenameBow }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [drawTension, setDrawTension] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Animate bow draw / release test
  useEffect(() => {
    let animId: number;
    if (!isDrawing && drawTension > 0) {
      const snapBack = () => {
        setDrawTension(prev => {
          if (prev <= 0.05) return 0;
          return prev * 0.45;
        });
        if (drawTension > 0.05) {
          animId = requestAnimationFrame(snapBack);
        }
      };
      animId = requestAnimationFrame(snapBack);
    }
    return () => cancelAnimationFrame(animId);
  }, [isDrawing, drawTension]);

  const handleTestDrawStart = () => {
    setIsDrawing(true);
    setDrawTension(1);
    archeryAudio.playDrawSound(1);
  };

  const handleTestDrawEnd = () => {
    if (isDrawing) {
      archeryAudio.playReleaseSound(bow.drawWeight);
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Coordinate system: center of bow is around (width * 0.42, height * 0.5)
    const centerX = width * 0.45;
    const centerY = height * 0.5;
    const bowHeight = height * 0.82;
    const halfHeight = bowHeight / 2;

    const tension = drawTension; // 0 to 1

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

      if (withShadow) {
        ctx.save();
        ctx.translate(2, 2.5);
        ctx.strokeStyle = 'rgba(15, 35, 75, 0.09)';
        ctx.lineWidth = lineW + 2.5;
        buildPath();
        ctx.stroke();
        ctx.restore();
      }

      // Subtle ambient rim outline so white/bright bows pop against studio backdrop
      ctx.strokeStyle = 'rgba(15, 35, 75, 0.20)';
      ctx.lineWidth = lineW + 1.8;
      buildPath();
      ctx.stroke();

      // Base material coat
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      buildPath();
      ctx.stroke();

      // Gentle lower-right cylindrical shadow band
      ctx.save();
      ctx.translate(lineW * 0.12, lineW * 0.12);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.13)';
      ctx.lineWidth = lineW * 0.62;
      buildPath();
      ctx.stroke();
      ctx.restore();

      // Upper-left lit body restore
      ctx.save();
      ctx.translate(-lineW * 0.09, -lineW * 0.09);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW * 0.62;
      buildPath();
      ctx.stroke();
      ctx.restore();

      // Soft satin specular highlight ridge
      ctx.save();
      ctx.translate(-lineW * 0.20, -lineW * 0.20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
      ctx.lineWidth = Math.max(1.2, lineW * 0.14);
      buildPath();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    // 1. Draw Bright Wii Sports Resort Studio Backdrop & Floor Shadow
    const gradient = ctx.createRadialGradient(centerX - 30, centerY - 30, 30, centerX, centerY, width * 0.7);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.55, '#eef6ff');
    gradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle Wii alignment grid
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 20; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 20; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Soft studio floor shadow beneath the bow
    const floorShadow = ctx.createRadialGradient(centerX + 10, height - 26, 8, centerX + 10, height - 26, 120);
    floorShadow.addColorStop(0, 'rgba(15, 55, 110, 0.10)');
    floorShadow.addColorStop(1, 'rgba(15, 55, 110, 0)');
    ctx.fillStyle = floorShadow;
    ctx.beginPath();
    ctx.ellipse(centerX + 10, height - 26, 120, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stabilizer rod (3D cylindrical rod + metallic gold weight)
    if (bow.stabilizer !== 'none') {
      const rodLength = bow.stabilizer === 'olympic_long' ? 140 : 70;
      const rodX = centerX + 15;
      const rodY = centerY;

      strokeSculpted(
        () => {
          ctx.beginPath();
          ctx.moveTo(rodX, rodY);
          ctx.lineTo(rodX + rodLength, rodY);
        },
        '#334155',
        7
      );

      ctx.save();
      // Damper cylinder
      const damperGrad = ctx.createLinearGradient(0, rodY - 6, 0, rodY + 6);
      damperGrad.addColorStop(0, '#94a3b8');
      damperGrad.addColorStop(0.5, '#475569');
      damperGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = damperGrad;
      ctx.fillRect(rodX + rodLength - 8, rodY - 6, 9, 12);

      // 3D Gold weight sphere/disc
      const weightGrad = ctx.createRadialGradient(
        rodX + rodLength + 4,
        rodY - 2,
        1,
        rodX + rodLength + 6,
        rodY,
        7.5
      );
      weightGrad.addColorStop(0, '#fef08a');
      weightGrad.addColorStop(0.55, '#f59e0b');
      weightGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = weightGrad;
      ctx.beginPath();
      ctx.arc(rodX + rodLength + 6, rodY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,35,75,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // V-bar angled side rods
      if (bow.stabilizer === 'vbar_multi') {
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(rodX + 15, rodY);
            ctx.lineTo(rodX - 30, rodY - 50);
          },
          '#475569',
          4.5,
          false
        );
        strokeSculpted(
          () => {
            ctx.beginPath();
            ctx.moveTo(rodX + 15, rodY);
            ctx.lineTo(rodX - 30, rodY + 50);
          },
          '#475569',
          4.5,
          false
        );
      }
      ctx.restore();
    }

    // Limb flexion calculation
    const limbFlexX = tension * 18;
    const stringPullX = centerX - 40 - tension * 100;

    // Limb Tip coordinates
    let topTipX = centerX - 12 - limbFlexX;
    let topTipY = centerY - halfHeight + (tension * 8);
    let botTipX = centerX - 12 - limbFlexX;
    let botTipY = centerY + halfHeight - (tension * 8);

    if (bow.type === 'traditional') {
      topTipX = centerX - 25 - limbFlexX;
      botTipX = centerX - 25 - limbFlexX;
    } else if (bow.type === 'compound') {
      topTipX = centerX + 5 - limbFlexX * 0.6;
      botTipX = centerX + 5 - limbFlexX * 0.6;
    }

    // 2. Draw 3D Sculpted Limbs
    const limbW = bow.type === 'compound' ? 15 : 13;
    const isRoyalJoseon =
      bow.id === 'joseon_yegung' ||
      bow.name.includes('대사례') ||
      (bow.limbPattern === 'dragon' && bow.riserMaterial === 'gold');

    type Pt = [number, number];
    const upperCurve: [Pt, Pt, Pt, Pt] =
      bow.type === 'recurve' || bow.type === 'tactical'
        ? [
            [centerX, centerY - 45],
            [centerX + 28 - limbFlexX * 0.3, centerY - halfHeight * 0.5],
            [centerX + 15 - limbFlexX * 0.7, centerY - halfHeight * 0.85],
            [topTipX, topTipY],
          ]
        : bow.type === 'compound'
        ? [
            [centerX, centerY - 45],
            [centerX + 35, centerY - halfHeight * 0.4],
            [centerX + 25, centerY - halfHeight * 0.75],
            [topTipX, topTipY],
          ]
        : [
            [centerX, centerY - 45],
            [centerX - 10 - limbFlexX * 0.5, centerY - halfHeight * 0.4],
            [centerX + 30 - limbFlexX * 0.8, centerY - halfHeight * 0.75],
            [topTipX, topTipY],
          ];

    const lowerCurve: [Pt, Pt, Pt, Pt] =
      bow.type === 'recurve' || bow.type === 'tactical'
        ? [
            [centerX, centerY + 45],
            [centerX + 28 - limbFlexX * 0.3, centerY + halfHeight * 0.5],
            [centerX + 15 - limbFlexX * 0.7, centerY + halfHeight * 0.85],
            [botTipX, botTipY],
          ]
        : bow.type === 'compound'
        ? [
            [centerX, centerY + 45],
            [centerX + 35, centerY + halfHeight * 0.4],
            [centerX + 25, centerY + halfHeight * 0.75],
            [botTipX, botTipY],
          ]
        : [
            [centerX, centerY + 45],
            [centerX - 10 - limbFlexX * 0.5, centerY + halfHeight * 0.4],
            [centerX + 30 - limbFlexX * 0.8, centerY + halfHeight * 0.75],
            [botTipX, botTipY],
          ];

    const drawCurve = (c: [Pt, Pt, Pt, Pt]) => {
      ctx.beginPath();
      ctx.moveTo(c[0][0], c[0][1]);
      ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]);
    };

    const sampleCurve = (c: [Pt, Pt, Pt, Pt], t: number) => {
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

    strokeSculpted(() => drawCurve(upperCurve), bow.limbColor, limbW);
    strokeSculpted(() => drawCurve(lowerCurve), bow.limbColor, limbW);

    // Limb Pattern accents
    if (bow.limbPattern === 'dragon' || isRoyalJoseon) {
      // Ornate Royal Joseon Oriental Pattern: Gold bands, Dancheong rings, Dangcho vine scroll & cloud medallions
      const drawOrientalLimbPattern = (curve: [Pt, Pt, Pt, Pt]) => {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const halfW = limbW * 0.44;

        // 1. Gold Leaf & Dancheong Jade/Crimson Collar Bands near root & tip
        const drawBand = (t: number, col: string, w: number) => {
          const p = sampleCurve(curve, t);
          ctx.strokeStyle = col;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(p.x - p.nx * halfW, p.y - p.ny * halfW);
          ctx.lineTo(p.x + p.nx * halfW, p.y + p.ny * halfW);
          ctx.stroke();
        };

        drawBand(0.08, '#d97706', 3.2);
        drawBand(0.08, '#fde047', 1.5);
        drawBand(0.115, '#10b981', 2.0);
        drawBand(0.15, '#d97706', 2.8);
        drawBand(0.15, '#fef08a', 1.2);

        drawBand(0.84, '#d97706', 2.8);
        drawBand(0.84, '#fef08a', 1.2);
        drawBand(0.875, isRoyalJoseon ? '#10b981' : bow.riserColor, 2.0);
        drawBand(0.91, '#d97706', 3.2);
        drawBand(0.91, '#fde047', 1.5);

        // 2. Flowing Dangcho (당초문) Golden Vine Scroll along center of limb
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const steps = 28;
        for (let i = 0; i <= steps; i++) {
          const t = 0.20 + (i / steps) * 0.59;
          const p = sampleCurve(curve, t);
          const wave = Math.sin(i * 0.85) * (limbW * 0.22);
          const px = p.x + p.nx * wave;
          const py = p.y + p.ny * wave;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Highlight thread on vine
        ctx.strokeStyle = 'rgba(254, 249, 195, 0.75)';
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // 3. Royal Cloud Spiral Buds & Diamond Medallions (운문 & 금박 마름모)
        const motifStops = [0.27, 0.42, 0.57, 0.72];
        motifStops.forEach((t, idx) => {
          const p = sampleCurve(curve, t);
          const sign = idx % 2 === 0 ? 1 : -1;

          // Gold diamond medallion at center
          const r = isRoyalJoseon ? 3.2 : 2.6;
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x + p.tx * r * 1.25, p.y + p.ty * r * 1.25);
          ctx.lineTo(p.x + p.nx * r, p.y + p.ny * r);
          ctx.lineTo(p.x - p.tx * r * 1.25, p.y - p.ty * r * 1.25);
          ctx.lineTo(p.x - p.nx * r, p.y - p.ny * r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Tiny crimson/jade royal jewel center dot
          ctx.fillStyle = idx % 2 === 0 ? '#10b981' : '#ef4444';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Delicate spiral cloud curl branching off vine
          const cx = p.x + p.nx * (sign * limbW * 0.22);
          const cy = p.y + p.ny * (sign * limbW * 0.22);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(cx, cy, 1.8, 0, Math.PI * 1.4);
          ctx.stroke();
        });

        ctx.restore();
      };

      drawOrientalLimbPattern(upperCurve);
      drawOrientalLimbPattern(lowerCurve);
    } else if (bow.limbPattern === 'stripes') {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = bow.riserColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(centerX + 18, centerY - halfHeight * 0.6, 12, 0, Math.PI * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX + 18, centerY + halfHeight * 0.6, 12, 0, Math.PI * 0.8);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Compound Cams (3D Metallic Pulleys)
    if (bow.type === 'compound') {
      ctx.save();
      const drawPreviewCam = (cx: number, cy: number, rot: number) => {
        const camGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 18);
        camGrad.addColorStop(0, '#475569');
        camGrad.addColorStop(0.65, '#0f172a');
        camGrad.addColorStop(1, '#020617');
        ctx.fillStyle = camGrad;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 18, rot, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      };

      drawPreviewCam(topTipX + 2, topTipY, Math.PI / 6);
      drawPreviewCam(botTipX + 2, botTipY, -Math.PI / 6);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(topTipX, topTipY + 5);
      ctx.lineTo(botTipX + 10, botTipY - 10);
      ctx.moveTo(botTipX, botTipY - 5);
      ctx.lineTo(topTipX + 10, topTipY + 10);
      ctx.stroke();
      ctx.restore();
    }

    // 4. 3D Sculpted Riser (Center Handle Frame)
    const drawRiserPath = () => {
      ctx.beginPath();
      ctx.moveTo(centerX - 4, centerY - 65);
      ctx.lineTo(centerX + 12, centerY - 45);
      ctx.lineTo(centerX + 18, centerY - 15);
      ctx.lineTo(centerX + 8, centerY);
      ctx.lineTo(centerX + 14, centerY + 25);
      ctx.lineTo(centerX + 8, centerY + 45);
      ctx.lineTo(centerX - 4, centerY + 65);
    };
    strokeSculpted(drawRiserPath, bow.riserColor, 19);

    // Royal Riser Gold Filigree & Dancheong Collars
    if (bow.limbPattern === 'dragon' || isRoyalJoseon) {
      ctx.save();
      ctx.lineCap = 'round';
      // Gold scrollwork along upper riser window curve
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(centerX + 1, centerY - 56);
      ctx.quadraticCurveTo(centerX + 12, centerY - 43, centerX + 15, centerY - 22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 12, centerY + 26);
      ctx.quadraticCurveTo(centerX + 10, centerY + 42, centerX + 1, centerY + 56);
      ctx.stroke();

      // Gold collar bands framing riser ends
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY - 58);
      ctx.lineTo(centerX + 4, centerY - 56);
      ctx.moveTo(centerX - 10, centerY + 58);
      ctx.lineTo(centerX + 4, centerY + 56);
      ctx.stroke();
      ctx.restore();
    }

    // 3D Sculpted Ergonomic Grip Wrap
    strokeSculpted(
      () => {
        ctx.beginPath();
        ctx.moveTo(centerX + 7, centerY - 10);
        ctx.lineTo(centerX + 9, centerY + 18);
      },
      bow.gripColor,
      21,
      false
    );

    // Tactile grip wrap ridges or Royal Silk Brocade Diamond Lattice (금사 비단 매듭)
    ctx.save();
    if (bow.limbPattern === 'dragon' || isRoyalJoseon) {
      // Gold top & bottom binding rings around silk grip
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 3, centerY - 12);
      ctx.lineTo(centerX + 17, centerY - 12);
      ctx.moveTo(centerX - 1, centerY + 20);
      ctx.lineTo(centerX + 19, centerY + 20);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Diagonal diamond brocade gold cross-hatch
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
      ctx.lineWidth = 1.2;
      for (let gy = centerY - 8; gy <= centerY + 12; gy += 7) {
        ctx.beginPath();
        ctx.moveTo(centerX - 1, gy);
        ctx.lineTo(centerX + 16, gy + 7);
        ctx.moveTo(centerX + 16, gy);
        ctx.lineTo(centerX - 1, gy + 7);
        ctx.stroke();
      }
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      for (let gy = centerY - 6; gy <= centerY + 14; gy += 5) {
        ctx.beginPath();
        ctx.moveTo(centerX - 1, gy);
        ctx.lineTo(centerX + 16, gy);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 5. Sight Bracket & 3D Housing
    if (bow.sight !== 'none') {
      const sightX = centerX + 26;
      const sightY = centerY - 25;

      ctx.save();
      strokeSculpted(
        () => {
          ctx.beginPath();
          ctx.moveTo(centerX + 14, sightY);
          ctx.lineTo(sightX, sightY);
        },
        '#475569',
        4.5,
        false
      );

      // 3D Metallic Sight Housing
      const housingGrad = ctx.createRadialGradient(sightX + 9, sightY - 3, 1, sightX + 12, sightY, 10);
      housingGrad.addColorStop(0, '#334155');
      housingGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = housingGrad;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(sightX + 12, sightY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Fiber optic dot
      ctx.fillStyle = bow.sightColor;
      ctx.shadowColor = bow.sightColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sightX + 12, sightY, 3.2, 0, Math.PI * 2);
      ctx.fill();

      if (bow.sight === 'pin_multi') {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(sightX + 12, sightY - 4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(sightX + 12, sightY + 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. 3D Arrow (when nocked on bowstring)
    const arrowLength = 220;
    const arrowNockX = stringPullX;
    const arrowNockY = centerY;
    const arrowTipX = arrowNockX + arrowLength;
    const arrowTipY = centerY;

    strokeSculpted(
      () => {
        ctx.beginPath();
        ctx.moveTo(arrowNockX, arrowNockY);
        ctx.lineTo(arrowTipX, arrowTipY);
      },
      bow.arrowShaftColor,
      5.2
    );

    // Royal Gold & Crimson Arrow Cresting Bands (왕실 예궁 화살 금박 띠)
    if (isRoyalJoseon) {
      ctx.save();
      const crestX = arrowNockX + 54;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(crestX, arrowNockY - 2.6, 4, 5.2);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(crestX + 6, arrowNockY - 2.6, 3, 5.2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(crestX + 11, arrowNockY - 2.6, 5, 5.2);
      ctx.restore();
    }

    ctx.save();
    // 3D Faceted Steel Arrow Tip
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(arrowTipX, arrowTipY - 5.5);
    ctx.lineTo(arrowTipX + 17, arrowTipY);
    ctx.lineTo(arrowTipX, arrowTipY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(arrowTipX, arrowTipY);
    ctx.lineTo(arrowTipX + 17, arrowTipY);
    ctx.lineTo(arrowTipX, arrowTipY + 5.5);
    ctx.closePath();
    ctx.fill();

    // Sculpted 3D Fletchings with ridge highlight
    const drawStudioFletch = (pts: [number, number][]) => {
      ctx.fillStyle = bow.arrowFletchColor;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(15, 35, 75, 0.18)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(pts[1][0], pts[1][1]);
      ctx.lineTo(pts[2][0], pts[2][1]);
      ctx.stroke();
    };

    drawStudioFletch([
      [arrowNockX + 8, arrowNockY],
      [arrowNockX + 22, arrowNockY - 9.5],
      [arrowNockX + 50, arrowNockY - 9.5],
      [arrowNockX + 44, arrowNockY],
    ]);
    drawStudioFletch([
      [arrowNockX + 8, arrowNockY],
      [arrowNockX + 22, arrowNockY + 9.5],
      [arrowNockX + 50, arrowNockY + 9.5],
      [arrowNockX + 44, arrowNockY],
    ]);

    // Glossy Nock
    ctx.fillStyle = bow.arrowNockColor;
    ctx.beginPath();
    ctx.arc(arrowNockX + 3, arrowNockY, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(arrowNockX + 2, arrowNockY - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Bowstring
    ctx.save();
    ctx.strokeStyle = 'rgba(15, 35, 75, 0.14)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(topTipX, topTipY);
    ctx.lineTo(stringPullX, centerY);
    ctx.lineTo(botTipX, botTipY);
    ctx.stroke();

    ctx.strokeStyle = bow.stringColor === '#ffffff' ? '#e2e8f0' : bow.stringColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(topTipX, topTipY);
    ctx.lineTo(stringPullX, centerY);
    ctx.lineTo(botTipX, botTipY);
    ctx.stroke();

    // Nocking brass bead
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(stringPullX, centerY, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(stringPullX - 1, centerY - 1, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  }, [bow, drawTension]);

  return (
    <div id="bow-preview-card" className="wii-panel flex flex-col rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold tracking-wide text-sky-600 block">
            장비 프리뷰
          </span>
          {onRenameBow ? (
            <div className="group flex items-center gap-1 mt-0.5">
              <input
                ref={nameInputRef}
                id="bow-name-input"
                type="text"
                value={bow.name}
                onChange={e => onRenameBow(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                maxLength={30}
                placeholder="활의 이름을 지어주세요"
                aria-label="활 이름 편집"
                className="w-full max-w-xs bg-transparent hover:bg-sky-50/80 focus:bg-white border-2 border-transparent hover:border-sky-200 focus:border-sky-400 rounded-xl px-2 py-0.5 -ml-2 text-lg font-extrabold text-slate-900 tracking-tight focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  archeryAudio.playClickSound();
                  nameInputRef.current?.focus();
                }}
                title="활 이름 수정"
                aria-label="활 이름 수정"
                className="p-1.5 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {bow.name}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1 text-xs font-bold text-slate-500 tabular-nums">
          <span className="text-sky-600">{bow.drawWeight} lbs</span>
          <span aria-hidden="true">·</span>
          <span className="uppercase">{bow.type}</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-sky-50 border-2 border-sky-200/80 flex items-center justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={580}
          height={320}
          className="w-full h-full object-contain"
        />

        {/* Interactive Test Draw Action Button */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 bg-white/92 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-sky-200/90 shadow-md">
          <div className="text-xs text-slate-700 flex items-center gap-2">
            <span className="font-bold text-slate-800">장력 테스트</span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="text-slate-600 font-medium tabular-nums">당김 정도 {Math.round(drawTension * 100)}%</span>
          </div>

          <button
            id="test-draw-btn"
            type="button"
            onMouseDown={handleTestDrawStart}
            onMouseUp={handleTestDrawEnd}
            onTouchStart={handleTestDrawStart}
            onTouchEnd={handleTestDrawEnd}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer select-none border whitespace-nowrap ${
              isDrawing
                ? 'wii-gloss-orange text-slate-950 border-amber-300'
                : 'wii-gloss-blue text-white border-sky-300'
            }`}
          >
            {isDrawing ? '활시위 만작 중 (놓으면 발사)!' : '활시위 당겨보기 (누르고 있기)'}
          </button>
        </div>
      </div>

      {/* Bow Live Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
        <div className="bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-2xl p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>탄속 (탄도)</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900 tabular-nums">{stats.velocity}</span>
            <span className="text-[10px] text-slate-500 font-medium">fps</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (stats.velocity / 360) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-2xl p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>조준 안정성</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900 tabular-nums">{stats.stability}</span>
            <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.stability}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-2xl p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>바람 저항력</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900 tabular-nums">{stats.windResistance}</span>
            <span className="text-[10px] text-slate-500 font-medium">%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.windResistance}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-50 to-sky-50/40 rounded-2xl p-3 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>조준 배율</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900 tabular-nums">{stats.zoomLevel}x</span>
            <span className="text-[10px] text-slate-500 font-medium">zoom</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-400 to-violet-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((stats.zoomLevel - 1) / 0.5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
