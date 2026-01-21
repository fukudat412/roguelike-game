/**
 * メタプログレッションシステム
 * ゲーム間で永続化される進捗とアンロック要素
 */

export interface MetaProgressionData {
  // 統計
  totalRuns: number;
  totalKills: number;
  deepestFloor: number;
  totalGoldEarned: number;
  totalBossesKilled: number;

  // 最終ボス撃破記録
  defeatedFinalBosses: string[]; // ダンジョンタイプのリスト

  // アンロック
  unlockedUpgrades: string[];

  // 永続アップグレード
  permanentHpBonus: number;
  permanentMpBonus: number;
  permanentAttackBonus: number;
  permanentDefenseBonus: number;
  startingGoldBonus: number;
}

export enum UpgradeType {
  HP_BOOST_1 = 'HP_BOOST_1',
  HP_BOOST_2 = 'HP_BOOST_2',
  HP_BOOST_3 = 'HP_BOOST_3',
  MP_BOOST_1 = 'MP_BOOST_1',
  MP_BOOST_2 = 'MP_BOOST_2',
  ATTACK_BOOST_1 = 'ATTACK_BOOST_1',
  ATTACK_BOOST_2 = 'ATTACK_BOOST_2',
  DEFENSE_BOOST_1 = 'DEFENSE_BOOST_1',
  DEFENSE_BOOST_2 = 'DEFENSE_BOOST_2',
  STARTING_GOLD = 'STARTING_GOLD',
  // 最終ボス撃破報酬
  BEAST_LORD_BLESSING = 'BEAST_LORD_BLESSING',
  DEATH_LORD_CONTRACT = 'DEATH_LORD_CONTRACT',
  DEMON_LORD_ARMOR = 'DEMON_LORD_ARMOR',
  ARCHMAGE_WISDOM = 'ARCHMAGE_WISDOM',
}

export interface Upgrade {
  type: UpgradeType;
  name: string;
  description: string;
  cost: number; // 必要なキル数
  hpBonus?: number;
  mpBonus?: number;
  attackBonus?: number;
  defenseBonus?: number;
  goldBonus?: number;
  prerequisite?: UpgradeType; // 必要な前提アップグレード
}

