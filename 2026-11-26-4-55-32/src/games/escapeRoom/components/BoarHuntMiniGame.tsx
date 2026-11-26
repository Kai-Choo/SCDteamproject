import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';
import { X, Check } from 'lucide-react';

interface BoarEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  hopPhase: number;
}

interface BurstEffect {
  id: number;
  x: number;
  y: number;
}

interface BoarHuntMiniGameProps {
  onComplete: () => void;
  onClose: () => void;
}

const TARGET_BOARS = 5;

const CuteWildBoarSvg: React.FC<{ facingRight: boolean; hop: number }> = ({ facingRight, hop }) => (
  <svg
    viewBox="0 0 100 80"
    className="w-full h-full drop-shadow-[0_4px_6px_rgba(77,40,16,0.45)]"
    style={{
      transform: `scaleX(${facingRight ? 1 : -1}) translateY(${Math.sin(hop) * 4}px)`,
    }}
  >
    <ellipse cx="50" cy="70" rx="28" ry="6" fill="rgba(77,40,16,0.28)" />
    <path d="M26 56 L22 68 M34 56 L36 68" stroke="#4d2810" strokeWidth="6" strokeLinecap="round" />
    <path d="M18 42 Q8 36 14 29 Q18 27 17 33" fill="none" stroke="#4d2810" strokeWidth="3.5" strokeLinecap="round" />
    <ellipse cx="48" cy="45" rx="30" ry="20" fill="#9c6644" stroke="#4d2810" strokeWidth="3.5" />
    <path d="M26 28 L34 21 L42 26 L50 19 L58 26 L66 22" fill="none" stroke="#4d2810" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M62 56 L58 68 M70 55 L75 68" stroke="#4d2810" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="82" cy="48" rx="9" ry="7" fill="#f4a29e" stroke="#4d2810" strokeWidth="3" />
    <circle cx="84" cy="46" r="1.6" fill="#4d2810" />
    <circle cx="80" cy="49" r="1.6" fill="#4d2810" />
    <path d="M77 52 Q86 54 88 43" fill="none" stroke="#fff9e6" strokeWidth="3.5" strokeLinecap="round" />
    <ellipse cx="64" cy="27" rx="5" ry="8" transform="rotate(-18 64 27)" fill="#9c6644" stroke="#4d2810" strokeWidth="3" />
    {/* Cute rosy cheek + big friendly eye */}
    <ellipse cx="67" cy="47" rx="4" ry="2.2" fill="#f28482" opacity="0.8" />
    <circle cx="71" cy="39" r="3.8" fill="#4d2810" />
    <circle cx="72" cy="37.8" r="1.4" fill="#ffffff" />
  </svg>
);

