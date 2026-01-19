/**
 * エンティティ基底クラス
 * プレイヤー、敵、アイテムなどすべてのゲームオブジェクトの基底
 */

import { Position } from './components/Position';
import { Stats } from './components/Stats';
import { Vector2D } from '@/utils/Vector2D';
import { StatusEffectManager } from '@/combat/StatusEffect';

export enum EntityType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
  ITEM = 'ITEM',
  STAIRS = 'STAIRS',
}

export interface RenderInfo {
  char: string;
  color: string;
  backgroundColor?: string;
}

export abstract class Entity {
  public id: string;
  public name: string;
  public type: EntityType;
  public position: Position;
  public renderInfo: RenderInfo;
  public blocksMovement: boolean = false;

  constructor(
    name: string,
    type: EntityType,
    x: number,
    y: number,
    renderInfo: RenderInfo
  ) {
    this.id = this.generateId();
    this.name = name;
    this.type = type;
    this.position = new Position(x, y);
    this.renderInfo = renderInfo;
  }

  /**
   * ユニークIDを生成
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 位置を取得
   */
  getPosition(): Vector2D {
    return this.position.getPosition();
  }

  /**
   * 位置を設定
   */
  setPosition(x: number, y: number): void;
  setPosition(pos: Vector2D): void;
  setPosition(xOrPos: number | Vector2D, y?: number): void {
    if (xOrPos instanceof Vector2D) {
      this.position.setPosition(xOrPos);
    } else {
      this.position.setPosition(xOrPos, y!);
    }
  }

  /**
   * 移動
   */
  move(direction: Vector2D): void {
    this.position.move(direction);
  }

  /**
   * 他のエンティティとの距離
   */
  distanceTo(other: Entity): number {
    return this.position.distanceTo(other.position);
  }

  /**
   * 抽象メソッド: 更新処理
   */
  abstract update(deltaTime: number): void;

  /**
   * 描画情報を取得
   */
  getRenderInfo(): RenderInfo {
    return this.renderInfo;
  }
}

/**
 * 戦闘可能なエンティティ基底クラス
 */
export abstract class CombatEntity extends Entity {
  public stats: Stats;
  public statusEffects: StatusEffectManager;

  constructor(
    name: string,
    type: EntityType,
    x: number,
    y: number,
    renderInfo: RenderInfo,
    stats: Stats
  ) {
    super(name, type, x, y, renderInfo);
    this.stats = stats;
    this.statusEffects = new StatusEffectManager();
    this.blocksMovement = true;
  }

  /**
   * 生存しているか
   */
  isAlive(): boolean {
    return this.stats.isAlive();
  }

  /**
   * ダメージを受ける
   */
  takeDamage(amount: number, attacker?: string): number {
    return this.stats.takeDamage(amount);
  }

  /**
   * 攻撃力を取得（ステータス効果込み）
   */
  getAttack(): number {
    const modifiers = this.statusEffects.getTotalModifiers();
    return this.stats.attack + modifiers.attack;
  }

  /**
   * 防御力を取得（ステータス効果込み）
   */
  getDefense(): number {
    const modifiers = this.statusEffects.getTotalModifiers();
    return this.stats.defense + modifiers.defense;
  }

  /**
   * ステータス効果のターン処理
   */
  processStatusEffects(): void {
    this.statusEffects.tick(this);
  }

  /**
   * HPを取得
   */
  getHp(): number {
    return this.stats.hp;
  }

  /**
   * 最大HPを取得
   */
  getMaxHp(): number {
    return this.stats.maxHp;
  }
}
