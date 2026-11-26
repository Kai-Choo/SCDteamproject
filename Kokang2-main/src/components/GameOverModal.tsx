import React, { useEffect } from 'react';
import { GameMode, CropType } from '../types/game';
import { CROP_CONFIGS } from '../utils/cropConfigs';
import { RotateCcw, Home, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  gameMode: GameMode;
  cropsHarvested: Record<CropType, number>;
  maxCombo: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  gameMode,
  cropsHarvested,
  maxCombo,
  isNewRecord,
  onRestart,
  onHome,
}) => {
  useEffect(() => {
    sound.playGameOver();
    if (isNewRecord) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#D97706', '#EAB308'],
      });
    }
  }, [isNewRecord]);

  // Determine Harvest Grade based on score
  const getHarvestTitle = (pts: number) => {
    if (pts >= 1200) return { title: '천하대풍작 (天下大豊作)', sub: '마을 전체가 기뻐할 기적 같은 대수확입니다!' };
    if (pts >= 800) return { title: '대풍작 (大豊作)', sub: '토기 항아리가 넘쳐흐를 만큼 풍족한 수확입니다.' };
    if (pts >= 400) return { title: '풍년 (豊年)', sub: '겨울을 든든하게 보낼 양식을 가득 모았습니다.' };
    if (pts >= 150) return { title: '평년 (平年)', sub: '조상들의 반달돌칼 솜씨가 점차 익숙해지고 있습니다.' };
    return { title: '첫 수확 (初收穫)', sub: '더 많은 곡물을 단번에 베어 콤보를 노려보세요!' };
  };

  const harvestEvaluation = getHarvestTitle(score);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 shadow-2xl text-stone-100 flex flex-col items-center text-center">
        {/* New Record Banner */}
        {isNewRecord && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/60 rounded-full text-amber-300 text-xs font-semibold mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>새로운 수확 최고 기록 달성!</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
          <Award className="w-4 h-4" />
          <span>{gameMode === 'CLASSIC' ? '고전 수확 결과' : '풍년 60초 결과'}</span>
        </div>

        <h2 className="font-traditional text-3xl md:text-4xl font-bold text-stone-100 mb-1">
          {harvestEvaluation.title}
        </h2>
        <p className="text-xs text-stone-400 mb-6 max-w-sm">
          {harvestEvaluation.sub}
        </p>

        {/* Score Display Card */}
        <div className="w-full bg-stone-950/80 border border-stone-800/80 rounded-xl p-4 mb-5 flex items-center justify-around">
          <div>
            <div className="text-xs text-stone-400 mb-0.5">최종 수확량</div>
            <div className="font-modern tabular-nums text-3xl font-extrabold text-amber-400">
              {score.toLocaleString()} <span className="text-xs font-normal text-stone-400">낟알</span>
            </div>
          </div>
          <div className="h-8 w-px bg-stone-800" />
          <div>
            <div className="text-xs text-stone-400 mb-0.5">최대 연속 콤보</div>
            <div className="font-modern tabular-nums text-3xl font-extrabold text-emerald-400">
              {maxCombo} <span className="text-xs font-normal text-stone-400">연속</span>
            </div>
          </div>
        </div>

        {/* Harvest Crop Breakdown Grid */}
        <div className="w-full mb-6">
          <div className="text-xs text-stone-400 font-medium text-left mb-2">수확한 청동기 곡물 내역</div>
          <div className="grid grid-cols-4 gap-2">
            {(['rice', 'barley', 'millet', 'sorghum'] as CropType[]).map((type) => {
              const cfg = CROP_CONFIGS[type];
              const count = cropsHarvested[type] || 0;
              return (
                <div key={type} className="bg-stone-950/50 border border-stone-800/60 rounded-lg p-2 flex flex-col items-center">
                  <span className="text-[11px] text-stone-400 truncate max-w-full">{cfg.name.split(' ')[0]}</span>
                  <span className="font-modern tabular-nums text-lg font-bold text-stone-200 mt-0.5">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 수확하기</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="py-3 px-4 bg-[#F39A3A] hover:bg-[#F7A64B] text-white font-medium rounded-full border border-[#E9750E] transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Home className="w-4 h-4 stroke-[2.4]" />
            <span>메뉴</span>
          </button>
        </div>
      </div>
    </div>
  );
};
