/**
 * UI管理システム
 * ゲームUIの更新と表示を管理
 */

import { eventBus, GameEvents } from '@/core/EventBus';
import { MessageLog, MessageType } from './MessageLog';

export class UIManager {
  private messageLog: MessageLog;

  constructor() {
    this.messageLog = new MessageLog();
    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    // メッセージログイベント
    eventBus.on(GameEvents.MESSAGE_LOG, (data: { text: string; type?: MessageType }) => {
      this.messageLog.add(data.text, data.type || MessageType.INFO);
    });

    // プレイヤーダメージ
    eventBus.on(GameEvents.PLAYER_DAMAGE, (data: { damage: number; attacker: string }) => {
      this.messageLog.add(
        `${data.attacker}から${data.damage}ダメージを受けた！`,
        MessageType.COMBAT
      );
    });

    // プレイヤー死亡
    eventBus.on(GameEvents.PLAYER_DEATH, () => {
      this.messageLog.add('あなたは死んでしまった...', MessageType.DEATH);
      // showGameOver()はGame.tsで統計情報と共に呼ばれる
    });

    // 戦闘ヒット
    eventBus.on(GameEvents.COMBAT_HIT, (data: { attacker: string; target: string; damage: number }) => {
      this.messageLog.add(
        `${data.attacker}が${data.target}に${data.damage}ダメージを与えた！`,
        MessageType.COMBAT
      );
    });

    // 戦闘クリティカル
    eventBus.on(GameEvents.COMBAT_CRITICAL, (data: { attacker: string; target: string; damage: number }) => {
      this.messageLog.add(
        `クリティカル！${data.attacker}が${data.target}に${data.damage}ダメージを与えた！`,
        MessageType.COMBAT
      );
    });

    // 敵死亡
    eventBus.on(GameEvents.ENEMY_DEATH, (data: { name: string }) => {
      this.messageLog.add(`${data.name}を倒した！`, MessageType.COMBAT);
    });
  }

  /**
   * プレイヤーステータスを更新
   */
  updatePlayerStats(stats: {
    hp: number;
    maxHp: number;
    mp?: number;
    maxMp?: number;
    attack: number;
    defense: number;
    gold?: number;
  }): void {
    const hpElement = document.getElementById('player-hp');
    const maxHpElement = document.getElementById('player-max-hp');
    const mpElement = document.getElementById('player-mp');
    const maxMpElement = document.getElementById('player-max-mp');
    const attackElement = document.getElementById('player-attack');
    const defenseElement = document.getElementById('player-defense');
    const goldElement = document.getElementById('player-gold');

    if (hpElement) hpElement.textContent = stats.hp.toString();
    if (maxHpElement) maxHpElement.textContent = stats.maxHp.toString();
    if (mpElement && stats.mp !== undefined) mpElement.textContent = stats.mp.toString();
    if (maxMpElement && stats.maxMp !== undefined) maxMpElement.textContent = stats.maxMp.toString();
    if (attackElement) attackElement.textContent = stats.attack.toString();
    if (defenseElement) defenseElement.textContent = stats.defense.toString();
    if (goldElement && stats.gold !== undefined) goldElement.textContent = stats.gold.toString();
  }

  /**
   * 階層情報を更新
   */
  updateFloor(floor: number): void {
    const floorElement = document.getElementById('current-floor');
    if (floorElement) {
      floorElement.textContent = floor.toString();
    }
  }

  /**
   * スキル表示を更新
   */
  updateSkills(skills: Array<{
    name: string;
    icon: string;
    mpCost: number;
    cooldown: number;
    canUse: boolean;
    hasEnoughMp: boolean;
    key: string;
  }>): void {
    const skillsListElement = document.getElementById('skills-list');
    if (!skillsListElement) return;

    skillsListElement.innerHTML = '';

    for (const skill of skills) {
      const skillDiv = document.createElement('div');

      // クラスを決定
      let skillClass = 'skill';
      if (skill.cooldown > 0) {
        skillClass += ' skill-cooldown';
      } else if (!skill.hasEnoughMp) {
        skillClass += ' skill-no-mp';
      } else if (skill.canUse) {
        skillClass += ' skill-ready';
      }

      skillDiv.className = skillClass;

      // スキル名
      const nameSpan = document.createElement('span');
      nameSpan.className = 'skill-name';
      nameSpan.textContent = `${skill.icon} ${skill.name}`;
      skillDiv.appendChild(nameSpan);

      // MPコストまたはクールダウン
      if (skill.cooldown > 0) {
        const cdSpan = document.createElement('span');
        cdSpan.className = 'skill-cd';
        cdSpan.textContent = `CD: ${skill.cooldown}`;
        skillDiv.appendChild(cdSpan);
      } else {
        const costSpan = document.createElement('span');
        costSpan.className = 'skill-cost';
        costSpan.textContent = `MP ${skill.mpCost}`;
        skillDiv.appendChild(costSpan);
      }

      // キー表示
      const keySpan = document.createElement('span');
      keySpan.className = 'skill-key';
      keySpan.textContent = `[${skill.key}]`;
      skillDiv.appendChild(keySpan);

      skillsListElement.appendChild(skillDiv);
    }
  }

