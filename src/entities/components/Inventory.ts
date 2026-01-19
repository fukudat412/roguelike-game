/**
 * インベントリコンポーネント
 * アイテムの所持・管理
 */

import { Item } from '../Item';
import { eventBus, GameEvents } from '@/core/EventBus';

export class Inventory {
  private items: Item[] = [];
  private maxSlots: number;

  constructor(maxSlots: number = 20) {
    this.maxSlots = maxSlots;
  }

  /**
   * アイテムを追加
   */
  addItem(item: Item): boolean {
    // スタック可能な場合、既存アイテムと結合
    if (item.stackable) {
      for (const existingItem of this.items) {
        if (existingItem.canStackWith(item)) {
          const added = existingItem.addToStack(item.stackCount);
          item.removeFromStack(added);

          if (item.stackCount === 0) {
            eventBus.emit(GameEvents.MESSAGE_LOG, {
              text: `${item.name}を拾った（x${added}）`,
              type: 'item',
            });
            return true;
          }
        }
      }
    }

    // 空きスロットに追加
    if (this.items.length < this.maxSlots) {
      this.items.push(item);
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: `${item.name}を拾った`,
        type: 'item',
      });
      return true;
    }

    // インベントリが満杯
    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: 'インベントリがいっぱいです',
      type: 'system',
    });
    return false;
  }

  /**
   * アイテムを削除
   */
  removeItem(item: Item): boolean {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * インデックスでアイテムを削除
   */
  removeItemAt(index: number): Item | null {
    if (index >= 0 && index < this.items.length) {
      const item = this.items[index];
      this.items.splice(index, 1);
      return item;
    }
    return null;
  }

  /**
   * アイテムを検索
   */
  findItem(name: string): Item | null {
    return this.items.find(item => item.name === name) || null;
  }

  /**
   * アイテムリストを取得
   */
  getItems(): Item[] {
    return [...this.items];
  }

  /**
   * アイテム数を取得
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * 満杯かチェック
   */
  isFull(): boolean {
    return this.items.length >= this.maxSlots;
  }

  /**
   * 空かチェック
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * 最大スロット数を取得
   */
  getMaxSlots(): number {
    return this.maxSlots;
  }

  /**
   * インデックスでアイテムを取得
   */
  getItemAt(index: number): Item | null {
    if (index >= 0 && index < this.items.length) {
      return this.items[index];
    }
    return null;
  }

  /**
   * 特定タイプのアイテム数を取得
   */
  countItemsByType(type: string): number {
    return this.items.filter(item => item.itemType === type).length;
  }

  /**
   * インベントリをクリア
   */
  clear(): void {
    this.items = [];
  }
}
