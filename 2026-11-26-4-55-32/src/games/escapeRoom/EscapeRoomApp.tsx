import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, ClueItem, GameSaveData } from './types/game';
import { StorageService } from './services/storageService';
import { sound } from './services/soundService';
import { ClassicEscapeFrame } from './components/ClassicEscapeFrame';
import { BottomDialogueOrInventory } from './components/BottomDialogueOrInventory';
import { PrehistoricWorldEscape } from './components/PrehistoricWorldEscape';
import { Stage1Lab } from './components/Stage1Lab';
import { EndingScreen } from './components/EndingScreen';
import { TitleScreen } from './components/TitleScreen';
import { IntroPrologue } from './components/IntroPrologue';
import { ClueJournalModal } from './components/ClueJournalModal';
import { InventoryModal } from './components/InventoryModal';
import { HintModal } from './components/HintModal';
import { SettingsModal } from './components/SettingsModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';

interface EscapeRoomAppProps {
  onEscapeComplete?: () => void;
}

export const EscapeRoomApp: React.FC<EscapeRoomAppProps> = ({ onEscapeComplete }) => {
  const [gameState, setGameState] = useState<GameSaveData>(() => {
    const loaded = StorageService.loadGame();
    const sanitizedInventory = loaded.inventory.map(item => {
      let name = item.name;
      if (
        item.id === 'umjib_knife' ||
        item.id === 'umjib_blade' ||
        item.id === 'umjib_flint' ||
        item.id === 'umjib_key' ||
        name.includes('날카로운') ||
        name.includes('돌칼')
      ) {
        name = '칼';
      }
      if (item.id === 'relic_fragment' || item.id === 'ancient_mirror' || name.includes('신비로운')) {
        name = '유물';
      }
      return { ...item, name };
    });
    return { ...loaded, inventory: sanitizedInventory };
  });

  const [isTitleMenu, setIsTitleMenu] = useState<boolean>(true);
  const [isPlayingPrologue, setIsPlayingPrologue] = useState<boolean>(false);
  const [isCluesOpen, setIsCluesOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [showHotspotGlow, setShowHotspotGlow] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(true);
  const [currentDialogue, setCurrentDialogue] = useState<string>(
    '조심해서 살펴봐야겠다... 함부로 만지면 안 되겠는 걸..'
  );

  const completionFiredRef = useRef(false);

  // Stop ambient BGM when leaving the Escape Room view
  useEffect(() => {
    return () => {
      sound.stopAmbientBgm();
    };
  }, []);

  // Notify portal to award stamp when reaching ENDING
  useEffect(() => {
    if (gameState.currentStage === 'ENDING' && !completionFiredRef.current) {
      completionFiredRef.current = true;
      onEscapeComplete?.();
    } else if (gameState.currentStage !== 'ENDING') {
      completionFiredRef.current = false;
    }
  }, [gameState.currentStage, onEscapeComplete]);

  // Play time tick
  useEffect(() => {
    if (isTitleMenu || isPlayingPrologue || gameState.currentStage === 'ENDING') return;
    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        playTimeSeconds: prev.playTimeSeconds + 1
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTitleMenu, isPlayingPrologue, gameState.currentStage]);

  // Persist state changes
  useEffect(() => {
    StorageService.saveGame(gameState);
  }, [gameState]);

  // Sound settings sync
  useEffect(() => {
    sound.setBgmMuted(gameState.isBgmMuted);
    sound.setSfxMuted(gameState.isSoundMuted);
  }, [gameState.isBgmMuted, gameState.isSoundMuted]);

  const handleStartNewGame = () => {
    const fresh = StorageService.resetGame();
    setGameState(fresh);
    setIsTitleMenu(false);
    setIsPlayingPrologue(false);
    setIsSpeaking(true);
    setSelectedItemId(null);
    setCurrentDialogue('부천 고강동 발굴 현장에서 드디어 3천 년 전 청동기 도자기를 찾아냈어! 발굴터의 도자기 흙을 조심스럽게 털어내보자.');
    sound.startAmbientBgm();
  };

  const handleCompletePrologue = () => {
    setIsPlayingPrologue(false);
    setIsTitleMenu(false);
    setIsSpeaking(true);
    setCurrentDialogue('부천 고강동 발굴 현장에서 드디어 3천 년 전 청동기 도자기를 찾아냈어! 발굴터의 도자기 흙을 조심스럽게 털어내보자.');
  };

  const handleResumeGame = () => {
    setIsTitleMenu(false);
    setIsSpeaking(false);
    sound.startAmbientBgm();
  };

  const handleResetGame = () => {
    const fresh = StorageService.resetGame();
    setGameState(fresh);
    setIsTitleMenu(false);
    setIsPlayingPrologue(false);
    setIsSpeaking(true);
    setSelectedItemId(null);
    setCurrentDialogue('부천 고강동 발굴 현장에서 드디어 3천 년 전 청동기 도자기를 찾아냈어! 발굴터의 도자기 흙을 조심스럽게 털어내보자.');
  };

  const handleAddItem = (item: InventoryItem) => {
    setGameState(prev => {
      if (prev.inventory.some(i => i.id === item.id)) return prev;
      return {
        ...prev,
        inventory: [...prev.inventory, item]
      };
    });
  };

  const handleRemoveItem = (itemIds: string | string[]) => {
    const idsToRemove = Array.isArray(itemIds) ? itemIds : [itemIds];
    setGameState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => !idsToRemove.includes(i.id))
    }));
    setSelectedItemId(prev => (prev && idsToRemove.includes(prev) ? null : prev));
  };

  const handleAddClue = (newClue: ClueItem) => {
    setGameState(prev => {
      if (prev.clues.some(c => c.id === newClue.id || c.title === newClue.title)) {
        return prev;
      }
      return {
        ...prev,
        clues: [newClue, ...prev.clues]
      };
    });
  };

  const handleTriggerSpeech = (speechText: string) => {
    setCurrentDialogue(speechText);
    setIsSpeaking(true);
  };

  const hasSavedGame =
    gameState.inventory.length > 1 ||
    gameState.currentStage !== 'STAGE_1_LAB' ||
    gameState.playTimeSeconds > 5;

  return (
    <div className="escape-room-scope w-full h-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#efe6d2] text-[#3d1c06] flex flex-col font-sans select-none relative p-1.5 sm:p-2.5 rounded-2xl border-2 border-[#DECDB8]">
      {isPlayingPrologue ? (
        <IntroPrologue onComplete={handleCompletePrologue} />
      ) : isTitleMenu ? (
        <div className="w-full h-full flex-1 min-h-0 flex items-center justify-center">
          <TitleScreen
            hasSavedGame={hasSavedGame}
            onStartNewGame={handleStartNewGame}
            onResumeGame={handleResumeGame}
            onOpenArchive={() => setIsCluesOpen(true)}
            onOpenDrive={() => setIsDriveOpen(true)}
          />
        </div>
      ) : gameState.currentStage === 'ENDING' ? (
        <div className="p-2 sm:p-4 w-full h-full flex-1 min-h-0 flex items-start justify-center overflow-y-auto">
          <EndingScreen
            playTimeSeconds={gameState.playTimeSeconds}
            cluesCount={gameState.clues.length}
            hintsUsedCount={gameState.hintsUsedCount}
            onRestartGame={handleStartNewGame}
          />
        </div>
      ) : (
        <div className="w-full h-full flex-1 min-h-0 flex flex-col max-w-[860px] mx-auto justify-between">
          <ClassicEscapeFrame
            currentStage={gameState.currentStage}
            stageName={
              gameState.currentStage === 'STAGE_1_LAB'
                ? '부천 고강선사유적 발굴 현장'
                : '기원전 1000년 고강동 선사마을'
            }
            subLocationTitle={
              gameState.currentStage === 'STAGE_1_LAB'
                ? '도자기 발굴 구역 A1'
                : '선사시대 대탈출'
            }
            playTimeSeconds={gameState.playTimeSeconds}
            onOpenHints={() => setIsHintsOpen(true)}
            onOpenClues={() => setIsCluesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenDrive={() => setIsDriveOpen(true)}
            onResetToBeginning={handleResetGame}
            onReturnToTitle={() => setIsTitleMenu(true)}
            isSfxMuted={gameState.isSoundMuted}
            onToggleSound={() => {
              const next = !gameState.isSoundMuted;
              setGameState(prev => ({ ...prev, isSoundMuted: next }));
            }}
          >
            {gameState.currentStage === 'STAGE_1_LAB' && (
              <Stage1Lab
                inventory={gameState.inventory}
                selectedItemId={selectedItemId}
                showHotspotGlow={showHotspotGlow}
                onAddClue={handleAddClue}
                onStageComplete={(reward, clues) => {
                  setSelectedItemId(null);
                  handleAddItem(reward);
                  clues.forEach(c => handleAddClue(c));
                  setGameState(prev => ({
                    ...prev,
                    currentStage: 'STAGE_2_VILLAGE'
                  }));
                  setIsSpeaking(false);
                }}
              />
            )}

            {gameState.currentStage !== 'STAGE_1_LAB' && (
              <PrehistoricWorldEscape
                inventory={gameState.inventory}
                selectedItemId={selectedItemId}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onAddClue={handleAddClue}
                onClearSelectedItem={() => setSelectedItemId(null)}
                onTriggerSpeech={handleTriggerSpeech}
                onCompleteGame={() => {
                  setGameState(prev => ({
                    ...prev,
                    currentStage: 'ENDING'
                  }));
                }}
              />
            )}
          </ClassicEscapeFrame>

          <BottomDialogueOrInventory
            isSpeaking={isSpeaking}
            dialogueText={currentDialogue}
            onFinishSpeaking={() => setIsSpeaking(false)}
            inventory={gameState.inventory}
            selectedItemId={selectedItemId}
            onSelectItem={(item) => {
              if (selectedItemId === item.id) {
                setSelectedItemId(null);
              } else {
                setSelectedItemId(item.id);
              }
            }}
            onOpenBackpackModal={() => setIsInventoryModalOpen(true)}
            activeObjective={(() => {
              if (gameState.currentStage === 'STAGE_1_LAB') {
                return '붓으로 흙을 털고, 떨어진 유물을 누르세요!';
              }
              const shardCount = gameState.inventory.filter(i => i.id.startsWith('pottery_shard_')).length;
              if (shardCount >= 5) {
                return '토기 조각 5개를 모두 모았어요! 아래 버튼을 눌러 맞추세요!';
              }
              if (gameState.inventory.some(i => i.id === 'umjib_knife')) {
                return '칼을 문 밧줄로 드래그하거나 누르세요!';
              }
              return '마을 5곳을 눌러 마법의 토기 조각을 모으세요!';
            })()}
          />
        </div>
      )}

      {/* Modals */}
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        inventory={gameState.inventory}
      />

      <ClueJournalModal
        isOpen={isCluesOpen}
        onClose={() => setIsCluesOpen(false)}
        clues={gameState.clues}
      />

      <HintModal
        isOpen={isHintsOpen}
        onClose={() => setIsHintsOpen(false)}
        currentStage={gameState.currentStage}
        missionIndex={gameState.missionStep}
        onUseHint={() => {
          setGameState(prev => ({
            ...prev,
            hintsUsedCount: prev.hintsUsedCount + 1
          }));
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isBgmMuted={gameState.isBgmMuted}
        isSfxMuted={gameState.isSoundMuted}
        showHotspotGlow={showHotspotGlow}
        onToggleBgm={() => {
          setGameState(prev => ({ ...prev, isBgmMuted: !prev.isBgmMuted }));
        }}
        onToggleSfx={() => {
          setGameState(prev => ({ ...prev, isSoundMuted: !prev.isSoundMuted }));
        }}
        onToggleHotspotGlow={() => {
          setShowHotspotGlow(prev => !prev);
        }}
        onResetGame={handleResetGame}
        onOpenDrive={() => {
          setIsSettingsOpen(false);
          setIsDriveOpen(true);
        }}
        playTimeSeconds={gameState.playTimeSeconds}
      />

      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        currentGameData={gameState}
        onLoadGameData={(loadedData) => {
          setGameState(loadedData);
          StorageService.saveGame(loadedData);
        }}
      />
    </div>
  );
};

export default EscapeRoomApp;
