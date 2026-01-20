/**
 * ダメージ数字表示
 * 画面上に表示されるフローティングダメージテキスト
 */

export interface DamageNumberOptions {
  value: number;
  x: number;
  y: number;
  isCritical: boolean;
  isHeal: boolean;
}

export class DamageNumber {
  public value: number;
  public x: number;
  public y: number;
  public isCritical: boolean;
  public isHeal: boolean;
  public lifetime: number; // ミリ秒
  public age: number; // 経過時間（ミリ秒）

  constructor(options: DamageNumberOptions) {
    this.value = options.value;
    this.x = options.x;
    this.y = options.y;
    this.isCritical = options.isCritical;
    this.isHeal = options.isHeal;
    this.lifetime = 1000; // 1秒間表示
    this.age = 0;
  }

  /**
   * 更新
   */
  update(deltaTime: number): void {
    this.age += deltaTime;
    // 上に浮遊
    this.y -= deltaTime * 0.05;
  }

  /**
   * 表示が終了したかチェック
   */
  isExpired(): boolean {
    return this.age >= this.lifetime;
  }

  /**
   * 透明度を取得（フェードアウト）
   */
  getAlpha(): number {
    const progress = this.age / this.lifetime;
    return Math.max(0, 1 - progress);
  }
}
