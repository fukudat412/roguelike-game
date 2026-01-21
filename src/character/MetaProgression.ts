/**
 * メタプログレッションシステム v2.0
 * ゲーム間で永続化される進捗とアンロック要素
 * 実績システムとソウルポイント（SP）によるやり込み要素
 */

export interface MetaProgressionData {
  // 基本統計
  totalRuns: number;
  totalKills: number;
  totalBossesKilled: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalDungeonsCleared: number;
  totalDeaths: number;

  // 上限記録
  maxFloorReached: number;
  maxDamageDealt: number;

  // 詳細統計
  totalItemsCollected: number;
  totalChestsOpened: number;
  totalSkillsUsed: number;
  totalStepsWalked: number;

  // ダンジョン別クリア回数
  dungeonClearCounts: Record<string, number>;

  // 最終ボス撃破記録
  defeatedFinalBosses: string[];

  // 通貨
  soulPoints: number;
  lifetimeSoulPoints: number; // 累計獲得SP（統計用）

  // 解禁済み実績
  unlockedAchievements: string[];

  // 解禁済みアップグレード
  unlockedUpgrades: string[];

  // 永続ステータスボーナス
  permanentHpBonus: number;
  permanentMpBonus: number;
  permanentAttackBonus: number;
  permanentDefenseBonus: number;
  startingGoldBonus: number;

  // 特殊効果フラグ
  hasReviveOnce: boolean; // 1回復活
  hasExtraSkillSlot: boolean; // スキルスロット+1
  hasInventoryExpansion: boolean; // インベントリ拡張
  criticalRateBonus: number; // クリティカル率ボーナス
  criticalDamageBonus: number; // クリティカルダメージボーナス
  expMultiplier: number; // 経験値倍率
  goldDropMultiplier: number; // ゴールドドロップ倍率
  itemDropMultiplier: number; // アイテムドロップ倍率
  skillCooldownReduction: number; // スキルCD短縮（%）
  mpCostReduction: number; // MP消費軽減（%）
  shopDiscountRate: number; // 店の割引率（%）
  visionRangeBonus: number; // 視界範囲ボーナス
}

/**
 * 実績タイプ
 */
export enum AchievementType {
  // 総数系 - キル
  KILL_50 = 'KILL_50',
  KILL_100 = 'KILL_100',
  KILL_250 = 'KILL_250',
  KILL_500 = 'KILL_500',
  KILL_1000 = 'KILL_1000',
  KILL_2500 = 'KILL_2500',

  // 総数系 - ボス
  BOSS_5 = 'BOSS_5',
  BOSS_10 = 'BOSS_10',
  BOSS_25 = 'BOSS_25',
  BOSS_50 = 'BOSS_50',

  // 総数系 - ゴールド
  GOLD_5000 = 'GOLD_5000',
  GOLD_10000 = 'GOLD_10000',
  GOLD_50000 = 'GOLD_50000',
  GOLD_100000 = 'GOLD_100000',
  GOLD_500000 = 'GOLD_500000',

  // 総数系 - プレイ回数
  RUNS_5 = 'RUNS_5',
  RUNS_10 = 'RUNS_10',
  RUNS_25 = 'RUNS_25',
  RUNS_50 = 'RUNS_50',
  RUNS_100 = 'RUNS_100',

  // 総数系 - クリア回数
  CLEAR_1 = 'CLEAR_1',
  CLEAR_5 = 'CLEAR_5',
  CLEAR_10 = 'CLEAR_10',
  CLEAR_25 = 'CLEAR_25',

  // 上限系 - 階層
  FLOOR_10 = 'FLOOR_10',
  FLOOR_20 = 'FLOOR_20',
  FLOOR_30 = 'FLOOR_30',
  FLOOR_40 = 'FLOOR_40',
  FLOOR_50 = 'FLOOR_50',

  // 上限系 - ダメージ
  DAMAGE_50 = 'DAMAGE_50',
  DAMAGE_100 = 'DAMAGE_100',
  DAMAGE_250 = 'DAMAGE_250',
  DAMAGE_500 = 'DAMAGE_500',
  DAMAGE_1000 = 'DAMAGE_1000',

  // 特殊 - ダンジョンクリア
  CLEAR_TUTORIAL = 'CLEAR_TUTORIAL',
  CLEAR_CAVE = 'CLEAR_CAVE',
  CLEAR_CRYPT = 'CLEAR_CRYPT',
  CLEAR_FORTRESS = 'CLEAR_FORTRESS',
  CLEAR_TOWER = 'CLEAR_TOWER',
  CLEAR_ABYSS = 'CLEAR_ABYSS',
  CLEAR_ALL_DUNGEONS = 'CLEAR_ALL_DUNGEONS',

  // 特殊 - その他
  ITEMS_100 = 'ITEMS_100',
  CHESTS_50 = 'CHESTS_50',
  SKILLS_100 = 'SKILLS_100',
  NO_DEATH_CLEAR = 'NO_DEATH_CLEAR', // ノーデスクリア
}

/**
 * 実績定義
 */
export interface Achievement {
  type: AchievementType;
  name: string;
  description: string;
  rewardSP: number;
  checkCondition: (data: MetaProgressionData) => boolean;
}

/**
 * 実績データベース
 */
