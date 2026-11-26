import React from 'react';
import { InventoryItem, StageId } from '../types/game';
import { Volume2, VolumeX, Lightbulb, Settings, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { sound } from '../services/soundService';

interface GogangEscapeLayoutProps {
  currentStage: StageId;
  stageName: string;
  subLocationTitle?: string;
  activeObjective: string;
  inventory: InventoryItem[];
  selectedItemId: string | null;
  onSelectItem: (item: InventoryItem) => void;
  onOpenInventoryModal: () => void;
  onOpenHints: () => void;
  onOpenClues: () => void;
  onOpenSettings: () => void;
  isSfxMuted: boolean;
  onToggleSound: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  children: React.ReactNode;
}

export const GogangEscapeLayout: React.FC<GogangEscapeLayoutProps> = ({
  stageName,
  subLocationTitle,
  activeObjective,
  inventory,
  selectedItemId,
  onSelectItem,
  onOpenInventoryModal,
  onOpenHints,
  onOpenClues,
  onOpenSettings,
  isSfxMuted,
  onToggleSound,
  onNavigateNext,
  onNavigatePrev,
  children,
}) => {
  // 5 vertical inventory slots matching the reference game screenshot (Image 2)
  const totalSlots = 5;
  const slots = Array.from({ length: totalSlots }, (_, i) => inventory[i] || null);

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-row rounded-2xl overflow-hidden border-4 border-[#121622] bg-[#0a0d14] shadow-2xl relative select-none">
      {/* ==================== LEFT: VERTICAL INVENTORY STRIP (Image 2 Match) ==================== */}
      <aside className="w-20 sm:w-24 bg-[#0d1017] border-r-4 border-[#151926] flex flex-col items-center justify-between py-3 px-2 z-30 shrink-0">
        {/* Top Purple Metallic Cap (Image 2 Match) */}
        <div className="w-10 h-4 rounded-full bg-gradient-to-b from-[#7e62a3] via-[#543b7a] to-[#2d1e47] border border-[#9b7fc4] shadow-[0_0_8px_rgba(155,127,196,0.6)] mb-2" />

        {/* 5 Stacked Recessed Inventory Slots */}
        <div className="flex-1 flex flex-col justify-around w-full gap-2 py-1">
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
                className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-xl border-2 transition-all flex flex-col items-center justify-center relative ${
                  item
                    ? isSelected
                      ? 'bg-[#291e38] border-[#a87ffb] shadow-[0_0_14px_rgba(168,127,251,0.8)] scale-105 cursor-pointer ring-2 ring-[#cbb3ff]'
                      : 'bg-[#141824] border-[#2b334a] hover:border-[#6979a6] hover:bg-[#1c2233] cursor-pointer'
                    : 'bg-[#090b10] border-[#181c28] cursor-default opacity-40 shadow-inner'
                }`}
                title={item ? `${item.name} (선택하여 화면의 물체에 사용하거나 드래그하세요)` : `소지품 빈 슬롯 ${idx + 1}`}
              >
                {item ? (
                  <>
                    <span className="text-xl sm:text-2xl drop-shadow-md">
                      {item.category === 'artifact' ? '🏺' : item.category === 'tool' ? '🗡️' : item.category === 'document' ? '📜' : '🧩'}
                    </span>
                    <span className="text-[9px] text-stone-300 font-bold truncate max-w-[50px] mt-0.5">
                      {item.name.slice(0, 4)}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-stone-700 font-mono font-bold">{idx + 1}</span>
                )}

                {item && isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Purple Metallic Cap (Image 2 Match) */}
        <div className="w-10 h-4 rounded-full bg-gradient-to-t from-[#7e62a3] via-[#543b7a] to-[#2d1e47] border border-[#9b7fc4] shadow-[0_0_8px_rgba(155,127,196,0.6)] mt-2" />
      </aside>

      {/* ==================== RIGHT: MAIN GAME PLAY AREA ==================== */}
      <section className="flex-1 flex flex-col relative overflow-hidden bg-black">
        {/* Top Floating Action Bar (Image 2 Walkthrough Pill & Audio) */}
        <header className="absolute top-2 left-3 right-3 z-40 flex items-center justify-between pointer-events-none">
          {/* Top-Left: Glossy Blue Walkthrough Pill (Image 2 Match) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenHints();
            }}
            className="pointer-events-auto px-4 py-1.5 rounded-full bg-gradient-to-b from-[#4ba2ff] via-[#1e78e6] to-[#0a4fb8] border-2 border-white/80 text-white font-extrabold text-xs tracking-wider shadow-[0_4px_12px_rgba(30,120,230,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Lightbulb className="w-4 h-4 text-yellow-200 fill-yellow-300" />
            <span>Walkthrough (힌트)</span>
          </button>

          {/* Top-Center: Current Objective Banner */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/75 border border-stone-700 text-stone-200 text-xs font-medium backdrop-blur-md shadow-xl pointer-events-auto">
            <span className="text-amber-400 font-bold">{stageName}</span>
            {subLocationTitle && <span className="text-stone-400">· {subLocationTitle}</span>}
            <span className="text-stone-500">|</span>
            <span className="text-amber-200">{activeObjective}</span>
          </div>

          {/* Top-Right: Sound, Clues & Settings */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Clue Journal Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenClues();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-black/75 hover:bg-black/90 border border-stone-700 text-stone-300 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 backdrop-blur-md shadow-lg"
              title="단서 수첩"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">단서 수첩</span>
            </button>

            {/* Round Copper Audio Button (Image 2 Match) */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleSound();
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-b from-[#a35e3b] via-[#753d21] to-[#451f0d] border-2 border-[#d98b62] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(163,94,59,0.7)] hover:brightness-110 active:scale-95 transition-all"
              title={isSfxMuted ? '소리 켜기' : '소리 끄기'}
            >
              {isSfxMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-amber-100" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="p-1.5 rounded-full bg-black/75 hover:bg-black border border-stone-700 text-stone-300 hover:text-white"
              title="설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Stage Room Viewport */}
        <div className="relative w-full h-full flex-1 flex flex-col justify-center overflow-hidden">
          {children}

          {/* Previous Room Arrow Button (Bottom Left) */}
          {onNavigatePrev && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigatePrev();
              }}
              className="absolute left-3 bottom-3 z-35 w-11 h-11 rounded-xl bg-[#4a1219] hover:bg-[#6e1925] border-2 border-[#f05467] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(240,84,103,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="이전 화면 (◀)"
            >
              <ChevronLeft className="w-7 h-7 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Bold Burgundy/Red Navigation Chevron (Image 2 Bottom-Right Match) */}
          {onNavigateNext && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateNext();
              }}
              className="absolute right-3 bottom-3 z-35 w-11 h-11 rounded-xl bg-[#4a1219] hover:bg-[#6e1925] border-2 border-[#f05467] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(240,84,103,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer group animate-pulse"
              title="다음 화면으로 이동 (▶)"
            >
              <ChevronRight className="w-7 h-7 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