  /**
   * 装備表示を更新
   */
  updateEquipment(equipment: {
    weapon?: { name: string; rarity: string } | null;
    armor?: { name: string; rarity: string } | null;
    accessory?: { name: string; rarity: string } | null;
  }): void {
    const weaponElement = document.getElementById('equipped-weapon');
    const armorElement = document.getElementById('equipped-armor');
    const accessoryElement = document.getElementById('equipped-accessory');

    if (weaponElement) {
      if (equipment.weapon) {
        weaponElement.textContent = equipment.weapon.name;
        weaponElement.className = `slot-item item-${equipment.weapon.rarity.toLowerCase()}`;
      } else {
        weaponElement.textContent = 'なし';
        weaponElement.className = 'slot-item';
      }
    }

    if (armorElement) {
      if (equipment.armor) {
        armorElement.textContent = equipment.armor.name;
        armorElement.className = `slot-item item-${equipment.armor.rarity.toLowerCase()}`;
      } else {
        armorElement.textContent = 'なし';
        armorElement.className = 'slot-item';
      }
    }

    if (accessoryElement) {
      if (equipment.accessory) {
        accessoryElement.textContent = equipment.accessory.name;
        accessoryElement.className = `slot-item item-${equipment.accessory.rarity.toLowerCase()}`;
      } else {
        accessoryElement.textContent = 'なし';
        accessoryElement.className = 'slot-item';
      }
    }
  }

  /**
   * ゲームオーバー画面を表示
   */
  showGameOver(statistics?: {
    floor: number;
    enemiesKilled: number;
    bossesDefeated: number;
    itemsCollected: number;
    chestsOpened: number;
    goldEarned: number;
    turnsPlayed: number;
  }): void {
    const gameOverElement = document.getElementById('game-over');
    if (!gameOverElement) return;

    // 統計情報を表示
    if (statistics) {
      const score = this.calculateScore(statistics);

      const finalFloor = document.getElementById('final-floor');
      const enemiesKilled = document.getElementById('enemies-killed');
      const bossesDefeated = document.getElementById('bosses-defeated');
      const itemsCollected = document.getElementById('items-collected');
      const chestsOpened = document.getElementById('chests-opened');
      const goldEarned = document.getElementById('gold-earned');
      const turnsPlayed = document.getElementById('turns-played');
      const finalScore = document.getElementById('final-score');

      if (finalFloor) finalFloor.textContent = statistics.floor.toString();
      if (enemiesKilled) enemiesKilled.textContent = statistics.enemiesKilled.toString();
      if (bossesDefeated) bossesDefeated.textContent = statistics.bossesDefeated.toString();
      if (itemsCollected) itemsCollected.textContent = statistics.itemsCollected.toString();
      if (chestsOpened) chestsOpened.textContent = statistics.chestsOpened.toString();
      if (goldEarned) goldEarned.textContent = statistics.goldEarned.toString();
      if (turnsPlayed) turnsPlayed.textContent = statistics.turnsPlayed.toString();
      if (finalScore) finalScore.textContent = score.toLocaleString();
    }

    gameOverElement.style.display = 'block';
  }

  /**
   * スコアを計算
   */
  private calculateScore(statistics: {
    floor: number;
    enemiesKilled: number;
    bossesDefeated: number;
    itemsCollected: number;
    chestsOpened: number;
    goldEarned: number;
    turnsPlayed: number;
  }): number {
    // スコア計算式:
    // - 到達階層 × 1000
    // - 倒した敵 × 100
    // - ボス撃破 × 5000
    // - アイテム収集 × 50
    // - 宝箱開封 × 200
    // - 獲得ゴールド × 1
    // - ターン効率ボーナス（敵を早く倒すほど高い）

    let score = 0;
    score += statistics.floor * 1000;
    score += statistics.enemiesKilled * 100;
    score += statistics.bossesDefeated * 5000;
    score += statistics.itemsCollected * 50;
    score += statistics.chestsOpened * 200;
    score += statistics.goldEarned;

    // ターン効率ボーナス（少ないターンで多くの敵を倒した場合）
    if (statistics.turnsPlayed > 0 && statistics.enemiesKilled > 0) {
      const efficiency = statistics.enemiesKilled / statistics.turnsPlayed;
      const efficiencyBonus = Math.floor(efficiency * 10000);
      score += efficiencyBonus;
    }

    return Math.max(0, score);
  }

  /**
   * ゲームオーバー画面を非表示
   */
  hideGameOver(): void {
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
      gameOverElement.style.display = 'none';
    }
  }

  /**
   * メッセージログを取得
   */
  getMessageLog(): MessageLog {
    return this.messageLog;
  }

  /**
   * メッセージを追加（外部から）
   */
  addMessage(text: string, type: MessageType = MessageType.INFO): void {
    this.messageLog.add(text, type);
  }

  /**
   * ステータス効果を更新
   */
  updateStatusEffects(effects: Array<{ type: string; duration: number }>): void {
    const panel = document.getElementById('status-effects-panel');
    const list = document.getElementById('status-effects-list');

    if (!panel || !list) return;

    // エフェクトがない場合は非表示
    if (effects.length === 0) {
      panel.classList.remove('has-effects');
      list.textContent = '';
      return;
    }

    // エフェクトがある場合は表示
    panel.classList.add('has-effects');
    list.textContent = '';

    // 日本語名マッピング
    const effectNames: Record<string, string> = {
      POISON: '毒',
      PARALYSIS: '麻痺',
      CONFUSION: '混乱',
      REGENERATION: '再生',
      STRENGTH: '強化',
      WEAKNESS: '弱体',
      SPEED_UP: '加速',
      SPEED_DOWN: '減速',
    };

    effects.forEach(effect => {
      const effectDiv = document.createElement('div');
      effectDiv.className = `status-effect ${effect.type.toLowerCase()}`;
      const name = effectNames[effect.type] || effect.type;
      effectDiv.textContent = `${name} (${effect.duration})`;
      list.appendChild(effectDiv);
    });
  }
}
