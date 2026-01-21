/**
 * メタプログレッション UI（完全リニューアル版）
 * タブベースのインターフェースで統計、実績、アップグレードを表示
 */

import {
  MetaProgression,
  Upgrade,
  UpgradeDatabase,
  UpgradeType,
  Achievement,
  AchievementDatabase,
  AchievementType,
} from '@/character/MetaProgression';

enum Tab {
  STATS,
  ACHIEVEMENTS,
  UPGRADES,
}

export class MetaProgressionUI {
  private panel: HTMLElement | null;
  private isOpen: boolean = false;
  private metaProgression: MetaProgression | null = null;
  private onPurchaseCallback: ((upgrade: Upgrade) => void) | null = null;
  private currentTab: Tab = Tab.STATS;

  constructor() {
    this.panel = document.getElementById('meta-progression-panel');
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
    if (!this.metaProgression || !this.panel) return;

    // パネルをクリア
    const content = this.panel.querySelector('.meta-progression-content');
    if (!content) return;

    // 全体をクリア
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    // ヘッダー（SP表示）
    const header = this.createHeader();
    content.appendChild(header);

    // タブメニュー
    const tabs = this.createTabs();
    content.appendChild(tabs);

    // タブコンテンツ
    const tabContent = this.createTabContent();
    content.appendChild(tabContent);
  }

  /**
   * ヘッダー作成（SP表示）
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'meta-header';

    const stats = this.metaProgression!.getStats();

    const spDisplay = document.createElement('div');
    spDisplay.className = 'meta-sp-display';
    spDisplay.innerHTML = `
      <div class="meta-sp-icon">✨</div>
      <div class="meta-sp-info">
        <div class="meta-sp-label">ソウルポイント</div>
        <div class="meta-sp-value">${stats.soulPoints.toLocaleString()}</div>
        <div class="meta-sp-lifetime">累計: ${stats.lifetimeSoulPoints.toLocaleString()} SP</div>
      </div>
    `;

    header.appendChild(spDisplay);
    return header;
  }

  /**
   * タブメニュー作成
   */
  private createTabs(): HTMLElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'meta-tabs';

    const tabs = [
      { tab: Tab.STATS, label: '📊 統計', icon: '📊' },
      { tab: Tab.ACHIEVEMENTS, label: '🏆 実績', icon: '🏆' },
      { tab: Tab.UPGRADES, label: '⬆️ 強化', icon: '⬆️' },
    ];

    for (const { tab, label } of tabs) {
      const tabBtn = document.createElement('button');
      tabBtn.className = tab === this.currentTab ? 'meta-tab active' : 'meta-tab';
      tabBtn.textContent = label;
      tabBtn.addEventListener('click', () => {
        this.currentTab = tab;
        this.render();
      });
      tabsContainer.appendChild(tabBtn);
    }

