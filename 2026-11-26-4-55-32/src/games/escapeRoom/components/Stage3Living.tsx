import React, { useState } from 'react';
import { publicAsset } from '@/utils/publicAsset';
import { sound } from '../services/soundService';
import { InventoryItem, ClueItem } from '../types/game';
import { HotspotMarker } from './HotspotMarker';
import { AmbientStageEffects } from './AmbientStageEffects';
import { CheckCircle2, X, Hammer, Layers, Key } from 'lucide-react';

interface Stage3LivingProps {
  onStageComplete: (reward: InventoryItem, newClues: ClueItem[]) => void;
  onAddClue: (clue: ClueItem) => void;
  inventory: InventoryItem[];
  selectedItemId?: string | null;
  onSelectItem?: (item: InventoryItem) => void;
  showHotspotGlow?: boolean;
}

export const Stage3Living: React.FC<Stage3LivingProps> = ({
  onStageComplete,
  onAddClue,
  selectedItemId,
  showHotspotGlow = false
}) => {
  // Discovery & Crafting State
  const [hasTakenBlade, setHasTakenBlade] = useState(false);
  const [hasTakenHandle, setHasTakenHandle] = useState(false);
  const [hasTakenCord, setHasTakenCord] = useState(false);
  const [isDaggerCrafted, setIsDaggerCrafted] = useState(false);
  const [isChestUnlocked, setIsChestUnlocked] = useState(false);
  const [hasTakenCipher, setHasTakenCipher] = useState(false);

  // Active Lightbox Modal
  const [inspectModal, setInspectModal] = useState<'bench' | 'tool_rack' | 'chest' | 'crafting' | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Crafting Dagger: requires all 3 parts
  const handleCraftDagger = () => {
    if (hasTakenBlade && hasTakenHandle && hasTakenCord) {
      sound.playSuccess();
      setIsDaggerCrafted(true);
      showToast('마제석검(간돌검)을 성공적으로 조립했습니다!');

      onAddClue({
        id: 'clue_crafted_dagger',
        stageId: 'STAGE_3_LIVING',
        title: '마제석검(간돌검) 조립 완성',
        category: '도구정보',
        content: '점판암 날을 참나무 자루에 끼우고 사슴 힘줄로 단단히 결속하여 위력적인 간돌검을 완성했습니다.',
        icon: 'Hammer',
        timestamp: '00:20'
      });
    } else {
      sound.playError();
      showToast('재료가 부족합니다. 작업대 주변에서 [칼날], [손잡이], [힘줄 끈]을 모두 찾아야 합니다.');
    }
  };

  // Using Dagger to Pry Open Locked Stone Chest
  const handleUseItemOnChest = (itemId: string) => {
    if (itemId === 'crafted_stone_dagger' || isDaggerCrafted) {
      sound.playSuccess();
      setIsChestUnlocked(true);
      showToast('마제석검으로 단단한 돌 빗장을 지렛대처럼 젖혀 상자를 열었습니다!');

      onAddClue({
        id: 'clue_chest_unlocked',
        stageId: 'STAGE_3_LIVING',
        title: '장인의 비밀 석함 개방',
        category: '현장기록',
        content: '마제석검을 지렛대로 활용해 잠겨 있던 비밀 석함을 열었습니다.',
        icon: 'Unlock',
        timestamp: '00:22'
      });
    } else {
      sound.playError();
      showToast('상자가 무거운 돌 빗장으로 닫혀 있습니다. 단단한 간돌검으로 지렛대를 걸어야 합니다.');
    }
  };

  const handleTakeCipher = () => {
    sound.playSuccess();
    setHasTakenCipher(true);
    setInspectModal(null);
    showToast('제단 천문 암호 석판을 획득했습니다!');

    const cipherReward: InventoryItem = {
      id: 'ancient_altar_location_cipher',
      name: '제단 천문 암호 석판',
      category: 'cipher',
      description: '장인의 석함 속에서 발견된 고강동 적석환유구 제단과 천문 일치 각도가 새겨진 암호 석판.',
      detailedLore: '외환 0도(동지 일출), 중환 90도(북극성), 내환 180도(하지 정오)의 괘를 맞출 때 제단의 문이 열린다.',
      iconName: 'Key',
      acquiredAtStage: 'STAGE_3_LIVING'
    };

    const newClues: ClueItem[] = [
      {
        id: 'clue_altar_cipher_acquired',
        stageId: 'STAGE_3_LIVING',
        title: '적석환유구 제단 암호 석판 획득',
        category: '암호',
        content: '바깥 링 0° / 중간 링 90° / 안쪽 링 180°로 천문 축을 정렬하면 제단이 개방됨.',
        icon: 'Compass',
        timestamp: '00:24'
      }
    ];

    setTimeout(() => {
      onStageComplete(cipherReward, newClues);
    }, 2000);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-black flex flex-col justify-between select-none overflow-hidden">
      {/* Background Room View: Stone Craftsman Workshop */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url('${publicAsset('/assets/escape-room/craftsman_bench_view_1790926153534.jpg')}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      <AmbientStageEffects theme="workshop" />

      {/* Dynamic Feedback Toast */}
      {feedbackToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-black/90 border border-amber-400 text-amber-200 text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in">
          {feedbackToast}
        </div>
      )}

      {/* Pure Point-and-Click Natural Hotspots (NO yellow boxes / NO permanent text) */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {/* 1. Craftsman Workbench Tools on the Table (Center-Left) */}
        <HotspotMarker
          x={42}
          y={64}
          width={28}
          height={24}
          title="작업대 위 석기 부품들"
          showGlow={showHotspotGlow}
          onClick={() => setInspectModal('bench')}
        />

        {/* 2. Stone Tool Display Rack (Upper-Left) */}
        <HotspotMarker
          x={20}
          y={44}
          width={20}
          height={26}
          title="선사 도구 진열대"
          showGlow={showHotspotGlow}
          onClick={() => setInspectModal('tool_rack')}
        />

        {/* 3. Locked Secret Stone Chest (Right Floor) */}
        <HotspotMarker
          x={78}
          y={72}
          width={24}
          height={24}
          title={isChestUnlocked ? "열린 비밀 석함" : "잠긴 비밀 석함"}
          showGlow={showHotspotGlow}
          selectedItemId={selectedItemId}
          onItemUse={handleUseItemOnChest}
          onClick={() => {
            if (isChestUnlocked && !hasTakenCipher) {
              setInspectModal('chest');
            } else if (!isChestUnlocked) {
              if (isDaggerCrafted) {
                handleUseItemOnChest('crafted_stone_dagger');
              } else {
                setInspectModal('chest');
              }
            } else {
              showToast('석함 안의 물건을 이미 획득했습니다.');
            }
          }}
        />
      </div>

      {/* ===================== CLOSE-UP INVESTIGATION MODALS ===================== */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#181214] border-2 border-stone-700 rounded-3xl p-6 text-stone-100 shadow-2xl relative">
            <button
              onClick={() => setInspectModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-white bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 1. WORKBENCH PARTS & CRAFTING */}
            {inspectModal === 'bench' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  장인의 작업대 정밀 조사
                </span>

                <div className="grid grid-cols-3 gap-3">
                  {/* Blade */}
                  <button
                    disabled={hasTakenBlade}
                    onClick={() => {
                      sound.playClick();
                      setHasTakenBlade(true);
                      showToast('[점판암 칼날]을 챙겼습니다.');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      hasTakenBlade
                        ? 'bg-stone-900/60 border-stone-800 opacity-40'
                        : 'bg-black/60 border-stone-700 hover:border-amber-400 cursor-pointer'
                    }`}
                  >
                    <span className="text-3xl block mb-1">🔪</span>
                    <div className="text-xs font-bold text-amber-200">점판암 칼날</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {hasTakenBlade ? '✓ 획득 완료' : '클릭하여 획득'}
                    </div>
                  </button>

                  {/* Handle */}
                  <button
                    disabled={hasTakenHandle}
                    onClick={() => {
                      sound.playClick();
                      setHasTakenHandle(true);
                      showToast('[참나무 손잡이]를 챙겼습니다.');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      hasTakenHandle
                        ? 'bg-stone-900/60 border-stone-800 opacity-40'
                        : 'bg-black/60 border-stone-700 hover:border-amber-400 cursor-pointer'
                    }`}
                  >
                    <span className="text-3xl block mb-1">🪵</span>
                    <div className="text-xs font-bold text-amber-200">참나무 손잡이</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {hasTakenHandle ? '✓ 획득 완료' : '클릭하여 획득'}
                    </div>
                  </button>

                  {/* Cord */}
                  <button
                    disabled={hasTakenCord}
                    onClick={() => {
                      sound.playClick();
                      setHasTakenCord(true);
                      showToast('[사슴 힘줄 끈]을 챙겼습니다.');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      hasTakenCord
                        ? 'bg-stone-900/60 border-stone-800 opacity-40'
                        : 'bg-black/60 border-stone-700 hover:border-amber-400 cursor-pointer'
                    }`}
                  >
                    <span className="text-3xl block mb-1">🧵</span>
                    <div className="text-xs font-bold text-amber-200">사슴 힘줄 끈</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {hasTakenCord ? '✓ 획득 완료' : '클릭하여 획득'}
                    </div>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-3 rounded-xl border border-stone-800">
                  {isDaggerCrafted
                    ? '마제석검(간돌검)이 이미 완성되었습니다. 이 단단한 검으로 비밀 석함의 돌 빗장을 열 수 있습니다.'
                    : '작업대 위에 숫돌로 정밀하게 간 점판암 칼날과 단단한 참나무 손잡이, 사슴 힘줄 끈이 흩어져 있습니다.'}
                </p>

                {!isDaggerCrafted && (
                  <button
                    disabled={!hasTakenBlade || !hasTakenHandle || !hasTakenCord}
                    onClick={handleCraftDagger}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
                      hasTakenBlade && hasTakenHandle && hasTakenCord
                        ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>재료 3가지를 조립하여 [마제석검] 만들기</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. TOOL RACK (HISTORICAL FLAVOR) */}
            {inspectModal === 'tool_rack' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  선사 도구 진열대
                </span>
                <div className="p-4 rounded-2xl bg-black/60 border border-stone-700 text-left text-xs text-stone-200 leading-relaxed font-serif space-y-2">
                  <p className="text-amber-200 font-bold">
                    [부천 고강동 출토 도구 고증]
                  </p>
                  <p>
                    <strong>· 반달돌칼(半月形石刀):</strong> 벼나 조의 이삭을 낱알로 수확하기 위해 끈 구멍을 뚫어 손가락에 걸고 쓴 농경 도구입니다.
                  </p>
                  <p>
                    <strong>· 마제석검(磨製石劍):</strong> 점판암을 숫돌에 정밀하게 갈아 만든 간돌검으로, 부족 군장의 지휘권과 신분을 상징하는 위세품입니다.
                  </p>
                  <p>
                    <strong>· 붉은간토기(紅陶):</strong> 산화철 안료를 곱게 발라 붉은 광택을 낸 최고급 의례용 제기입니다.
                  </p>
                </div>
                <button
                  onClick={() => setInspectModal(null)}
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                >
                  확인
                </button>
              </div>
            )}

            {/* 3. LOCKED CHEST */}
            {inspectModal === 'chest' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  장인의 비밀 석함
                </span>
                <div className="w-28 h-28 mx-auto rounded-2xl bg-stone-900 border-2 border-stone-700 flex items-center justify-center">
                  <span className="text-5xl">{isChestUnlocked ? '📦' : '🪨'}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-3 rounded-xl border border-stone-800">
                  {!isChestUnlocked
                    ? '무거운 돌 뚜껑이 빗장 홈에 깊숙이 물려 있습니다. 단단한 마제석검 날을 틈새에 넣어 지렛대로 젖혀야 합니다.'
                    : !hasTakenCipher
                    ? '석함이 열렸습니다! 안에 제단의 천문 각도가 음각된 [천문 제단 암호 석판]이 들어 있습니다.'
                    : '석함 안의 암호 석판을 이미 획득했습니다.'}
                </p>

                {isChestUnlocked && !hasTakenCipher && (
                  <button
                    onClick={handleTakeCipher}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    [제단 천문 암호 석판] 획득하고 제단으로 향하기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
