import React, { useState, useRef } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { sound } from '../services/soundService';
import { InventoryItem, ClueItem } from '../types/game';

interface Stage1LabProps {
  onStageComplete: (reward: InventoryItem, newClues: ClueItem[]) => void;
  onAddClue: (clue: ClueItem) => void;
  inventory: InventoryItem[];
  selectedItemId?: string | null;
  onSelectItem?: (item: InventoryItem) => void;
  showHotspotGlow?: boolean;
}

const CuteWashBrush: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 180 70" className={className} fill="none" style={{ filter: 'drop-shadow(0 4px 6px rgba(77,40,16,0.35))' }}>
    <path
      d="M 10 35 C 10 24 22 18 45 20 L 112 24 L 112 46 L 45 50 C 22 52 10 46 10 35 Z"
      fill="#b5652d"
      stroke="#4d2810"
      strokeWidth="3.5"
    />
    <rect x="112" y="21" width="22" height="28" rx="3" fill="#ffd166" stroke="#4d2810" strokeWidth="3.5" />
    <path
      d="M 134 20 L 166 15 C 172 15 174 20 174 35 C 174 50 172 55 166 55 L 134 50 Z"
      fill="#f3d299"
      stroke="#4d2810"
      strokeWidth="3.5"
    />
    <line x1="146" y1="24" x2="168" y2="21" stroke="#c49450" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="146" y1="35" x2="170" y2="35" stroke="#c49450" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="146" y1="46" x2="168" y2="49" stroke="#c49450" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Stage1Lab: React.FC<Stage1LabProps> = ({
  onStageComplete,
  onAddClue
}) => {
  const [isHoldingBrush, setIsHoldingBrush] = useState(false);
  const [brushPos, setBrushPos] = useState({ x: 0, y: 0 });
  const [brushAngle, setBrushAngle] = useState(20);
  const [brushStrokeCount, setBrushStrokeCount] = useState(0);
  const [hasCleanedPottery, setHasCleanedPottery] = useState(false);
  const [isRelicDropped, setIsRelicDropped] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [dustParticles, setDustParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastBrushSoundTime = useRef(0);
  const lastMouseX = useRef(0);

  const sweepPottery = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastBrushSoundTime.current > 130) {
      sound.playBrushSoil();
      lastBrushSoundTime.current = now;
      const pId = Date.now() + Math.random();
      setDustParticles(prev => [...prev.slice(-6), { id: pId, x, y }]);
      setBrushStrokeCount(prev => {
        const next = prev + 1;
        if (next >= 8) {
          triggerRelicDrop();
        }
        return next;
      });
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoldingBrush || hasCleanedPottery || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBrushPos({ x, y });

    if (e.clientX > lastMouseX.current) {
      setBrushAngle(30);
    } else if (e.clientX < lastMouseX.current) {
      setBrushAngle(10);
    }
    lastMouseX.current = e.clientX;

    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    if (pctX >= 45 && pctX <= 68 && pctY >= 40 && pctY <= 78) {
      sweepPottery(x, y);
    }
  };

  const handlePickBrush = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCleanedPottery) return;
    sound.playClick();
    setIsHoldingBrush(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setBrushPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleTapPottery = (e: React.MouseEvent) => {
    if (hasCleanedPottery || !containerRef.current) return;
    if (!isHoldingBrush) {
      setIsHoldingBrush(true);
    }
    const rect = containerRef.current.getBoundingClientRect();
    sweepPottery(e.clientX - rect.left, e.clientY - rect.top);
  };

  const triggerRelicDrop = () => {
    setHasCleanedPottery(true);
    setIsHoldingBrush(false);

    setTimeout(() => {
      sound.playDropRelic();
      setIsRelicDropped(true);
    }, 350);

    onAddClue({
      id: 'clue_pottery_excavated',
      stageId: 'STAGE_1_LAB',
      title: '고강동 선사시대 토기 발굴',
      category: '현장기록',
      content: '부천 고강동 발굴터에서 토기의 흙을 털어내자 곁에 묻혀 있던 유물이 모습을 드러냈습니다.',
      icon: 'Landmark',
      timestamp: '00:02'
    });
  };

  const handleTouchFallenRelic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRelicDropped || isWarping) return;

    sound.playRelicResonance();
    sound.playTimeWarp();
    setIsWarping(true);

    const relicReward: InventoryItem = {
      id: 'relic_fragment',
      name: '유물',
      category: 'artifact',
      description: '발굴터 토기 곁에서 발견한 비취 유물.',
      detailedLore: '손을 대자마자 기원전 1000년 고강동 선사마을로 빨려 들어갔다.',
      iconName: 'Sparkles',
      acquiredAtStage: 'STAGE_1_LAB'
    };

    const timeWarpClues: ClueItem[] = [
      {
        id: 'clue_time_warp_pottery',
        stageId: 'STAGE_1_LAB',
        title: '유물을 만져 과거로 이동',
        category: '현장기록',
        content: '토기 곁 유물에 손을 댄 순간 3천 년 전 고강동 선사마을로 이동했습니다.',
        icon: 'Clock',
        timestamp: '00:03'
      }
    ];

    setTimeout(() => {
      onStageComplete(relicReward, timeWarpClues);
    }, 2000);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className={`relative w-full h-full min-h-[320px] flex-1 bg-[#d8f3dc] flex flex-col justify-between select-none overflow-hidden ${
        isWarping ? 'brightness-125' : ''
      } ${isHoldingBrush ? 'cursor-none' : ''}`}
    >
      {/* Cute 2D Storybook Excavation Illustration */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${publicAsset('/assets/escape-room/cute_excavation_site_1795598618116.jpg')}')` }}
      />

      {/* Clickable Brush Pickup Area (aligned right over the cute illustrated brush on the sand pit) */}
      {!isHoldingBrush && !hasCleanedPottery && (
        <div
          onClick={handlePickBrush}
          style={{ left: '34%', top: '53%', width: '16%', height: '18%' }}
          className="absolute z-25 cursor-pointer flex items-center justify-center group"
          title="붓 집기"
        >
          <div className="w-9 h-9 rounded-full bg-[#ffca58]/90 border-2 border-[#4d2810] flex items-center justify-center animate-bounce shadow-md">
            <span className="text-sm">🖌️</span>
          </div>
        </div>
      )}

      {/* Clickable / Sweepable Pottery Area */}
      {!hasCleanedPottery && (
        <div
          onClick={handleTapPottery}
          style={{ left: '47%', top: '44%', width: '20%', height: '32%' }}
          className="absolute z-20 cursor-pointer flex flex-col items-center justify-start"
          title="토기 흙 털기"
        >
          {isHoldingBrush && (
            <div className="px-2.5 py-0.5 rounded-full bg-[#fff8eb]/90 border-2 border-[#4d2810] text-[#4d2810] text-[11px] font-black shadow animate-pulse">
              {Math.min(100, Math.round((brushStrokeCount / 8) * 100))}%
            </div>
          )}
        </div>
      )}

      {/* Active Floating Cute Brush */}
      {isHoldingBrush && (
        <div
          style={{
            position: 'absolute',
            left: `${brushPos.x}px`,
            top: `${brushPos.y}px`,
            transform: `translate(-35%, -45%) rotate(${brushAngle}deg)`,
            pointerEvents: 'none',
            zIndex: 60,
            width: '130px',
          }}
        >
          <CuteWashBrush className="w-full h-full" />
        </div>
      )}

      {/* Dust puffs */}
      {dustParticles.map(p => (
        <div
          key={p.id}
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
          className="absolute w-4 h-4 rounded-full bg-[#fff3cc]/80 border border-[#d4a359] animate-ping pointer-events-none z-55"
        />
      ))}

      {/* Cute Curved Jade Relic Appears Beside Pottery */}
      {isRelicDropped && (
        <div
          onClick={handleTouchFallenRelic}
          style={{ left: '66%', top: '62%', width: '13%', height: '17%' }}
          className="absolute z-35 flex items-center justify-center cursor-pointer hover:scale-115 active:scale-95 transition-transform animate-bounce"
          title="유물 만지기"
        >
          <div className="absolute inset-0 rounded-full bg-[#6ee7b7]/50 blur-lg animate-pulse pointer-events-none" />
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(16,185,129,0.7)]">
            <path
              d="M39 25 C54 21 76 31 74 53 C72 73 53 84 38 80 C23 76 19 61 28 51 C36 43 47 49 47 57 C47 64 40 66 38 62"
              fill="#5eead4"
              stroke="#134e4a"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="58" cy="44" r="4" fill="#ffffff" />
          </svg>
        </div>
      )}

      {/* Time Warp Overlay */}
      {isWarping && (
        <div className="absolute inset-0 z-50 bg-gradient-to-br from-[#fef08a]/85 via-white/90 to-[#bae6fd]/85 flex flex-col items-center justify-center text-[#4d2810] animate-in fade-in">
          <div className="text-5xl animate-spin-slow">✨</div>
          <div className="mt-3 text-xl sm:text-2xl font-black">
            기원전 1000년 고강동으로 이동 중...
          </div>
        </div>
      )}
    </div>
  );
};
