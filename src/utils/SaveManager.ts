/**
 * セーブデータ管理
 * LocalStorageを使用してゲーム状態を保存/読み込み
 */

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
   * ゲームデータを保存
   */
  static save(data: GameSaveData): boolean {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(this.SAVE_KEY, json);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
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

      const data = JSON.parse(json) as GameSaveData;
      return data;
    } catch (error) {
      console.error('Failed to load game:', error);
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
