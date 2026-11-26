/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types/game';
import { ThreeCanvas } from './components/ThreeCanvas';
import { CleanOverlay } from './components/CleanOverlay';
import { sound } from './utils/audio';

import sunsetBg from './assets/images/ancient_field_sunset_1790924674963.jpg';

const MAX_LIVES = 5;

interface StoneKnifeAppProps {
  onAwardStamp?: () => void;
}

export default function StoneKnifeApp({ onAwardStamp }: StoneKnifeAppProps) {
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [feverTimeLeft, setFeverTimeLeft] = useState<number>(0);
  const [slowMoTimeLeft, setSlowMoTimeLeft] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const stampAwardedRef = useRef<boolean>(false);

  const maybeAwardStamp = useCallback((nextScore: number) => {
    if (!stampAwardedRef.current && nextScore >= 100 && onAwardStamp) {
      stampAwardedRef.current = true;
      onAwardStamp();
    }
  }, [onAwardStamp]);

  // Score update from slicing
  const handleScoreUpdate = useCallback((points: number) => {
    setScore((prev) => {
      const next = Math.max(0, prev + points);
      maybeAwardStamp(next);
      return next;
    });
  }, [maybeAwardStamp]);

  // Combo bonus
  const handleCombo = useCallback((_count: number, bonus: number) => {
    setScore((prev) => {
      const next = prev + bonus;
      maybeAwardStamp(next);
      return next;
    });
  }, [maybeAwardStamp]);

  // Hazard hit (stone loses 1 heart, pest loses 1 heart)
  const handleHazardHit = useCallback((_type: 'stone' | 'pest') => {
    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        sound.playGameOver();
        setGameState('GAMEOVER');
        return 0;
      }
      return nextLives;
    });
  }, []);

  // Trigger Fever
  const handleTriggerFever = useCallback(() => {
    setFeverTimeLeft(6.0);
  }, []);

  // Trigger Slow-Mo
  const handleTriggerSlowMo = useCallback(() => {
    setSlowMoTimeLeft(4.0);
  }, []);

  // Sound toggle
  const handleToggleMute = useCallback(() => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  }, []);

  // Pause toggle
  const handleTogglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === 'GAMEOVER') return prev;
      return prev === 'PAUSED' ? 'PLAYING' : 'PAUSED';
    });
  }, []);

  // Restart game (resets score & all 5 lives)
  const handleRestart = useCallback(() => {
    setScore(0);
    setLives(MAX_LIVES);
    setFeverTimeLeft(0);
    setSlowMoTimeLeft(0);
    setGameState('PLAYING');
  }, []);

  // Timers countdown (freezes when paused or game over)
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      return;
    }

    const interval = 100;
    timerRef.current = window.setInterval(() => {
      setFeverTimeLeft((prev) => Math.max(0, prev - 0.1));
      setSlowMoTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, interval);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [gameState]);

  return (
    <div className="stone-knife-scope relative w-full h-full flex-1 min-h-[360px] rounded-2xl overflow-hidden bg-stone-950 font-sans select-none cursor-crosshair">
      {/* Background with warm autumn dusk tint */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={sunsetBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover filter brightness-[0.3] saturate-90 blur-[1px]"
        />
        {/* Fever border glow */}
        {feverTimeLeft > 0 && gameState === 'PLAYING' && (
          <div className="absolute inset-0 border-8 border-amber-500/50 shadow-[inset_0_0_80px_rgba(245,158,11,0.5)] animate-pulse pointer-events-none" />
        )}
        {/* Slow-mo border glow */}
        {slowMoTimeLeft > 0 && gameState === 'PLAYING' && (
          <div className="absolute inset-0 border-4 border-cyan-400/40 shadow-[inset_0_0_60px_rgba(34,211,238,0.3)] pointer-events-none" />
        )}
      </div>

      {/* 3D Game Canvas */}
      <ThreeCanvas
        gameState={gameState}
        onScoreUpdate={handleScoreUpdate}
        onCombo={handleCombo}
        onHazardHit={handleHazardHit}
        feverTimeLeft={feverTimeLeft}
        slowMoTimeLeft={slowMoTimeLeft}
        onTriggerFever={handleTriggerFever}
        onTriggerSlowMo={handleTriggerSlowMo}
      />

      {/* Pure numeric score, 5 hearts & controls: Pause, Restart, Sound */}
      <CleanOverlay
        score={score}
        lives={lives}
        maxLives={MAX_LIVES}
        isPaused={gameState === 'PAUSED'}
        isGameOver={gameState === 'GAMEOVER'}
        isMuted={isMuted}
        onTogglePause={handleTogglePause}
        onToggleMute={handleToggleMute}
        onRestart={handleRestart}
      />
    </div>
  );
}
