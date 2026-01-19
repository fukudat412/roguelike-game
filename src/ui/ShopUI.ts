/**
 * 店UIマネージャー
 * 商人との取引UI
 */

import { Shop } from '@/entities/Shop';
import { Item, ItemRarity } from '@/entities/Item';

export class ShopUI {
  private panel: HTMLElement | null;
  private listElement: HTMLElement | null;
  private buyButton: HTMLButtonElement | null;
  private closeButton: HTMLButtonElement | null;
  private goldDisplay: HTMLElement | null;

  private shop: Shop | null = null;
  private playerGold: number = 0;
  private selectedIndex: number = -1;
  private isOpen: boolean = false;

  private onBuyCallback: ((item: Item) => void) | null = null;

  constructor() {
    this.panel = document.getElementById('shop-panel');
    this.listElement = document.getElementById('shop-list');
    this.buyButton = document.getElementById('buy-item-btn') as HTMLButtonElement;
    this.closeButton = document.getElementById('close-shop-btn') as HTMLButtonElement;
    this.goldDisplay = document.getElementById('shop-gold-display');

    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    if (this.buyButton) {
      this.buyButton.addEventListener('click', () => this.buySelectedItem());
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    // ESCキーで閉じる
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });
  }

  /**
   * 店とプレイヤーゴールドを設定
   */
  setShop(shop: Shop, playerGold: number): void {
    this.shop = shop;
    this.playerGold = playerGold;
    this.selectedIndex = -1;
  }

  /**
   * コールバックを設定
   */
  setCallback(onBuy: (item: Item) => void): void {
    this.onBuyCallback = onBuy;
  }

  /**
   * 店を開く
   */
  open(): void {
    if (!this.shop || !this.panel) return;

    this.panel.style.display = 'block';
    this.isOpen = true;
    this.render();
  }

  /**
   * 店を閉じる
   */
  close(): void {
    if (!this.panel) return;

    this.panel.style.display = 'none';
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  /**
   * 店が開いているかチェック
   */
  isShopOpen(): boolean {
    return this.isOpen;
  }

  /**
   * 店を描画
   */
  private render(): void {
    if (!this.shop || !this.listElement || !this.goldDisplay) return;

    this.listElement.textContent = '';

    // プレイヤーのゴールド表示
    this.goldDisplay.textContent = `所持金: ${this.playerGold}G`;

    const items = this.shop.inventory;

    if (items.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.textContent = '商品がありません';
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.padding = '20px';
      emptyDiv.style.color = '#888';
      this.listElement!.appendChild(emptyDiv);
      this.updateButtons();
      return;
    }

    items.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'shop-item';

      if (index === this.selectedIndex) {
        itemDiv.classList.add('selected');
      }

      const rarityClass = `item-${item.rarity.toLowerCase()}`;

      const leftDiv = document.createElement('div');
      leftDiv.style.flex = '1';

      const nameSpan = document.createElement('span');
      nameSpan.className = `item-name ${rarityClass}`;
      nameSpan.textContent = item.name;

      const descSpan = document.createElement('span');
      descSpan.textContent = item.description;
      descSpan.style.fontSize = '12px';
      descSpan.style.color = '#aaa';

      leftDiv.appendChild(nameSpan);
      leftDiv.appendChild(document.createElement('br'));
      leftDiv.appendChild(descSpan);

      const priceDiv = document.createElement('div');
      priceDiv.className = 'shop-price';
      const price = this.shop!.getItemPrice(item);
      priceDiv.textContent = `${price}G`;

      // 購入不可能な場合は赤く表示
      if (price > this.playerGold) {
        priceDiv.style.color = '#ff4444';
      }

      itemDiv.appendChild(leftDiv);
      itemDiv.appendChild(priceDiv);

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
   * 選択されたアイテムを購入
   */
  private buySelectedItem(): void {
    if (!this.shop || this.selectedIndex === -1) return;

    const item = this.shop.inventory[this.selectedIndex];
    if (!item) return;

    if (this.onBuyCallback) {
      this.onBuyCallback(item);
    }
  }

  /**
   * ボタンの状態を更新
   */
  private updateButtons(): void {
    if (!this.buyButton || !this.shop) return;

    const canBuy = this.selectedIndex !== -1 && this.shop.inventory.length > 0;
    this.buyButton.disabled = !canBuy;

    // 購入不可能な場合も無効化
    if (canBuy) {
      const item = this.shop.inventory[this.selectedIndex];
      const price = this.shop.getItemPrice(item);
      this.buyButton.disabled = price > this.playerGold;
    }
  }

  /**
   * プレイヤーゴールドを更新
   */
  updatePlayerGold(gold: number): void {
    this.playerGold = gold;
    this.render();
  }
}
