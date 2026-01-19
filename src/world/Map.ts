/**
 * ゲームマップ
 * セルの2次元配列を管理
 */

import { Cell } from './Cell';
import { Tile, TileFactory } from './Tile';
import { Vector2D } from '@/utils/Vector2D';
import { FOV } from '@/utils/FOV';

export class GameMap {
  private cells: Cell[][] = [];
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeCells();
  }

  /**
   * セルを初期化（すべて壁で埋める）
   */
  private initializeCells(): void {
    this.cells = [];
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        const wall = TileFactory.createWall();
        row.push(new Cell(new Vector2D(x, y), wall));
      }
      this.cells.push(row);
    }
  }

  /**
   * 指定座標のセルを取得
   */
  getCell(x: number, y: number): Cell | null {
    if (!this.isInBounds(x, y)) return null;
    return this.cells[y][x];
  }

  /**
   * Vector2D版
   */
  getCellAt(pos: Vector2D): Cell | null {
    return this.getCell(pos.x, pos.y);
  }

  /**
   * セルを設定
   */
  setCell(x: number, y: number, cell: Cell): void {
    if (!this.isInBounds(x, y)) return;
    this.cells[y][x] = cell;
  }

  /**
   * タイルを設定
   */
  setTile(x: number, y: number, tile: Tile): void {
    const cell = this.getCell(x, y);
    if (cell) {
      cell.setTile(tile);
    }
  }

  /**
   * 座標が範囲内かチェック
   */
  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Vector2D版
   */
  isInBoundsVec(pos: Vector2D): boolean {
    return this.isInBounds(pos.x, pos.y);
  }

  /**
   * 歩行可能かチェック
   */
  isWalkable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return cell ? cell.isWalkable() : false;
  }

  /**
   * Vector2D版
   */
  isWalkableAt(pos: Vector2D): boolean {
    return this.isWalkable(pos.x, pos.y);
  }

  /**
   * 透明（視線が通る）かチェック
   */
  isTransparent(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return cell ? cell.isTransparent() : false;
  }

  /**
   * すべてのセルを取得
   */
  getAllCells(): Cell[] {
    const allCells: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        allCells.push(this.cells[y][x]);
      }
    }
    return allCells;
  }

  /**
   * 条件に合うセルを検索
   */
  findCells(predicate: (cell: Cell) => boolean): Cell[] {
    return this.getAllCells().filter(predicate);
  }

  /**
   * ランダムな歩行可能セルを取得
   */
  getRandomWalkableCell(): Cell | null {
    const walkableCells = this.findCells(cell => cell.isWalkable());
    if (walkableCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * walkableCells.length);
    return walkableCells[randomIndex];
  }

  /**
   * 矩形領域を床で埋める
   */
  createRoom(x: number, y: number, width: number, height: number): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const posX = x + dx;
        const posY = y + dy;
        if (this.isInBounds(posX, posY)) {
          this.setTile(posX, posY, TileFactory.createFloor());
        }
      }
    }
  }

  /**
   * 水平通路を作成
   */
  createHorizontalTunnel(x1: number, x2: number, y: number): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);

    for (let x = minX; x <= maxX; x++) {
      if (this.isInBounds(x, y)) {
        this.setTile(x, y, TileFactory.createFloor());
      }
    }
  }

  /**
   * 垂直通路を作成
   */
  createVerticalTunnel(y1: number, y2: number, x: number): void {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    for (let y = minY; y <= maxY; y++) {
      if (this.isInBounds(x, y)) {
        this.setTile(x, y, TileFactory.createFloor());
      }
    }
  }

  /**
   * FOV（視界）を更新（シャドウキャスティング）
   */
  updateFOV(center: Vector2D, radius: number): void {
    // すべてのセルを非可視に
    this.getAllCells().forEach(cell => cell.setVisible(false));

    // シャドウキャスティングで可視セルを計算
    const visibleCells = FOV.calculate(
      center,
      radius,
      (x, y) => !this.isTransparent(x, y)
    );

    // 可視セルをマークしてexploredにする
    for (const pos of visibleCells) {
      const cell = this.getCell(pos.x, pos.y);
      if (cell) {
        cell.setVisible(true);
      }
    }
  }
}
