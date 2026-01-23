/**
 * スキルシステム - 統合エクスポート
 */

// 基底クラスとインターフェース
export { Skill, SkillType, type SkillData } from './SkillBase';

// 各スキルクラス
export { PowerStrikeSkill } from './PowerStrikeSkill';
export { AreaSlashSkill } from './AreaSlashSkill';
export { HealingPrayerSkill } from './HealingPrayerSkill';
export { FireballSkill } from './FireballSkill';
export { TeleportSkill } from './TeleportSkill';
export { BerserkSkill } from './BerserkSkill';
export { IceWallSkill } from './IceWallSkill';
export { LifeStealSkill } from './LifeStealSkill';

// インポート
import { SkillType, Skill } from './SkillBase';
import { PowerStrikeSkill } from './PowerStrikeSkill';
import { AreaSlashSkill } from './AreaSlashSkill';
import { HealingPrayerSkill } from './HealingPrayerSkill';
import { FireballSkill } from './FireballSkill';
import { TeleportSkill } from './TeleportSkill';
import { BerserkSkill } from './BerserkSkill';
import { IceWallSkill } from './IceWallSkill';
import { LifeStealSkill } from './LifeStealSkill';

/**
 * スキルデータベース
 */
export const SkillDatabase: Record<SkillType, Skill> = {
  [SkillType.POWER_STRIKE]: new PowerStrikeSkill(),
  [SkillType.AREA_SLASH]: new AreaSlashSkill(),
  [SkillType.HEALING_PRAYER]: new HealingPrayerSkill(),
  [SkillType.FIREBALL]: new FireballSkill(),
  [SkillType.TELEPORT]: new TeleportSkill(),
  [SkillType.BERSERK]: new BerserkSkill(),
  [SkillType.ICE_WALL]: new IceWallSkill(),
  [SkillType.LIFE_STEAL]: new LifeStealSkill(),
};
