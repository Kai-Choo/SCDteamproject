import React from 'react';
import { StageId } from '../types/game';
import { Lightbulb, BookOpen, Settings, Volume2, VolumeX, RotateCcw, Home, Cloud } from 'lucide-react';
import { sound } from '../services/soundService';

interface ClassicEscapeFrameProps {
  currentStage: StageId;
  stageName: string;
  subLocationTitle?: string;
  playTimeSeconds: number;
  onOpenHints: () => void;
  onOpenClues: () => void;
  onOpenSettings: () => void;
  onOpenDrive?: () => void;
  onResetToBeginning?: () => void;
  onReturnToTitle?: () => void;
  isSfxMuted: boolean;
  onToggleSound: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  children: React.ReactNode;
}

export const ClassicEscapeFrame: React.FC<ClassicEscapeFrameProps> = ({
  stageName,
  playTimeSeconds,
  onOpenHints,
  onOpenClues,
  onOpenSettings,
  onOpenDrive,
  onResetToBeginning,
  onReturnToTitle,
  isSfxMuted,
  onToggleSound,
  children,
}) => {
  const minutes = Math.floor(playTimeSeconds / 60);
  const seconds = playTimeSeconds % 60;

  return (
    <div className="relative w-full max-w-[860px] mx-auto flex flex-col flex-1 min-h-0 shadow-2xl rounded-3xl overflow-hidden border-4 border-[#6e3f20] bg-[#fffaf0] select-none">
      {/* Warm Wooden Storybook Top Bar */}
      <div className="relative z-30 px-3 py-2 bg-gradient-to-r from-[#7d4925] via-[#94582f] to-[#7d4925] border-b-4 border-[#522d14] flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-xl bg-[#522d14] text-[#ffe9b3] text-xs font-black whitespace-nowrap">
            {stageName}
          </span>

          <button
            onClick={() => {
              sound.playClick();
              onOpenHints();
            }}
            className="px-2.5 py-1 rounded-xl bg-[#ffca58] hover:bg-[#ffd67a] border-2 border-[#4d2810] text-[#3d1c06] text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>힌트</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenClues();
            }}
            className="px-2.5 py-1 rounded-xl bg-[#fff4d6] hover:bg-white border-2 border-[#4d2810] text-[#4d2810] text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">단서</span>
          </button>

          {onResetToBeginning && (
            <button
              onClick={() => {
                sound.playClick();
                onResetToBeginning();
              }}
              className="px-2 py-1 rounded-xl bg-[#5c3318] hover:bg-[#4a2812] border border-[#3d1f0c] text-[#ffe9c7] text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="처음부터"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">처음부터</span>
            </button>
          )}

          {onReturnToTitle && (
            <button
              onClick={() => {
                sound.playClick();
                onReturnToTitle();
              }}
              className="px-2 py-1 rounded-xl bg-[#5c3318] hover:bg-[#4a2812] border border-[#3d1f0c] text-[#ffe9c7] text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="메인"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">메인</span>
            </button>
          )}
        </div>

        {/* Right Controls & Timer */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-1.5 rounded-xl bg-[#5c3318] border border-[#3d1f0c] text-[#ffe9c7] hover:text-white cursor-pointer"
            title={isSfxMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isSfxMuted ? <VolumeX className="w-3.5 h-3.5 text-red-300" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {onOpenDrive && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenDrive();
              }}
              className="px-2 py-1 rounded-xl bg-[#3d7a47] hover:bg-[#33693c] border border-[#234729] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Google Drive"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drive</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-1.5 rounded-xl bg-[#5c3318] border border-[#3d1f0c] text-[#ffe9c7] hover:text-white cursor-pointer"
            title="설정"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5 px-2.5 py-0.5 rounded-xl bg-[#522d14] text-[#fff8eb] font-mono tabular-nums ml-1">
            <span className="text-base sm:text-lg font-black">{minutes}</span>
            <span className="text-[11px] text-[#ffca58] font-bold">분</span>
            <span className="text-base sm:text-lg font-black ml-1">
              {seconds < 10 ? `0${seconds}` : seconds}
            </span>
            <span className="text-[11px] text-[#ffca58] font-bold">초</span>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 min-h-0 w-full bg-[#e9f5db] overflow-hidden flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
};
