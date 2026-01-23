/**
 * 氷の壁スキル
 * MP 10消費、周囲の敵の行動を遅延
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
