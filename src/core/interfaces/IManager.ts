/**
 * マネージャークラスの基本インターフェース
 * すべてのマネージャーが実装すべき共通メソッドを定義
 */

import { Vector2D } from '../../utils/Vector2D';

/**
 * ゲームライフサイクルインターフェース
 * ゲームの初期化、更新、破棄のライフサイクルを定義
 */
export interface IGameLifecycle {
  /**
   * マネージャーの初期化
   */
  initialize(): void;

  /**
   * マネージャーの更新（ゲームループ内で呼ばれる）
   * @param deltaTime - 前フレームからの経過時間（ミリ秒）
   */
  update(deltaTime: number): void;

  /**
   * マネージャーの破棄・クリーンアップ
   */
  destroy(): void;
}

/**
 * エンティティマネージャーインターフェース
 * エンティティ（敵、アイテム等）の管理を行うマネージャーの基本機能を定義
 * @template T - 管理するエンティティの型
 */
export interface IEntityManager<T> {
  /**
   * エンティティを追加
   * @param entity - 追加するエンティティ
   */
  add(entity: T): void;

  /**
   * エンティティを削除
   * @param entity - 削除するエンティティ
   */
  remove(entity: T): void;

  /**
   * インデックスを指定してエンティティを削除
   * @param index - 削除するエンティティのインデックス
   */
  removeAt(index: number): void;

  /**
   * すべてのエンティティを取得
   * @returns すべてのエンティティの配列
   */
  getAll(): T[];

  /**
   * 指定位置にあるエンティティを取得
   * @param position - 検索する位置
   * @returns 指定位置にあるエンティティ、なければundefined
   */
  getAt(position: Vector2D): T | undefined;

  /**
   * すべてのエンティティをクリア
   */
  clear(): void;

  /**
   * エンティティの数を取得
   * @returns エンティティの総数
   */
  count(): number;
}

/**
 * 位置を持つエンティティのインターフェース
 */
export interface IPositionable {
  position: Vector2D;
}

/**
 * マネージャーの基本設定
 */
export interface IManagerConfig {
  /**
   * デバッグモードを有効にするか
   */
  debug?: boolean;
}
