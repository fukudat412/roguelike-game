/**
 * 拡張セーブマネージャー
 * ゲーム状態を完全に保存・復元する
 */

import { Vector2D } from '@/utils/Vector2D';
import { StatusEffectType } from '@/combat/StatusEffect';
import { ItemRarity } from '@/entities/Item';

/**
 * 完全なセーブデータ構造
 */
export interface CompleteSaveData {
  version: string;
  timestamp: number;
  saveSlot: number;

  // プレイヤー状態
  player: {
    position: { x: number; y: number };
    level: number;
    experience: number;
    experienceToNextLevel: number;
    gold: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
    skillPoints: number;

    // ステータス効果
    statusEffects: Array<{
      type: StatusEffectType;
      turnsRemaining: number;
    }>;

    // スキル
    skills: Array<{
      name: string;
      currentCooldown: number;
    }>;

    // インベントリ
    inventory: Array<{
      id: string;
      name: string;
      description: string;
      itemType: string;
      rarity: ItemRarity;
      stackable: boolean;
      stackCount: number;
      equipmentSlot?: string;
      bonuses?: any;
    }>;

    // 装備
    equipment: {
      weapon: any | null;
      armor: any | null;
      accessory: any | null;
    };
  };

  // ワールド状態
  world: {
    dungeonType: string;
    currentFloor: number;
  };

  // マップ状態
  map: {
    width: number;
    height: number;
    cells: Array<{
      x: number;
      y: number;
      tileType: string;
      explored: boolean;
    }>;
  };

  // エンティティ状態
  entities: {
    enemies: Array<{
      x: number;
      y: number;
      name: string;
      hp: number;
      maxHp: number;
      attack: number;
      defense: number;
      speed: number;
      experienceValue: number;
      isBoss: boolean;
      isElite: boolean;
    }>;
    items: Array<{
      x: number;
      y: number;
      id: string;
      name: string;
      description: string;
      itemType: string;
      rarity: ItemRarity;
      stackable: boolean;
      stackCount: number;
    }>;
    stairs: { x: number; y: number; direction: string; targetFloor: number } | null;
    shop: {
      x: number;
      y: number;
      inventory: Array<{
        id: string;
        name: string;
        description: string;
        itemType: string;
        rarity: ItemRarity;
        price: number;
      }>;
    } | null;
    chests: Array<{
      x: number;
      y: number;
      type: string;
      isOpened: boolean;
    }>;
  };

  // ゲーム統計（現在のラン）
  statistics: {
    enemiesKilled: number;
    itemsCollected: number;
    goldEarned: number;
    bossesDefeated: number;
    chestsOpened: number;
    turnsPlayed: number;
  };

  // メタプログレッションチェックサム
  metaProgressionChecksum: string;
}

/**
 * セーブ情報（一覧表示用）
 */
export interface SaveInfo {
  slot: number;
  exists: boolean;
  timestamp?: number;
  floor?: number;
  dungeonType?: string;
  playerLevel?: number;
  playerHp?: number;
  playerMaxHp?: number;
}

/**
 * 拡張セーブマネージャー
 */
export class EnhancedSaveManager {
  private static readonly SAVE_KEY_PREFIX = 'roguelike_save_v2_';
  private static readonly AUTO_SAVE_SLOT = 0; // スロット0をオートセーブ専用に
  private static readonly MAX_SLOTS = 1; // パーマデス維持のため1スロットのみ

  /**
   * ゲームをセーブ
   */
  static save(gameData: any, slot: number = 0): boolean {
    try {
      const saveData = this.createSaveData(gameData, slot);
      const key = `${this.SAVE_KEY_PREFIX}slot_${slot}`;

      localStorage.setItem(key, JSON.stringify(saveData));
      console.log(`✅ セーブ完了: スロット${slot}`);

      return true;
    } catch (error) {
      console.error('❌ セーブ失敗:', error);
      return false;
    }
  }

