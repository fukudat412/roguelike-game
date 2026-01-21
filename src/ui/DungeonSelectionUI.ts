/**
 * ダンジョン選択UI
 * ゲーム開始時にダンジョンを選択
 */

import { DungeonType } from '@/world/DungeonType';
import { DUNGEON_CONFIGS } from '@/data/dungeonConfigs';
import { MetaProgression } from '@/character/MetaProgression';
import { MetaProgressionUI } from './MetaProgressionUI';

export class DungeonSelectionUI {
  private container: HTMLElement;
  private onSelect: (type: DungeonType) => void;
  private metaProgression: MetaProgression | null = null;
  private metaProgressionUI: MetaProgressionUI | null = null;
  private onUpgradePurchase: ((upgrade: any) => void) | null = null;

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
   * メタプログレッション設定
   */
  setMetaProgression(
    metaProgression: MetaProgression,
    metaProgressionUI: MetaProgressionUI,
    onUpgradePurchase: (upgrade: any) => void
  ): void {
    this.metaProgression = metaProgression;
    this.metaProgressionUI = metaProgressionUI;
    this.onUpgradePurchase = onUpgradePurchase;
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

    // 永続強化ボタン
    const metaBtn = document.createElement('button');
    metaBtn.id = 'meta-btn-dungeon';
    metaBtn.textContent = '⭐ 永続強化';
    metaBtn.addEventListener('click', () => this.openMetaProgression());
    this.container.appendChild(metaBtn);
  }

  /**
   * 永続強化を開く
   */
  private openMetaProgression(): void {
    if (this.metaProgression && this.metaProgressionUI && this.onUpgradePurchase) {
      this.metaProgressionUI.setMetaProgression(this.metaProgression, this.onUpgradePurchase);
      this.metaProgressionUI.open();
    }
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
      // ダンジョン選択画面を非表示
      this.hide();

      // ゲームコンテナを表示
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.classList.add('active');

        let initialized = false;
        const initializeGame = () => {
          if (!initialized) {
            initialized = true;
            console.log('ゲーム初期化開始');
            this.onSelect(type);
          }
        };

        // CSS transitionの完了を確実に待つ
        const handleTransitionEnd = (e: TransitionEvent) => {
          // opacity の transition のみを対象
          if (e.propertyName === 'opacity') {
            gameContainer.removeEventListener('transitionend', handleTransitionEnd as EventListener);
            console.log('Transition完了');
            initializeGame();
          }
        };

        gameContainer.addEventListener('transitionend', handleTransitionEnd as EventListener);

        // フォールバック: transitionが発火しない場合のための保険（500ms）
        setTimeout(() => {
          gameContainer.removeEventListener('transitionend', handleTransitionEnd as EventListener);
          console.log('タイムアウト、フォールバック');
          initializeGame();
        }, 500);
      }
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
