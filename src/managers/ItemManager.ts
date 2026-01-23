/**
 * アイテム管理マネージャー
 * アイテムの生成・配置・使用処理を担当
 */

import { Item, ItemType, ItemRarity } from '@/entities/Item';
import { Player } from '@/entities/Player';
import { GameMap } from '@/world/Map';
import { Vector2D } from '@/utils/Vector2D';
import { rollRandomItem, getItemData } from '@/data/items';
import { ItemAffixManager } from '@/items/ItemAffix';
import { IEntityManager } from '@/core/interfaces/IManager';
import { UIManager } from '@/ui/UIManager';
import { MessageType } from '@/ui/MessageLog';
import { SoundManager, SoundType } from '@/utils/SoundManager';
import { Equipment as EquipmentComponent } from '@/entities/components/Equipment';

/**
 * アイテムマネージャークラス
 * アイテムの生成、配置、使用処理を一元管理
 */
export class ItemManager implements IEntityManager<Item> {
  private items: Item[];
  private map: GameMap;
  private player: Player;
  private uiManager: UIManager;
  private soundManager: SoundManager;

  constructor(
    map: GameMap,
    player: Player,
    items: Item[],
    uiManager: UIManager,
    soundManager: SoundManager
  ) {
    this.map = map;
    this.player = player;
    this.items = items;
    this.uiManager = uiManager;
    this.soundManager = soundManager;
  }

  /**
   * アイテムを追加
   */
  add(item: Item): void {
    this.items.push(item);
  }

  /**
   * アイテムを削除
   */
  remove(item: Item): void {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  /**
   * インデックスを指定してアイテムを削除
   */
  removeAt(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
    }
  }

  /**
   * すべてのアイテムを取得
   */
  getAll(): Item[] {
    return this.items;
  }

  /**
   * 指定位置にあるアイテムを取得
   */
  getAt(position: Vector2D): Item | undefined {
    return this.items.find(i => i.getPosition().equals(position));
  }

  /**
   * すべてのアイテムをクリア
   */
  clear(): void {
    this.items.length = 0;
  }

  /**
   * アイテムの数を取得
   */
  count(): number {
    return this.items.length;
  }

  /**
   * アイテムを配置
   * @param count - 生成するアイテムの数
   */
  spawnItems(count: number): void {
    for (let i = 0; i < count; i++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const pos = cell.position;

      // プレイヤーとの距離をチェック
      if (this.player.getPosition().distanceTo(pos) < 5) {
        continue;
      }

      // ランダムなアイテムを生成
      const itemData = rollRandomItem();
      const item = new Item(pos.x, pos.y, itemData);

      // 装備の場合、接頭辞/接尾辞を付与（30%の確率）
      if (item.itemType === ItemType.EQUIPMENT && Math.random() < 0.3) {
        const prefix = ItemAffixManager.getRandomPrefix();
        const suffix = ItemAffixManager.getRandomSuffix();

        if (prefix || suffix) {
          // 名前を更新
          const newName = ItemAffixManager.generateName(item.name, prefix, suffix);
          item.name = newName;

          // 説明を更新
          const newDesc = ItemAffixManager.generateDescription(item.description, prefix, suffix);
          item.description = newDesc;

          // レア度を更新
          const newRarity = ItemAffixManager.calculateRarity(item.rarity, prefix, suffix);
          item.rarity = newRarity;

          // ボーナスステータスを反映（表示用に説明に追加済み）
        }
      }

      this.items.push(item);
    }
  }

  /**
   * 宝箱用のアイテムを生成
   * @param minRarity - 最小レア度
   * @param maxRarity - 最大レア度
   * @returns 生成されたアイテムデータ
   */
  generateItemForChest(minRarity: ItemRarity, maxRarity: ItemRarity): any {
    // レア度は呼び出し側で設定するため、ここではランダムアイテムのみ生成
    return rollRandomItem();
  }

  /**
   * レア度の中間値を取得
   * @param minRarity - 最小レア度
   * @param maxRarity - 最大レア度
   * @returns 中間のレア度
   */
  private getMidRarity(minRarity: ItemRarity, maxRarity: ItemRarity): ItemRarity {
    const rarityOrder = [
      ItemRarity.COMMON,
      ItemRarity.UNCOMMON,
      ItemRarity.RARE,
      ItemRarity.EPIC,
      ItemRarity.LEGENDARY,
    ];

    const minIndex = rarityOrder.indexOf(minRarity);
    const maxIndex = rarityOrder.indexOf(maxRarity);
    const midIndex = Math.floor((minIndex + maxIndex) / 2);

    return rarityOrder[midIndex];
  }

