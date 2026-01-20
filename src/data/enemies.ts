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
    maxHp: 20,
    attack: 5,
    defense: 2,
    experienceValue: 10,
  },

  KOBOLD: {
    name: 'コボルド',
    char: 'k',
    color: '#8b4513',
    maxHp: 25,
    attack: 6,
    defense: 2,
    experienceValue: 12,
  },

  RAT: {
    name: '巨大ネズミ',
    char: 'r',
    color: '#666666',
    maxHp: 15,
    attack: 4,
    defense: 1,
    experienceValue: 8,
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
    maxHp: 40,
    attack: 8,
    defense: 3,
    experienceValue: 25,
  },

  SKELETON: {
    name: 'スケルトン',
    char: 's',
    color: '#cccccc',
    maxHp: 35,
    attack: 7,
    defense: 4,
    experienceValue: 20,
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
    maxHp: 30,
    attack: 9,
    defense: 2,
    experienceValue: 18,
  },

  ZOMBIE: {
    name: 'ゾンビ',
    char: 'z',
    color: '#4a7c4a',
    maxHp: 50,
    attack: 6,
    defense: 2,
    experienceValue: 22,
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
    maxHp: 80,
    attack: 12,
    defense: 5,
    experienceValue: 50,
  },

  OGRE: {
    name: 'オーガ',
    char: 'O',
    color: '#cc6600',
    maxHp: 90,
    attack: 14,
    defense: 6,
    experienceValue: 60,
  },

  WRAITH: {
    name: 'レイス',
    char: 'W',
    color: '#9966cc',
    maxHp: 60,
    attack: 15,
    defense: 3,
    experienceValue: 55,
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
    maxHp: 70,
    attack: 13,
    defense: 5,
    experienceValue: 65,
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
    maxHp: 120,
    attack: 18,
    defense: 8,
    experienceValue: 100,
  },

  DRAGON: {
    name: 'ドラゴン',
    char: 'X',
    color: '#ff9900',
    maxHp: 150,
    attack: 22,
    defense: 10,
    experienceValue: 150,
  },

  LICH: {
    name: 'リッチ',
    char: 'L',
    color: '#9933ff',
    maxHp: 100,
    attack: 20,
    defense: 7,
    experienceValue: 120,
  },

  ANCIENT_DRAGON: {
    name: '古代竜',
    char: 'X',
    color: '#ffcc00',
    maxHp: 200,
    attack: 25,
    defense: 12,
    experienceValue: 200,
  },

  // ボス敵
  GOBLIN_KING: {
    name: 'ゴブリンキング',
    char: 'G',
    color: '#00ff00',
    maxHp: 100,
    attack: 15,
    defense: 8,
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
    maxHp: 200,
    attack: 25,
    defense: 12,
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
    maxHp: 400,
    attack: 40,
    defense: 20,
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
    maxHp: 800,
    attack: 60,
    defense: 30,
    experienceValue: 1000,
    isBoss: true,
    specialAttack: {
      type: 'paralyze',
      chance: 0.3,
      duration: 3,
    },
  },
};

/**
 * 階層に応じた敵リストを取得
 */
export function getEnemiesForFloor(floor: number): EnemyTemplate[] {
  if (floor <= 3) {
    // 序盤
    return [
      EnemyDatabase.GOBLIN,
      EnemyDatabase.KOBOLD,
      EnemyDatabase.RAT,
    ];
  } else if (floor <= 7) {
    // 中盤
    return [
      EnemyDatabase.ORC,
      EnemyDatabase.SKELETON,
      EnemyDatabase.WOLF,
      EnemyDatabase.ZOMBIE,
    ];
  } else if (floor <= 12) {
    // 後半
    return [
      EnemyDatabase.TROLL,
      EnemyDatabase.OGRE,
      EnemyDatabase.WRAITH,
      EnemyDatabase.VAMPIRE,
    ];
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
