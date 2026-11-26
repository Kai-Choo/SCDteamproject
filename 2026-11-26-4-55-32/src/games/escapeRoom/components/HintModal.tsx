import React, { useState } from 'react';
import { HintData, StageId } from '../types/game';
import { STAGES_CONFIG } from '../data/stagesData';
import { X, HelpCircle, Eye, AlertCircle, ArrowRight } from 'lucide-react';
import { sound } from '../services/soundService';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: StageId;
  missionIndex: number; // 1 or 2
  onUseHint: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  currentStage,
  missionIndex,
  onUseHint
}) => {
  const [activeMission, setActiveMission] = useState<1 | 2>(missionIndex === 2 ? 2 : 1);
  const [unlockedTier, setUnlockedTier] = useState<number>(1);

  if (!isOpen) return null;

  const stageConfig = STAGES_CONFIG[currentStage] || STAGES_CONFIG.STAGE_1_LAB;
  const hintData: HintData = activeMission === 1 ? stageConfig.hints.mission1 : stageConfig.hints.mission2;

  const handleUnlockNextTier = () => {
    sound.playClick();
    if (unlockedTier < 3) {
      setUnlockedTier(prev => prev + 1);
      onUseHint();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg font-bold text-amber-100">조사 도우미 (힌트 안내)</h2>
              <p className="text-xs text-stone-400">힌트를 열람해도 게임 진행 및 엔딩에 아무런 불이익이 없습니다.</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Switcher */}
        <div className="flex items-center border-b border-stone-800 bg-stone-950/40 px-5 gap-2">
          <button
            onClick={() => { sound.playClick(); setActiveMission(1); setUnlockedTier(1); }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeMission === 1
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            미션 1 힌트
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveMission(2); setUnlockedTier(1); }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeMission === 2
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            미션 2 힌트
          </button>
        </div>

        {/* Hints Content */}
        <div className="p-5 space-y-4">
          {/* Tier 1 */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                1단계 힌트
              </span>
              <span className="text-xs text-stone-400">방향 및 탐색 가이드</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              {hintData.tier1 || '주변 단서를 관찰해 보세요.'}
            </p>
          </div>

          {/* Tier 2 */}
          {unlockedTier >= 2 ? (
            <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                  2단계 힌트
                </span>
                <span className="text-xs text-stone-400">구체적 풀이법 단서</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {hintData.tier2 || '수첩과 메모를 대조해 보세요.'}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-950/30 border border-stone-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <AlertCircle className="w-4 h-4" />
                <span>2단계 구체적 힌트가 가려져 있습니다.</span>
              </div>
              <button
                onClick={handleUnlockNextTier}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2단계 열람</span>
              </button>
            </div>
          )}

          {/* Tier 3 */}
          {unlockedTier >= 3 ? (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-700/60 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
                  3단계 최종 정답
                </span>
                <span className="text-xs text-amber-400">정답 코드 및 해결 순서</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-200 font-semibold leading-relaxed">
                {hintData.tier3 || '정답이 즉시 활성화됩니다.'}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-950/30 border border-stone-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <AlertCircle className="w-4 h-4" />
                <span>3단계 정답 공개가 잠겨 있습니다.</span>
              </div>
              <button
                disabled={unlockedTier < 2}
                onClick={handleUnlockNextTier}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  unlockedTier >= 2
                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>정답 보기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
