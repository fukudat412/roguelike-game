/**
 * ランダムルーム生成アルゴリズム
 * ランダムな位置に矩形の部屋を配置し、L字型通路で接続
 */

import { GameMap } from '../Map';
import { TileFactory } from '../Tile';
import { Vector2D } from '@/utils/Vector2D';

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class RoomGenerator {
  /**
   * マップを生成
   */
  static generate(width: number, height: number, options: {
    minRoomSize?: number;
    maxRoomSize?: number;
    maxRooms?: number;
  } = {}): GameMap {
    const {
      minRoomSize = 4,
      maxRoomSize = 10,
      maxRooms = 15,
    } = options;

    const map = new GameMap(width, height);
    const rooms: Room[] = [];

    for (let i = 0; i < maxRooms; i++) {
      // ランダムな部屋サイズ
      const roomWidth = this.randomInt(minRoomSize, maxRoomSize);
      const roomHeight = this.randomInt(minRoomSize, maxRoomSize);

      // ランダムな位置（境界から1マス離す）
      const x = this.randomInt(1, width - roomWidth - 1);
      const y = this.randomInt(1, height - roomHeight - 1);

      const newRoom: Room = { x, y, width: roomWidth, height: roomHeight };

      // 既存の部屋と重なっていないかチェック
      let overlaps = false;
      for (const otherRoom of rooms) {
        if (this.roomsIntersect(newRoom, otherRoom)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        // 部屋を作成
        map.createRoom(x, y, roomWidth, roomHeight);

        // 前の部屋と接続
        if (rooms.length > 0) {
          const prevRoom = rooms[rooms.length - 1];
          const newCenter = this.getRoomCenter(newRoom);
          const prevCenter = this.getRoomCenter(prevRoom);

          // 50%の確率でL字の向きを変える
          if (Math.random() < 0.5) {
            // 横→縦
            map.createHorizontalTunnel(prevCenter.x, newCenter.x, prevCenter.y);
            map.createVerticalTunnel(prevCenter.y, newCenter.y, newCenter.x);
          } else {
            // 縦→横
            map.createVerticalTunnel(prevCenter.y, newCenter.y, prevCenter.x);
            map.createHorizontalTunnel(prevCenter.x, newCenter.x, newCenter.y);
          }
        }

        rooms.push(newRoom);
      }
    }

    // 最初の部屋の中心に階段を配置（後で使用）
    if (rooms.length > 0) {
      const firstRoom = rooms[0];
      const center = this.getRoomCenter(firstRoom);
      // 階段は後で追加する機能のためコメントアウト
      // map.setTile(center.x, center.y, TileFactory.createStairsDown());
    }

    return map;
  }

  /**
   * 部屋の中心座標を取得
   */
  static getRoomCenter(room: Room): Vector2D {
    return new Vector2D(
      Math.floor(room.x + room.width / 2),
      Math.floor(room.y + room.height / 2)
    );
  }

  /**
   * 部屋が重なっているかチェック
   */
  private static roomsIntersect(room1: Room, room2: Room): boolean {
    return (
      room1.x <= room2.x + room2.width &&
      room1.x + room1.width >= room2.x &&
      room1.y <= room2.y + room2.height &&
      room1.y + room1.height >= room2.y
    );
  }

  /**
   * ランダムな整数を生成（min以上max以下）
   */
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * ランダムな部屋を取得
   */
  static getRandomRoom(rooms: Room[]): Room {
    return rooms[Math.floor(Math.random() * rooms.length)];
  }
}
