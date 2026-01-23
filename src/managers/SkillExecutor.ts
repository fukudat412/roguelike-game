/**
 * スキル実行マネージャー
 * スキルの使用・検証・効果処理を担当
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { UIManager } from '@/ui/UIManager';
import { MessageType } from '@/ui/MessageLog';
import { SoundManager, SoundType } from '@/utils/SoundManager';
import { MetaProgression } from '@/character/MetaProgression';

/**
 * スキル実行マネージャークラス
 * プレイヤーのスキル使用を一元管理
 */
export class SkillExecutor {
  private player: Player;
  private enemies: Enemy[];
  private uiManager: UIManager;
  private soundManager: SoundManager;
  private metaProgression: MetaProgression;

  constructor(
    player: Player,
    enemies: Enemy[],
    uiManager: UIManager,
    soundManager: SoundManager,
    metaProgression: MetaProgression
  ) {
    this.player = player;
    this.enemies = enemies;
    this.uiManager = uiManager;
    this.soundManager = soundManager;
    this.metaProgression = metaProgression;
  }

  /**
   * スキルを使用
   * @param skillIndex - 使用するスキルのインデックス
   * @returns スキル使用成功したかどうか（ターン消費の判定）
   */
  useSkill(skillIndex: number): boolean {
    const skill = this.player.getSkill(skillIndex);
    if (!skill) {
      return false;
    }

    if (!skill.canUse(this.player)) {
      if (skill.currentCooldown > 0) {
        this.uiManager.addMessage(
          `${skill.data.name}はクールダウン中です (残り${skill.currentCooldown}ターン)`,
          MessageType.WARNING
        );
      } else {
        this.uiManager.addMessage(
          `MPが足りません (必要: ${skill.data.mpCost}, 現在: ${this.player.stats.mp})`,
          MessageType.WARNING
        );
      }
      this.soundManager.play(SoundType.ERROR);
      return false;
    }

    const success = skill.use(this.player, this.enemies);
    if (success) {
      // メタプログレッションに記録
      this.metaProgression.recordSkillUsed();

      this.soundManager.play(SoundType.SKILL);
      return true; // ターン消費
    }

    return false;
  }
}
