/**
 * スキルシステム基底クラス
 * プレイヤーが使用できるアクティブスキルの基底定義
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';

export enum SkillType {
  POWER_STRIKE = 'POWER_STRIKE',
  AREA_SLASH = 'AREA_SLASH',
  HEALING_PRAYER = 'HEALING_PRAYER',
  FIREBALL = 'FIREBALL',
  TELEPORT = 'TELEPORT',
  BERSERK = 'BERSERK',
  ICE_WALL = 'ICE_WALL',
  LIFE_STEAL = 'LIFE_STEAL',
}

export interface SkillData {
  type: SkillType;
  name: string;
  description: string;
  mpCost: number;
  cooldown: number; // ターン数
  icon: string;
}

export class Skill {
  public data: SkillData;
  public currentCooldown: number = 0;

  constructor(data: SkillData) {
    this.data = data;
  }

  /**
   * スキルが使用可能か
   */
  canUse(player: Player): boolean {
    return this.currentCooldown === 0 && player.stats.mp >= this.data.mpCost;
  }

  /**
   * スキルを使用
   */
  use(player: Player, enemies: Enemy[]): boolean {
    if (!this.canUse(player)) {
      return false;
    }

    // MP消費
    if (!player.stats.consumeMp(this.data.mpCost)) {
      return false;
    }

    // クールダウン開始
    this.currentCooldown = this.data.cooldown;

    // スキル効果を実行
    this.execute(player, enemies);

    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: `${this.data.name}を使用した！`,
      type: 'info',
    });

    return true;
  }

  /**
   * スキル効果を実行（サブクラスでオーバーライド）
   */
  protected execute(player: Player, enemies: Enemy[]): void {
    // Override in subclasses
  }

  /**
   * クールダウンを更新（ターン経過時に呼ぶ）
   */
  updateCooldown(): void {
    if (this.currentCooldown > 0) {
      this.currentCooldown--;
    }
  }

  /**
   * クールダウンをリセット
   */
  resetCooldown(): void {
    this.currentCooldown = 0;
  }
}
