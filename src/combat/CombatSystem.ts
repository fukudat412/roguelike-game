/**
 * 戦闘システム
 * ダメージ計算、攻撃処理
 */

import { CombatEntity } from '@/entities/Entity';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { eventBus, GameEvents } from '@/core/EventBus';
import { StatusEffectType, StatusEffect } from './StatusEffect';
import { MetaProgression } from '@/character/MetaProgression';

export class CombatSystem {
  private static metaProgression: MetaProgression | null = null;

  /**
   * メタプログレッションを設定
   */
  static setMetaProgression(metaProgression: MetaProgression): void {
    this.metaProgression = metaProgression;
  }

  /**
   * 攻撃を実行
   */
  static attack(attacker: CombatEntity, defender: CombatEntity): void {
    // ダメージ計算
    const damage = this.calculateDamage(attacker, defender);

    // クリティカルヒット判定
    let baseCritRate = 0.1; // 基本クリティカル率10%

    // プレイヤーが攻撃者の場合、メタプログレッションのクリティカル率ボーナスを適用
    if (attacker instanceof Player && this.metaProgression) {
      baseCritRate += this.metaProgression.getCriticalRateBonus() / 100; // パーセント→小数
    }

    const isCritical = Math.random() < baseCritRate;

    // クリティカルダメージ倍率
    let critMultiplier = 2.0; // 基本倍率2倍

    // プレイヤーが攻撃者の場合、メタプログレッションのクリティカルダメージボーナスを適用
    if (attacker instanceof Player && this.metaProgression) {
      critMultiplier += this.metaProgression.getCriticalDamageBonus(); // 0.25 → 2.25倍
    }

    const finalDamage = isCritical ? damage * critMultiplier : damage;

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

    // 特殊攻撃の処理（敵がプレイヤーに攻撃する場合）
    if (attacker instanceof Enemy && defender instanceof Player && attacker.specialAttack) {
      this.processSpecialAttack(attacker, defender, actualDamage);
    }
  }

  /**
   * 特殊攻撃を処理
   */
  private static processSpecialAttack(attacker: Enemy, defender: Player, damage: number): void {
    const special = attacker.specialAttack!;

    // 確率判定
    if (Math.random() > special.chance) return;

    switch (special.type) {
      case 'poison':
        // 毒付与
        defender.statusEffects.addEffect(
          new StatusEffect(StatusEffectType.POISON, special.duration || 3)
        );
        eventBus.emit(GameEvents.MESSAGE_LOG, {
          text: `${attacker.name}の攻撃で毒を受けた！`,
          type: 'warning',
        });
        break;

      case 'paralyze':
        // 麻痺付与
        defender.statusEffects.addEffect(
          new StatusEffect(StatusEffectType.PARALYSIS, special.duration || 2)
        );
        eventBus.emit(GameEvents.MESSAGE_LOG, {
          text: `${attacker.name}の攻撃で体が痺れた！`,
          type: 'warning',
        });
        break;

      case 'weaken':
        // 脆弱付与
        defender.statusEffects.addEffect(
          new StatusEffect(StatusEffectType.WEAKNESS, special.duration || 3)
        );
        eventBus.emit(GameEvents.MESSAGE_LOG, {
          text: `${attacker.name}の攻撃で防御力が下がった！`,
          type: 'warning',
        });
        break;

      case 'vampiric':
        // HP吸収
        const healAmount = Math.floor(damage * (special.strength || 0.3));
        attacker.stats.heal(healAmount);
        eventBus.emit(GameEvents.MESSAGE_LOG, {
          text: `${attacker.name}が${healAmount}HP吸収した！`,
          type: 'warning',
        });
        break;
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
