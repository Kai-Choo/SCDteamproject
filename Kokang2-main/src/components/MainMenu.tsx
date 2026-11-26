import React from 'react';
import { GameMode } from '../types/game';
import { Play, Sparkles, Compass, ShieldAlert, Award } from 'lucide-react';
import { sound } from '../utils/audio';

import sunsetBg from '../assets/images/ancient_field_sunset_1790924674963.jpg';
import artifactImg from '../assets/images/bandaldolkal_artifact_1790924689859.jpg';
import potteryImg from '../assets/images/mumun_pottery_harvest_1790924701235.jpg';

interface MainMenuProps {
  highScoreClassic: number;
  highScoreArcade: number;
  onSelectMode: (mode: GameMode) => void;
  onOpenLore: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScoreClassic,
  highScoreArcade,
  onSelectMode,
  onOpenLore,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Background Image with Warm Autumn Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={sunsetBg}
          alt="청동기 들판 석양"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-60 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-900/40" />
      </div>

      {/* Top Header Bar following Top Bar Contract */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-stone-800/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="font-traditional text-xl md:text-2xl font-bold tracking-tight text-amber-100">
            반달돌칼: 청동기 풍년 베기 3D
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-300">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLore();
            }}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-stone-300 py-1"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>역사 이야기</span>
          </button>
        </div>
      </header>

      {/* Hero & Mode Select Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-5xl mx-auto w-full">
        {/* Title Lockup */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-semibold tracking-widest uppercase mb-2">
            <span>청동기 시대의 농경 혁명</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span>이삭따기 3D 액션</span>
          </div>

          <h1 className="font-traditional text-4xl md:text-6xl font-extrabold text-stone-100 tracking-tight mb-3 drop-shadow-xl text-balance">
            황금빛 곡식을 베어 <span className="text-amber-400">풍년</span>을 열어라
          </h1>
          <p className="text-xs md:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            마우스 드래그나 손끝 스와이프로 전설의 반달돌칼을 휘둘러 벼와 보리를 수확하세요. 
            단번에 여러 곡물을 베는 콤보와 풍년 피버를 만끽할 수 있습니다.
          </p>
        </div>

        {/* 3 Game Mode Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {/* 1. Classic Mode */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('CLASSIC');
            }}
            className="group relative bg-stone-900/85 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-amber-400 font-semibold">고전 모드</span>
                <span className="text-xs font-mono text-stone-400">최고 {highScoreClassic.toLocaleString()}점</span>
              </div>
              <h2 className="font-traditional text-xl font-bold text-stone-100 group-hover:text-amber-300 transition-colors mb-2">
                고전 수확 모드
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed mb-4">
                3개의 하트로 시작합니다. 익은 곡식을 땅에 떨어뜨리지 말고 수확하세요. 돌멩이와 해충을 피해야 합니다!
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>수확 시작하기</span>
            </div>
          </div>

          {/* 2. Arcade Mode */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('ARCADE');
            }}
            className="group relative bg-stone-900/85 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-amber-400 font-semibold">60초 타임어택</span>
                <span className="text-xs font-mono text-stone-400">최고 {highScoreArcade.toLocaleString()}점</span>
              </div>
              <h2 className="font-traditional text-xl font-bold text-stone-100 group-hover:text-amber-300 transition-colors mb-2">
                풍년 60초 모드
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed mb-4">
                60초 동안 황금 볏단 피버와 서리 이삭 슬로모션을 발동해 폭발적인 콤보로 최고 점수를 기록하세요!
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>60초 도전하기</span>
            </div>
          </div>

          {/* 3. Museum 3D Inspector */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectMode('MUSEUM');
            }}
            className="group relative bg-stone-900/85 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-amber-400 font-semibold">3D 유물 감상</span>
                <span className="text-xs text-stone-400">고고학 도감</span>
              </div>
              <h2 className="font-traditional text-xl font-bold text-stone-100 group-hover:text-amber-300 transition-colors mb-2">
                반달돌칼 3D 도감실
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed mb-4">
                선조들의 반달돌칼을 360도로 회전하며 인부, 유공, 결속 끈 구조와 역사적 원리를 자세히 살펴봅니다.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
              <Compass className="w-3.5 h-3.5" />
              <span>3D 유물 관람하기</span>
            </div>
          </div>
        </div>

        {/* Quick Rule Tips Banner */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400 mt-6 bg-stone-950/70 border border-stone-800/80 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">콤보 비결:</span>
            <span>한 번의 스와이프로 곡물 2개 이상 연속 베기</span>
          </div>
          <span aria-hidden="true" className="text-stone-700 hidden md:inline">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>돌멩이와 병충해 메뚜기는 절대 베지 마세요!</span>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-3 border-t border-stone-800/60 text-[11px] text-stone-500">
        <div>청동기 시대 유물 기반 3D 곡물 수확 인터랙티브 게임</div>
        <div>부여 송국리 유적 및 무문토기 문화 모티브</div>
      </footer>
    </div>
  );
};
