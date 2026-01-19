/**
 * 入力管理システム
 * キーボード入力を処理し、ゲームアクションにマッピング
 */

import { Vector2D } from '@/utils/Vector2D';

export enum Action {
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  WAIT = 'WAIT',
  PICKUP = 'PICKUP',
  INVENTORY = 'INVENTORY',
  USE = 'USE',
  DROP = 'DROP',
  STAIRS = 'STAIRS',
  SHOP = 'SHOP',
  CANCEL = 'CANCEL',
}

export class Input {
  private keysPressed: Set<string> = new Set();
  private keyMap: Map<string, Action> = new Map();
  private actionQueue: Action[] = [];

  constructor() {
    this.setupDefaultKeyBindings();
    this.attachEventListeners();
  }

  /**
   * デフォルトのキーバインディング設定
   */
  private setupDefaultKeyBindings(): void {
    // WASD
    this.keyMap.set('w', Action.MOVE_UP);
    this.keyMap.set('s', Action.MOVE_DOWN);
    this.keyMap.set('a', Action.MOVE_LEFT);
    this.keyMap.set('d', Action.MOVE_RIGHT);

    // 矢印キー
    this.keyMap.set('ArrowUp', Action.MOVE_UP);
    this.keyMap.set('ArrowDown', Action.MOVE_DOWN);
    this.keyMap.set('ArrowLeft', Action.MOVE_LEFT);
    this.keyMap.set('ArrowRight', Action.MOVE_RIGHT);

    // テンキー
    this.keyMap.set('8', Action.MOVE_UP);
    this.keyMap.set('2', Action.MOVE_DOWN);
    this.keyMap.set('4', Action.MOVE_LEFT);
    this.keyMap.set('6', Action.MOVE_RIGHT);

    // その他
    this.keyMap.set(' ', Action.WAIT);
    this.keyMap.set('g', Action.PICKUP);
    this.keyMap.set('i', Action.INVENTORY);
    this.keyMap.set('u', Action.USE);
    this.keyMap.set('q', Action.DROP);
    this.keyMap.set('>', Action.STAIRS);
    this.keyMap.set('t', Action.SHOP);
    this.keyMap.set('Escape', Action.CANCEL);
  }

  /**
   * イベントリスナーをアタッチ
   */
  private attachEventListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  /**
   * キー押下イベント処理
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // すでに押されている場合は無視（リピート防止）
    if (this.keysPressed.has(key)) return;

    this.keysPressed.add(key);

    const action = this.keyMap.get(event.key) || this.keyMap.get(key);
    if (action) {
      event.preventDefault();
      this.actionQueue.push(action);
    }
  }

  /**
   * キー解放イベント処理
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.keysPressed.delete(key);
  }

  /**
   * アクションキューから次のアクションを取得
   */
  getNextAction(): Action | null {
    return this.actionQueue.shift() || null;
  }

  /**
   * アクションキューをクリア
   */
  clearActionQueue(): void {
    this.actionQueue = [];
  }

  /**
   * 特定のキーが押されているかチェック
   */
  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }

  /**
   * アクションを移動ベクトルに変換
   */
  static actionToDirection(action: Action): Vector2D | null {
    switch (action) {
      case Action.MOVE_UP:
        return Vector2D.UP;
      case Action.MOVE_DOWN:
        return Vector2D.DOWN;
      case Action.MOVE_LEFT:
        return Vector2D.LEFT;
      case Action.MOVE_RIGHT:
        return Vector2D.RIGHT;
      default:
        return null;
    }
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.keysPressed.clear();
    this.actionQueue = [];
  }
}
