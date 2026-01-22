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
  SKILL_1 = 'SKILL_1',
  SKILL_2 = 'SKILL_2',
  SKILL_3 = 'SKILL_3',
  SKILL_4 = 'SKILL_4',
  SKILL_5 = 'SKILL_5',
  SKILL_6 = 'SKILL_6',
  SKILL_7 = 'SKILL_7',
  SKILL_8 = 'SKILL_8',
  META_PROGRESSION = 'META_PROGRESSION',
  SKILL_SELECTION = 'SKILL_SELECTION',
  RETURN_TO_MENU = 'RETURN_TO_MENU',
}

export class Input {
  private keysPressed: Set<string> = new Set();
  private keyMap: Map<string, Action> = new Map();
  private actionQueue: Action[] = [];

  // イベントハンドラの参照を保持
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyupHandler: ((e: KeyboardEvent) => void) | null = null;

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
    this.keyMap.set('.', Action.STAIRS); // より入力しやすいキー
    this.keyMap.set('Enter', Action.STAIRS); // Enterキーでも階段を使える
    this.keyMap.set('t', Action.SHOP);
    this.keyMap.set('Escape', Action.CANCEL);

    // スキル
    this.keyMap.set('1', Action.SKILL_1);
    this.keyMap.set('3', Action.SKILL_2);
    this.keyMap.set('5', Action.SKILL_3);
    this.keyMap.set('7', Action.SKILL_4);
    this.keyMap.set('9', Action.SKILL_5);
    this.keyMap.set('q', Action.SKILL_6);
    this.keyMap.set('e', Action.SKILL_7);
    this.keyMap.set('r', Action.SKILL_8);

    // メタプログレッション
    this.keyMap.set('m', Action.META_PROGRESSION);

    // スキル選択
    this.keyMap.set('k', Action.SKILL_SELECTION);

    // メニューに戻る（Backspaceキー）
    this.keyMap.set('Backspace', Action.RETURN_TO_MENU);
  }

  /**
   * イベントリスナーをアタッチ
   */
  private attachEventListeners(): void {
    this.keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.keyupHandler = (e: KeyboardEvent) => this.handleKeyUp(e);

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
  }

  /**
   * キー押下イベント処理
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const action = this.keyMap.get(event.key) || this.keyMap.get(key);

    // 修飾キー（Shift, Ctrl, Alt）は常に記録
    if (key === 'shift' || key === 'control' || key === 'alt') {
      this.keysPressed.add(key);
      return;
    }

    // アクションが登録されていない場合は何もしない
    if (!action) return;

    // 移動アクションかどうかチェック
    const isMoveAction = this.isMoveAction(action);

    // 移動アクション以外はリピートを防止
    if (!isMoveAction && this.keysPressed.has(key)) {
      return;
    }

    this.keysPressed.add(key);
    event.preventDefault();
    this.actionQueue.push(action);
  }

  /**
   * 移動アクションかどうかを判定
   */
  private isMoveAction(action: Action): boolean {
    return (
      action === Action.MOVE_UP ||
      action === Action.MOVE_DOWN ||
      action === Action.MOVE_LEFT ||
      action === Action.MOVE_RIGHT
    );
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
   * Shiftキーが押されているかチェック
   */
  isShiftPressed(): boolean {
    return this.keysPressed.has('shift');
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
    // イベントリスナーを削除
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }

    if (this.keyupHandler) {
      window.removeEventListener('keyup', this.keyupHandler);
      this.keyupHandler = null;
    }

    this.keysPressed.clear();
    this.actionQueue = [];
    this.keyMap.clear();
  }
}
