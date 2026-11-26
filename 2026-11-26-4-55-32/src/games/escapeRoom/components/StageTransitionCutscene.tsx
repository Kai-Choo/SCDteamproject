import React, { useEffect, useState } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { StageId, InventoryItem } from '../types/game';
import { sound } from '../services/soundService';
import { Sparkles, ArrowRight, Compass, Landmark, ShieldCheck, MapPin } from 'lucide-react';

interface StageTransitionCutsceneProps {
  fromStage: StageId;
  toStage: StageId;
  rewardItem?: InventoryItem;
  onContinue: () => void;
}

export const StageTransitionCutscene: React.FC<StageTransitionCutsceneProps> = ({
  fromStage,
  toStage,
  rewardItem,
  onContinue,
}) => {
  const [phase, setPhase] = useState<'flash' | 'content'>('flash');

  useEffect(() => {
    sound.playSuccess();
    sound.playRelicResonance();

    // Flash/Portal surge phase
    const timer = setTimeout(() => {
      setPhase('content');
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const getTransitionDetails = () => {
    if (fromStage === 'STAGE_1_LAB' && toStage === 'STAGE_2_VILLAGE') {
      return {
        tag: '시공간 전송 완료',
        title: '3천 년 전 선사시대로의 도약',
        narrative: '시간 이동 장치가 눈부신 섬광을 뿜어내며 현실의 감각이 멀어집니다... 거친 바람과 흙냄새 속에서 눈을 뜨자, 눈앞에 고대 선사시대 원형 움집 마을의 풍경이 펼쳐집니다!',
        nextLocation: '기원전 1000년경 고강동 선사시대 마을 터',
        bgImage: publicAsset('/assets/escape-room/prehistoric_village_scene_1790923408627.jpg')
      };
    }
    if (fromStage === 'STAGE_2_VILLAGE' && toStage === 'STAGE_3_LIVING') {
      return {
        tag: '흔적 추적 성공',
        title: '선사 장인의 공방 진입',
        narrative: '사슴가죽 덧신 자국과 떨어진 점판암 조각을 따라 바위 언덕을 넘어섰습니다. 골짜기 너머에서 타오르는 화덕 연기와 함께, 선사시대 석기 장인의 은밀한 공방이 모습을 드러냅니다.',
        nextLocation: '마을 장인의 석기 제작 터 & 주거 공간',
        bgImage: publicAsset('/assets/escape-room/prehistoric_village_scene_1790923408627.jpg')
      };
    }
    if (fromStage === 'STAGE_3_LIVING' && toStage === 'STAGE_4_ALTAR') {
      return {
        tag: '암호 석판 획득',
        title: '고천산 정상 적석환유구 제단으로',
        narrative: '석함에서 획득한 고대 천문 암호 석판을 품에 안고 마을 뒷산인 저룡산(고천산) 능선으로 향합니다. 구름과 맞닿은 산봉우리 정상에, 하늘에 제사를 올리던 거대한 적석환유구가 장엄하게 서 있습니다.',
        nextLocation: '고천산 능선 정상 적석환유구(積石環遺構) 제단',
        bgImage: publicAsset('/assets/escape-room/prehistoric_ritual_altar_1790923421228.jpg')
      };
    }
    if (fromStage === 'STAGE_4_ALTAR' && toStage === 'FINAL_STAGE_RETURN') {
      return {
        tag: '신성한 환유경 완전 복원',
        title: '시공간 차원 공명과 귀환의 문',
        narrative: '복원된 환유경이 뿜어내는 황금빛 광채가 제단의 동심원 돌들을 깨웁니다. 허공이 일렁이며 현대의 부천 고강선사유적체험관으로 이어지는 거대한 시공간 차원 포털이 개방됩니다!',
        nextLocation: '적석환유구 중심 차원 귀환 게이트',
        bgImage: publicAsset('/assets/escape-room/prehistoric_ritual_altar_1790923421228.jpg')
      };
    }
    return {
      tag: '차원 도약',
      title: '다음 장소로의 이동',
      narrative: '단서를 모아 다음 모험의 장소로 자연스럽게 발걸음을 옮깁니다.',
      nextLocation: '다음 탐사 구역',
      bgImage: publicAsset('/assets/escape-room/gogang_lab_interior_1790923386568.jpg')
    };
  };

  const details = getTransitionDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Background Image with Slow Zoom */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 animate-pulse duration-1000"
        style={{ backgroundImage: `url('${details.bgImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/60" />

      {/* White flash surge on start */}
      {phase === 'flash' && (
        <div className="absolute inset-0 bg-amber-100/40 z-50 pointer-events-none animate-out fade-out duration-700" />
      )}

      {/* Main Transition Card */}
      <div className="relative z-10 w-full max-w-2xl bg-stone-900/90 border border-amber-600/60 rounded-3xl p-6 sm:p-9 text-stone-100 shadow-2xl backdrop-blur-md text-center space-y-5 animate-in zoom-in-95 duration-400">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>{details.tag}</span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-amber-100 tracking-tight">
            {details.title}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400/90 font-medium pt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>이동 위치: {details.nextLocation}</span>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
          {details.narrative}
        </p>

        {/* Obtained Relic Highlight */}
        {rewardItem && (
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-xl shrink-0 shadow-inner">
                {rewardItem.category === 'document' ? '📜' : rewardItem.category === 'cipher' ? '🔑' : '✨'}
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
                  새로 획득한 소지품
                </span>
                <div className="text-sm font-bold text-amber-100 font-editorial">
                  {rewardItem.name}
                </div>
              </div>
            </div>
            <span className="text-xs text-stone-400 hidden sm:inline">
              인벤토리에 추가됨 ✓
            </span>
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => {
              sound.playClick();
              onContinue();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl transition-transform active:scale-95"
          >
            <span>다음 장소로 이동하기</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
