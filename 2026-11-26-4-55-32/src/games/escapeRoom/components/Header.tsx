import React from 'react';
import { StageId } from '../types/game';
import { BookOpen, Backpack, HelpCircle, Settings, Volume2, VolumeX } from 'lucide-react';
import { STAGES_CONFIG } from '../data/stagesData';

interface HeaderProps {
  currentStage: StageId;
  inventoryCount: number;
  cluesCount: number;
  onOpenInventory: () => void;
  onOpenClues: () => void;
  onOpenHints: () => void;
  onOpenSettings: () => void;
  isSfxMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  inventoryCount,
  cluesCount,
  onOpenInventory,
  onOpenClues,
  onOpenHints,
  onOpenSettings,
  isSfxMuted,
  onToggleSound,
}) => {
  const currentStageConfig = STAGES_CONFIG[currentStage] || STAGES_CONFIG.STAGE_1_LAB;
  const stagesList: StageId[] = ['STAGE_1_LAB', 'STAGE_2_VILLAGE', 'STAGE_3_LIVING', 'STAGE_4_ALTAR', 'FINAL_STAGE_RETURN'];
  const currentStageIndex = stagesList.indexOf(currentStage);

  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-amber-100 font-editorial">
              고강선사유적체험관
            </span>
            <span className="text-[11px] text-amber-500/80 tracking-wider hidden sm:inline">
              시간을 넘어 사라진 유물
            </span>
          </div>
        </div>

        {/* Zone 2: Stage Progress Stepper */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 text-xs">
          {stagesList.map((stId, idx) => {
            const isCompleted = currentStageIndex > idx || currentStage === 'ENDING';
            const isCurrent = currentStage === stId;
            return (
              <div key={stId} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 font-bold ring-2 ring-amber-400/40'
                      : isCompleted
                      ? 'bg-amber-900/60 text-amber-200 border border-amber-700/60'
                      : 'bg-stone-900 text-stone-500 border border-stone-800'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`hidden xl:inline text-[11px] whitespace-nowrap ${
                    isCurrent ? 'text-amber-200 font-semibold' : 'text-stone-500'
                  }`}
                >
                  {stId === 'STAGE_1_LAB' && '조사실'}
                  {stId === 'STAGE_2_VILLAGE' && '선사마을'}
                  {stId === 'STAGE_3_LIVING' && '생활공방'}
                  {stId === 'STAGE_4_ALTAR' && '적석환유구'}
                  {stId === 'FINAL_STAGE_RETURN' && '시간귀환'}
                </span>
                {idx < stagesList.length - 1 && (
                  <div className={`w-3 lg:w-5 h-[1px] ${isCompleted ? 'bg-amber-600/60' : 'bg-stone-800'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="소리 설정"
            className="p-2 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-amber-200 border border-stone-800 transition-colors"
            title={isSfxMuted ? '음소거 해제' : '음소거'}
          >
            {isSfxMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-stone-300" />}
          </button>

          {/* Clues Journal Button */}
          <button
            onClick={onOpenClues}
            className="relative px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">단서 수첩</span>
            {cluesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {cluesCount}
              </span>
            )}
          </button>

          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="relative px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">소지품</span>
            {inventoryCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {inventoryCount}
              </span>
            )}
          </button>

          {/* Hints Button */}
          {currentStage !== 'ENDING' && (
            <button
              onClick={onOpenHints}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>힌트</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="환경 설정"
            className="p-2 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-amber-200 border border-stone-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
