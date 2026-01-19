/**
 * ステータスコンポーネント
 * HP、攻撃力、防御力などの戦闘ステータス
 */

import { eventBus, GameEvents } from '@/core/EventBus';

export class Stats {
  public maxHp: number;
  public hp: number;
  public attack: number;
  public defense: number;
  public speed: number = 100;

  constructor(maxHp: number, attack: number, defense: number) {
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.attack = attack;
    this.defense = defense;
  }

  /**
   * ダメージを受ける
   */
  takeDamage(amount: number): number {
    const actualDamage = Math.max(0, amount);
    this.hp = Math.max(0, this.hp - actualDamage);
    return actualDamage;
  }

  /**
   * 回復
   */
  heal(amount: number): number {
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - oldHp;
  }

  /**
   * 生存しているか
   */
  isAlive(): boolean {
    return this.hp > 0;
  }

  /**
   * 死亡しているか
   */
  isDead(): boolean {
    return this.hp <= 0;
  }

  /**
   * HP率（0.0 - 1.0）
   */
  getHpRatio(): number {
    return this.hp / this.maxHp;
  }

  /**
   * HPを完全回復
   */
  fullHeal(): void {
    this.hp = this.maxHp;
  }

  /**
   * ステータスを増加
   */
  increaseMaxHp(amount: number): void {
    this.maxHp += amount;
    this.hp += amount;
  }

  increaseAttack(amount: number): void {
    this.attack += amount;
  }

  increaseDefense(amount: number): void {
    this.defense += amount;
  }

  /**
   * ステータスを複製
   */
  clone(): Stats {
    const stats = new Stats(this.maxHp, this.attack, this.defense);
    stats.hp = this.hp;
    stats.speed = this.speed;
    return stats;
  }

  /**
   * ステータス情報を取得
   */
  getInfo(): {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  } {
    return {
      hp: this.hp,
      maxHp: this.maxHp,
      attack: this.attack,
      defense: this.defense,
      speed: this.speed,
    };
  }
}