export const UpgradeDatabase: Record<UpgradeType, Upgrade> = {
  [UpgradeType.HP_BOOST_1]: {
    type: UpgradeType.HP_BOOST_1,
    name: 'HP強化 I',
    description: '開始時のHP +20',
    cost: 40,
    hpBonus: 20,
  },
  [UpgradeType.HP_BOOST_2]: {
    type: UpgradeType.HP_BOOST_1,
    name: 'HP強化 II',
    description: '開始時のHP +30',
    cost: 120,
    hpBonus: 30,
    prerequisite: UpgradeType.HP_BOOST_1,
  },
  [UpgradeType.HP_BOOST_3]: {
    type: UpgradeType.HP_BOOST_3,
    name: 'HP強化 III',
    description: '開始時のHP +50',
    cost: 240,
    hpBonus: 50,
    prerequisite: UpgradeType.HP_BOOST_2,
  },
  [UpgradeType.MP_BOOST_1]: {
    type: UpgradeType.MP_BOOST_1,
    name: 'MP強化 I',
    description: '開始時のMP +10',
    cost: 60,
    mpBonus: 10,
  },
  [UpgradeType.MP_BOOST_2]: {
    type: UpgradeType.MP_BOOST_2,
    name: 'MP強化 II',
    description: '開始時のMP +20',
    cost: 160,
    mpBonus: 20,
    prerequisite: UpgradeType.MP_BOOST_1,
  },
  [UpgradeType.ATTACK_BOOST_1]: {
    type: UpgradeType.ATTACK_BOOST_1,
    name: '攻撃力強化 I',
    description: '開始時の攻撃力 +2',
    cost: 80,
    attackBonus: 2,
  },
  [UpgradeType.ATTACK_BOOST_2]: {
    type: UpgradeType.ATTACK_BOOST_2,
    name: '攻撃力強化 II',
    description: '開始時の攻撃力 +3',
    cost: 200,
    attackBonus: 3,
    prerequisite: UpgradeType.ATTACK_BOOST_1,
  },
  [UpgradeType.DEFENSE_BOOST_1]: {
    type: UpgradeType.DEFENSE_BOOST_1,
    name: '防御力強化 I',
    description: '開始時の防御力 +2',
    cost: 80,
    defenseBonus: 2,
  },
  [UpgradeType.DEFENSE_BOOST_2]: {
    type: UpgradeType.DEFENSE_BOOST_2,
    name: '防御力強化 II',
    description: '開始時の防御力 +3',
    cost: 200,
    defenseBonus: 3,
    prerequisite: UpgradeType.DEFENSE_BOOST_1,
  },
  [UpgradeType.STARTING_GOLD]: {
    type: UpgradeType.STARTING_GOLD,
    name: '初期ゴールド増加',
    description: '開始時のゴールド +50',
    cost: 100,
    goldBonus: 50,
  },
  // 最終ボス撃破報酬（自動解放）
  [UpgradeType.BEAST_LORD_BLESSING]: {
    type: UpgradeType.BEAST_LORD_BLESSING,
    name: '獣王の加護',
    description: '獣王ベヒーモスを倒した証。開始時のHP +100',
    cost: 0, // 自動解放
    hpBonus: 100,
  },
  [UpgradeType.DEATH_LORD_CONTRACT]: {
    type: UpgradeType.DEATH_LORD_CONTRACT,
    name: '死神の契約',
    description: '死神デスロードを倒した証。開始時の攻撃力 +10',
    cost: 0, // 自動解放
    attackBonus: 10,
  },
  [UpgradeType.DEMON_LORD_ARMOR]: {
    type: UpgradeType.DEMON_LORD_ARMOR,
    name: '魔王の鎧',
    description: '魔王サタナスを倒した証。開始時の防御力 +10',
    cost: 0, // 自動解放
    defenseBonus: 10,
  },
  [UpgradeType.ARCHMAGE_WISDOM]: {
    type: UpgradeType.ARCHMAGE_WISDOM,
    name: '大魔導師の知恵',
    description: '大魔導師ゼノスを倒した証。開始時のMP +50',
    cost: 0, // 自動解放
    mpBonus: 50,
  },
};

