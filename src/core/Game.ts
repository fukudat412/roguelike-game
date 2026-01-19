/**
 * メインゲームクラス
 * ゲームループ、状態管理、システム統合
 */

import { Renderer } from '@/renderer/Renderer';
import { GameState, GamePhase } from './GameState';
import { Input, Action } from './Input';
import { eventBus, GameEvents } from './EventBus';
import { UIManager } from '@/ui/UIManager';
import { GameMap } from '@/world/Map';
import { RoomGenerator } from '@/world/generators/RoomGenerator';
import { Player } from '@/entities/Player';
import { Enemy, EnemyTemplates } from '@/entities/Enemy';
import { CombatEntity } from '@/entities/Entity';
import { CombatSystem } from '@/combat/CombatSystem';
import { Vector2D } from '@/utils/Vector2D';
import { MessageType } from '@/ui/MessageLog';

export class Game {
  private renderer: Renderer;
  private gameState: GameState;
  private input: Input;
  private uiManager: UIManager;

  private map!: GameMap;
  private player!: Player;
  private enemies: Enemy[] = [];

  private lastFrameTime: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.gameState = new GameState();
    this.input = new Input();
    this.uiManager = new UIManager();

    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    // 敵死亡時に配列から削除
    eventBus.on(GameEvents.ENEMY_DEATH, (data: { name: string }) => {
      this.enemies = this.enemies.filter(e => e.isAlive());
    });

    // UI更新
    eventBus.on(GameEvents.UI_UPDATE, () => {
      this.updateUI();
    });

