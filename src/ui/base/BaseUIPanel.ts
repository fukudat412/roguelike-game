/**
 * UI パネルの基底クラス
 * すべてのUIパネル（インベントリ、ショップ等）が共通で持つ機能を提供
 */

/**
 * UI パネルの基本機能を提供する抽象クラス
 */
export abstract class BaseUIPanel {
  /** パネルのHTML要素 */
  protected panel: HTMLElement | null;

  /** パネルが開いているかどうか */
  protected isOpen: boolean = false;

  /** 選択中のアイテムのインデックス（-1は未選択） */
  protected selectedIndex: number = -1;

  /** 閉じるボタン */
  protected closeButton: HTMLButtonElement | null = null;

  /** ESCキーハンドラーの参照（削除用） */
  private escapeKeyHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * コンストラクタ
   * @param panelId - パネルのHTML要素のID
   * @param closeButtonId - 閉じるボタンのHTML要素のID（省略可）
   */
  constructor(panelId: string, closeButtonId?: string) {
    this.panel = document.getElementById(panelId);

    if (closeButtonId) {
      this.closeButton = document.getElementById(closeButtonId) as HTMLButtonElement;
    }

    this.setupBaseEventListeners();
    this.setupEventListeners();
  }

  /**
   * 基底クラスのイベントリスナー設定
   */
  private setupBaseEventListeners(): void {
    // 閉じるボタン
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    // ESCキーで閉じる
    this.escapeKeyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    };
    window.addEventListener('keydown', this.escapeKeyHandler);
  }

  /**
   * サブクラスで実装するイベントリスナー設定
   * 各UIパネル固有のイベントリスナーをここで設定する
   */
  protected abstract setupEventListeners(): void;

  /**
   * パネルを開く
   */
  open(): void {
    if (!this.panel) {
      console.warn('Panel element not found');
      return;
    }

    this.isOpen = true;
    this.panel.style.display = 'block';
    this.onOpen();
  }

  /**
   * パネルを閉じる
   */
  close(): void {
    if (!this.panel) return;

    this.isOpen = false;
    this.selectedIndex = -1;
    this.panel.style.display = 'none';
    this.onClose();
  }

  /**
   * パネルの開閉を切り替え
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * パネルが開いているかどうかを取得
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * パネルを開いたときの処理（サブクラスでオーバーライド可能）
   */
  protected onOpen(): void {
    // デフォルトでは何もしない
    // サブクラスでオーバーライドして、開いたときの処理を実装
  }

  /**
   * パネルを閉じたときの処理（サブクラスでオーバーライド可能）
   */
  protected onClose(): void {
    // デフォルトでは何もしない
    // サブクラスでオーバーライドして、閉じたときの処理を実装
  }

  /**
   * アイテムを選択
   * @param index - 選択するアイテムのインデックス
   */
  protected selectItem(index: number): void {
    this.selectedIndex = index;
    this.onItemSelected(index);
  }

  /**
   * アイテムが選択されたときの処理（サブクラスでオーバーライド可能）
   * @param index - 選択されたアイテムのインデックス
   */
  protected onItemSelected(index: number): void {
    // デフォルトでは何もしない
    // サブクラスでオーバーライドして、選択時の処理を実装
  }

  /**
   * 選択中のアイテムのインデックスを取得
   */
  protected getSelectedIndex(): number {
    return this.selectedIndex;
  }

  /**
   * リソースのクリーンアップ
   * イベントリスナーを削除してメモリリークを防ぐ
   */
  destroy(): void {
    // ESCキーハンドラーを削除
    if (this.escapeKeyHandler) {
      window.removeEventListener('keydown', this.escapeKeyHandler);
      this.escapeKeyHandler = null;
    }

    // サブクラス固有のクリーンアップ
    this.onDestroy();
  }

  /**
   * サブクラス固有のクリーンアップ処理（サブクラスでオーバーライド可能）
   */
  protected onDestroy(): void {
    // デフォルトでは何もしない
    // サブクラスでオーバーライドして、クリーンアップ処理を実装
  }
}
