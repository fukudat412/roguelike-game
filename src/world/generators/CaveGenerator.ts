/**
 * 洞窟生成アルゴリズム
 * セルオートマトンを使用した自然な洞窟生成
 */

import { GameMap } from '../Map';
import { TileFactory } from '../Tile';

export class CaveGenerator {
  /**
   * 洞窟マップを生成
   * @param width マップの幅
   * @param height マップの高さ
   * @param options 生成オプション
   */
  static generate(
    width: number,
    height: number,
    options: {
      fillProbability?: number;
      smoothIterations?: number;
      deathLimit?: number;
      birthLimit?: number;
    } = {}
  ): GameMap {
    const {
      fillProbability = 0.45,
      smoothIterations = 5,
      deathLimit = 3,
      birthLimit = 4,
    } = options;

    const map = new GameMap(width, height);

    // ランダムに初期化
    const grid = this.initializeRandomGrid(width, height, fillProbability);

    // セルオートマトンで平滑化
    for (let i = 0; i < smoothIterations; i++) {
      this.smoothCave(grid, width, height, deathLimit, birthLimit);
    }

    // グリッドをマップに適用
    this.applyGridToMap(grid, map);

    // 孤立領域を接続
    this.connectRegions(map);

    return map;
  }

  /**
   * ランダムにグリッドを初期化
   */
  private static initializeRandomGrid(
    width: number,
    height: number,
    fillProbability: number
  ): boolean[][] {
    const grid: boolean[][] = [];

    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        // 境界は常に壁
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          grid[y][x] = true; // 壁
        } else {
          grid[y][x] = Math.random() < fillProbability;
        }
      }
    }

    return grid;
  }

  /**
   * セルオートマトンで洞窟を平滑化
   */
  private static smoothCave(
    grid: boolean[][],
    width: number,
    height: number,
    deathLimit: number,
    birthLimit: number
  ): void {
    const newGrid: boolean[][] = [];

    for (let y = 0; y < height; y++) {
      newGrid[y] = [];
      for (let x = 0; x < width; x++) {
        const neighbors = this.countAliveNeighbors(grid, x, y, width, height);

        if (grid[y][x]) {
          // 壁の場合
          newGrid[y][x] = neighbors >= deathLimit;
        } else {
          // 床の場合
          newGrid[y][x] = neighbors >= birthLimit;
        }
      }
    }

    // グリッドをコピー
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        grid[y][x] = newGrid[y][x];
      }
    }
  }

  /**
   * 周囲の壁の数を数える
   */
  private static countAliveNeighbors(
    grid: boolean[][],
    x: number,
    y: number,
    width: number,
    height: number
  ): number {
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        // 境界外は壁として扱う
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          count++;
        } else if (grid[ny][nx]) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * グリッドをマップに適用
   */
  private static applyGridToMap(grid: boolean[][], map: GameMap): void {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!grid[y][x]) {
          map.setTile(x, y, TileFactory.createFloor());
        }
      }
    }
  }

  /**
   * 孤立した領域を接続（シンプル版）
   */
  private static connectRegions(map: GameMap): void {
    // 最大の連結領域を見つける
    const visited = new Set<string>();
    let largestRegion: Set<string> = new Set();

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.isWalkable(x, y) && !visited.has(`${x},${y}`)) {
          const region = this.floodFill(map, x, y, visited);
          if (region.size > largestRegion.size) {
            largestRegion = region;
          }
        }
      }
    }

    // 最大領域以外を壁に戻す（簡易版）
    // 実際にはトンネルで接続する方が良いが、簡略化のため
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (map.isWalkable(x, y) && !largestRegion.has(`${x},${y}`)) {
          map.setTile(x, y, TileFactory.createWall());
        }
      }
    }
  }

  /**
   * 塗りつぶしアルゴリズムで連結領域を検出
   */
  private static floodFill(
    map: GameMap,
    startX: number,
    startY: number,
    visited: Set<string>
  ): Set<string> {
    const region = new Set<string>();
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (!map.isInBounds(x, y)) continue;
      if (!map.isWalkable(x, y)) continue;

      visited.add(key);
      region.add(key);

      // 4方向をチェック
      queue.push([x + 1, y]);
      queue.push([x - 1, y]);
      queue.push([x, y + 1]);
      queue.push([x, y - 1]);
    }

    return region;
  }
}
