/**
 * ワールド管理
 * 複数の階層（マップ）を管理
 */

import { GameMap } from './Map';
import { RoomGenerator } from './generators/RoomGenerator';
import { CaveGenerator } from './generators/CaveGenerator';
import { BSPGenerator } from './generators/BSPGenerator';
import { Vector2D } from '@/utils/Vector2D';
import { DungeonType, DungeonConfig } from './DungeonType';
import { DUNGEON_CONFIGS } from '@/data/dungeonConfigs';

export class World {
  private floors: Map<number, GameMap> = new Map();
  private currentFloor: number = 1;
  private dungeonType: DungeonType;
  private dungeonConfig: DungeonConfig;

  constructor(dungeonType: DungeonType = DungeonType.CAVE) {
    this.dungeonType = dungeonType;
    this.dungeonConfig = DUNGEON_CONFIGS[dungeonType];

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

    // ダンジョン設定に基づいてマップ生成アルゴリズムを選択
    const algorithm = this.selectGenerationAlgorithm();
    let map: GameMap;

    if (algorithm === 'room') {
      // ルームベース
      map = RoomGenerator.generate(80, 60, {
        minRoomSize: 5,
        maxRoomSize: 12,
        maxRooms: 15 + floorNumber * 2,
      });
    } else if (algorithm === 'cave') {
      // 洞窟型
      map = CaveGenerator.generate(80, 60, {
        fillProbability: 0.45,
        smoothIterations: 5,
        deathLimit: 3,
        birthLimit: 4,
      });
    } else {
      // BSP分割型
      map = BSPGenerator.generate(80, 60, {
        minRoomSize: 4,
        maxRoomSize: 10,
        minPartitionSize: 8,
        maxDepth: 4,
      });
    }

    // 環境効果を適用
    this.applyEnvironmentalEffects(map, floorNumber);

    this.floors.set(floorNumber, map);
    return map;
  }

  /**
   * ダンジョン設定に基づいてマップ生成アルゴリズムを選択
   */
  private selectGenerationAlgorithm(): 'room' | 'cave' | 'bsp' {
    const rand = Math.random();
    let cumulative = 0;

    for (const config of this.dungeonConfig.mapGeneration) {
      cumulative += config.weight;
      if (rand < cumulative) {
        return config.algorithm;
      }
    }

    // フォールバック: 最初のアルゴリズムを返す
    return this.dungeonConfig.mapGeneration[0].algorithm;
  }

  /**
   * 環境効果を適用
   */
  private applyEnvironmentalEffects(map: GameMap, floorNumber: number): void {
    for (const effect of this.dungeonConfig.environmentalEffects) {
      if (floorNumber % effect.floorInterval === 0) {
        map.environmentalEffect = effect;
        break; // 1つの環境効果のみ適用
      }
    }
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
   * セーブデータから階層を復元
   */
  restoreFloor(floorNumber: number, map: GameMap): void {
    this.floors.set(floorNumber, map);
    this.currentFloor = floorNumber;
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

  /**
   * ダンジョンタイプを取得
   */
  getDungeonType(): DungeonType {
    return this.dungeonType;
  }

  /**
   * ダンジョン設定を取得
   */
  getDungeonConfig(): DungeonConfig {
    return this.dungeonConfig;
  }
}
