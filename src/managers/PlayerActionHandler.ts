/**
 * プレイヤーアクション処理マネージャー
 * プレイヤーの移動・ダッシュ・店との取引を担当
 */

import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Item } from '@/entities/Item';
import { Stairs } from '@/entities/Stairs';
import { Shop } from '@/entities/Shop';
import { Chest } from '@/entities/Chest';
import { GameMap } from '@/world/Map';
import { Renderer } from '@/renderer/Renderer';
import { UIManager } from '@/ui/UIManager';
import { ShopUI } from '@/ui/ShopUI';
import { MessageType } from '@/ui/MessageLog';
import { SoundManager, SoundType } from '@/utils/SoundManager';
import { MetaProgression } from '@/character/MetaProgression';
import { CombatSystem } from '@/combat/CombatSystem';
import { Vector2D } from '@/utils/Vector2D';

/**
 * プレイヤーアクション処理マネージャークラス
 * プレイヤーの各種アクションを一元管理
 */
export class PlayerActionHandler {
  private player: Player;
  private map: GameMap;
  private renderer: Renderer;
  private uiManager: UIManager;
  private shopUI: ShopUI;
  private soundManager: SoundManager;
  private metaProgression: MetaProgression;
  private enemies: Enemy[];
  private items: Item[];
  private stairs: Stairs | null;
  private shop: Shop | null;
  private chests: Chest[];

  constructor(
    player: Player,
    map: GameMap,
    renderer: Renderer,
    uiManager: UIManager,
    shopUI: ShopUI,
    soundManager: SoundManager,
    metaProgression: MetaProgression,
    enemies: Enemy[],
    items: Item[],
    stairs: Stairs | null,
    shop: Shop | null,
    chests: Chest[]
  ) {
    this.player = player;
    this.map = map;
    this.renderer = renderer;
    this.uiManager = uiManager;
    this.shopUI = shopUI;
    this.soundManager = soundManager;
    this.metaProgression = metaProgression;
    this.enemies = enemies;
    this.items = items;
    this.stairs = stairs;
    this.shop = shop;
    this.chests = chests;
  }

  /**
   * プレイヤーを移動
   * @param direction - 移動方向
   * @returns 移動成功したかどうか（ターン消費の判定）
   */
  movePlayer(direction: Vector2D): boolean {
    const currentPos = this.player.getPosition();
    const newPos = currentPos.add(direction);

    // マップ境界チェック
    if (!this.map.isInBoundsVec(newPos)) {
      return false;
    }

    // 壁チェック
    if (!this.map.isWalkableAt(newPos)) {
      return false;
    }

    // 敵との衝突チェック
    const enemyAtPosition = this.enemies.find(e => e.isAlive() && e.getPosition().equals(newPos));

    if (enemyAtPosition) {
      // 攻撃
      this.soundManager.play(SoundType.ATTACK);
      CombatSystem.attack(this.player, enemyAtPosition);
      return true;
    }

    // 移動
    this.player.setPosition(newPos);

    // カメラ追従
    this.renderer.setCameraPosition(newPos);

    // FOV更新（視界範囲ボーナス適用）
    const baseVisionRange = 8;
    const visionRange = baseVisionRange + this.metaProgression.getVisionRangeBonus();
    this.map.updateFOV(newPos, visionRange);

    // 階段の上に立った時にメッセージを表示
    if (this.stairs && this.stairs.getPosition().equals(newPos)) {
      this.uiManager.addMessage('階段を発見した！(Enterで次の階へ)', MessageType.INFO);
    }

    return true;
  }

