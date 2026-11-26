import React, { useState } from 'react';
import { sound } from '../services/soundService';
import { GameGuideModal } from './GameGuideModal';
import { Play, HelpCircle } from 'lucide-react';

interface TitleScreenProps {
  hasSavedGame?: boolean;
  onStartNewGame: () => void;
  onResumeGame?: () => void;
  onOpenArchive?: () => void;
  onOpenDrive?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartNewGame,
  onOpenDrive,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="relative w-full max-w-[860px] mx-auto h-full min-h-[340px] max-h-[540px] rounded-3xl overflow-hidden border-[6px] border-[#fff8eb] ring-4 ring-[#8c5832] shadow-2xl bg-[#dff2ff] flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Cute 2D Storybook Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/escape-room/cute_title_bg_1795598616177.jpg')` }}
      />

      {/* Top Wooden Badges + Title Banner matching reference layout */}
      <div className="relative z-20 flex flex-col items-center text-center pt-1 sm:pt-2">
        <div className="w-full flex items-center justify-between px-1 mb-1">
          <span className="px-4 py-1 rounded-full bg-[#8c5228] border-2 border-[#4d2810] text-[#fff6dc] text-xs sm:text-sm font-black shadow-md">
            부천
          </span>
          <span className="px-4 py-1 rounded-full bg-[#8c5228] border-2 border-[#4d2810] text-[#fff6dc] text-xs sm:text-sm font-black shadow-md">
            청동기시대
          </span>
        </div>

        <h1
          className="font-cute text-3xl sm:text-5xl lg:text-[52px] font-black tracking-normal text-[#ffca58] leading-tight"
          style={{
            WebkitTextStroke: '7px #4d2810',
            paintOrder: 'stroke fill',
            textShadow: '0 4px 0 #4d2810',
          }}
        >
          고강선사유적체험관 탈출하기
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-extrabold text-[#4d2810] bg-white/85 border-2 border-[#4d2810]/20 px-3.5 py-0.5 rounded-full shadow-xs">
          기원전 1000년 · 마법의 토기 조각을 찾아라!
        </p>
      </div>

      {/* Bottom Row: Cute Explorer Character on Left + Clean Raised Action Buttons on Right */}
      <div className="relative z-20 flex items-end justify-between gap-4 pb-2 sm:pb-4">
        {/* Cute Chibi Explorer Portrait */}
        <div className="hidden xs:flex sm:flex items-end">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#4d2810] bg-[#fff4d6] shadow-xl -rotate-2">
            <img
              src="/assets/escape-room/cute_explorer_avatar_1795598616698.jpg"
              alt="탐험가 캐릭터"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Action Stack: Raised Start Button + Guide & Drive only below */}
        <div className="flex flex-col items-center sm:items-end gap-2.5 ml-auto mb-3 sm:mb-8">
          <button
            onClick={() => {
              sound.playClick();
              onStartNewGame();
            }}
            className="w-full sm:w-auto min-w-[190px] justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-b from-[#ffb732] to-[#e68a00] hover:brightness-105 border-3 border-[#4d2810] text-[#3d1c06] font-black text-lg sm:text-xl shadow-[0_5px_0_#4d2810] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>게임 시작</span>
          </button>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsGuideOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#fff8eb] hover:bg-white border-2 border-[#4d2810] text-[#4d2810] font-extrabold text-xs sm:text-sm shadow-[0_3px_0_#4d2810] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#d97706]" />
              <span>게임 설명</span>
            </button>

            {onOpenDrive && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenDrive();
                }}
                className="px-4 py-2 rounded-xl bg-white/95 hover:bg-white border-2 border-[#4d2810] text-[#4d2810] font-extrabold text-xs sm:text-sm shadow-[0_3px_0_#4d2810] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 87.3 78" fill="none">
                  <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA" />
                  <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 46.1c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00AC47" />
                  <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.95 10.3z" fill="#EA4335" />
                  <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832D" />
                  <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z" fill="#2684FC" />
                  <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00" />
                </svg>
                <span>Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <GameGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
