/**
 * セーブデータ管理
 * LocalStorageを使用してゲーム状態を保存/読み込み
 */

import { Logger } from './Logger';

export interface GameSaveData {
  version: string;
  timestamp: number;
  player: {
    position: { x: number; y: number };
    level: number;
    experience: number;
    experienceToNextLevel: number;
    gold: number;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    inventory: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      rarity: string;
      stackable: boolean;
      stackCount: number;
    }>;
    equipment: {
      weapon: string | null;
      armor: string | null;
      accessory: string | null;
    };
  };
  world: {
    currentFloor: number;
  };
}

export class SaveManager {
  private static SAVE_KEY = 'roguelike-save-v1';

  /**
   * セーブデータの検証
   */
  private static validateSaveData(data: any): data is GameSaveData {
    // 基本構造のチェック
    if (typeof data !== 'object' || data === null) return false;

    // バージョンとタイムスタンプ
    if (typeof data.version !== 'string') return false;
    if (typeof data.timestamp !== 'number') return false;

    // プレイヤーデータ
    if (typeof data.player !== 'object' || data.player === null) return false;
    if (typeof data.player.position !== 'object') return false;
    if (typeof data.player.position.x !== 'number') return false;
    if (typeof data.player.position.y !== 'number') return false;
    if (typeof data.player.level !== 'number') return false;
    if (typeof data.player.experience !== 'number') return false;
    if (typeof data.player.experienceToNextLevel !== 'number') return false;
    if (typeof data.player.gold !== 'number') return false;
    if (typeof data.player.hp !== 'number') return false;
    if (typeof data.player.maxHp !== 'number') return false;
    if (typeof data.player.attack !== 'number') return false;
    if (typeof data.player.defense !== 'number') return false;
    if (typeof data.player.speed !== 'number') return false;

    // インベントリ
    if (!Array.isArray(data.player.inventory)) return false;

    // 装備
    if (typeof data.player.equipment !== 'object') return false;

    // ワールド
    if (typeof data.world !== 'object' || data.world === null) return false;
    if (typeof data.world.currentFloor !== 'number') return false;

    // 数値の範囲チェック（異常値を防ぐ）
    if (data.player.level < 1 || data.player.level > 1000) return false;
    if (data.player.gold < 0 || data.player.gold > 999999999) return false;
    if (data.player.hp < 0 || data.player.hp > data.player.maxHp) return false;
    if (data.world.currentFloor < 1 || data.world.currentFloor > 1000) return false;

    return true;
  }

  /**
   * ゲームデータを保存
   */
  static save(data: GameSaveData): boolean {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.SAVE_KEY, json);
      return true;
    } catch (error) {
      Logger.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * ゲームデータを読み込み
   */
  static load(): GameSaveData | null {
    try {
      const json = localStorage.getItem(this.SAVE_KEY);
      if (!json) return null;

      const data = JSON.parse(json);

      // データ検証
      if (!this.validateSaveData(data)) {
        Logger.error('Invalid save data detected. Save data may be corrupted or tampered.');
        return null;
      }

      return data;
    } catch (error) {
      Logger.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * セーブデータを削除
   */
  static deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  /**
   * セーブデータが存在するかチェック
   */
  static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * セーブデータの情報を取得
   */
  static getSaveInfo(): { timestamp: number; floor: number } | null {
    const data = this.load();
    if (!data) return null;

    return {
      timestamp: data.timestamp,
      floor: data.world.currentFloor,
    };
  }
}
