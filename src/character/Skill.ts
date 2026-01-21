/**
 * スキルシステム
 * プレイヤーが使用できるアクティブスキル
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

/**
 * 強打スキル
 * MP 7消費、2倍ダメージの単体攻撃
 */
export class PowerStrikeSkill extends Skill {
  constructor() {
    super({
      type: SkillType.POWER_STRIKE,
      name: '強打',
      description: '2倍のダメージを与える強力な一撃',
      mpCost: 7,
      cooldown: 3,
      icon: '💥',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    // 隣接する敵を探す
    const playerPos = player.getPosition();
    const adjacent = enemies.filter(enemy => {
      if (!enemy.isAlive()) return false;
      const enemyPos = enemy.getPosition();
      const distance = Math.max(
        Math.abs(enemyPos.x - playerPos.x),
        Math.abs(enemyPos.y - playerPos.y)
      );
      return distance === 1;
    });

    if (adjacent.length === 0) {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: '攻撃できる敵がいない！',
        type: 'warning',
      });
      return;
    }

    // 最初の隣接敵に2倍ダメージ
    const target = adjacent[0];
    const damage = player.getAttack() * 2;
    const actualDamage = target.takeDamage(damage, player.name);

    eventBus.emit(GameEvents.COMBAT_HIT, {
      attacker: player.name,
      target: target.name,
      damage: Math.floor(actualDamage),
    });
  }
}

/**
 * 範囲斬りスキル
 * MP 10消費、周囲8マスの敵全てに攻撃
 */
export class AreaSlashSkill extends Skill {
  constructor() {
    super({
      type: SkillType.AREA_SLASH,
      name: '範囲斬り',
      description: '周囲の敵全てを攻撃',
      mpCost: 10,
      cooldown: 5,
      icon: '🌀',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    const playerPos = player.getPosition();
    const damage = player.getAttack();

    // 周囲8マスの敵を探す
    const targets = enemies.filter(enemy => {
      if (!enemy.isAlive()) return false;
      const enemyPos = enemy.getPosition();
      const distance = Math.max(
        Math.abs(enemyPos.x - playerPos.x),
        Math.abs(enemyPos.y - playerPos.y)
      );
      return distance === 1;
    });

    if (targets.length === 0) {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: '攻撃できる敵がいない！',
        type: 'warning',
      });
      return;
    }

    let hitCount = 0;
    for (const target of targets) {
      const actualDamage = target.takeDamage(damage, player.name);
      eventBus.emit(GameEvents.COMBAT_HIT, {
        attacker: player.name,
        target: target.name,
        damage: Math.floor(actualDamage),
      });
      hitCount++;
    }

    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: `${hitCount}体の敵に攻撃した！`,
      type: 'success',
    });
  }
}

/**
 * 回復の祈りスキル
 * MP 14消費、HP 50回復
 */
export class HealingPrayerSkill extends Skill {
  constructor() {
    super({
      type: SkillType.HEALING_PRAYER,
      name: '回復の祈り',
      description: 'HP 50を回復する',
      mpCost: 14,
      cooldown: 4,
      icon: '✨',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    const healAmount = 50;
    const actualHeal = player.stats.heal(healAmount);

    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: `HP ${actualHeal}回復した！`,
      type: 'success',
    });

    eventBus.emit(GameEvents.UI_UPDATE);
  }
}

/**
 * ファイアボールスキル
 * MP 18消費、遠距離範囲攻撃（3x3）
 */
export class FireballSkill extends Skill {
  constructor() {
    super({
      type: SkillType.FIREBALL,
      name: 'ファイアボール',
      description: '遠距離の敵に範囲ダメージ',
      mpCost: 18,
      cooldown: 6,
      icon: '🔥',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    const playerPos = player.getPosition();
    const damage = player.getAttack() * 1.5;
    const range = 5; // 射程5マス

    // 範囲内の敵を攻撃
    let hitCount = 0;
    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;

      const enemyPos = enemy.getPosition();
      const distance = Math.max(
        Math.abs(enemyPos.x - playerPos.x),
        Math.abs(enemyPos.y - playerPos.y)
      );

      if (distance <= range) {
        const actualDamage = enemy.takeDamage(damage, player.name);
        eventBus.emit(GameEvents.COMBAT_HIT, {
          attacker: player.name,
          target: enemy.name,
          damage: Math.floor(actualDamage),
        });
        hitCount++;
      }
    }

    if (hitCount > 0) {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: `ファイアボール！${hitCount}体の敵を焼いた！`,
        type: 'success',
      });
    } else {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: 'ファイアボールは誰にも当たらなかった',
        type: 'info',
      });
    }
  }
}

