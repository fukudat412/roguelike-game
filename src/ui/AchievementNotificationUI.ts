/**
 * 実績解禁通知UI
 * トースト通知スタイルで実績解禁を表示
 */

import { Achievement } from '@/character/MetaProgression';

export class AchievementNotificationUI {
  private container: HTMLElement;
  private queue: Achievement[] = [];
  private isDisplaying: boolean = false;

  constructor() {
    const container = document.getElementById('achievement-notifications');
    if (!container) {
      throw new Error('Achievement notifications container not found');
    }
    this.container = container;
  }

  /**
   * 実績解禁通知を表示
   */
  show(achievement: Achievement): void {
    this.queue.push(achievement);
    if (!this.isDisplaying) {
      this.displayNext();
    }
  }

  /**
   * 次の通知を表示
   */
  private displayNext(): void {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      return;
    }

    this.isDisplaying = true;
    const achievement = this.queue.shift()!;

    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    // ヘッダー
    const header = document.createElement('div');
    header.className = 'achievement-notification-header';

    const icon = document.createElement('div');
    icon.className = 'achievement-notification-icon';
    icon.textContent = '🏆';

    const title = document.createElement('div');
    title.className = 'achievement-notification-title';
    title.textContent = '実績解禁！';

    header.appendChild(icon);
    header.appendChild(title);

    // ボディ
    const body = document.createElement('div');
    body.className = 'achievement-notification-body';

    const name = document.createElement('div');
    name.className = 'achievement-notification-name';
    name.textContent = achievement.name;

    const desc = document.createElement('div');
    desc.className = 'achievement-notification-desc';
    desc.textContent = achievement.description;

    const reward = document.createElement('div');
    reward.className = 'achievement-notification-reward';
    reward.textContent = `+${achievement.rewardSP} ソウルポイント`;

    body.appendChild(name);
    body.appendChild(desc);
    body.appendChild(reward);

    notification.appendChild(header);
    notification.appendChild(body);

    // コンテナに追加
    this.container.appendChild(notification);

    // 5秒後に削除
    setTimeout(() => {
      notification.remove();
      this.displayNext();
    }, 5000);
  }

  /**
   * すべての通知をクリア
   */
  clear(): void {
    this.queue = [];
    // 全ての子要素を削除
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.isDisplaying = false;
  }
}