    // リスタートボタン
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        this.restart();
      });
    }
  }

  /**
   * ゲーム初期化
   */
  initialize(): void {
    // マップ生成
    this.map = RoomGenerator.generate(80, 60, {
      minRoomSize: 5,
      maxRoomSize: 12,
      maxRooms: 20,
    });

    // プレイヤー配置
    const startCell = this.map.getRandomWalkableCell();
    if (startCell) {
      this.player = new Player(startCell.position.x, startCell.position.y);
    } else {
      // フォールバック
      this.player = new Player(40, 30);
    }

    // 敵を配置
    this.spawnEnemies(10);

    // カメラをプレイヤーに追従
    this.renderer.setCameraPosition(this.player.getPosition());

    // FOV更新
    this.map.updateFOV(this.player.getPosition(), 8);

    // UI更新
    this.updateUI();

    // プレイヤーターン開始
    this.gameState.startPlayerTurn();

    // ウェルカムメッセージ
    this.uiManager.addMessage('ダンジョンに入った。冒険を開始しよう！', MessageType.INFO);
  }

  /**
   * 敵を配置
   */
  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const pos = cell.position;

      // プレイヤーとの距離をチェック（近すぎない位置に配置）
      if (this.player.getPosition().distanceTo(pos) < 10) {
        continue;
      }

      // 既存の敵と重ならないようにチェック
      const occupied = this.enemies.some(e => e.getPosition().equals(pos));
      if (occupied) continue;

      // ランダムな敵を生成
      const templates = Object.values(EnemyTemplates);
      const template = templates[Math.floor(Math.random() * templates.length)];
      const enemy = new Enemy(pos.x, pos.y, template);

      this.enemies.push(enemy);
    }
  }

  /**
   * ゲームループ開始
   */
  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  /**
   * ゲームループ
   */
  private gameLoop(currentTime: number): void {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 更新
    this.update(deltaTime);

    // 描画
    this.render();

    // 次のフレーム
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * 更新処理
   */
  private update(deltaTime: number): void {
    // ゲームオーバーなら何もしない
    if (this.gameState.isGameOver()) {
      return;
    }

    // プレイヤーターン
    if (this.gameState.isPlayerTurn()) {
      this.handlePlayerTurn();
    }

    // 敵ターン
    if (this.gameState.isEnemyTurn()) {
      this.handleEnemyTurn();
    }
  }

  /**
   * プレイヤーターン処理
   */
  private handlePlayerTurn(): void {
    const action = this.input.getNextAction();
    if (!action) return;

    let turnEnded = false;

    // 移動アクション
    const direction = Input.actionToDirection(action);
    if (direction) {
      turnEnded = this.movePlayer(direction);
    }

    // ターン終了
    if (turnEnded) {
      this.gameState.advanceTurn();
    }
  }

  /**
   * プレイヤー移動
   */
  private movePlayer(direction: Vector2D): boolean {
    const currentPos = this.player.getPosition();
    const newPos = currentPos.add(direction);

    // マップ境界チェック
    if (!this.map.isInBoundsVec(newPos)) {
      return false;
    }

    // 壁チェック
    if (!this.map.isWalkableAt(newPos)) {
      return false;
    }

    // 敵との衝突チェック
    const enemyAtPosition = this.enemies.find(e =>
      e.isAlive() && e.getPosition().equals(newPos)
    );

    if (enemyAtPosition) {
      // 攻撃
      CombatSystem.attack(this.player, enemyAtPosition);
      return true;
    }

    // 移動
    this.player.setPosition(newPos);

    // カメラ追従
    this.renderer.setCameraPosition(newPos);

    // FOV更新
    this.map.updateFOV(newPos, 8);

    // UI更新
    this.updateUI();

    return true;
  }

  /**
   * 敵ターン処理
   */
  private handleEnemyTurn(): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      // シンプルなAI: プレイヤーに近づく
      this.moveEnemyTowardsPlayer(enemy);
    }

    // プレイヤーターンに戻す
    this.gameState.advanceTurn();
  }

  /**
   * 敵をプレイヤーに近づける
   */
  private moveEnemyTowardsPlayer(enemy: Enemy): void {
    const enemyPos = enemy.getPosition();
    const playerPos = this.player.getPosition();

    // プレイヤーが視界内かチェック（簡易版）
    const distance = enemyPos.distanceTo(playerPos);
    if (distance > 10) return; // 視界外

    // 隣接していれば攻撃
    if (CombatSystem.isAdjacent(enemy, this.player)) {
      CombatSystem.attack(enemy, this.player);
      this.updateUI();
      return;
    }

    // プレイヤーに近づく方向を計算
    const dx = playerPos.x - enemyPos.x;
    const dy = playerPos.y - enemyPos.y;

    // 移動方向を決定（シンプルなアプローチ）
    let moveX = 0;
    let moveY = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveX = dx > 0 ? 1 : -1;
    } else {
      moveY = dy > 0 ? 1 : -1;
    }

    const newPos = enemyPos.add(new Vector2D(moveX, moveY));

    // 移動可能かチェック
    if (!this.map.isWalkableAt(newPos)) return;

    // 他の敵と重ならないかチェック
    const occupied = this.enemies.some(e =>
      e !== enemy && e.isAlive() && e.getPosition().equals(newPos)
    );
    if (occupied) return;

    // プレイヤーと重ならないかチェック
    if (this.player.getPosition().equals(newPos)) return;

    // 移動
    enemy.setPosition(newPos);
  }

  /**
   * 描画処理
   */
  private render(): void {
    // 画面クリア
    this.renderer.clear('#1a1a1a');

    // マップ描画
    this.renderMap();

    // エンティティ描画
    this.renderEntities();

    // デバッグ情報（オプション）
    // this.renderDebugInfo();
  }

  /**
   * マップ描画
   */
  private renderMap(): void {
    const allCells = this.map.getAllCells();

    for (const cell of allCells) {
      if (!cell.explored && !cell.visible) continue;

      const pos = cell.position;
      const alpha = cell.visible ? 1.0 : 0.3;

      this.renderer.drawTile(pos.x, pos.y, {
        fillColor: cell.tile.getColor(),
        alpha: alpha,
      });

      // タイル文字を描画（オプション）
      if (cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        this.renderer.drawText(
          cell.tile.getChar(),
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: '#666',
            font: '20px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }
  }

  /**
   * エンティティ描画
   */
  private renderEntities(): void {
    // 敵を描画
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      const pos = enemy.getPosition();
      const cell = this.map.getCellAt(pos);

      // 可視範囲内のみ描画
      if (cell && cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        const renderInfo = enemy.getRenderInfo();

        // 背景
        this.renderer.drawRect(
          screenPos.x,
          screenPos.y,
          tileSize,
          tileSize,
          { fillColor: '#2a2a2a' }
        );

        // キャラクター
        this.renderer.drawText(
          renderInfo.char,
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: renderInfo.color,
            font: 'bold 24px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }

    // プレイヤーを描画
    const playerPos = this.player.getPosition();
    const screenPos = this.renderer.gridToScreen(playerPos.x, playerPos.y);
    const tileSize = this.renderer.getTileSize();
    const renderInfo = this.player.getRenderInfo();

    // 背景
    this.renderer.drawRect(
      screenPos.x,
      screenPos.y,
      tileSize,
      tileSize,
      { fillColor: '#4a4a4a' }
    );

    // プレイヤー
    this.renderer.drawText(
      renderInfo.char,
      screenPos.x + tileSize / 2,
      screenPos.y + tileSize / 2,
      {
        color: renderInfo.color,
        font: 'bold 26px monospace',
        align: 'center',
        baseline: 'middle',
      }
    );
  }

  /**
   * UI更新
   */
  private updateUI(): void {
    const stats = this.player.stats.getInfo();
    this.uiManager.updatePlayerStats(stats);
    this.uiManager.updateFloor(this.gameState.getCurrentFloor());
  }

  /**
   * ゲーム再起動
   */
  private restart(): void {
    // 状態リセット
    this.gameState.reset();
    this.enemies = [];
    this.input.clearActionQueue();

    // UI非表示
    this.uiManager.hideGameOver();
    this.uiManager.getMessageLog().clear();

    // 再初期化
    this.initialize();
  }

  /**
   * ゲーム停止
   */
  stop(): void {
    this.running = false;
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.stop();
    this.input.destroy();
    eventBus.clear();
  }
}
