/**
 * 店システム
 * NPCから装備やアイテムを購入
 */

import { Entity, EntityType } from './Entity';
import { Item } from './Item';
import { rollRandomItem } from '@/data/items';

export class Shop extends Entity {
  public inventory: Item[] = [];
  public gold: number = 1000;

  constructor(x: number, y: number) {
    super(
      '商人',
      EntityType.STAIRS, // 仮でSTAIRS使用
      x,
      y,
      {
        char: '$',
        color: '#ffd700',
      }
    );

    this.blocksMovement = true;
    this.generateInventory();
  }

  /**
   * 更新処理
   */
  update(deltaTime: number): void {
    // 商人は動かない
  }

  /**
   * 在庫を生成
   */
  private generateInventory(): void {
    const itemCount = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < itemCount; i++) {
      const itemData = rollRandomItem();
      const item = new Item(0, 0, itemData);
      this.inventory.push(item);
    }
  }

  /**
   * アイテムを購入
   */
  buyItem(item: Item, playerGold: number): { success: boolean; message: string } {
    const price = this.getItemPrice(item);

    if (playerGold < price) {
      return {
        success: false,
        message: 'ゴールドが足りません',
      };
    }

    const index = this.inventory.indexOf(item);
    if (index === -1) {
      return {
        success: false,
        message: 'アイテムが見つかりません',
      };
    }

    this.inventory.splice(index, 1);
    this.gold += price;

    return {
      success: true,
      message: `${item.name}を${price}ゴールドで購入した`,
    };
  }

  /**
   * アイテムを売却
   */
  sellItem(item: Item): number {
    const price = Math.floor(this.getItemPrice(item) * 0.5);
    this.inventory.push(item);
    this.gold -= price;
    return price;
  }

  /**
   * アイテムの価格を計算
   */
  getItemPrice(item: Item): number {
    let basePrice = 10;

    // レア度による価格
    switch (item.rarity) {
      case 'COMMON':
        basePrice = 10;
        break;
      case 'UNCOMMON':
        basePrice = 50;
        break;
      case 'RARE':
        basePrice = 150;
        break;
      case 'EPIC':
        basePrice = 500;
        break;
      case 'LEGENDARY':
        basePrice = 2000;
        break;
    }

    // アイテムタイプによる調整
    if (item.itemType === 'EQUIPMENT') {
      basePrice *= 2;
    }

    return basePrice;
  }

  /**
   * 在庫をリフレッシュ
   */
  refreshInventory(): void {
    this.inventory = [];
    this.generateInventory();
  }
}
