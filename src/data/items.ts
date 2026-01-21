/**
 * アイテムデータ定義
 * ゲーム内のすべてのアイテム
 */

import { ItemData, ItemType, ItemRarity } from '@/entities/Item';

export const ItemDatabase: Record<string, ItemData> = {
  // 消費アイテム - ポーション
  HEALTH_POTION_SMALL: {
    id: 'HEALTH_POTION_SMALL',
    name: '小さな回復ポーション',
    description: 'HPを30回復する',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    stackable: true,
    maxStack: 10,
    renderInfo: {
      char: '!',
      color: '#ff6b6b',
    },
  },

  HEALTH_POTION_MEDIUM: {
    id: 'HEALTH_POTION_MEDIUM',
    name: '回復ポーション',
    description: 'HPを60回復する',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.UNCOMMON,
    stackable: true,
    maxStack: 10,
    renderInfo: {
      char: '!',
      color: '#ff4444',
    },
  },

  HEALTH_POTION_LARGE: {
    id: 'HEALTH_POTION_LARGE',
    name: '大きな回復ポーション',
    description: 'HPを100回復する',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.RARE,
    stackable: true,
    maxStack: 10,
    renderInfo: {
      char: '!',
      color: '#cc0000',
    },
  },

  // 装備 - 武器
  RUSTY_SWORD: {
    id: 'RUSTY_SWORD',
    name: '錆びた剣',
    description: '攻撃力+3',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '/',
      color: '#8b7355',
    },
  },

  IRON_SWORD: {
    id: 'IRON_SWORD',
    name: '鉄の剣',
    description: '攻撃力+5',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '/',
      color: '#a0a0a0',
    },
  },

  STEEL_SWORD: {
    id: 'STEEL_SWORD',
    name: '鋼の剣',
    description: '攻撃力+8',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.UNCOMMON,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '/',
      color: '#c0c0c0',
    },
  },

  MAGIC_SWORD: {
    id: 'MAGIC_SWORD',
    name: '魔法の剣',
    description: '攻撃力+12',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.RARE,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '/',
      color: '#4ecdc4',
    },
  },

  // 装備 - 防具
  LEATHER_ARMOR: {
    id: 'LEATHER_ARMOR',
    name: '革の鎧',
    description: '防御力+2',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '[',
      color: '#8b7355',
    },
  },

  CHAINMAIL: {
    id: 'CHAINMAIL',
    name: 'チェインメイル',
    description: '防御力+4',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.UNCOMMON,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '[',
      color: '#a0a0a0',
    },
  },

  PLATE_ARMOR: {
    id: 'PLATE_ARMOR',
    name: 'プレートアーマー',
    description: '防御力+7',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.RARE,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '[',
      color: '#c0c0c0',
    },
  },

  // 巻物
  SCROLL_TELEPORT: {
    id: 'SCROLL_TELEPORT',
    name: 'テレポートの巻物',
    description: 'ランダムな場所に移動する',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.UNCOMMON,
    stackable: true,
    maxStack: 5,
    renderInfo: {
      char: '?',
      color: '#ffff00',
    },
  },

  SCROLL_FIREBALL: {
    id: 'SCROLL_FIREBALL',
    name: '火球の巻物',
    description: '範囲内の敵にダメージを与える',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.RARE,
    stackable: true,
    maxStack: 5,
    renderInfo: {
      char: '?',
      color: '#ff6600',
    },
  },

  // Epic装備
  DRAGON_SLAYER: {
    id: 'DRAGON_SLAYER',
    name: 'ドラゴンスレイヤー',
    description: '攻撃力+20、強力な伝説の剣',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.EPIC,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '/',
      color: '#a335ee',
    },
  },

  MYTHRIL_ARMOR: {
    id: 'MYTHRIL_ARMOR',
    name: 'ミスリルアーマー',
    description: '防御力+12、軽量で強靭な鎧',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.EPIC,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '[',
      color: '#a335ee',
    },
  },

  // Legendary装備
  EXCALIBUR: {
    id: 'EXCALIBUR',
    name: 'エクスカリバー',
    description: '攻撃力+30、選ばれし者の聖剣',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '/',
      color: '#ff8000',
    },
  },

  DIVINE_PLATE: {
    id: 'DIVINE_PLATE',
    name: '神聖なる鎧',
    description: '防御力+20、神の加護を受けた鎧',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    stackable: false,
    maxStack: 1,
    renderInfo: {
      char: '[',
      color: '#ff8000',
    },
  },

  // Epic消費アイテム
  ELIXIR: {
    id: 'ELIXIR',
    name: 'エリクサー',
    description: 'HPとMPを完全回復する',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.EPIC,
    stackable: true,
    maxStack: 3,
    renderInfo: {
      char: '!',
      color: '#a335ee',
    },
  },
};

/**
 * アイテムIDからデータを取得
 */
export function getItemData(id: string): ItemData | null {
  return ItemDatabase[id] || null;
}

/**
 * レア度に基づいてランダムなアイテムを取得
 */
export function getRandomItem(rarity?: ItemRarity): ItemData {
  const items = Object.values(ItemDatabase);

  if (rarity) {
    const filtered = items.filter(item => item.rarity === rarity);
    // 指定されたレア度のアイテムがない場合は全アイテムからランダムに選択
    if (filtered.length === 0) {
      return items[Math.floor(Math.random() * items.length)];
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  return items[Math.floor(Math.random() * items.length)];
}

/**
 * レア度をロールしてアイテムを取得
 */
export function rollRandomItem(): ItemData {
  const roll = Math.random();

  let rarity: ItemRarity;
  if (roll < 0.6) {
    rarity = ItemRarity.COMMON;
  } else if (roll < 0.85) {
    rarity = ItemRarity.UNCOMMON;
  } else if (roll < 0.95) {
    rarity = ItemRarity.RARE;
  } else if (roll < 0.99) {
    rarity = ItemRarity.EPIC;
  } else {
    rarity = ItemRarity.LEGENDARY;
  }

  return getRandomItem(rarity);
}