export const AchievementDatabase: Record<AchievementType, Achievement> = {
  // キル系
  [AchievementType.KILL_50]: {
    type: AchievementType.KILL_50,
    name: '駆け出しの狩人',
    description: '累計50体の敵を倒す',
    rewardSP: 50,
    checkCondition: data => data.totalKills >= 50,
  },
  [AchievementType.KILL_100]: {
    type: AchievementType.KILL_100,
    name: '熟練の狩人',
    description: '累計100体の敵を倒す',
    rewardSP: 100,
    checkCondition: data => data.totalKills >= 100,
  },
  [AchievementType.KILL_250]: {
    type: AchievementType.KILL_250,
    name: 'ベテランハンター',
    description: '累計250体の敵を倒す',
    rewardSP: 200,
    checkCondition: data => data.totalKills >= 250,
  },
  [AchievementType.KILL_500]: {
    type: AchievementType.KILL_500,
    name: 'マスターハンター',
    description: '累計500体の敵を倒す',
    rewardSP: 400,
    checkCondition: data => data.totalKills >= 500,
  },
  [AchievementType.KILL_1000]: {
    type: AchievementType.KILL_1000,
    name: '殲滅者',
    description: '累計1000体の敵を倒す',
    rewardSP: 800,
    checkCondition: data => data.totalKills >= 1000,
  },
  [AchievementType.KILL_2500]: {
    type: AchievementType.KILL_2500,
    name: '伝説の殺戮者',
    description: '累計2500体の敵を倒す',
    rewardSP: 1500,
    checkCondition: data => data.totalKills >= 2500,
  },

  // ボス系
  [AchievementType.BOSS_5]: {
    type: AchievementType.BOSS_5,
    name: 'ボスキラー',
    description: '累計5体のボスを倒す',
    rewardSP: 100,
    checkCondition: data => data.totalBossesKilled >= 5,
  },
  [AchievementType.BOSS_10]: {
    type: AchievementType.BOSS_10,
    name: 'ボススレイヤー',
    description: '累計10体のボスを倒す',
    rewardSP: 200,
    checkCondition: data => data.totalBossesKilled >= 10,
  },
  [AchievementType.BOSS_25]: {
    type: AchievementType.BOSS_25,
    name: 'ボスハンター',
    description: '累計25体のボスを倒す',
    rewardSP: 500,
    checkCondition: data => data.totalBossesKilled >= 25,
  },
  [AchievementType.BOSS_50]: {
    type: AchievementType.BOSS_50,
    name: 'ボスマスター',
    description: '累計50体のボスを倒す',
    rewardSP: 1000,
    checkCondition: data => data.totalBossesKilled >= 50,
  },

  // ゴールド系
  [AchievementType.GOLD_5000]: {
    type: AchievementType.GOLD_5000,
    name: '小金持ち',
    description: '累計5,000ゴールド獲得',
    rewardSP: 50,
    checkCondition: data => data.totalGoldEarned >= 5000,
  },
  [AchievementType.GOLD_10000]: {
    type: AchievementType.GOLD_10000,
    name: '財を成す者',
    description: '累計10,000ゴールド獲得',
    rewardSP: 100,
    checkCondition: data => data.totalGoldEarned >= 10000,
  },
  [AchievementType.GOLD_50000]: {
    type: AchievementType.GOLD_50000,
    name: '豪商',
    description: '累計50,000ゴールド獲得',
    rewardSP: 300,
    checkCondition: data => data.totalGoldEarned >= 50000,
  },
  [AchievementType.GOLD_100000]: {
    type: AchievementType.GOLD_100000,
    name: '大富豪',
    description: '累計100,000ゴールド獲得',
    rewardSP: 600,
    checkCondition: data => data.totalGoldEarned >= 100000,
  },
  [AchievementType.GOLD_500000]: {
    type: AchievementType.GOLD_500000,
    name: '黄金王',
    description: '累計500,000ゴールド獲得',
    rewardSP: 1500,
    checkCondition: data => data.totalGoldEarned >= 500000,
  },

  // プレイ回数系
  [AchievementType.RUNS_5]: {
    type: AchievementType.RUNS_5,
    name: '冒険の始まり',
    description: '5回プレイ',
    rewardSP: 50,
    checkCondition: data => data.totalRuns >= 5,
  },
  [AchievementType.RUNS_10]: {
    type: AchievementType.RUNS_10,
    name: '常連冒険者',
    description: '10回プレイ',
    rewardSP: 100,
    checkCondition: data => data.totalRuns >= 10,
  },
  [AchievementType.RUNS_25]: {
    type: AchievementType.RUNS_25,
    name: 'ベテラン冒険者',
    description: '25回プレイ',
    rewardSP: 250,
    checkCondition: data => data.totalRuns >= 25,
  },
  [AchievementType.RUNS_50]: {
    type: AchievementType.RUNS_50,
    name: '不屈の挑戦者',
    description: '50回プレイ',
    rewardSP: 500,
    checkCondition: data => data.totalRuns >= 50,
  },
  [AchievementType.RUNS_100]: {
    type: AchievementType.RUNS_100,
    name: '伝説の挑戦者',
    description: '100回プレイ',
    rewardSP: 1000,
    checkCondition: data => data.totalRuns >= 100,
  },

  // クリア回数系
  [AchievementType.CLEAR_1]: {
    type: AchievementType.CLEAR_1,
    name: '初クリア',
    description: '初めてダンジョンをクリア',
    rewardSP: 100,
    checkCondition: data => data.totalDungeonsCleared >= 1,
  },
  [AchievementType.CLEAR_5]: {
    type: AchievementType.CLEAR_5,
    name: '制覇への道',
    description: '5回ダンジョンクリア',
    rewardSP: 250,
    checkCondition: data => data.totalDungeonsCleared >= 5,
  },
  [AchievementType.CLEAR_10]: {
    type: AchievementType.CLEAR_10,
    name: 'ダンジョンマスター',
    description: '10回ダンジョンクリア',
    rewardSP: 500,
    checkCondition: data => data.totalDungeonsCleared >= 10,
  },
  [AchievementType.CLEAR_25]: {
    type: AchievementType.CLEAR_25,
    name: '制覇王',
    description: '25回ダンジョンクリア',
    rewardSP: 1000,
    checkCondition: data => data.totalDungeonsCleared >= 25,
  },

  // 階層系
  [AchievementType.FLOOR_10]: {
    type: AchievementType.FLOOR_10,
    name: '深層への一歩',
    description: '10階に到達',
    rewardSP: 100,
    checkCondition: data => data.maxFloorReached >= 10,
  },
  [AchievementType.FLOOR_20]: {
    type: AchievementType.FLOOR_20,
    name: '深層探索者',
    description: '20階に到達',
    rewardSP: 200,
    checkCondition: data => data.maxFloorReached >= 20,
  },
  [AchievementType.FLOOR_30]: {
    type: AchievementType.FLOOR_30,
    name: '深淵を覗く者',
    description: '30階に到達',
    rewardSP: 400,
    checkCondition: data => data.maxFloorReached >= 30,
  },
  [AchievementType.FLOOR_40]: {
    type: AchievementType.FLOOR_40,
    name: '深淵の探求者',
    description: '40階に到達',
    rewardSP: 600,
    checkCondition: data => data.maxFloorReached >= 40,
  },
  [AchievementType.FLOOR_50]: {
    type: AchievementType.FLOOR_50,
    name: '深淵の征服者',
    description: '50階に到達',
    rewardSP: 1000,
    checkCondition: data => data.maxFloorReached >= 50,
  },

  // ダメージ系
  [AchievementType.DAMAGE_50]: {
    type: AchievementType.DAMAGE_50,
    name: 'パワーヒッター',
    description: '50ダメージを与える',
    rewardSP: 50,
    checkCondition: data => data.maxDamageDealt >= 50,
  },
  [AchievementType.DAMAGE_100]: {
    type: AchievementType.DAMAGE_100,
    name: '破壊者',
    description: '100ダメージを与える',
    rewardSP: 100,
    checkCondition: data => data.maxDamageDealt >= 100,
  },
  [AchievementType.DAMAGE_250]: {
    type: AchievementType.DAMAGE_250,
    name: '強撃の使い手',
    description: '250ダメージを与える',
    rewardSP: 250,
    checkCondition: data => data.maxDamageDealt >= 250,
  },
  [AchievementType.DAMAGE_500]: {
    type: AchievementType.DAMAGE_500,
    name: '殲滅砲',
    description: '500ダメージを与える',
    rewardSP: 500,
    checkCondition: data => data.maxDamageDealt >= 500,
  },
  [AchievementType.DAMAGE_1000]: {
    type: AchievementType.DAMAGE_1000,
    name: '一撃必殺',
    description: '1000ダメージを与える',
    rewardSP: 1000,
    checkCondition: data => data.maxDamageDealt >= 1000,
  },

  // ダンジョンクリア系
  [AchievementType.CLEAR_TUTORIAL]: {
    type: AchievementType.CLEAR_TUTORIAL,
    name: '訓練修了',
    description: '訓練場をクリア',
    rewardSP: 50,
    checkCondition: data => data.defeatedFinalBosses.includes('TUTORIAL'),
  },
  [AchievementType.CLEAR_CAVE]: {
    type: AchievementType.CLEAR_CAVE,
    name: '野獣制圧',
    description: '野獣の洞窟をクリア',
    rewardSP: 200,
    checkCondition: data => data.defeatedFinalBosses.includes('CAVE'),
  },
  [AchievementType.CLEAR_CRYPT]: {
    type: AchievementType.CLEAR_CRYPT,
    name: 'アンデッド浄化',
    description: '忘れられた墓地をクリア',
    rewardSP: 300,
    checkCondition: data => data.defeatedFinalBosses.includes('CRYPT'),
  },
  [AchievementType.CLEAR_FORTRESS]: {
    type: AchievementType.CLEAR_FORTRESS,
    name: '要塞攻略',
    description: '放棄された要塞をクリア',
    rewardSP: 400,
    checkCondition: data => data.defeatedFinalBosses.includes('FORTRESS'),
  },
  [AchievementType.CLEAR_TOWER]: {
    type: AchievementType.CLEAR_TOWER,
    name: '魔導師討伐',
    description: '魔法使いの塔をクリア',
    rewardSP: 500,
    checkCondition: data => data.defeatedFinalBosses.includes('TOWER'),
  },
  [AchievementType.CLEAR_ABYSS]: {
    type: AchievementType.CLEAR_ABYSS,
    name: '奈落の覇者',
    description: '奈落の深淵をクリア',
    rewardSP: 2000,
    checkCondition: data => data.defeatedFinalBosses.includes('ABYSS'),
  },
  [AchievementType.CLEAR_ALL_DUNGEONS]: {
    type: AchievementType.CLEAR_ALL_DUNGEONS,
    name: '完全制覇',
    description: '全てのダンジョンをクリア',
    rewardSP: 3000,
    checkCondition: data =>
      ['TUTORIAL', 'CAVE', 'CRYPT', 'FORTRESS', 'TOWER', 'ABYSS'].every(d =>
        data.defeatedFinalBosses.includes(d)
      ),
  },

  // その他
  [AchievementType.ITEMS_100]: {
    type: AchievementType.ITEMS_100,
    name: 'コレクター',
    description: '累計100個のアイテムを収集',
    rewardSP: 100,
    checkCondition: data => data.totalItemsCollected >= 100,
  },
  [AchievementType.CHESTS_50]: {
    type: AchievementType.CHESTS_50,
    name: 'トレジャーハンター',
    description: '累計50個の宝箱を開ける',
    rewardSP: 150,
    checkCondition: data => data.totalChestsOpened >= 50,
  },
  [AchievementType.SKILLS_100]: {
    type: AchievementType.SKILLS_100,
    name: 'スキルマスター',
    description: '累計100回スキルを使用',
    rewardSP: 100,
    checkCondition: data => data.totalSkillsUsed >= 100,
  },
  [AchievementType.NO_DEATH_CLEAR]: {
    type: AchievementType.NO_DEATH_CLEAR,
    name: '不死身の英雄',
    description: 'ダンジョンを一度も死なずにクリア',
    rewardSP: 500,
    checkCondition: () => false, // 手動で解禁
  },
};

