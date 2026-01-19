/**
 * UI管理システム
 * ゲームUIの更新と表示を管理
 */

import { eventBus, GameEvents } from '@/core/EventBus';
import { MessageLog, MessageType } from './MessageLog';

export class UIManager {
  private messageLog: MessageLog;

  constructor() {
    this.messageLog = new MessageLog();
    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    // メッセージログイベント
    eventBus.on(GameEvents.MESSAGE_LOG, (data: { text: string; type?: MessageType }) => {
      this.messageLog.add(data.text, data.type || MessageType.INFO);
    });

    // プレイヤーダメージ
    eventBus.on(GameEvents.PLAYER_DAMAGE, (data: { damage: number; attacker: string }) => {
      this.messageLog.add(
        `${data.attacker}から${data.damage}ダメージを受けた！`,
        MessageType.COMBAT
      );
    });

    // プレイヤー死亡
    eventBus.on(GameEvents.PLAYER_DEATH, () => {
      this.messageLog.add('あなたは死んでしまった...', MessageType.DEATH);
      this.showGameOver();
    });

    // 戦闘ヒット
    eventBus.on(GameEvents.COMBAT_HIT, (data: { attacker: string; target: string; damage: number }) => {
      this.messageLog.add(
        `${data.attacker}が${data.target}に${data.damage}ダメージを与えた！`,
        MessageType.COMBAT
      );
    });

    // 戦闘クリティカル
    eventBus.on(GameEvents.COMBAT_CRITICAL, (data: { attacker: string; target: string; damage: number }) => {
      this.messageLog.add(
        `クリティカル！${data.attacker}が${data.target}に${data.damage}ダメージを与えた！`,
        MessageType.COMBAT
      );
    });

    // 敵死亡
    eventBus.on(GameEvents.ENEMY_DEATH, (data: { name: string }) => {
      this.messageLog.add(`${data.name}を倒した！`, MessageType.COMBAT);
    });
  }

  /**
   * プレイヤーステータスを更新
   */
  updatePlayerStats(stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    gold?: number;
  }): void {
    const hpElement = document.getElementById('player-hp');
    const maxHpElement = document.getElementById('player-max-hp');
    const attackElement = document.getElementById('player-attack');
    const defenseElement = document.getElementById('player-defense');
    const goldElement = document.getElementById('player-gold');

    if (hpElement) hpElement.textContent = stats.hp.toString();
    if (maxHpElement) maxHpElement.textContent = stats.maxHp.toString();
    if (attackElement) attackElement.textContent = stats.attack.toString();
    if (defenseElement) defenseElement.textContent = stats.defense.toString();
    if (goldElement && stats.gold !== undefined) goldElement.textContent = stats.gold.toString();
  }

  /**
   * 階層情報を更新
   */
  updateFloor(floor: number): void {
    const floorElement = document.getElementById('current-floor');
    if (floorElement) {
      floorElement.textContent = floor.toString();
    }
  }

  /**
   * ゲームオーバー画面を表示
   */
  showGameOver(): void {
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
      gameOverElement.style.display = 'block';
    }
  }

  /**
   * ゲームオーバー画面を非表示
   */
  hideGameOver(): void {
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
      gameOverElement.style.display = 'none';
    }
  }

  /**
   * メッセージログを取得
   */
  getMessageLog(): MessageLog {
    return this.messageLog;
  }

  /**
   * メッセージを追加（外部から）
   */
  addMessage(text: string, type: MessageType = MessageType.INFO): void {
    this.messageLog.add(text, type);
  }
}
