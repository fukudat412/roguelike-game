/**
 * アイテム接頭辞/接尾辞システム
 * 「炎の剣」「守護のプレートアーマー」などの生成
 */

import { ItemRarity } from '@/entities/Item';

export enum AffixType {
  PREFIX = 'PREFIX',
  SUFFIX = 'SUFFIX',
}

export interface Affix {
  id: string;
  type: AffixType;
  name: string;
  rarity: ItemRarity;
  statBonus: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    speed?: number;
  };
}

/**
 * 接頭辞データベース
 */
export const Prefixes: Record<string, Affix> = {
  FLAME: {
    id: 'FLAME',
    type: AffixType.PREFIX,
    name: '炎の',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { attack: 3 },
  },
  FROST: {
    id: 'FROST',
    type: AffixType.PREFIX,
    name: '氷の',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { attack: 2, defense: 1 },
  },
  LIGHTNING: {
    id: 'LIGHTNING',
    type: AffixType.PREFIX,
    name: '雷の',
    rarity: ItemRarity.RARE,
    statBonus: { attack: 4, speed: 10 },
  },
  SHADOW: {
    id: 'SHADOW',
    type: AffixType.PREFIX,
    name: '影の',
    rarity: ItemRarity.RARE,
    statBonus: { attack: 3, speed: 15 },
  },
  HOLY: {
    id: 'HOLY',
    type: AffixType.PREFIX,
    name: '聖なる',
    rarity: ItemRarity.EPIC,
    statBonus: { attack: 5, defense: 3 },
  },
  DEMONIC: {
    id: 'DEMONIC',
    type: AffixType.PREFIX,
    name: '魔の',
    rarity: ItemRarity.EPIC,
    statBonus: { attack: 6, maxHp: -10 },
  },
  ANCIENT: {
    id: 'ANCIENT',
    type: AffixType.PREFIX,
    name: '古代の',
    rarity: ItemRarity.LEGENDARY,
    statBonus: { attack: 8, defense: 5 },
  },
  GUARDIAN: {
    id: 'GUARDIAN',
    type: AffixType.PREFIX,
    name: '守護の',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { defense: 3 },
  },
  STEEL: {
    id: 'STEEL',
    type: AffixType.PREFIX,
    name: '鋼鉄の',
    rarity: ItemRarity.COMMON,
    statBonus: { defense: 2 },
  },
  SWIFT: {
    id: 'SWIFT',
    type: AffixType.PREFIX,
    name: '迅速な',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { speed: 20 },
  },
};

/**
 * 接尾辞データベース
 */
export const Suffixes: Record<string, Affix> = {
  POWER: {
    id: 'POWER',
    type: AffixType.SUFFIX,
    name: '力',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { attack: 3 },
  },
  PROTECTION: {
    id: 'PROTECTION',
    type: AffixType.SUFFIX,
    name: '守護',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { defense: 3 },
  },
  VITALITY: {
    id: 'VITALITY',
    type: AffixType.SUFFIX,
    name: '生命',
    rarity: ItemRarity.RARE,
    statBonus: { maxHp: 20 },
  },
  SPEED: {
    id: 'SPEED',
    type: AffixType.SUFFIX,
    name: '俊敏',
    rarity: ItemRarity.UNCOMMON,
    statBonus: { speed: 15 },
  },
  GIANT: {
    id: 'GIANT',
    type: AffixType.SUFFIX,
    name: '巨人',
    rarity: ItemRarity.RARE,
    statBonus: { attack: 4, maxHp: 15 },
  },
  TITAN: {
    id: 'TITAN',
    type: AffixType.SUFFIX,
    name: 'タイタン',
    rarity: ItemRarity.EPIC,
    statBonus: { attack: 5, defense: 4, maxHp: 25 },
  },
  DRAGON: {
    id: 'DRAGON',
    type: AffixType.SUFFIX,
    name: '竜',
    rarity: ItemRarity.LEGENDARY,
    statBonus: { attack: 8, defense: 6, maxHp: 30 },
  },
  EXCELLENCE: {
    id: 'EXCELLENCE',
    type: AffixType.SUFFIX,
    name: '卓越',
    rarity: ItemRarity.RARE,
    statBonus: { attack: 3, defense: 2 },
  },
  MASTER: {
    id: 'MASTER',
    type: AffixType.SUFFIX,
    name: '達人',
    rarity: ItemRarity.EPIC,
    statBonus: { attack: 5, defense: 3, speed: 10 },
  },
};

/**
 * アイテム接頭辞/接尾辞マネージャー
 */
