/**
 * 実績システム
 * 実績の定義・チェック・解禁処理を担当
 */

import type { MetaProgressionData } from '../MetaProgression';

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
 * 実績システムクラス
 * 実績のチェックと解禁を管理
 */
export class AchievementSystem {
  /**
   * 新しく解禁された実績をチェック
   * @param data - メタプログレッションデータ
   * @returns 新しく解禁された実績のリスト
   */
  static checkNewAchievements(data: MetaProgressionData): Achievement[] {
    const newAchievements: Achievement[] = [];

    for (const achievement of Object.values(AchievementDatabase)) {
      // 既に解禁済みならスキップ
      if (data.unlockedAchievements.includes(achievement.type)) {
        continue;
      }

      // 条件をチェック
      if (achievement.checkCondition(data)) {
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  /**
   * 実績を解禁してSPを付与
   * @param data - メタプログレッションデータ
   * @param achievement - 解禁する実績
   */
  static unlockAchievement(data: MetaProgressionData, achievement: Achievement): void {
    if (!data.unlockedAchievements.includes(achievement.type)) {
      data.unlockedAchievements.push(achievement.type);
      data.soulPoints += achievement.rewardSP;
      data.lifetimeSoulPoints += achievement.rewardSP;
    }
  }

  /**
   * 全実績を取得
   */
  static getAllAchievements(): Achievement[] {
    return Object.values(AchievementDatabase);
  }

  /**
   * 解禁済み実績を取得
   */
  static getUnlockedAchievements(data: MetaProgressionData): Achievement[] {
    return data.unlockedAchievements
      .map(type => AchievementDatabase[type as AchievementType])
      .filter(a => a !== undefined);
  }

  /**
   * 未解禁実績を取得
   */
  static getLockedAchievements(data: MetaProgressionData): Achievement[] {
    return Object.values(AchievementDatabase).filter(
      achievement => !data.unlockedAchievements.includes(achievement.type)
    );
  }
}
