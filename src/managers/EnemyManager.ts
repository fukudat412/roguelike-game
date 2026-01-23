/**
 * 敵管理マネージャー
 * 敵の生成・配置・AI処理を担当
 */

import { Enemy, EnemyTemplate } from '@/entities/Enemy';
import { Player } from '@/entities/Player';
import { GameMap } from '@/world/Map';
import { World } from '@/world/World';
import { Vector2D } from '@/utils/Vector2D';
import { getRandomEnemyForFloor, getBossForFloor } from '@/data/enemies';
import { EnemyDatabase } from '@/data/enemies';
import { AStar } from '@/ai/pathfinding/AStar';
import { IEntityManager } from '@/core/interfaces/IManager';

/**
 * 敵マネージャークラス
 * 敵の生成、配置、AI処理を一元管理
 */
export class EnemyManager implements IEntityManager<Enemy> {
  private enemies: Enemy[];
  private world: World;
  private map: GameMap;
  private player: Player;

  constructor(world: World, map: GameMap, player: Player, enemies: Enemy[]) {
    this.world = world;
    this.map = map;
    this.player = player;
    this.enemies = enemies;
  }

  /**
   * 敵を追加
   */
  add(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  /**
   * 敵を削除
   */
  remove(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * インデックスを指定して敵を削除
   */
  removeAt(index: number): void {
    if (index >= 0 && index < this.enemies.length) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * すべての敵を取得
   */
  getAll(): Enemy[] {
    return this.enemies;
  }

  /**
   * 指定位置にある敵を取得
   */
  getAt(position: Vector2D): Enemy | undefined {
    return this.enemies.find(e => e.getPosition().equals(position));
  }

  /**
   * すべての敵をクリア
   */
  clear(): void {
    this.enemies.length = 0; // 配列の参照を保ったままクリア
  }

  /**
   * 敵の数を取得
   */
  count(): number {
    return this.enemies.length;
  }

  /**
   * 敵を配置（基本版）
   * @param count - 生成する敵の数
   */
  spawnEnemies(count: number): void {
    const currentFloor = this.world.getCurrentFloor();

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

      // 階層に応じた敵を生成
      const template = getRandomEnemyForFloor(currentFloor);
      const enemy = new Enemy(pos.x, pos.y, template);

      this.enemies.push(enemy);
    }
  }

  /**
   * ダンジョン設定に基づいて敵を配置
   * @param count - 生成する敵の数
   */
  spawnEnemiesForDungeon(count: number): void {
    const currentFloor = this.world.getCurrentFloor();
    const dungeonConfig = this.world.getDungeonConfig();

    // 現在の階層で出現可能な敵のプールをフィルタリング
    const availableEnemies = dungeonConfig.enemies.pool.filter(enemyKey => {
      const template = EnemyDatabase[enemyKey];
      return !template.minFloor || template.minFloor <= currentFloor;
    });

    // 出現可能な敵がいない場合は終了
    if (availableEnemies.length === 0) return;

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

      // フィルタリングされた敵プールからランダムに選択
      const enemyKey = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

      const template = EnemyDatabase[enemyKey];
      if (!template) continue;

      // 階層に応じて敵のステータスをスケーリング
      const scaledTemplate = this.scaleEnemyStats(template, currentFloor);

      // エリート判定
      const isElite = Math.random() < dungeonConfig.enemies.eliteChance;

      const enemy = new Enemy(pos.x, pos.y, scaledTemplate, isElite);

      this.enemies.push(enemy);
    }
  }

  /**
   * 階層に応じて敵のステータスをスケーリング
   * @param template - 敵のテンプレート
   * @param floor - 現在の階層
   * @returns スケーリングされた敵のテンプレート
   */
  private scaleEnemyStats(template: EnemyTemplate, floor: number): EnemyTemplate {
    // ベース倍率（階層1でも少し強くする）
    const baseMultiplier = 1.0;

    // 階層による倍率（5階層ごとに+10%）
    const floorMultiplier = 1.0 + Math.floor((floor - 1) / 5) * 0.1;

    // 最終倍率
    const multiplier = baseMultiplier * floorMultiplier;

    return {
      ...template,
      maxHp: Math.floor(template.maxHp * multiplier),
      attack: Math.floor(template.attack * multiplier),
      defense: Math.floor(template.defense * multiplier),
      experienceValue: Math.floor(template.experienceValue * multiplier),
    };
  }

  /**
   * ボスを配置
   */
  spawnBoss(): void {
    const currentFloor = this.world.getCurrentFloor();
    const bossTemplate = getBossForFloor(currentFloor);

    if (!bossTemplate) return;

    // ボスの配置位置を探す（プレイヤーから十分離れた位置）
    let attempts = 0;
    let bossPos: Vector2D | null = null;

    while (attempts < 100) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) {
        attempts++;
        continue;
      }

      const pos = cell.position;

      // プレイヤーから15マス以上離れた位置
      if (this.player.getPosition().distanceTo(pos) >= 15) {
        bossPos = pos;
        break;
      }

      attempts++;
    }

