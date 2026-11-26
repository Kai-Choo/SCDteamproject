import React, { useState } from 'react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';
import { Sparkles, X } from 'lucide-react';

interface PotteryAssemblyEscapeProps {
  onConsumeShard: (shardId: string) => void;
  onReturnToPresent: () => void;
  onClose?: () => void;
}

const SHARDS = [
  { id: 'pottery_shard_1', num: 1, label: '구멍무늬 윗조각' },
  { id: 'pottery_shard_2', num: 2, label: '왼쪽 몸통 조각' },
  { id: 'pottery_shard_3', num: 3, label: '오른쪽 몸통 조각' },
  { id: 'pottery_shard_4', num: 4, label: '왼쪽 바닥 조각' },
  { id: 'pottery_shard_5', num: 5, label: '오른쪽 바닥 조각' },
];

export const PotteryAssemblyEscape: React.FC<PotteryAssemblyEscapeProps> = ({
  onConsumeShard,
  onReturnToPresent,
  onClose,
}) => {
  const [placedShards, setPlacedShards] = useState<string[]>([]);
  const [isWarpingHome, setIsWarpingHome] = useState(false);

  const isPlaced = (id: string) => placedShards.includes(id);
  const allPlaced = placedShards.length === SHARDS.length;

  const handlePlaceShard = (shardId: string) => {
    if (isPlaced(shardId) || isWarpingHome) return;

    sound.playSuccess();
    const next = [...placedShards, shardId];
    setPlacedShards(next);
    onConsumeShard(shardId);

    if (next.length === SHARDS.length) {
      sound.playRelicResonance();
      setTimeout(() => {
        sound.playTimeWarp();
        setIsWarpingHome(true);
      }, 650);
      setTimeout(() => {
        onReturnToPresent();
      }, 2800);
    }
  };

  const handleDropOnPot = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && SHARDS.some(s => s.id === draggedId)) {
      handlePlaceShard(draggedId);
    } else {
      const nextRemaining = SHARDS.find(s => !isPlaced(s.id));
      if (nextRemaining) handlePlaceShard(nextRemaining.id);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[340px] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none bg-[#fff5dc]">
      {/* Sunny Storybook Village Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: `url('/assets/escape-room/cute_prehistoric_village_1795598617747.jpg')` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,248,224,0.88)_0%,rgba(255,236,184,0.75)_100%)] pointer-events-none" />

      {/* Top Minimal Prompt */}
      <div className="relative z-20 w-full flex items-center justify-between">
        <div className="w-8" />
        <div className="px-4 py-1.5 rounded-2xl bg-[#fffaf0] border-[3px] border-[#4d2810] text-[#4d2810] text-xs sm:text-sm font-extrabold shadow-[0_3px_0_#4d2810] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d67d1b]" />
          <span>
            {allPlaced
              ? '마법의 토기 완성! 현실로 돌아갑니다...'
              : `토기 조각 5개를 눌러 맞추세요 (${placedShards.length}/5)`}
          </span>
        </div>
        {onClose && !allPlaced ? (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#fffaf0] border-2 border-[#4d2810] text-[#4d2810] hover:bg-[#ffeaad] cursor-pointer shadow-sm"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Center Interactive Pottery Assembly Target */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnPot}
        className="relative z-20 my-auto flex flex-col items-center justify-center"
      >
        <div
          className={`relative w-52 h-56 sm:w-64 sm:h-64 flex items-center justify-center transition-all duration-700 ${
            allPlaced ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,202,88,0.95)]' : ''
          }`}
        >
          {/* Radiant Halo when completed */}
          {allPlaced && (
            <div className="absolute inset-0 rounded-full bg-[#ffca58]/50 blur-2xl animate-pulse pointer-events-none" />
          )}

          {/* 5-Piece Interactive Cute Storybook SVG Pottery */}
          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="potTerra" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e88b50" />
                <stop offset="55%" stopColor="#c9642b" />
                <stop offset="100%" stopColor="#9c4215" />
              </linearGradient>
            </defs>

            {/* Outer Ghost Silhouette */}
            <path
              d="M45 30 L155 30 C168 85 156 155 132 195 L68 195 C44 155 32 85 45 30 Z"
              fill="rgba(255,250,240,0.65)"
              stroke="#4d2810"
              strokeOpacity="0.35"
              strokeWidth="3"
              strokeDasharray="6 5"
            />

            {/* Piece 1: Rim with Gogang-dong Punctate Holes (구멍무늬 윗부분) */}
            <g
              onClick={() => handlePlaceShard('pottery_shard_1')}
              className="cursor-pointer transition-all duration-300"
            >
              <path
                d="M45 30 L155 30 L158 76 L100 84 L42 76 Z"
                fill={isPlaced('pottery_shard_1') ? 'url(#potTerra)' : 'rgba(255,234,173,0.45)'}
                stroke={isPlaced('pottery_shard_1') ? '#4d2810' : 'rgba(77,40,16,0.4)'}
                strokeWidth={isPlaced('pottery_shard_1') ? '4' : '2'}
                strokeLinejoin="round"
              />
              {isPlaced('pottery_shard_1') ? (
                <>
                  <ellipse cx="100" cy="30" rx="55" ry="11" fill="#823410" stroke="#4d2810" strokeWidth="3.5" />
                  <circle cx="62" cy="52" r="3.8" fill="#4d2810" />
                  <circle cx="81" cy="54" r="3.8" fill="#4d2810" />
                  <circle cx="100" cy="55" r="3.8" fill="#4d2810" />
                  <circle cx="119" cy="54" r="3.8" fill="#4d2810" />
                  <circle cx="138" cy="52" r="3.8" fill="#4d2810" />
                </>
              ) : (
                <text x="100" y="60" textAnchor="middle" fill="#4d2810" fontSize="16" fontWeight="900" opacity="0.65">1</text>
              )}
            </g>

            {/* Piece 2: Left Upper/Mid Body */}
            <g
              onClick={() => handlePlaceShard('pottery_shard_2')}
              className="cursor-pointer transition-all duration-300"
            >
              <path
                d="M42 76 L100 84 L96 142 L48 138 C39 116 38 95 42 76 Z"
                fill={isPlaced('pottery_shard_2') ? 'url(#potTerra)' : 'rgba(255,234,173,0.45)'}
                stroke={isPlaced('pottery_shard_2') ? '#4d2810' : 'rgba(77,40,16,0.4)'}
                strokeWidth={isPlaced('pottery_shard_2') ? '4' : '2'}
                strokeLinejoin="round"
              />
              {!isPlaced('pottery_shard_2') && (
                <text x="70" y="114" textAnchor="middle" fill="#4d2810" fontSize="16" fontWeight="900" opacity="0.65">2</text>
              )}
            </g>

            {/* Piece 3: Right Upper/Mid Body */}
            <g
              onClick={() => handlePlaceShard('pottery_shard_3')}
              className="cursor-pointer transition-all duration-300"
            >
              <path
                d="M100 84 L158 76 C162 95 161 116 152 138 L96 142 Z"
                fill={isPlaced('pottery_shard_3') ? 'url(#potTerra)' : 'rgba(255,234,173,0.45)'}
                stroke={isPlaced('pottery_shard_3') ? '#4d2810' : 'rgba(77,40,16,0.4)'}
                strokeWidth={isPlaced('pottery_shard_3') ? '4' : '2'}
                strokeLinejoin="round"
              />
              {!isPlaced('pottery_shard_3') && (
                <text x="130" y="114" textAnchor="middle" fill="#4d2810" fontSize="16" fontWeight="900" opacity="0.65">3</text>
              )}
            </g>

            {/* Piece 4: Left Base */}
            <g
              onClick={() => handlePlaceShard('pottery_shard_4')}
              className="cursor-pointer transition-all duration-300"
            >
              <path
                d="M48 138 L96 142 L102 195 L68 195 C58 176 52 157 48 138 Z"
                fill={isPlaced('pottery_shard_4') ? 'url(#potTerra)' : 'rgba(255,234,173,0.45)'}
                stroke={isPlaced('pottery_shard_4') ? '#4d2810' : 'rgba(77,40,16,0.4)'}
                strokeWidth={isPlaced('pottery_shard_4') ? '4' : '2'}
                strokeLinejoin="round"
              />
              {!isPlaced('pottery_shard_4') && (
                <text x="76" y="172" textAnchor="middle" fill="#4d2810" fontSize="16" fontWeight="900" opacity="0.65">4</text>
              )}
            </g>

            {/* Piece 5: Right Base */}
            <g
              onClick={() => handlePlaceShard('pottery_shard_5')}
              className="cursor-pointer transition-all duration-300"
            >
              <path
                d="M96 142 L152 138 C148 157 142 176 132 195 L102 195 Z"
                fill={isPlaced('pottery_shard_5') ? 'url(#potTerra)' : 'rgba(255,234,173,0.45)'}
                stroke={isPlaced('pottery_shard_5') ? '#4d2810' : 'rgba(77,40,16,0.4)'}
                strokeWidth={isPlaced('pottery_shard_5') ? '4' : '2'}
                strokeLinejoin="round"
              />
              {!isPlaced('pottery_shard_5') && (
                <text x="124" y="172" textAnchor="middle" fill="#4d2810" fontSize="16" fontWeight="900" opacity="0.65">5</text>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom 5 Selectable / Draggable Shards Tray */}
      <div className="relative z-20 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {SHARDS.map(shard => {
          const placed = isPlaced(shard.id);
          return (
            <button
              key={shard.id}
              type="button"
              disabled={placed}
              draggable={!placed}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', shard.id)}
              onClick={() => handlePlaceShard(shard.id)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[3px] flex flex-col items-center justify-center transition-all ${
                placed
                  ? 'opacity-25 scale-90 border-[#b8976a] bg-[#efe6d2] cursor-default'
                  : 'border-[#4d2810] bg-[#fffaf0] hover:scale-110 hover:bg-[#ffeaad] shadow-[0_4px_0_#4d2810] cursor-pointer animate-pulse'
              }`}
              title={shard.label}
            >
              <ItemIcon itemId={shard.id} className="w-9 h-9 sm:w-10 sm:h-10" />
              <span className="text-[10px] font-mono font-black text-[#4d2810] leading-none">
                #{shard.num}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time Warp Portal Overlay Back to 2026 Reality */}
      {isWarpingHome && (
        <div className="absolute inset-0 z-50 bg-gradient-to-br from-[#fff9e6] via-[#ffeaad] to-[#ffd266] animate-in fade-in duration-700 flex flex-col items-center justify-center text-[#4d2810] p-6 text-center">
          <ItemIcon itemId="magic_pottery" className="w-28 h-28 animate-bounce drop-shadow-lg" />
          <p className="mt-4 text-xl sm:text-2xl font-extrabold text-[#4d2810]">
            고강동 마법의 토기 복원 완료!
          </p>
          <p className="mt-1 text-sm font-bold text-[#7d4925]">
            현실의 고강선사유적체험관으로 돌아갑니다...
          </p>
        </div>
      )}
    </div>
  );
};
