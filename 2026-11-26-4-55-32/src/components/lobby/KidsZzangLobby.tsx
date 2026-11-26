import React, { useState, useRef, useEffect } from 'react';
import { GameId } from '../../types/game';
import { useGame } from '../../context/GameContext';
import {
  PotteryThumbnail,
  RealVsFakeRelicThumbnail,
  StoneKnifeThumbnail,
  MemoryMatchThumbnail,
  EscapeRoomThumbnail,
  CustomBowThumbnail
} from './CuteThumbnails';
import { CavemanOoga } from '../character/CavemanOoga';
import { GrassLandscape } from '../character/GrassLandscape';
import { GamePlayView } from '../gameplay/GamePlayView';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// SVG Cloud Component (No emojis!)
const VectorCloud: React.FC<{ className?: string; width?: number; height?: number; opacity?: number }> = ({
  className = '',
  width = 54,
  height = 32,
  opacity = 0.8
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 64 40"
    fill="none"
    className={`pointer-events-none select-none drop-shadow-xs ${className}`}
    style={{ opacity }}
  >
    <path
      d="M 18 36 L 46 36 C 54 36 60 30 60 22 C 60 15 54 10 48 10 C 47 10 45 10 44 11 C 41 5 34 2 27 2 C 18 2 11 8 10 16 C 4 17 0 22 0 28 C 0 33 5 36 12 36 Z"
      fill="#FFFFFF"
    />
  </svg>
);

interface KidsZzangLobbyProps {
  onStartGame?: (id: GameId) => void;
  onOpenStampModal?: () => void;
}

interface GameCardItem {
  id: GameId;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBorderColor: string;
  thumbnail: React.ReactNode;
}

const EXTERNAL_GAME_ROUTES: Partial<Record<GameId, { path: string; devPort: string }>> = {
  'custom-bow': { path: '/ArrowGame/', devPort: '3002' },
  'stone-knife': { path: '/Kokang2/', devPort: '3003' },
};

export const KidsZzangLobby: React.FC<KidsZzangLobbyProps> = ({ onStartGame }) => {
  const { playSound } = useGame();

  // Currently Playing Game ID (null = showing the 4-card horizontal lobby)
  const [playingGameId, setPlayingGameId] = useState<GameId | null>(null);

  // Active page for the 4-games view (0-indexed: Page 1 = 0, Page 2 = 1)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 6 Prehistoric Games arranged across 2 pages
  const allGameCards: GameCardItem[] = [
    // Page 1 (The 4 core games requested by user)
    {
      id: 'pottery-3d',
      title: '토기 조각 맞추기',
      badge: '인기 1위',
      badgeColor: 'bg-[#EA580C]',
      badgeBorderColor: 'border-[#9A3412]',
      thumbnail: <PotteryThumbnail />
    },
    {
      id: 'stone-knife',
      title: '반달돌칼 벼 수확게임',
      badge: '추천!',
      badgeColor: 'bg-[#D97706]',
      badgeBorderColor: 'border-[#92400E]',
      thumbnail: <StoneKnifeThumbnail />
    },
    {
      id: 'escape-room',
      title: '방탈출게임',
      badge: '미스터리',
      badgeColor: 'bg-[#E11D48]',
      badgeBorderColor: 'border-[#9F1239]',
      thumbnail: <EscapeRoomThumbnail />
    },
    {
      id: 'custom-bow',
      title: '커스텀 활게임',
      badge: '도전!',
      badgeColor: 'bg-[#16A34A]',
      badgeBorderColor: 'border-[#166534]',
      thumbnail: <CustomBowThumbnail />
    },
    // Page 2 (Scrolled/flipped horizontally: 4 additional games)
    {
      id: 'pottery-3d',
      title: '진짜유물 가짜 유물 찾기',
      badge: '탐구!',
      badgeColor: 'bg-[#4F46E5]',
      badgeBorderColor: 'border-[#3730A3]',
      thumbnail: <RealVsFakeRelicThumbnail />
    },
    {
      id: 'escape-room',
      title: '고강선사유적 기억 찾기',
      badge: '기억력!',
      badgeColor: 'bg-[#0891B2]',
      badgeBorderColor: 'border-[#155E75]',
      thumbnail: <MemoryMatchThumbnail />
    }
  ];

  // Group games into pages of 4
  const pageSize = 4;
  const totalPages = Math.ceil(allGameCards.length / pageSize);
  const pages: GameCardItem[][] = [];
  for (let i = 0; i < allGameCards.length; i += pageSize) {
    pages.push(allGameCards.slice(i, i + pageSize));
  }

  // Handle manual or automatic scrolling updates
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const pageIndex = Math.round(scrollLeft / clientWidth);
      if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < totalPages) {
        setCurrentPage(pageIndex);
      }
    }
  };

  const scrollToPage = (pageIndex: number) => {
    playSound('click');
    if (!scrollContainerRef.current) return;
    const targetLeft = pageIndex * scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });
    setCurrentPage(pageIndex);
  };

  const handleCardClick = (gameId: GameId) => {
    playSound('click');
    const externalGameRoute = EXTERNAL_GAME_ROUTES[gameId];
    if (externalGameRoute) {
      const gameUrl = new URL(externalGameRoute.path, window.location.origin);
      if (import.meta.env.DEV) {
        gameUrl.port = externalGameRoute.devPort;
      }
      gameUrl.searchParams.set('returnTo', window.location.origin);
      window.location.assign(gameUrl.toString());
      return;
    }

    setPlayingGameId(gameId);
    if (onStartGame) {
      onStartGame(gameId);
    }
  };

  // Re-sync scroll on resize
  useEffect(() => {
    const handleResize = () => {
      if (!scrollContainerRef.current) return;
      scrollContainerRef.current.scrollTo({
        left: currentPage * scrollContainerRef.current.clientWidth,
        behavior: 'instant' as ScrollBehavior
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPage]);

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden flex flex-col bg-[#F7F3EB] select-none relative font-round">
      {/* Main Stage Surface */}
      <main className="flex-1 min-h-0 h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-[#EAF4FB] via-[#F7F4ED] to-[#EFE7D8]">
        {playingGameId ? (
          /* Game Playing Mode: Full width expansive game screen */
          <div className="p-1.5 sm:p-2.5 w-full h-full min-h-0 overflow-y-auto flex flex-col">
            <GamePlayView
              gameId={playingGameId}
              onBackToLobby={() => {
                playSound('click');
                setPlayingGameId(null);
              }}
            />
          </div>
        ) : (
          /* Lobby Mode: 4 Games visible at a time, horizontally scrollable, Caveman on left, Dinosaurs on grass */
          <div className="w-full h-full flex flex-col justify-between relative overflow-hidden">
            {/* Soft Floating Vector Clouds */}
            <VectorCloud className="absolute top-4 left-32 cloud-drift-1" width={68} height={40} opacity={0.8} />
            <VectorCloud className="absolute top-6 right-20 cloud-drift-2" width={80} height={46} opacity={0.85} />
            <VectorCloud className="absolute top-14 right-72 cloud-drift-3" width={52} height={30} opacity={0.7} />
            <VectorCloud className="absolute top-12 left-16 cloud-drift-4" width={54} height={32} opacity={0.65} />
            <VectorCloud className="absolute top-24 right-48 cloud-drift-5" width={42} height={26} opacity={0.6} />

            {/* Horizontal Scroll / Carousel Container for 4 cards per page */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="lobby-scroll-container flex-1 w-full flex flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth items-center z-10 my-auto"
            >
              {pages.map((pageGames, pageIdx) => (
                <div
                  key={pageIdx}
                  className="min-w-full w-full shrink-0 snap-center flex flex-col items-center justify-center px-3 sm:px-6 md:px-10 py-1"
                >
                  {/* 2x2 Grid of 4 Cards: Maximize size to fill the screen generously */}
                  <div className="lobby-game-grid grid grid-cols-2 gap-y-3 sm:gap-y-4 md:gap-y-6 justify-center items-center">
                    {pageGames.map((card, cardIdx) => (
                      <div
                        key={cardIdx}
                        onClick={() => handleCardClick(card.id)}
                        className="flex flex-col items-center cursor-pointer group w-full"
                      >
                        {/* 1. Large Generous Card Thumbnail Box */}
                        <div
                          className="lobby-game-card card-spacious relative overflow-hidden flex items-center justify-center bg-[#FFFDF9] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
                        >
                          <div className="w-full h-full flex items-center justify-center p-1 sm:p-2">
                            {card.thumbnail}
                          </div>

                          {/* Top Badge */}
                          <span
                            className={`lobby-badge lobby-game-badge absolute text-white border-2 ${card.badgeColor} ${card.badgeBorderColor}`}
                          >
                            {card.badge}
                          </span>
                        </div>

                        {/* 2. Bold Game Title in Cute Rounded Bounding Box Capsule */}
                        <div className="mt-1.5 sm:mt-2 title-capsule w-full max-w-full min-w-0 px-2.5 sm:px-4 py-1 sm:py-1.5 text-center shadow-xs group-hover:scale-105 transition-transform duration-200">
                          <span className="text-xs sm:text-sm md:text-base lg:text-lg leading-tight font-extrabold text-[#451A03] tracking-tight whitespace-normal break-keep">
                            {card.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Left / Right Arrow Guides on Stage for extra clarity */}
            {currentPage > 0 && (
              <button
                onClick={() => scrollToPage(currentPage - 1)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-25 w-10 h-10 sm:w-11 sm:h-11 p-0 rounded-full btn-wood text-white flex items-center justify-center shadow-lg active:scale-90 cursor-pointer hover:brightness-105"
                title="이전 4개 게임 보기"
              >
                <ChevronLeft className="absolute inset-0 m-auto w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
              </button>
            )}

            {currentPage < totalPages - 1 && (
              <button
                onClick={() => scrollToPage(currentPage + 1)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-25 w-10 h-10 sm:w-11 sm:h-11 p-0 rounded-full btn-wood text-white flex items-center justify-center shadow-lg active:scale-90 cursor-pointer hover:brightness-105"
                title="다음 게임 더 보기"
              >
                <ChevronRight className="absolute inset-0 m-auto w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
              </button>
            )}

            {/* Bottom Prehistoric Ground with Grass Landscape & 3 Slowly Roaming Dinosaurs */}
            <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 z-20 pointer-events-none overflow-visible">
              <GrassLandscape />
            </div>

            {/* Walking Caveman ("원시인") strolling across the meadow */}
            <div className="absolute bottom-1 inset-x-0 h-24 sm:h-28 z-30 pointer-events-none overflow-visible">
              <CavemanOoga isWalking={true} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