    if (!bossPos) {
      // 適切な位置が見つからない場合は任意の位置に配置
      const cell = this.map.getRandomWalkableCell();
      if (cell) {
        bossPos = cell.position;
      }
    }

    if (bossPos) {
      const boss = new Enemy(bossPos.x, bossPos.y, bossTemplate, false);
      this.enemies.push(boss);
    }
  }

  /**
   * ダンジョン固有のボスを配置
   */
  spawnDungeonBoss(): void {
    const currentFloor = this.world.getCurrentFloor();
    const dungeonConfig = this.world.getDungeonConfig();
    const bossKey = dungeonConfig.bosses[currentFloor];

    if (!bossKey) return;

    const bossTemplate = EnemyDatabase[bossKey];
    if (!bossTemplate) return;

    // 階層に応じてスケーリング
    const scaledTemplate = this.scaleEnemyStats(bossTemplate, currentFloor);

    const playerPos = this.player.getPosition();
    const maxAttempts = 100;
    let bestCell = null;
    let bestDistance = 0;

    // 最大100回試行して、理想的な距離（10-15マス）の位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      // 理想的な距離範囲（10-15マス）
      if (distance >= 10 && distance <= 15) {
        bestCell = cell;
        break;
      }

      // 理想的な距離が見つからない場合、最も離れた位置を記録
      if (distance > bestDistance && distance >= 8) {
        bestDistance = distance;
        bestCell = cell;
      }
    }

    // 適切な位置が見つからなくても配置
    if (!bestCell) {
      bestCell = this.map.getRandomWalkableCell();
    }

    if (!bestCell) return;

    const bossPos = bestCell.position;
    const boss = new Enemy(bossPos.x, bossPos.y, scaledTemplate);
    this.enemies.push(boss);
  }

  /**
   * 敵をプレイヤーに向かって移動させる（A*パスファインディング使用）
   * @param enemy - 移動させる敵
   */
  moveEnemyTowardsPlayer(enemy: Enemy): void {
    const start = enemy.getPosition();
    const goal = this.player.getPosition();

    // 距離が遠すぎる場合はシンプルな移動に切り替え
    const distance = start.distanceTo(goal);
    if (distance > 15) {
      this.simpleEnemyMove(enemy);
      return;
    }

    // パスファインディング
    const path = AStar.findPath(start, goal, (x, y) => this.map.isWalkable(x, y));

    if (path && path.length > 1) {
      // パスの最初のステップに移動（現在位置の次）
      const nextPos = path[1];

      // 移動先が移動可能かチェック
      if (!this.map.isWalkable(nextPos.x, nextPos.y)) return;

      // プレイヤーと同じ位置には移動できない
      if (nextPos.equals(this.player.getPosition())) return;

      // 他の敵と重ならないようにチェック
      const occupied = this.enemies.some(e => e !== enemy && e.getPosition().equals(nextPos));
      if (occupied) return;

      // 移動
      enemy.setPosition(nextPos);
    } else {
      // パスが見つからない場合はシンプルな移動
      this.simpleEnemyMove(enemy);
    }
  }

  /**
   * 敵のシンプルな移動（直線的にプレイヤーに近づく）
   * @param enemy - 移動させる敵
   */
  simpleEnemyMove(enemy: Enemy): void {
    const enemyPos = enemy.getPosition();
    const playerPos = this.player.getPosition();

    const dx = Math.sign(playerPos.x - enemyPos.x);
    const dy = Math.sign(playerPos.y - enemyPos.y);

    // 優先的に横方向に移動（斜め移動を避ける）
    let newPos: Vector2D | null = null;

    if (Math.abs(playerPos.x - enemyPos.x) > Math.abs(playerPos.y - enemyPos.y)) {
      // 横方向を優先
      newPos = new Vector2D(enemyPos.x + dx, enemyPos.y);
      if (!this.map.isWalkable(newPos.x, newPos.y)) {
        newPos = new Vector2D(enemyPos.x, enemyPos.y + dy);
      }
    } else {
      // 縦方向を優先
      newPos = new Vector2D(enemyPos.x, enemyPos.y + dy);
      if (!this.map.isWalkable(newPos.x, newPos.y)) {
        newPos = new Vector2D(enemyPos.x + dx, enemyPos.y);
      }
    }

    // 移動可能かチェック
    if (!newPos || !this.map.isWalkable(newPos.x, newPos.y)) return;

    // プレイヤーと同じ位置には移動できない
    if (newPos.equals(playerPos)) return;

    // 他の敵と重ならないようにチェック
    const occupied = this.enemies.some(e => e !== enemy && e.getPosition().equals(newPos!));
    if (occupied) return;

    // 移動
    enemy.setPosition(newPos);
  }
}
