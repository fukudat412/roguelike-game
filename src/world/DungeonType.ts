/**
 * ダンジョンタイプシステム
 * 複数の異なるダンジョンとその設定を管理
 */

/**
 * ダンジョンタイプ列挙型
 */
export enum DungeonType {
  CAVE = 'CAVE',         // 洞窟 - 野獣と動物
  CRYPT = 'CRYPT',       // 墓地 - アンデッド
  FORTRESS = 'FORTRESS', // 要塞 - 人間型の敵
  TOWER = 'TOWER',       // 塔 - 魔法生物
}

/**
 * ダンジョンメタデータ
 */
export interface DungeonMetadata {
  type: DungeonType;
  name: string;           // 日本語名
  description: string;    // 説明文
  icon: string;          // アイコン（絵文字）
  color: string;         // テーマカラー
}

/**
 * マップ生成設定
 */
export interface MapGenerationConfig {
  algorithm: 'room' | 'cave' | 'bsp';
  weight: number;        // 選択確率（0-1）
  params?: {
    roomCount?: number;
    minRoomSize?: number;
    maxRoomSize?: number;
    fillProbability?: number;
    iterations?: number;
  };
}

/**
 * 環境効果設定
 */
export interface EnvironmentalEffectConfig {
  name: string;
  description: string;
  floorInterval: number;    // 何階ごとに発生
  playerEffect?: {
    hpPerTurn?: number;     // ターンごとのHP変化
    mpPerTurn?: number;     // ターンごとのMP変化
    attackMultiplier?: number;
    defenseMultiplier?: number;
  };
  enemyEffect?: {
    attackMultiplier?: number;
    defenseMultiplier?: number;
    speedMultiplier?: number;
  };
}

/**
 * ダンジョン設定
 */
export interface DungeonConfig {
  metadata: DungeonMetadata;

  mapGeneration: MapGenerationConfig[];

  enemies: {
    pool: string[];        // 敵キー配列
    spawnMultiplier: number; // 出現数倍率
    eliteChance: number;   // エリート出現確率（0-1）
  };

  bosses: {
    [floor: number]: string; // 階層: ボスキー
  };

  environmentalEffects: EnvironmentalEffectConfig[];

  loot: {
    goldMultiplier: number;
    itemDropRate: number;
  };
}
