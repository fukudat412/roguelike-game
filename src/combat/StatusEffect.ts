/**
 * ステータス効果システム
 * 毒、麻痺、混乱などの状態異常を管理
 */

import { CombatEntity } from '@/entities/Entity';
import { eventBus, GameEvents } from '@/core/EventBus';

export enum StatusEffectType {
  POISON = 'POISON',
  PARALYSIS = 'PARALYSIS',
  CONFUSION = 'CONFUSION',
  REGENERATION = 'REGENERATION',
  STRENGTH = 'STRENGTH',
  WEAKNESS = 'WEAKNESS',
  SPEED_UP = 'SPEED_UP',
  SPEED_DOWN = 'SPEED_DOWN',
}

export interface StatusEffectData {
  type: StatusEffectType;
  name: string;
  duration: number;
  turnsRemaining: number;
  icon: string;
  color: string;
}

export class StatusEffect {
  public type: StatusEffectType;
  public name: string;
  public duration: number;
  public turnsRemaining: number;
  public icon: string;
  public color: string;

  constructor(type: StatusEffectType, duration: number) {
    this.type = type;
    this.duration = duration;
    this.turnsRemaining = duration;

    const data = StatusEffectTemplates[type];
    this.name = data.name;
    this.icon = data.icon;
    this.color = data.color;
  }

  /**
   * ターン経過
   * @returns 効果が切れたらtrue
   */
  tick(): boolean {
    this.turnsRemaining--;
    return this.turnsRemaining <= 0;
  }

  /**
   * ターン開始時の効果を適用
   */
  applyEffect(entity: CombatEntity): void {
    switch (this.type) {
      case StatusEffectType.POISON:
        // 最大HPの5%ダメージ（最低1）
        const poisonDamage = Math.max(1, Math.floor(entity.getMaxHp() * 0.05));
        entity.takeDamage(poisonDamage);
        eventBus.emit(GameEvents.MESSAGE_LOG, {
          text: `${entity.name}は毒で${poisonDamage}ダメージを受けた`,
          type: 'combat',
        });
        break;

      case StatusEffectType.REGENERATION:
        // 最大HPの10%回復
        const healAmount = Math.max(1, Math.floor(entity.getMaxHp() * 0.1));
        entity.stats.heal(healAmount);
        eventBus.emit(GameEvents.MESSAGE_LOG, {
          text: `${entity.name}は${healAmount}回復した`,
          type: 'info',
        });
        break;
    }
  }

  /**
   * 移動可能かチェック
   */
  canMove(): boolean {
    return this.type !== StatusEffectType.PARALYSIS;
  }

  /**
   * 攻撃可能かチェック
   */
  canAttack(): boolean {
    return this.type !== StatusEffectType.PARALYSIS;
  }

  /**
   * ステータス修正を取得
   */
  getStatModifier(): { attack: number; defense: number; speed: number } {
    const modifier = { attack: 0, defense: 0, speed: 0 };

    switch (this.type) {
      case StatusEffectType.STRENGTH:
        modifier.attack = 5;
        break;
      case StatusEffectType.WEAKNESS:
        modifier.attack = -3;
        break;
      case StatusEffectType.SPEED_UP:
        modifier.speed = 50;
        break;
      case StatusEffectType.SPEED_DOWN:
        modifier.speed = -30;
        break;
    }

    return modifier;
  }

  /**
   * 効果情報を取得
   */
  getInfo(): StatusEffectData {
    return {
      type: this.type,
      name: this.name,
      duration: this.duration,
      turnsRemaining: this.turnsRemaining,
      icon: this.icon,
      color: this.color,
    };
  }
}

/**
 * ステータス効果テンプレート
 */
const StatusEffectTemplates: Record<StatusEffectType, {
  name: string;
  icon: string;
  color: string;
}> = {
  [StatusEffectType.POISON]: {
    name: '毒',
    icon: '☠',
    color: '#00ff00',
  },
  [StatusEffectType.PARALYSIS]: {
    name: '麻痺',
    icon: '⚡',
    color: '#ffff00',
  },
  [StatusEffectType.CONFUSION]: {
    name: '混乱',
    icon: '?',
    color: '#ff00ff',
  },
  [StatusEffectType.REGENERATION]: {
    name: '再生',
    icon: '+',
    color: '#00ffff',
  },
  [StatusEffectType.STRENGTH]: {
    name: '力',
    icon: '↑',
    color: '#ff0000',
  },
  [StatusEffectType.WEAKNESS]: {
    name: '脆弱',
    icon: '↓',
    color: '#888888',
  },
  [StatusEffectType.SPEED_UP]: {
    name: '加速',
    icon: '»',
    color: '#00ff00',
  },
  [StatusEffectType.SPEED_DOWN]: {
    name: '減速',
    icon: '«',
    color: '#0000ff',
  },
};

/**
 * ステータス効果マネージャー
 */
export class StatusEffectManager {
  private effects: StatusEffect[] = [];

  /**
   * 効果を追加
   */
  addEffect(effect: StatusEffect): void {
    // 同じタイプの効果がある場合は上書き
    const existing = this.effects.find(e => e.type === effect.type);
    if (existing) {
      existing.duration = effect.duration;
      existing.turnsRemaining = effect.turnsRemaining;
    } else {
      this.effects.push(effect);
    }
  }

  /**
   * 効果を削除
   */
  removeEffect(type: StatusEffectType): void {
    this.effects = this.effects.filter(e => e.type !== type);
  }

  /**
   * ターン経過処理
   */
  tick(entity: CombatEntity): void {
    // 効果を適用
    for (const effect of this.effects) {
      effect.applyEffect(entity);
    }

    // ターンを進める
    this.effects = this.effects.filter(effect => !effect.tick());
  }

  /**
   * 特定の効果があるかチェック
   */
  hasEffect(type: StatusEffectType): boolean {
    return this.effects.some(e => e.type === type);
  }

  /**
   * すべての効果を取得
   */
  getEffects(): StatusEffect[] {
    return [...this.effects];
  }

  /**
   * 移動可能かチェック
   */
  canMove(): boolean {
    return this.effects.every(e => e.canMove());
  }

  /**
   * 攻撃可能かチェック
   */
  canAttack(): boolean {
    return this.effects.every(e => e.canAttack());
  }

  /**
   * ステータス修正の合計を取得
   */
  getTotalModifiers(): { attack: number; defense: number; speed: number } {
    const total = { attack: 0, defense: 0, speed: 0 };

    for (const effect of this.effects) {
      const modifier = effect.getStatModifier();
      total.attack += modifier.attack;
      total.defense += modifier.defense;
      total.speed += modifier.speed;
    }

    return total;
  }

  /**
   * すべての効果をクリア
   */
  clear(): void {
    this.effects = [];
  }
}
