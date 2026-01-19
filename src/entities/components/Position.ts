/**
 * 位置コンポーネント
 * エンティティの座標を管理
 */

import { Vector2D } from '@/utils/Vector2D';

export class Position {
  public position: Vector2D;

  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
  }

  /**
   * 位置を取得
   */
  getPosition(): Vector2D {
    return this.position.clone();
  }

  /**
   * 位置を設定
   */
  setPosition(x: number, y: number): void;
  setPosition(pos: Vector2D): void;
  setPosition(xOrPos: number | Vector2D, y?: number): void {
    if (xOrPos instanceof Vector2D) {
      this.position = xOrPos.clone();
    } else {
      this.position = new Vector2D(xOrPos, y!);
    }
  }

  /**
   * 移動
   */
  move(dx: number, dy: number): void;
  move(direction: Vector2D): void;
  move(dxOrDir: number | Vector2D, dy?: number): void {
    if (dxOrDir instanceof Vector2D) {
      this.position = this.position.add(dxOrDir);
    } else {
      this.position = this.position.add(new Vector2D(dxOrDir, dy!));
    }
  }

  /**
   * 他の位置との距離
   */
  distanceTo(other: Position): number {
    return this.position.distanceTo(other.position);
  }

  /**
   * マンハッタン距離
   */
  manhattanDistanceTo(other: Position): number {
    return this.position.manhattanDistanceTo(other.position);
  }
}
