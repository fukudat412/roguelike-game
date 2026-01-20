/**
 * 宝箱エンティティ
 * アイテムを格納する宝箱
 */

import { Entity, EntityType } from './Entity';
import { ItemRarity } from './Item';

export enum ChestType {
  WOODEN = 'WOODEN',
  IRON = 'IRON',
  GOLDEN = 'GOLDEN',
  TRAPPED = 'TRAPPED',
}

export interface ChestTemplate {
  type: ChestType;
  name: string;
  char: string;
  color: string;
  minRarity: ItemRarity;
  maxRarity: ItemRarity;
  itemCount: number; // 中身のアイテム数
  trapChance: number; // 罠の確率
  trapDamage: number; // 罠のダメージ
}

export class Chest extends Entity {
  public chestType: ChestType;
  public isOpened: boolean = false;
  public template: ChestTemplate;

  constructor(x: number, y: number, template: ChestTemplate) {
    super(
      template.name,
      EntityType.ITEM,
      x,
      y,
      {
        char: template.char,
        color: template.color,
      }
    );

    this.chestType = template.type;
    this.template = template;
  }

  /**
   * 更新処理
   */
  update(deltaTime: number): void {
    // 宝箱は自動更新しない
  }

  /**
   * 宝箱を開ける
   */
  open(): void {
    this.isOpened = true;
  }
}

// 宝箱テンプレート
export const ChestTemplates: Record<ChestType, ChestTemplate> = {
  [ChestType.WOODEN]: {
    type: ChestType.WOODEN,
    name: '木の宝箱',
    char: '□',
    color: '#8b7355',
    minRarity: ItemRarity.COMMON,
    maxRarity: ItemRarity.UNCOMMON,
    itemCount: 2,
    trapChance: 0.0,
    trapDamage: 0,
  },

  [ChestType.IRON]: {
    type: ChestType.IRON,
    name: '鉄の宝箱',
    char: '□',
    color: '#a0a0a0',
    minRarity: ItemRarity.UNCOMMON,
    maxRarity: ItemRarity.RARE,
    itemCount: 3,
    trapChance: 0.0,
    trapDamage: 0,
  },

  [ChestType.GOLDEN]: {
    type: ChestType.GOLDEN,
    name: '黄金の宝箱',
    char: '□',
    color: '#ffd700',
    minRarity: ItemRarity.RARE,
    maxRarity: ItemRarity.LEGENDARY,
    itemCount: 4,
    trapChance: 0.0,
    trapDamage: 0,
  },

  [ChestType.TRAPPED]: {
    type: ChestType.TRAPPED,
    name: '罠の宝箱',
    char: '□',
    color: '#ff4444',
    minRarity: ItemRarity.UNCOMMON,
    maxRarity: ItemRarity.EPIC,
    itemCount: 3,
    trapChance: 1.0,
    trapDamage: 20,
  },
};
