/**
 * インベントリUIマネージャー
 * インベントリの表示と操作
 */

import { Inventory } from '@/entities/components/Inventory';
import { Item, ItemRarity } from '@/entities/Item';

export class InventoryUI {
  private panel: HTMLElement | null;
  private listElement: HTMLElement | null;
  private useButton: HTMLButtonElement | null;
  private dropButton: HTMLButtonElement | null;
  private closeButton: HTMLButtonElement | null;

  private inventory: Inventory | null = null;
  private selectedIndex: number = -1;
  private isOpen: boolean = false;

  private onUseCallback: ((item: Item) => void) | null = null;
  private onDropCallback: ((item: Item) => void) | null = null;

  constructor() {
    this.panel = document.getElementById('inventory-panel');
    this.listElement = document.getElementById('inventory-list');
    this.useButton = document.getElementById('use-item-btn') as HTMLButtonElement;
    this.dropButton = document.getElementById('drop-item-btn') as HTMLButtonElement;
    this.closeButton = document.getElementById('close-inventory-btn') as HTMLButtonElement;

    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    if (this.useButton) {
      this.useButton.addEventListener('click', () => this.useSelectedItem());
    }

    if (this.dropButton) {
      this.dropButton.addEventListener('click', () => this.dropSelectedItem());
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }
  }

  /**
   * インベントリを設定
   */
  setInventory(inventory: Inventory): void {
    this.inventory = inventory;
  }

  /**
   * コールバックを設定
   */
  setCallbacks(onUse: (item: Item) => void, onDrop: (item: Item) => void): void {
    this.onUseCallback = onUse;
    this.onDropCallback = onDrop;
  }

  /**
   * インベントリを開く
   */
  open(): void {
    if (!this.inventory || !this.panel) return;

    this.isOpen = true;
    this.panel.style.display = 'block';
    this.render();
  }

  /**
   * インベントリを閉じる
   */
  close(): void {
    if (!this.panel) return;

    this.isOpen = false;
    this.selectedIndex = -1;
    this.panel.style.display = 'none';
  }

  /**
   * 開いているかチェック
   */
  isOpened(): boolean {
    return this.isOpen;
  }

  /**
   * トグル
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * インベントリを描画
   */
  private render(): void {
    if (!this.inventory || !this.listElement) return;

    this.listElement.textContent = '';

    const items = this.inventory.getItems();

    if (items.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.textContent = 'インベントリは空です';
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.padding = '20px';
      emptyDiv.style.color = '#888';
      this.listElement!.appendChild(emptyDiv);
      this.updateButtons();
      return;
    }

    items.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'inventory-item';

      if (index === this.selectedIndex) {
        itemDiv.classList.add('selected');
      }

      const rarityClass = `item-${item.rarity.toLowerCase()}`;

      const nameSpan = document.createElement('span');
      nameSpan.className = `item-name ${rarityClass}`;
      nameSpan.textContent = item.name;

      if (item.stackable && item.stackCount > 1) {
        nameSpan.textContent += ` (x${item.stackCount})`;
      }

      const descSpan = document.createElement('span');
      descSpan.textContent = item.description;
      descSpan.style.fontSize = '12px';
      descSpan.style.color = '#aaa';

      const leftDiv = document.createElement('div');
      leftDiv.appendChild(nameSpan);
      leftDiv.appendChild(document.createElement('br'));
      leftDiv.appendChild(descSpan);

      itemDiv.appendChild(leftDiv);

      itemDiv.addEventListener('click', () => {
        this.selectItem(index);
      });

      this.listElement!.appendChild(itemDiv);
    });

    this.updateButtons();
  }

  /**
   * アイテムを選択
   */
  private selectItem(index: number): void {
    this.selectedIndex = index;
    this.render();
  }

  /**
   * 選択中のアイテムを使用
   */
  private useSelectedItem(): void {
    if (!this.inventory || this.selectedIndex < 0) return;

    const item = this.inventory.getItemAt(this.selectedIndex);
    if (!item) return;

    if (this.onUseCallback) {
      this.onUseCallback(item);
    }

    this.render();
  }

  /**
   * 選択中のアイテムを捨てる
   */
  private dropSelectedItem(): void {
    if (!this.inventory || this.selectedIndex < 0) return;

    const item = this.inventory.getItemAt(this.selectedIndex);
    if (!item) return;

    if (this.onDropCallback) {
      this.onDropCallback(item);
    }

    if (this.selectedIndex >= this.inventory.getItemCount()) {
      this.selectedIndex = this.inventory.getItemCount() - 1;
    }

    this.render();
  }

  /**
   * ボタンの有効/無効を更新
   */
  private updateButtons(): void {
    const hasSelection = this.selectedIndex >= 0;

    if (this.useButton) {
      this.useButton.disabled = !hasSelection;
    }

    if (this.dropButton) {
      this.dropButton.disabled = !hasSelection;
    }
  }

  /**
   * 選択をクリア
   */
  clearSelection(): void {
    this.selectedIndex = -1;
    this.render();
  }
}
