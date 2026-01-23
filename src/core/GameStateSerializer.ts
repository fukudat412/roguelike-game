/**
 * ゲーム状態のシリアライズ・デシリアライズを担当
 */

import { GameMap } from '@/world/Map';
import { Cell } from '@/world/Cell';
import { World } from '@/world/World';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Item } from '@/entities/Item';
import { Stairs, StairsDirection } from '@/entities/Stairs';
import { Shop } from '@/entities/Shop';
import { Chest, ChestType, ChestTemplates } from '@/entities/Chest';
import { Vector2D } from '@/utils/Vector2D';
import { EquipmentSlot } from '@/entities/components/Equipment';
import { TileType, TileFactory } from '@/world/Tile';
import { EnemyDatabase } from '@/data/enemies';
import { Skill, SkillDatabase } from '@/character/Skill';
import { StatusEffect } from '@/combat/StatusEffect';
import { getItemData } from '@/data/items';

/**
 * ゲーム状態のシリアライザークラス
 * セーブ/ロード時のデータ変換を一元管理
 */
export class GameStateSerializer {
  private player: Player;
  private world: World;
  private map: GameMap;
  private enemies: Enemy[];
  private items: Item[];
  private stairs: Stairs | null;
  private shop: Shop | null;
  private chests: Chest[];
  private statistics: any;

  constructor(
    player: Player,
    world: World,
    map: GameMap,
    enemies: Enemy[],
    items: Item[],
    stairs: Stairs | null,
    shop: Shop | null,
    chests: Chest[],
    statistics: any
  ) {
    this.player = player;
    this.world = world;
    this.map = map;
    this.enemies = enemies;
    this.items = items;
    this.stairs = stairs;
    this.shop = shop;
    this.chests = chests;
    this.statistics = statistics;
  }

  /**
   * ゲーム状態をシリアライズ
   */
  serialize(): any {
    return {
      player: {
        position: { x: this.player.getPosition().x, y: this.player.getPosition().y },
        level: this.player.level,
        experience: this.player.experience,
        experienceToNextLevel: this.player.experienceToNextLevel,
        gold: this.player.gold,
        hp: this.player.stats.hp,
        maxHp: this.player.stats.maxHp,
        mp: this.player.stats.mp,
        maxMp: this.player.stats.maxMp,
        attack: this.player.stats.attack,
        defense: this.player.stats.defense,
        speed: this.player.stats.speed,
        skillPoints: this.player.skillPoints,

        // ステータス効果
        statusEffects: this.player.statusEffects.getEffects().map(e => ({
          type: e.type,
          turnsRemaining: e.turnsRemaining,
        })),

        // スキル
        skills: this.player.skills.map(s => ({
          name: s.data.name,
          currentCooldown: s.currentCooldown,
        })),

        // インベントリ
        inventory: this.player.inventory.getItems().map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          itemType: item.itemType,
          rarity: item.rarity,
          stackable: item.stackable,
          stackCount: item.stackCount,
        })),

