/**
 * アプリケーションエントリーポイント
 * ゲームを初期化して開始
 */

import { Game } from './core/Game';
import { Logger } from './utils/Logger';
import { DungeonSelectionUI } from './ui/DungeonSelectionUI';
import { DungeonType } from './world/DungeonType';

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

  // ダンジョン選択UIを表示
  const dungeonSelection = new DungeonSelectionUI('dungeon-selection', (dungeonType: DungeonType) => {
    console.log(`ダンジョン選択: ${dungeonType}`);

    try {
      // 選択されたダンジョンタイプでゲームを初期化
      console.log('ゲームを初期化中...');
      game.initialize(dungeonType);

      // 開始
      console.log('ゲームを開始中...');
      game.start();

      console.log(`ローグライク探索ゲーム開始！ (${dungeonType})`);
      console.log('操作方法:');
      console.log('  移動: WASD / 矢印キー / テンキー');
      console.log('  攻撃: 敵に向かって移動');
      console.log('  待機: スペースキー');
    } catch (error) {
      console.error('ゲーム初期化エラー:', error);
    }
  });

  // ダンジョン選択UIにメタプログレッションを設定
  game.setupDungeonSelectionUI(dungeonSelection);

  // ダンジョン選択UIを表示
  dungeonSelection.show();

  // グローバルに公開（開発環境のみ）
  if (import.meta.env.DEV) {
    (window as any).game = game;
  }
});
