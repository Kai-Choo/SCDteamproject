import React from 'react';
import { InventoryItem } from '../types/game';
import { sound } from '../services/soundService';
import { Backpack, Sparkles, HelpCircle } from 'lucide-react';

interface BottomInventoryDockProps {
  inventory: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (item: InventoryItem) => void;
  onOpenFullInventory: () => void;
  onOpenClues: () => void;
  activeObjective: string;
}

export const BottomInventoryDock: React.FC<BottomInventoryDockProps> = ({
  inventory,
  selectedItemId,
  onSelectItem,
  onOpenFullInventory,
  onOpenClues,
  activeObjective,
}) => {
  // Show 6 inventory slots
  const totalSlots = 6;
  const slots = Array.from({ length: totalSlots }, (_, i) => inventory[i] || null);

  return (
    <div className="relative w-full z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-[#241315] border-t-2 border-[#5e2b34] px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Quick Objective Kicker for Kids */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="p-1 rounded-md bg-[#42171e] text-[#f8a5b2]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs text-[#ffccd4] font-medium">
            <strong>할 일:</strong> {activeObjective}
          </span>
        </div>

        {/* Center: Classic 6-Slot Inventory Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center transition-all relative ${
                  item
                    ? isSelected
                      ? 'bg-[#5e212b] border-[#ffccd4] shadow-[0_0_12px_rgba(255,204,212,0.6)] scale-105 cursor-pointer ring-2 ring-[#e8a2ac]'
                      : 'bg-[#3b191e] border-[#78333e] hover:border-[#e8a2ac] hover:bg-[#4d1f27] cursor-pointer'
                    : 'bg-[#180a0c] border-[#381419] cursor-default opacity-50'
                }`}
                title={item ? `${item.name} (클릭하여 자세히 보기)` : '빈 소지품 슬롯'}
              >
                {item ? (
                  <span className="text-xl sm:text-2xl drop-shadow-md">
                    {item.category === 'artifact' ? '🏺' : item.category === 'tool' ? '🗡️' : item.category === 'document' ? '📜' : '🧩'}
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-700 font-mono">{idx + 1}</span>
                )}

                {item && isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Backpack Full View Button */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => {
              sound.playClick();
              onOpenFullInventory();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#3d181e] hover:bg-[#4f1e27] border border-[#6b2c37] text-[#ffccd4] text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Backpack className="w-3.5 h-3.5 text-[#ff99aa]" />
            <span>가방 열기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
