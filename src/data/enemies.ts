/**
 * 敵データ定義
 * 階層に応じた敵のバリエーション
 */

import { EnemyTemplate } from '@/entities/Enemy';

export const EnemyDatabase: Record<string, EnemyTemplate> = {
  // 序盤の敵（階層 1-3）
  GOBLIN: {
    name: 'ゴブリン',
    char: 'g',
    color: '#00ff00',
    maxHp: 35,
    attack: 7,
    defense: 3,
    experienceValue: 10,
    minFloor: 1,
  },

  KOBOLD: {
    name: 'コボルド',
    char: 'k',
    color: '#8b4513',
    maxHp: 40,
    attack: 8,
    defense: 3,
    experienceValue: 12,
    minFloor: 1,
  },

  RAT: {
    name: '巨大ネズミ',
    char: 'r',
    color: '#666666',
    maxHp: 25,
    attack: 6,
    defense: 2,
    experienceValue: 8,
    minFloor: 1,
    specialAttack: {
      type: 'poison',
      chance: 0.3,
      duration: 3,
    },
  },

  // 中盤の敵（階層 4-7）
  ORC: {
    name: 'オーク',
    char: 'o',
    color: '#ff6b6b',
    maxHp: 70,
    attack: 12,
    defense: 5,
    experienceValue: 25,
    minFloor: 4,
  },

  SKELETON: {
    name: 'スケルトン',
    char: 's',
    color: '#cccccc',
    maxHp: 60,
    attack: 10,
    defense: 6,
    experienceValue: 20,
    minFloor: 4,
    specialAttack: {
      type: 'paralyze',
      chance: 0.1,
      duration: 2,
    },
  },

  WOLF: {
    name: '野生の狼',
    char: 'w',
    color: '#5a5a5a',
    maxHp: 50,
    attack: 14,
    defense: 3,
    experienceValue: 18,
    minFloor: 4,
  },

  ZOMBIE: {
    name: 'ゾンビ',
    char: 'z',
    color: '#4a7c4a',
    maxHp: 80,
    attack: 9,
    defense: 3,
    experienceValue: 22,
    minFloor: 4,
    specialAttack: {
      type: 'poison',
      chance: 0.2,
      duration: 5,
    },
  },

  // 後半の敵（階層 8-12）
  TROLL: {
    name: 'トロール',
    char: 'T',
    color: '#8b4513',
    maxHp: 140,
    attack: 18,
    defense: 8,
    experienceValue: 50,
    minFloor: 8,
  },

  OGRE: {
    name: 'オーガ',
    char: 'O',
    color: '#cc6600',
    maxHp: 160,
    attack: 20,
    defense: 10,
    experienceValue: 60,
    minFloor: 8,
  },

  WRAITH: {
    name: 'レイス',
    char: 'W',
    color: '#9966cc',
    maxHp: 100,
    attack: 22,
    defense: 5,
    experienceValue: 55,
    minFloor: 8,
    specialAttack: {
      type: 'weaken',
      chance: 0.15,
      duration: 3,
    },
  },

  VAMPIRE: {
    name: 'ヴァンパイア',
    char: 'V',
    color: '#cc0000',
    maxHp: 120,
    attack: 19,
    defense: 8,
    experienceValue: 65,
    minFloor: 8,
    specialAttack: {
      type: 'vampiric',
      chance: 1.0,
      strength: 0.3, // 30%吸収
    },
  },

  // 終盤の敵（階層 13+）
  DEMON: {
    name: 'デーモン',
    char: 'D',
    color: '#ff0000',
    maxHp: 200,
    attack: 26,
    defense: 12,
    experienceValue: 100,
    minFloor: 13,
  },

  DRAGON: {
    name: 'ドラゴン',
    char: 'X',
    color: '#ff9900',
    maxHp: 250,
    attack: 32,
    defense: 15,
    experienceValue: 150,
    minFloor: 13,
  },

  LICH: {
    name: 'リッチ',
    char: 'L',
    color: '#9933ff',
    maxHp: 170,
    attack: 30,
    defense: 10,
    experienceValue: 120,
    minFloor: 13,
  },

  ANCIENT_DRAGON: {
    name: '古代竜',
    char: 'X',
    color: '#ffcc00',
    maxHp: 350,
    attack: 38,
    defense: 18,
    experienceValue: 200,
    minFloor: 13,
  },

  // ボス敵
  GOBLIN_KING: {
    name: 'ゴブリンキング',
    char: 'G',
    color: '#00ff00',
    maxHp: 180,
    attack: 22,
    defense: 12,
    experienceValue: 100,
    isBoss: true,
    specialAttack: {
      type: 'weaken',
      chance: 0.3,
      duration: 4,
    },
  },

  ORC_LORD: {
    name: 'オークロード',
    char: 'O',
    color: '#ff0000',
    maxHp: 350,
    attack: 35,
    defense: 18,
    experienceValue: 250,
    isBoss: true,
    specialAttack: {
      type: 'vampiric',
      chance: 0.5,
      strength: 0.5,
    },
  },

  ELDER_DRAGON: {
    name: '古の竜',
    char: 'D',
    color: '#ff6600',
    maxHp: 700,
    attack: 55,
    defense: 30,
    experienceValue: 500,
    isBoss: true,
    specialAttack: {
      type: 'poison',
      chance: 0.4,
      duration: 5,
    },
  },

  ANCIENT_LICH: {
    name: '古代リッチ',
    char: 'L',
    color: '#9933ff',
    maxHp: 1200,
    attack: 80,
    defense: 45,
    experienceValue: 1000,
    isBoss: true,
    specialAttack: {
      type: 'paralyze',
      chance: 0.3,
      duration: 3,
    },
  },

  // 最終ボス（30階）
  BEAST_LORD: {
    name: '獣王ベヒーモス',
    char: 'B',
    color: '#ff8c00',
    maxHp: 1500,
    attack: 80,
    defense: 40,
    experienceValue: 2000,
    isBoss: true,
    specialAttack: {
      type: 'vampiric',
      chance: 0.6,
      strength: 0.7,
    },
  },

  DEATH_LORD: {
    name: '死神デスロード',
    char: 'R',
    color: '#000000',
    maxHp: 1200,
    attack: 90,
    defense: 35,
    experienceValue: 2000,
    isBoss: true,
    specialAttack: {
      type: 'poison',
      chance: 0.5,
      duration: 10,
    },
  },

  DEMON_LORD: {
    name: '魔王サタナス',
    char: 'S',
    color: '#8b0000',
    maxHp: 1800,
    attack: 85,
    defense: 45,
    experienceValue: 2000,
    isBoss: true,
    specialAttack: {
      type: 'paralyze',
      chance: 0.4,
      duration: 5,
    },
  },

  ARCHMAGE: {
    name: '大魔導師ゼノス',
    char: 'Z',
    color: '#4169e1',
    maxHp: 1000,
    attack: 100,
    defense: 30,
    experienceValue: 2000,
    isBoss: true,
    specialAttack: {
      type: 'confusion',
      chance: 0.5,
      duration: 4,
    },
  },
};