/**
 * アップグレードタイプ
 */
export enum UpgradeType {
  // ============ ティア1: 基礎ステータス ============
  // HP
  HP_1 = 'HP_1',
  HP_2 = 'HP_2',
  HP_3 = 'HP_3',
  HP_4 = 'HP_4',
  HP_5 = 'HP_5',
  HP_6 = 'HP_6',
  HP_7 = 'HP_7',
  HP_8 = 'HP_8',
  HP_9 = 'HP_9',
  HP_10 = 'HP_10',

  // MP
  MP_1 = 'MP_1',
  MP_2 = 'MP_2',
  MP_3 = 'MP_3',
  MP_4 = 'MP_4',
  MP_5 = 'MP_5',
  MP_6 = 'MP_6',
  MP_7 = 'MP_7',
  MP_8 = 'MP_8',
  MP_9 = 'MP_9',
  MP_10 = 'MP_10',

  // 攻撃力
  ATK_1 = 'ATK_1',
  ATK_2 = 'ATK_2',
  ATK_3 = 'ATK_3',
  ATK_4 = 'ATK_4',
  ATK_5 = 'ATK_5',
  ATK_6 = 'ATK_6',
  ATK_7 = 'ATK_7',
  ATK_8 = 'ATK_8',
  ATK_9 = 'ATK_9',
  ATK_10 = 'ATK_10',

  // 防御力
  DEF_1 = 'DEF_1',
  DEF_2 = 'DEF_2',
  DEF_3 = 'DEF_3',
  DEF_4 = 'DEF_4',
  DEF_5 = 'DEF_5',
  DEF_6 = 'DEF_6',
  DEF_7 = 'DEF_7',
  DEF_8 = 'DEF_8',
  DEF_9 = 'DEF_9',
  DEF_10 = 'DEF_10',

  // ============ ティア2: 戦闘系 ============
  CRIT_RATE_1 = 'CRIT_RATE_1',
  CRIT_RATE_2 = 'CRIT_RATE_2',
  CRIT_RATE_3 = 'CRIT_RATE_3',
  CRIT_DMG_1 = 'CRIT_DMG_1',
  CRIT_DMG_2 = 'CRIT_DMG_2',
  CRIT_DMG_3 = 'CRIT_DMG_3',
  EXP_UP_1 = 'EXP_UP_1',
  EXP_UP_2 = 'EXP_UP_2',
  EXP_UP_3 = 'EXP_UP_3',
  SKILL_CD_1 = 'SKILL_CD_1',
  SKILL_CD_2 = 'SKILL_CD_2',
  MP_COST_1 = 'MP_COST_1',
  MP_COST_2 = 'MP_COST_2',

  // ============ ティア3: 探索系 ============
  GOLD_DROP_1 = 'GOLD_DROP_1',
  GOLD_DROP_2 = 'GOLD_DROP_2',
  GOLD_DROP_3 = 'GOLD_DROP_3',
  ITEM_DROP_1 = 'ITEM_DROP_1',
  ITEM_DROP_2 = 'ITEM_DROP_2',
  ITEM_DROP_3 = 'ITEM_DROP_3',
  STARTING_GOLD_1 = 'STARTING_GOLD_1',
  STARTING_GOLD_2 = 'STARTING_GOLD_2',
  STARTING_GOLD_3 = 'STARTING_GOLD_3',
  SHOP_DISCOUNT_1 = 'SHOP_DISCOUNT_1',
  SHOP_DISCOUNT_2 = 'SHOP_DISCOUNT_2',
  VISION_RANGE_1 = 'VISION_RANGE_1',
  VISION_RANGE_2 = 'VISION_RANGE_2',

  // ============ ティア4: 特殊 ============
  REVIVE_ONCE = 'REVIVE_ONCE',
  EXTRA_SKILL_SLOT = 'EXTRA_SKILL_SLOT',
  INVENTORY_EXPANSION = 'INVENTORY_EXPANSION',

  // ============ ボス撃破報酬（自動解禁） ============
  TUTORIAL_REWARD = 'TUTORIAL_REWARD',
  BEAST_LORD_BLESSING = 'BEAST_LORD_BLESSING',
  DEATH_LORD_CONTRACT = 'DEATH_LORD_CONTRACT',
  DEMON_LORD_ARMOR = 'DEMON_LORD_ARMOR',
  ARCHMAGE_WISDOM = 'ARCHMAGE_WISDOM',
  ABYSS_CONQUEROR = 'ABYSS_CONQUEROR',
}

/**
 * アップグレード定義
 */
export interface Upgrade {
  type: UpgradeType;
  name: string;
  description: string;
  costSP: number;
  requiredAchievements: AchievementType[];
  prerequisite?: UpgradeType;
  effect: {
    hpBonus?: number;
    mpBonus?: number;
    attackBonus?: number;
    defenseBonus?: number;
    goldBonus?: number;
    critRateBonus?: number;
    critDmgBonus?: number;
    expMultiplier?: number;
    goldDropMultiplier?: number;
    itemDropMultiplier?: number;
    skillCDReduction?: number;
    mpCostReduction?: number;
    shopDiscountRate?: number;
    visionRangeBonus?: number;
    reviveOnce?: boolean;
    extraSkillSlot?: boolean;
    inventoryExpansion?: boolean;
  };
}

/**
 * アップグレードデータベース
 */
