import React from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { EscapeRoomApp } from '../../games/escapeRoom/EscapeRoomApp';

export const EscapeRoomGame: React.FC = () => {
  const { awardStamp } = useGame();

  const handleEscapeComplete = () => {
    awardStamp('escape-room');
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
    });
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col">
      <EscapeRoomApp onEscapeComplete={handleEscapeComplete} />
    </div>
  );
};
