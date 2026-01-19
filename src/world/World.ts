/**
 * ワールド管理
 * 複数の階層（マップ）を管理
 */

import { GameMap } from './Map';
import { RoomGenerator } from './generators/RoomGenerator';
import { Vector2D } from '@/utils/Vector2D';

export class World {
  private floors: Map<number, GameMap> = new Map();
  private currentFloor: number = 1;

  constructor() {
    // 最初の階層を生成
    this.generateFloor(1);
  }

  /**
   * 階層を生成
   */
  generateFloor(floorNumber: number): GameMap {
    // すでに生成済みならそれを返す
    if (this.floors.has(floorNumber)) {
      return this.floors.get(floorNumber)!;
    }

    // 新しい階層を生成
    const map = RoomGenerator.generate(80, 60, {
      minRoomSize: 5,
      maxRoomSize: 12,
      maxRooms: 15 + floorNumber * 2, // 階層が深いほど部屋が多い
    });

    this.floors.set(floorNumber, map);
    return map;
  }

  /**
   * 現在の階層のマップを取得
   */
  getCurrentMap(): GameMap {
    const map = this.floors.get(this.currentFloor);
    if (!map) {
      throw new Error(`Floor ${this.currentFloor} not found`);
    }
    return map;
  }

  /**
   * 指定階層のマップを取得
   */
  getFloor(floorNumber: number): GameMap | null {
    return this.floors.get(floorNumber) || null;
  }

  /**
   * 現在の階層番号を取得
   */
  getCurrentFloor(): number {
    return this.currentFloor;
  }

  /**
   * 階層を変更
   */
  changeFloor(floorNumber: number): GameMap {
    this.currentFloor = floorNumber;

    // まだ生成されていなければ生成
    if (!this.floors.has(floorNumber)) {
      return this.generateFloor(floorNumber);
    }

    return this.getCurrentMap();
  }

  /**
   * 次の階層へ
   */
  descendFloor(): GameMap {
    return this.changeFloor(this.currentFloor + 1);
  }

  /**
   * 前の階層へ
   */
  ascendFloor(): GameMap {
    if (this.currentFloor <= 1) {
      return this.getCurrentMap();
    }
    return this.changeFloor(this.currentFloor - 1);
  }

  /**
   * ランダムな開始位置を取得
   */
  getRandomStartPosition(): Vector2D {
    const map = this.getCurrentMap();
    const cell = map.getRandomWalkableCell();

    if (cell) {
      return cell.position;
    }

    // フォールバック
    return new Vector2D(40, 30);
  }

  /**
   * すべての階層をクリア
   */
  clear(): void {
    this.floors.clear();
    this.currentFloor = 1;
  }
}
