/**
 * メッセージログシステム
 * ゲーム内イベントのメッセージを管理・表示
 */

export enum MessageType {
  INFO = 'info',
  COMBAT = 'combat',
  DEATH = 'death',
  ITEM = 'item',
  SYSTEM = 'system',
}

export interface Message {
  text: string;
  type: MessageType;
  timestamp: number;
}

export class MessageLog {
  private messages: Message[] = [];
  private maxMessages: number = 100;
  private element: HTMLElement | null = null;

  constructor(elementId: string = 'message-log') {
    this.element = document.getElementById(elementId);
  }

  /**
   * メッセージを追加
   */
  add(text: string, type: MessageType = MessageType.INFO): void {
    const message: Message = {
      text,
      type,
      timestamp: Date.now(),
    };

    this.messages.push(message);

    // 最大数を超えたら古いものを削除
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    this.render();
  }

  /**
   * メッセージをクリア
   */
  clear(): void {
    this.messages = [];
    this.render();
  }

  /**
   * メッセージログを描画
   */
  private render(): void {
    if (!this.element) return;

    // 最新10件を表示
    const recentMessages = this.messages.slice(-10);

    // DOM要素を安全に構築
    this.element.textContent = ''; // 既存の内容をクリア

    recentMessages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${msg.type}`;
      messageDiv.textContent = msg.text;
      this.element!.appendChild(messageDiv);
    });

    // 自動スクロール
    this.element.scrollTop = this.element.scrollHeight;
  }

  /**
   * すべてのメッセージを取得
   */
  getMessages(): Message[] {
    return [...this.messages];
  }
}
