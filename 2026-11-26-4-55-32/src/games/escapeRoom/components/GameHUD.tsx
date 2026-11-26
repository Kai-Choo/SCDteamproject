import React from 'react';
import { StageId } from '../types/game';
import { BookOpen, Backpack, HelpCircle, Settings, Volume2, VolumeX, Eye, EyeOff, Sparkles, ChevronRight } from 'lucide-react';
import { sound } from '../services/soundService';

interface GameHUDProps {
  currentStage: StageId;
  stageName: string;
  subLocationTitle?: string;
  currentObjective: string;
  inventoryCount: number;
  cluesCount: number;
  showHotspotGlow: boolean;
  onToggleHotspotGlow: () => void;
  onOpenInventory: () => void;
  onOpenClues: () => void;
  onOpenHints: () => void;
  onOpenSettings: () => void;
  isSfxMuted: boolean;
  onToggleSound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  currentStage,
  stageName,
  subLocationTitle,
  currentObjective,
  inventoryCount,
  cluesCount,
  showHotspotGlow,
  onToggleHotspotGlow,
  onOpenInventory,
  onOpenClues,
  onOpenHints,
  onOpenSettings,
  isSfxMuted,
  onToggleSound,
}) => {
  const stagesList: StageId[] = ['STAGE_1_LAB', 'STAGE_2_VILLAGE', 'STAGE_3_LIVING', 'STAGE_4_ALTAR', 'FINAL_STAGE_RETURN'];
  const stageIndex = stagesList.indexOf(currentStage);

  return (
    <header className="absolute top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Minimal Wordmark & Sub-location Breadcrumb */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800/90 backdrop-blur-md shadow-xl flex items-center gap-2 text-stone-200">
          <span className="font-bold text-xs sm:text-sm text-amber-200 font-editorial">
            고강선사유적
          </span>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-[11px] sm:text-xs text-amber-400 font-semibold hidden sm:inline">
            {stageName}
          </span>
          {subLocationTitle && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-[11px] sm:text-xs text-stone-300 font-medium">
                {subLocationTitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Thin Sleek Objective Pill */}
      {currentObjective && (
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-950/80 border border-amber-800/40 text-xs text-amber-100/90 backdrop-blur-md shadow-lg pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentObjective}</span>
        </div>
      )}

      {/* Right: Sleek Action Icons */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Toggle Interactable Object Glow */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleHotspotGlow();
          }}
          className={`p-2 rounded-xl border transition-all backdrop-blur-md shadow-lg ${
            showHotspotGlow
              ? 'bg-amber-950/80 border-amber-600/80 text-amber-300 ring-1 ring-amber-400/40'
              : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
          title={showHotspotGlow ? '탐색 가이드 끄기' : '조사 가능한 오브젝트 강조 켜기'}
        >
          {showHotspotGlow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Quick Sound Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleSound();
          }}
          className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-amber-200 transition-colors backdrop-blur-md shadow-lg"
          title={isSfxMuted ? '음소거 해제' : '음소거'}
        >
          {isSfxMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-stone-300" />}
        </button>

        {/* Hint Button */}
        {currentStage !== 'ENDING' && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenHints();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md shadow-lg"
            title="힌트 보기"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">힌트</span>
          </button>
        )}

        {/* Clue Journal Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenClues();
          }}
          className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md shadow-lg"
          title="발굴 단서 수첩"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">단서 수첩</span>
          {cluesCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-600 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {cluesCount}
            </span>
          )}
        </button>

        {/* Backpack Inventory Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenInventory();
          }}
          className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md shadow-lg"
          title="소지품 보관함"
        >
          <Backpack className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">소지품</span>
          {inventoryCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-600 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {inventoryCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-amber-200 transition-colors backdrop-blur-md shadow-lg"
          title="설정"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
