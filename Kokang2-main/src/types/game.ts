export type GameMode = 'CLASSIC' | 'ARCADE' | 'MUSEUM';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type CropType = 
  | 'rice'          // 벼이삭 (Golden Rice Ear)
  | 'barley'        // 보리 (Barley Ear)
  | 'millet'        // 조/기장 (Foxtail Millet)
  | 'sorghum'       // 수수 (Red Sorghum)
  | 'golden_sheaf'  // 황금 볏단 (Fever mode trigger)
  | 'frost_ear'     // 서리 맺힌 이삭 (Slow motion trigger)
  | 'stone'         // 잡석/돌멩이 (Hazard: chips knife)
  | 'pest';         // 병충해 메뚜기/독초 (Bomb: hazard)

export interface CropConfig {
  id: CropType;
  name: string;
  points: number;
  baseColor: number;
  accentColor: number;
  glowColor: string;
  isHazard: boolean;
  isSpecial: boolean;
  description: string;
  rarityWeight: number; // For spawn probability
}

export interface SlicePoint {
  x: number;
  y: number;
  time: number;
}

export interface ComboNotification {
  id: string;
  count: number;
  points: number;
  text: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface GameStats {
  score: number;
  highScoreClassic: number;
  highScoreArcade: number;
  cropsHarvested: Record<CropType, number>;
  maxCombo: number;
  totalGames: number;
}
