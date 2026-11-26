import React from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { sound } from '../services/soundService';
import { ItemIcon } from './ItemIcon';
import { Award, Clock, BookOpen, RotateCcw, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GOGANG_HISTORICAL_FACTS } from '../data/historicalData';

interface EndingScreenProps {
  playTimeSeconds: number;
  cluesCount: number;
  hintsUsedCount: number;
  onRestartGame: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  playTimeSeconds,
  cluesCount,
  hintsUsedCount,
  onRestartGame,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}분 ${s < 10 ? '0' : ''}${s}초`;
  };

  return (
    <div className="relative w-full max-w-[860px] mx-auto rounded-3xl overflow-hidden border-[4px] border-[#4d2810] shadow-[0_10px_0_rgba(77,40,16,0.25)] bg-[#fffaf0] p-5 sm:p-8 text-[#4d2810] my-2 space-y-5">
      {/* Subtle Sunny Village Tint Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ backgroundImage: `url('${publicAsset('/assets/escape-room/cute_prehistoric_village_1795598617747.jpg')}')` }}
      />

      {/* Header with Cute Explorer Avatar */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-2 border-b-[3px] border-[#e6d5b8] pb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-[#4d2810] bg-[#ffeaad] shadow-md">
          <img
            src={publicAsset('/assets/escape-room/cute_explorer_avatar_1795598616698.jpg')}
            alt="꼬마 탐험가"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="px-3 py-0.5 rounded-full bg-[#c5f2b3] border-2 border-[#4d2810] text-xs font-extrabold text-[#285e1a]">
          현실 귀환 성공 · 방탈출 클리어!
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#4d2810] tracking-tight">
          고강선사유적체험관 : 되살아난 마법의 토기
        </h1>
      </div>

      {/* Visual Realization & Lesson Card */}
      <div className="relative z-10 p-5 sm:p-6 rounded-2xl bg-[#fff3d1] border-[3px] border-[#4d2810] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* 3000 BC Assembled Magic Pottery */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#fffaf0] border-[3px] border-[#4d2810] flex items-center justify-center shadow-sm">
              <ItemIcon itemId="magic_pottery" className="w-18 h-18" />
            </div>
            <span className="text-xs font-extrabold text-[#4d2810]">
              3,000년 전 이어 붙인 토기
            </span>
          </div>

          <ArrowRight className="w-7 h-7 text-[#d67d1b] rotate-90 sm:rotate-0 shrink-0" />

          {/* Present Day Excavated Pottery */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-[3px] border-[#4d2810] shadow-sm bg-[#fffaf0]">
              <img
                src={publicAsset('/assets/escape-room/cute_excavation_site_1795598618116.jpg')}
                alt="발굴된 고강동 토기"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-extrabold text-[#4d2810]">
              오늘 내가 발굴한 그 토기!
            </span>
          </div>
        </div>

        <div className="text-center space-y-2 pt-3 border-t-2 border-[#e6d5b8]">
          <p className="text-sm sm:text-base font-extrabold text-[#4d2810] leading-relaxed">
            "아! 내가 발굴터에서 찾았던 그 토기가 바로 3천 년 전 내가 조각을 모아 이어 붙인 토기였구나!"
          </p>
          <p className="text-xs sm:text-sm font-medium text-[#7d4925] leading-relaxed max-w-xl mx-auto">
            작은 토기 조각 하나에도 3천 년 전 고강동 선사인들의 지혜와 따뜻한 삶의 이야기가 담겨 있어요.
          </p>
        </div>
      </div>

      {/* Player Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#fff9ec] border-[2.5px] border-[#4d2810] text-center">
          <Clock className="w-5 h-5 text-[#d67d1b] mx-auto mb-1" />
          <div className="text-[11px] font-bold text-[#7d4925]">탐사 시간</div>
          <div className="text-sm sm:text-base font-black text-[#4d2810] font-mono tabular-nums mt-0.5">
            {formatTime(playTimeSeconds)}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#fff9ec] border-[2.5px] border-[#4d2810] text-center">
          <BookOpen className="w-5 h-5 text-[#2d8a68] mx-auto mb-1" />
          <div className="text-[11px] font-bold text-[#7d4925]">수집한 단서</div>
          <div className="text-sm sm:text-base font-black text-[#4d2810] font-mono tabular-nums mt-0.5">
            {cluesCount} 개
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#fff9ec] border-[2.5px] border-[#4d2810] text-center">
          <Award className="w-5 h-5 text-[#d67d1b] mx-auto mb-1" />
          <div className="text-[11px] font-bold text-[#7d4925]">열람한 힌트</div>
          <div className="text-sm sm:text-base font-black text-[#4d2810] font-mono tabular-nums mt-0.5">
            {hintsUsedCount} 회
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#fff9ec] border-[2.5px] border-[#4d2810] text-center">
          <CheckCircle2 className="w-5 h-5 text-[#2d8a68] mx-auto mb-1" />
          <div className="text-[11px] font-bold text-[#7d4925]">탐사 결과</div>
          <div className="text-sm sm:text-base font-black text-[#285e1a] mt-0.5">
            토기 복원 완료
          </div>
        </div>
      </div>

      {/* Exhibition Info */}
      <div className="relative z-10 p-4 rounded-2xl bg-[#f5ebd2] border-[2.5px] border-[#4d2810] space-y-1.5">
        <h3 className="text-sm font-extrabold text-[#4d2810] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#d67d1b]" />
          실제 부천 고강선사유적체험관 안내
        </h3>
        <p className="text-xs font-medium text-[#6e3f20] leading-relaxed">
          경기도 부천시 오정구 고강동 산 90 일원 · {GOGANG_HISTORICAL_FACTS.siteOverview}
        </p>
      </div>

      {/* Restart Button */}
      <div className="relative z-10 pt-1 flex justify-center">
        <button
          onClick={() => {
            sound.playClick();
            onRestartGame();
          }}
          className="px-8 py-3 rounded-2xl bg-[#ffca58] hover:bg-[#ffd67a] text-[#4d2810] font-extrabold text-sm flex items-center justify-center gap-2 border-[3px] border-[#4d2810] shadow-[0_4px_0_#4d2810] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>처음부터 다시하기</span>
        </button>
      </div>
    </div>
  );
};
