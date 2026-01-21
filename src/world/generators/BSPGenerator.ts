/**
 * BSP (Binary Space Partitioning) 生成アルゴリズム
 * 空間を再帰的に分割してダンジョンを生成
 */

import { GameMap } from '../Map';
import { TileFactory } from '../Tile';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

class BSPNode {
  public rect: Rectangle;
  public left: BSPNode | null = null;
  public right: BSPNode | null = null;
  public room: Rectangle | null = null;

  constructor(x: number, y: number, width: number, height: number) {
    this.rect = { x, y, width, height };
  }

  /**
   * ノードを分割
   */
  split(minSize: number): boolean {
    if (this.left !== null || this.right !== null) {
      return false; // すでに分割済み
    }

    // 横分割か縦分割かを決定
    const splitHorizontally = Math.random() > 0.5;

    // 分割可能なサイズかチェック
    if (splitHorizontally) {
      if (this.rect.height < minSize * 2) {
        return false;
      }
    } else {
      if (this.rect.width < minSize * 2) {
        return false;
      }
    }

    // 分割位置を決定
    const maxSize = (splitHorizontally ? this.rect.height : this.rect.width) - minSize;
    const split = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

    // 子ノードを作成
    if (splitHorizontally) {
      this.left = new BSPNode(this.rect.x, this.rect.y, this.rect.width, split);
      this.right = new BSPNode(
        this.rect.x,
        this.rect.y + split,
        this.rect.width,
        this.rect.height - split
      );
    } else {
      this.left = new BSPNode(this.rect.x, this.rect.y, split, this.rect.height);
      this.right = new BSPNode(
        this.rect.x + split,
        this.rect.y,
        this.rect.width - split,
        this.rect.height
      );
    }

    return true;
  }

  /**
   * 部屋を作成
   */
  createRoom(minRoomSize: number, maxRoomSize: number): void {
    if (this.left !== null || this.right !== null) {
      // 子ノードがあれば再帰的に部屋を作成
      if (this.left) this.left.createRoom(minRoomSize, maxRoomSize);
      if (this.right) this.right.createRoom(minRoomSize, maxRoomSize);
    } else {
      // 葉ノードに部屋を作成
      const roomWidth = Math.min(
        this.rect.width - 2,
        minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1))
      );
      const roomHeight = Math.min(
        this.rect.height - 2,
        minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1))
      );

      const roomX = this.rect.x + 1 + Math.floor(Math.random() * (this.rect.width - roomWidth - 1));
      const roomY =
        this.rect.y + 1 + Math.floor(Math.random() * (this.rect.height - roomHeight - 1));

      this.room = {
        x: roomX,
        y: roomY,
        width: roomWidth,
        height: roomHeight,
      };
    }
  }

  /**
   * 部屋の中心を取得
   */
  getCenter(): { x: number; y: number } | null {
    if (this.room) {
      return {
        x: Math.floor(this.room.x + this.room.width / 2),
        y: Math.floor(this.room.y + this.room.height / 2),
      };
    }

    // 子ノードから取得
    if (this.left) {
      return this.left.getCenter();
    }
    if (this.right) {
      return this.right.getCenter();
    }

    return null;
  }
}

export class BSPGenerator {
  /**
   * BSPアルゴリズムでマップを生成
   */
  static generate(
    width: number,
    height: number,
    options: {
      minRoomSize?: number;
      maxRoomSize?: number;
      minPartitionSize?: number;
      maxDepth?: number;
    } = {}
  ): GameMap {
    const { minRoomSize = 4, maxRoomSize = 10, minPartitionSize = 8, maxDepth = 5 } = options;

    const map = new GameMap(width, height);

    // ルートノードを作成
    const root = new BSPNode(1, 1, width - 2, height - 2);

    // 再帰的に分割
    this.splitNode(root, maxDepth, minPartitionSize);

    // 部屋を作成
    root.createRoom(minRoomSize, maxRoomSize);

    // マップに部屋を描画
    this.drawRooms(root, map);

    // 廊下で接続
    this.connectRooms(root, map);

    return map;
  }

  /**
   * ノードを再帰的に分割
   */
  private static splitNode(node: BSPNode, depth: number, minSize: number): void {
    if (depth === 0) return;

    if (node.split(minSize)) {
      if (node.left) this.splitNode(node.left, depth - 1, minSize);
      if (node.right) this.splitNode(node.right, depth - 1, minSize);
    }
  }

  /**
   * 部屋をマップに描画
   */
  private static drawRooms(node: BSPNode, map: GameMap): void {
    if (node.room) {
      map.createRoom(node.room.x, node.room.y, node.room.width, node.room.height);
    }

    if (node.left) this.drawRooms(node.left, map);
    if (node.right) this.drawRooms(node.right, map);
  }

  /**
   * 部屋を廊下で接続
   */
  private static connectRooms(node: BSPNode, map: GameMap): void {
    if (node.left && node.right) {
      const leftCenter = node.left.getCenter();
      const rightCenter = node.right.getCenter();

      if (leftCenter && rightCenter) {
        // L字型の廊下で接続
        if (Math.random() > 0.5) {
          map.createHorizontalTunnel(leftCenter.x, rightCenter.x, leftCenter.y);
          map.createVerticalTunnel(leftCenter.y, rightCenter.y, rightCenter.x);
        } else {
          map.createVerticalTunnel(leftCenter.y, rightCenter.y, leftCenter.x);
          map.createHorizontalTunnel(leftCenter.x, rightCenter.x, rightCenter.y);
        }
      }

      // 再帰的に接続
      this.connectRooms(node.left, map);
      this.connectRooms(node.right, map);
    }
  }
}