/**
 * 階層に応じた敵リストを取得
 */
export function getEnemiesForFloor(floor: number): EnemyTemplate[] {
  if (floor <= 3) {
    // 序盤
    return [EnemyDatabase.GOBLIN, EnemyDatabase.KOBOLD, EnemyDatabase.RAT];
  } else if (floor <= 7) {
    // 中盤
    return [EnemyDatabase.ORC, EnemyDatabase.SKELETON, EnemyDatabase.WOLF, EnemyDatabase.ZOMBIE];
  } else if (floor <= 12) {
    // 後半
    return [EnemyDatabase.TROLL, EnemyDatabase.OGRE, EnemyDatabase.WRAITH, EnemyDatabase.VAMPIRE];
  } else {
    // 終盤
    return [
      EnemyDatabase.DEMON,
      EnemyDatabase.DRAGON,
      EnemyDatabase.LICH,
      EnemyDatabase.ANCIENT_DRAGON,
    ];
  }
}

/**
 * ランダムな敵を取得（階層を考慮）
 */
export function getRandomEnemyForFloor(floor: number): EnemyTemplate {
  const enemies = getEnemiesForFloor(floor);
  return enemies[Math.floor(Math.random() * enemies.length)];
}

/**
 * ボスフロアかチェック
 */
export function isBossFloor(floor: number): boolean {
  return floor > 0 && floor % 5 === 0;
}

/**
 * 階層に応じたボスを取得
 */
export function getBossForFloor(floor: number): EnemyTemplate | null {
  if (!isBossFloor(floor)) return null;

  if (floor === 5) {
    return EnemyDatabase.GOBLIN_KING;
  } else if (floor === 10) {
    return EnemyDatabase.ORC_LORD;
  } else if (floor === 15) {
    return EnemyDatabase.ELDER_DRAGON;
  } else if (floor >= 20) {
    return EnemyDatabase.ANCIENT_LICH;
  }

  return null;
}