  /**
   * ゲームをロード
   */
  static load(slot: number = 0): CompleteSaveData | null {
    try {
      const key = `${this.SAVE_KEY_PREFIX}slot_${slot}`;
      const data = localStorage.getItem(key);

      if (!data) {
        console.log(`ℹ️ スロット${slot}にセーブデータがありません`);
        return null;
      }

      const saveData = JSON.parse(data) as CompleteSaveData;

      // バージョンチェック
      if (saveData.version !== '2.0') {
        console.warn('⚠️ セーブデータのバージョンが古いです');
      }

      // メタプログレッションの整合性チェック
      const currentChecksum = this.getMetaChecksum();
      if (saveData.metaProgressionChecksum !== currentChecksum) {
        console.warn('⚠️ メタプログレッションが変更されています');
      }

      console.log(`✅ ロード完了: スロット${slot}`);
      return saveData;
    } catch (error) {
      console.error('❌ ロード失敗:', error);
      return null;
    }
  }

  /**
   * セーブデータを削除
   */
  static deleteSave(slot: number): void {
    const key = `${this.SAVE_KEY_PREFIX}slot_${slot}`;
    localStorage.removeItem(key);
    console.log(`🗑️ セーブデータ削除: スロット${slot}`);
  }

  /**
   * 全セーブスロットの情報を取得
   */
  static listSaves(): SaveInfo[] {
    const saves: SaveInfo[] = [];

    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const saveData = this.load(i);

      if (saveData) {
        saves.push({
          slot: i,
          exists: true,
          timestamp: saveData.timestamp,
          floor: saveData.world.currentFloor,
          dungeonType: saveData.world.dungeonType,
          playerLevel: saveData.player.level,
          playerHp: saveData.player.hp,
          playerMaxHp: saveData.player.maxHp,
        });
      } else {
        saves.push({
          slot: i,
          exists: false,
        });
      }
    }

    return saves;
  }

  /**
   * セーブデータが存在するかチェック
   */
  static hasSave(slot: number = 0): boolean {
    const key = `${this.SAVE_KEY_PREFIX}slot_${slot}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * セーブデータを作成
   */
  private static createSaveData(gameData: any, slot: number): CompleteSaveData {
    return {
      version: '2.0',
      timestamp: Date.now(),
      saveSlot: slot,

      player: {
        position: {
          x: gameData.player.position.x,
          y: gameData.player.position.y,
        },
        level: gameData.player.level,
        experience: gameData.player.experience,
        experienceToNextLevel: gameData.player.experienceToNextLevel,
        gold: gameData.player.gold,
        hp: gameData.player.hp,
        maxHp: gameData.player.maxHp,
        mp: gameData.player.mp,
        maxMp: gameData.player.maxMp,
        attack: gameData.player.attack,
        defense: gameData.player.defense,
        speed: gameData.player.speed,
        skillPoints: gameData.player.skillPoints,
        statusEffects: gameData.player.statusEffects,
        skills: gameData.player.skills,
        inventory: gameData.player.inventory,
        equipment: gameData.player.equipment,
      },

      world: {
        dungeonType: gameData.world.dungeonType,
        currentFloor: gameData.world.currentFloor,
      },

      map: {
        width: gameData.map.width,
        height: gameData.map.height,
        cells: gameData.map.cells,
      },

      entities: {
        enemies: gameData.entities.enemies,
        items: gameData.entities.items,
        stairs: gameData.entities.stairs,
        shop: gameData.entities.shop,
        chests: gameData.entities.chests,
      },

      statistics: gameData.statistics,

      metaProgressionChecksum: this.getMetaChecksum(),
    };
  }

  /**
   * メタプログレッションのチェックサムを取得
   */
  private static getMetaChecksum(): string {
    try {
      const meta = localStorage.getItem('roguelike_meta_progression_v2');
      if (!meta) return 'NONE';

      // 簡易的なチェックサム（SP合計値を使用）
      const data = JSON.parse(meta);
      return `SP${data.soulPoints}_LSP${data.lifetimeSoulPoints}`;
    } catch {
      return 'ERROR';
    }
  }

  /**
   * セーブデータのサイズを取得（デバッグ用）
   */
  static getSaveSize(slot: number = 0): number {
    const key = `${this.SAVE_KEY_PREFIX}slot_${slot}`;
    const data = localStorage.getItem(key);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * 全セーブデータをクリア（デバッグ用）
   */
  static clearAllSaves(): void {
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      this.deleteSave(i);
    }
    console.log('🗑️ 全セーブデータを削除しました');
  }
}
