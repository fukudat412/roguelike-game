/**
 * 回復の祈りスキル
 * MP 14消費、HP 50回復
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
