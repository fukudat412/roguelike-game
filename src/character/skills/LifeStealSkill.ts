/**
 * ライフスティールスキル
 * MP 13消費、敵に攻撃してHP吸収
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
