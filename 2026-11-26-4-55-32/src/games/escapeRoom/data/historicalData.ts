/**
 * Historical records & verified exhibition data of Bucheon Gogang Prehistoric Site
 * (부천 고강선사유적 및 고강선사유적체험관 학술 정보)
 */

export interface HistoricalRelicFact {
  name: string;
  era: string;
  significance: string;
  description: string;
  keyFeature: string;
}

export const GOGANG_HISTORICAL_FACTS: {
  siteOverview: string;
  excavationHistory: string;
  jeokseokhwanYugu: string;
  relics: Record<string, HistoricalRelicFact>;
} = {
  siteOverview: "부천 고강동 선사유적(경기도 기념물)은 한강 유역의 신석기 후기부터 청동기시대에 걸친 대규모 복합 유적지로, 주거지 21기와 한반도 중부지역 최초의 대형 적석환유구(제사 유적)가 확인된 중요한 역사적 현장입니다.",
  excavationHistory: "1995년 여름 집중호우 이후 유물이 노출되어 1996년부터 2005년까지 7차에 걸친 정밀 발굴조사가 진행되었으며, 부천시의 유구한 역사적 뿌리를 증명하고 있습니다.",
  jeokseokhwanYugu: "적석환유구(積石環遺構)는 해발 86m 고천산(저룡산) 능선 정상부에 지름 약 11m의 바깥 원과 5m의 안쪽 원형으로 돌을 쌓아 축조한 하늘(천신)과 조상신에게 풍요와 안녕을 기원하던 청동기시대 제천 의례 공간입니다.",
  relics: {
    stoneSword: {
      name: "마제석검 (간돌검)",
      era: "청동기시대",
      significance: "부족 지배자(군장)의 권위와 신분을 상징하는 위세품",
      description: "점판암이나 혈암 등을 숫돌로 정밀하게 갈아 칼자루와 날을 일체형 또는 분리형으로 정교하게 제작한 무기이자 의례용 상징물입니다.",
      keyFeature: "칼날 중앙의 능선(피홈)과 손잡이 단의 세밀한 가공 기술"
    },
    redPottery: {
      name: "홍도 (붉은간토기)",
      era: "청동기시대",
      significance: "정제된 고운 점토로 빚어 표면에 산화철을 바르고 문질러 광택을 낸 고급 제기",
      description: "주로 제사 유구(적석환유구)나 수장층의 무덤에서 출토되며, 일상 취사용이 아닌 특별한 의식용으로 사용되었습니다.",
      keyFeature: "매끄러운 붉은 광택과 얇고 단단한 기벽"
    },
    semilunarKnife: {
      name: "반달돌칼 (반월형석도)",
      era: "청동기시대",
      significance: "선사시대 농경 사회의 곡물(벼·조·기장) 수확용 도구",
      description: "반달 형태의 석판 중앙에 구멍을 1~2개 뚫고 끈을 꿰어 집게손가락에 건 뒤, 곡식 이삭만을 꺾어 수확하던 도구입니다.",
      keyFeature: "중앙의 두 줄 끈 구멍과 날카롭게 갈아낸 곡선 날"
    },
    stoneAxe: {
      name: "돌도끼 및 돌자귀",
      era: "신석기~청동기시대",
      significance: "움집 기둥 벌채, 목재 가공 및 개간을 위한 다목적 도구",
      description: "단단한 사암이나 섬록암을 떼어내거나 갈아서 나무 자루에 직각 또는 평행하게 결합하여 사용했습니다.",
      keyFeature: "강한 충격을 견디는 쐐기형 날과 결박용 홈"
    },
    scraper: {
      name: "긁개 (소형 석기)",
      era: "선사시대 전반",
      significance: "동물 가죽 손질, 물고기 비늘 벗기기, 나무 껍질 벗기기용 가공 도구",
      description: "흑요석이나 규암 등 석재 조각을 떼어내어 한쪽 또는 양쪽 모서리를 다듬은 휴대용 도구입니다.",
      keyFeature: "한 손에 쥐기 쉬운 둥근 그립과 예리한 단면 날"
    }
  }
};
