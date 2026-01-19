/**
 * 2Dベクトルクラス
 * 位置、方向、速度などを表現
 */
export class Vector2D {
  constructor(public x: number, public y: number) {}

  /**
   * ベクトルを複製
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  /**
   * ベクトルを加算
   */
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  /**
   * ベクトルを減算
   */
  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  /**
   * スカラー倍
   */
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * ユークリッド距離
   */
  distanceTo(other: Vector2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * マンハッタン距離
   */
  manhattanDistanceTo(other: Vector2D): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  /**
   * ベクトルの長さ
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * 正規化（単位ベクトル化）
   */
  normalize(): Vector2D {
    const len = this.length();
    if (len === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / len, this.y / len);
  }

  /**
   * 等価性チェック
   */
  equals(other: Vector2D): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * 静的メソッド: ゼロベクトル
   */
  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  /**
   * 静的メソッド: 方向ベクトル
   */
  static readonly UP = new Vector2D(0, -1);
  static readonly DOWN = new Vector2D(0, 1);
  static readonly LEFT = new Vector2D(-1, 0);
  static readonly RIGHT = new Vector2D(1, 0);

  /**
   * 四方向の配列
   */
  static readonly DIRECTIONS = [
    Vector2D.UP,
    Vector2D.DOWN,
    Vector2D.LEFT,
    Vector2D.RIGHT,
  ];

  /**
   * 八方向の配列
   */
  static readonly EIGHT_DIRECTIONS = [
    new Vector2D(0, -1),  // 上
    new Vector2D(1, -1),  // 右上
    new Vector2D(1, 0),   // 右
    new Vector2D(1, 1),   // 右下
    new Vector2D(0, 1),   // 下
    new Vector2D(-1, 1),  // 左下
    new Vector2D(-1, 0),  // 左
    new Vector2D(-1, -1), // 左上
  ];
}
