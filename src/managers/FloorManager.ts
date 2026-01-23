/**
 * 階層管理マネージャー
 * 階層のセットアップ・遷移・階段・店の配置を担当
 */

import { GameMap } from '@/world/Map';
import { World } from '@/world/World';
import { Player } from '@/entities/Player';
import { Stairs, StairsDirection } from '@/entities/Stairs';
import { Shop } from '@/entities/Shop';
import { Vector2D } from '@/utils/Vector2D';
import { UIManager } from '@/ui/UIManager';
import { MessageType } from '@/ui/MessageLog';

/**
 * 階層マネージャークラス
 * 階層の遷移、階段・店の配置を一元管理
 */
export class FloorManager {
  private world: World;
  private map: GameMap;
  private player: Player;
  private uiManager: UIManager;

  constructor(world: World, map: GameMap, player: Player, uiManager: UIManager) {
    this.world = world;
    this.map = map;
    this.player = player;
    this.uiManager = uiManager;
  }

  /**
   * 階段を配置
   * @returns 配置した階段（配置できなかった場合はnull）
   */
  spawnStairs(): Stairs | null {
    const playerPos = this.player.getPosition();
    const maxAttempts = 100;
    let bestCell = null;
    let bestDistance = 0;

    // 最大100回試行して、できるだけプレイヤーから離れた位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      // 最も離れた位置を記録
      if (distance > bestDistance) {
        bestDistance = distance;
        bestCell = cell;
      }

      // 理想的な距離（10マス以上）が見つかったら終了
      if (distance >= 10) {
        break;
      }
    }

    // 適切な位置が見つからなくても、最良の位置に配置
    if (bestCell) {
      const pos = bestCell.position;
      const targetFloor = this.world.getCurrentFloor() + 1;
      return new Stairs(pos.x, pos.y, StairsDirection.DOWN, targetFloor);
    }

    return null;
  }

  /**
   * 店を配置
   * @returns 配置した店（配置できなかった場合はnull）
   */
  spawnShop(): Shop | null {
    const playerPos = this.player.getPosition();
    const maxAttempts = 50;
    let bestCell = null;
    let bestDistance = 0;

    // 最大50回試行して、できるだけプレイヤーから離れた位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      if (distance > bestDistance) {
        bestDistance = distance;
        bestCell = cell;
      }

      // 理想的な距離（15マス以上）が見つかったら終了
      if (distance >= 15) {
        break;
      }
    }

    // 適切な位置が見つかったら配置
    if (bestCell) {
      const pos = bestCell.position;
      this.uiManager.addMessage('この階には商人がいるようだ', MessageType.INFO);
      return new Shop(pos.x, pos.y);
    }

    return null;
  }

  /**
   * 現在の階層番号を取得
   */
  getCurrentFloor(): number {
    return this.world.getCurrentFloor();
  }

  /**
   * 階段を使えるかチェック
   * @param stairs - チェックする階段
   * @returns 階段を使える場合はtrue
   */
  canUseStairs(stairs: Stairs | null): boolean {
    if (!stairs) {
      this.uiManager.addMessage('ここには階段がない', MessageType.INFO);
      return false;
    }

    const playerPos = this.player.getPosition();
    if (!stairs.getPosition().equals(playerPos)) {
      this.uiManager.addMessage('ここには階段がない', MessageType.INFO);
      return false;
    }

    return true;
  }

  /**
   * 次の階層に進む（マップ生成とプレイヤー配置）
   * @returns 新しいマップ
   */
  descendToNextFloor(): GameMap {
    const nextFloor = this.world.getCurrentFloor() + 1;
    this.uiManager.addMessage(`階段を降りて${nextFloor}階へ進んだ`, MessageType.INFO);

    // 新しい階層を生成
    const newMap = this.world.descendFloor();

    // プレイヤーを新しい開始位置に配置
    const startPos = this.world.getRandomStartPosition();
    this.player.setPosition(startPos);

    return newMap;
  }

  /**
   * 最大階層数を取得
   */
  getMaxFloor(): number {
    const dungeonConfig = this.world.getDungeonConfig();
    return dungeonConfig.maxFloors;
  }
}