/**
 * テレポートスキル
 * MP 21消費、ランダムな場所へ移動
 */
export class TeleportSkill extends Skill {
  constructor() {
    super({
      type: SkillType.TELEPORT,
      name: 'テレポート',
      description: 'ランダムな場所へ瞬間移動',
      mpCost: 21,
      cooldown: 10,
      icon: '⚡',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    // 注: マップ情報が必要なため、実際の移動はGame.tsで処理
    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: 'テレポート！',
      type: 'info',
    });
  }
}

/**
 * バーサークスキル
 * MP 14消費、攻撃力2倍・防御力半減（3ターン）
 */
export class BerserkSkill extends Skill {
  constructor() {
    super({
      type: SkillType.BERSERK,
      name: 'バーサーク',
      description: '攻撃力2倍、防御力半減（3ターン）',
      mpCost: 14,
      cooldown: 8,
      icon: '💢',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    // 注: ステータス変更は一時的な効果なので、StatusEffectシステムで管理すべき
    // 現状は簡易実装でメッセージのみ
    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: 'バーサーク発動！攻撃力が上昇した！',
      type: 'success',
    });
  }
}

/**
 * 氷の壁スキル
 * MP 10消費、周囲の敵の行動を遅延
 */
export class IceWallSkill extends Skill {
  constructor() {
    super({
      type: SkillType.ICE_WALL,
      name: '氷の壁',
      description: '周囲の敵を氷結させる',
      mpCost: 10,
      cooldown: 5,
      icon: '❄️',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    const playerPos = player.getPosition();
    let frozenCount = 0;

    // 周囲の敵を遅延
    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;

      const enemyPos = enemy.getPosition();
      const distance = Math.max(
        Math.abs(enemyPos.x - playerPos.x),
        Math.abs(enemyPos.y - playerPos.y)
      );

      if (distance <= 2) {
        frozenCount++;
      }
    }

    if (frozenCount > 0) {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: `氷の壁！${frozenCount}体の敵を遅延させた！`,
        type: 'success',
      });
    } else {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: '氷の壁を展開したが、近くに敵がいない',
        type: 'info',
      });
    }
  }
}

/**
 * ライフスティールスキル
 * MP 13消費、敵に攻撃してHP吸収
 */
export class LifeStealSkill extends Skill {
  constructor() {
    super({
      type: SkillType.LIFE_STEAL,
      name: 'ライフスティール',
      description: '敵を攻撃してHP吸収',
      mpCost: 13,
      cooldown: 4,
      icon: '🩸',
    });
  }

  protected execute(player: Player, enemies: Enemy[]): void {
    const playerPos = player.getPosition();
    const adjacent = enemies.filter(enemy => {
      if (!enemy.isAlive()) return false;
      const enemyPos = enemy.getPosition();
      const distance = Math.max(
        Math.abs(enemyPos.x - playerPos.x),
        Math.abs(enemyPos.y - playerPos.y)
      );
      return distance === 1;
    });

    if (adjacent.length === 0) {
      eventBus.emit(GameEvents.MESSAGE_LOG, {
        text: '攻撃できる敵がいない！',
        type: 'warning',
      });
      return;
    }

    const target = adjacent[0];
    const damage = player.getAttack() * 1.2;
    const actualDamage = target.takeDamage(damage, player.name);
    const healAmount = Math.floor(actualDamage * 0.5);
    player.stats.heal(healAmount);

    eventBus.emit(GameEvents.COMBAT_HIT, {
      attacker: player.name,
      target: target.name,
      damage: Math.floor(actualDamage),
    });

    eventBus.emit(GameEvents.MESSAGE_LOG, {
      text: `ライフスティール！${healAmount}HP吸収した！`,
      type: 'success',
    });

    eventBus.emit(GameEvents.UI_UPDATE);
  }
}

/**
 * スキルデータベース
 */
export const SkillDatabase: Record<SkillType, Skill> = {
  [SkillType.POWER_STRIKE]: new PowerStrikeSkill(),
  [SkillType.AREA_SLASH]: new AreaSlashSkill(),
  [SkillType.HEALING_PRAYER]: new HealingPrayerSkill(),
  [SkillType.FIREBALL]: new FireballSkill(),
  [SkillType.TELEPORT]: new TeleportSkill(),
  [SkillType.BERSERK]: new BerserkSkill(),
  [SkillType.ICE_WALL]: new IceWallSkill(),
  [SkillType.LIFE_STEAL]: new LifeStealSkill(),
};