export class MetaProgression {
  private static readonly STORAGE_KEY = 'roguelike_meta_progression';
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
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load meta progression:', error);
    }

    // デフォルト値
    return {
      totalRuns: 0,
      totalKills: 0,
      deepestFloor: 0,
      totalGoldEarned: 0,
      totalBossesKilled: 0,
      defeatedFinalBosses: [],
      unlockedUpgrades: [],
      permanentHpBonus: 0,
      permanentMpBonus: 0,
      permanentAttackBonus: 0,
      permanentDefenseBonus: 0,
      startingGoldBonus: 0,
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

  /**
   * 新規ゲーム開始を記録
   */
  recordNewRun(): void {
    this.data.totalRuns++;
    this.saveToStorage();
  }

  /**
   * 敵撃破を記録
   */
  recordKill(isBoss: boolean = false): void {
    this.data.totalKills++;
    if (isBoss) {
      this.data.totalBossesKilled++;
    }
    this.saveToStorage();
  }

  /**
   * 到達階層を記録
   */
  recordFloor(floor: number): void {
    if (floor > this.data.deepestFloor) {
      this.data.deepestFloor = floor;
      this.saveToStorage();
    }
  }

  /**
   * 獲得ゴールドを記録
   */
  recordGoldEarned(amount: number): void {
    this.data.totalGoldEarned += amount;
    this.saveToStorage();
  }

  /**
   * 最終ボス撃破を記録し、特別な永続強化を解放
   */
  recordFinalBossDefeat(dungeonType: string): string | null {
    // 既に撃破済みの場合は何もしない
    if (this.data.defeatedFinalBosses.includes(dungeonType)) {
      return null;
    }

    // 撃破記録を追加
    this.data.defeatedFinalBosses.push(dungeonType);

    // ダンジョンタイプに応じた特別な永続強化を解放
    let unlockedUpgrade: UpgradeType | null = null;
    switch (dungeonType) {
      case 'CAVE':
        unlockedUpgrade = UpgradeType.BEAST_LORD_BLESSING;
        break;
      case 'CRYPT':
        unlockedUpgrade = UpgradeType.DEATH_LORD_CONTRACT;
        break;
      case 'FORTRESS':
        unlockedUpgrade = UpgradeType.DEMON_LORD_ARMOR;
        break;
      case 'TOWER':
        unlockedUpgrade = UpgradeType.ARCHMAGE_WISDOM;
        break;
    }

    if (unlockedUpgrade && !this.data.unlockedUpgrades.includes(unlockedUpgrade)) {
      const upgrade = UpgradeDatabase[unlockedUpgrade];
      this.data.unlockedUpgrades.push(unlockedUpgrade);

      // ボーナスを適用
      if (upgrade.hpBonus) this.data.permanentHpBonus += upgrade.hpBonus;
      if (upgrade.mpBonus) this.data.permanentMpBonus += upgrade.mpBonus;
      if (upgrade.attackBonus) this.data.permanentAttackBonus += upgrade.attackBonus;
      if (upgrade.defenseBonus) this.data.permanentDefenseBonus += upgrade.defenseBonus;
      if (upgrade.goldBonus) this.data.startingGoldBonus += upgrade.goldBonus;

      this.saveToStorage();
      return upgrade.name;
    }

    this.saveToStorage();
    return null;
  }

  /**
   * 特定のダンジョンの最終ボスを撃破済みか
   */
  hasFinalBossDefeated(dungeonType: string): boolean {
    return this.data.defeatedFinalBosses.includes(dungeonType);
  }

  /**
   * アップグレードが購入可能か
   */
  canPurchaseUpgrade(upgradeType: UpgradeType): boolean {
    const upgrade = UpgradeDatabase[upgradeType];

    // 既に購入済み
    if (this.data.unlockedUpgrades.includes(upgradeType)) {
      return false;
    }

    // 前提条件チェック
    if (upgrade.prerequisite && !this.data.unlockedUpgrades.includes(upgrade.prerequisite)) {
      return false;
    }

    // コストチェック
    return this.data.totalKills >= upgrade.cost;
  }

  /**
   * アップグレードを購入
   */
  purchaseUpgrade(upgradeType: UpgradeType): boolean {
    if (!this.canPurchaseUpgrade(upgradeType)) {
      return false;
    }

    const upgrade = UpgradeDatabase[upgradeType];
    this.data.unlockedUpgrades.push(upgradeType);

    // ボーナスを適用
    if (upgrade.hpBonus) this.data.permanentHpBonus += upgrade.hpBonus;
    if (upgrade.mpBonus) this.data.permanentMpBonus += upgrade.mpBonus;
    if (upgrade.attackBonus) this.data.permanentAttackBonus += upgrade.attackBonus;
    if (upgrade.defenseBonus) this.data.permanentDefenseBonus += upgrade.defenseBonus;
    if (upgrade.goldBonus) this.data.startingGoldBonus += upgrade.goldBonus;

    this.saveToStorage();
    return true;
  }

  /**
   * 永続ボーナスを取得
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
   * 統計情報を取得
   */
  getStats() {
    return {
      totalRuns: this.data.totalRuns,
      totalKills: this.data.totalKills,
      deepestFloor: this.data.deepestFloor,
      totalGoldEarned: this.data.totalGoldEarned,
      totalBossesKilled: this.data.totalBossesKilled,
      defeatedFinalBosses: this.data.defeatedFinalBosses,
    };
  }

  /**
   * 購入可能なアップグレードを取得
   */
  getAvailableUpgrades(): Upgrade[] {
    return Object.values(UpgradeDatabase).filter(upgrade =>
      upgrade.cost > 0 && // コスト0のアップグレード（最終ボス報酬）は除外
      !this.data.unlockedUpgrades.includes(upgrade.type) &&
      (!upgrade.prerequisite || this.data.unlockedUpgrades.includes(upgrade.prerequisite))
    );
  }

  /**
   * 購入済みアップグレードを取得
   */
  getUnlockedUpgrades(): Upgrade[] {
    return this.data.unlockedUpgrades.map(type => UpgradeDatabase[type as UpgradeType]);
  }

  /**
   * データをリセット（デバッグ用）
   */
  reset(): void {
    localStorage.removeItem(MetaProgression.STORAGE_KEY);
    this.data = this.loadFromStorage();
  }
}
