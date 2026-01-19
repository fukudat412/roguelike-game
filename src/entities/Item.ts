/**
 * アイテムエンティティ
 * 拾える、使える、装備できるアイテム
 */

import { Entity, EntityType, RenderInfo } from './Entity';

export enum ItemType {
  CONSUMABLE = 'CONSUMABLE',
  EQUIPMENT = 'EQUIPMENT',
  QUEST = 'QUEST',
  MATERIAL = 'MATERIAL',
}

export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  renderInfo: RenderInfo;
}

export class Item extends Entity {
  public itemType: ItemType;
  public rarity: ItemRarity;
  public stackable: boolean;
  public maxStack: number;
  public stackCount: number = 1;
  public description: string;

  constructor(x: number, y: number, data: ItemData) {
    super(data.name, EntityType.ITEM, x, y, data.renderInfo);

    this.itemType = data.type;
    this.rarity = data.rarity;
    this.stackable = data.stackable;
    this.maxStack = data.maxStack;
    this.description = data.description;
    this.blocksMovement = false;
  }

  /**
   * 更新処理（アイテムは更新なし）
   */
  update(deltaTime: number): void {
    // アイテムは静的
  }

  /**
   * スタック可能かチェック
   */
  canStackWith(other: Item): boolean {
    return (
      this.stackable &&
      this.name === other.name &&
      this.stackCount + other.stackCount <= this.maxStack
    );
  }

  /**
   * スタックを追加
   */
  addToStack(amount: number): number {
    const space = this.maxStack - this.stackCount;
    const added = Math.min(amount, space);
    this.stackCount += added;
    return added;
  }

  /**
   * スタックから削除
   */
  removeFromStack(amount: number): number {
    const removed = Math.min(amount, this.stackCount);
    this.stackCount -= removed;
    return removed;
  }

  /**
   * レア度カラー取得
   */
  getRarityColor(): string {
    switch (this.rarity) {
      case ItemRarity.COMMON:
        return '#ffffff';
      case ItemRarity.UNCOMMON:
        return '#00ff00';
      case ItemRarity.RARE:
        return '#0080ff';
      case ItemRarity.EPIC:
        return '#a335ee';
      case ItemRarity.LEGENDARY:
        return '#ff8000';
      default:
        return '#ffffff';
    }
  }

  /**
   * アイテム情報を取得
   */
  getInfo(): string {
    let info = `${this.name}\n`;
    info += `${this.description}\n`;
    info += `レア度: ${this.rarity}`;

    if (this.stackable) {
      info += `\nスタック: ${this.stackCount}/${this.maxStack}`;
    }

    return info;
  }
}
