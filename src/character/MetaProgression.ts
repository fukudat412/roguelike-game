/**
 * メタプログレッションシステム v2.0
 * ゲーム間で永続化される進捗とアンロック要素
 * 実績システムとソウルポイント（SP）によるやり込み要素
 */

import {
  AchievementType,
  AchievementDatabase,
  AchievementSystem,
  type Achievement,
} from './progression/AchievementSystem';

import {
  UpgradeType,
  UpgradeDatabase,
  UpgradeSystem,
  type Upgrade,
} from './progression/UpgradeSystem';

// 実績システムとアップグレードシステムを再エクスポート（互換性のため）
export { AchievementType, AchievementDatabase, type Achievement };
export { UpgradeType, UpgradeDatabase, type Upgrade };

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
 * メタプログレッションクラス
 */
export class MetaProgression {
  private static readonly STORAGE_KEY = 'roguelike_meta_progression_v2';
  private data: MetaProgressionData;
  private onAchievementUnlocked?: (achievement: Achievement) => void;

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

        // 実績解禁コールバック
        if (this.onAchievementUnlocked) {
          this.onAchievementUnlocked(achievement);
        }
      }
    }

    if (newUnlocks > 0) {
      this.saveToStorage();
    }
  }

  /**
   * 実績解禁時のコールバックを設定
   */
  setAchievementCallback(callback: (achievement: Achievement) => void): void {
    this.onAchievementUnlocked = callback;
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

  isUpgradeUnlocked(type: UpgradeType): boolean {
    return this.data.unlockedUpgrades.includes(type);
  }

  // ========== アップグレード管理 ==========

  /**
   * アップグレード購入可否チェック
   */
  canPurchaseUpgrade(type: UpgradeType): boolean {
    return UpgradeSystem.canPurchaseUpgrade(this.data, type);
  }

  /**
   * アップグレード購入
   */
  purchaseUpgrade(type: UpgradeType): boolean {
    const success = UpgradeSystem.purchaseUpgrade(this.data, type);
    if (success) {
      this.saveToStorage();
    }
    return success;
  }

  /**
   * 最終ボス撃破報酬を自動解禁
   */
  recordFinalBossDefeat(dungeonType: string): string | null {
    const rewardName = UpgradeSystem.recordFinalBossDefeat(this.data, dungeonType);
    if (rewardName) {
      this.saveToStorage();
    }
    return rewardName;
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
    return UpgradeSystem.getAvailableUpgrades(this.data);
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
