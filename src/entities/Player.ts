/**
 * プレイヤークラス
 * ユーザーが操作するキャラクター
 */

import { CombatEntity, EntityType } from './Entity';
import { Stats } from './components/Stats';
import { eventBus, GameEvents } from '@/core/EventBus';

export class Player extends CombatEntity {
  public level: number = 1;
  public experience: number = 0;
  public experienceToNextLevel: number = 100;

  constructor(x: number, y: number) {
    const stats = new Stats(100, 10, 5);

    super(
      'プレイヤー',
      EntityType.PLAYER,
      x,
      y,
      {
        char: '@',
        color: '#ffff00',
      },
      stats
    );
  }

  /**
   * 更新処理
   */
  update(deltaTime: number): void {
    // プレイヤーの自動更新は現在なし
  }

  /**
   * ダメージを受ける（オーバーライド）
   */
  takeDamage(amount: number, attacker?: string): number {
    const actualDamage = super.takeDamage(amount);

    eventBus.emit(GameEvents.PLAYER_DAMAGE, {
      damage: actualDamage,
      attacker: attacker || '不明',
    });

    if (this.stats.isDead()) {
      eventBus.emit(GameEvents.PLAYER_DEATH);
    }

    return actualDamage;
  }

  /**
   * 経験値を獲得
   */
  gainExperience(amount: number): void {
    this.experience += amount;

    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  /**
   * レベルアップ
   */
  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // ステータス上昇
    this.stats.increaseMaxHp(10);
    this.stats.increaseAttack(2);
    this.stats.increaseDefense(1);

    eventBus.emit(GameEvents.PLAYER_LEVEL_UP, { level: this.level });
    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: `レベルアップ！レベル${this.level}になった！`,
      type: 'info',
    });
  }

  /**
   * ステータス情報を取得
   */
  getFullStats(): {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    experience: number;
    experienceToNextLevel: number;
  } {
    return {
      name: this.name,
      level: this.level,
      ...this.stats.getInfo(),
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
    };
  }
}