        // 装備
        equipment: {
          weapon: this.player.equipment.getEquipped(EquipmentSlot.WEAPON)
            ? this.serializeItem(this.player.equipment.getEquipped(EquipmentSlot.WEAPON)!)
            : null,
          armor: this.player.equipment.getEquipped(EquipmentSlot.ARMOR)
            ? this.serializeItem(this.player.equipment.getEquipped(EquipmentSlot.ARMOR)!)
            : null,
          accessory: this.player.equipment.getEquipped(EquipmentSlot.ACCESSORY)
            ? this.serializeItem(this.player.equipment.getEquipped(EquipmentSlot.ACCESSORY)!)
            : null,
        },
      },

      world: {
        dungeonType: this.world.getDungeonConfig().metadata.type,
        currentFloor: this.world.getCurrentFloor(),
      },

      map: {
        width: this.map.width,
        height: this.map.height,
        cells: this.map.getAllCells().map(cell => ({
          x: cell.position.x,
          y: cell.position.y,
          tileType: cell.tile.properties.type,
          explored: cell.explored,
        })),
      },

      entities: {
        enemies: this.enemies.map(e => ({
          x: e.getPosition().x,
          y: e.getPosition().y,
          name: e.name,
          hp: e.stats.hp,
          maxHp: e.stats.maxHp,
          attack: e.stats.attack,
          defense: e.stats.defense,
          speed: e.stats.speed,
          experienceValue: e.experienceValue,
          isBoss: e.isBoss,
          isElite: e.isElite || false,
        })),

        items: this.items.map(i => this.serializeItem(i)),

        stairs: this.stairs
          ? {
              x: this.stairs.getPosition().x,
              y: this.stairs.getPosition().y,
              direction: this.stairs.direction,
              targetFloor: this.stairs.targetFloor,
            }
          : null,

        shop: this.shop
          ? {
              x: this.shop.getPosition().x,
              y: this.shop.getPosition().y,
              inventory: this.shop.inventory.map(i => ({
                ...this.serializeItem(i),
                price: this.shop!.getItemPrice(i),
              })),
            }
          : null,

        chests: this.chests.map(c => ({
          x: c.getPosition().x,
          y: c.getPosition().y,
          type: c.template.type,
          isOpened: c.isOpened,
        })),
      },

      statistics: { ...this.statistics },
    };
  }

  /**
   * アイテムをシリアライズ
   */
  private serializeItem(item: Item): any {
    return {
      x: item.getPosition().x,
      y: item.getPosition().y,
      id: item.id,
      name: item.name,
      description: item.description,
      itemType: item.itemType,
      rarity: item.rarity,
      stackable: item.stackable,
      stackCount: item.stackCount,
    };
  }

  /**
   * ゲーム状態をデシリアライズ
   * @param saveData - セーブデータ
   * @returns 復元されたゲーム状態
   */
  deserialize(saveData: any): {
    map: GameMap;
    enemies: Enemy[];
    items: Item[];
    stairs: Stairs | null;
    shop: Shop | null;
    chests: Chest[];
    statistics: any;
  } {
    // プレイヤー状態を復元
    this.restorePlayerState(saveData.player);

    // マップを復元
    const restoredMap = this.restoreMap(saveData.map, saveData.world);

    // エンティティを復元
    const entities = this.restoreEntities(saveData.entities);

    // 統計を復元
    const statistics = { ...saveData.statistics };

    return {
      map: restoredMap,
      enemies: entities.enemies,
      items: entities.items,
      stairs: entities.stairs,
      shop: entities.shop,
      chests: entities.chests,
      statistics,
    };
  }

  /**
   * プレイヤー状態を復元
   */
  private restorePlayerState(playerData: any): void {
    this.player.setPosition(new Vector2D(playerData.position.x, playerData.position.y));
    this.player.level = playerData.level;
    this.player.experience = playerData.experience;
    this.player.experienceToNextLevel = playerData.experienceToNextLevel;
    this.player.gold = playerData.gold;
    this.player.stats.hp = playerData.hp;
    this.player.stats.maxHp = playerData.maxHp;
    this.player.stats.mp = playerData.mp;
    this.player.stats.maxMp = playerData.maxMp;
    this.player.stats.attack = playerData.attack;
    this.player.stats.defense = playerData.defense;
    this.player.stats.speed = playerData.speed;
    this.player.skillPoints = playerData.skillPoints;

    // ステータス効果を復元
    if (playerData.statusEffects && playerData.statusEffects.length > 0) {
      for (const effectData of playerData.statusEffects) {
        const effect = new StatusEffect(effectData.type, effectData.turnsRemaining);
        effect.turnsRemaining = effectData.turnsRemaining;
        this.player.statusEffects.addEffect(effect);
      }
    }

    // スキルを復元
    this.player.skills = [];
    if (playerData.skills && playerData.skills.length > 0) {
      for (const skillData of playerData.skills) {
        // SkillDatabaseから名前で検索
        const skillEntry = Object.values(SkillDatabase).find(s => s.data.name === skillData.name);
        if (skillEntry) {
          const skill = new Skill(skillEntry.data);
          skill.currentCooldown = skillData.currentCooldown || 0;
          this.player.skills.push(skill);
        }
      }
    }

    // インベントリを復元
    this.player.inventory.clear();
    if (playerData.inventory && playerData.inventory.length > 0) {
      for (const itemData of playerData.inventory) {
        const data = getItemData(itemData.id);
        if (data) {
          const item = new Item(0, 0, data);
          item.stackable = itemData.stackable || false;
          item.stackCount = itemData.stackCount || 1;
          this.player.inventory.addItem(item);
        }
      }
    }

    // 装備を復元
    if (playerData.equipment) {
      // 武器
      if (playerData.equipment.weapon) {
        const weaponData = getItemData(playerData.equipment.weapon.id);
        if (weaponData) {
          const weapon = new Item(0, 0, weaponData);
          this.player.equipment.equip(EquipmentSlot.WEAPON, weapon);
        }
      }

      // 防具
      if (playerData.equipment.armor) {
        const armorData = getItemData(playerData.equipment.armor.id);
        if (armorData) {
          const armor = new Item(0, 0, armorData);
          this.player.equipment.equip(EquipmentSlot.ARMOR, armor);
        }
      }

      // アクセサリ
      if (playerData.equipment.accessory) {
        const accessoryData = getItemData(playerData.equipment.accessory.id);
        if (accessoryData) {
          const accessory = new Item(0, 0, accessoryData);
          this.player.equipment.equip(EquipmentSlot.ACCESSORY, accessory);
        }
      }
    }
  }

  /**
   * マップを復元
   */
  private restoreMap(mapData: any, worldData: any): GameMap {
    // 新しいマップを作成（サイズのみ）
    const restoredMap = new GameMap(mapData.width, mapData.height);

    // 各セルをセーブデータから復元
    for (const cellData of mapData.cells) {
      const tile = TileFactory.createTile(cellData.tileType as TileType);
      const cell = new Cell(new Vector2D(cellData.x, cellData.y), tile);
      cell.explored = cellData.explored;
      restoredMap.setCell(cellData.x, cellData.y, cell);
    }

    // Worldに復元したマップを登録
    this.world.restoreFloor(worldData.currentFloor, restoredMap);

    return restoredMap;
  }

  /**
   * エンティティを復元
   */
  private restoreEntities(entitiesData: any): {
    enemies: Enemy[];
    items: Item[];
    stairs: Stairs | null;
    shop: Shop | null;
    chests: Chest[];
  } {
    // 敵を復元
    const enemies: Enemy[] = [];
    for (const enemyData of entitiesData.enemies) {
      // EnemyDatabaseから敵テンプレートを検索
      const template = Object.values(EnemyDatabase).find(t => t.name === enemyData.name);
      if (template) {
        const enemy = new Enemy(enemyData.x, enemyData.y, template, enemyData.isElite || false);
        // ステータスを復元
        enemy.stats.hp = enemyData.hp;
        enemy.stats.maxHp = enemyData.maxHp;
        enemy.stats.attack = enemyData.attack;
        enemy.stats.defense = enemyData.defense;
        enemy.stats.speed = enemyData.speed;
        enemy.experienceValue = enemyData.experienceValue;
        enemy.isBoss = enemyData.isBoss || false;
        enemies.push(enemy);
      }
    }

    // アイテムを復元
    const items: Item[] = [];
    for (const itemData of entitiesData.items) {
      const data = getItemData(itemData.id);
      if (data) {
        const item = new Item(itemData.x, itemData.y, data);
        item.stackable = itemData.stackable || false;
        item.stackCount = itemData.stackCount || 1;
        items.push(item);
      }
    }

    // 階段を復元
    let stairs: Stairs | null = null;
    if (entitiesData.stairs) {
      const stairsData = entitiesData.stairs;
      stairs = new Stairs(stairsData.x, stairsData.y, stairsData.direction, stairsData.targetFloor);
    }

    // 宝箱を復元
    const chests: Chest[] = [];
    for (const chestData of entitiesData.chests) {
      const template = ChestTemplates[chestData.type as ChestType];
      if (template) {
        const chest = new Chest(chestData.x, chestData.y, template);
        chest.isOpened = chestData.isOpened || false;
        chests.push(chest);
      }
    }

    // ショップを復元
    let shop: Shop | null = null;
    if (entitiesData.shop) {
      const shopData = entitiesData.shop;
      shop = new Shop(shopData.x, shopData.y);

      // ショップのアイテムを復元
      shop.inventory = [];
      for (const itemData of shopData.inventory) {
        const data = getItemData(itemData.id);
        if (data) {
          const item = new Item(0, 0, data);
          item.stackable = itemData.stackable || false;
          item.stackCount = itemData.stackCount || 1;
          shop.inventory.push(item);
        }
      }
    }

    return { enemies, items, stairs, shop, chests };
  }
}
