/**
 * 階段エンティティ
 * 階層間の移動に使用
 */

import { Entity, EntityType } from './Entity';

export enum StairsDirection {
  UP = 'UP',
  DOWN = 'DOWN',
}

export class Stairs extends Entity {
  public direction: StairsDirection;
  public targetFloor: number;

  constructor(x: number, y: number, direction: StairsDirection, targetFloor: number) {
    const renderInfo =
      direction === StairsDirection.DOWN
        ? { char: '>', color: '#ffffff' }
        : { char: '<', color: '#ffffff' };

    super(
      direction === StairsDirection.DOWN ? '下り階段' : '上り階段',
      EntityType.STAIRS,
      x,
      y,
      renderInfo
    );

    this.direction = direction;
    this.targetFloor = targetFloor;
    this.blocksMovement = false;
  }

  /**
   * 更新処理（階段は静的）
   */
  update(deltaTime: number): void {
    // 階段は更新なし
  }

  /**
   * 下り階段かチェック
   */
  isDown(): boolean {
    return this.direction === StairsDirection.DOWN;
  }

  /**
   * 上り階段かチェック
   */
  isUp(): boolean {
    return this.direction === StairsDirection.UP;
  }
}
