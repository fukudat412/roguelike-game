/**
 * ミニマップ
 * 探索済みエリアの概要表示
 */

import { GameMap } from '@/world/Map';
import { Vector2D } from '@/utils/Vector2D';

export class Minimap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number = 2; // 1マスを何ピクセルで表示するか

  constructor(canvasId: string = 'minimap-canvas') {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Minimap canvas not found: ${canvasId}`);
    }

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }
    this.ctx = ctx;
  }

  /**
   * ミニマップを描画
   */
  render(map: GameMap, playerPos: Vector2D): void {
    // キャンバスをクリア
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const allCells = map.getAllCells();

    // セルを描画
    for (const cell of allCells) {
      if (!cell.explored) continue;

      const x = cell.position.x * this.scale;
      const y = cell.position.y * this.scale;

      // 壁か床かで色を変える
      if (!cell.tile.isWalkable()) {
        this.ctx.fillStyle = '#444444';
      } else {
        this.ctx.fillStyle = cell.visible ? '#888888' : '#333333';
      }

      this.ctx.fillRect(x, y, this.scale, this.scale);
    }

    // プレイヤー位置を描画
    const playerX = playerPos.x * this.scale;
    const playerY = playerPos.y * this.scale;
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillRect(playerX, playerY, this.scale, this.scale);

    // プレイヤーの周りに枠を描画
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(playerX - 0.5, playerY - 0.5, this.scale + 1, this.scale + 1);
  }

  /**
   * ミニマップをクリア
   */
  clear(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
