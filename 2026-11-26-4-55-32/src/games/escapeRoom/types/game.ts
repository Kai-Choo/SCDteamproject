/**
 * Game Types for "고강선사유적체험관 : 시간을 넘어 사라진 유물"
 */

export type StageId = 
  | 'STAGE_1_LAB'
  | 'STAGE_2_VILLAGE'
  | 'STAGE_3_LIVING'
  | 'STAGE_4_ALTAR'
  | 'FINAL_STAGE_RETURN'
  | 'ENDING';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'artifact' | 'document' | 'tool' | 'cipher';
  description: string;
  detailedLore: string;
  iconName: string;
  imageUrl?: string;
  combinableWith?: string[];
  combineResultId?: string;
  acquiredAtStage: StageId;
}

export interface ClueItem {
  id: string;
  stageId: StageId;
  title: string;
  content: string;
  category: '문양' | '현장기록' | '발자국' | '도구정보' | '암호';
  icon: string;
  timestamp: string;
}

export interface HintData {
  tier1: string; // 방향 제시
  tier2: string; // 구체적 단서
  tier3: string; // 정답 공개
}

export interface GameSaveData {
  currentStage: StageId;
  missionStep: number;
  inventory: InventoryItem[];
  clues: ClueItem[];
  solvedPuzzles: Record<string, boolean>;
  hintsUsedCount: number;
  startTime: number;
  playTimeSeconds: number;
  isSoundMuted: boolean;
  isBgmMuted: boolean;
  playerName: string;
}