export const UpgradeDatabase: Record<UpgradeType, Upgrade> = {
  // ========== HP系 (10段階) ==========
  [UpgradeType.HP_1]: {
    type: UpgradeType.HP_1,
    name: 'HP強化 I',
    description: '最大HP +15',
    costSP: 50,
    requiredAchievements: [],
    effect: { hpBonus: 15 },
  },
  [UpgradeType.HP_2]: {
    type: UpgradeType.HP_2,
    name: 'HP強化 II',
    description: '最大HP +20',
    costSP: 100,
    requiredAchievements: [],
    prerequisite: UpgradeType.HP_1,
    effect: { hpBonus: 20 },
  },
  [UpgradeType.HP_3]: {
    type: UpgradeType.HP_3,
    name: 'HP強化 III',
    description: '最大HP +25',
    costSP: 200,
    requiredAchievements: [AchievementType.KILL_50],
    prerequisite: UpgradeType.HP_2,
    effect: { hpBonus: 25 },
  },
  [UpgradeType.HP_4]: {
    type: UpgradeType.HP_4,
    name: 'HP強化 IV',
    description: '最大HP +30',
    costSP: 400,
    requiredAchievements: [AchievementType.KILL_100],
    prerequisite: UpgradeType.HP_3,
    effect: { hpBonus: 30 },
  },
  [UpgradeType.HP_5]: {
    type: UpgradeType.HP_5,
    name: 'HP強化 V',
    description: '最大HP +40',
    costSP: 600,
    requiredAchievements: [AchievementType.CLEAR_1],
    prerequisite: UpgradeType.HP_4,
    effect: { hpBonus: 40 },
  },
  [UpgradeType.HP_6]: {
    type: UpgradeType.HP_6,
    name: 'HP強化 VI',
    description: '最大HP +50',
    costSP: 900,
    requiredAchievements: [AchievementType.KILL_250, AchievementType.FLOOR_10],
    prerequisite: UpgradeType.HP_5,
    effect: { hpBonus: 50 },
  },
  [UpgradeType.HP_7]: {
    type: UpgradeType.HP_7,
    name: 'HP強化 VII',
    description: '最大HP +60',
    costSP: 1200,
    requiredAchievements: [AchievementType.CLEAR_5],
    prerequisite: UpgradeType.HP_6,
    effect: { hpBonus: 60 },
  },
  [UpgradeType.HP_8]: {
    type: UpgradeType.HP_8,
    name: 'HP強化 VIII',
    description: '最大HP +75',
    costSP: 1600,
    requiredAchievements: [AchievementType.KILL_500, AchievementType.FLOOR_20],
    prerequisite: UpgradeType.HP_7,
    effect: { hpBonus: 75 },
  },
  [UpgradeType.HP_9]: {
    type: UpgradeType.HP_9,
    name: 'HP強化 IX',
    description: '最大HP +90',
    costSP: 2000,
    requiredAchievements: [AchievementType.CLEAR_10, AchievementType.BOSS_10],
    prerequisite: UpgradeType.HP_8,
    effect: { hpBonus: 90 },
  },
  [UpgradeType.HP_10]: {
    type: UpgradeType.HP_10,
    name: 'HP強化 X',
    description: '最大HP +110',
    costSP: 2500,
    requiredAchievements: [AchievementType.KILL_1000, AchievementType.FLOOR_30],
    prerequisite: UpgradeType.HP_9,
    effect: { hpBonus: 110 },
  },

  // ========== MP系 (10段階) ==========
  [UpgradeType.MP_1]: {
    type: UpgradeType.MP_1,
    name: 'MP強化 I',
    description: '最大MP +8',
    costSP: 50,
    requiredAchievements: [],
    effect: { mpBonus: 8 },
  },
  [UpgradeType.MP_2]: {
    type: UpgradeType.MP_2,
    name: 'MP強化 II',
    description: '最大MP +12',
    costSP: 100,
    requiredAchievements: [],
    prerequisite: UpgradeType.MP_1,
    effect: { mpBonus: 12 },
  },
  [UpgradeType.MP_3]: {
    type: UpgradeType.MP_3,
    name: 'MP強化 III',
    description: '最大MP +16',
    costSP: 200,
    requiredAchievements: [AchievementType.SKILLS_100],
    prerequisite: UpgradeType.MP_2,
    effect: { mpBonus: 16 },
  },
  [UpgradeType.MP_4]: {
    type: UpgradeType.MP_4,
    name: 'MP強化 IV',
    description: '最大MP +20',
    costSP: 400,
    requiredAchievements: [AchievementType.KILL_100],
    prerequisite: UpgradeType.MP_3,
    effect: { mpBonus: 20 },
  },
  [UpgradeType.MP_5]: {
    type: UpgradeType.MP_5,
    name: 'MP強化 V',
    description: '最大MP +25',
    costSP: 600,
    requiredAchievements: [AchievementType.CLEAR_1],
    prerequisite: UpgradeType.MP_4,
    effect: { mpBonus: 25 },
  },
  [UpgradeType.MP_6]: {
    type: UpgradeType.MP_6,
    name: 'MP強化 VI',
    description: '最大MP +30',
    costSP: 900,
    requiredAchievements: [AchievementType.KILL_250, AchievementType.FLOOR_10],
    prerequisite: UpgradeType.MP_5,
    effect: { mpBonus: 30 },
  },
  [UpgradeType.MP_7]: {
    type: UpgradeType.MP_7,
    name: 'MP強化 VII',
    description: '最大MP +35',
    costSP: 1200,
    requiredAchievements: [AchievementType.CLEAR_5],
    prerequisite: UpgradeType.MP_6,
    effect: { mpBonus: 35 },
  },
  [UpgradeType.MP_8]: {
    type: UpgradeType.MP_8,
    name: 'MP強化 VIII',
    description: '最大MP +42',
    costSP: 1600,
    requiredAchievements: [AchievementType.KILL_500, AchievementType.FLOOR_20],
    prerequisite: UpgradeType.MP_7,
    effect: { mpBonus: 42 },
  },
  [UpgradeType.MP_9]: {
    type: UpgradeType.MP_9,
    name: 'MP強化 IX',
    description: '最大MP +50',
    costSP: 2000,
    requiredAchievements: [AchievementType.CLEAR_10, AchievementType.BOSS_10],
    prerequisite: UpgradeType.MP_8,
    effect: { mpBonus: 50 },
  },
  [UpgradeType.MP_10]: {
    type: UpgradeType.MP_10,
    name: 'MP強化 X',
    description: '最大MP +60',
    costSP: 2500,
    requiredAchievements: [AchievementType.KILL_1000, AchievementType.FLOOR_30],
    prerequisite: UpgradeType.MP_9,
    effect: { mpBonus: 60 },
  },

  // ========== 攻撃力系 (10段階) ==========
  [UpgradeType.ATK_1]: {
    type: UpgradeType.ATK_1,
    name: '攻撃力強化 I',
    description: '攻撃力 +1',
    costSP: 80,
    requiredAchievements: [],
    effect: { attackBonus: 1 },
  },
  [UpgradeType.ATK_2]: {
    type: UpgradeType.ATK_2,
    name: '攻撃力強化 II',
    description: '攻撃力 +2',
    costSP: 150,
    requiredAchievements: [],
    prerequisite: UpgradeType.ATK_1,
    effect: { attackBonus: 2 },
  },
  [UpgradeType.ATK_3]: {
    type: UpgradeType.ATK_3,
    name: '攻撃力強化 III',
    description: '攻撃力 +2',
    costSP: 300,
    requiredAchievements: [AchievementType.DAMAGE_50],
    prerequisite: UpgradeType.ATK_2,
    effect: { attackBonus: 2 },
  },
  [UpgradeType.ATK_4]: {
    type: UpgradeType.ATK_4,
    name: '攻撃力強化 IV',
    description: '攻撃力 +3',
    costSP: 500,
    requiredAchievements: [AchievementType.DAMAGE_100],
    prerequisite: UpgradeType.ATK_3,
    effect: { attackBonus: 3 },
  },
  [UpgradeType.ATK_5]: {
    type: UpgradeType.ATK_5,
    name: '攻撃力強化 V',
    description: '攻撃力 +3',
    costSP: 700,
    requiredAchievements: [AchievementType.BOSS_5],
    prerequisite: UpgradeType.ATK_4,
    effect: { attackBonus: 3 },
  },
  [UpgradeType.ATK_6]: {
    type: UpgradeType.ATK_6,
    name: '攻撃力強化 VI',
    description: '攻撃力 +4',
    costSP: 1000,
    requiredAchievements: [AchievementType.DAMAGE_250, AchievementType.FLOOR_10],
    prerequisite: UpgradeType.ATK_5,
    effect: { attackBonus: 4 },
  },
  [UpgradeType.ATK_7]: {
    type: UpgradeType.ATK_7,
    name: '攻撃力強化 VII',
    description: '攻撃力 +4',
    costSP: 1400,
    requiredAchievements: [AchievementType.BOSS_10],
    prerequisite: UpgradeType.ATK_6,
    effect: { attackBonus: 4 },
  },
  [UpgradeType.ATK_8]: {
    type: UpgradeType.ATK_8,
    name: '攻撃力強化 VIII',
    description: '攻撃力 +5',
    costSP: 1800,
    requiredAchievements: [AchievementType.DAMAGE_500, AchievementType.FLOOR_20],
    prerequisite: UpgradeType.ATK_7,
    effect: { attackBonus: 5 },
  },
  [UpgradeType.ATK_9]: {
    type: UpgradeType.ATK_9,
    name: '攻撃力強化 IX',
    description: '攻撃力 +6',
    costSP: 2200,
    requiredAchievements: [AchievementType.CLEAR_10, AchievementType.BOSS_25],
    prerequisite: UpgradeType.ATK_8,
    effect: { attackBonus: 6 },
  },
  [UpgradeType.ATK_10]: {
    type: UpgradeType.ATK_10,
    name: '攻撃力強化 X',
    description: '攻撃力 +7',
    costSP: 2800,
    requiredAchievements: [AchievementType.DAMAGE_1000, AchievementType.FLOOR_40],
    prerequisite: UpgradeType.ATK_9,
    effect: { attackBonus: 7 },
  },

  // ========== 防御力系 (10段階) ==========
  [UpgradeType.DEF_1]: {
    type: UpgradeType.DEF_1,
    name: '防御力強化 I',
    description: '防御力 +1',
    costSP: 80,
    requiredAchievements: [],
    effect: { defenseBonus: 1 },
  },
  [UpgradeType.DEF_2]: {
    type: UpgradeType.DEF_2,
    name: '防御力強化 II',
    description: '防御力 +2',
    costSP: 150,
    requiredAchievements: [],
    prerequisite: UpgradeType.DEF_1,
    effect: { defenseBonus: 2 },
  },
  [UpgradeType.DEF_3]: {
    type: UpgradeType.DEF_3,
    name: '防御力強化 III',
    description: '防御力 +2',
    costSP: 300,
    requiredAchievements: [AchievementType.FLOOR_10],
    prerequisite: UpgradeType.DEF_2,
    effect: { defenseBonus: 2 },
  },
  [UpgradeType.DEF_4]: {
    type: UpgradeType.DEF_4,
    name: '防御力強化 IV',
    description: '防御力 +3',
    costSP: 500,
    requiredAchievements: [AchievementType.RUNS_10],
    prerequisite: UpgradeType.DEF_3,
    effect: { defenseBonus: 3 },
  },
  [UpgradeType.DEF_5]: {
    type: UpgradeType.DEF_5,
    name: '防御力強化 V',
    description: '防御力 +3',
    costSP: 700,
    requiredAchievements: [AchievementType.CLEAR_5],
    prerequisite: UpgradeType.DEF_4,
    effect: { defenseBonus: 3 },
  },
  [UpgradeType.DEF_6]: {
    type: UpgradeType.DEF_6,
    name: '防御力強化 VI',
    description: '防御力 +4',
    costSP: 1000,
    requiredAchievements: [AchievementType.FLOOR_20],
    prerequisite: UpgradeType.DEF_5,
    effect: { defenseBonus: 4 },
  },
  [UpgradeType.DEF_7]: {
    type: UpgradeType.DEF_7,
    name: '防御力強化 VII',
    description: '防御力 +4',
    costSP: 1400,
    requiredAchievements: [AchievementType.CLEAR_10],
    prerequisite: UpgradeType.DEF_6,
    effect: { defenseBonus: 4 },
  },
  [UpgradeType.DEF_8]: {
    type: UpgradeType.DEF_8,
    name: '防御力強化 VIII',
    description: '防御力 +5',
    costSP: 1800,
    requiredAchievements: [AchievementType.FLOOR_30],
    prerequisite: UpgradeType.DEF_7,
    effect: { defenseBonus: 5 },
  },
  [UpgradeType.DEF_9]: {
    type: UpgradeType.DEF_9,
    name: '防御力強化 IX',
    description: '防御力 +6',
    costSP: 2200,
    requiredAchievements: [AchievementType.CLEAR_25],
    prerequisite: UpgradeType.DEF_8,
    effect: { defenseBonus: 6 },
  },
  [UpgradeType.DEF_10]: {
    type: UpgradeType.DEF_10,
    name: '防御力強化 X',
    description: '防御力 +7',
    costSP: 2800,
    requiredAchievements: [AchievementType.FLOOR_50],
    prerequisite: UpgradeType.DEF_9,
    effect: { defenseBonus: 7 },
  },

  // ========== 戦闘系 ==========
  [UpgradeType.CRIT_RATE_1]: {
    type: UpgradeType.CRIT_RATE_1,
    name: 'クリティカル率UP I',
    description: 'クリティカル率 +5%',
    costSP: 300,
    requiredAchievements: [AchievementType.DAMAGE_100],
    effect: { critRateBonus: 5 },
  },
  [UpgradeType.CRIT_RATE_2]: {
    type: UpgradeType.CRIT_RATE_2,
    name: 'クリティカル率UP II',
    description: 'クリティカル率 +5%',
    costSP: 600,
    requiredAchievements: [AchievementType.DAMAGE_250, AchievementType.BOSS_10],
    prerequisite: UpgradeType.CRIT_RATE_1,
    effect: { critRateBonus: 5 },
  },
  [UpgradeType.CRIT_RATE_3]: {
    type: UpgradeType.CRIT_RATE_3,
    name: 'クリティカル率UP III',
    description: 'クリティカル率 +5%',
    costSP: 1200,
    requiredAchievements: [AchievementType.DAMAGE_500, AchievementType.CLEAR_10],
    prerequisite: UpgradeType.CRIT_RATE_2,
    effect: { critRateBonus: 5 },
  },
  [UpgradeType.CRIT_DMG_1]: {
    type: UpgradeType.CRIT_DMG_1,
    name: 'クリティカルダメージUP I',
    description: 'クリティカルダメージ +25%',
    costSP: 400,
    requiredAchievements: [AchievementType.DAMAGE_100],
    effect: { critDmgBonus: 0.25 },
  },
  [UpgradeType.CRIT_DMG_2]: {
    type: UpgradeType.CRIT_DMG_2,
    name: 'クリティカルダメージUP II',
    description: 'クリティカルダメージ +30%',
    costSP: 800,
    requiredAchievements: [AchievementType.DAMAGE_250, AchievementType.BOSS_10],
    prerequisite: UpgradeType.CRIT_DMG_1,
    effect: { critDmgBonus: 0.3 },
  },
  [UpgradeType.CRIT_DMG_3]: {
    type: UpgradeType.CRIT_DMG_3,
    name: 'クリティカルダメージUP III',
    description: 'クリティカルダメージ +35%',
    costSP: 1500,
    requiredAchievements: [AchievementType.DAMAGE_500, AchievementType.CLEAR_10],
    prerequisite: UpgradeType.CRIT_DMG_2,
    effect: { critDmgBonus: 0.35 },
  },
  [UpgradeType.EXP_UP_1]: {
    type: UpgradeType.EXP_UP_1,
    name: '経験値UP I',
    description: '獲得経験値 +15%',
    costSP: 250,
    requiredAchievements: [AchievementType.KILL_100],
    effect: { expMultiplier: 0.15 },
  },
  [UpgradeType.EXP_UP_2]: {
    type: UpgradeType.EXP_UP_2,
    name: '経験値UP II',
    description: '獲得経験値 +20%',
    costSP: 500,
    requiredAchievements: [AchievementType.KILL_250, AchievementType.CLEAR_5],
    prerequisite: UpgradeType.EXP_UP_1,
    effect: { expMultiplier: 0.2 },
  },
  [UpgradeType.EXP_UP_3]: {
    type: UpgradeType.EXP_UP_3,
    name: '経験値UP III',
    description: '獲得経験値 +25%',
    costSP: 1000,
    requiredAchievements: [AchievementType.KILL_500, AchievementType.CLEAR_10],
    prerequisite: UpgradeType.EXP_UP_2,
    effect: { expMultiplier: 0.25 },
  },
  [UpgradeType.SKILL_CD_1]: {
    type: UpgradeType.SKILL_CD_1,
    name: 'スキルCD短縮 I',
    description: 'スキルクールダウン -10%',
    costSP: 400,
    requiredAchievements: [AchievementType.SKILLS_100],
    effect: { skillCDReduction: 10 },
  },
  [UpgradeType.SKILL_CD_2]: {
    type: UpgradeType.SKILL_CD_2,
    name: 'スキルCD短縮 II',
    description: 'スキルクールダウン -15%',
    costSP: 900,
    requiredAchievements: [AchievementType.CLEAR_5],
    prerequisite: UpgradeType.SKILL_CD_1,
    effect: { skillCDReduction: 15 },
  },
  [UpgradeType.MP_COST_1]: {
    type: UpgradeType.MP_COST_1,
    name: 'MP消費軽減 I',
    description: 'MP消費 -10%',
    costSP: 400,
    requiredAchievements: [AchievementType.SKILLS_100],
    effect: { mpCostReduction: 10 },
  },
  [UpgradeType.MP_COST_2]: {
    type: UpgradeType.MP_COST_2,
    name: 'MP消費軽減 II',
    description: 'MP消費 -15%',
    costSP: 900,
    requiredAchievements: [AchievementType.CLEAR_5],
    prerequisite: UpgradeType.MP_COST_1,
    effect: { mpCostReduction: 15 },
  },

  // ========== 探索系 ==========
  [UpgradeType.GOLD_DROP_1]: {
    type: UpgradeType.GOLD_DROP_1,
    name: 'ゴールドドロップUP I',
    description: 'ゴールドドロップ +20%',
    costSP: 200,
    requiredAchievements: [AchievementType.GOLD_5000],
    effect: { goldDropMultiplier: 0.2 },
  },
  [UpgradeType.GOLD_DROP_2]: {
    type: UpgradeType.GOLD_DROP_2,
    name: 'ゴールドドロップUP II',
    description: 'ゴールドドロップ +25%',
    costSP: 400,
    requiredAchievements: [AchievementType.GOLD_10000, AchievementType.CLEAR_5],
    prerequisite: UpgradeType.GOLD_DROP_1,
    effect: { goldDropMultiplier: 0.25 },
  },
  [UpgradeType.GOLD_DROP_3]: {
    type: UpgradeType.GOLD_DROP_3,
    name: 'ゴールドドロップUP III',
    description: 'ゴールドドロップ +30%',
    costSP: 800,
    requiredAchievements: [AchievementType.GOLD_50000, AchievementType.CLEAR_10],
    prerequisite: UpgradeType.GOLD_DROP_2,
    effect: { goldDropMultiplier: 0.3 },
  },
  [UpgradeType.ITEM_DROP_1]: {
    type: UpgradeType.ITEM_DROP_1,
    name: 'アイテムドロップUP I',
    description: 'アイテムドロップ率 +15%',
    costSP: 300,
    requiredAchievements: [AchievementType.ITEMS_100],
    effect: { itemDropMultiplier: 0.15 },
  },
  [UpgradeType.ITEM_DROP_2]: {
    type: UpgradeType.ITEM_DROP_2,
    name: 'アイテムドロップUP II',
    description: 'アイテムドロップ率 +20%',
    costSP: 600,
    requiredAchievements: [AchievementType.CHESTS_50, AchievementType.CLEAR_5],
    prerequisite: UpgradeType.ITEM_DROP_1,
    effect: { itemDropMultiplier: 0.2 },
  },
  [UpgradeType.ITEM_DROP_3]: {
    type: UpgradeType.ITEM_DROP_3,
    name: 'アイテムドロップUP III',
    description: 'アイテムドロップ率 +25%',
    costSP: 1200,
    requiredAchievements: [AchievementType.CLEAR_10],
    prerequisite: UpgradeType.ITEM_DROP_2,
    effect: { itemDropMultiplier: 0.25 },
  },
  [UpgradeType.STARTING_GOLD_1]: {
    type: UpgradeType.STARTING_GOLD_1,
    name: '初期ゴールド増加 I',
    description: '開始時ゴールド +50',
    costSP: 150,
    requiredAchievements: [],
    effect: { goldBonus: 50 },
  },
  [UpgradeType.STARTING_GOLD_2]: {
    type: UpgradeType.STARTING_GOLD_2,
    name: '初期ゴールド増加 II',
    description: '開始時ゴールド +100',
    costSP: 300,
    requiredAchievements: [AchievementType.GOLD_10000],
    prerequisite: UpgradeType.STARTING_GOLD_1,
    effect: { goldBonus: 100 },
  },
  [UpgradeType.STARTING_GOLD_3]: {
    type: UpgradeType.STARTING_GOLD_3,
    name: '初期ゴールド増加 III',
    description: '開始時ゴールド +150',
    costSP: 600,
    requiredAchievements: [AchievementType.GOLD_50000, AchievementType.CLEAR_5],
    prerequisite: UpgradeType.STARTING_GOLD_2,
    effect: { goldBonus: 150 },
  },
  [UpgradeType.SHOP_DISCOUNT_1]: {
    type: UpgradeType.SHOP_DISCOUNT_1,
    name: '店の割引 I',
    description: '店での購入価格 -10%',
    costSP: 300,
    requiredAchievements: [AchievementType.GOLD_10000],
    effect: { shopDiscountRate: 10 },
  },
  [UpgradeType.SHOP_DISCOUNT_2]: {
    type: UpgradeType.SHOP_DISCOUNT_2,
    name: '店の割引 II',
    description: '店での購入価格 -15%',
    costSP: 700,
    requiredAchievements: [AchievementType.GOLD_50000, AchievementType.CLEAR_5],
    prerequisite: UpgradeType.SHOP_DISCOUNT_1,
    effect: { shopDiscountRate: 15 },
  },
  [UpgradeType.VISION_RANGE_1]: {
    type: UpgradeType.VISION_RANGE_1,
    name: '視界範囲拡大 I',
    description: '視界範囲 +1',
    costSP: 400,
    requiredAchievements: [AchievementType.FLOOR_10],
    effect: { visionRangeBonus: 1 },
  },
  [UpgradeType.VISION_RANGE_2]: {
    type: UpgradeType.VISION_RANGE_2,
    name: '視界範囲拡大 II',
    description: '視界範囲 +1',
    costSP: 900,
    requiredAchievements: [AchievementType.FLOOR_20, AchievementType.CLEAR_5],
    prerequisite: UpgradeType.VISION_RANGE_1,
    effect: { visionRangeBonus: 1 },
  },

  // ========== 特殊 ==========
  [UpgradeType.REVIVE_ONCE]: {
    type: UpgradeType.REVIVE_ONCE,
    name: '不死鳥の加護',
    description: '死亡時に1回だけHP50%で復活',
    costSP: 3000,
    requiredAchievements: [AchievementType.CLEAR_10, AchievementType.BOSS_25],
    effect: { reviveOnce: true },
  },
  [UpgradeType.EXTRA_SKILL_SLOT]: {
    type: UpgradeType.EXTRA_SKILL_SLOT,
    name: 'スキルスロット+1',
    description: 'スキルを4つまで装備可能',
    costSP: 2500,
    requiredAchievements: [AchievementType.CLEAR_ALL_DUNGEONS, AchievementType.RUNS_25],
    effect: { extraSkillSlot: true },
  },
  [UpgradeType.INVENTORY_EXPANSION]: {
    type: UpgradeType.INVENTORY_EXPANSION,
    name: 'インベントリ拡張',
    description: 'インベントリ容量 +5',
    costSP: 1500,
    requiredAchievements: [AchievementType.ITEMS_100, AchievementType.CLEAR_5],
    effect: { inventoryExpansion: true },
  },

  // ========== ボス撃破報酬（コスト0、自動解禁） ==========
  [UpgradeType.TUTORIAL_REWARD]: {
    type: UpgradeType.TUTORIAL_REWARD,
    name: '訓練場卒業証書',
    description: 'チュートリアルクリア報酬',
    costSP: 0,
    requiredAchievements: [],
    effect: { hpBonus: 10, goldBonus: 20 },
  },
  [UpgradeType.BEAST_LORD_BLESSING]: {
    type: UpgradeType.BEAST_LORD_BLESSING,
    name: '獣王の加護',
    description: '野獣の洞窟クリア報酬',
    costSP: 0,
    requiredAchievements: [],
    effect: { hpBonus: 50, attackBonus: 3 },
  },
  [UpgradeType.DEATH_LORD_CONTRACT]: {
    type: UpgradeType.DEATH_LORD_CONTRACT,
    name: '死神の契約',
    description: '忘れられた墓地クリア報酬',
    costSP: 0,
    requiredAchievements: [],
    effect: { mpBonus: 30, defenseBonus: 3 },
  },
  [UpgradeType.DEMON_LORD_ARMOR]: {
    type: UpgradeType.DEMON_LORD_ARMOR,
    name: '魔王の鎧',
    description: '放棄された要塞クリア報酬',
    costSP: 0,
    requiredAchievements: [],
    effect: { hpBonus: 80, defenseBonus: 5 },
  },
  [UpgradeType.ARCHMAGE_WISDOM]: {
    type: UpgradeType.ARCHMAGE_WISDOM,
    name: '大魔導師の知恵',
    description: '魔法使いの塔クリア報酬',
    costSP: 0,
    requiredAchievements: [],
    effect: { mpBonus: 50, attackBonus: 3 },
  },
  [UpgradeType.ABYSS_CONQUEROR]: {
    type: UpgradeType.ABYSS_CONQUEROR,
    name: '深淵の征服者',
    description: '奈落の深淵クリア報酬',
    costSP: 0,
    requiredAchievements: [],
    effect: {
      hpBonus: 150,
      mpBonus: 75,
      attackBonus: 8,
      defenseBonus: 8,
      goldBonus: 200,
    },
  },
};

