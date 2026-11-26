import React, { useState } from 'react';
import { GameId } from '../../types/game';
import { useGame } from '../../context/GameContext';
import { Pottery3DGame } from '../games/Pottery3DGame';
import { StoneKnifeGame } from '../games/StoneKnifeGame';
import { EscapeRoomGame } from '../games/EscapeRoomGame';
import { CustomBowGame } from '../games/CustomBowGame';
import { CustomCodeRunner } from '../games/CustomCodeRunner';
import { CustomCodeModal } from '../games/CustomCodeModal';
import { ArrowLeft, Code2 } from 'lucide-react';

interface GamePlayViewProps {
  gameId: GameId;
  onBackToLobby: () => void;
}

export const GamePlayView: React.FC<GamePlayViewProps> = ({
  gameId,
  onBackToLobby
}) => {
  const { customConfigs } = useGame();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const config = customConfigs[gameId];
  const isCustomMode = config?.sourceType !== 'built-in';

  return (
    <div className="flex-1 flex flex-col h-full w-full mx-auto select-none font-round">
      {/* Minimal Top Bar: Back to Lobby button only (shown when a game is active) */}
      <div className="flex items-center justify-between gap-3 px-1 pb-1.5 shrink-0">
        <button
          onClick={onBackToLobby}
          className="btn-wood px-4 py-1.5 text-sm text-white rounded-xl flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>처음으로 (목록)</span>
        </button>

        <button
          onClick={() => setIsEditorOpen(true)}
          className="p-2 rounded-xl bg-[#EFE6D5] text-[#543415] hover:bg-[#E2D5C0] transition-colors cursor-pointer"
          title="코드 설정"
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Game Surface */}
      <div className="flex-1 min-h-0 w-full relative overflow-y-auto overflow-x-hidden flex flex-col rounded-2xl">
        {isCustomMode ? (
          <CustomCodeRunner
            gameId={gameId}
            config={config}
            onOpenEditor={() => setIsEditorOpen(true)}
          />
        ) : (
          <div className="h-full w-full flex-1 min-h-0 flex flex-col">
            {gameId === 'pottery-3d' && <Pottery3DGame />}
            {gameId === 'stone-knife' && <StoneKnifeGame />}
            {gameId === 'escape-room' && <EscapeRoomGame />}
            {gameId === 'custom-bow' && <CustomBowGame />}
          </div>
        )}
      </div>

      {/* Code Injection Modal */}
      <CustomCodeModal
        gameId={gameId}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
};
