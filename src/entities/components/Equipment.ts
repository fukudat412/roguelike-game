/**
 * 装備コンポーネント
 * 装備スロットと装備品を管理
 */

import { Item } from '../Item';

export enum EquipmentSlot {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ACCESSORY = 'ACCESSORY',
}

export interface EquipmentStats {
  attack: number;
  defense: number;
  speed: number;
}

export interface EquipmentBonus {
  slot: EquipmentSlot;
  attack?: number;
  defense?: number;
  speed?: number;
  maxHp?: number;
}

export class Equipment {
  private slots: Map<EquipmentSlot, Item | null> = new Map();

  constructor() {
    // スロットを初期化
    this.slots.set(EquipmentSlot.WEAPON, null);
    this.slots.set(EquipmentSlot.ARMOR, null);
    this.slots.set(EquipmentSlot.ACCESSORY, null);
  }

  /**
   * 装備を装着
   */
  equip(slot: EquipmentSlot, item: Item): Item | null {
    const previousItem = this.slots.get(slot) || null;
    this.slots.set(slot, item);
    return previousItem;
  }

  /**
   * 装備を解除
   */
  unequip(slot: EquipmentSlot): Item | null {
    const item = this.slots.get(slot) || null;
    this.slots.set(slot, null);
    return item;
  }

  /**
   * スロットのアイテムを取得
   */
  getEquipped(slot: EquipmentSlot): Item | null {
    return this.slots.get(slot) || null;
  }

  /**
   * すべての装備を取得
   */
  getAllEquipped(): Map<EquipmentSlot, Item | null> {
    return new Map(this.slots);
  }

  /**
   * 装備が空いているかチェック
   */
  isEmpty(slot: EquipmentSlot): boolean {
    return this.slots.get(slot) === null;
  }

  /**
   * 装備の合計ボーナスを計算
   */
  getTotalBonus(): EquipmentStats {
    const bonus: EquipmentStats = {
      attack: 0,
      defense: 0,
      speed: 0,
    };

    for (const [slot, item] of this.slots) {
      if (item) {
        const itemBonus = this.getItemBonus(item);
        bonus.attack += itemBonus.attack || 0;
        bonus.defense += itemBonus.defense || 0;
        bonus.speed += itemBonus.speed || 0;
      }
    }

    return bonus;
  }

  /**
   * アイテムからボーナスを取得
   */
  private getItemBonus(item: Item): Partial<EquipmentStats> {
    // 説明文から数値を抽出（簡易版）
    const desc = item.description;
    const bonus: Partial<EquipmentStats> = {};

    const attackMatch = desc.match(/攻撃力\+(\d+)/);
    if (attackMatch) {
      bonus.attack = parseInt(attackMatch[1]);
    }

    const defenseMatch = desc.match(/防御力\+(\d+)/);
    if (defenseMatch) {
      bonus.defense = parseInt(defenseMatch[1]);
    }

    const speedMatch = desc.match(/速度\+(\d+)/);
    if (speedMatch) {
      bonus.speed = parseInt(speedMatch[1]);
    }

    return bonus;
  }

  /**
   * アイテムに対応するスロットを取得
   */
  static getSlotForItem(item: Item): EquipmentSlot | null {
    const name = item.name.toLowerCase();

    if (name.includes('剣') || name.includes('武器')) {
      return EquipmentSlot.WEAPON;
    }

    if (name.includes('鎧') || name.includes('アーマー') || name.includes('メイル')) {
      return EquipmentSlot.ARMOR;
    }

    if (name.includes('指輪') || name.includes('アミュレット') || name.includes('アクセサリー')) {
      return EquipmentSlot.ACCESSORY;
    }

    return null;
  }
}
