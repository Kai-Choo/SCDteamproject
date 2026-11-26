import React from 'react';
import { ArrowHit, GameMode } from '../types';
import { Target, Trophy, Move, Flame } from 'lucide-react';
import { archeryAudio } from '../utils/audio';

interface ScoreCardProps {
  arrowHistory: ArrowHit[];
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  currentDistance: number;
  onSelectDistance: (distance: number) => void;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  arrowHistory,
  currentMode,
  onSelectMode,
  currentDistance,
  onSelectDistance,
}) => {
  const totalScore = arrowHistory.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = arrowHistory.length > 0 ? (totalScore / arrowHistory.length).toFixed(1) : '0.0';
  const tensCount = arrowHistory.filter(a => a.score === 10).length;
  const xCount = arrowHistory.filter(a => a.isX).length;

  const distances = [18, 30, 50, 70];

  const modes: { id: GameMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'horseback', label: '마상궁술 (기사 騎射)', icon: <Flame className="w-4 h-4" />, desc: '100m 주로 전속력 질주 마상 사격' },
    { id: 'olympic', label: '올림픽 공식 룰', icon: <Target className="w-4 h-4" />, desc: '정통 10링 타겟' },
    { id: 'moving_target', label: '이동 과녁', icon: <Move className="w-4 h-4" />, desc: '좌우 왕복 타겟' },
  ];

  const getScoreBadgeColor = (score: number, isX: boolean) => {
    if (isX) return 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 font-black border-amber-400 shadow-sm';
    if (score === 10 || score === 9) return 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-sm';
    if (score === 8 || score === 7) return 'bg-rose-500 text-white font-bold border-rose-400 shadow-sm';
    if (score === 6 || score === 5) return 'bg-sky-500 text-white font-bold border-sky-400 shadow-sm';
    if (score === 4 || score === 3) return 'bg-slate-700 text-white font-bold border-slate-600 shadow-sm';
    if (score === 2 || score === 1) return 'bg-white text-slate-800 font-bold border-slate-300 shadow-sm';
    return 'bg-slate-100 text-slate-400 border-slate-200';
  };

  return (
    <div id="archery-scorecard" className="wii-panel rounded-3xl p-5 sm:p-6 space-y-6">
      {/* Game Mode & Distance Selector Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        {/* Modes */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 tracking-wide block">
            게임 모드 선택
          </span>
          <div className="flex flex-wrap gap-2">
            {modes.map(m => (
              <button
                key={m.id}
                id={`mode-btn-${m.id}`}
                type="button"
                onClick={() => {
                  archeryAudio.playClickSound();
                  onSelectMode(m.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-xs font-bold cursor-pointer transition-all active:scale-95 whitespace-nowrap ${
                  currentMode === m.id
                    ? 'wii-gloss-blue text-white border-sky-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/70'
                }`}
              >
                <span className={currentMode === m.id ? 'text-white' : 'text-sky-500'}>
                  {m.icon}
                </span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Distances */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 tracking-wide block">
            사격 거리 (Distance)
          </span>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {distances.map(d => (
              <button
                key={d}
                id={`dist-btn-${d}m`}
                type="button"
                onClick={() => {
                  archeryAudio.playClickSound();
                  onSelectDistance(d);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all tabular-nums ${
                  currentDistance === d
                    ? 'bg-white text-sky-600 border border-sky-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                {d}M
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Score Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-gradient-to-b from-slate-50 to-sky-50/50 rounded-2xl p-4 border border-slate-200/90">
          <span className="text-xs text-slate-500 block font-semibold">총 점수</span>
          <div className="text-2xl font-black text-amber-500 mt-0.5 tabular-nums">{totalScore}점</div>
          <span className="text-[11px] text-slate-500">
            {arrowHistory.length > 0 ? `${arrowHistory.length}발 누적 합계` : '사격 전'}
          </span>
        </div>

        <div className="bg-gradient-to-b from-slate-50 to-sky-50/50 rounded-2xl p-4 border border-slate-200/90">
          <span className="text-xs text-slate-500 block font-semibold">화살당 평균</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">{avgScore}점</div>
          <span className="text-[11px] text-slate-500">발당 평균 득점</span>
        </div>

        <div className="bg-gradient-to-b from-slate-50 to-sky-50/50 rounded-2xl p-4 border border-slate-200/90">
          <span className="text-xs text-slate-500 block font-semibold">10점 / X-Ring</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5 tabular-nums">
            {tensCount}회 <span className="text-xs text-amber-600 font-bold">(X: {xCount})</span>
          </div>
          <span className="text-[11px] text-slate-500">골드 존 적중 횟수</span>
        </div>
      </div>

      {/* Individual Arrow Log Rings Sheet */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 tracking-wide flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>화살별 기록지 (Score Log)</span>
          </span>
          <span className="text-xs text-slate-500">최근 18발 표시</span>
        </div>

        {arrowHistory.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200 text-center text-slate-500 text-xs font-medium">
            게임을 시작한 뒤 화면을 터치/클릭해 첫 화살을 쏘아보세요!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {arrowHistory.slice(-18).map((hit, idx) => (
              <div
                key={hit.id || idx}
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center border-2 tabular-nums ${getScoreBadgeColor(
                  hit.score,
                  hit.isX
                )}`}
              >
                <span className="text-[10px] opacity-80 leading-none">#{idx + 1}</span>
                <span className="text-sm leading-none mt-0.5">
                  {hit.isX ? 'X' : hit.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
