import { CropConfig, CropType } from '../types/game';

export const CROP_CONFIGS: Record<CropType, CropConfig> = {
  rice: {
    id: 'rice',
    name: '황금 벼이삭',
    points: 10,
    baseColor: 0xEEBA33,      // Ripe golden yellow
    accentColor: 0xB8860B,    // Dark goldenrod
    glowColor: '#F59E0B',
    isHazard: false,
    isSpecial: false,
    description: '청동기 시대의 대표 주곡으로, 송국리 유적 등에서 탄화미로 다수 발굴되었습니다.',
    rarityWeight: 35,
  },
  barley: {
    id: 'barley',
    name: '보리이삭',
    points: 15,
    baseColor: 0xD8C380,      // Tan wheat / barley
    accentColor: 0x8F834D,    // Olive tan
    glowColor: '#EAB308',
    isHazard: false,
    isSpecial: false,
    description: '긴 까락(수염)이 특징인 곡식으로 가뭄에 강해 고대인의 든든한 식량이었습니다.',
    rarityWeight: 25,
  },
  millet: {
    id: 'millet',
    name: '조와 기장',
    points: 20,
    baseColor: 0xF59E0B,      // Deep amber orange
    accentColor: 0xD97706,
    glowColor: '#FB923C',
    isHazard: false,
    isSpecial: false,
    description: '신석기 시대부터 이어진 전통 오곡으로 작고 단단한 알갱이가 촘촘히 맺힙니다.',
    rarityWeight: 20,
  },
  sorghum: {
    id: 'sorghum',
    name: '붉은 수수',
    points: 25,
    baseColor: 0xB91C1C,      // Deep red-brown
    accentColor: 0x7F1D1D,
    glowColor: '#EF4444',
    isHazard: false,
    isSpecial: false,
    description: '붉은빛 곡물로 척박한 땅에서도 잘 자라며 청동기 시대 구황작물로 소중했습니다.',
    rarityWeight: 15,
  },
  golden_sheaf: {
    id: 'golden_sheaf',
    name: '풍년의 황금 볏단',
    points: 50,
    baseColor: 0xFDE047,      // Glowing bright gold
    accentColor: 0xFACC15,
    glowColor: '#FDE047',
    isHazard: false,
    isSpecial: true,
    description: '햇살의 정기를 듬뿍 머금은 풍년의 상징! 6초 동안 점수가 2배로 오르는 풍년 모드를 엽니다.',
    rarityWeight: 5,
  },
  frost_ear: {
    id: 'frost_ear',
    name: '서리 맺힌 이삭',
    points: 30,
    baseColor: 0x67E8F9,      // Cyan frost
    accentColor: 0x06B6D4,
    glowColor: '#22D3EE',
    isHazard: false,
    isSpecial: true,
    description: '가을 서리가 내린 차가운 이삭. 베어내면 4초 동안 시간이 느리게 흐릅니다.',
    rarityWeight: 5,
  },
  stone: {
    id: 'stone',
    name: '잡석 (돌멩이)',
    points: -30,
    baseColor: 0x78716C,      // Slate stone
    accentColor: 0x44403C,
    glowColor: '#78716C',
    isHazard: true,
    isSpecial: false,
    description: '밭에 섞인 거친 돌멩이입니다. 반달돌칼의 칼날이 상하므로 피해야 합니다.',
    rarityWeight: 12,
  },
  pest: {
    id: 'pest',
    name: '병충해 메뚜기',
    points: -50,
    baseColor: 0x4D7C0F,      // Swarm green/dark
    accentColor: 0x1E293B,
    glowColor: '#DC2626',
    isHazard: true,
    isSpecial: false,
    description: '곡물을 갉아먹는 유해 곤충입니다. 베면 폭발하여 수확을 망칩니다!',
    rarityWeight: 8,
  },
};
