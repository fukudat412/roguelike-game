/**
 * ダンジョン設定データ
 * 各ダンジョンタイプの詳細設定
 */

import { DungeonType, DungeonConfig } from '@/world/DungeonType';

/**
 * 各ダンジョンの設定
 */
export const DUNGEON_CONFIGS: Record<DungeonType, DungeonConfig> = {
  [DungeonType.CAVE]: {
    metadata: {
      type: DungeonType.CAVE,
      name: '野獣の洞窟',
      description: '野生の獣が住む自然の洞窟。素早い敵が多い。',
      icon: '🦁',
      color: '#8B4513',
    },

    mapGeneration: [
      { algorithm: 'cave', weight: 0.6 },
      { algorithm: 'room', weight: 0.3 },
      { algorithm: 'bsp', weight: 0.1 },
    ],

    enemies: {
      pool: [
        'RAT',        // 巨大ネズミ（序盤）
        'WOLF',       // 野生の狼（中盤）
        'KOBOLD',     // コボルド（序盤）
        'TROLL',      // トロール（後半）
      ],
      spawnMultiplier: 1.2,
      eliteChance: 0.15,
    },

    bosses: {
      5: 'GOBLIN_KING',
      10: 'ORC_LORD',
      15: 'ELDER_DRAGON',
      30: 'BEAST_LORD',
    },

    environmentalEffects: [
      {
        name: '暗闇',
        description: '視界が狭くなり防御力が低下',
        floorInterval: 3,
        playerEffect: {
          defenseMultiplier: 0.9,
        },
      },
    ],

    loot: {
      goldMultiplier: 1.0,
      itemDropRate: 1.1,
    },
  },

  [DungeonType.CRYPT]: {
    metadata: {
      type: DungeonType.CRYPT,
      name: '忘れられた墓地',
      description: 'アンデッドが徘徊する古い墓所。毒攻撃に注意。',
      icon: '💀',
      color: '#4B0082',
    },

    mapGeneration: [
      { algorithm: 'room', weight: 0.5 },
      { algorithm: 'bsp', weight: 0.4 },
      { algorithm: 'cave', weight: 0.1 },
    ],

    enemies: {
      pool: [
        'RAT',        // 巨大ネズミ（序盤）
        'GOBLIN',     // ゴブリン（序盤）
        'ZOMBIE',     // ゾンビ（中盤）
        'SKELETON',   // スケルトン（中盤）
        'WRAITH',     // レイス（後半）
        'VAMPIRE',    // ヴァンパイア（後半）
        'LICH',       // リッチ（終盤）
      ],
      spawnMultiplier: 1.0,
      eliteChance: 0.2,
    },

    bosses: {
      5: 'GOBLIN_KING',
      10: 'ORC_LORD',
      15: 'ANCIENT_LICH',
      30: 'DEATH_LORD',
    },

    environmentalEffects: [
      {
        name: '死の瘴気',
        description: '徐々にHPが減少し、敵の攻撃力が上昇',
        floorInterval: 4,
        playerEffect: {
          hpPerTurn: -1,
        },
        enemyEffect: {
          attackMultiplier: 1.1,
        },
      },
    ],

    loot: {
      goldMultiplier: 1.2,
      itemDropRate: 0.9,
    },
  },

  [DungeonType.FORTRESS]: {
    metadata: {
      type: DungeonType.FORTRESS,
      name: '放棄された要塞',
      description: '訓練された兵士が守る軍事施設。高い防御力。',
      icon: '🏰',
      color: '#696969',
    },

    mapGeneration: [
      { algorithm: 'room', weight: 0.7 },
      { algorithm: 'bsp', weight: 0.3 },
    ],

    enemies: {
      pool: [
        'GOBLIN',     // ゴブリン（序盤）
        'ORC',        // オーク（中盤）
        'OGRE',       // オーガ（後半）
        'TROLL',      // トロール（後半）
      ],
      spawnMultiplier: 0.9,
      eliteChance: 0.25,
    },

    bosses: {
      5: 'GOBLIN_KING',
      10: 'ORC_LORD',
      15: 'ELDER_DRAGON',
      30: 'DEMON_LORD',
    },

    environmentalEffects: [
      {
        name: '戒厳令',
        description: '敵の攻撃力と防御力が大幅に上昇',
        floorInterval: 5,
        enemyEffect: {
          attackMultiplier: 1.15,
          defenseMultiplier: 1.1,
        },
      },
    ],

    loot: {
      goldMultiplier: 1.3,
      itemDropRate: 1.0,
    },
  },

  [DungeonType.TOWER]: {
    metadata: {
      type: DungeonType.TOWER,
      name: '魔法使いの塔',
      description: '魔法生物が住む神秘的な塔。強力な魔法攻撃。',
      icon: '🗼',
      color: '#9370DB',
    },

    mapGeneration: [
      { algorithm: 'bsp', weight: 0.5 },
      { algorithm: 'room', weight: 0.4 },
      { algorithm: 'cave', weight: 0.1 },
    ],

    enemies: {
      pool: [
        'KOBOLD',         // コボルド（序盤）
        'ORC',            // オーク（中盤）
        'SKELETON',       // スケルトン（中盤）
        'OGRE',           // オーガ（後半）
        'WRAITH',         // レイス（後半）
        'VAMPIRE',        // ヴァンパイア（後半）
        'DEMON',          // デーモン（終盤）
        'DRAGON',         // ドラゴン（終盤）
        'ANCIENT_DRAGON', // 古代竜（終盤）
        'LICH',           // リッチ（終盤）
      ],
      spawnMultiplier: 0.8,
      eliteChance: 0.3,
    },

    bosses: {
      5: 'ORC_LORD',
      10: 'ELDER_DRAGON',
      15: 'ANCIENT_LICH',
      30: 'ARCHMAGE',
    },

    environmentalEffects: [
      {
        name: '魔力の奔流',
        description: 'MP回復が速いが敵も強化される',
        floorInterval: 3,
        playerEffect: {
          mpPerTurn: 2,
        },
        enemyEffect: {
          attackMultiplier: 1.2,
        },
      },
    ],

    loot: {
      goldMultiplier: 1.5,
      itemDropRate: 0.8,
    },
  },
};
