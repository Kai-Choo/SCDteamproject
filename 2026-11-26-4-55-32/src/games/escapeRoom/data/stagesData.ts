import { HintData, StageId } from '../types/game';
import { publicAsset } from '@/utils/publicAsset';

export interface StageConfig {
  id: StageId;
  stageNumber: number;
  name: string;
  subtitle: string;
  locationName: string;
  imagePath: string;
  introDialogues: {
    speaker: string;
    text: string;
    avatar?: string;
  }[];
  hints: {
    mission1: HintData;
    mission2: HintData;
  };
}

export const STAGES_CONFIG: Record<StageId, StageConfig> = {
  STAGE_1_LAB: {
    id: 'STAGE_1_LAB',
    stageNumber: 1,
    name: '1단계. 시간 이동 장치의 비밀',
    subtitle: '연구실에서 유물 조사하기',
    locationName: '부천 고강선사유적체험관 제1연구실',
    imagePath: publicAsset('/assets/escape-room/gogang_lab_interior_1790923386568.jpg'),
    introDialogues: [
      {
        speaker: '한유나 연구원',
        text: '책상 위에 놓인 신비한 돌에서 파란 빛이 번쩍이고 있어! 어서 조사해보자!'
      },
      {
        speaker: '한유나 연구원',
        text: '연구 노트에 적힌 순서대로 돌의 문양을 누르고, 컴퓨터에 [1000]을 입력하면 시간 이동 장치가 켜질 거야!'
      }
    ],
    hints: {
      mission1: {
        tier1: '책상 위 노트를 보면 문양 순서가 적혀 있어요.',
        tier2: '하늘(동심원) -> 아기(곡옥) -> 땅(선) -> 태양(해) 순서예요.',
        tier3: '정답 순서: [동심원문] -> [곡옥문] -> [마제각선] -> [태양문]'
      },
      mission2: {
        tier1: '모니터에 적힌 기원전 연대 숫자를 눌러보세요.',
        tier2: '고강동 청동기 마을이 가장 번성했던 연대예요.',
        tier3: '정답 비밀번호: [1000] (기원전 1000년)'
      }
    }
  },
  STAGE_2_VILLAGE: {
    id: 'STAGE_2_VILLAGE',
    stageNumber: 2,
    name: '2단계. 사라진 유물의 흔적',
    subtitle: '선사마을에서 발자국 찾기',
    locationName: '3천 년 전 고강동 청동기마을',
    imagePath: publicAsset('/assets/escape-room/prehistoric_village_scene_1790923408627.jpg'),
    introDialogues: [
      {
        speaker: '한유나 연구원',
        text: '으악... 머리야... 만졌더니 이상한 곳으로 빨려들어온 거 같아! 짚으로 지은 움집 안인 것 같은데... 일단 밖으로 나갈 방법을 찾아보자!'
      },
      {
        speaker: '한유나 연구원',
        text: '출입문이 질긴 칡넝쿨 밧줄로 단단히 묶여 있어! 바닥 바구니에서 칼을 찾아 밧줄을 끊어보자!'
      }
    ],
    hints: {
      mission1: {
        tier1: '움집 바닥의 짚 바구니를 눌러 삼베 천을 걷어보세요.',
        tier2: '삼베 밑에서 칼을 꺼내세요.',
        tier3: '칼을 문을 단단히 묶고 있는 [칡넝쿨 밧줄]로 드래그하면 밧줄이 끊어지고 문이 열려요!'
      },
      mission2: {
        tier1: '장로님의 말: 도둑은 사슴가죽으로 만든 부드러운 신발을 신었어요.',
        tier2: '멧돼지나 맨발이 아닌, [사슴가죽 덧신 발자국]을 골라주세요.',
        tier3: '정답: [4번. 부드러운 가죽신 자국 (북쪽 능선)]'
      }
    }
  },
  STAGE_3_LIVING: {
    id: 'STAGE_3_LIVING',
    stageNumber: 3,
    name: '3단계. 선사인의 생활 속 단서',
    subtitle: '석기 장인의 도구 만들기',
    locationName: '선사마을 석기 공방',
    imagePath: publicAsset('/assets/escape-room/craftsman_bench_view_1790926153534.jpg'),
    introDialogues: [
      {
        speaker: '석기 장인',
        text: '도둑이 숨겨둔 비밀 상자가 저기 있네. 하지만 상자를 열려면 선사 도구를 직접 만들 줄 알아야 해!'
      },
      {
        speaker: '한유나 연구원',
        text: '도구 퀴즈를 풀고, [돌칼날] + [나무자루] + [힘줄 끈]을 조립해서 비밀 상자를 열어보자!'
      }
    ],
    hints: {
      mission1: {
        tier1: '벼 이삭을 딸 때는 반달돌칼, 대장의 멋진 무기는 마제석검(간돌검)이에요.',
        tier2: '붉은빛이 도는 예쁜 제사 그릇은 [홍도(붉은간토기)]예요.',
        tier3: '퀴즈 정답: 1번 반달돌칼, 2번 마제석검, 3번 홍도'
      },
      mission2: {
        tier1: '돌칼을 만들 재료 3가지를 골라보세요.',
        tier2: '[칼날]과 튼튼한 [자루], 단단히 묶을 [힘줄 끈]이 필요해요.',
        tier3: '정답: [점판암 칼날] + [참나무 손잡이] + [사슴 힘줄 끈]'
      }
    }
  },
  STAGE_4_ALTAR: {
    id: 'STAGE_4_ALTAR',
    stageNumber: 4,
    name: '4단계. 유물에 숨겨진 진실',
    subtitle: '제단에서 보물 복원하기',
    locationName: '고천산 적석환유구 제단',
    imagePath: publicAsset('/assets/escape-room/prehistoric_ritual_altar_1790923421228.jpg'),
    introDialogues: [
      {
        speaker: '한유나 연구원',
        text: '드디어 고천산 꼭대기 돌 제단에 도착했어! 둥근 돌들이 동심원 모양으로 놓여 있어!'
      },
      {
        speaker: '한유나 연구원',
        text: '돌들을 돌려서 햇빛 방향과 맞추고, 깨진 보물 조각 5개를 퍼즐처럼 맞춰보자!'
      }
    ],
    hints: {
      mission1: {
        tier1: '석판에 적힌 각도: 바깥은 0도, 중간은 90도, 안쪽은 180도예요.',
        tier2: '바깥 링을 동쪽(0°), 중간을 북쪽(90°), 안쪽을 남쪽(180°)으로 돌리세요.',
        tier3: '[자동 정렬] 버튼을 누르면 한 번에 맞춰져요!'
      },
      mission2: {
        tier1: '5개의 유물 조각을 빈자리에 알맞게 끌어다 놓으세요.',
        tier2: '가운데 둥근 태양핵을 먼저 넣고, 둘레에 4개 조각을 채우세요.',
        tier3: '[자동 맞추기] 버튼을 누르면 완성돼요!'
      }
    }
  },
  FINAL_STAGE_RETURN: {
    id: 'FINAL_STAGE_RETURN',
    stageNumber: 5,
    name: '마지막 관문. 현대(2026)로 귀환',
    subtitle: '시공간 포털 열기',
    locationName: '시공간 귀환 포털',
    imagePath: publicAsset('/assets/escape-room/prehistoric_ritual_altar_1790923421228.jpg'),
    introDialogues: [
      {
        speaker: '한유나 연구원',
        text: '복원된 보물에서 황금빛이 뿜어져 나오고 있어! 시공간 문이 열린다!'
      },
      {
        speaker: '한유나 연구원',
        text: '포털 제어기에 비밀번호 [2026]을 입력하고, 우리 연구실로 무사히 돌아가자!'
      }
    ],
    hints: {
      mission1: {
        tier1: '3개의 크리스털(공간, 유물, 시간)이 모두 켜져 있는지 확인하세요.',
        tier2: '귀환 연도 비밀번호는 현재 연도인 [2026]이에요.',
        tier3: '가운데 포털 제어기에서 [2026]을 누르고 [시공간 도약 실행]을 누르세요!'
      },
      mission2: {
        tier1: '성공하면 현재 2026년 고강선사유적체험관으로 돌아가요!',
        tier2: '그곳에서 감동적인 마지막 진실이 밝혀집니다.',
        tier3: '마지막 버튼을 누르고 엔딩을 감상하세요!'
      }
    }
  },
  ENDING: {
    id: 'ENDING',
    stageNumber: 6,
    name: '엔딩. 시간을 건넌 진실',
    subtitle: '에필로그',
    locationName: '부천 고강선사유적체험관 기획전시실',
    imagePath: publicAsset('/assets/escape-room/gogang_lab_interior_1790923386568.jpg'),
    introDialogues: [],
    hints: {
      mission1: { tier1: '', tier2: '', tier3: '' },
      mission2: { tier1: '', tier2: '', tier3: '' }
    }
  }
};