  /**
   * ダッシュ移動（Shift + 移動キー）
   * 壁、敵、アイテム、階段、宝箱、分かれ道、部屋に遭遇するまで移動し続ける
   * @param direction - 移動方向
   * @returns 移動成功したかどうか
   */
  dashMove(direction: Vector2D): boolean {
    let moved = false;
    let stepsCount = 0;
    const maxSteps = 100; // 無限ループ防止

    // 開始時の周囲の歩行可能セル数を記録
    const startPos = this.player.getPosition();
    const startWalkableCount = this.countWalkableCells(startPos);
    const isStartingInCorridor = startWalkableCount < 5; // 通路からスタートかどうか

    while (stepsCount < maxSteps) {
      const currentPos = this.player.getPosition();
      const nextPos = currentPos.add(direction);

      // マップ境界チェック
      if (!this.map.isInBoundsVec(nextPos)) {
        break;
      }

      // 壁チェック
      if (!this.map.isWalkableAt(nextPos)) {
        break;
      }

      // 敵との衝突チェック
      const enemyAtPosition = this.enemies.find(
        e => e.isAlive() && e.getPosition().equals(nextPos)
      );
      if (enemyAtPosition) {
        // 敵に遭遇したら攻撃して停止
        this.soundManager.play(SoundType.ATTACK);
        CombatSystem.attack(this.player, enemyAtPosition);
        moved = true;
        break;
      }

      // アイテムチェック
      const itemAtPosition = this.items.find(item => item.getPosition().equals(nextPos));
      if (itemAtPosition) {
        // アイテムの上に移動して停止
        this.player.setPosition(nextPos);
        this.updateCameraAndFOV(nextPos);
        this.uiManager.addMessage('アイテムを発見した！(Gで拾う)', MessageType.INFO);
        moved = true;
        break;
      }

      // 階段チェック
      if (this.stairs && this.stairs.getPosition().equals(nextPos)) {
        // 階段の上に移動して停止
        this.player.setPosition(nextPos);
        this.updateCameraAndFOV(nextPos);
        this.uiManager.addMessage('階段を発見した！(Enterで次の階へ)', MessageType.INFO);
        moved = true;
        break;
      }

      // 宝箱チェック
      const chestAtPosition = this.chests.find(
        chest => !chest.isOpened && chest.getPosition().equals(nextPos)
      );
      if (chestAtPosition) {
        // 宝箱の上に移動して停止
        this.player.setPosition(nextPos);
        this.updateCameraAndFOV(nextPos);
        this.uiManager.addMessage('宝箱を発見した！(Gで開ける)', MessageType.INFO);
        moved = true;
        break;
      }

      // ショップチェック
      if (this.shop && this.shop.getPosition().equals(nextPos)) {
        // ショップの上に移動して停止
        this.player.setPosition(nextPos);
        this.updateCameraAndFOV(nextPos);
        this.uiManager.addMessage('店を発見した！(Tで取引)', MessageType.INFO);
        moved = true;
        break;
      }

      // 通常の移動
      this.player.setPosition(nextPos);
      this.updateCameraAndFOV(nextPos);
      moved = true;
      stepsCount++;

      // 移動後に分岐点・部屋をチェック（最初の一歩は除外）
      if (stepsCount > 0) {
        // 分かれ道チェック（来た方向と進行方向以外に進める場所がある）
        if (this.isJunction(nextPos, direction)) {
          break;
        }

        // 部屋チェック（通路からスタートした場合のみ有効）
        if (isStartingInCorridor) {
          const currentWalkableCount = this.countWalkableCells(nextPos);
          if (currentWalkableCount > startWalkableCount && currentWalkableCount >= 5) {
            break;
          }
        }
      }
    }

    return moved;
  }

