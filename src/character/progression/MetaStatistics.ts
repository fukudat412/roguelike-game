/**
 * メタ統計システム
 * ゲームプレイの統計記録とソウルポイント管理
 */

import type { MetaProgressionData } from '../MetaProgression';

/**
 * MetaStatisticsクラス
 * プレイヤーの統計情報を記録し、ソウルポイント（SP）を管理
 */
export class MetaStatistics {
  /**
   * 新しいランを記録
   */
  static recordNewRun(data: MetaProgressionData): void {
    data.totalRuns++;
  }

  /**
   * 敵撃破を記録
   * @param isBoss ボス撃破かどうか
   * @returns 実績チェックが必要な場合true
   */
  static recordKill(data: MetaProgressionData, isBoss: boolean = false): boolean {
    data.totalKills++;
    if (isBoss) {
      data.totalBossesKilled++;
    }
    return true; // 実績チェック必要
  }

  /**
   * 死亡を記録
   */
  static recordDeath(data: MetaProgressionData): void {
    data.totalDeaths++;
  }

  /**
   * 到達階層を記録
   * @returns 実績チェックが必要な場合true
   */
  static recordFloor(data: MetaProgressionData, floor: number): boolean {
    if (floor > data.maxFloorReached) {
      data.maxFloorReached = floor;
      return true; // 実績チェック必要
    }
    return false;
  }

  /**
   * 最大ダメージを記録
   * @returns 実績チェックが必要な場合true
   */
  static recordDamage(data: MetaProgressionData, damage: number): boolean {
    if (damage > data.maxDamageDealt) {
      data.maxDamageDealt = damage;
      return true; // 実績チェック必要
    }
    return false;
  }

  /**
   * ゴールド獲得を記録
   * @returns 実績チェックが必要な場合true
   */
  static recordGoldEarned(data: MetaProgressionData, amount: number): boolean {
    data.totalGoldEarned += amount;
    return true; // 実績チェック必要
  }

  /**
   * ゴールド消費を記録
   */
  static recordGoldSpent(data: MetaProgressionData, amount: number): void {
    data.totalGoldSpent += amount;
  }

  /**
   * アイテム収集を記録
   * @returns 実績チェックが必要な場合true
   */
  static recordItemCollected(data: MetaProgressionData): boolean {
    data.totalItemsCollected++;
    return true; // 実績チェック必要
  }

  /**
   * 宝箱開封を記録
   * @returns 実績チェックが必要な場合true
   */
  static recordChestOpened(data: MetaProgressionData): boolean {
    data.totalChestsOpened++;
    return true; // 実績チェック必要
  }

  /**
   * スキル使用を記録
   * @returns 実績チェックが必要な場合true
   */
  static recordSkillUsed(data: MetaProgressionData): boolean {
    data.totalSkillsUsed++;
    return true; // 実績チェック必要
  }

  /**
   * ダンジョンクリア記録とSP獲得
   * @returns 獲得したSP量
   */
  static recordDungeonClear(
    data: MetaProgressionData,
    dungeonType: string,
    difficulty: number,
    maxFloors: number
  ): number {
    data.totalDungeonsCleared++;

    // ダンジョン別クリア回数
    if (!data.dungeonClearCounts[dungeonType]) {
      data.dungeonClearCounts[dungeonType] = 0;
    }
    data.dungeonClearCounts[dungeonType]++;

    // 最終ボス撃破記録
    if (!data.defeatedFinalBosses.includes(dungeonType)) {
      data.defeatedFinalBosses.push(dungeonType);
    }

    // SP獲得計算: 難易度 × 階層数 × 10
    const spReward = difficulty * maxFloors * 10;
    this.addSoulPoints(data, spReward);

    return spReward;
  }

  /**
   * 死亡時SP獲得（到達階層に応じて）
   * @returns 獲得したSP量
   */
  static recordDeathReward(data: MetaProgressionData, floorReached: number): number {
    const spReward = Math.max(10, floorReached * 5);
    this.addSoulPoints(data, spReward);
    return spReward;
  }

  /**
   * ソウルポイントを追加
   */
  static addSoulPoints(data: MetaProgressionData, amount: number): void {
    data.soulPoints += amount;
    data.lifetimeSoulPoints += amount;
  }

  /**
   * デバッグ用: SPを追加（管理者用）
   */
  static addSoulPointsDebug(data: MetaProgressionData, amount: number): void {
    this.addSoulPoints(data, amount);
  }

  /**
   * ダンジョンクリア回数を取得
   */
  static getDungeonClearCount(data: MetaProgressionData, dungeonType: string): number {
    return data.dungeonClearCounts[dungeonType] || 0;
  }

  /**
   * 最終ボス撃破済みかチェック
   */
  static isFinalBossDefeated(data: MetaProgressionData, dungeonType: string): boolean {
    return data.defeatedFinalBosses.includes(dungeonType);
  }

  /**
   * 全ダンジョンの総クリア回数を取得
   */
  static getTotalDungeonClears(data: MetaProgressionData): number {
    return data.totalDungeonsCleared;
  }

  /**
   * 統計サマリーを取得
   */
  static getStatisticsSummary(data: MetaProgressionData): {
    totalRuns: number;
    totalKills: number;
    totalBossesKilled: number;
    totalDeaths: number;
    maxFloorReached: number;
    maxDamageDealt: number;
    totalGoldEarned: number;
    totalGoldSpent: number;
    totalItemsCollected: number;
    totalChestsOpened: number;
    totalSkillsUsed: number;
    totalDungeonsCleared: number;
  } {
    return {
      totalRuns: data.totalRuns,
      totalKills: data.totalKills,
      totalBossesKilled: data.totalBossesKilled,
      totalDeaths: data.totalDeaths,
      maxFloorReached: data.maxFloorReached,
      maxDamageDealt: data.maxDamageDealt,
      totalGoldEarned: data.totalGoldEarned,
      totalGoldSpent: data.totalGoldSpent,
      totalItemsCollected: data.totalItemsCollected,
      totalChestsOpened: data.totalChestsOpened,
      totalSkillsUsed: data.totalSkillsUsed,
      totalDungeonsCleared: data.totalDungeonsCleared,
    };
  }
}
