import React from 'react';
import { GameMode, GameState } from '../types/game';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Sparkles, Snowflake, Heart } from 'lucide-react';
import { sound } from '../utils/audio';

interface HUDProps {
  score: number;
  highScore: number;
  lives: number;
  strikes: number;
  maxLives: number;
  timeLeft: number;
  gameMode: GameMode;
  gameState: GameState;
  feverTimeLeft: number;
  slowMoTimeLeft: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenMenu: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  lives,
  strikes,
  maxLives,
  timeLeft,
  gameMode,
  gameState,
  feverTimeLeft,
  slowMoTimeLeft,
  isMuted,
  onToggleMute,
  onTogglePause,
  onRestart,
  onOpenMenu,
}) => {
  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-30 p-4 md:p-6 flex flex-col justify-between">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between">
        {/* Score & Mode Display */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
            <span>{gameMode === 'CLASSIC' ? '고전 수확 모드' : '풍년 60초 모드'}</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-stone-400">최고 {highScore.toLocaleString()}</span>
          </div>

          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-modern tabular-nums text-4xl md:text-5xl font-extrabold text-stone-100 tracking-tight drop-shadow-md">
              {score.toLocaleString()}
            </span>
            <span className="text-xs text-stone-400 font-medium">낟알</span>
          </div>
        </div>

        {/* Center Indicators (Fever / Slow-Mo / Timer) */}
        <div className="flex flex-col items-center gap-2">
          {gameMode === 'ARCADE' && (
            <div className={`px-4 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
              timeLeft <= 10 
                ? 'bg-red-950/80 border-red-500/80 text-red-200 animate-pulse' 
                : 'bg-stone-900/80 border-stone-800 text-stone-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">남은 시간</span>
                <span className="font-mono tabular-nums text-2xl font-bold">
                  {Math.max(0, Math.ceil(timeLeft))}s
                </span>
              </div>
            </div>
          )}

          {/* Fever Alert Banner */}
          {feverTimeLeft > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/60 rounded-lg backdrop-blur-md animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span className="font-traditional text-xs font-bold text-amber-200">
                풍년 축제! 2배 수확 ({feverTimeLeft.toFixed(1)}s)
              </span>
            </div>
          )}

          {/* Slow-mo Alert Banner */}
          {slowMoTimeLeft > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/60 rounded-lg backdrop-blur-md">
              <Snowflake className="w-4 h-4 text-cyan-300" />
              <span className="font-traditional text-xs font-bold text-cyan-200">
                가을 서리 감속 ({slowMoTimeLeft.toFixed(1)}s)
              </span>
            </div>
          )}
        </div>

        {/* Right Zone: Classic Lives or Utility Controls */}
        <div className="flex items-center gap-3">
          {gameMode === 'CLASSIC' && (
            <div className="flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-stone-800">
              <span className="text-xs text-stone-400 mr-1 hidden sm:inline">돌칼 내구도</span>
              {Array.from({ length: maxLives }).map((_, idx) => {
                const isLost = idx >= lives;
                return (
                  <div key={idx} className="relative">
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isLost
                          ? 'text-stone-700 fill-transparent scale-90'
                          : 'text-amber-500 fill-amber-500 scale-100 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      }`}
                    />
                  </div>
                );
              })}
              {/* Miss Strikes */}
              {strikes > 0 && (
                <div className="flex items-center ml-2 pl-2 border-l border-stone-800 gap-1">
                  {Array.from({ length: strikes }).map((_, idx) => (
                    <span key={idx} className="text-red-500 font-bold text-sm">✕</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interactive Utility Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-xl border border-stone-800">
            <button
              onClick={() => {
                sound.playClick();
                onTogglePause();
              }}
              title={gameState === 'PAUSED' ? '이어하기' : '일시정지'}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              {gameState === 'PAUSED' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              title="다시 시작"
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onToggleMute();
              }}
              title={isMuted ? '음소거 해제' : '음소거'}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