  /**
   * アイテムを使用
   * @param item - 使用するアイテム
   * @param onDamageEnemy - ファイアボールスクロール用：敵にダメージを与えるコールバック
   */
  useItem(item: Item, onDamageEnemy?: (enemyPos: Vector2D, damage: number) => void): void {
    // 消費アイテムの場合
    if (item.itemType === ItemType.CONSUMABLE) {
      // アイテムの効果を適用
      if (item.name.includes('ポーション')) {
        const healAmount = this.getHealAmount(item.name);
        this.player.stats.heal(healAmount);
        this.uiManager.addMessage(
          `${item.name}を使用してHPを${healAmount}回復した`,
          MessageType.INFO
        );
        this.soundManager.play(SoundType.PICKUP); // HEALではなくITEM_PICKUPを使用
      } else if (item.name.includes('魔力の薬')) {
        const mpRestore = 30;
        this.player.stats.mp = Math.min(this.player.stats.maxMp, this.player.stats.mp + mpRestore);
        this.uiManager.addMessage(
          `${item.name}を使用してMPを${mpRestore}回復した`,
          MessageType.INFO
        );
        this.soundManager.play(SoundType.PICKUP); // HEALではなくITEM_PICKUPを使用
      } else if (item.name.includes('テレポート')) {
        this.useTeleportScroll(item);
        return; // テレポートスクロールは内部で削除処理を行う
      } else if (item.name.includes('ファイアボール')) {
        this.useFireballScroll(item, onDamageEnemy);
        return; // ファイアボールスクロールは内部で削除処理を行う
      }

      // インベントリから削除
      this.player.inventory.removeItem(item);
    }
    // 装備の場合
    else if (item.itemType === ItemType.EQUIPMENT) {
      this.equipItem(item);
    }
  }

  /**
   * アイテムを装備
   * @param item - 装備するアイテム
   */
  private equipItem(item: Item): void {
    const slot = EquipmentComponent.getSlotForItem(item);

    if (!slot) {
      this.uiManager.addMessage(`${item.name}は装備できません`, MessageType.INFO);
      return;
    }

    // 既存の装備を外す
    const previousItem = this.player.equipment.equip(slot, item);
    if (previousItem) {
      this.player.inventory.addItem(previousItem);
    }

    // インベントリから削除
    this.player.inventory.removeItem(item);

    this.uiManager.addMessage(`${item.name}を装備した`, MessageType.INFO);
    this.soundManager.play(SoundType.PICKUP);
  }

  /**
   * 回復量を取得
   * @param itemName - アイテム名
   * @returns 回復量
   */
  private getHealAmount(itemName: string): number {
    if (itemName.includes('小')) return 30;
    if (itemName.includes('中')) return 60;
    if (itemName.includes('大')) return 100;
    return 30;
  }

  /**
   * テレポートスクロールを使用
   * @param item - テレポートスクロール
   */
  private useTeleportScroll(item: Item): void {
    // ランダムな位置にテレポート
    let attempts = 0;
    let newPos: Vector2D | null = null;

    while (attempts < 100) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) {
        attempts++;
        continue;
      }

      newPos = cell.position;
      break;
    }

    if (newPos) {
      this.player.setPosition(newPos);
      this.uiManager.addMessage('テレポート！', MessageType.INFO);
      this.soundManager.play(SoundType.SKILL);

      // インベントリから削除
      this.player.inventory.removeItem(item);
    } else {
      this.uiManager.addMessage('テレポートに失敗した', MessageType.WARNING);
    }
  }

  /**
   * ファイアボールスクロールを使用
   * @param item - ファイアボールスクロール
   * @param onDamageEnemy - 敵にダメージを与えるコールバック
   */
  useFireballScroll(
    item: Item,
    onDamageEnemy?: (enemyPos: Vector2D, damage: number) => void
  ): void {
    const playerPos = this.player.getPosition();
    const radius = 3;
    const baseDamage = 40;

    this.uiManager.addMessage('ファイアボールの巻物を使用した！', MessageType.COMBAT);
    this.soundManager.play(SoundType.SKILL);

    // 範囲内の敵にダメージを与える（コールバック経由）
    if (onDamageEnemy) {
      // 範囲内のすべての位置をチェック
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const targetPos = new Vector2D(playerPos.x + dx, playerPos.y + dy);
          const distance = Math.max(Math.abs(dx), Math.abs(dy));

          if (distance <= radius && distance > 0) {
            // 距離に応じてダメージを減衰
            const damageMultiplier = 1.0 - distance * 0.2;
            const damage = Math.floor(baseDamage * damageMultiplier);

            onDamageEnemy(targetPos, damage);
          }
        }
      }
    }

    // インベントリから削除
    this.player.inventory.removeItem(item);
  }

  /**
   * アイテムをドロップ
   * @param item - ドロップするアイテム
   */
  dropItem(item: Item): void {
    const playerPos = this.player.getPosition();

    // プレイヤーの位置にアイテムを配置
    item.setPosition(playerPos);

    // インベントリから削除
    this.player.inventory.removeItem(item);

    // マップにアイテムを追加
    this.items.push(item);

    this.uiManager.addMessage(`${item.name}を捨てた`, MessageType.INFO);
  }
}