export const BoarHuntMiniGame: React.FC<BoarHuntMiniGameProps> = ({
  onComplete,
  onClose,
}) => {
  const [caughtCount, setCaughtCount] = useState(0);
  const [boars, setBoars] = useState<BoarEntity[]>([
    { id: 1, x: 25, y: 58, vx: 18, vy: 5, facingRight: true, hopPhase: 0 },
    { id: 2, x: 72, y: 45, vx: -16, vy: 6, facingRight: false, hopPhase: 1.5 },
  ]);
  const [bursts, setBursts] = useState<BurstEffect[]>([]);
  const [isDone, setIsDone] = useState(false);

  const nextIdRef = useRef(10);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (isDone) return;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      setBoars(prev =>
        prev.map(b => {
          let nx = b.x + b.vx * dt;
          let ny = b.y + b.vy * dt;
          let nvx = b.vx;
          let nvy = b.vy;
          let facingRight = b.facingRight;

          if (nx <= 10) {
            nx = 10;
            nvx = Math.abs(nvx);
            facingRight = true;
          } else if (nx >= 86) {
            nx = 86;
            nvx = -Math.abs(nvx);
            facingRight = false;
          }

          if (ny <= 32) {
            ny = 32;
            nvy = Math.abs(nvy);
          } else if (ny >= 82) {
            ny = 82;
            nvy = -Math.abs(nvy);
          }

          return {
            ...b,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            facingRight,
            hopPhase: b.hopPhase + dt * 10,
          };
        })
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDone]);

  const handleCatchBoar = (boar: BoarEntity, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDone) return;

    sound.playSuccess();
    const burstId = nextIdRef.current++;
    setBursts(prev => [...prev, { id: burstId, x: boar.x, y: boar.y }]);
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== burstId));
    }, 550);

    const nextCount = caughtCount + 1;
    setCaughtCount(nextCount);

    if (nextCount >= TARGET_BOARS) {
      setIsDone(true);
      setBoars([]);
    } else {
      const fromLeft = Math.random() > 0.5;
      const speed = 15 + Math.random() * 10;
      const spawned: BoarEntity = {
        id: nextIdRef.current++,
        x: fromLeft ? 12 : 84,
        y: 35 + Math.random() * 44,
        vx: fromLeft ? speed : -speed,
        vy: (Math.random() - 0.5) * 14,
        facingRight: fromLeft,
        hopPhase: 0,
      };
      setBoars(prev => prev.map(b => (b.id === boar.id ? spawned : b)));
    }
  };

  return (
    <div className="relative w-full h-full min-h-[340px] flex flex-col justify-between overflow-hidden select-none bg-[#d8f3dc]">
      {/* Cute 2D Storybook Forest Clearing */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/escape-room/cute_forest_boar_bg_1795598618683.jpg')` }}
      />

      {/* Top Counter HUD */}
      <div className="relative z-30 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2 bg-[#fff8eb]/95 border-3 border-[#4d2810] rounded-full px-4 py-1 shadow-md">
          <div className="flex items-center gap-1">
            {Array.from({ length: TARGET_BOARS }).map((_, idx) => (
              <span
                key={idx}
                className={`text-lg sm:text-xl transition-transform duration-200 ${
                  idx < caughtCount ? 'scale-110 opacity-100' : 'opacity-25 grayscale'
                }`}
              >
                🐗
              </span>
            ))}
          </div>
          <span className="text-[#8c5228] font-mono font-black text-sm tabular-nums ml-1">
            {caughtCount}/{TARGET_BOARS}
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="p-2 rounded-full bg-[#fff8eb]/95 border-2 border-[#4d2810] text-[#4d2810] hover:bg-white transition-colors cursor-pointer shadow"
          title="나가기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isDone && (
        <div className="relative z-20 mx-auto mt-1 pointer-events-none">
          <div className="px-4 py-1 rounded-full bg-[#fff8eb]/90 border-2 border-[#4d2810] text-[#4d2810] text-xs sm:text-sm font-black shadow">
            멧돼지 5마리를 터치해서 잡으세요!
          </div>
        </div>
      )}

      <div className="relative flex-1 w-full z-20">
        {boars.map(boar => (
          <button
            key={boar.id}
            type="button"
            onClick={(e) => handleCatchBoar(boar, e)}
            style={{ left: `${boar.x}%`, top: `${boar.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-16 sm:w-24 sm:h-20 cursor-pointer focus:outline-none active:scale-90 transition-transform"
            aria-label="멧돼지 잡기"
          >
            <CuteWildBoarSvg facingRight={boar.facingRight} hop={boar.hopPhase} />
          </button>
        ))}

        {bursts.map(burst => (
          <div
            key={burst.id}
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping"
          >
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-[#4d2810] font-black text-xs shadow">
              잡았다!
            </span>
          </div>
        ))}

        {isDone && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#fffaf0] border-4 border-[#4d2810] rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#fff3cc] border-2 border-[#4d2810] flex items-center justify-center animate-bounce">
                <ItemIcon itemId="pottery_shard_3" className="w-14 h-14" />
              </div>
              <div className="space-y-1">
                <div className="text-[#8c5228] font-black text-lg">
                  멧돼지 사냥 성공!
                </div>
                <div className="text-[#5c3a21] text-xs font-bold">
                  마법의 토기 조각 #3 획득
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playSuccess();
                  onComplete();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-b from-[#ffb732] to-[#e68a00] border-2 border-[#4d2810] text-[#3d1c06] font-black text-sm shadow-[0_3px_0_#4d2810] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>조각 챙기기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
