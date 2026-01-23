# リファクタリング計画書

## 概要

Game.ts（2890行）を中心とした巨大ファイルを機能ごとに分割し、保守性・テスタビリティ・可読性を向上させるリファクタリングプロジェクト。

### 主要な問題点

| ファイル | 現在の行数 | 目標行数 | 問題 |
|---------|-----------|---------|------|
| Game.ts | 2890行 | ~800行 | 10以上の責務が混在、63個のメソッド |
| MetaProgression.ts | 1896行 | ~300行 | 統計・実績・アップグレードが混在 |
| Skill.ts | 458行 | 分割 | 基底クラスと8種類のスキルが1ファイル |
| UI層（4ファイル） | 1077行 | 削減 | 同じパターンが重複 |
| SaveManager（2ファイル） | 512行 | ~360行 | 機能が二重化 |

---

## Phase 1: 基盤整備 - インターフェース定義とマネージャー基底クラス ✅

**目的**: リファクタリングの土台となるインターフェースと基底クラスを作成

### タスク 1.1: マネージャーインターフェースの定義 ✅

**作業内容**:
- [x] `src/core/interfaces/IManager.ts` を作成
- [x] `IEntityManager<T>` インターフェースを定義
- [x] `IGameLifecycle` インターフェースを定義
- [x] `src/core/interfaces/index.ts` を作成してエクスポート

**作成ファイル**:
- `src/core/interfaces/IManager.ts`
- `src/core/interfaces/index.ts`

**完了条件**: ✅ ビルドが成功し、型定義ファイルが正しくエクスポートされること

---

### タスク 1.2: UI基底クラス（BaseUIPanel）の抽出 ✅

**作業内容**:
- [x] `src/ui/base/BaseUIPanel.ts` を作成
- [x] 共通パターンを抽出:
  - パネルの開閉（open/close/toggle）
  - イベントリスナー管理（setupEventListeners/destroy）
  - 選択状態管理
  - レンダリング基盤
- [x] `src/ui/base/index.ts` を作成してエクスポート

**作成ファイル**:
- `src/ui/base/BaseUIPanel.ts`
- `src/ui/base/index.ts`

**完了条件**: ✅ BaseUIPanelクラスがビルドできること

---

**Phase 1 完了条件**:
- [x] タスク1.1完了
- [x] タスク1.2完了
- [x] `npm run build` が成功
- [x] コミット&プッシュ完了
- [x] ドキュメント更新

**状態**: ✅ 完了（2026-01-23）

---

## Phase 2: SaveManager の統一 ⬜

**目的**: SaveManager.tsとEnhancedSaveManager.tsを統一し、セーブ機能の一貫性を確保

### タスク 2.1: SaveManager統合 ⬜

**作業内容**:
- [ ] `EnhancedSaveManager` を `SaveManager` にリネーム
- [ ] 旧 `SaveManager.ts` の必要機能を統合
- [ ] 旧 `SaveManager.ts` を削除
- [ ] Game.tsの参照を更新

**影響ファイル**:
- `src/utils/EnhancedSaveManager.ts` → `src/utils/SaveManager.ts`
- `src/core/Game.ts`

**完了条件**: ✅ セーブ・ロード機能が正常に動作すること

**状態**: ⬜ 未着手

---

## Phase 3: Game.ts の分割 - エンティティマネージャー ⬜

**目的**: Game.tsから敵・アイテム・宝箱の管理ロジックを分離

### タスク 3.1: EnemyManager の抽出 ⬜

**移行メソッド**:
- `spawnEnemies()`, `spawnEnemiesForDungeon()`
- `spawnBoss()`, `spawnDungeonBoss()`
- `scaleEnemyStats()`
- `moveEnemyTowardsPlayer()`, `simpleEnemyMove()`
- `handleEnemyTurn()`の敵処理部分

**作成ファイル**:
- `src/managers/EnemyManager.ts`
- `src/managers/index.ts`

**完了条件**: ✅ 敵の生成・AI・死亡処理が正常に動作すること

---

### タスク 3.2: ItemManager の抽出 ⬜

**移行メソッド**:
- `spawnItems()`
- `pickupOrOpenChest()`のアイテム関連部分
- `useItem()`, `equipItem()`, `dropItem()`
- `getHealAmount()`, `useTeleportScroll()`, `useFireballScroll()`
- `generateItemForChest()`, `getMidRarity()`

**作成ファイル**:
- `src/managers/ItemManager.ts`

**完了条件**: ✅ アイテムの生成・使用・ドロップが正常に動作すること

---

### タスク 3.3: ChestManager の抽出 ⬜

**移行メソッド**:
- `spawnChests()`
- `openChest()`

**作成ファイル**:
- `src/managers/ChestManager.ts`

**完了条件**: ✅ 宝箱の生成・開封が正常に動作すること

**状態**: ⬜ 未着手

---

## Phase 4: Game.ts の分割 - ゲームフロー管理 ⬜

**目的**: Game.tsからマップ生成・階層移動・セーブ/ロードのロジックを分離

### タスク 4.1: FloorManager の抽出 ⬜

