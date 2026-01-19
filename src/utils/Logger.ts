/**
 * ログユーティリティ
 * 本番環境では詳細なエラー情報を制限
 */

const isDevelopment = import.meta.env.DEV;

export class Logger {
  /**
   * エラーログ（開発環境のみ詳細を出力）
   */
  static error(message: string, error?: any): void {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // 本番環境では簡略化されたメッセージのみ
      console.error(message);
    }
  }

  /**
   * 警告ログ
   */
  static warn(message: string, data?: any): void {
    if (isDevelopment) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  }

  /**
   * 情報ログ（開発環境のみ）
   */
  static info(message: string, data?: any): void {
    if (isDevelopment) {
      console.log(message, data);
    }
  }

  /**
   * デバッグログ（開発環境のみ）
   */
  static debug(message: string, data?: any): void {
    if (isDevelopment) {
      console.debug(message, data);
    }
  }
}