  /**
   * 店で取引
   * @returns ターン消費するかどうか
   */
  interactWithShop(buyItemCallback: (item: Item) => void): boolean {
    const playerPos = this.player.getPosition();

    // 店が存在しないか、隣接していない
    if (!this.shop) {
      this.uiManager.addMessage('近くに商人がいない', MessageType.INFO);
      return false;
    }

    const shopPos = this.shop.getPosition();
    const distance = playerPos.distanceTo(shopPos);

    if (distance > 1.5) {
      this.uiManager.addMessage('商人に近づく必要がある', MessageType.INFO);
      return false;
    }

    // 店のインベントリを表示
    if (this.shop.inventory.length === 0) {
      this.uiManager.addMessage('商人は売り物を持っていない', MessageType.INFO);
      return false;
    }

    // 店のUIを開く
    this.shopUI.setShop(this.shop, this.player.gold);
    this.shopUI.setCallback(buyItemCallback);
    this.shopUI.open();

    return false; // UIを開くだけなのでターン消費しない
  }

  /**
   * 店からアイテムを購入
   * @param item - 購入するアイテム
   * @param updateUICallback - UI更新コールバック
   */
  buyItemFromShop(item: Item, updateUICallback: () => void): void {
    if (!this.shop) return;

    const price = this.shop.getItemPrice(item);
    const result = this.shop.buyItem(item, this.player.gold);

    if (result.success) {
      this.player.spendGold(price);
      const added = this.player.inventory.addItem(item);

      if (added) {
        this.soundManager.play(SoundType.PURCHASE);
        this.uiManager.addMessage(result.message, MessageType.SUCCESS);
        // 店のUIを更新
        this.shopUI.updatePlayerGold(this.player.gold);
        updateUICallback();
      } else {
        // インベントリがいっぱいの場合、購入をキャンセル
        this.player.addGold(price);
        this.shop.inventory.unshift(item);
        this.soundManager.play(SoundType.ERROR);
        this.uiManager.addMessage('インベントリがいっぱいです', MessageType.WARNING);
      }
    } else {
      this.soundManager.play(SoundType.ERROR);
      this.uiManager.addMessage(result.message, MessageType.WARNING);
    }
  }

  /**
   * 分岐点かどうかをチェック
   * 来た方向と進行方向以外に歩行可能な方向があるか
   */
  private isJunction(position: Vector2D, direction: Vector2D): boolean {
    // 来た方向（逆方向）
    const reverseDirection = new Vector2D(-direction.x, -direction.y);

    // チェックする方向（4方向）
    const directions = [Vector2D.UP, Vector2D.DOWN, Vector2D.LEFT, Vector2D.RIGHT];

    // 進行方向と逆方向以外に歩行可能な方向をカウント
    let alternativeRoutes = 0;
    for (const dir of directions) {
      // 進行方向と逆方向はスキップ
      if (dir.equals(direction) || dir.equals(reverseDirection)) {
        continue;
      }

      const checkPos = position.add(dir);
      if (this.map.isInBoundsVec(checkPos) && this.map.isWalkableAt(checkPos)) {
        alternativeRoutes++;
      }
    }

    // 代替ルートが1つでもあれば分岐点
    return alternativeRoutes > 0;
  }

  /**
   * 周囲8方向の歩行可能なセル数をカウント
   */
  private countWalkableCells(position: Vector2D): number {
    let count = 0;
    const directions = [
      new Vector2D(-1, -1),
      new Vector2D(0, -1),
      new Vector2D(1, -1),
      new Vector2D(-1, 0),
      new Vector2D(1, 0),
      new Vector2D(-1, 1),
      new Vector2D(0, 1),
      new Vector2D(1, 1),
    ];

    for (const dir of directions) {
      const checkPos = position.add(dir);
      if (this.map.isInBoundsVec(checkPos) && this.map.isWalkableAt(checkPos)) {
        count++;
      }
    }

    return count;
  }

  /**
   * カメラとFOVを更新（ヘルパーメソッド）
   */
  private updateCameraAndFOV(position: Vector2D): void {
    // カメラ追従
    this.renderer.setCameraPosition(position);

    // FOV更新（視界範囲ボーナス適用）
    const baseVisionRange = 8;
    const visionRange = baseVisionRange + this.metaProgression.getVisionRangeBonus();
    this.map.updateFOV(position, visionRange);
  }
}
