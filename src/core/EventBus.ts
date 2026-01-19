/**
 * イベント駆動システム
 * ゲーム内のイベントを管理し、疎結合なコンポーネント間通信を実現
 */

type EventCallback = (...args: any[]) => void;

export class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * イベントリスナーを登録
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * イベントリスナーを削除
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * イベントを発火
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    callbacks.forEach(callback => callback(...args));
  }

  /**
   * 一度だけ実行されるイベントリスナーを登録
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * すべてのリスナーをクリア
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 特定イベントのリスナーをすべて削除
   */
  clearEvent(event: string): void {
    this.listeners.delete(event);
  }
}

// グローバルイベントバス
export const eventBus = new EventBus();

// イベント名の定数定義
export const GameEvents = {
  // ゲーム状態
  GAME_START: 'game:start',
  GAME_OVER: 'game:over',
  PHASE_CHANGE: 'game:phase_change',

  // プレイヤー
  PLAYER_MOVE: 'player:move',
  PLAYER_ATTACK: 'player:attack',
  PLAYER_DAMAGE: 'player:damage',
  PLAYER_DEATH: 'player:death',
  PLAYER_LEVEL_UP: 'player:level_up',

  // 敵
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_DEATH: 'enemy:death',
  ENEMY_ATTACK: 'enemy:attack',

  // 戦闘
  COMBAT_START: 'combat:start',
  COMBAT_HIT: 'combat:hit',
  COMBAT_MISS: 'combat:miss',
  COMBAT_CRITICAL: 'combat:critical',

  // UI
  MESSAGE_LOG: 'ui:message',
  UI_UPDATE: 'ui:update',
} as const;
