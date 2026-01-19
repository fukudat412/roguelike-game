/**
 * アプリケーションエントリーポイント
 * ゲームを初期化して開始
 */

import { Game } from './core/Game';
import { Logger } from './utils/Logger';

// グローバルエラーハンドリング
window.addEventListener('error', (event) => {
  Logger.error('Global error:', event.error);
});

// DOM読み込み完了後にゲームを開始
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) {
    Logger.error('Canvas element not found');
    return;
  }

  // ゲームインスタンス作成
  const game = new Game(canvas);

  // 初期化
  game.initialize();

  // 開始
  game.start();

  console.log('ローグライク探索ゲーム開始！');
  console.log('操作方法:');
  console.log('  移動: WASD / 矢印キー / テンキー');
  console.log('  攻撃: 敵に向かって移動');
  console.log('  待機: スペースキー');

  // グローバルに公開（開発環境のみ）
  if (import.meta.env.DEV) {
    (window as any).game = game;
  }
});
