/**
 * スキル選択UI
 * プレイヤーが新しいスキルを習得するためのインターフェース
 */

import { Player } from '@/entities/Player';
import {
  Skill,
  PowerStrikeSkill,
  AreaSlashSkill,
  HealingPrayerSkill,
  FireballSkill,
  TeleportSkill,
  BerserkSkill,
  IceWallSkill,
  LifeStealSkill,
} from '@/character/skills';

export class SkillSelectionUI {
  private panel: HTMLElement | null;
  private skillListContainer: HTMLElement | null;
  private isOpen: boolean = false;
  private player: Player | null = null;
  private onLearnCallback: ((skill: Skill) => void) | null = null;

  // 習得可能なスキル一覧
  private readonly availableSkills: Array<{ skill: () => Skill; keyBinding: string }> = [
    { skill: () => new PowerStrikeSkill(), keyBinding: '1' },
    { skill: () => new AreaSlashSkill(), keyBinding: '3' },
    { skill: () => new HealingPrayerSkill(), keyBinding: '5' },
    { skill: () => new FireballSkill(), keyBinding: '7' },
    { skill: () => new TeleportSkill(), keyBinding: '9' },
    { skill: () => new BerserkSkill(), keyBinding: 'Q' },
    { skill: () => new IceWallSkill(), keyBinding: 'E' },
    { skill: () => new LifeStealSkill(), keyBinding: 'R' },
  ];

  constructor() {
    this.panel = document.getElementById('skill-selection-panel');
    this.skillListContainer = document.getElementById('skill-selection-list');
    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    const closeBtn = document.getElementById('close-skill-selection-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // ESCキーで閉じる
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * プレイヤーとコールバックを設定
   */
  setPlayer(player: Player, onLearn: (skill: Skill) => void): void {
    this.player = player;
    this.onLearnCallback = onLearn;
  }

  /**
   * UIを開く
   */
  open(): void {
    if (!this.panel || !this.player) return;

    // スキルポイントがない場合は開かない
    if (this.player.skillPoints <= 0) {
      return;
    }

    this.panel.style.display = 'block';
    this.isOpen = true;
    this.render();
  }

  /**
   * UIを閉じる
   */
  close(): void {
    if (!this.panel) return;
    this.panel.style.display = 'none';
    this.isOpen = false;
  }

  /**
   * UIを描画
   */
  private render(): void {
    if (!this.skillListContainer || !this.player) return;

    // クリア
    this.skillListContainer.textContent = '';

    // ヘッダー情報
    const header = document.createElement('div');
    header.style.marginBottom = '15px';
    header.style.textAlign = 'center';

    const pointsTitle = document.createElement('div');
    pointsTitle.style.color = '#ffdd57';
    pointsTitle.style.fontSize = '16px';
    pointsTitle.style.marginBottom = '5px';
    pointsTitle.textContent = 'スキルポイント: ';

    const pointsValue = document.createElement('span');
    pointsValue.style.fontSize = '24px';
    pointsValue.style.fontWeight = 'bold';
    pointsValue.textContent = String(this.player.skillPoints);
    pointsTitle.appendChild(pointsValue);

    const helpText = document.createElement('div');
    helpText.style.color = '#999';
    helpText.style.fontSize = '12px';
    helpText.textContent = '習得したいスキルを選択してください';

    header.appendChild(pointsTitle);
    header.appendChild(helpText);
    this.skillListContainer.appendChild(header);

    // スキル一覧を描画
    for (const { skill: skillFactory, keyBinding } of this.availableSkills) {
      const skill = skillFactory();
      const isLearned = this.player.hasSkill(skill.data.name);
      const skillCard = this.createSkillCard(skill, keyBinding, isLearned);
      this.skillListContainer.appendChild(skillCard);
    }
  }

  /**
   * スキルカードを作成
   */
  private createSkillCard(skill: Skill, keyBinding: string, isLearned: boolean): HTMLElement {
    const card = document.createElement('div');
    card.className = 'skill-selection-card';

    if (isLearned) {
      card.classList.add('learned');
    }

    // スキル名
    const nameDiv = document.createElement('div');
    nameDiv.className = 'skill-selection-name';
    nameDiv.textContent = isLearned ? `${skill.data.name} ✓` : skill.data.name;
    card.appendChild(nameDiv);

    // キーバインディング
    const keyDiv = document.createElement('div');
    keyDiv.className = 'skill-selection-key';
    keyDiv.textContent = `キー: ${keyBinding}`;
    card.appendChild(keyDiv);

    // 説明
    const descDiv = document.createElement('div');
    descDiv.className = 'skill-selection-desc';
    descDiv.textContent = skill.data.description;
    card.appendChild(descDiv);

    // コスト
    const costDiv = document.createElement('div');
    costDiv.className = 'skill-selection-cost';
    costDiv.textContent = `消費MP: ${skill.data.mpCost}`;
    card.appendChild(costDiv);

    if (!isLearned && this.player && this.player.skillPoints > 0) {
      // 習得ボタン
      const learnBtn = document.createElement('button');
      learnBtn.className = 'skill-selection-btn';
      learnBtn.textContent = '習得';
      learnBtn.addEventListener('click', () => this.handleLearnSkill(skill));
      card.appendChild(learnBtn);
    } else if (isLearned) {
      // 習得済みラベル
      const learnedLabel = document.createElement('div');
      learnedLabel.className = 'skill-selection-learned';
      learnedLabel.textContent = '習得済み';
      card.appendChild(learnedLabel);
    }

    return card;
  }

  /**
   * スキル習得処理
   */
  private handleLearnSkill(skill: Skill): void {
    if (!this.player || !this.onLearnCallback) return;

    const success = this.player.learnSkill(skill);
    if (success) {
      this.onLearnCallback(skill);
      this.render(); // 再描画

      // スキルポイントがなくなったら閉じる
      if (this.player.skillPoints <= 0) {
        setTimeout(() => this.close(), 500);
      }
    }
  }
}
