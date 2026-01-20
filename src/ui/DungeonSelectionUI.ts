/**
 * ダンジョン選択UI
 * ゲーム開始時にダンジョンを選択
 */

import { DungeonType } from '@/world/DungeonType';
import { DUNGEON_CONFIGS } from '@/data/dungeonConfigs';

export class DungeonSelectionUI {
  private container: HTMLElement;
  private onSelect: (type: DungeonType) => void;

  constructor(containerId: string, onSelect: (type: DungeonType) => void) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id ${containerId} not found`);
    }
    this.container = element;
    this.onSelect = onSelect;
    this.render();
  }

  /**
   * UIを描画
   */
  private render(): void {
    // 既存の子要素をクリア
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    // タイトル
    const title = document.createElement('h2');
    title.textContent = 'ダンジョンを選択してください';
    title.className = 'dungeon-selection-title';
    this.container.appendChild(title);

    // カードコンテナ
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'dungeon-cards';

    // 各ダンジョンのカードを作成
    for (const type of Object.values(DungeonType)) {
      const config = DUNGEON_CONFIGS[type];
      const card = this.createDungeonCard(type, config.metadata);
      cardsContainer.appendChild(card);
    }

    this.container.appendChild(cardsContainer);
  }

  /**
   * ダンジョンカードを作成
   */
  private createDungeonCard(
    type: DungeonType,
    metadata: { name: string; description: string; icon: string; color: string }
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = 'dungeon-card';
    card.style.borderColor = metadata.color;

    // アイコン
    const icon = document.createElement('div');
    icon.className = 'dungeon-icon';
    icon.textContent = metadata.icon;
    card.appendChild(icon);

    // 名前
    const name = document.createElement('div');
    name.className = 'dungeon-name';
    name.textContent = metadata.name;
    card.appendChild(name);

    // 説明
    const desc = document.createElement('div');
    desc.className = 'dungeon-description';
    desc.textContent = metadata.description;
    card.appendChild(desc);

    // クリックイベント
    card.addEventListener('click', () => {
      this.hide();
      this.onSelect(type);
    });

    return card;
  }

  /**
   * UIを表示
   */
  show(): void {
    this.container.style.display = 'flex';
  }

  /**
   * UIを非表示
   */
  hide(): void {
    this.container.style.display = 'none';
  }
}
