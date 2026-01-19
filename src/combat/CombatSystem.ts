/**
 * 戦闘システム
 * ダメージ計算、攻撃処理
 */

import { CombatEntity } from '@/entities/Entity';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';

export class CombatSystem {
  /**
   * 攻撃を実行
   */
  static attack(attacker: CombatEntity, defender: CombatEntity): void {
    // ダメージ計算
    const damage = this.calculateDamage(attacker, defender);

    // クリティカルヒット判定（10%の確率）
    const isCritical = Math.random() < 0.1;
    const finalDamage = isCritical ? damage * 2 : damage;

    // ダメージを与える
    const actualDamage = defender.takeDamage(finalDamage, attacker.name);

    // イベント発火
    if (isCritical) {
      eventBus.emit(GameEvents.COMBAT_CRITICAL, {
        attacker: attacker.name,
        target: defender.name,
        damage: Math.floor(actualDamage),
      });
    } else {
      eventBus.emit(GameEvents.COMBAT_HIT, {
        attacker: attacker.name,
        target: defender.name,
        damage: Math.floor(actualDamage),
      });
    }

    // 敵が倒れた場合の経験値付与（プレイヤーが攻撃者の場合）
    if (defender.stats.isDead() && attacker instanceof Player && defender instanceof Enemy) {
      attacker.gainExperience(defender.experienceValue);
    }
  }

  /**
   * ダメージを計算
   * baseDamage = attack - defense / 2
   * actualDamage = baseDamage * random(0.85, 1.15)
   */
  private static calculateDamage(attacker: CombatEntity, defender: CombatEntity): number {
    const attack = attacker.getAttack();
    const defense = defender.getDefense();

    // 基本ダメージ
    const baseDamage = Math.max(1, attack - defense / 2);

    // ランダム変動（85% - 115%）
    const variance = 0.85 + Math.random() * 0.3;
    const actualDamage = baseDamage * variance;

    return Math.max(1, Math.floor(actualDamage));
  }

  /**
   * 隣接しているかチェック
   */
  static isAdjacent(entity1: CombatEntity, entity2: CombatEntity): boolean {
    const distance = entity1.distanceTo(entity2);
    return distance <= 1.5; // 斜めも含む（√2 ≈ 1.41）
  }

  /**
   * 近接攻撃可能かチェック
   */
  static canMeleeAttack(attacker: CombatEntity, target: CombatEntity): boolean {
    return this.isAdjacent(attacker, target) && target.isAlive();
  }
}
