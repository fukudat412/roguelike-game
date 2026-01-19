/**
 * タイル定義
 * マップを構成する基本要素
 */

export enum TileType {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  DOOR = 'DOOR',
  STAIRS_DOWN = 'STAIRS_DOWN',
  STAIRS_UP = 'STAIRS_UP',
}

export interface TileProperties {
  type: TileType;
  walkable: boolean;
  transparent: boolean;
  color: string;
  char: string;
}

export class Tile {
  constructor(public properties: TileProperties) {}

  isWalkable(): boolean {
    return this.properties.walkable;
  }

  isTransparent(): boolean {
    return this.properties.transparent;
  }

  getType(): TileType {
    return this.properties.type;
  }

  getColor(): string {
    return this.properties.color;
  }

  getChar(): string {
    return this.properties.char;
  }
}

// タイルテンプレート
export const TileTemplates: Record<TileType, TileProperties> = {
  [TileType.FLOOR]: {
    type: TileType.FLOOR,
    walkable: true,
    transparent: true,
    color: '#3a3a3a',
    char: '.',
  },
  [TileType.WALL]: {
    type: TileType.WALL,
    walkable: false,
    transparent: false,
    color: '#555555',
    char: '#',
  },
  [TileType.DOOR]: {
    type: TileType.DOOR,
    walkable: true,
    transparent: false,
    color: '#8B4513',
    char: '+',
  },
  [TileType.STAIRS_DOWN]: {
    type: TileType.STAIRS_DOWN,
    walkable: true,
    transparent: true,
    color: '#ffffff',
    char: '>',
  },
  [TileType.STAIRS_UP]: {
    type: TileType.STAIRS_UP,
    walkable: true,
    transparent: true,
    color: '#ffffff',
    char: '<',
  },
};

/**
 * タイルファクトリー
 */
export class TileFactory {
  static createTile(type: TileType): Tile {
    const properties = TileTemplates[type];
    if (!properties) {
      throw new Error(`Unknown tile type: ${type}`);
    }
    return new Tile({ ...properties });
  }

  static createFloor(): Tile {
    return this.createTile(TileType.FLOOR);
  }

  static createWall(): Tile {
    return this.createTile(TileType.WALL);
  }

  static createStairsDown(): Tile {
    return this.createTile(TileType.STAIRS_DOWN);
  }
}