/**
 * メタプログレッションクラス
 */
export class MetaProgression {
  private static readonly STORAGE_KEY = 'roguelike_meta_progression_v2';
  private data: MetaProgressionData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  /**
   * LocalStorageから読み込み
   */
  private loadFromStorage(): MetaProgressionData {
    try {
      const saved = localStorage.getItem(MetaProgression.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as MetaProgressionData;

        // マイグレーション
        if (!data.dungeonClearCounts) data.dungeonClearCounts = {};
        if (!data.defeatedFinalBosses) data.defeatedFinalBosses = [];
        if (!data.unlockedAchievements) data.unlockedAchievements = [];
        if (data.soulPoints === undefined) data.soulPoints = 0;
        if (data.lifetimeSoulPoints === undefined) data.lifetimeSoulPoints = 0;
        if (data.maxDamageDealt === undefined) data.maxDamageDealt = 0;
        if (data.totalDungeonsCleared === undefined) data.totalDungeonsCleared = 0;
        if (data.totalDeaths === undefined) data.totalDeaths = 0;
        if (data.totalItemsCollected === undefined) data.totalItemsCollected = 0;
        if (data.totalChestsOpened === undefined) data.totalChestsOpened = 0;
        if (data.totalGoldSpent === undefined) data.totalGoldSpent = 0;
        if (data.totalSkillsUsed === undefined) data.totalSkillsUsed = 0;
        if (data.totalStepsWalked === undefined) data.totalStepsWalked = 0;
        if (data.maxFloorReached === undefined)
          data.maxFloorReached = (data as any).deepestFloor || 0;

        // 特殊効果フラグ
        if (data.hasReviveOnce === undefined) data.hasReviveOnce = false;
        if (data.hasExtraSkillSlot === undefined) data.hasExtraSkillSlot = false;
        if (data.hasInventoryExpansion === undefined) data.hasInventoryExpansion = false;
        if (data.criticalRateBonus === undefined) data.criticalRateBonus = 0;
        if (data.criticalDamageBonus === undefined) data.criticalDamageBonus = 0;
        if (data.expMultiplier === undefined) data.expMultiplier = 0;
        if (data.goldDropMultiplier === undefined) data.goldDropMultiplier = 0;
        if (data.itemDropMultiplier === undefined) data.itemDropMultiplier = 0;
        if (data.skillCooldownReduction === undefined) data.skillCooldownReduction = 0;
        if (data.mpCostReduction === undefined) data.mpCostReduction = 0;
        if (data.shopDiscountRate === undefined) data.shopDiscountRate = 0;
        if (data.visionRangeBonus === undefined) data.visionRangeBonus = 0;

        return data;
      }
    } catch (error) {
      console.error('Failed to load meta progression:', error);
    }

    // デフォルト値
    return this.getDefaultData();
  }

