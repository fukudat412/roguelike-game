/**
 * 強打スキル
 * MP 7消費、2倍ダメージの単体攻撃
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
