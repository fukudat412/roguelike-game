/**
 * ファイアボールスキル
 * MP 18消費、遠距離範囲攻撃（3x3）
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
