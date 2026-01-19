/**
 * マップセル
 * 各グリッド位置の情報を保持
 */

import { Tile } from './Tile';
import { Vector2D } from '@/utils/Vector2D';

export class Cell {
  public tile: Tile;
  public explored: boolean = false;
  public visible: boolean = false;

  constructor(
    public position: Vector2D,
    tile: Tile
  ) {
    this.tile = tile;
  }

  /**
   * 歩行可能かチェック
   */
  isWalkable(): boolean {
    return this.tile.isWalkable();
  }

  /**
   * 透明（視線が通る）かチェック
   */
  isTransparent(): boolean {
    return this.tile.isTransparent();
  }

  /**
   * タイルを変更
   */
  setTile(tile: Tile): void {
    this.tile = tile;
  }

  /**
   * 探索済みにする
   */
  markExplored(): void {
    this.explored = true;
  }

  /**
   * 可視状態を設定
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible) {
      this.explored = true;
    }
  }

  /**
   * クローン
   */
  clone(): Cell {
    const cell = new Cell(this.position.clone(), this.tile);
    cell.explored = this.explored;
    cell.visible = this.visible;
    return cell;
  }
}
