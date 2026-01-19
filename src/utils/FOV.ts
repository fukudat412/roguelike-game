/**
 * Field of View (FOV) システム
 * シャドウキャスティングアルゴリズムによる視界計算
 */

import { Vector2D } from './Vector2D';

export class FOV {
  /**
   * シャドウキャスティングによるFOV計算
   * @param origin 視点の位置
   * @param radius 視界の半径
   * @param isBlocking セルが視界を遮るかチェックする関数
   * @returns 可視セルの座標配列
   */
  static calculate(
    origin: Vector2D,
    radius: number,
    isBlocking: (x: number, y: number) => boolean
  ): Vector2D[] {
    const visible = new Set<string>();

    // 原点は常に可視
    visible.add(`${origin.x},${origin.y}`);

    // 8方向それぞれでシャドウキャスティング
    for (let octant = 0; octant < 8; octant++) {
      this.castLight(
        visible,
        origin,
        1,
        1.0,
        0.0,
        radius,
        octant,
        isBlocking
      );
    }

    // Set を Vector2D配列に変換
    const result: Vector2D[] = [];
    visible.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      result.push(new Vector2D(x, y));
    });

    return result;
  }

  /**
   * シャドウキャスティングの再帰処理
   */
  private static castLight(
    visible: Set<string>,
    origin: Vector2D,
    row: number,
    startSlope: number,
    endSlope: number,
    radius: number,
    octant: number,
    isBlocking: (x: number, y: number) => boolean
  ): void {
    if (startSlope < endSlope) {
      return;
    }

    let nextStartSlope = startSlope;
    let blocked = false;

    for (let distance = row; distance <= radius && !blocked; distance++) {
      let deltaY = -distance;

      for (let deltaX = -distance; deltaX <= 0; deltaX++) {
        const currentSlope = (deltaX - 0.5) / (deltaY + 0.5);
        const currentSlope2 = (deltaX + 0.5) / (deltaY - 0.5);

        if (startSlope < currentSlope2) {
          continue;
        } else if (endSlope > currentSlope) {
          break;
        }

        // オクタント変換して実際の座標を取得
        const pos = this.transformOctant(origin, deltaX, deltaY, octant);
        const lSlope = (deltaX - 0.5) / (deltaY + 0.5);
        const rSlope = (deltaX + 0.5) / (deltaY - 0.5);

        // 距離チェック
        if (origin.distanceTo(pos) <= radius) {
          visible.add(`${pos.x},${pos.y}`);
        }

        if (blocked) {
          if (isBlocking(pos.x, pos.y)) {
            nextStartSlope = rSlope;
            continue;
          } else {
            blocked = false;
            startSlope = nextStartSlope;
          }
        } else {
          if (isBlocking(pos.x, pos.y) && distance < radius) {
            blocked = true;
            this.castLight(
              visible,
              origin,
              distance + 1,
              startSlope,
              lSlope,
              radius,
              octant,
              isBlocking
            );
            nextStartSlope = rSlope;
          }
        }
      }
    }
  }

  /**
   * オクタントに応じて座標を変換
   */
  private static transformOctant(
    origin: Vector2D,
    dx: number,
    dy: number,
    octant: number
  ): Vector2D {
    let x = origin.x;
    let y = origin.y;

    switch (octant) {
      case 0:
        x += dx;
        y -= dy;
        break;
      case 1:
        x -= dy;
        y += dx;
        break;
      case 2:
        x -= dy;
        y -= dx;
        break;
      case 3:
        x += dx;
        y += dy;
        break;
      case 4:
        x += dy;
        y += dx;
        break;
      case 5:
        x -= dx;
        y += dy;
        break;
      case 6:
        x -= dx;
        y -= dy;
        break;
      case 7:
        x += dy;
        y -= dx;
        break;
    }

    return new Vector2D(x, y);
  }

  /**
   * シンプルな円形FOV（フォールバック）
   */
  static calculateCircular(
    origin: Vector2D,
    radius: number
  ): Vector2D[] {
    const visible: Vector2D[] = [];

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          visible.push(new Vector2D(origin.x + dx, origin.y + dy));
        }
      }
    }

    return visible;
  }
}
