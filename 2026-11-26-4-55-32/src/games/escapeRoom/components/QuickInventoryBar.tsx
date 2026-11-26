import React from 'react';
import { InventoryItem } from '../types/game';
import { Backpack, BookOpen, HelpCircle, Eye, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

interface QuickInventoryBarProps {
  inventory: InventoryItem[];
  onOpenInventory: () => void;
  onOpenClues: () => void;
  onOpenHints: () => void;
  onSelectItem: (item: InventoryItem) => void;
  selectedItemId?: string | null;
}

export const QuickInventoryBar: React.FC<QuickInventoryBarProps> = ({
  inventory,
  onOpenInventory,
  onOpenClues,
  onOpenHints,
  onSelectItem,
  selectedItemId,
}) => {
  // Always display at least 5 slots (filled with items or empty slots)
  const totalSlots = Math.max(5, inventory.length);
  const slots = Array.from({ length: totalSlots }).map((_, idx) => inventory[idx] || null);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 z-30 mb-2">
      <div className="bg-stone-950/95 border border-stone-800 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Utility Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenHints();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-800/80 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="힌트 보기"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">힌트</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenClues();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="단서 수첩"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">단서 수첩</span>
          </button>
        </div>

        {/* Center: Inventory Slots */}
        <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto py-0.5 px-1 scrollbar-none">
          {slots.map((item, idx) => {
            const isSelected = item && item.id === selectedItemId;
            return (
              <button
                key={idx}
                disabled={!item}
                onClick={() => {
                  if (item) {
                    sound.playClick();
                    onSelectItem(item);
                  }
                }}
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border flex flex-col items-center justify-center transition-all relative shrink-0 ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/80 text-amber-200 ring-2 ring-amber-400/50 shadow-lg scale-105'
                    : item
                    ? 'border-stone-700 bg-stone-900/90 text-amber-200 hover:border-amber-500 hover:bg-stone-800 cursor-pointer shadow-md'
                    : 'border-stone-800/60 bg-stone-950/40 text-stone-700 cursor-default'
                }`}
                title={item ? item.name : '빈 소지품 슬롯'}
              >
                {item ? (
                  <>
                    <span className="text-lg sm:text-xl">
                      {item.category === 'document' ? '📜' : item.category === 'cipher' ? '🔑' : item.category === 'tool' ? '🪓' : '✨'}
                    </span>
                    <span className="text-[9px] text-stone-300 font-medium truncate max-w-[42px] mt-0.5 leading-none px-0.5">
                      {item.name.replace('고강동 ', '').replace('선사시대 ', '')}
                    </span>
                  </>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Full Inventory Button */}
        <div className="shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onOpenInventory();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="소지품 전체보기"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">소지품함 ({inventory.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
