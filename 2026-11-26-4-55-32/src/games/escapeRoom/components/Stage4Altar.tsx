import React, { useState } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { sound } from '../services/soundService';
import { InventoryItem, ClueItem } from '../types/game';
import { HotspotMarker } from './HotspotMarker';
import { AmbientStageEffects } from './AmbientStageEffects';
import { CheckCircle2, X, Compass, Sparkles, Sun } from 'lucide-react';

interface Stage4AltarProps {
  onStageComplete: (reward: InventoryItem, newClues: ClueItem[]) => void;
  onAddClue: (clue: ClueItem) => void;
  inventory: InventoryItem[];
  selectedItemId?: string | null;
  onSelectItem?: (item: InventoryItem) => void;
  showHotspotGlow?: boolean;
}

export const Stage4Altar: React.FC<Stage4AltarProps> = ({
  onStageComplete,
  onAddClue,
  showHotspotGlow = false
}) => {
  // Altar stone rings alignment
  const [outerAngle, setOuterAngle] = useState(270);
  const [middleAngle, setMiddleAngle] = useState(180);
  const [innerAngle, setInnerAngle] = useState(45);
  const [isAltarUnlocked, setIsAltarUnlocked] = useState(false);

  // Relic 5 fragments restoration
  const initialPieces = [
    { id: 'core', name: '중앙 태양핵', icon: '☀️', placed: false },
    { id: 'north', name: '북쪽 점판암 날', icon: '⛰️', placed: false },
    { id: 'east', name: '동쪽 태양 날개', icon: '🌅', placed: false },
    { id: 'south', name: '남쪽 곡옥 고리', icon: '🌙', placed: false },
    { id: 'west', name: '서쪽 청동 테두리', icon: '🛡️', placed: false },
  ];
  const [pieces, setPieces] = useState(initialPieces);
  const [isRestorationComplete, setIsRestorationComplete] = useState(false);

  // Active Lightbox Modal
  const [inspectModal, setInspectModal] = useState<'rings' | 'vault' | 'altar_stone' | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const rotateRing = (ring: 'outer' | 'middle' | 'inner') => {
    sound.playClick();
    if (ring === 'outer') setOuterAngle(prev => (prev + 90) % 360);
    if (ring === 'middle') setMiddleAngle(prev => (prev + 90) % 360);
    if (ring === 'inner') setInnerAngle(prev => (prev + 45) % 360);

    const nextOuter = ring === 'outer' ? (outerAngle + 90) % 360 : outerAngle;
    const nextMiddle = ring === 'middle' ? (middleAngle + 90) % 360 : middleAngle;
    const nextInner = ring === 'inner' ? (innerAngle + 45) % 360 : innerAngle;

    if (nextOuter === 0 && nextMiddle === 90 && nextInner === 180) {
      sound.playSuccess();
      setIsAltarUnlocked(true);
      showToast('쿠구구궁! 천문 축이 맞춰지며 제단 중앙 석실이 열렸습니다!');

      onAddClue({
        id: 'clue_altar_aligned',
        stageId: 'STAGE_4_ALTAR',
        title: '적석환유구 동심원 제단 개방',
        category: '현장기록',
        content: '동심원 돌 제단을 동지·북극성·하지 천문 각도에 맞춰 중앙 안치대를 열었습니다.',
        icon: 'Compass',
        timestamp: '00:26'
      });
    }
  };

  const handlePlacePiece = (pieceId: string) => {
    sound.playClick();
    const updated = pieces.map(p => p.id === pieceId ? { ...p, placed: true } : p);
    setPieces(updated);

    if (updated.every(p => p.placed)) {
      sound.playSuccess();
      setIsRestorationComplete(true);
      showToast('환유경 유물이 온전히 복원되어 황금빛 포털이 열립니다!');

      const restoredRelic: InventoryItem = {
        id: 'restored_hwan_yu_gyeong',
        name: '완전히 복원된 신성한 환유경',
        category: 'artifact',
        description: '부천 고강동 청동기 부족의 하늘 제천의례에 모셨던 보물. 5개 조각이 온전히 합쳐져 황금빛을 뿜어낸다.',
        detailedLore: '이 보물이 복원되자 중앙에서 미래로 향하는 시공간 차원 문이 활짝 열린다.',
        iconName: 'Sparkles',
        acquiredAtStage: 'STAGE_4_ALTAR'
      };

      const newClues: ClueItem[] = [
        {
          id: 'clue_relic_fully_restored',
          stageId: 'STAGE_4_ALTAR',
          title: '신성한 환유경 보물 완전 복원',
          category: '문양',
          content: '보물이 완성되자 시공간 포털이 열렸어요! 이제 2026년으로 돌아갈 수 있어요!',
          icon: 'Sparkles',
          timestamp: '00:28'
        }
      ];

      setTimeout(() => {
        onStageComplete(restoredRelic, newClues);
      }, 2200);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-black flex flex-col justify-between select-none overflow-hidden">
      {/* Background Room View: Ancient Concentric Stone Altar on Mountain Peak */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url('${publicAsset('/assets/escape-room/prehistoric_ritual_altar_1790923421228.jpg')}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      <AmbientStageEffects theme="altar" />

      {/* Dynamic Feedback Toast */}
      {feedbackToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-black/90 border border-amber-400 text-amber-200 text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in">
          {feedbackToast}
        </div>
      )}

      {/* Pure Point-and-Click Natural Hotspots (NO yellow boxes / NO permanent text) */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {/* 1. Concentric Stone Rings (Center Altar Stones) */}
        <HotspotMarker
          x={50}
          y={66}
          width={30}
          height={26}
          title="동심원 돌 제단"
          showGlow={showHotspotGlow}
          onClick={() => setInspectModal('rings')}
        />

        {/* 2. Central Relic Vault / Pedestal (Center-Upper Altar) */}
        <HotspotMarker
          x={50}
          y={36}
          width={24}
          height={22}
          title={isAltarUnlocked ? "열린 중앙 유물 안치대" : "닫힌 중앙 석실"}
          showGlow={showHotspotGlow}
          onClick={() => {
            if (!isAltarUnlocked) {
              sound.playError();
              showToast('제단의 동심원 돌들이 정렬되지 않아 석실이 굳게 닫혀 있습니다.');
            } else {
              setInspectModal('vault');
            }
          }}
        />

        {/* 3. Mountain Ridge Horizon (Top) */}
        <HotspotMarker
          x={20}
          y={25}
          width={22}
          height={20}
          title="고천산(저룡산) 정상 능선"
          showGlow={showHotspotGlow}
          onClick={() => setInspectModal('altar_stone')}
        />
      </div>

      {/* ===================== CLOSE-UP INVESTIGATION MODALS ===================== */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#14151a] border-2 border-stone-700 rounded-3xl p-6 text-stone-100 shadow-2xl relative">
            <button
              onClick={() => setInspectModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-white bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 1. RINGS ALIGNMENT */}
            {inspectModal === 'rings' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  적석환유구 동심원 천문 축 정렬
                </span>
                <p className="text-xs text-stone-300 font-serif">
                  암호 석판의 기록: 바깥 링 0°(동지 일출), 중간 링 90°(북극성), 안쪽 링 180°(하지 정오)
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => rotateRing('outer')}
                    className="w-full p-3 rounded-xl border border-stone-700 bg-black/50 hover:bg-stone-800 text-xs font-bold flex items-center justify-between"
                  >
                    <span>바깥쪽 링 (외환)</span>
                    <span className="text-amber-300 font-mono">{outerAngle}° (목표: 0°) 🔄 회전</span>
                  </button>

                  <button
                    onClick={() => rotateRing('middle')}
                    className="w-full p-3 rounded-xl border border-stone-700 bg-black/50 hover:bg-stone-800 text-xs font-bold flex items-center justify-between"
                  >
                    <span>중간 링 (중환)</span>
                    <span className="text-amber-300 font-mono">{middleAngle}° (목표: 90°) 🔄 회전</span>
                  </button>

                  <button
                    onClick={() => rotateRing('inner')}
                    className="w-full p-3 rounded-xl border border-stone-700 bg-black/50 hover:bg-stone-800 text-xs font-bold flex items-center justify-between"
                  >
                    <span>안쪽 링 (내환)</span>
                    <span className="text-amber-300 font-mono">{innerAngle}° (목표: 180°) 🔄 회전</span>
                  </button>
                </div>

                {isAltarUnlocked && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400 text-center space-y-2">
                    <div className="text-xs font-bold text-emerald-200">
                      천문 축 정렬 완료! 중앙 석실이 개방되었습니다.
                    </div>
                    <button
                      onClick={() => setInspectModal('vault')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
                    >
                      중앙 안치대로 이동 →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. RELIC RESTORATION VAULT */}
            {inspectModal === 'vault' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  환유경 유물 중앙 안치대
                </span>
                <h3 className="text-sm font-bold text-white">
                  흩어진 5개의 유물 조각을 안치대에 결합하세요.
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  {pieces.map(piece => (
                    <button
                      key={piece.id}
                      disabled={piece.placed}
                      onClick={() => handlePlacePiece(piece.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        piece.placed
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 opacity-90'
                          : 'bg-black/60 border-stone-700 text-white hover:border-amber-400 hover:bg-stone-800 cursor-pointer'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{piece.icon}</span>
                      <span className="text-xs font-bold">{piece.name}</span>
                      <div className="text-[10px] mt-0.5">
                        {piece.placed ? '✓ 결합 완료' : '클릭하여 결합'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. HORIZON FLAVOR */}
            {inspectModal === 'altar_stone' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  고강동 적석환유구 유적 고증
                </span>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-4 rounded-xl border border-stone-800 text-left">
                  부천 고강동 고천산 정상에 위치한 <strong>적석환유구(積石環溝)</strong>는 청동기 시대 한강 유역 사람들이 하늘과 조상신에게 제사를 지내던 제천 의례 유구입니다. 둥글게 파낸 환구(도랑)와 쌓아 올린 돌무지가 천문 방향과 일치합니다.
                </p>
                <button
                  onClick={() => setInspectModal(null)}
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