export class ItemAffixManager {
  /**
   * ランダムな接頭辞を取得
   */
  static getRandomPrefix(minRarity: ItemRarity = ItemRarity.COMMON): Affix | null {
    const prefixes = Object.values(Prefixes).filter(p =>
      this.getRarityValue(p.rarity) >= this.getRarityValue(minRarity)
    );

    if (prefixes.length === 0 || Math.random() > 0.3) {
      return null;
    }

    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  /**
   * ランダムな接尾辞を取得
   */
  static getRandomSuffix(minRarity: ItemRarity = ItemRarity.COMMON): Affix | null {
    const suffixes = Object.values(Suffixes).filter(s =>
      this.getRarityValue(s.rarity) >= this.getRarityValue(minRarity)
    );

    if (suffixes.length === 0 || Math.random() > 0.3) {
      return null;
    }

    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  /**
   * レア度を数値に変換
   */
  private static getRarityValue(rarity: ItemRarity): number {
    const values: Record<ItemRarity, number> = {
      [ItemRarity.COMMON]: 0,
      [ItemRarity.UNCOMMON]: 1,
      [ItemRarity.RARE]: 2,
      [ItemRarity.EPIC]: 3,
      [ItemRarity.LEGENDARY]: 4,
    };
    return values[rarity];
  }

  /**
   * アイテム名を生成
   */
  static generateName(baseName: string, prefix: Affix | null, suffix: Affix | null): string {
    let name = baseName;

    if (prefix) {
      name = `${prefix.name}${name}`;
    }

    if (suffix) {
      name = `${name}の${suffix.name}`;
    }

    return name;
  }

  /**
   * 説明文を生成
   */
  static generateDescription(
    baseDescription: string,
    prefix: Affix | null,
    suffix: Affix | null
  ): string {
    const bonuses: string[] = [];

    if (prefix) {
      const bonus = this.formatBonuses(prefix.statBonus);
      if (bonus) bonuses.push(bonus);
    }

    if (suffix) {
      const bonus = this.formatBonuses(suffix.statBonus);
      if (bonus) bonuses.push(bonus);
    }

    if (bonuses.length > 0) {
      return `${baseDescription}\n${bonuses.join(', ')}`;
    }

    return baseDescription;
  }

  /**
   * ボーナスをフォーマット
   */
  private static formatBonuses(bonuses: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    speed?: number;
  }): string {
    const parts: string[] = [];

    if (bonuses.attack) {
      parts.push(`攻撃力${bonuses.attack > 0 ? '+' : ''}${bonuses.attack}`);
    }
    if (bonuses.defense) {
      parts.push(`防御力${bonuses.defense > 0 ? '+' : ''}${bonuses.defense}`);
    }
    if (bonuses.maxHp) {
      parts.push(`HP${bonuses.maxHp > 0 ? '+' : ''}${bonuses.maxHp}`);
    }
    if (bonuses.speed) {
      parts.push(`速度${bonuses.speed > 0 ? '+' : ''}${bonuses.speed}`);
    }

    return parts.join(', ');
  }

  /**
   * 合計ボーナスを計算
   */
  static getTotalBonuses(prefix: Affix | null, suffix: Affix | null): {
    attack: number;
    defense: number;
    maxHp: number;
    speed: number;
  } {
    const total = { attack: 0, defense: 0, maxHp: 0, speed: 0 };

    if (prefix) {
      total.attack += prefix.statBonus.attack || 0;
      total.defense += prefix.statBonus.defense || 0;
      total.maxHp += prefix.statBonus.maxHp || 0;
      total.speed += prefix.statBonus.speed || 0;
    }

    if (suffix) {
      total.attack += suffix.statBonus.attack || 0;
      total.defense += suffix.statBonus.defense || 0;
      total.maxHp += suffix.statBonus.maxHp || 0;
      total.speed += suffix.statBonus.speed || 0;
    }

    return total;
  }

  /**
   * レア度を計算（接頭辞/接尾辞を考慮）
   */
  static calculateRarity(
    baseRarity: ItemRarity,
    prefix: Affix | null,
    suffix: Affix | null
  ): ItemRarity {
    let rarityValue = this.getRarityValue(baseRarity);

    if (prefix) {
      rarityValue = Math.max(rarityValue, this.getRarityValue(prefix.rarity));
    }

    if (suffix) {
      rarityValue = Math.max(rarityValue, this.getRarityValue(suffix.rarity));
    }

    // 両方ある場合はさらに1段階上げる
    if (prefix && suffix) {
      rarityValue = Math.min(4, rarityValue + 1);
    }

    const rarities: ItemRarity[] = [
      ItemRarity.COMMON,
      ItemRarity.UNCOMMON,
      ItemRarity.RARE,
      ItemRarity.EPIC,
      ItemRarity.LEGENDARY,
    ];

    return rarities[rarityValue];
  }
}