  /**
   * デフォルトデータ
   */
  private getDefaultData(): MetaProgressionData {
    return {
      totalRuns: 0,
      totalKills: 0,
      totalBossesKilled: 0,
      totalGoldEarned: 0,
      totalGoldSpent: 0,
      totalDungeonsCleared: 0,
      totalDeaths: 0,
      maxFloorReached: 0,
      maxDamageDealt: 0,
      totalItemsCollected: 0,
      totalChestsOpened: 0,
      totalSkillsUsed: 0,
      totalStepsWalked: 0,
      dungeonClearCounts: {},
      defeatedFinalBosses: [],
      soulPoints: 0,
      lifetimeSoulPoints: 0,
      unlockedAchievements: [],
      unlockedUpgrades: [],
      permanentHpBonus: 0,
      permanentMpBonus: 0,
      permanentAttackBonus: 0,
      permanentDefenseBonus: 0,
      startingGoldBonus: 0,
      hasReviveOnce: false,
      hasExtraSkillSlot: false,
      hasInventoryExpansion: false,
      criticalRateBonus: 0,
      criticalDamageBonus: 0,
      expMultiplier: 0,
      goldDropMultiplier: 0,
      itemDropMultiplier: 0,
      skillCooldownReduction: 0,
      mpCostReduction: 0,
      shopDiscountRate: 0,
      visionRangeBonus: 0,
    };
  }

