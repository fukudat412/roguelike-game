/**
 * アップグレードシステム
 * 永続的なステータス強化とアップグレードの管理
 */

import type { MetaProgressionData } from '../MetaProgression';
import { AchievementType } from './AchievementSystem';

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
 * アップグレードシステムクラス
 * アップグレードの購入と効果適用を管理
 */
export class UpgradeSystem {
  /**
   * アップグレード購入可否チェック
   */
  static canPurchaseUpgrade(data: MetaProgressionData, type: UpgradeType): boolean {
    const upgrade = UpgradeDatabase[type];

    // 既に購入済み
    if (data.unlockedUpgrades.includes(type)) {
      return false;
    }

    // SP不足
    if (data.soulPoints < upgrade.costSP) {
      return false;
    }

    // 前提条件未達成
    if (upgrade.prerequisite && !data.unlockedUpgrades.includes(upgrade.prerequisite)) {
      return false;
    }

    // 実績条件未達成
    for (const req of upgrade.requiredAchievements) {
      if (!data.unlockedAchievements.includes(req)) {
        return false;
      }
    }

    return true;
  }

  /**
   * アップグレード購入
   */
  static purchaseUpgrade(data: MetaProgressionData, type: UpgradeType): boolean {
    if (!this.canPurchaseUpgrade(data, type)) {
      return false;
    }

    const upgrade = UpgradeDatabase[type];

    // SP消費
    if (data.soulPoints < upgrade.costSP) {
      return false;
    }
    data.soulPoints -= upgrade.costSP;

    // 解禁
    data.unlockedUpgrades.push(type);

    // 効果適用
    this.applyUpgradeEffect(data, upgrade);

    return true;
  }

  /**
   * アップグレード効果を適用
   */
  static applyUpgradeEffect(data: MetaProgressionData, upgrade: Upgrade): void {
    const e = upgrade.effect;

    if (e.hpBonus) data.permanentHpBonus += e.hpBonus;
    if (e.mpBonus) data.permanentMpBonus += e.mpBonus;
    if (e.attackBonus) data.permanentAttackBonus += e.attackBonus;
    if (e.defenseBonus) data.permanentDefenseBonus += e.defenseBonus;
    if (e.goldBonus) data.startingGoldBonus += e.goldBonus;
    if (e.critRateBonus) data.criticalRateBonus += e.critRateBonus;
    if (e.critDmgBonus) data.criticalDamageBonus += e.critDmgBonus;
    if (e.expMultiplier) data.expMultiplier += e.expMultiplier;
    if (e.goldDropMultiplier) data.goldDropMultiplier += e.goldDropMultiplier;
    if (e.itemDropMultiplier) data.itemDropMultiplier += e.itemDropMultiplier;
    if (e.skillCDReduction) data.skillCooldownReduction += e.skillCDReduction;
    if (e.mpCostReduction) data.mpCostReduction += e.mpCostReduction;
    if (e.shopDiscountRate) data.shopDiscountRate += e.shopDiscountRate;
    if (e.visionRangeBonus) data.visionRangeBonus += e.visionRangeBonus;
    if (e.reviveOnce) data.hasReviveOnce = true;
    if (e.extraSkillSlot) data.hasExtraSkillSlot = true;
    if (e.inventoryExpansion) data.hasInventoryExpansion = true;
  }

  /**
   * 購入可能なアップグレードを取得
   */
  static getAvailableUpgrades(data: MetaProgressionData): Upgrade[] {
    return Object.values(UpgradeDatabase).filter(upgrade =>
      this.canPurchaseUpgrade(data, upgrade.type)
    );
  }

  /**
   * 最終ボス撃破報酬を自動解禁
   */
  static recordFinalBossDefeat(data: MetaProgressionData, dungeonType: string): string | null {
    // 既に撃破済みの場合は何もしない
    if (data.defeatedFinalBosses.includes(dungeonType)) {
      return null;
    }

    // 撃破記録を追加
    data.defeatedFinalBosses.push(dungeonType);

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

    if (rewardType && !data.unlockedUpgrades.includes(rewardType)) {
      data.unlockedUpgrades.push(rewardType);
      const upgrade = UpgradeDatabase[rewardType];
      this.applyUpgradeEffect(data, upgrade);
      return upgrade.name;
    }

    return null;
  }

  /**
   * 全アップグレードを取得
   */
  static getAllUpgrades(): Upgrade[] {
    return Object.values(UpgradeDatabase);
  }

  /**
   * 解禁済みアップグレードを取得
   */
  static getUnlockedUpgrades(data: MetaProgressionData): Upgrade[] {
    return data.unlockedUpgrades
      .map(type => UpgradeDatabase[type as UpgradeType])
      .filter(u => u !== undefined);
  }
}
