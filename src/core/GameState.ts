/**
 * ゲーム状態管理
 * 現在のゲームフェーズと状態を管理
 */

import { eventBus, GameEvents } from './EventBus';

export enum GamePhase {
  LOADING = 'LOADING',
  PLAYER_TURN = 'PLAYER_TURN',
  ENEMY_TURN = 'ENEMY_TURN',
  ANIMATION = 'ANIMATION',
  MENU = 'MENU',
  GAME_OVER = 'GAME_OVER',
}

export class GameState {
  private currentPhase: GamePhase = GamePhase.LOADING;
  private turnCount: number = 0;
  private currentFloor: number = 1;
  private gameOver: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    eventBus.on(GameEvents.PLAYER_DEATH, () => {
      this.setPhase(GamePhase.GAME_OVER);
      this.gameOver = true;
    });
  }

  /**
   * ゲームフェーズを設定
   */
  setPhase(phase: GamePhase): void {
    const oldPhase = this.currentPhase;
    this.currentPhase = phase;
    eventBus.emit(GameEvents.PHASE_CHANGE, { oldPhase, newPhase: phase });
  }

  /**
   * 現在のフェーズを取得
   */
  getPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * プレイヤーターンかチェック
   */
  isPlayerTurn(): boolean {
    return this.currentPhase === GamePhase.PLAYER_TURN;
  }

  /**
   * 敵ターンかチェック
   */
  isEnemyTurn(): boolean {
    return this.currentPhase === GamePhase.ENEMY_TURN;
  }

  /**
   * ゲームオーバーかチェック
   */
  isGameOver(): boolean {
    return this.gameOver;
  }

  /**
   * ターンを進める
   */
  advanceTurn(): void {
    this.turnCount++;

    if (this.currentPhase === GamePhase.PLAYER_TURN) {
      this.setPhase(GamePhase.ENEMY_TURN);
    } else if (this.currentPhase === GamePhase.ENEMY_TURN) {
      this.setPhase(GamePhase.PLAYER_TURN);
    }
  }

  /**
   * プレイヤーターンを開始
   */
  startPlayerTurn(): void {
    this.setPhase(GamePhase.PLAYER_TURN);
  }

  /**
   * 現在のターン数を取得
   */
  getTurnCount(): number {
    return this.turnCount;
  }

  /**
   * 現在の階層を取得
   */
  getCurrentFloor(): number {
    return this.currentFloor;
  }

  /**
   * 階層を設定
   */
  setCurrentFloor(floor: number): void {
    this.currentFloor = floor;
    eventBus.emit(GameEvents.UI_UPDATE);
  }

  /**
   * 次の階層へ
   */
  descendFloor(): void {
    this.currentFloor++;
    eventBus.emit(GameEvents.UI_UPDATE);
  }

  /**
   * ゲーム状態をリセット
   */
  reset(): void {
    this.currentPhase = GamePhase.LOADING;
    this.turnCount = 0;
    this.currentFloor = 1;
    this.gameOver = false;
  }

  /**
   * ゲーム状態をシリアライズ
   */
  serialize(): any {
    return {
      phase: this.currentPhase,
      turnCount: this.turnCount,
      currentFloor: this.currentFloor,
      gameOver: this.gameOver,
    };
  }

  /**
   * ゲーム状態をデシリアライズ
   */
  deserialize(data: any): void {
    this.currentPhase = data.phase;
    this.turnCount = data.turnCount;
    this.currentFloor = data.currentFloor;
    this.gameOver = data.gameOver;
  }
}
