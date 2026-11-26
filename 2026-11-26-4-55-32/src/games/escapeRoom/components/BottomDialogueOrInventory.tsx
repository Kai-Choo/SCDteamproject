import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types/game';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';
import { Backpack, Sparkles } from 'lucide-react';

interface BottomDialogueOrInventoryProps {
  isSpeaking: boolean;
  dialogueText: string;
  onFinishSpeaking: () => void;
  inventory: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (item: InventoryItem) => void;
  onOpenBackpackModal: () => void;
  activeObjective?: string;
}

export const BottomDialogueOrInventory: React.FC<BottomDialogueOrInventoryProps> = ({
  isSpeaking,
  dialogueText,
  onFinishSpeaking,
  inventory,
  selectedItemId,
  onSelectItem,
  onOpenBackpackModal,
  activeObjective,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    if (!isSpeaking) return;
    setDisplayedLength(0);
    const interval = setInterval(() => {
      setDisplayedLength(prev => {
        if (prev < dialogueText.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 24);
    return () => clearInterval(interval);
  }, [dialogueText, isSpeaking]);

  const handleAdvanceDialogue = () => {
    sound.playClick();
    if (displayedLength < dialogueText.length) {
      setDisplayedLength(dialogueText.length);
    } else {
      onFinishSpeaking();
    }
  };

  const totalSlots = 6;
  const slots = Array.from({ length: totalSlots }, (_, i) => inventory[i] || null);

  return (
    <div className="relative w-full z-40 select-none animate-in fade-in duration-200">
      {isSpeaking ? (
        <div
          onClick={handleAdvanceDialogue}
          className="relative w-full max-w-[860px] mx-auto flex items-end justify-between cursor-pointer px-2 sm:px-4 pt-2 pb-1"
        >
          {/* Cute Explorer Bust */}
          <div className="relative z-30 shrink-0 pointer-events-none">
            <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-2xl overflow-hidden border-3 border-[#522d14] shadow-lg bg-[#fff4d6]">
              <img
                src="/assets/escape-room/cute_explorer_avatar_1795598616698.jpg"
                alt="탐험가"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Warm Cream Speech Bubble */}
          <div className="flex-1 ml-2 sm:ml-3 bg-[#fffdf7] border-3 border-[#522d14] rounded-2xl p-3 sm:p-4 shadow-lg relative min-h-[72px] flex flex-col justify-between">
            <p className="text-[#3d1c06] text-sm sm:text-base font-bold leading-relaxed">
              {dialogueText.slice(0, displayedLength)}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-[#8c5228] font-bold">
                터치해서 계속하기
              </span>
              <span className="text-[#e67e22] text-sm font-black animate-bounce">▼</span>
            </div>
          </div>
        </div>
      ) : (
        /* Warm Wooden Storybook Inventory Dock */
        <div className="relative w-full max-w-[860px] mx-auto px-3 py-2 bg-gradient-to-r from-[#7d4925] via-[#8f542d] to-[#7d4925] border-4 border-t-0 border-[#6e3f20] shadow-xl rounded-b-3xl">
          <div className="flex items-center justify-between px-1 mb-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-[#fff6dc]">
              <Sparkles className="w-3.5 h-3.5 text-[#ffca58]" />
              <span className="font-bold tracking-wide">
                {activeObjective || '가방의 도구를 화면에 드래그하거나 터치하세요!'}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenBackpackModal();
              }}
              className="text-[11px] text-[#3d1c06] font-black flex items-center gap-1 bg-[#ffca58] hover:bg-[#ffd67a] px-2.5 py-0.5 rounded-lg border-2 border-[#4d2810] cursor-pointer"
            >
              <Backpack className="w-3 h-3" />
              <span>가방</span>
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {slots.map((item, idx) => {
              const isSelected = item && item.id === selectedItemId;
              return (
                <div
                  key={idx}
                  draggable={!!item}
                  onDragStart={(e) => {
                    if (item) e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onClick={() => {
                    if (item) {
                      sound.playClick();
                      onSelectItem(item);
                    }
                  }}
                  className={`h-12 sm:h-14 rounded-xl border-2 transition-all flex flex-col items-center justify-center relative select-none ${
                    item
                      ? isSelected
                        ? 'bg-[#fff3cc] border-[#ff9f1c] shadow-md scale-105 cursor-grab active:cursor-grabbing ring-2 ring-[#ffca58]'
                        : 'bg-[#fffaf0] border-[#4d2810] hover:bg-white hover:scale-102 cursor-grab active:cursor-grabbing shadow-sm'
                      : 'bg-[#5c3318]/60 border-[#4d2810]/50 opacity-70 cursor-default'
                  }`}
                  title={item ? item.name : `빈 칸 ${idx + 1}`}
                >
                  {item ? (
                    <>
                      <ItemIcon itemId={item.id} className="w-6 h-6 sm:w-7 sm:h-7 pointer-events-none" />
                      <span className="text-[10px] text-[#3d1c06] font-black truncate max-w-[58px] pointer-events-none leading-none mt-0.5">
                        {item.name.slice(0, 6)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-[#c99e7a] font-mono">{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
