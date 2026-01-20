/**
 * 敵クラス
 * AIによって制御される敵対エンティティ
 */

import { CombatEntity, EntityType } from './Entity';
import { Stats } from './components/Stats';
import { eventBus, GameEvents } from '@/core/EventBus';

export interface SpecialAttack {
  type: 'poison' | 'paralyze' | 'vampiric' | 'weaken';
  chance: number; // 0.0 - 1.0
  duration?: number; // ターン数（ステータス効果の場合）
  strength?: number; // 効果の強さ（吸血の場合は吸収率など）
}

export interface EnemyTemplate {
  name: string;
  char: string;
  color: string;
  maxHp: number;
  attack: number;
  defense: number;
  experienceValue: number;
  specialAttack?: SpecialAttack;
  isBoss?: boolean;
}

export class Enemy extends CombatEntity {
  public experienceValue: number;
  public specialAttack?: SpecialAttack;
  public isBoss: boolean;
  public isElite: boolean;

  constructor(x: number, y: number, template: EnemyTemplate, isElite: boolean = false) {
    // エリートの場合はステータスを強化
    const hpMultiplier = isElite ? 1.5 : 1.0;
    const attackMultiplier = isElite ? 1.3 : 1.0;
    const defenseMultiplier = isElite ? 1.3 : 1.0;

    const stats = new Stats(
      Math.floor(template.maxHp * hpMultiplier),
      Math.floor(template.attack * attackMultiplier),
      Math.floor(template.defense * defenseMultiplier)
    );

    // エリートの場合は名前に星印を追加
    const displayName = isElite ? `★${template.name}` : template.name;

    super(
      displayName,
      EntityType.ENEMY,
      x,
      y,
      {
        char: template.char,
        color: template.color,
      },
      stats
    );

    // エリートの場合は報酬を2倍に
    this.experienceValue = Math.floor(template.experienceValue * (isElite ? 2 : 1));
    this.specialAttack = template.specialAttack;
    this.isBoss = template.isBoss || false;
    this.isElite = isElite;
  }

  /**
   * 更新処理（AI行動）
   */
  update(deltaTime: number): void {
    // AI行動は別のシステムで処理
  }

  /**
   * ダメージを受ける（オーバーライド）
   */
  takeDamage(amount: number, attacker?: string): number {
    const actualDamage = super.takeDamage(amount);

    if (this.stats.isDead()) {
      eventBus.emit(GameEvents.ENEMY_DEATH, {
        name: this.name,
        experienceValue: this.experienceValue,
        position: this.getPosition(),
        enemy: this,
      });
    }

    return actualDamage;
  }
}

/**
 * 敵テンプレート定義
 */
export const EnemyTemplates: Record<string, EnemyTemplate> = {
  GOBLIN: {
    name: 'ゴブリン',
    char: 'g',
    color: '#00ff00',
    maxHp: 20,
    attack: 5,
    defense: 2,
    experienceValue: 10,
  },
  ORC: {
    name: 'オーク',
    char: 'o',
    color: '#ff6b6b',
    maxHp: 40,
    attack: 8,
    defense: 3,
    experienceValue: 25,
  },
  TROLL: {
    name: 'トロール',
    char: 'T',
    color: '#8b4513',
    maxHp: 80,
    attack: 12,
    defense: 5,
    experienceValue: 50,
  },
};