**移行メソッド**:
- `setupFloor()`
- `spawnStairs()`, `spawnShop()`
- `descendToNextFloor()`, `useStairs()`

**作成ファイル**:
- `src/managers/FloorManager.ts`

**完了条件**: ✅ 階層移動・セットアップが正常に動作すること

---

### タスク 4.2: GameStateSerializer の抽出 ⬜

**移行メソッド**:
- `serializeGameState()`, `serializeItem()`
- `deserializeGameState()`
- `restoreMap()`, `restoreEntities()`

**作成ファイル**:
- `src/core/GameStateSerializer.ts`

**完了条件**: ✅ セーブ・ロード機能が正常に動作すること

**状態**: ⬜ 未着手

---

## Phase 5: Game.ts の分割 - スキル・プレイヤーアクション ⬜

**目的**: スキル実行とプレイヤーアクション処理を分離

### タスク 5.1: SkillExecutor の抽出 ⬜

**移行メソッド**:
- `useSkill()`

**作成ファイル**:
- `src/managers/SkillExecutor.ts`

**完了条件**: ✅ 全スキルが正常に使用できること

---

### タスク 5.2: PlayerActionHandler の抽出 ⬜

**移行メソッド**:
- `movePlayer()`, `dashMove()`
- `isJunction()`, `countWalkableCells()`
- `updateCameraAndFOV()`
- `interactWithShop()`, `buyItemFromShop()`

**作成ファイル**:
- `src/managers/PlayerActionHandler.ts`

**完了条件**: ✅ プレイヤーの移動・ダッシュ・店取引が正常に動作すること

**状態**: ⬜ 未着手

---

## Phase 6: MetaProgression の分割 ⬜

**目的**: MetaProgression.ts（1896行）を責務ごとに分割

### タスク 6.1: AchievementSystem の抽出 ⬜

**移行内容**:
- `AchievementType` enum
- `Achievement` インターフェース
- `AchievementDatabase`
- 実績チェック・解禁関連メソッド

**作成ファイル**:
- `src/character/progression/AchievementSystem.ts`
- `src/character/progression/index.ts`

---

### タスク 6.2: UpgradeSystem の抽出 ⬜

**移行内容**:
- `UpgradeType` enum
- `Upgrade` インターフェース
- `UpgradeDatabase`
- アップグレード購入・効果適用メソッド

**作成ファイル**:
- `src/character/progression/UpgradeSystem.ts`

---

### タスク 6.3: MetaStatistics の抽出 ⬜

**移行内容**:
- 統計記録メソッド（recordKill, recordFloor等）
- 統計取得メソッド

**作成ファイル**:
- `src/character/progression/MetaStatistics.ts`

**状態**: ⬜ 未着手

---

## Phase 7: Skill.ts の分割 ⬜

**目的**: Skill.ts（458行）を各スキルごとのファイルに分割

### タスク 7.1: スキル基底クラスの分離 ⬜

**作成ファイル**:
- `src/character/skills/SkillBase.ts`
- `src/character/skills/index.ts`

---

### タスク 7.2: 各スキルクラスの分離 ⬜

**作成ファイル**（8種類）:
- `src/character/skills/PowerStrikeSkill.ts`
- `src/character/skills/AreaSlashSkill.ts`
- `src/character/skills/HealingPrayerSkill.ts`
- `src/character/skills/FireballSkill.ts`
- `src/character/skills/TeleportSkill.ts`
- `src/character/skills/BerserkSkill.ts`
- `src/character/skills/IceWallSkill.ts`
- `src/character/skills/LifeStealSkill.ts`

**削除ファイル**:
- `src/character/Skill.ts`

**状態**: ⬜ 未着手

---

## Phase 8: UI層の統合 ⬜

**目的**: UIクラスをBaseUIPanelから継承させて重複を排除

### タスク 8.1: InventoryUI のリファクタリング ⬜
### タスク 8.2: ShopUI のリファクタリング ⬜
### タスク 8.3: MetaProgressionUI のリファクタリング ⬜

**状態**: ⬜ 未着手

---

## 進捗状況

| Phase | 状態 | 完了日 |
|-------|------|--------|
| Phase 1 | ✅ 完了 | 2026-01-23 |
| Phase 2 | ⬜ 未着手 | - |
| Phase 3 | ⬜ 未着手 | - |
| Phase 4 | ⬜ 未着手 | - |
| Phase 5 | ⬜ 未着手 | - |
| Phase 6 | ⬜ 未着手 | - |
| Phase 7 | ⬜ 未着手 | - |
| Phase 8 | ⬜ 未着手 | - |

**全体進捗**: 1/8 Phase完了 (12.5%)

---

## 完了後の期待される効果

### コード量の削減

| ファイル | Before | After | 削減率 |
|---------|--------|-------|--------|
| Game.ts | 2890行 | ~800行 | 72% |
| MetaProgression.ts | 1896行 | ~300行 | 84% |
| UI層重複コード | ~200行 | 0行 | 100% |

### アーキテクチャの改善

- ✅ 単一責任の原則に準拠
- ✅ 各マネージャーが独立してテスト可能
- ✅ 疎結合なシステム設計
- ✅ 新機能追加が容易

---

最終更新: 2026-01-23