    return tabsContainer;
  }

  /**
   * タブコンテンツ作成
   */
  private createTabContent(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'meta-tab-content';

    switch (this.currentTab) {
      case Tab.STATS:
        content.appendChild(this.createStatsTab());
        break;
      case Tab.ACHIEVEMENTS:
        content.appendChild(this.createAchievementsTab());
        break;
      case Tab.UPGRADES:
        content.appendChild(this.createUpgradesTab());
        break;
    }

    return content;
  }

  /**
   * 統計タブ作成
   */
  private createStatsTab(): HTMLElement {
    const tab = document.createElement('div');
    tab.className = 'stats-tab';

    const stats = this.metaProgression!.getStats();

    const statsData = [
      { label: '総プレイ回数', value: stats.totalRuns, icon: '🎮' },
      { label: '総撃破数', value: stats.totalKills, icon: '⚔️' },
      { label: '最深階層', value: `${stats.maxFloorReached}階`, icon: '🏔️' },
      { label: '最大ダメージ', value: stats.maxDamageDealt, icon: '💥' },
      { label: 'ボス撃破数', value: stats.totalBossesKilled, icon: '👹' },
      { label: 'クリア回数', value: stats.totalDungeonsCleared, icon: '🏅' },
      { label: '総獲得ゴールド', value: `${stats.totalGoldEarned}G`, icon: '💰' },
      { label: '死亡回数', value: stats.totalDeaths, icon: '💀' },
    ];

    for (const { label, value, icon } of statsData) {
      const statItem = document.createElement('div');
      statItem.className = 'meta-stat-card';
      statItem.innerHTML = `
        <div class="meta-stat-icon">${icon}</div>
        <div class="meta-stat-info">
          <div class="meta-stat-label">${label}</div>
          <div class="meta-stat-value">${value}</div>
        </div>
      `;
      tab.appendChild(statItem);
    }

    return tab;
  }

  /**
   * 実績タブ作成
   */
  private createAchievementsTab(): HTMLElement {
    const tab = document.createElement('div');
    tab.className = 'achievements-tab';

    const unlockedAchievements = this.metaProgression!.getUnlockedAchievements();
    const allAchievements = Object.values(AchievementDatabase);

    // フィルタボタン
    const filterContainer = document.createElement('div');
    filterContainer.className = 'achievement-filters';

    const showAll = document.createElement('button');
    showAll.className = 'achievement-filter-btn active';
    showAll.textContent = 'すべて';
    showAll.addEventListener('click', () => this.renderAchievements(tab, 'all'));

    const showUnlocked = document.createElement('button');
    showUnlocked.className = 'achievement-filter-btn';
    showUnlocked.textContent = '解禁済み';
    showUnlocked.addEventListener('click', () => this.renderAchievements(tab, 'unlocked'));

    const showLocked = document.createElement('button');
    showLocked.className = 'achievement-filter-btn';
    showLocked.textContent = '未解禁';
    showLocked.addEventListener('click', () => this.renderAchievements(tab, 'locked'));

    filterContainer.appendChild(showAll);
    filterContainer.appendChild(showUnlocked);
    filterContainer.appendChild(showLocked);

    tab.appendChild(filterContainer);

    // 実績リスト
    const listContainer = document.createElement('div');
    listContainer.className = 'achievement-list';
    tab.appendChild(listContainer);

    // 初期表示（すべて）
    this.renderAchievementList(listContainer, allAchievements, unlockedAchievements);

    return tab;
  }

  /**
   * 実績リストを描画
   */
  private renderAchievementList(
    container: HTMLElement,
    achievements: Achievement[],
    unlockedAchievements: Achievement[]
  ): void {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const unlockedTypes = unlockedAchievements.map(a => a.type);

    for (const achievement of achievements) {
      const isUnlocked = unlockedTypes.includes(achievement.type);
      const card = document.createElement('div');
      card.className = isUnlocked ? 'achievement-card unlocked' : 'achievement-card locked';

      card.innerHTML = `
        <div class="achievement-icon">${isUnlocked ? '🏆' : '🔒'}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
          <div class="achievement-reward">+${achievement.rewardSP} SP</div>
        </div>
      `;

      container.appendChild(card);
    }
  }

  /**
   * 実績フィルタリング
   */
  private renderAchievements(tab: HTMLElement, filter: 'all' | 'unlocked' | 'locked'): void {
    const unlockedAchievements = this.metaProgression!.getUnlockedAchievements();
    const allAchievements = Object.values(AchievementDatabase);
    const unlockedTypes = unlockedAchievements.map(a => a.type);

    let filteredAchievements: Achievement[];
    switch (filter) {
      case 'unlocked':
        filteredAchievements = allAchievements.filter(a => unlockedTypes.includes(a.type));
        break;
      case 'locked':
        filteredAchievements = allAchievements.filter(a => !unlockedTypes.includes(a.type));
        break;
      default:
        filteredAchievements = allAchievements;
    }

    const listContainer = tab.querySelector('.achievement-list') as HTMLElement;
    if (listContainer) {
      this.renderAchievementList(listContainer, filteredAchievements, unlockedAchievements);
    }

    // ボタンのactive状態を更新
    const buttons = tab.querySelectorAll('.achievement-filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const activeButton = Array.from(buttons).find(btn => {
      if (filter === 'all' && btn.textContent === 'すべて') return true;
      if (filter === 'unlocked' && btn.textContent === '解禁済み') return true;
      if (filter === 'locked' && btn.textContent === '未解禁') return true;
      return false;
    });
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  /**
   * アップグレードタブ作成
   */
  private createUpgradesTab(): HTMLElement {
    const tab = document.createElement('div');
    tab.className = 'upgrades-tab';

    const stats = this.metaProgression!.getStats();

    // カテゴリごとにアップグレードを分類
    const categories = [
      { name: '基礎ステータス', types: this.getBaseStatUpgrades() },
      { name: '戦闘', types: this.getCombatUpgrades() },
      { name: '探索', types: this.getExplorationUpgrades() },
      { name: '特殊', types: this.getSpecialUpgrades() },
      { name: 'ボス報酬', types: this.getBossRewardUpgrades() },
    ];

    for (const category of categories) {
      const categorySection = document.createElement('div');
      categorySection.className = 'upgrade-category';

      const categoryTitle = document.createElement('h3');
      categoryTitle.className = 'upgrade-category-title';
      categoryTitle.textContent = category.name;
      categorySection.appendChild(categoryTitle);

      const upgradeGrid = document.createElement('div');
      upgradeGrid.className = 'upgrade-grid';

      for (const type of category.types) {
        const upgrade = UpgradeDatabase[type];
        const isUnlocked = this.metaProgression!.isUpgradeUnlocked(type);
        const canPurchase = this.metaProgression!.canPurchaseUpgrade(type);

        const upgradeCard = this.createUpgradeCard(upgrade, isUnlocked, canPurchase, stats);
        upgradeGrid.appendChild(upgradeCard);
      }

      categorySection.appendChild(upgradeGrid);
      tab.appendChild(categorySection);
    }

    return tab;
  }

  /**
   * アップグレードカード作成
   */
  private createUpgradeCard(
    upgrade: Upgrade,
    isUnlocked: boolean,
    canPurchase: boolean,
    stats: any
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = isUnlocked
      ? 'upgrade-card unlocked'
      : canPurchase
        ? 'upgrade-card available'
        : 'upgrade-card locked';

    const icon = isUnlocked ? '✅' : canPurchase ? '⬆️' : '🔒';

    card.innerHTML = `
      <div class="upgrade-card-header">
        <div class="upgrade-icon">${icon}</div>
        <div class="upgrade-name">${upgrade.name}</div>
      </div>
      <div class="upgrade-desc">${upgrade.description}</div>
    `;

    if (!isUnlocked) {
      const requirements = document.createElement('div');
      requirements.className = 'upgrade-requirements';

      // SP要件
      const spReq = document.createElement('div');
      spReq.className = stats.soulPoints >= upgrade.costSP ? 'requirement met' : 'requirement';
      spReq.textContent = `SP: ${upgrade.costSP}`;
      requirements.appendChild(spReq);

      // 実績要件
      if (upgrade.requiredAchievements.length > 0) {
        for (const reqType of upgrade.requiredAchievements) {
          const achievement = AchievementDatabase[reqType];
          const isMet = this.metaProgression!.isAchievementUnlocked(reqType);
          const achReq = document.createElement('div');
          achReq.className = isMet ? 'requirement met' : 'requirement';
          achReq.textContent = achievement.name;
          requirements.appendChild(achReq);
        }
      }

      card.appendChild(requirements);

      // 購入ボタン
      if (canPurchase) {
        const buyBtn = document.createElement('button');
        buyBtn.className = 'upgrade-buy-btn';
        buyBtn.textContent = '購入';
        buyBtn.addEventListener('click', () => {
          if (this.onPurchaseCallback) {
            this.onPurchaseCallback(upgrade);
            this.render();
          }
        });
        card.appendChild(buyBtn);
      }
    }

    return card;
  }

  // アップグレード分類ヘルパー
  private getBaseStatUpgrades(): UpgradeType[] {
    return [
      UpgradeType.HP_1,
      UpgradeType.HP_2,
      UpgradeType.HP_3,
      UpgradeType.HP_4,
      UpgradeType.HP_5,
      UpgradeType.HP_6,
      UpgradeType.HP_7,
      UpgradeType.HP_8,
      UpgradeType.HP_9,
      UpgradeType.HP_10,
      UpgradeType.MP_1,
      UpgradeType.MP_2,
      UpgradeType.MP_3,
      UpgradeType.MP_4,
      UpgradeType.MP_5,
      UpgradeType.MP_6,
      UpgradeType.MP_7,
      UpgradeType.MP_8,
      UpgradeType.MP_9,
      UpgradeType.MP_10,
      UpgradeType.ATK_1,
      UpgradeType.ATK_2,
      UpgradeType.ATK_3,
      UpgradeType.ATK_4,
      UpgradeType.ATK_5,
      UpgradeType.ATK_6,
      UpgradeType.ATK_7,
      UpgradeType.ATK_8,
      UpgradeType.ATK_9,
      UpgradeType.ATK_10,
      UpgradeType.DEF_1,
      UpgradeType.DEF_2,
      UpgradeType.DEF_3,
      UpgradeType.DEF_4,
      UpgradeType.DEF_5,
      UpgradeType.DEF_6,
      UpgradeType.DEF_7,
      UpgradeType.DEF_8,
      UpgradeType.DEF_9,
      UpgradeType.DEF_10,
    ];
  }

  private getCombatUpgrades(): UpgradeType[] {
    return [
      UpgradeType.CRIT_RATE_1,
      UpgradeType.CRIT_RATE_2,
      UpgradeType.CRIT_RATE_3,
      UpgradeType.CRIT_DMG_1,
      UpgradeType.CRIT_DMG_2,
      UpgradeType.CRIT_DMG_3,
      UpgradeType.EXP_UP_1,
      UpgradeType.EXP_UP_2,
      UpgradeType.EXP_UP_3,
      UpgradeType.SKILL_CD_1,
      UpgradeType.SKILL_CD_2,
      UpgradeType.MP_COST_1,
      UpgradeType.MP_COST_2,
    ];
  }

  private getExplorationUpgrades(): UpgradeType[] {
    return [
      UpgradeType.GOLD_DROP_1,
      UpgradeType.GOLD_DROP_2,
      UpgradeType.GOLD_DROP_3,
      UpgradeType.ITEM_DROP_1,
      UpgradeType.ITEM_DROP_2,
      UpgradeType.ITEM_DROP_3,
      UpgradeType.STARTING_GOLD_1,
      UpgradeType.STARTING_GOLD_2,
      UpgradeType.STARTING_GOLD_3,
      UpgradeType.SHOP_DISCOUNT_1,
      UpgradeType.SHOP_DISCOUNT_2,
      UpgradeType.VISION_RANGE_1,
      UpgradeType.VISION_RANGE_2,
    ];
  }

  private getSpecialUpgrades(): UpgradeType[] {
    return [UpgradeType.REVIVE_ONCE, UpgradeType.EXTRA_SKILL_SLOT, UpgradeType.INVENTORY_EXPANSION];
  }

  private getBossRewardUpgrades(): UpgradeType[] {
    return [
      UpgradeType.TUTORIAL_REWARD,
      UpgradeType.BEAST_LORD_BLESSING,
      UpgradeType.DEATH_LORD_CONTRACT,
      UpgradeType.DEMON_LORD_ARMOR,
      UpgradeType.ARCHMAGE_WISDOM,
      UpgradeType.ABYSS_CONQUEROR,
    ];
  }
}
