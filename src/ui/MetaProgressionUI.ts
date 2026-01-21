/**
 * メタプログレッション UI
 * 統計表示とアップグレード購入
 */

import { MetaProgression, Upgrade } from '@/character/MetaProgression';

export class MetaProgressionUI {
  private panel: HTMLElement | null;
  private statsContainer: HTMLElement | null;
  private upgradesContainer: HTMLElement | null;
  private isOpen: boolean = false;
  private metaProgression: MetaProgression | null = null;
  private onPurchaseCallback: ((upgrade: Upgrade) => void) | null = null;

  constructor() {
    this.panel = document.getElementById('meta-progression-panel');
    this.statsContainer = document.getElementById('meta-stats');
    this.upgradesContainer = document.getElementById('meta-upgrades-list');

    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    const closeBtn = document.getElementById('close-meta-btn');
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
   * メタプログレッションを設定
   */
  setMetaProgression(
    metaProgression: MetaProgression,
    onPurchase: (upgrade: Upgrade) => void
  ): void {
    this.metaProgression = metaProgression;
    this.onPurchaseCallback = onPurchase;
    this.render();
  }

  /**
   * UIを開く
   */
  open(): void {
    if (!this.panel) return;
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
   * 表示を切り替え
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * UIを描画
   */
  private render(): void {
    if (!this.metaProgression || !this.statsContainer || !this.upgradesContainer) return;

    // 統計情報を描画
    this.renderStats();

    // アップグレードリストを描画
    this.renderUpgrades();
  }

  /**
   * 統計情報を描画
   */
  private renderStats(): void {
    if (!this.statsContainer || !this.metaProgression) return;

    const stats = this.metaProgression.getStats();
    const bonuses = this.metaProgression.getPermanentBonuses();

    // クリア
    this.statsContainer.textContent = '';

    // 統計項目
    const statItems = [
      { label: '総ゲーム数:', value: stats.totalRuns },
      { label: '総撃破数:', value: stats.totalKills },
      { label: '最深階層:', value: `${stats.deepestFloor}階` },
      { label: '総獲得ゴールド:', value: `${stats.totalGoldEarned}G` },
      { label: 'ボス撃破数:', value: stats.totalBossesKilled },
    ];

    for (const item of statItems) {
      const div = document.createElement('div');
      div.className = 'meta-stat-item';

      const label = document.createElement('span');
      label.className = 'meta-stat-label';
      label.textContent = item.label;

      const value = document.createElement('span');
      value.className = 'meta-stat-value';
      value.textContent = String(item.value);

      div.appendChild(label);
      div.appendChild(value);
      this.statsContainer.appendChild(div);
    }

    // ボーナス表示
    const bonusesDiv = document.createElement('div');
    bonusesDiv.className = 'meta-bonuses';

    const bonusTitle = document.createElement('h4');
    bonusTitle.textContent = '現在のボーナス:';
    bonusesDiv.appendChild(bonusTitle);

    const bonusList = document.createElement('div');
    bonusList.className = 'meta-bonus-list';

    const bonusItems = [];
    if (bonuses.hp > 0) bonusItems.push(`HP +${bonuses.hp}`);
    if (bonuses.mp > 0) bonusItems.push(`MP +${bonuses.mp}`);
    if (bonuses.attack > 0) bonusItems.push(`攻撃 +${bonuses.attack}`);
    if (bonuses.defense > 0) bonusItems.push(`防御 +${bonuses.defense}`);
    if (bonuses.gold > 0) bonusItems.push(`初期G +${bonuses.gold}`);

    if (bonusItems.length === 0) {
      const noneSpan = document.createElement('span');
      noneSpan.className = 'meta-bonus-none';
      noneSpan.textContent = 'なし';
      bonusList.appendChild(noneSpan);
    } else {
      for (const item of bonusItems) {
        const bonusSpan = document.createElement('span');
        bonusSpan.className = 'meta-bonus';
        bonusSpan.textContent = item;
        bonusList.appendChild(bonusSpan);
      }
    }

    bonusesDiv.appendChild(bonusList);
    this.statsContainer.appendChild(bonusesDiv);

    // 最終ボス撃破実績
    if (stats.defeatedFinalBosses && stats.defeatedFinalBosses.length > 0) {
      const achievementsDiv = document.createElement('div');
      achievementsDiv.className = 'meta-bonuses';
      achievementsDiv.style.marginTop = '15px';

      const achievementTitle = document.createElement('h4');
      achievementTitle.textContent = '🏆 最終ボス撃破実績:';
      achievementsDiv.appendChild(achievementTitle);

      const achievementList = document.createElement('div');
      achievementList.className = 'meta-bonus-list';

      const dungeonNames: Record<string, string> = {
        CAVE: '🦁 野獣の洞窟',
        CRYPT: '💀 忘れられた墓地',
        FORTRESS: '🏰 放棄された要塞',
        TOWER: '🗼 魔法使いの塔',
      };

      for (const dungeonType of stats.defeatedFinalBosses) {
        const achievementSpan = document.createElement('span');
        achievementSpan.className = 'meta-bonus';
        achievementSpan.style.backgroundColor = '#4a3a2a';
        achievementSpan.style.borderColor = '#ffaa00';
        achievementSpan.style.color = '#ffdd57';
        achievementSpan.textContent = dungeonNames[dungeonType] || dungeonType;
        achievementList.appendChild(achievementSpan);
      }

      achievementsDiv.appendChild(achievementList);
      this.statsContainer.appendChild(achievementsDiv);
    }
  }

  /**
   * アップグレードリストを描画
   */
  private renderUpgrades(): void {
    if (!this.upgradesContainer || !this.metaProgression) return;

    const stats = this.metaProgression.getStats();
    const availableUpgrades = this.metaProgression.getAvailableUpgrades();
    const unlockedUpgrades = this.metaProgression.getUnlockedUpgrades();

    // クリア
    this.upgradesContainer.textContent = '';

    // 利用可能なアップグレード
    if (availableUpgrades.length > 0) {
      const availableSection = document.createElement('div');
      availableSection.className = 'meta-upgrade-section';

      const title = document.createElement('h4');
      title.textContent = '購入可能:';
      availableSection.appendChild(title);

      for (const upgrade of availableUpgrades) {
        const canAfford = stats.totalKills >= upgrade.cost;
        const upgradeDiv = this.createUpgradeElement(upgrade, canAfford, false);
        availableSection.appendChild(upgradeDiv);
      }

      this.upgradesContainer.appendChild(availableSection);
    }

    // アンロック済みアップグレード
    if (unlockedUpgrades.length > 0) {
      const unlockedSection = document.createElement('div');
      unlockedSection.className = 'meta-upgrade-section';

      const title = document.createElement('h4');
      title.textContent = '取得済み:';
      unlockedSection.appendChild(title);

      for (const upgrade of unlockedUpgrades) {
        const upgradeDiv = this.createUpgradeElement(upgrade, true, true);
        unlockedSection.appendChild(upgradeDiv);
      }

      this.upgradesContainer.appendChild(unlockedSection);
    }

    if (availableUpgrades.length === 0 && unlockedUpgrades.length === 0) {
      const noUpgrades = document.createElement('div');
      noUpgrades.className = 'meta-no-upgrades';
      noUpgrades.textContent = 'アップグレードがありません';
      this.upgradesContainer.appendChild(noUpgrades);
    }
  }

  /**
   * アップグレード要素を作成
   */
  private createUpgradeElement(
    upgrade: Upgrade,
    canAfford: boolean,
    isUnlocked: boolean
  ): HTMLElement {
    const upgradeDiv = document.createElement('div');
    upgradeDiv.className = `meta-upgrade-item ${isUnlocked ? 'unlocked' : canAfford ? 'affordable' : 'locked'}`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'meta-upgrade-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'meta-upgrade-name';
    nameDiv.textContent = isUnlocked ? `${upgrade.name} ✓` : upgrade.name;

    const descDiv = document.createElement('div');
    descDiv.className = 'meta-upgrade-desc';
    descDiv.textContent = upgrade.description;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(descDiv);

    if (!isUnlocked) {
      const costDiv = document.createElement('div');
      costDiv.className = 'meta-upgrade-cost';
      costDiv.textContent = `必要撃破数: ${upgrade.cost} ${canAfford ? '✓' : '✗'}`;
      infoDiv.appendChild(costDiv);

      const btn = document.createElement('button');
      btn.className = 'meta-upgrade-btn';
      btn.textContent = canAfford ? '購入' : 'ロック';
      btn.disabled = !canAfford;

      if (canAfford) {
        btn.addEventListener('click', () => this.handlePurchase(upgrade));
      }

      upgradeDiv.appendChild(infoDiv);
      upgradeDiv.appendChild(btn);
    } else {
      upgradeDiv.appendChild(infoDiv);
    }

    return upgradeDiv;
  }

  /**
   * アップグレード購入処理
   */
  private handlePurchase(upgrade: Upgrade): void {
    if (this.onPurchaseCallback) {
      this.onPurchaseCallback(upgrade);
      this.render(); // 再描画
    }
  }
}