  /**
   * LocalStorageに保存
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(MetaProgression.STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save meta progression:', error);
    }
  }

  // ========== 統計記録メソッド ==========

  recordNewRun(): void {
    this.data.totalRuns++;
    this.saveToStorage();
  }

  recordKill(isBoss: boolean = false): void {
    this.data.totalKills++;
    if (isBoss) {
      this.data.totalBossesKilled++;
    }
    this.checkAndUnlockAchievements();
    this.saveToStorage();
  }

  recordDeath(): void {
    this.data.totalDeaths++;
    this.saveToStorage();
  }

  recordFloor(floor: number): void {
    if (floor > this.data.maxFloorReached) {
      this.data.maxFloorReached = floor;
      this.checkAndUnlockAchievements();
      this.saveToStorage();
    }
  }

  recordDamage(damage: number): void {
    if (damage > this.data.maxDamageDealt) {
      this.data.maxDamageDealt = damage;
      this.checkAndUnlockAchievements();
      this.saveToStorage();
    }
  }

  recordGoldEarned(amount: number): void {
    this.data.totalGoldEarned += amount;
    this.checkAndUnlockAchievements();
    this.saveToStorage();
  }

  recordGoldSpent(amount: number): void {
    this.data.totalGoldSpent += amount;
    this.saveToStorage();
  }

  recordItemCollected(): void {
    this.data.totalItemsCollected++;
    this.checkAndUnlockAchievements();
    this.saveToStorage();
  }

  recordChestOpened(): void {
    this.data.totalChestsOpened++;
    this.checkAndUnlockAchievements();
    this.saveToStorage();
  }

  recordSkillUsed(): void {
    this.data.totalSkillsUsed++;
    this.checkAndUnlockAchievements();
    this.saveToStorage();
  }

  /**
   * ダンジョンクリア記録とSP獲得
   */
  recordDungeonClear(dungeonType: string, difficulty: number, maxFloors: number): number {
    this.data.totalDungeonsCleared++;

    // ダンジョン別クリア回数
    if (!this.data.dungeonClearCounts[dungeonType]) {
      this.data.dungeonClearCounts[dungeonType] = 0;
    }
    this.data.dungeonClearCounts[dungeonType]++;

    // 最終ボス撃破記録
    if (!this.data.defeatedFinalBosses.includes(dungeonType)) {
      this.data.defeatedFinalBosses.push(dungeonType);
    }

    // SP獲得計算: 難易度 × 階層数 × 10
    const spReward = difficulty * maxFloors * 10;
    this.addSoulPoints(spReward);

    this.checkAndUnlockAchievements();
    this.saveToStorage();

    return spReward;
  }

  /**
   * 死亡時SP獲得（到達階層に応じて）
   */
  recordDeathReward(floorReached: number): number {
    const spReward = Math.max(10, floorReached * 5);
    this.addSoulPoints(spReward);
    this.saveToStorage();
    return spReward;
  }

  // ========== SP管理 ==========

  addSoulPoints(amount: number): void {
    this.data.soulPoints += amount;
    this.data.lifetimeSoulPoints += amount;
  }

