import { GameSaveData, StageId } from '../types/game';

const STORAGE_KEY = 'gogang_escape_game_save_v3';

export const INITIAL_GAME_DATA: GameSaveData = {
  currentStage: 'STAGE_1_LAB',
  missionStep: 1,
  inventory: [],
  clues: [
    {
      id: 'clue_init_1',
      stageId: 'STAGE_1_LAB',
      title: '고강동 선사유적 개요',
      category: '현장기록',
      content: '부천 고강동 유적은 신석기 후기부터 청동기에 걸친 대규모 복합 유적지로 주거지 21기와 제천 의례를 위한 적석환유구가 발굴된 곳이다.',
      icon: 'Landmark',
      timestamp: '00:00'
    }
  ],
  solvedPuzzles: {},
  hintsUsedCount: 0,
  startTime: Date.now(),
  playTimeSeconds: 0,
  isSoundMuted: false,
  isBgmMuted: false,
  playerName: '조사원'
};

export class StorageService {
  public static loadGame(): GameSaveData {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return INITIAL_GAME_DATA;
      const data = JSON.parse(serialized);
      return {
        ...INITIAL_GAME_DATA,
        ...data
      };
    } catch (e) {
      console.warn('Failed to load save data, resetting to initial state', e);
      return INITIAL_GAME_DATA;
    }
  }

  public static saveGame(data: GameSaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game data', e);
    }
  }

  public static resetGame(): GameSaveData {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    return { ...INITIAL_GAME_DATA, startTime: Date.now() };
  }
}
