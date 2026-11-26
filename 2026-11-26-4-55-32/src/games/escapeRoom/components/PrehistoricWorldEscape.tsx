import React, { useState } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { sound } from '../services/soundService';
import { InventoryItem, ClueItem } from '../types/game';
import { AmbientStageEffects } from './AmbientStageEffects';
import { ItemIcon } from './ItemIcon';
import { BoarHuntMiniGame } from './BoarHuntMiniGame';
import { ShardMissionModal, QuizMissionId } from './ShardMissionModal';
import { PotteryAssemblyEscape } from './PotteryAssemblyEscape';
import { Check, Sparkles, ChevronRight } from 'lucide-react';

interface PrehistoricWorldEscapeProps {
  onCompleteGame: () => void;
  inventory: InventoryItem[];
  selectedItemId: string | null;
  onAddItem: (item: InventoryItem) => void;
  onRemoveItem: (itemId: string | string[]) => void;
  onAddClue: (clue: ClueItem) => void;
  onClearSelectedItem: () => void;
  onTriggerSpeech: (speech: string) => void;
}

export type PrehistoricLocation = 'umjib' | 'village' | 'boar_game' | 'assembly';

const SHARD_META: Record<number, { title: string; clueTitle: string; clueContent: string }> = {
  1: {
    title: '토기조각1',
    clueTitle: '고강동 움집 주거지',
    clueContent: '땅을 파고 짚 지붕을 얹어 추위를 막던 청동기시대 집.',
  },
  2: {
    title: '토기조각2',
    clueTitle: '갈판과 갈돌',
    clueContent: '도토리와 곡식을 갈아 가루로 만들던 선사시대 돌 도구.',
  },
  3: {
    title: '토기조각3',
    clueTitle: '선사시대 사냥',
    clueContent: '숲속에서 멧돼지를 잡아 부족의 식량을 얻었어요.',
  },
  4: {
    title: '토기조각4',
    clueTitle: '고강동 구멍무늬 토기',
    clueContent: '입구 가장자리에 구멍이 뚫린 고강동 대표 토기.',
  },
  5: {
    title: '토기조각5',
    clueTitle: '고천산 적석환유구',
    clueContent: '산 정상에서 하늘에 제사를 지내던 둥근 돌 제단.',
  },
};

