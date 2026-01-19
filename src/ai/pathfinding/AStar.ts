/**
 * A* パスファインディングアルゴリズム
 * 敵がプレイヤーに向かって最短経路で移動するために使用
 */

import { Vector2D } from '@/utils/Vector2D';

interface PathNode {
  position: Vector2D;
  g: number; // スタートからのコスト
  h: number; // ゴールまでの推定コスト
  f: number; // g + h
  parent: PathNode | null;
}

export class AStar {
  /**
   * A*アルゴリズムでパスを検索
   * @param start 開始位置
   * @param goal ゴール位置
   * @param isWalkable セルが歩行可能かチェックする関数
   * @param maxIterations 最大反復回数（無限ループ防止）
   * @returns パスの配列、見つからない場合はnull
   */
  static findPath(
    start: Vector2D,
    goal: Vector2D,
    isWalkable: (x: number, y: number) => boolean,
    maxIterations: number = 1000
  ): Vector2D[] | null {
    // スタートとゴールが同じ場合
    if (start.equals(goal)) {
      return [start];
    }

    // ゴールが歩行不可能な場合
    if (!isWalkable(goal.x, goal.y)) {
      return null;
    }

    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    // スタートノードを作成
    const startNode: PathNode = {
      position: start,
      g: 0,
      h: this.heuristic(start, goal),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);

    let iterations = 0;

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;

      // f値が最小のノードを取得
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      // ゴールに到達
      if (current.position.equals(goal)) {
        return this.reconstructPath(current);
      }

      // クローズドセットに追加
      const currentKey = `${current.position.x},${current.position.y}`;
      closedSet.add(currentKey);

      // 隣接ノードを調べる
      const neighbors = this.getNeighbors(current.position, isWalkable);

      for (const neighborPos of neighbors) {
        const neighborKey = `${neighborPos.x},${neighborPos.y}`;

        // すでに調査済み
        if (closedSet.has(neighborKey)) {
          continue;
        }

        // 新しいg値を計算
        const tentativeG = current.g + 1;

        // オープンリストで同じ位置のノードを検索
        let neighborNode = openList.find(n => n.position.equals(neighborPos));

        if (!neighborNode) {
          // 新しいノードを作成
          neighborNode = {
            position: neighborPos,
            g: tentativeG,
            h: this.heuristic(neighborPos, goal),
            f: 0,
            parent: current,
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openList.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
          // より良いパスが見つかった
          neighborNode.g = tentativeG;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    // パスが見つからなかった
    return null;
  }

  /**
   * ヒューリスティック関数（マンハッタン距離）
   */
  private static heuristic(a: Vector2D, b: Vector2D): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * 隣接する歩行可能なセルを取得
   */
  private static getNeighbors(
    position: Vector2D,
    isWalkable: (x: number, y: number) => boolean
  ): Vector2D[] {
    const neighbors: Vector2D[] = [];
    const directions = Vector2D.DIRECTIONS;

    for (const dir of directions) {
      const newPos = position.add(dir);
      if (isWalkable(newPos.x, newPos.y)) {
        neighbors.push(newPos);
      }
    }

    return neighbors;
  }

  /**
   * パスを再構築
   */
  private static reconstructPath(node: PathNode): Vector2D[] {
    const path: Vector2D[] = [];
    let current: PathNode | null = node;

    while (current !== null) {
      path.unshift(current.position);
      current = current.parent;
    }

    return path;
  }

  /**
   * 次の移動先を取得（パスの2番目の要素）
   */
  static getNextMove(
    start: Vector2D,
    goal: Vector2D,
    isWalkable: (x: number, y: number) => boolean
  ): Vector2D | null {
    const path = this.findPath(start, goal, isWalkable);

    if (!path || path.length < 2) {
      return null;
    }

    // パスの2番目の要素が次の移動先
    return path[1];
  }
}