  spendSoulPoints(amount: number): boolean {
    if (this.data.soulPoints >= amount) {
      this.data.soulPoints -= amount;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getSoulPoints(): number {
    return this.data.soulPoints;
  }

  getLifetimeSoulPoints(): number {
    return this.data.lifetimeSoulPoints;
  }

  // ========== 実績チェック ==========

  /**
   * 全実績をチェックして新規解禁
   */
  private checkAndUnlockAchievements(): void {
    let newUnlocks = 0;

    for (const achievement of Object.values(AchievementDatabase)) {
      // 既に解禁済みはスキップ
      if (this.data.unlockedAchievements.includes(achievement.type)) {
        continue;
      }

      // 条件チェック
      if (achievement.checkCondition(this.data)) {
        this.data.unlockedAchievements.push(achievement.type);
        this.addSoulPoints(achievement.rewardSP);
        newUnlocks++;

        console.log(`🏆 実績解禁: ${achievement.name} (+${achievement.rewardSP} SP)`);
      }
    }

    if (newUnlocks > 0) {
      this.saveToStorage();
    }
  }

  /**
   * 特定実績を手動解禁（ノーデスクリアなど）
   */
  unlockAchievement(type: AchievementType): void {
    if (!this.data.unlockedAchievements.includes(type)) {
      this.data.unlockedAchievements.push(type);
      const achievement = AchievementDatabase[type];
      this.addSoulPoints(achievement.rewardSP);
      this.saveToStorage();
    }
  }

  isAchievementUnlocked(type: AchievementType): boolean {
    return this.data.unlockedAchievements.includes(type);
  }

  getUnlockedAchievements(): Achievement[] {
    return this.data.unlockedAchievements.map(type => AchievementDatabase[type as AchievementType]);
  }

  // ========== アップグレード管理 ==========

  /**
   * アップグレード購入可否チェック
   */
  canPurchaseUpgrade(type: UpgradeType): boolean {
    const upgrade = UpgradeDatabase[type];

    // 既に購入済み
    if (this.data.unlockedUpgrades.includes(type)) {
      return false;
    }

    // SP不足
    if (this.data.soulPoints < upgrade.costSP) {
      return false;
    }

    // 前提条件未達成
    if (upgrade.prerequisite && !this.data.unlockedUpgrades.includes(upgrade.prerequisite)) {
      return false;
    }

    // 実績条件未達成
    for (const req of upgrade.requiredAchievements) {
      if (!this.isAchievementUnlocked(req)) {
        return false;
      }
    }

    return true;
  }

  /**
   * アップグレード購入
   */
  purchaseUpgrade(type: UpgradeType): boolean {
    if (!this.canPurchaseUpgrade(type)) {
      return false;
    }

    const upgrade = UpgradeDatabase[type];

    // SP消費
    if (!this.spendSoulPoints(upgrade.costSP)) {
      return false;
    }

    // 解禁
    this.data.unlockedUpgrades.push(type);

    // 効果適用
    this.applyUpgradeEffect(upgrade);

    this.saveToStorage();
    return true;
  }

  /**
   * アップグレード効果を適用
   */
  private applyUpgradeEffect(upgrade: Upgrade): void {
    const e = upgrade.effect;

    if (e.hpBonus) this.data.permanentHpBonus += e.hpBonus;
    if (e.mpBonus) this.data.permanentMpBonus += e.mpBonus;
    if (e.attackBonus) this.data.permanentAttackBonus += e.attackBonus;
    if (e.defenseBonus) this.data.permanentDefenseBonus += e.defenseBonus;
    if (e.goldBonus) this.data.startingGoldBonus += e.goldBonus;
    if (e.critRateBonus) this.data.criticalRateBonus += e.critRateBonus;
    if (e.critDmgBonus) this.data.criticalDamageBonus += e.critDmgBonus;
    if (e.expMultiplier) this.data.expMultiplier += e.expMultiplier;
    if (e.goldDropMultiplier) this.data.goldDropMultiplier += e.goldDropMultiplier;
    if (e.itemDropMultiplier) this.data.itemDropMultiplier += e.itemDropMultiplier;
    if (e.skillCDReduction) this.data.skillCooldownReduction += e.skillCDReduction;
    if (e.mpCostReduction) this.data.mpCostReduction += e.mpCostReduction;
    if (e.shopDiscountRate) this.data.shopDiscountRate += e.shopDiscountRate;
    if (e.visionRangeBonus) this.data.visionRangeBonus += e.visionRangeBonus;
    if (e.reviveOnce) this.data.hasReviveOnce = true;
    if (e.extraSkillSlot) this.data.hasExtraSkillSlot = true;
    if (e.inventoryExpansion) this.data.hasInventoryExpansion = true;
  }

  /**
   * 最終ボス撃破報酬を自動解禁
   */
  recordFinalBossDefeat(dungeonType: string): string | null {
    // 既に撃破済みの場合は何もしない
    if (this.data.defeatedFinalBosses.includes(dungeonType)) {
      return null;
    }

    // 撃破記録を追加
    this.data.defeatedFinalBosses.push(dungeonType);

    // ダンジョンタイプに応じた報酬を自動解禁
    let rewardType: UpgradeType | null = null;
    switch (dungeonType) {
      case 'TUTORIAL':
        rewardType = UpgradeType.TUTORIAL_REWARD;
        break;
      case 'CAVE':
        rewardType = UpgradeType.BEAST_LORD_BLESSING;
        break;
      case 'CRYPT':
        rewardType = UpgradeType.DEATH_LORD_CONTRACT;
        break;
      case 'FORTRESS':
        rewardType = UpgradeType.DEMON_LORD_ARMOR;
        break;
      case 'TOWER':
        rewardType = UpgradeType.ARCHMAGE_WISDOM;
        break;
      case 'ABYSS':
        rewardType = UpgradeType.ABYSS_CONQUEROR;
        break;
    }

    if (rewardType && !this.data.unlockedUpgrades.includes(rewardType)) {
      this.data.unlockedUpgrades.push(rewardType);
      const upgrade = UpgradeDatabase[rewardType];
      this.applyUpgradeEffect(upgrade);
      this.saveToStorage();
      return upgrade.name;
    }

    return null;
  }

  /**
   * チュートリアルクリア記録
   */
  recordTutorialClear(): string | null {
    return this.recordFinalBossDefeat('TUTORIAL');
  }

  /**
   * 全必須ダンジョンクリア済みか
   */
  hasAllRequiredDungeonsCleared(): boolean {
    const required = ['CAVE', 'CRYPT', 'FORTRESS', 'TOWER'];
    return required.every(d => this.data.defeatedFinalBosses.includes(d));
  }

  // ========== ゲッター ==========

  getData(): MetaProgressionData {
    return { ...this.data };
  }

  getPermanentHpBonus(): number {
    return this.data.permanentHpBonus;
  }

  getPermanentMpBonus(): number {
    return this.data.permanentMpBonus;
  }

  getPermanentAttackBonus(): number {
    return this.data.permanentAttackBonus;
  }

  getPermanentDefenseBonus(): number {
    return this.data.permanentDefenseBonus;
  }

  getStartingGoldBonus(): number {
    return this.data.startingGoldBonus;
  }

  getCriticalRateBonus(): number {
    return this.data.criticalRateBonus;
  }

  getCriticalDamageBonus(): number {
    return this.data.criticalDamageBonus;
  }

  getExpMultiplier(): number {
    return 1 + this.data.expMultiplier;
  }

  getGoldDropMultiplier(): number {
    return 1 + this.data.goldDropMultiplier;
  }

  getItemDropMultiplier(): number {
    return 1 + this.data.itemDropMultiplier;
  }

  getSkillCooldownReduction(): number {
    return this.data.skillCooldownReduction;
  }

  getMpCostReduction(): number {
    return this.data.mpCostReduction;
  }

  getShopDiscountRate(): number {
    return this.data.shopDiscountRate;
  }

  getVisionRangeBonus(): number {
    return this.data.visionRangeBonus;
  }

  hasReviveOnce(): boolean {
    return this.data.hasReviveOnce;
  }

  hasExtraSkillSlot(): boolean {
    return this.data.hasExtraSkillSlot;
  }

  hasInventoryExpansion(): boolean {
    return this.data.hasInventoryExpansion;
  }

  /**
   * 復活を消費
   */
  consumeRevive(): void {
    this.data.hasReviveOnce = false;
    this.saveToStorage();
  }

  // ========== 互換性メソッド（旧UI用） ==========

  /**
   * 永続ボーナスを取得（旧UI互換）
   */
  getPermanentBonuses() {
    return {
      hp: this.data.permanentHpBonus,
      mp: this.data.permanentMpBonus,
      attack: this.data.permanentAttackBonus,
      defense: this.data.permanentDefenseBonus,
      gold: this.data.startingGoldBonus,
    };
  }

  /**
   * 統計情報を取得（旧UI互換）
   */
  getStats() {
    return {
      totalRuns: this.data.totalRuns,
      totalKills: this.data.totalKills,
      totalBossesKilled: this.data.totalBossesKilled,
      totalGoldEarned: this.data.totalGoldEarned,
      totalDungeonsCleared: this.data.totalDungeonsCleared,
      totalDeaths: this.data.totalDeaths,
      maxFloorReached: this.data.maxFloorReached,
      maxDamageDealt: this.data.maxDamageDealt,
      soulPoints: this.data.soulPoints,
      lifetimeSoulPoints: this.data.lifetimeSoulPoints,
      defeatedFinalBosses: this.data.defeatedFinalBosses,
    };
  }

  /**
   * 購入可能なアップグレードを取得（旧UI互換）
   */
  getAvailableUpgrades() {
    return Object.values(UpgradeDatabase).filter(upgrade => this.canPurchaseUpgrade(upgrade.type));
  }

  /**
   * 解禁済みアップグレードを取得（旧UI互換）
   */
  getUnlockedUpgradesData() {
    return this.data.unlockedUpgrades.map(type => UpgradeDatabase[type as UpgradeType]);
  }

  // ========== デバッグ ==========

  /**
   * データをリセット（デバッグ用）
   */
  resetAll(): void {
    if (confirm('本当に全データをリセットしますか？')) {
      localStorage.removeItem(MetaProgression.STORAGE_KEY);
      this.data = this.getDefaultData();
      console.log('メタプログレッションをリセットしました');
    }
  }

  /**
   * SPを追加（デバッグ用）
   */
  addSoulPointsDebug(amount: number): void {
    this.addSoulPoints(amount);
    this.saveToStorage();
    console.log(`${amount} SP を追加しました（現在: ${this.data.soulPoints} SP）`);
  }
}
