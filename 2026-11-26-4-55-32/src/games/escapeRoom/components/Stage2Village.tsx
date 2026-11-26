import React, { useState } from 'react';
import { sound } from '../services/soundService';
import { InventoryItem, ClueItem } from '../types/game';
import { HotspotMarker } from './HotspotMarker';
import { AmbientStageEffects } from './AmbientStageEffects';
import { ArrowLeft, CheckCircle2, X, Key, Lock, Unlock, Eye, Sparkles } from 'lucide-react';

interface Stage2VillageProps {
  onStageComplete: (reward: InventoryItem, newClues: ClueItem[]) => void;
  onAddClue: (clue: ClueItem) => void;
  inventory: InventoryItem[];
  selectedItemId?: string | null;
  onSelectItem?: (item: InventoryItem) => void;
  showHotspotGlow?: boolean;
}

export const Stage2Village: React.FC<Stage2VillageProps> = ({
  onStageComplete,
  onAddClue,
  inventory,
  selectedItemId,
  showHotspotGlow = false
}) => {
  // Start inside the Umjib dwelling, as specifically requested!
  const [currentLocation, setCurrentLocation] = useState<'umjib_interior' | 'village_main' | 'storage_pit' | 'forest_trail'>('umjib_interior');

  // --- Step 1: Umjib Escape State ---
  const [hasInspectedBasket, setHasInspectedBasket] = useState(false);
  const [hasMovedCloth, setHasMovedCloth] = useState(false);
  const [hasTakenKey, setHasTakenKey] = useState(false);
  const [isDoorUnlocked, setIsDoorUnlocked] = useState(false);
  const [isDoorOpen, setIsDoorOpen] = useState(false);

  // --- Step 2: Storage & Village State ---
  const [hasMovedPottery, setHasMovedPottery] = useState(false);
  const [hasTakenSlateShard, setHasTakenSlateShard] = useState(false);
  const [isChestUnlocked, setIsChestUnlocked] = useState(false);
  const [hasTakenMap, setHasTakenMap] = useState(false);
  const [hasSpokenToElder, setHasSpokenToElder] = useState(false);

  // --- Step 3: Forest Trail State ---
  const [selectedFootprint, setSelectedFootprint] = useState<string | null>(null);
  const [isTrailDiscovered, setIsTrailDiscovered] = useState(false);

  // Active Lightbox Modal (Detailed Object Investigation)
  const [inspectModal, setInspectModal] = useState<
    'basket' | 'door_lock' | 'hearth' | 'storage_pottery' | 'storage_chest' | 'elder' | 'footprints' | 'generic' | null
  >(null);
  const [genericMessage, setGenericMessage] = useState<{ title: string; text: string } | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // 1. Basket & Cloth: Uncovering Hidden Key
  const handleOpenBasket = () => {
    setInspectModal('basket');
    setHasInspectedBasket(true);
  };

  const handleMoveCloth = () => {
    sound.playClick();
    setHasMovedCloth(true);
  };

  const handleTakeKey = () => {
    sound.playSuccess();
    setHasTakenKey(true);
    setInspectModal(null);
    showToast('나무 빗장 열쇠를 획득했습니다!');

    const umjibKey: InventoryItem = {
      id: 'umjib_door_key',
      name: '움집 빗장 열쇠',
      category: 'tool',
      description: '움집 구석 바구니 안 마른 헝겊 밑에 숨겨져 있던 뼈와 나무로 깎아 만든 빗장 열쇠.',
      detailedLore: '출입문 빗장 틈새에 끼워 비틀면 잠금이 풀리도록 정교하게 다듬어져 있다.',
      iconName: 'Key',
      acquiredAtStage: 'STAGE_2_VILLAGE'
    };

    onAddClue({
      id: 'clue_found_key',
      stageId: 'STAGE_2_VILLAGE',
      title: '숨겨진 움집 열쇠 발견',
      category: '현장기록',
      content: '바구니 속 낡은 헝겊을 치우자 그 밑에 출입문 빗장 열쇠가 숨겨져 있었습니다.',
      icon: 'Key',
      timestamp: '00:07'
    });

    // Provide reward item through stage complete or add to inventory
    // In our system, parent App manages inventory via selected items or rewards
  };

  // 2. Door & Key: Using Key to Unlock
  const handleInspectDoor = () => {
    if (isDoorOpen) {
      sound.playClick();
      setCurrentLocation('village_main');
      return;
    }

    if (isDoorUnlocked) {
      sound.playSuccess();
      setIsDoorOpen(true);
      showToast('문이 열렸습니다. 밖으로 나갈 수 있습니다.');
      return;
    }

    // Door is locked
    setInspectModal('door_lock');
  };

  const handleUseItemOnDoor = (itemId: string) => {
    if (itemId === 'umjib_door_key' || hasTakenKey) {
      sound.playSuccess();
      setIsDoorUnlocked(true);
      setIsDoorOpen(true);
      setInspectModal(null);
      showToast('철컥! 열쇠가 맞물려 움집 문이 활짝 열렸습니다!');

      onAddClue({
        id: 'clue_door_opened',
        stageId: 'STAGE_2_VILLAGE',
        title: '움집 탈출 성공',
        category: '현장기록',
        content: '열쇠로 굳게 닫혀 있던 움집 빗장을 풀고 마을 바깥으로 나왔습니다.',
        icon: 'Unlock',
        timestamp: '00:09'
      });
    } else {
      sound.playError();
      showToast('이 아이템으로는 문을 열 수 없습니다.');
    }
  };

  // 3. Storage Area: Move Pottery & Pick Up Slate Shard
  const handleInspectStoragePottery = () => {
    setInspectModal('storage_pottery');
  };

  const handleMovePottery = () => {
    sound.playClick();
    setHasMovedPottery(true);
  };

  const handleTakeSlateShard = () => {
    sound.playSuccess();
    setHasTakenSlateShard(true);
    setInspectModal(null);
    showToast('흑색 점판암 조각을 주웠습니다!');

    onAddClue({
      id: 'clue_village_shard',
      stageId: 'STAGE_2_VILLAGE',
      title: '바닥의 흑색 점판암 조각',
      category: '현장기록',
      content: '도토리 항아리 뒤편에서 도난자가 떨어뜨린 흑색 점판암 조각을 수습했습니다.',
      icon: 'Package',
      timestamp: '00:11'
    });
  };

  // 4. Storage Chest: Unlocking with Slate Shard
  const handleInspectChest = () => {
    setInspectModal('storage_chest');
  };

  const handleUseItemOnChest = (itemId: string) => {
    if (itemId === 'black_slate_shard' || hasTakenSlateShard) {
      sound.playSuccess();
      setIsChestUnlocked(true);
      showToast('점판암 조각으로 상자의 틈을 비틀어 상자를 열었습니다!');
    } else {
      sound.playError();
      showToast('상자가 단단한 끈과 나무 홈으로 잠겨 있습니다. 틈을 벌릴 돌 조각이 필요합니다.');
    }
  };

  const handleTakeMapFromChest = () => {
    sound.playSuccess();
    setHasTakenMap(true);
    setInspectModal(null);
    showToast('저룡산 비밀 지도 조각을 획득했습니다!');

    onAddClue({
      id: 'clue_mountain_map_found',
      stageId: 'STAGE_2_VILLAGE',
      title: '고천산(저룡산) 비밀 지도 조각',
      category: '문양',
      content: '부족의 비밀 상자 속에서 북쪽 능선 제단으로 향하는 오솔길 지도를 획득했습니다.',
      icon: 'Map',
      timestamp: '00:14'
    });
  };

  // 5. Forest Trail: Following Footprints
  const handleSelectFootprintPath = (pathId: string) => {
    sound.playClick();
    setSelectedFootprint(pathId);

    if (pathId === 'path_moccasin') {
      sound.playSuccess();
      setIsTrailDiscovered(true);

      const relicSketchReward: InventoryItem = {
        id: 'relic_fragment_sketch',
        name: '유물의 일부가 그려진 암각화 스케치',
        category: 'document',
        description: '부족의 신성한 환유경 유물의 원형과 5개 분할 상징 조각의 결합 규칙이 붉은 황토로 그려진 암각화 도본.',
        detailedLore: '중앙의 둥근 태양핵과 동서남북 4대 방향의 점판암·청동 조각 결합 구조가 스케치되어 있다.',
        iconName: 'FileText',
        acquiredAtStage: 'STAGE_2_VILLAGE'
      };

      const newClues: ClueItem[] = [
        {
          id: 'clue_sketch_acquired',
          stageId: 'STAGE_2_VILLAGE',
          title: '환유경 복원 스케치 획득',
          category: '문양',
          content: '도난당한 유물은 청동과 점판암이 결합된 원형 제기로, 제단 정상에 조각들이 분산되어 숨겨져 있음.',
          icon: 'Sparkles',
          timestamp: '00:16'
        }
      ];

      setTimeout(() => {
        onStageComplete(relicSketchReward, newClues);
      }, 2000);
    } else {
      sound.playError();
      showToast('이 발자국은 산길로 이어지지 않습니다.');
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-black flex flex-col justify-between select-none overflow-hidden">
      {/* Dynamic Feedback Toast */}
      {feedbackToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-black/90 border border-amber-400 text-amber-200 text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {feedbackToast}
        </div>
      )}

      {/* ===================== VIEW 1: UMJIB INTERIOR (STARTING SCENE) ===================== */}
      {currentLocation === 'umjib_interior' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('/assets/escape-room/umjib_interior_view_1790926115968.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          <AmbientStageEffects theme="workshop" />

          {/* Natural Objects to Click (NO yellow box / NO floating badges!) */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {/* 1. Straw Basket in Corner (Right Floor) */}
            <HotspotMarker
              x={78}
              y={76}
              width={18}
              height={20}
              title="바닥 구석에 놓인 짚 바구니"
              showGlow={showHotspotGlow}
              onClick={handleOpenBasket}
            />

            {/* 2. Wooden Latch Exit Door (Center-Left) */}
            <HotspotMarker
              x={22}
              y={56}
              width={20}
              height={36}
              title={isDoorOpen ? "열린 출입문 (밖으로 나가기)" : "굳게 닫힌 움집 출입문"}
              showGlow={showHotspotGlow}
              selectedItemId={selectedItemId}
              onItemUse={handleUseItemOnDoor}
              onClick={handleInspectDoor}
            />

            {/* 3. Central Fire Hearth (Center Floor) */}
            <HotspotMarker
              x={50}
              y={74}
              width={26}
              height={22}
              title="화덕자리 잿더미"
              showGlow={showHotspotGlow}
              onClick={() => {
                setInspectModal('hearth');
              }}
            />

            {/* 4. Overturned Wooden Relic Pedestal (Left Floor) */}
            <HotspotMarker
              x={40}
              y={58}
              width={16}
              height={18}
              title="쓰러진 제기 받침대"
              showGlow={showHotspotGlow}
              onClick={() => {
                setGenericMessage({
                  title: '쓰러진 나무 받침대',
                  text: '부족의 신성한 환유경 유물이 올려져 있던 받침대입니다. 침입자가 유물을 빼앗아 달아나며 바닥에 쓰러뜨렸습니다.'
                });
                setInspectModal('generic');
              }}
            />

            {/* 5. Coarse Pottery Jar on Left */}
            <HotspotMarker
              x={64}
              y={58}
              width={14}
              height={18}
              title="흙으로 빚은 민무늬토기"
              showGlow={showHotspotGlow}
              onClick={() => {
                setGenericMessage({
                  title: '선사시대 민무늬토기',
                  text: '바닥이 납작하고 표면에 무늬가 없는 실용적인 토기입니다. 안에는 깨끗한 식수가 담겨 있습니다.'
                });
                setInspectModal('generic');
              }}
            />
          </div>

          {/* Door Status Visual Cue if opened */}
          {isDoorOpen && (
            <div className="absolute top-14 left-4 z-30 animate-in fade-in">
              <button
                onClick={() => setCurrentLocation('village_main')}
                className="px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-2xl backdrop-blur-md hover:bg-amber-900"
              >
                <span>🚪 마을 밖으로 나가기 →</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ===================== VIEW 2: VILLAGE MAIN (OUTSIDE) ===================== */}
      {currentLocation === 'village_main' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('/assets/escape-room/prehistoric_village_scene_1790923408627.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          <AmbientStageEffects theme="village" />

          {/* Back to Umjib Interior Button */}
          <div className="absolute top-14 left-4 z-30">
            <button
              onClick={() => setCurrentLocation('umjib_interior')}
              className="px-3.5 py-1.5 rounded-xl bg-black/80 border border-stone-600 text-stone-300 text-xs font-bold flex items-center gap-1.5 hover:text-white backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>움집 안으로</span>
            </button>
          </div>

          {/* Natural Outdoor Hotspots */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {/* Storage Pit Dugout (Center-Bottom) */}
            <HotspotMarker
              x={50}
              y={76}
              width={22}
              height={22}
              title="곡물 저장 구덩이"
              showGlow={showHotspotGlow}
              onClick={() => setCurrentLocation('storage_pit')}
            />

            {/* Northern Forest Trail (Upper-Right) */}
            <HotspotMarker
              x={66}
              y={38}
              width={20}
              height={22}
              title="북쪽 능선 숲길"
              showGlow={showHotspotGlow}
              onClick={() => setCurrentLocation('forest_trail')}
            />

            {/* Village Elder (Right) */}
            <HotspotMarker
              x={80}
              y={64}
              width={16}
              height={24}
              title="부족 장로"
              showGlow={showHotspotGlow}
              onClick={() => {
                setInspectModal('elder');
                if (!hasSpokenToElder) {
                  setHasSpokenToElder(true);
                  onAddClue({
                    id: 'clue_elder_testimony',
                    stageId: 'STAGE_2_VILLAGE',
                    title: '장로의 목격 진술',
                    category: '현장기록',
                    content: '도난자는 부드러운 사슴가죽 덧신을 신고 북쪽 산길로 도주했습니다.',
                    icon: 'MessageSquare',
                    timestamp: '00:10'
                  });
                }
              }}
            />
          </div>
        </>
      )}

      {/* ===================== VIEW 3: STORAGE PIT ===================== */}
      {currentLocation === 'storage_pit' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('/assets/escape-room/storage_pit_detail_1790926129790.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          <AmbientStageEffects theme="village" />

          {/* Back button */}
          <div className="absolute top-14 left-4 z-30">
            <button
              onClick={() => setCurrentLocation('village_main')}
              className="px-3.5 py-1.5 rounded-xl bg-black/80 border border-stone-600 text-stone-300 text-xs font-bold flex items-center gap-1.5 hover:text-white backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>마을로 나가기</span>
            </button>
          </div>

          <div className="absolute inset-0 z-20 pointer-events-auto">
            {/* Storage Pottery Jar */}
            <HotspotMarker
              x={65}
              y={58}
              width={24}
              height={26}
              title="도토리 저장 무문토기"
              showGlow={showHotspotGlow}
              onClick={handleInspectStoragePottery}
            />

            {/* Tribal Wooden/Stone Chest on Ground */}
            <HotspotMarker
              x={35}
              y={68}
              width={22}
              height={22}
              title={isChestUnlocked ? "열린 비밀 상자" : "잠긴 비밀 상자"}
              showGlow={showHotspotGlow}
              selectedItemId={selectedItemId}
              onItemUse={handleUseItemOnChest}
              onClick={handleInspectChest}
            />
          </div>
        </>
      )}

      {/* ===================== VIEW 4: FOREST TRAIL ===================== */}
      {currentLocation === 'forest_trail' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('/assets/escape-room/forest_trail_footprints_1790926142083.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          <AmbientStageEffects theme="village" />

          {/* Back button */}
          <div className="absolute top-14 left-4 z-30">
            <button
              onClick={() => setCurrentLocation('village_main')}
              className="px-3.5 py-1.5 rounded-xl bg-black/80 border border-stone-600 text-stone-300 text-xs font-bold flex items-center gap-1.5 hover:text-white backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>마을로 나가기</span>
            </button>
          </div>

          {/* Ground Footprints to Inspect */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            <HotspotMarker
              x={50}
              y={75}
              width={30}
              height={24}
              title="흙바닥의 발자국들"
              showGlow={showHotspotGlow}
              onClick={() => setInspectModal('footprints')}
            />
          </div>
        </>
      )}

      {/* ===================== OBJECT INSPECTION LIGHTBOX (POINT-AND-CLICK CLOSE-UP) ===================== */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#1a1516] border-2 border-stone-700 rounded-3xl p-6 text-stone-100 shadow-2xl relative">
            <button
              onClick={() => setInspectModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-white bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 1. BASKET CLOSE-UP: Lift cloth -> find key */}
            {inspectModal === 'basket' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  짚 바구니 내부 조사
                </span>
                <div className="w-32 h-32 mx-auto rounded-2xl bg-stone-900 border-2 border-stone-700 flex items-center justify-center relative overflow-hidden shadow-inner">
                  {!hasMovedCloth ? (
                    <div 
                      onClick={handleMoveCloth}
                      className="cursor-pointer group flex flex-col items-center justify-center p-2"
                      title="클릭하여 헝겊 치우기"
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform">🧺</span>
                      <span className="text-[11px] text-amber-200 font-bold mt-1 group-hover:underline">
                        낡은 헝겊 덮개
                      </span>
                      <span className="text-[9px] text-stone-400">(클릭하여 치우기)</span>
                    </div>
                  ) : !hasTakenKey ? (
                    <div 
                      onClick={handleTakeKey}
                      className="cursor-pointer group flex flex-col items-center justify-center animate-in zoom-in duration-200"
                      title="클릭하여 열쇠 획득"
                    >
                      <Key className="w-12 h-12 text-amber-300 animate-bounce" />
                      <span className="text-xs text-amber-200 font-bold mt-1 group-hover:underline">
                        나무 빗장 열쇠!
                      </span>
                      <span className="text-[9px] text-amber-400">(클릭하여 획득)</span>
                    </div>
                  ) : (
                    <div className="text-stone-500 text-xs flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                      <span>열쇠를 이미 획득했습니다.</span>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-3 rounded-xl border border-stone-800">
                  {!hasMovedCloth
                    ? '바구니 안쪽에 거칠게 짠 마른 헝겊이 가지런히 덮여 있습니다. 밑에 무언가 숨겨져 있는 것 같습니다.'
                    : !hasTakenKey
                    ? '헝겊을 치우자 바닥에 정교하게 깎아 만든 [나무 빗장 열쇠]가 놓여 있습니다!'
                    : '바구니 안에는 더 이상 특별한 물건이 없습니다.'}
                </p>
              </div>
            )}

            {/* 2. DOOR LOCK CLOSE-UP: Use key or inspect lock */}
            {inspectModal === 'door_lock' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  움집 출입문 빗장
                </span>
                <div className="w-28 h-28 mx-auto rounded-2xl bg-stone-900 border-2 border-stone-700 flex items-center justify-center">
                  <Lock className="w-14 h-14 text-amber-400 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white">
                  튼튼한 통나무 빗장으로 문이 잠겨 있습니다.
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-3 rounded-xl border border-stone-800">
                  빗장 옆 틈새에 알맞은 형태의 열쇠를 끼워 넣어야 문을 열 수 있습니다.
                </p>

                {hasTakenKey && (
                  <button
                    onClick={() => handleUseItemOnDoor('umjib_door_key')}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>소지한 [움집 빗장 열쇠]로 문 열기</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. HEARTH CLOSE-UP */}
            {inspectModal === 'hearth' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  화덕자리 잿더미 조사
                </span>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-4 rounded-xl border border-stone-800 text-left">
                  타원형으로 돌을 두른 화덕자리에 마른 쑥과 재가 흩뿌려져 있습니다. 그 위에 발소리를 죽이기 위해 신은 <strong>부드러운 사슴가죽 덧신 자국</strong>이 선명히 찍혀 문밖으로 이어져 있습니다.
                </p>
                <button
                  onClick={() => setInspectModal(null)}
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                >
                  확인
                </button>
              </div>
            )}

            {/* 4. STORAGE POTTERY CLOSE-UP */}
            {inspectModal === 'storage_pottery' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  저장 무문토기 조사
                </span>
                <div className="w-32 h-32 mx-auto rounded-2xl bg-stone-900 border-2 border-stone-700 flex items-center justify-center overflow-hidden">
                  {!hasMovedPottery ? (
                    <div 
                      onClick={handleMovePottery}
                      className="cursor-pointer group flex flex-col items-center justify-center"
                      title="클릭하여 항아리 옆으로 밀기"
                    >
                      <span className="text-5xl group-hover:scale-105 transition-transform">🏺</span>
                      <span className="text-[10px] text-amber-300 mt-1">(항아리 옆으로 치우기)</span>
                    </div>
                  ) : !hasTakenSlateShard ? (
                    <div 
                      onClick={handleTakeSlateShard}
                      className="cursor-pointer group flex flex-col items-center justify-center animate-in zoom-in"
                      title="클릭하여 돌 조각 획득"
                    >
                      <span className="text-4xl text-cyan-300 animate-bounce">💎</span>
                      <span className="text-xs text-cyan-200 font-bold mt-1">
                        흑색 점판암 조각
                      </span>
                      <span className="text-[10px] text-amber-300">(클릭하여 획득)</span>
                    </div>
                  ) : (
                    <span className="text-stone-500 text-xs">수습 완료</span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-3 rounded-xl border border-stone-800">
                  {!hasMovedPottery
                    ? '도토리가 가득 찬 무문토기입니다. 뒤편 흙바닥 틈새에 검은 물체가 언뜻 보입니다.'
                    : !hasTakenSlateShard
                    ? '항아리를 밀자 바닥에 떨어진 [흑색 점판암 조각]이 드러났습니다! 도난당한 유물 테두리의 파편입니다.'
                    : '항아리 주변의 중요한 단서를 모두 수습했습니다.'}
                </p>
              </div>
            )}

            {/* 5. STORAGE CHEST CLOSE-UP */}
            {inspectModal === 'storage_chest' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  부족의 비밀 상자
                </span>
                <div className="w-28 h-28 mx-auto rounded-2xl bg-stone-900 border-2 border-stone-700 flex items-center justify-center">
                  <span className="text-4xl">{isChestUnlocked ? '📦' : '🔒'}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-3 rounded-xl border border-stone-800">
                  {!isChestUnlocked
                    ? '질긴 가죽끈과 돌 빗장으로 봉인된 상자입니다. 틈새를 비틀어 열 수 있는 얇고 단단한 돌 파편이 필요합니다.'
                    : !hasTakenMap
                    ? '상자가 열렸습니다! 안에 붉은 황토로 그린 [저룡산 비밀 지도 조각]이 들어 있습니다.'
                    : '상자 안의 지도를 이미 획득했습니다.'}
                </p>

                {!isChestUnlocked && hasTakenSlateShard && (
                  <button
                    onClick={() => handleUseItemOnChest('black_slate_shard')}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    소지한 [흑색 점판암 조각]으로 상자 틈새 비틀기
                  </button>
                )}

                {isChestUnlocked && !hasTakenMap && (
                  <button
                    onClick={handleTakeMapFromChest}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold text-xs"
                  >
                    [저룡산 비밀 지도 조각] 획득하기
                  </button>
                )}
              </div>
            )}

            {/* 6. ELDER CLOSE-UP */}
            {inspectModal === 'elder' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  부족 장로의 목격 진술
                </span>
                <p className="text-xs sm:text-sm text-amber-200 leading-relaxed font-serif bg-amber-950/40 p-4 rounded-xl border border-amber-800 text-left">
                  "어젯밤 보름달이 뜰 무렵, 누군가 움집에서 성스러운 유물을 품에 안고 뛰쳐나가는 것을 보았네. 그는 발소리를 숨기려 <strong>사슴가죽 덧신</strong>을 신고 북쪽 능선 숲길로 사라졌소!"
                </p>
                <button
                  onClick={() => setInspectModal(null)}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold"
                >
                  확인
                </button>
              </div>
            )}

            {/* 7. FOOTPRINTS CLOSE-UP */}
            {inspectModal === 'footprints' && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  발자국 경로 조사
                </span>
                <h3 className="text-sm font-bold text-white">
                  장로의 증언(사슴가죽 덧신)과 일치하는 발자국을 선택하세요.
                </h3>

                <div className="grid grid-cols-2 gap-2 text-left">
                  {[
                    { id: 'path_boar', name: '1. 멧돼지 굽 자국', desc: '진흙탕 쪽' },
                    { id: 'path_barefoot', name: '2. 맨발 자국', desc: '강가 쪽' },
                    { id: 'path_deer', name: '3. 노루 발자국', desc: '풀숲 쪽' },
                    { id: 'path_moccasin', name: '4. 사슴가죽 덧신 자국', desc: '북쪽 능선 바위길 (점판암 가루 흔적)' },
                  ].map(path => (
                    <button
                      key={path.id}
                      onClick={() => handleSelectFootprintPath(path.id)}
                      className={`p-3 rounded-xl border text-xs ${
                        selectedFootprint === path.id && isTrailDiscovered
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                          : 'bg-black/50 border-stone-700 text-stone-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="font-bold">{path.name}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{path.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GENERIC LIGHTBOX */}
            {inspectModal === 'generic' && genericMessage && (
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  현장 관찰
                </span>
                <h3 className="text-base font-bold text-white">
                  {genericMessage.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif bg-black/40 p-4 rounded-xl border border-stone-800 text-left">
                  {genericMessage.text}
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
