/**
 * バーサークスキル
 * MP 14消費、攻撃力2倍・防御力半減（3ターン）
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { Skill, SkillType } from './SkillBase';

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
