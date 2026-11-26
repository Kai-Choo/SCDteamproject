import React from 'react';
import { InventoryItem, StageId } from '../types/game';
import { Eye, Settings, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';

interface RustyLakeEscapeLayoutProps {
  currentStage: StageId;
  stageName: string;
  subLocationTitle?: string;
  inventory: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (item: InventoryItem) => void;
  onOpenClues: () => void;
  onOpenSettings: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  children: React.ReactNode;
}

export const RustyLakeEscapeLayout: React.FC<RustyLakeEscapeLayoutProps> = ({
  stageName,
  subLocationTitle,
  inventory,
  selectedItemId,
  onSelectItem,
  onOpenClues,
  onOpenSettings,
  onNavigatePrev,
  onNavigateNext,
  children,
}) => {
  // 6 square slots on the right vertical column (matching the uploaded screenshot!)
  const totalSlots = 6;
  const slots = Array.from({ length: totalSlots }, (_, i) => inventory[i] || null);

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-row rounded-2xl overflow-hidden border-4 border-[#242424] bg-black shadow-2xl relative select-none">
      {/* ==================== CENTER/LEFT: MAIN GAME VIEWPORT ==================== */}
      <section className="flex-1 flex flex-col relative overflow-hidden bg-stone-950">
        {/* Top-Left Location Indicator */}
        <div className="absolute top-3 left-4 z-40 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/80 border border-stone-800 text-stone-200 text-xs font-serif shadow-lg backdrop-blur-sm">
            <span className="text-amber-300 font-bold">{stageName}</span>
            {subLocationTitle && (
              <span className="text-stone-400 ml-1.5">· {subLocationTitle}</span>
            )}
          </div>
        </div>

        {/* Side Room Navigation Arrow: LEFT (◀) */}
        {onNavigatePrev && (
          <button
            onClick={() => {
              sound.playClick();
              onNavigatePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-35 w-8 h-12 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-lg"
            title="이전 장소로 둘러보기 (◀)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Side Room Navigation Arrow: RIGHT (▶) */}
        {onNavigateNext && (
          <button
            onClick={() => {
              sound.playClick();
              onNavigateNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-35 w-8 h-12 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-lg"
            title="다음 장소로 둘러보기 (▶)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Main Room Viewport */}
        <div className="relative w-full h-full flex-1 flex flex-col justify-center overflow-hidden">
          {children}
        </div>
      </section>

      {/* ==================== RIGHT: VERTICAL INVENTORY COLUMN (Screenshot Match!) ==================== */}
      <aside className="w-16 sm:w-20 bg-[#161616] border-l-2 border-[#2b2b2b] flex flex-col items-center justify-between py-2 px-1.5 z-30 shrink-0">
        {/* Top Control Icons (Eye + Settings, matching screenshot!) */}
        <div className="flex items-center justify-around w-full px-1 py-1 mb-1">
          <button
            onClick={() => {
              sound.playClick();
              onOpenClues();
            }}
            className="p-1 text-stone-400 hover:text-white"
            title="단서 수첩"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-1 text-stone-400 hover:text-white"
            title="환경 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Square Inventory Slots (Matching Screenshot!) */}
        <div className="flex-1 flex flex-col justify-around w-full gap-1.5 py-1">
          {slots.map((item, idx) => {
            const isSelected = item && item.id === selectedItemId;
            return (
              <button
                key={idx}
                disabled={!item}
                draggable={!!item}
                onDragStart={(e) => {
                  if (item) {
                    e.dataTransfer.setData('text/plain', item.id);
                  }
                }}
                onClick={() => {
                  if (item) {
                    sound.playClick();
                    onSelectItem(item);
                  }
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-lg border transition-all flex flex-col items-center justify-center relative ${
                  item
                    ? isSelected
                      ? 'bg-[#e2d5c3] border-white shadow-[0_0_12px_rgba(255,255,255,0.7)] scale-105 cursor-pointer ring-2 ring-amber-400 text-stone-900'
                      : 'bg-[#cfc1ac] border-[#5e5345] hover:brightness-110 cursor-pointer text-stone-900'
                    : 'bg-[#1f1f1f] border-[#292929] cursor-default opacity-40'
                }`}
                title={item ? `${item.name} (선택하여 사용할 곳을 클릭하세요)` : `빈 슬롯 ${idx + 1}`}
              >
                {item ? (
                  <>
                    <ItemIcon itemId={item.id} className="w-7 h-7 drop-shadow-sm" />
                    <span className="text-[8px] text-stone-800 font-bold truncate max-w-[42px] leading-tight">
                      {item.name.slice(0, 3)}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-700 font-mono">{idx + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
