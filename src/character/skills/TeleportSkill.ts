/**
 * テレポートスキル
 * MP 21消費、ランダムな場所へ移動
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