export const PrehistoricWorldEscape: React.FC<PrehistoricWorldEscapeProps> = ({
  onCompleteGame,
  inventory,
  selectedItemId,
  onAddItem,
  onRemoveItem,
  onAddClue,
  onClearSelectedItem,
  onTriggerSpeech,
}) => {
  const [currentLocation, setCurrentLocation] = useState<PrehistoricLocation>('umjib');

  // Umjib states
  const [umjibClothMoved, setUmjibClothMoved] = useState(false);
  const [hasUmjibBlade, setHasUmjibBlade] = useState(false);
  const [isUmjibDoorOpen, setIsUmjibDoorOpen] = useState(false);
  const [isCuttingRope, setIsCuttingRope] = useState(false);
  const [doorRopeShaking, setDoorRopeShaking] = useState(false);
  const [isDoorHovered, setIsDoorHovered] = useState(false);

  // 5 Magic Pottery Shards progression
  const [collectedShards, setCollectedShards] = useState<number[]>([]);
  const [activeQuizMission, setActiveQuizMission] = useState<QuizMissionId | null>(null);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  const showToast = (text: string) => {
    setQuickToast(text);
    setTimeout(() => {
      setQuickToast(null);
    }, 2000);
  };

  const hasItem = (id: string) => inventory.some(item => item.id === id);

  const hasShard = (num: number) =>
    collectedShards.includes(num) || hasItem(`pottery_shard_${num}`);

  const collectedCount = [1, 2, 3, 4, 5].filter(hasShard).length;
  const allShardsCollected = collectedCount === 5;

  // Award shard helper
  const awardShard = (num: 1 | 2 | 3 | 4 | 5) => {
    const meta = SHARD_META[num];
    if (!collectedShards.includes(num)) {
      setCollectedShards(prev => [...prev, num]);
    }
    onAddItem({
      id: `pottery_shard_${num}`,
      name: meta.title,
      category: 'artifact',
      description: `고강동 마법의 토기 조각 (${num}/5). 5개를 모두 모으면 현실로 돌아갈 수 있습니다.`,
      detailedLore: meta.clueContent,
      iconName: 'Sparkles',
      acquiredAtStage: 'STAGE_2_VILLAGE',
    });
    onAddClue({
      id: `clue_shard_${num}`,
      stageId: 'STAGE_2_VILLAGE',
      title: meta.clueTitle,
      content: meta.clueContent,
      category: '현장기록',
      icon: 'Sparkles',
      timestamp: `조각 ${num}/5`,
    });
    showToast(`✓ 마법의 토기 조각 #${num} 획득!`);
  };

  // ---------------- UMJIB INTERACTIONS ----------------
  const handleInspectBasket = () => {
    if (!umjibClothMoved) {
      sound.playClick();
      setUmjibClothMoved(true);
      showToast('천을 걷어내자 칼이 보입니다!');
    } else if (
      !hasUmjibBlade &&
      !hasItem('umjib_knife') &&
      !hasItem('umjib_flint') &&
      !hasItem('umjib_blade') &&
      !hasItem('umjib_key')
    ) {
      sound.playSuccess();
      setHasUmjibBlade(true);
      onAddItem({
        id: 'umjib_knife',
        name: '칼',
        category: 'tool',
        description: '묶인 문 밧줄을 끊을 수 있는 칼.',
        detailedLore: '선사시대 흑요석 칼.',
        iconName: 'Scissors',
        acquiredAtStage: 'STAGE_2_VILLAGE',
      });
      showToast('✓ [칼] 획득! 문 밧줄을 누르거나 드래그하세요.');
    }
  };

  const handleUseOnDoor = (itemId?: string) => {
    if (isUmjibDoorOpen) {
      sound.playClick();
      setCurrentLocation('village');
      return;
    }

    const itemToUse = itemId || selectedItemId;
    const isKnifeItem =
      itemToUse === 'umjib_knife' ||
      itemToUse === 'umjib_flint' ||
      itemToUse === 'umjib_blade' ||
      itemToUse === 'umjib_key' ||
      hasUmjibBlade ||
      hasItem('umjib_knife') ||
      hasItem('umjib_flint') ||
      hasItem('umjib_blade') ||
      hasItem('umjib_key');

    if (isKnifeItem) {
      setIsCuttingRope(true);
      sound.playSuccess();
      setTimeout(() => {
        setIsCuttingRope(false);
        setIsUmjibDoorOpen(true);
        onClearSelectedItem();
        onRemoveItem(['umjib_knife', 'umjib_flint', 'umjib_blade', 'umjib_key']);
        showToast('싹둑! 문이 열렸어요!');
      }, 600);
    } else {
      sound.playError();
      setDoorRopeShaking(true);
      setTimeout(() => setDoorRopeShaking(false), 450);
      onTriggerSpeech('문이 밧줄로 묶여 있어! 오른쪽 바구니에서 칼을 찾아보자!');
    }
  };

  return (
    <div className="relative w-full h-full min-h-[340px] flex-1 bg-[#f4e2c1] flex flex-col justify-between select-none overflow-hidden">
      {/* Crisp 1-Line Toast */}
      {quickToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-2xl bg-[#fffaf0] border-[3px] border-[#4d2810] text-[#4d2810] text-xs font-extrabold shadow-lg animate-in fade-in">
          {quickToast}
        </div>
      )}

      {/* ==================== 1. UMJIB INTERIOR ==================== */}
      {currentLocation === 'umjib' && (
        <div className="relative w-full h-full min-h-[340px] bg-[#f4e2c1] overflow-hidden select-none">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 600">
            <defs>
              <radialGradient id="pitFloorLight" cx="50%" cy="68%" r="60%">
                <stop offset="0%" stopColor="#f5dcb0" />
                <stop offset="55%" stopColor="#dfb67b" />
                <stop offset="100%" stopColor="#b8844c" />
              </radialGradient>
              <linearGradient id="thatchRoof" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c78b46" />
                <stop offset="55%" stopColor="#e5b976" />
                <stop offset="100%" stopColor="#f5dcb0" />
              </linearGradient>
              <linearGradient id="beamWood" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7d4925" />
                <stop offset="50%" stopColor="#a36434" />
                <stop offset="100%" stopColor="#693b1c" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="1000" height="600" fill="url(#thatchRoof)" />
            {/* Cute storybook thatched straw lines */}
            <g stroke="#8c5627" strokeWidth="4" strokeLinecap="round" opacity="0.45">
              <line x1="50" y1="0" x2="180" y2="280" />
              <line x1="150" y1="0" x2="260" y2="290" />
              <line x1="250" y1="0" x2="340" y2="300" />
              <line x1="400" y1="0" x2="430" y2="310" />
              <line x1="500" y1="0" x2="500" y2="310" />
              <line x1="600" y1="0" x2="570" y2="310" />
              <line x1="750" y1="0" x2="660" y2="300" />
              <line x1="850" y1="0" x2="740" y2="290" />
              <line x1="950" y1="0" x2="820" y2="280" />
            </g>
            {/* Warm wooden posts and crossbeam with dark-brown outlines */}
            <polygon points="118,0 160,0 92,600 46,600" fill="url(#beamWood)" stroke="#4d2810" strokeWidth="4" />
            <polygon points="882,0 840,0 908,600 954,600" fill="url(#beamWood)" stroke="#4d2810" strokeWidth="4" />
            <rect x="135" y="148" width="730" height="28" rx="10" fill="url(#beamWood)" stroke="#4d2810" strokeWidth="4" />
            <ellipse cx="500" cy="525" rx="560" ry="205" fill="url(#pitFloorLight)" stroke="#8c5828" strokeWidth="3" />
          </svg>

          <AmbientStageEffects theme="workshop" />

          {/* Tied Wooden Door */}
          <div
            className={`absolute left-[7%] sm:left-[11%] top-[14%] w-[38%] sm:w-[32%] h-[72%] z-20 flex flex-col items-center justify-center transition-transform ${
              doorRopeShaking ? 'animate-shake' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDoorHovered(true);
            }}
            onDragLeave={() => setIsDoorHovered(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDoorHovered(false);
              const droppedId = e.dataTransfer.getData('text/plain');
              handleUseOnDoor(droppedId);
            }}
            onClick={() => handleUseOnDoor()}
          >
            <div
              className={`relative w-full h-full rounded-t-[44px] border-[4px] transition-all duration-300 flex flex-col items-center justify-between shadow-[0_12px_0_rgba(77,40,16,0.28)] overflow-hidden cursor-pointer ${
                isDoorHovered
                  ? 'border-[#ffca58] ring-4 ring-[#ffca58]/60 scale-102 bg-[#b5733b]'
                  : isUmjibDoorOpen
                  ? 'border-[#4d2810] bg-[#9c5f2f]'
                  : 'border-[#4d2810] hover:border-[#8f4c1f] bg-[#a36331]'
              }`}
            >
              {!isUmjibDoorOpen ? (
                <div className="relative w-full flex-1 flex flex-col justify-center items-center px-3 py-2 bg-gradient-to-b from-[#bd7a44] via-[#a36331] to-[#8a4f23]">
                  {/* Cute wooden plank lines */}
                  <div className="absolute inset-y-0 left-1/3 w-0.5 bg-[#4d2810]/30 pointer-events-none" />
                  <div className="absolute inset-y-0 right-1/3 w-0.5 bg-[#4d2810]/30 pointer-events-none" />

                  <svg viewBox="0 0 200 160" className="relative z-10 w-full max-w-[210px] drop-shadow-md">
                    <path d="M 10 30 Q 100 70 190 120" stroke="#4d2810" strokeWidth="16" strokeLinecap="round" fill="none" />
                    <path d="M 10 30 Q 100 70 190 120" stroke="#f0be70" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <path d="M 10 125 Q 100 80 190 35" stroke="#4d2810" strokeWidth="16" strokeLinecap="round" fill="none" />
                    <path d="M 10 125 Q 100 80 190 35" stroke="#e2a856" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <path d="M 5 72 Q 100 82 195 72" stroke="#4d2810" strokeWidth="16" strokeLinecap="round" fill="none" />
                    <path d="M 5 72 Q 100 82 195 72" stroke="#f7ce86" strokeWidth="10" strokeLinecap="round" fill="none" />
                    <ellipse cx="100" cy="80" rx="28" ry="22" fill="#e2a856" stroke="#4d2810" strokeWidth="4" />
                    <ellipse cx="100" cy="80" rx="16" ry="12" fill="#f7ce86" stroke="#4d2810" strokeWidth="3" />
                    {isCuttingRope && (
                      <g>
                        <line x1="30" y1="30" x2="170" y2="130" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="100" cy="80" r="16" fill="#ffca58" className="animate-ping" />
                      </g>
                    )}
                  </svg>
                  {(hasUmjibBlade || hasItem('umjib_knife')) && (
                    <div className="relative z-10 mt-2 w-11 h-11 rounded-full border-[3px] border-[#4d2810] bg-[#ffca58] flex items-center justify-center animate-bounce shadow-md">
                      <span className="text-lg">🔪</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-[#9be2ff] via-[#cdefff] to-[#a7df75] animate-in zoom-in-95 duration-500">
                  <div className="px-4 py-2 rounded-2xl bg-[#fffaf0] border-[3px] border-[#4d2810] text-[#4d2810] font-extrabold text-sm flex items-center gap-1.5 shadow-[0_4px_0_#4d2810] animate-bounce">
                    <span>밖으로 나가기</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Woven Basket with Knife (Right) */}
          <div
            className="absolute right-[8%] sm:right-[12%] top-[46%] w-[32%] sm:w-[26%] h-[46%] z-20 flex flex-col items-center justify-center cursor-pointer group select-none"
            onClick={handleInspectBasket}
          >
            {!hasUmjibBlade && !hasItem('umjib_knife') && (
              <div className="mb-1 w-9 h-9 rounded-full bg-[#ffca58] border-[3px] border-[#4d2810] flex items-center justify-center animate-bounce pointer-events-none shadow-md">
                <span className="text-sm">👆</span>
              </div>
            )}
            <div className="relative w-44 sm:w-52 h-32 sm:h-36 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg viewBox="0 0 160 110" className="w-full h-full drop-shadow-md">
                <ellipse cx="80" cy="96" rx="62" ry="12" fill="#8c5828" opacity="0.35" />
                <path d="M 18 45 C 22 80 40 100 80 100 C 120 100 138 80 142 45 Z" fill="#d99f54" stroke="#4d2810" strokeWidth="4" />
                <ellipse cx="80" cy="45" rx="62" ry="16" fill="#be813b" stroke="#4d2810" strokeWidth="4" />
                <ellipse cx="80" cy="45" rx="52" ry="11" fill="#6b3e1b" />

                {!umjibClothMoved ? (
                  <path
                    d="M 22 40 C 40 32 120 32 138 40 C 145 52 142 66 130 72 C 110 80 50 80 30 72 C 18 66 16 52 22 40 Z"
                    fill="#fff2d6"
                    stroke="#4d2810"
                    strokeWidth="3.5"
                  />
                ) : (
                  <>
                    <path
                      d="M 124 45 C 138 48 152 60 148 76 C 144 86 130 88 124 78 Z"
                      fill="#fff2d6"
                      stroke="#4d2810"
                      strokeWidth="3"
                    />
                    {!hasUmjibBlade && !hasItem('umjib_knife') && (
                      <g className="animate-pulse">
                        <path d="M 44 48 L 62 45 L 64 52 L 46 55 Z" fill="#b86b35" stroke="#4d2810" strokeWidth="2.5" />
                        <path d="M 63 45 L 102 38 C 108 37 114 41 115 45 L 114 48 L 105 52 L 65 52 Z" fill="#4f6070" stroke="#4d2810" strokeWidth="2.5" />
                        <circle cx="95" cy="36" r="5" fill="#ffca58" className="animate-ping" />
                      </g>
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. VILLAGE HUB (5-SHARD VISUAL ESCAPE QUEST) ==================== */}
      {currentLocation === 'village' && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('${publicAsset('/assets/escape-room/cute_prehistoric_village_1795598617747.jpg')}')` }}
          />
          <AmbientStageEffects theme="village" />

          {/* Top Visual 5-Shard Progress Plaque */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#fffaf0]/95 border-[3px] border-[#4d2810] shadow-[0_4px_0_rgba(77,40,16,0.3)]">
            <span className="text-xs font-extrabold text-[#4d2810] mr-1">
              토기 조각
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(num => {
                const owned = hasShard(num);
                return (
                  <div
                    key={num}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      owned
                        ? 'bg-[#ffe89c] border-[#4d2810] scale-105'
                        : 'bg-[#efe6d2] border-[#b8976a]'
                    }`}
                  >
                    {owned ? (
                      <ItemIcon itemId={`pottery_shard_${num}`} className="w-5 h-5" />
                    ) : (
                      <span className="text-[10px] font-mono font-extrabold text-[#7d4925]">{num}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-xs font-mono font-black text-[#c45b18] ml-1 tabular-nums">
              {collectedCount}/5
            </span>
          </div>

          {/* 5 Visual Station Markers Aligned with Cute Village Illustration */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {/* Station 1: Umjib House Quiz */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (!hasShard(1)) setActiveQuizMission('umjib');
                else showToast('✓ #1 움집 조각 획득 완료!');
              }}
              style={{ left: '21%', top: '44%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full border-[3px] border-[#4d2810] flex items-center justify-center shadow-[0_4px_0_#4d2810] transition-transform group-hover:scale-110 ${
                  hasShard(1)
                    ? 'bg-[#c5f2b3] text-[#285e1a]'
                    : 'bg-[#ffca58] text-[#4d2810] animate-bounce'
                }`}
              >
                {hasShard(1) ? <Check className="w-6 h-6" /> : <span className="text-2xl">🛖</span>}
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#fffaf0] border-2 border-[#4d2810] text-[11px] font-extrabold text-[#4d2810] whitespace-nowrap shadow-sm">
                1. 움집
              </span>
            </button>

            {/* Station 2: Quern Acorn Grinding */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (!hasShard(2)) setActiveQuizMission('quern');
                else showToast('✓ #2 갈판·갈돌 조각 획득 완료!');
              }}
              style={{ left: '19%', top: '76%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full border-[3px] border-[#4d2810] flex items-center justify-center shadow-[0_4px_0_#4d2810] transition-transform group-hover:scale-110 ${
                  hasShard(2)
                    ? 'bg-[#c5f2b3] text-[#285e1a]'
                    : 'bg-[#ffca58] text-[#4d2810] animate-bounce'
                }`}
              >
                {hasShard(2) ? <Check className="w-6 h-6" /> : <span className="text-2xl">🌰</span>}
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#fffaf0] border-2 border-[#4d2810] text-[11px] font-extrabold text-[#4d2810] whitespace-nowrap shadow-sm">
                2. 도토리 갈기
              </span>
            </button>

            {/* Station 3: Boar Catching Mini-Game! */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (!hasShard(3)) setCurrentLocation('boar_game');
                else showToast('✓ #3 멧돼지 사냥 조각 획득 완료!');
              }}
              style={{ left: '55%', top: '68%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full border-[3px] border-[#4d2810] flex items-center justify-center shadow-[0_4px_0_#4d2810] transition-transform group-hover:scale-110 ${
                  hasShard(3)
                    ? 'bg-[#c5f2b3] text-[#285e1a]'
                    : 'bg-[#ff9f58] text-[#4d2810] animate-bounce'
                }`}
              >
                {hasShard(3) ? <Check className="w-6 h-6" /> : <span className="text-2xl">🐗</span>}
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#fffaf0] border-2 border-[#4d2810] text-[11px] font-extrabold text-[#4d2810] whitespace-nowrap shadow-sm">
                3. 돼지 잡기!
              </span>
            </button>

            {/* Station 4: Pottery Quiz */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (!hasShard(4)) setActiveQuizMission('pottery');
                else showToast('✓ #4 구멍무늬 토기 조각 획득 완료!');
              }}
              style={{ left: '84%', top: '72%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full border-[3px] border-[#4d2810] flex items-center justify-center shadow-[0_4px_0_#4d2810] transition-transform group-hover:scale-110 ${
                  hasShard(4)
                    ? 'bg-[#c5f2b3] text-[#285e1a]'
                    : 'bg-[#ffca58] text-[#4d2810] animate-bounce'
                }`}
              >
                {hasShard(4) ? <Check className="w-6 h-6" /> : <span className="text-2xl">🏺</span>}
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#fffaf0] border-2 border-[#4d2810] text-[11px] font-extrabold text-[#4d2810] whitespace-nowrap shadow-sm">
                4. 토기 찾기
              </span>
            </button>

            {/* Station 5: Gocheonsan Altar Quiz */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (!hasShard(5)) setActiveQuizMission('altar');
                else showToast('✓ #5 적석환유구 조각 획득 완료!');
              }}
              style={{ left: '72%', top: '23%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-13 h-13 rounded-full border-[3px] border-[#4d2810] flex items-center justify-center shadow-[0_4px_0_#4d2810] transition-transform group-hover:scale-110 ${
                  hasShard(5)
                    ? 'bg-[#c5f2b3] text-[#285e1a]'
                    : 'bg-[#ffca58] text-[#4d2810] animate-bounce'
                }`}
              >
                {hasShard(5) ? <Check className="w-6 h-6" /> : <span className="text-2xl">⛰️</span>}
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#fffaf0] border-2 border-[#4d2810] text-[11px] font-extrabold text-[#4d2810] whitespace-nowrap shadow-sm">
                5. 하늘 제단
              </span>
            </button>

            {/* Final Assembly Portal Button when all 5 Shards are Collected! */}
            {allShardsCollected && (
              <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center animate-in zoom-in duration-300">
                <button
                  type="button"
                  onClick={() => {
                    sound.playRelicResonance();
                    setCurrentLocation('assembly');
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#ffca58] hover:bg-[#ffd67a] text-[#4d2810] font-extrabold text-sm sm:text-base shadow-[0_5px_0_#4d2810] border-[3px] border-[#4d2810] hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer animate-bounce"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>토기 조각 5개 이어 맞추기</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Quiz / Grinding Modal (Missions 1, 2, 4, 5) */}
          {activeQuizMission && (
            <ShardMissionModal
              missionId={activeQuizMission}
              onClose={() => setActiveQuizMission(null)}
              onComplete={(shardNum) => {
                awardShard(shardNum);
                setActiveQuizMission(null);
              }}
            />
          )}
        </>
      )}

      {/* ==================== 3. BOAR HUNT MINI-GAME (MISSION 3) ==================== */}
      {currentLocation === 'boar_game' && (
        <BoarHuntMiniGame
          onClose={() => setCurrentLocation('village')}
          onComplete={() => {
            awardShard(3);
            setCurrentLocation('village');
          }}
        />
      )}

      {/* ==================== 4. MAGIC POTTERY ASSEMBLY & RETURN TO REALITY ==================== */}
      {currentLocation === 'assembly' && (
        <PotteryAssemblyEscape
          onClose={() => setCurrentLocation('village')}
          onConsumeShard={(shardId) => onRemoveItem(shardId)}
          onReturnToPresent={() => {
            onRemoveItem([
              'pottery_shard_1',
              'pottery_shard_2',
              'pottery_shard_3',
              'pottery_shard_4',
              'pottery_shard_5',
              'relic_fragment',
            ]);
            onCompleteGame();
          }}
        />
      )}
    </div>
  );
};
