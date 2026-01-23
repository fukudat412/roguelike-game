/**
 * UI パネルの基底クラス
 * 共通の open/close/render 機能を提供
 */

export abstract class BaseUIPanel {
  protected panel: HTMLElement | null;
  protected isOpen: boolean = false;

  constructor(panelId: string) {
    this.panel = document.getElementById(panelId);
  }

  /**
   * パネルを開く
   */
  open(): void {
    if (!this.panel) return;

    this.isOpen = true;
    this.panel.style.display = 'block';
    this.render();
  }

  /**
   * パネルを閉じる
   */
  close(): void {
    if (!this.panel) return;

    this.isOpen = false;
    this.panel.style.display = 'none';
    this.onClose();
  }

  /**
   * パネルが開いているか
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * パネルを表示（サブクラスで実装）
   */
  protected abstract render(): void;

  /**
   * クローズ時の処理（オプション、サブクラスでオーバーライド可能）
   */
  protected onClose(): void {
    // Override in subclasses if needed
  }
}
