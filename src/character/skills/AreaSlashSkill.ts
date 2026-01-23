/**
 * 範囲斬りスキル
 * MP 10消費、周囲8マスの敵全てに攻撃
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
