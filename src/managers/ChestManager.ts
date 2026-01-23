/**
 * 宝箱管理マネージャー
 * 宝箱の生成・配置・開封処理を担当
 */

import { Chest, ChestType, ChestTemplates } from '@/entities/Chest';
import { Item } from '@/entities/Item';
import { Player } from '@/entities/Player';
import { GameMap } from '@/world/Map';
import { Vector2D } from '@/utils/Vector2D';
import { IEntityManager } from '@/core/interfaces/IManager';
import { UIManager } from '@/ui/UIManager';
import { MessageType } from '@/ui/MessageLog';
import { SoundManager, SoundType } from '@/utils/SoundManager';
import { ItemManager } from './ItemManager';

/**
 * 宝箱開封時のコールバック
 */
export interface ChestOpenCallbacks {
  onChestOpened: () => void; // 統計・チャレンジ・メタ更新用
}

/**
 * 宝箱マネージャークラス
 * 宝箱の生成、配置、開封処理を一元管理
 */
export class ChestManager implements IEntityManager<Chest> {
  private chests: Chest[];
  private map: GameMap;
  private player: Player;
  private items: Item[];
  private uiManager: UIManager;
  private soundManager: SoundManager;
  private itemManager: ItemManager;

  constructor(
    map: GameMap,
    player: Player,
    chests: Chest[],
    items: Item[],
    uiManager: UIManager,
    soundManager: SoundManager,
    itemManager: ItemManager
  ) {
    this.map = map;
    this.player = player;
    this.chests = chests;
    this.items = items;
    this.uiManager = uiManager;
    this.soundManager = soundManager;
    this.itemManager = itemManager;
  }

  /**
   * 宝箱を追加
   */
  add(chest: Chest): void {
    this.chests.push(chest);
  }

  /**
   * 宝箱を削除
   */
  remove(chest: Chest): void {
    const index = this.chests.indexOf(chest);
    if (index !== -1) {
      this.chests.splice(index, 1);
    }
  }

  /**
   * インデックスを指定して宝箱を削除
   */
  removeAt(index: number): void {
    if (index >= 0 && index < this.chests.length) {
      this.chests.splice(index, 1);
    }
  }

  /**
   * すべての宝箱を取得
   */
  getAll(): Chest[] {
    return this.chests;
  }

  /**
   * 指定位置にある宝箱を取得
   */
  getAt(position: Vector2D): Chest | undefined {
    return this.chests.find(c => c.getPosition().equals(position));
  }

  /**
   * すべての宝箱をクリア
   */
  clear(): void {
    this.chests.length = 0;
  }

  /**
   * 宝箱の数を取得
   */
  count(): number {
    return this.chests.length;
  }

  /**
   * 宝箱を配置
   * @param count - 生成する宝箱の数
   */
  spawnChests(count: number): void {
    for (let i = 0; i < count; i++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const pos = cell.position;

      // プレイヤーとの距離をチェック
      if (this.player.getPosition().distanceTo(pos) < 8) {
        continue;
      }

      // 既存の宝箱と重ならないようにチェック
      const occupied = this.chests.some(c => c.getPosition().equals(pos));
      if (occupied) continue;

      // ランダムに宝箱タイプを選択
      const roll = Math.random();
      let chestType: ChestType;

      if (roll < 0.5) {
        chestType = ChestType.WOODEN;
      } else if (roll < 0.8) {
        chestType = ChestType.IRON;
      } else if (roll < 0.95) {
        chestType = ChestType.GOLDEN;
      } else {
        chestType = ChestType.TRAPPED;
      }

      const template = ChestTemplates[chestType];
      const chest = new Chest(pos.x, pos.y, template);

      this.chests.push(chest);
    }
  }

  /**
   * 宝箱を開ける
   * @param chest - 開ける宝箱
   * @param callbacks - コールバック関数群
   * @returns 開封成功したかどうか
   */
  openChest(chest: Chest, callbacks?: ChestOpenCallbacks): boolean {
    const template = chest.template;

    // 罠チェック
    if (Math.random() < template.trapChance) {
      this.player.stats.takeDamage(template.trapDamage);
      this.soundManager.play(SoundType.DAMAGE);
      this.uiManager.addMessage(
        `罠だ！${template.trapDamage}ダメージを受けた！`,
        MessageType.WARNING
      );
    } else {
      this.soundManager.play(SoundType.PICKUP);
    }

    // 宝箱を開ける
    chest.open();

    // 統計・チャレンジ・メタ更新のコールバック呼び出し
    if (callbacks?.onChestOpened) {
      callbacks.onChestOpened();
    }

    // アイテムを生成
    const playerPos = this.player.getPosition();
    for (let i = 0; i < template.itemCount; i++) {
      const itemData = this.itemManager.generateItemForChest(
        template.minRarity,
        template.maxRarity
      );
      const item = new Item(playerPos.x, playerPos.y, itemData);

      // レア度を設定
      const rarityRoll = Math.random();
      if (rarityRoll < 0.4) {
        item.rarity = template.minRarity;
      } else if (rarityRoll < 0.8) {
        // 中間のレア度
        item.rarity = template.minRarity; // 簡略化: itemManagerにも委譲可能
      } else {
        item.rarity = template.maxRarity;
      }

      this.items.push(item);
    }

    this.uiManager.addMessage(
      `${chest.name}を開けた！${template.itemCount}個のアイテムを発見！`,
      MessageType.SUCCESS
    );

    return true;
  }
}
