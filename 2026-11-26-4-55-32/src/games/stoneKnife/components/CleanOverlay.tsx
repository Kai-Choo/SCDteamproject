import React from 'react';
import { Volume2, VolumeX, RotateCcw, Pause, Play, Heart } from 'lucide-react';
import { sound } from '../utils/audio';

interface CleanOverlayProps {
  score: number;
  lives: number;
  maxLives: number;
  isPaused: boolean;
  isGameOver: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
}

export const CleanOverlay: React.FC<CleanOverlayProps> = ({
  score,
  lives,
  maxLives,
  isPaused,
  isGameOver,
  isMuted,
  onTogglePause,
  onToggleMute,
  onRestart,
}) => {
  return (
    <>
      <div className="absolute inset-x-0 top-0 pointer-events-none z-30 p-4 md:p-6 flex items-start justify-between">
        {/* Score & Hearts (5 lives) */}
        <div className="flex flex-col gap-1.5">
          {/* Pure numeric score without text labels */}
          <div className="flex items-baseline">
            <span className="font-modern tabular-nums text-4xl md:text-5xl font-extrabold text-amber-200/90 tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              {score.toLocaleString()}
            </span>
          </div>

          {/* 5 Hearts displaying blade durability */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {Array.from({ length: maxLives }).map((_, idx) => {
              const isFilled = idx < lives;
              return (
                <div key={idx} className="relative">
                  <Heart
                    className={`w-5 h-5 transition-all duration-300 ${
                      isFilled
                        ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] scale-100'
                        : 'text-stone-700/80 fill-transparent scale-90'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal icon controls: Pause, Restart, Mute */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/60 backdrop-blur-md p-1.5 rounded-xl border border-stone-800/60">
          {!isGameOver && (
            <button
              onClick={() => {
                sound.playClick();
                onTogglePause();
              }}
              aria-label={isPaused ? 'Resume' : 'Pause'}
              className="p-2 text-stone-300 hover:text-amber-300 hover:bg-stone-800/80 rounded-lg transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            aria-label="Restart"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            aria-label="Toggle Sound"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pause Overlay (Large central play button) */}
      {isPaused && !isGameOver && (
        <div
          onClick={() => {
            sound.playClick();
            onTogglePause();
          }}
          className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px] flex items-center justify-center cursor-pointer pointer-events-auto"
        >
          <div className="w-18 h-18 rounded-full bg-stone-900/80 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Game Over Overlay (Hearts all depleted, Large central restart button) */}
      {isGameOver && (
        <div
          onClick={() => {
            sound.playClick();
            onRestart();
          }}
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[3px] flex flex-col items-center justify-center cursor-pointer pointer-events-auto gap-4 animate-in fade-in duration-300"
        >
          <div className="font-modern tabular-nums text-6xl font-extrabold text-amber-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
            {score.toLocaleString()}
          </div>
          <div className="w-20 h-20 rounded-full bg-stone-900/90 border border-red-500/50 flex items-center justify-center text-red-400 shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <RotateCcw className="w-9 h-9" />
          </div>
        </div>
      )}
    </>
  );
};
