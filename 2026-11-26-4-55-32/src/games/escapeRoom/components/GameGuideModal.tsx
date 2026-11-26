import React from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { X, HelpCircle, ArrowRight, Lightbulb, Backpack, MousePointerClick } from 'lucide-react';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={() => {
        sound.playClick();
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#fffaf0] border-4 border-[#4d2810] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#4d2810] max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Kid-Friendly Warm Wooden Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-[#7d4925] via-[#94582f] to-[#7d4925] border-b-4 border-[#4d2810] text-[#fff8eb]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ffca58] border-2 border-[#4d2810] text-[#4d2810] flex items-center justify-center shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cute text-lg sm:text-xl font-black leading-tight">
                어떻게 노나요? 그림으로 배워요!
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#5c3318] hover:bg-[#4a2812] border border-[#3d1f0c] text-[#ffe9c7] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Picture-Book Steps (Minimal Text, Big Pictures) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 bg-[#fffdf7]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Step 1: Brush & Relic */}
            <div className="rounded-2xl border-3 border-[#4d2810] bg-[#fff5d6] overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-28 sm:h-32 w-full bg-[#d8f3dc] overflow-hidden border-b-2 border-[#4d2810]">
                <img
                  src={publicAsset('/assets/escape-room/cute_excavation_site_1795598618116.jpg')}
                  alt="흙 털기"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-xs font-black">
                  1단계
                </span>
                {/* Visual Brush + Relic Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-white/95 border-2 border-[#4d2810] flex items-center justify-center shadow-md animate-bounce">
                    <span className="text-xl">🖌️</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#4d2810] bg-white/85 rounded-full p-0.5" />
                  <div className="w-11 h-11 rounded-full bg-[#ccfbf1] border-2 border-[#134e4a] flex items-center justify-center shadow-md">
                    <ItemIcon itemId="relic_fragment" className="w-7 h-7" />
                  </div>
                </div>
              </div>
              <div className="p-2.5 text-center">
                <p className="font-cute text-sm sm:text-base font-black text-[#4d2810]">
                  붓으로 흙 털고 유물 누르기!
                </p>
              </div>
            </div>

            {/* Step 2: Basket -> Knife -> Cut Rope Door */}
            <div className="rounded-2xl border-3 border-[#4d2810] bg-[#fff5d6] overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-28 sm:h-32 w-full bg-gradient-to-b from-[#f5dcb0] to-[#dfb67b] overflow-hidden border-b-2 border-[#4d2810] flex items-center justify-center gap-2 px-3">
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-xs font-black">
                  2단계
                </span>
                {/* Cute SVG Basket */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-12 rounded-2xl bg-[#fffaf0] border-2 border-[#4d2810] flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🧺</span>
                  </div>
                  <span className="text-[11px] font-black mt-0.5">바구니</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4d2810] shrink-0" />
                {/* Knife */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-12 rounded-2xl bg-[#fffaf0] border-2 border-[#4d2810] flex items-center justify-center shadow-sm">
                    <ItemIcon itemId="umjib_knife" className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] font-black mt-0.5">칼 줍기</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4d2810] shrink-0" />
                {/* Door */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-12 rounded-2xl bg-[#a36331] border-2 border-[#4d2810] flex items-center justify-center shadow-sm">
                    <span className="text-2xl">🚪</span>
                  </div>
                  <span className="text-[11px] font-black mt-0.5">문 밧줄 싹둑!</span>
                </div>
              </div>
              <div className="p-2.5 text-center">
                <p className="font-cute text-sm sm:text-base font-black text-[#4d2810]">
                  칼을 찾아 문 밧줄 끊기!
                </p>
              </div>
            </div>

            {/* Step 3: Explore 5 Village Spots & Collect 5 Shards */}
            <div className="rounded-2xl border-3 border-[#4d2810] bg-[#fff5d6] overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-28 sm:h-32 w-full bg-[#d8f3dc] overflow-hidden border-b-2 border-[#4d2810]">
                <img
                  src={publicAsset('/assets/escape-room/cute_prehistoric_village_1795598617747.jpg')}
                  alt="마을 탐험"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-xs font-black">
                  3단계
                </span>
                {/* 5 Shards Visual Strip */}
                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 pointer-events-none">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div
                      key={n}
                      className="w-8 h-8 rounded-full bg-[#fffaf0]/95 border-2 border-[#4d2810] flex items-center justify-center shadow-md"
                    >
                      <ItemIcon itemId={`pottery_shard_${n}`} className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2.5 text-center">
                <p className="font-cute text-sm sm:text-base font-black text-[#4d2810]">
                  마을 5곳에서 토기 조각 모으기!
                </p>
              </div>
            </div>

            {/* Step 4: Assemble Pottery & Return Home */}
            <div className="rounded-2xl border-3 border-[#4d2810] bg-[#fff5d6] overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-28 sm:h-32 w-full bg-gradient-to-b from-[#bae6fd] via-[#fef9c3] to-[#bbf7d0] overflow-hidden border-b-2 border-[#4d2810] flex items-center justify-center gap-3 px-3">
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#ffca58] border-2 border-[#4d2810] text-xs font-black">
                  4단계
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#fffaf0] border-2 border-[#4d2810] flex items-center justify-center shadow-sm">
                  <ItemIcon itemId="pottery_shard_1" className="w-8 h-8" />
                </div>
                <span className="text-lg font-black">+</span>
                <div className="w-12 h-12 rounded-2xl bg-[#fffaf0] border-2 border-[#4d2810] flex items-center justify-center shadow-sm">
                  <ItemIcon itemId="magic_pottery" className="w-9 h-9" />
                </div>
                <ArrowRight className="w-5 h-5 text-[#4d2810]" />
                <div className="w-12 h-12 rounded-full bg-[#ffca58] border-2 border-[#4d2810] flex items-center justify-center shadow-sm animate-pulse">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
              <div className="p-2.5 text-center">
                <p className="font-cute text-sm sm:text-base font-black text-[#4d2810]">
                  조각 5개 맞추면 탈출 성공!
                </p>
              </div>
            </div>
          </div>

          {/* Super Easy 3-Icon Control Helper Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl bg-[#eef7ff] border-2 border-[#4d2810] flex flex-col items-center text-center gap-1">
              <MousePointerClick className="w-6 h-6 text-[#2563eb]" />
              <span className="text-xs font-black">궁금한 곳 콕콕!</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#fff3cc] border-2 border-[#4d2810] flex flex-col items-center text-center gap-1">
              <Backpack className="w-6 h-6 text-[#b45309]" />
              <span className="text-xs font-black">아래 가방에서 꺼내기!</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#ecfdf5] border-2 border-[#4d2810] flex flex-col items-center text-center gap-1">
              <Lightbulb className="w-6 h-6 text-[#16a34a]" />
              <span className="text-xs font-black">모르면 위 💡 힌트!</span>
            </div>
          </div>
        </div>

        {/* Big Cheerful Close Button */}
        <div className="px-4 py-3 border-t-3 border-[#e6d5b8] bg-[#fff5d6] flex justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-8 py-2.5 rounded-2xl bg-[#ffca58] hover:bg-[#ffd67a] border-3 border-[#4d2810] text-[#3d1c06] font-black text-sm sm:text-base shadow-[0_4px_0_#4d2810] active:translate-y-0.5 transition-all cursor-pointer"
          >
            알겠어요! 출발하자!
          </button>
        </div>
      </div>
    </div>
  );
};
