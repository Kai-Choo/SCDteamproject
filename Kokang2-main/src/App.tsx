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
const ROUND_DURATION_MS = 40_000;
const ROUND_DURATION_SECONDS = ROUND_DURATION_MS / 1000;

export default function App() {
  const [gameState, setGameState] = useState<GameState>('PAUSED');
  const [countdown, setCountdown] = useState<number | null>(5);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(ROUND_DURATION_SECONDS);
  const [feverTimeLeft, setFeverTimeLeft] = useState<number>(0);
  const [slowMoTimeLeft, setSlowMoTimeLeft] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeUpHandledRef = useRef(false);
  const remainingTimeMsRef = useRef(ROUND_DURATION_MS);
  const roundStartedAtRef = useRef<number | null>(null);

  // Score update from slicing
  const handleScoreUpdate = useCallback((points: number) => {
    setScore((prev) => Math.max(0, prev + points));
  }, []);

  // Combo bonus
  const handleCombo = useCallback((_count: number, bonus: number) => {
    setScore((prev) => prev + bonus);
  }, []);

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
    setRoundTimeLeft(ROUND_DURATION_SECONDS);
    setFeverTimeLeft(0);
    setSlowMoTimeLeft(0);
    timeUpHandledRef.current = false;
    remainingTimeMsRef.current = ROUND_DURATION_MS;
    roundStartedAtRef.current = null;
    setGameState('PAUSED');
    setCountdown(5);
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    const timeoutId = window.setTimeout(() => {
      if (countdown <= 1) {
        setCountdown(null);
        setGameState('PLAYING');
        return;
      }

      setCountdown(countdown - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdown]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const startedAt = Date.now();
    roundStartedAtRef.current = startedAt;
    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = Math.max(0, remainingTimeMsRef.current - elapsedMs);
      setRoundTimeLeft(Math.ceil(remainingMs / 1000));
    }, 250);

    return () => {
      window.clearInterval(intervalId);
      if (roundStartedAtRef.current !== null) {
        remainingTimeMsRef.current = Math.max(
          0,
          remainingTimeMsRef.current - (Date.now() - roundStartedAtRef.current)
        );
        roundStartedAtRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (roundTimeLeft !== 0 || timeUpHandledRef.current) return;

    timeUpHandledRef.current = true;
    sound.playGameOver();
    setGameState('GAMEOVER');
  }, [roundTimeLeft]);

  // Timers countdown (freezes when paused or game over)
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 100;
    timerRef.current = setInterval(() => {
      setFeverTimeLeft((prev) => Math.max(0, prev - 0.1));
      setSlowMoTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  return (
    <div className="h-dvh w-full overflow-hidden bg-stone-950 p-[var(--game-screen-gap)] font-sans select-none cursor-crosshair">
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-stone-700/70 bg-stone-950">
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

        {/* Score, timer, 5 hearts & controls */}
        <CleanOverlay
          score={score}
          lives={lives}
          maxLives={MAX_LIVES}
          roundTimeLeft={roundTimeLeft}
          isPaused={gameState === 'PAUSED'}
          isGameOver={gameState === 'GAMEOVER'}
          isMuted={isMuted}
          countdown={countdown}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}
