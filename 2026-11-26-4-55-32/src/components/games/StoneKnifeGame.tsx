import React from 'react';
import { useGame } from '../../context/GameContext';
import StoneKnifeApp from '../../games/stoneKnife/StoneKnifeApp';

export const StoneKnifeGame: React.FC = () => {
  const { awardStamp } = useGame();

  return <StoneKnifeApp onAwardStamp={() => awardStamp('stone-knife')} />;
};
