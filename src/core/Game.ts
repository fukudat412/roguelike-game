/**
 * メインゲームクラス
 * ゲームループ、状態管理、システム統合
 */

import { Renderer } from '@/renderer/Renderer';
import { GameState, GamePhase } from './GameState';
import { Input, Action } from './Input';
import { eventBus, GameEvents } from './EventBus';
import { UIManager } from '@/ui/UIManager';
import { InventoryUI } from '@/ui/InventoryUI';
import { ShopUI } from '@/ui/ShopUI';
import { Minimap } from '@/ui/Minimap';
import { MetaProgressionUI } from '@/ui/MetaProgressionUI';
import { SkillSelectionUI } from '@/ui/SkillSelectionUI';
import { AchievementNotificationUI } from '@/ui/AchievementNotificationUI';
import { GameMap } from '@/world/Map';
import { World } from '@/world/World';
import { RoomGenerator } from '@/world/generators/RoomGenerator';
import { CaveGenerator } from '@/world/generators/CaveGenerator';
import { BSPGenerator } from '@/world/generators/BSPGenerator';
import { Player } from '@/entities/Player';
import { Enemy, EnemyTemplate } from '@/entities/Enemy';
import { Item, ItemType, ItemRarity } from '@/entities/Item';
import { Stairs, StairsDirection } from '@/entities/Stairs';
import { Shop } from '@/entities/Shop';
import { Chest, ChestType, ChestTemplates } from '@/entities/Chest';
import { Equipment as EquipmentComponent, EquipmentSlot } from '@/entities/components/Equipment';
import { CombatEntity } from '@/entities/Entity';
import { CombatSystem } from '@/combat/CombatSystem';
import { Vector2D } from '@/utils/Vector2D';
import { MessageType } from '@/ui/MessageLog';
import { rollRandomItem, getItemData } from '@/data/items';
import { getRandomEnemyForFloor, isBossFloor, getBossForFloor } from '@/data/enemies';
import { AStar } from '@/ai/pathfinding/AStar';
import { ItemAffixManager } from '@/items/ItemAffix';
import { StatusEffectType } from '@/combat/StatusEffect';
import { SaveManager, GameSaveData } from '@/utils/SaveManager';
import { EnhancedSaveManager } from '@/utils/EnhancedSaveManager';
import { SoundManager, SoundType } from '@/utils/SoundManager';
import { MetaProgression } from '@/character/MetaProgression';
import { DailyChallenge, ChallengeType } from './DailyChallenge';
import { DungeonType } from '@/world/DungeonType';
import { EnemyDatabase } from '@/data/enemies';
import { DungeonSelectionUI } from '@/ui/DungeonSelectionUI';

export class Game {
  private renderer: Renderer;
  private gameState: GameState;
  private input: Input;
  private uiManager: UIManager;
  private inventoryUI: InventoryUI;
  private shopUI: ShopUI;
  private minimap: Minimap;
  private metaProgressionUI: MetaProgressionUI;
  private skillSelectionUI: SkillSelectionUI;
  private achievementNotificationUI: AchievementNotificationUI;
  private soundManager: SoundManager;
  private metaProgression: MetaProgression;
  private dailyChallenge: DailyChallenge;
  private dungeonSelectionUI: DungeonSelectionUI | null = null;

  private world!: World;
  private map!: GameMap;
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: Item[] = [];
  private stairs!: Stairs;
  private shop!: Shop | null;
  private chests: Chest[] = [];

  // ゲーム統計
  private statistics = {
    enemiesKilled: 0,
    itemsCollected: 0,
    goldEarned: 0,
    bossesDefeated: 0,
    chestsOpened: 0,
    turnsPlayed: 0,
  };

  private lastFrameTime: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.gameState = new GameState();
    this.input = new Input();
    this.uiManager = new UIManager();
    this.inventoryUI = new InventoryUI();
    this.shopUI = new ShopUI();
    this.minimap = new Minimap();
    this.soundManager = new SoundManager();
    this.metaProgression = new MetaProgression();
    this.metaProgressionUI = new MetaProgressionUI();
    this.skillSelectionUI = new SkillSelectionUI();
    this.achievementNotificationUI = new AchievementNotificationUI();
    this.dailyChallenge = new DailyChallenge();

    // 実績解禁時の通知を設定
    this.metaProgression.setAchievementCallback(achievement => {
      this.achievementNotificationUI.show(achievement);
    });

    this.setupEventListeners();
  }

  /**
   * イベントリスナー設定
   */
  private setupEventListeners(): void {
    // 敵死亡時に配列から削除とゴールドドロップ
    eventBus.on(GameEvents.ENEMY_DEATH, (data: { name: string; enemy?: Enemy }) => {
      if (data.enemy) {
        this.handleEnemyDeath(data.enemy);
      }
      this.enemies = this.enemies.filter(e => e.isAlive());
    });

    // プレイヤーダメージ時にサウンド
    eventBus.on(GameEvents.PLAYER_DAMAGE, () => {
      this.soundManager.play(SoundType.DAMAGE);
    });

    // レベルアップ時にサウンド
    eventBus.on(GameEvents.PLAYER_LEVEL_UP, () => {
      this.soundManager.play(SoundType.LEVEL_UP);
    });

    // プレイヤー死亡時に統計表示
    eventBus.on(GameEvents.PLAYER_DEATH, () => {
      // 復活機能チェック
      if (this.metaProgression.hasReviveOnce()) {
        // 復活処理
        this.metaProgression.consumeRevive();
        const reviveHp = Math.floor(this.player.stats.maxHp * 0.5);
        this.player.stats.hp = reviveHp;

        this.soundManager.play(SoundType.LEVEL_UP);
        this.uiManager.addMessage('【不死鳥の加護】HP50%で復活しました！', MessageType.SUCCESS);
        this.updateUI();

        // 復活したのでゲームオーバーにしない
        return;
      }

      this.soundManager.play(SoundType.DAMAGE);

      // パーマデス: セーブデータを削除
      EnhancedSaveManager.deleteSave(0);
      console.log('💀 パーマデス: セーブデータを削除しました');

      // 死亡報酬SPを付与
      const floorReached = this.world.getCurrentFloor();
      const spReward = this.metaProgression.recordDeathReward(floorReached);

      // 統計情報を収集して表示
      const stats = {
        floor: floorReached,
        enemiesKilled: this.statistics.enemiesKilled,
        bossesDefeated: this.statistics.bossesDefeated,
        itemsCollected: this.statistics.itemsCollected,
        chestsOpened: this.statistics.chestsOpened,
        goldEarned: this.statistics.goldEarned,
        turnsPlayed: this.statistics.turnsPlayed,
      };

      // 少し遅延させてゲームオーバー画面を表示
      setTimeout(() => {
        this.uiManager.showGameOver(stats);
        // 死亡報酬メッセージ
        if (spReward > 0) {
          this.uiManager.addMessage(
            `【死亡報酬】${spReward} ソウルポイントを獲得しました`,
            MessageType.INFO
          );
        }
      }, 500);
    });

    // UI更新
    eventBus.on(GameEvents.UI_UPDATE, () => {
      this.updateUI();
    });

    // 戦闘ヒット時にダメージ数字表示
    eventBus.on(
      GameEvents.COMBAT_HIT,
      (data: { attacker: string; target: string; damage: number }) => {
        // ターゲットの位置を探す
        let targetPos: Vector2D | null = null;

        if (data.target === this.player.name) {
          targetPos = this.player.getPosition();
        } else {
          const enemy = this.enemies.find(e => e.name === data.target);
          if (enemy) {
            targetPos = enemy.getPosition();
          }
        }

        if (targetPos) {
          this.renderer.addDamageNumber(targetPos.x, targetPos.y, data.damage, false, false);
        }

        // プレイヤーが与えたダメージを記録
        if (data.attacker === this.player.name) {
          this.metaProgression.recordDamage(data.damage);
        }
      }
    );

    // クリティカルヒット時にダメージ数字表示
    eventBus.on(
      GameEvents.COMBAT_CRITICAL,
      (data: { attacker: string; target: string; damage: number }) => {
        let targetPos: Vector2D | null = null;

        if (data.target === this.player.name) {
          targetPos = this.player.getPosition();
        } else {
          const enemy = this.enemies.find(e => e.name === data.target);
          if (enemy) {
            targetPos = enemy.getPosition();
          }
        }

        if (targetPos) {
          this.renderer.addDamageNumber(targetPos.x, targetPos.y, data.damage, true, false);
        }

        // プレイヤーが与えたダメージを記録
        if (data.attacker === this.player.name) {
          this.metaProgression.recordDamage(data.damage);
        }
      }
    );

    // リスタートボタン
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        this.restart();
      });
    }

    // セーブボタン
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveGame();
      });
    }

    // ロードボタン
    const loadButton = document.getElementById('load-button');
    if (loadButton) {
      loadButton.addEventListener('click', () => {
        this.loadGame();
      });
    }

    // セーブ削除ボタン
    const deleteSaveButton = document.getElementById('delete-save-button');
    if (deleteSaveButton) {
      deleteSaveButton.addEventListener('click', () => {
        if (confirm('セーブデータを削除しますか？')) {
          SaveManager.deleteSave();
          this.updateSaveInfo();
          this.uiManager.addMessage('セーブデータを削除しました', MessageType.INFO);
        }
      });
    }

    // セーブ情報を更新
    this.updateSaveInfo();
  }

  /**
   * ダンジョン選択UI設定
   */
  setupDungeonSelectionUI(dungeonSelectionUI: DungeonSelectionUI): void {
    this.dungeonSelectionUI = dungeonSelectionUI;
    dungeonSelectionUI.setMetaProgression(this.metaProgression, this.metaProgressionUI, upgrade =>
      this.handleUpgradePurchase(upgrade)
    );
  }

  /**
   * アップグレード購入処理
   */
  private handleUpgradePurchase(upgrade: any): void {
    const success = this.metaProgression.purchaseUpgrade(upgrade.type);
    if (success) {
      this.soundManager.play(SoundType.PURCHASE);
      this.uiManager.addMessage(`${upgrade.name}を購入しました！`, MessageType.SUCCESS);
    } else {
      this.soundManager.play(SoundType.ERROR);
      this.uiManager.addMessage('アップグレードを購入できませんでした', MessageType.WARNING);
    }
  }

  /**
   * ゲーム初期化
   */
  initialize(dungeonType: DungeonType = DungeonType.CAVE): void {
    // 統計をリセット
    this.statistics = {
      enemiesKilled: 0,
      itemsCollected: 0,
      goldEarned: 0,
      bossesDefeated: 0,
      chestsOpened: 0,
      turnsPlayed: 0,
    };

    // ワールド生成（ダンジョンタイプ指定）
    this.world = new World(dungeonType);
    this.map = this.world.getCurrentMap();

    // プレイヤー配置
    const startPos = this.world.getRandomStartPosition();
    this.player = new Player(startPos.x, startPos.y);

    // メタプログレッションをプレイヤーに設定
    this.player.setMetaProgression(this.metaProgression);

    // メタプログレッションを戦闘システムに設定
    CombatSystem.setMetaProgression(this.metaProgression);

    // メタプログレッションの永続ボーナスを適用
    const bonuses = this.metaProgression.getPermanentBonuses();
    if (bonuses.hp > 0) this.player.stats.increaseMaxHp(bonuses.hp);
    if (bonuses.mp > 0) this.player.stats.increaseMaxMp(bonuses.mp);
    if (bonuses.attack > 0) this.player.stats.increaseAttack(bonuses.attack);
    if (bonuses.defense > 0) this.player.stats.increaseDefense(bonuses.defense);
    if (bonuses.gold > 0) this.player.addGold(bonuses.gold, false); // 初期ゴールドは倍率適用しない

    // インベントリ拡張の適用
    if (this.metaProgression.hasInventoryExpansion()) {
      this.player.inventory.expandCapacity(5);
    }

    // スキル選択UIを設定
    this.skillSelectionUI.setPlayer(this.player, skill => {
      this.uiManager.addMessage(`スキル「${skill.data.name}」を習得した！`, MessageType.INFO);
      eventBus.emit(GameEvents.UI_UPDATE);
    });

    // 新規ラン記録
    this.metaProgression.recordNewRun();

    // 階層をセットアップ
    this.setupFloor();
  }

  /**
   * 階層をセットアップ
   */
  private setupFloor(): void {
    // 既存のエンティティをクリア
    this.enemies = [];
    this.items = [];
    this.shop = null;
    this.chests = [];

    const currentFloor = this.world.getCurrentFloor();

    // ボスフロアチェック
    const dungeonConfig = this.world.getDungeonConfig();
    if (dungeonConfig.bosses[currentFloor]) {
      // ボス戦（ダンジョン設定に基づく）
      this.spawnDungeonBoss();
      this.uiManager.addMessage(`【警告】ボス階層に到達した！`, MessageType.WARNING);

      // ボス階警告オーバーレイを表示
      this.showBossWarning(dungeonConfig.bosses[currentFloor]);
    } else {
      // 通常フロア：敵数は階層に応じて増加（ダンジョン設定の倍率適用）
      const baseCount = 5;
      const growthRate = Math.floor(currentFloor * 1.2);
      const rawCount = baseCount + growthRate;
      const enemyCount = Math.floor(rawCount * dungeonConfig.enemies.spawnMultiplier);
      const finalCount = Math.min(enemyCount, 20); // 上限20体

      this.spawnEnemiesForDungeon(finalCount);

      // 店を配置（30%の確率）
      if (Math.random() < 0.3) {
        this.spawnShop();
      }
    }

    // アイテムを配置（5-7個）
    const itemCount = 5 + Math.floor(Math.random() * 3);
    this.spawnItems(itemCount);

    // 宝箱を配置（1-2個）
    const chestCount = 1 + Math.floor(Math.random() * 2);
    this.spawnChests(chestCount);

    // 階段を配置（最終階以外）
    const MAX_FLOOR = 30;
    if (currentFloor < MAX_FLOOR) {
      this.spawnStairs();
    } else {
      // 最終階メッセージ
      this.uiManager.addMessage(
        '【最終階】全ての敵を倒してダンジョンを制覇しよう！',
        MessageType.WARNING
      );
    }

    // インベントリUIの設定
    this.inventoryUI.setInventory(this.player.inventory);
    this.inventoryUI.setCallbacks(
      item => this.useItem(item),
      item => this.dropItem(item)
    );

    // カメラをプレイヤーに追従
    this.renderer.setCameraPosition(this.player.getPosition());

    // FOV更新（視界範囲ボーナス適用）
    const baseVisionRange = 8;
    const visionRange = baseVisionRange + this.metaProgression.getVisionRangeBonus();
    this.map.updateFOV(this.player.getPosition(), visionRange);

    // UI更新
    this.updateUI();

    // プレイヤーターン開始
    this.gameState.startPlayerTurn();

    // 初回のみウェルカムメッセージ
    if (this.world.getCurrentFloor() === 1) {
      this.uiManager.addMessage('ダンジョンに入った。冒険を開始しよう！', MessageType.INFO);
    }
  }

  /**
   * 階段を配置
   */
  private spawnStairs(): void {
    const playerPos = this.player.getPosition();
    const maxAttempts = 100;
    let bestCell = null;
    let bestDistance = 0;

    // 最大100回試行して、できるだけプレイヤーから離れた位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      // 最も離れた位置を記録
      if (distance > bestDistance) {
        bestDistance = distance;
        bestCell = cell;
      }

      // 理想的な距離（10マス以上）が見つかったら終了
      if (distance >= 10) {
        break;
      }
    }

    // 適切な位置が見つからなくても、最良の位置に配置
    if (bestCell) {
      const pos = bestCell.position;
      const targetFloor = this.world.getCurrentFloor() + 1;
      this.stairs = new Stairs(pos.x, pos.y, StairsDirection.DOWN, targetFloor);
    }
  }

  /**
   * 店を配置
   */
  private spawnShop(): void {
    const playerPos = this.player.getPosition();
    const maxAttempts = 50;
    let bestCell = null;
    let bestDistance = 0;

    // 最大50回試行して、できるだけプレイヤーから離れた位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      if (distance > bestDistance) {
        bestDistance = distance;
        bestCell = cell;
      }

      // 理想的な距離（15マス以上）が見つかったら終了
      if (distance >= 15) {
        break;
      }
    }

    // 適切な位置が見つかったら配置
    if (bestCell) {
      const pos = bestCell.position;
      this.shop = new Shop(pos.x, pos.y);
      this.uiManager.addMessage('この階には商人がいるようだ', MessageType.INFO);
    }
  }

  /**
   * 敵を配置
   */
  private spawnEnemies(count: number): void {
    const currentFloor = this.world.getCurrentFloor();

    for (let i = 0; i < count; i++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const pos = cell.position;

      // プレイヤーとの距離をチェック（近すぎない位置に配置）
      if (this.player.getPosition().distanceTo(pos) < 10) {
        continue;
      }

      // 既存の敵と重ならないようにチェック
      const occupied = this.enemies.some(e => e.getPosition().equals(pos));
      if (occupied) continue;

      // 階層に応じた敵を生成
      const template = getRandomEnemyForFloor(currentFloor);
      const enemy = new Enemy(pos.x, pos.y, template);

      this.enemies.push(enemy);
    }
  }

  /**
   * ダンジョン設定に基づいて敵を配置
   */
  private spawnEnemiesForDungeon(count: number): void {
    const currentFloor = this.world.getCurrentFloor();
    const dungeonConfig = this.world.getDungeonConfig();

    // 現在の階層で出現可能な敵のプールをフィルタリング
    const availableEnemies = dungeonConfig.enemies.pool.filter(enemyKey => {
      const template = EnemyDatabase[enemyKey];
      return !template.minFloor || template.minFloor <= currentFloor;
    });

    // 出現可能な敵がいない場合は終了
    if (availableEnemies.length === 0) return;

    for (let i = 0; i < count; i++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const pos = cell.position;

      // プレイヤーとの距離をチェック（近すぎない位置に配置）
      if (this.player.getPosition().distanceTo(pos) < 10) {
        continue;
      }

      // 既存の敵と重ならないようにチェック
      const occupied = this.enemies.some(e => e.getPosition().equals(pos));
      if (occupied) continue;

      // フィルタリングされた敵プールからランダムに選択
      const enemyKey = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

      const template = EnemyDatabase[enemyKey];
      if (!template) continue;

      // 階層に応じて敵のステータスをスケーリング
      const scaledTemplate = this.scaleEnemyStats(template, currentFloor);

      // エリート判定
      const isElite = Math.random() < dungeonConfig.enemies.eliteChance;

      const enemy = new Enemy(pos.x, pos.y, scaledTemplate, isElite);

      this.enemies.push(enemy);
    }
  }

  /**
   * 階層に応じて敵のステータスをスケーリング
   */
  private scaleEnemyStats(template: EnemyTemplate, floor: number): EnemyTemplate {
    // 基準階層は1階、5階ごとに約30%ステータスが増加
    const scalingFactor = 1 + (floor - 1) * 0.06;

    return {
      ...template,
      maxHp: Math.floor(template.maxHp * scalingFactor),
      attack: Math.floor(template.attack * scalingFactor),
      defense: Math.floor(template.defense * scalingFactor),
      experienceValue: Math.floor(template.experienceValue * scalingFactor),
    };
  }

  /**
   * ダンジョン設定に基づいてボスを配置
   */
  private spawnDungeonBoss(): void {
    const currentFloor = this.world.getCurrentFloor();
    const dungeonConfig = this.world.getDungeonConfig();
    const bossKey = dungeonConfig.bosses[currentFloor];

    if (!bossKey) return;

    const bossTemplate = EnemyDatabase[bossKey];
    if (!bossTemplate) return;

    const playerPos = this.player.getPosition();
    const maxAttempts = 100;
    let bestCell = null;
    let bestDistance = 0;

    // 最大100回試行して、理想的な距離（10-15マス）の位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      // 理想的な距離範囲（10-15マス）
      if (distance >= 10 && distance <= 15) {
        bestCell = cell;
        break;
      }

      // 理想的な距離が見つからない場合、最も離れた位置を記録
      if (distance > bestDistance && distance >= 8) {
        bestDistance = distance;
        bestCell = cell;
      }
    }

    // 適切な位置が見つからなくても配置
    if (!bestCell) {
      bestCell = this.map.getRandomWalkableCell();
    }

    if (!bestCell) return;

    const bossPos = bestCell.position;

    // ボスも階層に応じてスケーリング
    const scaledBossTemplate = this.scaleEnemyStats(bossTemplate, currentFloor);
    const boss = new Enemy(bossPos.x, bossPos.y, scaledBossTemplate);
    this.enemies.push(boss);

    // ボスの周りのセルを探索済みにして見えるようにする
    const revealRadius = 3;
    for (let dx = -revealRadius; dx <= revealRadius; dx++) {
      for (let dy = -revealRadius; dy <= revealRadius; dy++) {
        const checkPos = new Vector2D(bossPos.x + dx, bossPos.y + dy);
        const cell = this.map.getCellAt(checkPos);
        if (cell) {
          cell.explored = true;
          cell.visible = true;
        }
      }
    }

    this.uiManager.addMessage(`${boss.name}が現れた！`, MessageType.WARNING);

    // ボスの周りに少数の雑魚敵も配置（3-5体）
    const minionCount = 3 + Math.floor(Math.random() * 3);
    this.spawnEnemiesForDungeon(minionCount);
  }

  /**
   * ボスを配置
   */
  private spawnBoss(): void {
    const currentFloor = this.world.getCurrentFloor();
    const bossTemplate = getBossForFloor(currentFloor);

    if (!bossTemplate) return;

    const playerPos = this.player.getPosition();
    const maxAttempts = 100;
    let bestCell = null;
    let bestDistance = 0;

    // 最大100回試行して、できるだけプレイヤーから離れた位置を探す
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cell = this.map.getRandomWalkableCell();
      if (!cell) continue;

      const distance = playerPos.distanceTo(cell.position);

      if (distance > bestDistance) {
        bestDistance = distance;
        bestCell = cell;
      }

      // 理想的な距離（15マス以上）が見つかったら終了
      if (distance >= 15) {
        break;
      }
    }

    if (!bestCell) return;

    const bossPos = bestCell.position;

    // ボスも階層に応じてスケーリング
    const scaledBossTemplate = this.scaleEnemyStats(bossTemplate, currentFloor);
    const boss = new Enemy(bossPos.x, bossPos.y, scaledBossTemplate);
    this.enemies.push(boss);

    this.uiManager.addMessage(`${boss.name}が現れた！`, MessageType.WARNING);

    // ボスの周りに少数の雑魚敵も配置（3-5体）
    const minionCount = 3 + Math.floor(Math.random() * 3);
    this.spawnEnemies(minionCount);
  }

  /**
   * 宝箱を配置
   */
  private spawnChests(count: number): void {
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
   * ゲームループ開始
   */
  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  /**
   * ゲームループ
   */
  private gameLoop(currentTime: number): void {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // 更新
    this.update(deltaTime);

    // 描画
    this.render();

    // 次のフレーム
    requestAnimationFrame(time => this.gameLoop(time));
  }

  /**
   * 更新処理
   */
  private update(deltaTime: number): void {
    // ダメージ数字の更新
    this.renderer.updateDamageNumbers(deltaTime);

    // ゲームオーバーなら何もしない
    if (this.gameState.isGameOver()) {
      return;
    }

    // プレイヤーターン
    if (this.gameState.isPlayerTurn()) {
      this.handlePlayerTurn();
    }

    // 敵ターン
    if (this.gameState.isEnemyTurn()) {
      this.handleEnemyTurn();
    }
  }

  /**
   * プレイヤーターン処理
   */
  private handlePlayerTurn(): void {
    const action = this.input.getNextAction();
    if (!action) return;

    // MP自然回復（ターン開始時に2回復）
    this.player.stats.restoreMp(2);

    let turnEnded = false;

    // インベントリアクション
    if (action === Action.INVENTORY) {
      this.inventoryUI.toggle();
      return;
    }

    // メタプログレッション
    if (action === Action.META_PROGRESSION) {
      this.metaProgressionUI.setMetaProgression(this.metaProgression, upgrade =>
        this.handleUpgradePurchase(upgrade)
      );
      this.metaProgressionUI.toggle();
      return;
    }

    // スキル選択
    if (action === Action.SKILL_SELECTION) {
      this.skillSelectionUI.open();
      return;
    }

    // メニューに戻る
    if (action === Action.RETURN_TO_MENU) {
      this.showReturnToMenuConfirmation();
      return;
    }

    // アイテム拾う / 宝箱を開く
    if (action === Action.PICKUP) {
      turnEnded = this.pickupOrOpenChest();
    }

    // 階段を使う
    if (action === Action.STAIRS) {
      this.useStairs(); // 階層移動はターンを消費しない
      return;
    }

    // 店で取引
    if (action === Action.SHOP) {
      turnEnded = this.interactWithShop();
    }

    // スキル使用
    if (action === Action.SKILL_1) {
      turnEnded = this.useSkill(0);
    }
    if (action === Action.SKILL_2) {
      turnEnded = this.useSkill(1);
    }
    if (action === Action.SKILL_3) {
      turnEnded = this.useSkill(2);
    }
    if (action === Action.SKILL_4) {
      turnEnded = this.useSkill(3);
    }
    if (action === Action.SKILL_5) {
      turnEnded = this.useSkill(4);
    }
    if (action === Action.SKILL_6) {
      turnEnded = this.useSkill(5);
    }
    if (action === Action.SKILL_7) {
      turnEnded = this.useSkill(6);
    }
    if (action === Action.SKILL_8) {
      turnEnded = this.useSkill(7);
    }

    // 移動アクション
    const direction = Input.actionToDirection(action);
    if (direction) {
      // Shiftキーが押されている場合はダッシュ移動
      if (this.input.isShiftPressed()) {
        turnEnded = this.dashMove(direction);
      } else {
        turnEnded = this.movePlayer(direction);
      }
    }

    // ターン終了
    if (turnEnded) {
      // 統計を更新
      this.statistics.turnsPlayed++;

      // デイリーチャレンジ進捗を更新
      this.dailyChallenge.updateProgress(ChallengeType.SURVIVE_TURNS, 1);

      // 環境効果を処理
      this.processEnvironmentalEffects();

      // プレイヤーのステータス効果を処理
      this.player.processStatusEffects();
      // スキルクールダウンを更新
      this.player.updateSkillCooldowns();
      this.gameState.advanceTurn();
    }
  }

  /**
   * 環境効果を処理
   */
  private processEnvironmentalEffects(): void {
    const effect = this.map.environmentalEffect;
    if (!effect) return;

    // プレイヤーへの効果
    if (effect.playerEffect) {
      if (effect.playerEffect.hpPerTurn) {
        const hpChange = effect.playerEffect.hpPerTurn;
        if (hpChange < 0) {
          this.player.takeDamage(Math.abs(hpChange));
          this.uiManager.addMessage(
            `${effect.name}により${Math.abs(hpChange)}ダメージを受けた`,
            MessageType.COMBAT
          );
        } else {
          this.player.stats.heal(hpChange);
          this.uiManager.addMessage(`${effect.name}により${hpChange}回復した`, MessageType.SUCCESS);
        }
      }

      if (effect.playerEffect.mpPerTurn) {
        const mpChange = effect.playerEffect.mpPerTurn;
        if (mpChange > 0) {
          this.player.stats.restoreMp(mpChange);
        }
      }
    }
  }

  /**
   * 階段を使う
   */
  private useStairs(): void {
    const playerPos = this.player.getPosition();

    // プレイヤーの位置に階段があるかチェック
    if (!this.stairs.getPosition().equals(playerPos)) {
      this.uiManager.addMessage('ここには階段がない', MessageType.INFO);
      return;
    }

    // 次の階層へ
    this.soundManager.play(SoundType.STAIRS);
    this.descendToNextFloor();
  }

  /**
   * 店で取引
   */
  private interactWithShop(): boolean {
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
    this.shopUI.setCallback(item => this.buyItemFromShop(item));
    this.shopUI.open();

    return false; // UIを開くだけなのでターン消費しない
  }

  /**
   * 店からアイテムを購入
   */
  private buyItemFromShop(item: Item): void {
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
        this.updateUI();
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
   * スキルを使用
   */
  private useSkill(skillIndex: number): boolean {
    const skill = this.player.getSkill(skillIndex);
    if (!skill) {
      return false;
    }

    if (!skill.canUse(this.player)) {
      if (skill.currentCooldown > 0) {
        this.uiManager.addMessage(
          `${skill.data.name}はクールダウン中です (残り${skill.currentCooldown}ターン)`,
          MessageType.WARNING
        );
      } else {
        this.uiManager.addMessage(
          `MPが足りません (必要: ${skill.data.mpCost}, 現在: ${this.player.stats.mp})`,
          MessageType.WARNING
        );
      }
      this.soundManager.play(SoundType.ERROR);
      return false;
    }

    const success = skill.use(this.player, this.enemies);
    if (success) {
      // メタプログレッションに記録
      this.metaProgression.recordSkillUsed();

      this.soundManager.play(SoundType.SKILL);
      this.updateUI();
      return true; // ターン消費
    }

    return false;
  }

  /**
   * ボス階警告を表示
   */
  private showBossWarning(bossKey: string): void {
    const overlay = document.getElementById('boss-warning-overlay');
    const messageElement = document.getElementById('boss-warning-message');

    if (!overlay) return;

    // ボス名を取得
    const bossTemplate = EnemyDatabase[bossKey];
    const bossName = bossTemplate ? bossTemplate.name : '強力なボス';

    if (messageElement) {
      messageElement.textContent = `${bossName}が待ち構えている...`;
    }

    // オーバーレイを表示
    overlay.style.display = 'flex';

    // 2秒後に自動的に非表示
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 2000);
  }

  /**
   * 次の階層へ降りる
   */
  private descendToNextFloor(): void {
    const currentFloor = this.world.getCurrentFloor();
    const dungeonConfig = this.world.getDungeonConfig();
    const MAX_FLOOR = dungeonConfig.maxFloors;

    // 最大階層チェック
    if (currentFloor >= MAX_FLOOR) {
      this.gameVictory();
      return;
    }

    const nextFloor = currentFloor + 1;

    // メタプログレッションに記録
    this.metaProgression.recordFloor(nextFloor);

    // デイリーチャレンジ進捗を更新
    this.dailyChallenge.updateProgress(ChallengeType.REACH_FLOOR, nextFloor);

    this.uiManager.addMessage(`階段を降りて${nextFloor}階へ進んだ`, MessageType.INFO);

    // 新しい階層を生成
    this.map = this.world.descendFloor();

    // プレイヤーを新しい開始位置に配置
    const startPos = this.world.getRandomStartPosition();
    this.player.setPosition(startPos);

    // 階層をセットアップ
    this.setupFloor();

    // オートセーブ（階層移動時）
    this.autoSave();
  }

  /**
   * オートセーブを実行
   */
  private autoSave(): void {
    const gameData = this.serializeGameState();
    const success = EnhancedSaveManager.save(gameData, 0);

    if (success) {
      console.log('💾 オートセーブ完了');
      // オートセーブインジケーターを表示（オプション）
      this.showAutoSaveIndicator();
    }
  }

  /**
   * オートセーブインジケーターを表示
   */
  private showAutoSaveIndicator(): void {
    const indicator = document.createElement('div');
    indicator.className = 'autosave-indicator';
    indicator.textContent = '💾 保存しました';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #4ade80;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 14px;
      z-index: 9999;
      animation: fadeInOut 2s ease-in-out;
    `;

    document.body.appendChild(indicator);

    // 2秒後に削除
    setTimeout(() => {
      indicator.remove();
    }, 2000);
  }

  /**
   * ゲームクリア処理
   */
  private gameVictory(): void {
    this.running = false;
    this.gameState.setPhase(GamePhase.GAME_OVER);

    // ダンジョンタイプに応じた報酬処理
    const dungeonConfig = this.world.getDungeonConfig();
    const dungeonType = dungeonConfig.metadata.type;
    const difficulty = dungeonConfig.metadata.difficulty;
    const maxFloors = dungeonConfig.maxFloors;

    // ダンジョンクリア報酬のSPを記録
    const spReward = this.metaProgression.recordDungeonClear(dungeonType, difficulty, maxFloors);

    let unlockedUpgrade: string | null = null;

    if (dungeonType === 'TUTORIAL') {
      // チュートリアルクリア報酬
      unlockedUpgrade = this.metaProgression.recordTutorialClear();
    } else {
      // 最終ボス撃破を記録し、特別な永続強化を解放
      unlockedUpgrade = this.metaProgression.recordFinalBossDefeat(dungeonType);
    }

    // ゲームオーバー画面にクリアメッセージを表示
    const gameOverScreen = document.getElementById('game-over');
    const deathMessage = document.getElementById('death-message');

    if (gameOverScreen && deathMessage) {
      // タイトルを変更
      const title = gameOverScreen.querySelector('h1');
      if (title) {
        title.textContent = 'VICTORY!';
        title.style.color = '#ffaa00';
      }

      // クリアメッセージ
      let message = 'おめでとうございます！ダンジョンを制覇しました！';
      message += `\n\n【クリア報酬】\n${spReward} ソウルポイントを獲得しました！`;
      if (unlockedUpgrade) {
        message += `\n\n【永続強化解放】\n${unlockedUpgrade}`;
      }
      deathMessage.textContent = message;
      deathMessage.style.color = '#ffdd57';
      deathMessage.style.whiteSpace = 'pre-line'; // 改行を有効化

      // 統計を更新
      const stats = {
        floor: this.world.getCurrentFloor(),
        enemiesKilled: this.statistics.enemiesKilled,
        bossesDefeated: this.statistics.bossesDefeated,
        itemsCollected: this.statistics.itemsCollected,
        chestsOpened: this.statistics.chestsOpened,
        goldEarned: this.statistics.goldEarned,
        turnsPlayed: this.statistics.turnsPlayed,
      };

      // 統計を表示
      this.uiManager.showGameOver(stats);

      // 表示
      gameOverScreen.style.display = 'block';
    }

    // メッセージログに記録
    this.uiManager.addMessage('ダンジョンを制覇した！あなたは真の英雄だ！', MessageType.INFO);
    this.uiManager.addMessage(
      `【クリア報酬】${spReward} ソウルポイント獲得！`,
      MessageType.SUCCESS
    );

    if (unlockedUpgrade) {
      this.uiManager.addMessage(`【永続強化解放】${unlockedUpgrade}`, MessageType.INFO);
    }
  }

  /**
   * プレイヤー移動
   */
  private movePlayer(direction: Vector2D): boolean {
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

    // UI更新
    this.updateUI();

    return true;
  }

  /**
   * ダッシュ移動（Shift + 移動キー）
   * 壁、敵、アイテム、階段、宝箱、分かれ道、部屋に遭遇するまで移動し続ける
   */
  private dashMove(direction: Vector2D): boolean {
    let moved = false;
    let stepsCount = 0;
    const maxSteps = 100; // 無限ループ防止

    // 開始時の周囲の歩行可能セル数を記録
    const startPos = this.player.getPosition();
    const startWalkableCount = this.countWalkableCells(startPos);

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

        // 部屋チェック（周囲の歩行可能セルが増えた場合）
        const currentWalkableCount = this.countWalkableCells(nextPos);
        if (currentWalkableCount > startWalkableCount && currentWalkableCount >= 5) {
          break;
        }
      }
    }

    if (moved) {
      this.updateUI();
    }

    return moved;
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

  /**
   * 敵ターン処理
   */
  private handleEnemyTurn(): void {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      // ステータス効果を処理
      enemy.processStatusEffects();

      // 死亡チェック（ステータス効果で死亡した場合）
      if (!enemy.isAlive()) {
        this.handleEnemyDeath(enemy);
        continue;
      }

      // シンプルなAI: プレイヤーに近づく
      this.moveEnemyTowardsPlayer(enemy);
    }

    // プレイヤーターンに戻す
    this.gameState.advanceTurn();
  }

  /**
   * アイテムを配置
   */
  private spawnItems(count: number): void {
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
   * アイテムを拾う または 宝箱を開く
   */
  private pickupOrOpenChest(): boolean {
    const playerPos = this.player.getPosition();

    // まず宝箱をチェック
    const chestAtPosition = this.chests.find(
      chest => !chest.isOpened && chest.getPosition().equals(playerPos)
    );

    if (chestAtPosition) {
      return this.openChest(chestAtPosition);
    }

    // 宝箱がなければアイテムをチェック
    const itemAtPosition = this.items.find(item => item.getPosition().equals(playerPos));

    if (!itemAtPosition) {
      this.uiManager.addMessage('ここにはアイテムも宝箱もない', MessageType.INFO);
      return false;
    }

    // インベントリに追加
    const success = this.player.inventory.addItem(itemAtPosition);

    if (success) {
      // 統計を更新
      this.statistics.itemsCollected++;

      // デイリーチャレンジ進捗を更新
      this.dailyChallenge.updateProgress(ChallengeType.COLLECT_ITEMS, 1);

      // メタプログレッションに記録
      this.metaProgression.recordItemCollected();

      // マップからアイテムを削除
      this.items = this.items.filter(item => item !== itemAtPosition);
      this.soundManager.play(SoundType.PICKUP);
      return true;
    }

    return false;
  }

  /**
   * 宝箱を開く
   */
  private openChest(chest: Chest): boolean {
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

    // 統計を更新
    this.statistics.chestsOpened++;

    // デイリーチャレンジ進捗を更新
    this.dailyChallenge.updateProgress(ChallengeType.OPEN_CHESTS, 1);

    // メタプログレッションに記録
    this.metaProgression.recordChestOpened();

    // アイテムを生成
    const playerPos = this.player.getPosition();
    for (let i = 0; i < template.itemCount; i++) {
      const itemData = this.generateItemForChest(template.minRarity, template.maxRarity);
      const item = new Item(playerPos.x, playerPos.y, itemData);

      // レア度を設定
      const rarityRoll = Math.random();
      if (rarityRoll < 0.4) {
        item.rarity = template.minRarity;
      } else if (rarityRoll < 0.8) {
        // 中間のレア度
        const midRarity = this.getMidRarity(template.minRarity, template.maxRarity);
        item.rarity = midRarity;
      } else {
        item.rarity = template.maxRarity;
      }

      this.items.push(item);
    }

    this.uiManager.addMessage(
      `${chest.name}を開けた！${template.itemCount}個のアイテムを発見！`,
      MessageType.SUCCESS
    );

    this.updateUI();
    return true;
  }

  /**
   * 宝箱用のアイテムを生成
   */
  private generateItemForChest(minRarity: ItemRarity, maxRarity: ItemRarity): any {
    return rollRandomItem();
  }

  /**
   * レア度の中間を取得
   */
  private getMidRarity(minRarity: ItemRarity, maxRarity: ItemRarity): ItemRarity {
    const rarities = [
      ItemRarity.COMMON,
      ItemRarity.UNCOMMON,
      ItemRarity.RARE,
      ItemRarity.EPIC,
      ItemRarity.LEGENDARY,
    ];

    const minIndex = rarities.indexOf(minRarity);
    const maxIndex = rarities.indexOf(maxRarity);
    const midIndex = Math.floor((minIndex + maxIndex) / 2);

    return rarities[midIndex];
  }

  /**
   * アイテムを使う
   */
  private useItem(item: Item): void {
    if (item.itemType === ItemType.CONSUMABLE) {
      // 消費アイテムの処理
      if (item.name.includes('回復ポーション')) {
        const healAmount = this.getHealAmount(item.name);
        const actualHeal = this.player.stats.heal(healAmount);

        this.uiManager.addMessage(
          `${item.name}を使った！HPが${actualHeal}回復した`,
          MessageType.INFO
        );

        // スタックから削除
        item.removeFromStack(1);
        if (item.stackCount === 0) {
          this.player.inventory.removeItem(item);
        }

        this.updateUI();
      } else if (item.name.includes('テレポート')) {
        // テレポートの巻物
        this.useTeleportScroll(item);
      } else if (item.name.includes('火球')) {
        // 火球の巻物
        this.useFireballScroll(item);
      }
    } else if (item.itemType === ItemType.EQUIPMENT) {
      // 装備アイテムの処理
      this.equipItem(item);
    }
  }

  /**
   * アイテムを装備
   */
  private equipItem(item: Item): void {
    const slot = EquipmentComponent.getSlotForItem(item);

    if (!slot) {
      this.uiManager.addMessage(`${item.name}は装備できません`, MessageType.INFO);
      return;
    }

    // 既存の装備を外す
    const previousItem = this.player.equipment.equip(slot, item);

    // インベントリから削除
    this.player.inventory.removeItem(item);

    // 外した装備をインベントリに戻す
    if (previousItem) {
      this.player.inventory.addItem(previousItem);
      this.uiManager.addMessage(
        `${previousItem.name}を外して${item.name}を装備した`,
        MessageType.INFO
      );
    } else {
      this.uiManager.addMessage(`${item.name}を装備した`, MessageType.INFO);
    }

    // ステータスを更新
    this.player.updateEquipmentStats();
    this.updateUI();
  }

  /**
   * 回復量を取得
   */
  private getHealAmount(itemName: string): number {
    if (itemName.includes('小さな')) return 30;
    if (itemName.includes('大きな')) return 100;
    return 60;
  }

  /**
   * テレポートの巻物を使用
   */
  private useTeleportScroll(item: Item): void {
    const randomCell = this.map.getRandomWalkableCell();

    if (!randomCell) {
      this.uiManager.addMessage('テレポートに失敗した！', MessageType.WARNING);
      return;
    }

    // プレイヤーを移動
    const oldPos = this.player.getPosition();
    this.player.setPosition(randomCell.position);

    // カメラ追従
    this.renderer.setCameraPosition(randomCell.position);

    // FOV更新（視界範囲ボーナス適用）
    const baseVisionRange = 8;
    const visionRange = baseVisionRange + this.metaProgression.getVisionRangeBonus();
    this.map.updateFOV(randomCell.position, visionRange);

    this.soundManager.play(SoundType.STAIRS);
    this.uiManager.addMessage('テレポートの巻物を使った！別の場所に移動した', MessageType.INFO);

    // スタックから削除
    item.removeFromStack(1);
    if (item.stackCount === 0) {
      this.player.inventory.removeItem(item);
    }

    this.updateUI();
  }

  /**
   * 火球の巻物を使用
   */
  private useFireballScroll(item: Item): void {
    const playerPos = this.player.getPosition();
    const radius = 3;
    const damage = 50;
    let hitCount = 0;

    // プレイヤーの周囲3x3範囲の敵にダメージ
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      const enemyPos = enemy.getPosition();
      const distance = Math.max(
        Math.abs(enemyPos.x - playerPos.x),
        Math.abs(enemyPos.y - playerPos.y)
      );

      if (distance <= radius) {
        enemy.stats.takeDamage(damage);
        hitCount++;

        if (!enemy.isAlive()) {
          this.handleEnemyDeath(enemy);
        }
      }
    }

    this.soundManager.play(SoundType.ATTACK);

    if (hitCount > 0) {
      this.uiManager.addMessage(
        `火球の巻物を使った！${hitCount}体の敵に${damage}ダメージ！`,
        MessageType.SUCCESS
      );
    } else {
      this.uiManager.addMessage('火球の巻物を使ったが、範囲内に敵がいなかった', MessageType.INFO);
    }

    // スタックから削除
    item.removeFromStack(1);
    if (item.stackCount === 0) {
      this.player.inventory.removeItem(item);
    }

    // 敵配列を更新
    this.enemies = this.enemies.filter(e => e.isAlive());

    this.updateUI();
  }

  /**
   * アイテムを捨てる
   */
  private dropItem(item: Item): void {
    const success = this.player.inventory.removeItem(item);

    if (success) {
      // プレイヤーの位置に配置
      const playerPos = this.player.getPosition();
      item.setPosition(playerPos);
      this.items.push(item);

      this.uiManager.addMessage(`${item.name}を捨てた`, MessageType.INFO);
    }
  }

  /**
   * 敵の死亡処理
   */
  private handleEnemyDeath(enemy: Enemy): void {
    // 統計を更新
    this.statistics.enemiesKilled++;

    // デイリーチャレンジ進捗を更新
    this.dailyChallenge.updateProgress(ChallengeType.KILL_ENEMIES, 1);

    // メタプログレッションに記録
    this.metaProgression.recordKill(enemy.isBoss);

    if (enemy.isBoss) {
      // ボス撃破時の特別報酬
      this.handleBossDefeat(enemy);
    } else {
      // 通常の敵（ゴールドドロップを減少）
      const goldDrop = 3 + Math.floor(Math.random() * 7) + this.world.getCurrentFloor();
      this.player.addGold(goldDrop);
      this.metaProgression.recordGoldEarned(goldDrop);
      this.statistics.goldEarned += goldDrop;

      // デイリーチャレンジ進捗を更新
      this.dailyChallenge.updateProgress(ChallengeType.EARN_GOLD, goldDrop);

      this.uiManager.addMessage(
        `${enemy.name}を倒した！${goldDrop}ゴールドを手に入れた`,
        MessageType.SUCCESS
      );
    }

    // 最終階で敵が全滅したかチェック
    const currentFloor = this.world.getCurrentFloor();
    const dungeonConfig = this.world.getDungeonConfig();
    const MAX_FLOOR = dungeonConfig.maxFloors;

    if (currentFloor >= MAX_FLOOR) {
      // 次のフレームで敵配列が更新された後にチェック
      setTimeout(() => {
        const aliveEnemies = this.enemies.filter(e => e.isAlive());
        if (aliveEnemies.length === 0) {
          this.gameVictory();
        }
      }, 100);
    }
  }

  /**
   * ボス撃破時の処理
   */
  private handleBossDefeat(boss: Enemy): void {
    // 統計を更新
    this.statistics.bossesDefeated++;

    // デイリーチャレンジ進捗を更新
    this.dailyChallenge.updateProgress(ChallengeType.KILL_BOSSES, 1);

    // ボスからのゴールド（調整後）
    const goldDrop = (30 + Math.floor(Math.random() * 40)) * 8;
    this.player.addGold(goldDrop);
    this.metaProgression.recordGoldEarned(goldDrop);
    this.statistics.goldEarned += goldDrop;

    // デイリーチャレンジ進捗を更新
    this.dailyChallenge.updateProgress(ChallengeType.EARN_GOLD, goldDrop);

    // 全回復（HP + MP）
    this.player.stats.heal(this.player.stats.maxHp);
    this.player.stats.restoreMp(this.player.stats.maxMp);

    // 全スキルのクールダウンをリセット
    for (const skill of this.player.skills) {
      skill.resetCooldown();
    }

    this.soundManager.play(SoundType.LEVEL_UP);

    this.uiManager.addMessage(`【勝利】${boss.name}を撃破した！`, MessageType.SUCCESS);
    this.uiManager.addMessage(`${goldDrop}ゴールドを手に入れた！`, MessageType.SUCCESS);
    this.uiManager.addMessage(`HP・MPが全回復した！`, MessageType.SUCCESS);
    this.uiManager.addMessage(`全スキルのクールダウンがリセットされた！`, MessageType.SUCCESS);

    // レジェンダリー装備をドロップ
    this.dropLegendaryItem(boss.getPosition());
  }

  /**
   * レジェンダリー装備をドロップ
   */
  private dropLegendaryItem(position: Vector2D): void {
    // ランダムなレジェンダリー装備を生成
    const itemData = rollRandomItem();
    const item = new Item(position.x, position.y, itemData);

    // 強制的にレジェンダリーにする
    item.rarity = ItemRarity.LEGENDARY;

    // 接頭辞と接尾辞を両方付与
    const prefix = ItemAffixManager.getRandomPrefix();
    const suffix = ItemAffixManager.getRandomSuffix();

    if (prefix && suffix) {
      const newName = ItemAffixManager.generateName(item.name, prefix, suffix);
      item.name = newName;

      const newDesc = ItemAffixManager.generateDescription(item.description, prefix, suffix);
      item.description = newDesc;
    }

    this.items.push(item);

    this.uiManager.addMessage(`【レジェンダリー】${item.name}を発見した！`, MessageType.SUCCESS);
  }

  /**
   * 敵をプレイヤーに近づける（A*パスファインディング使用）
   */
  private moveEnemyTowardsPlayer(enemy: Enemy): void {
    const enemyPos = enemy.getPosition();
    const playerPos = this.player.getPosition();

    // プレイヤーが視界内かチェック
    const distance = enemyPos.distanceTo(playerPos);
    if (distance > 10) return; // 視界外

    // 隣接していれば攻撃
    if (CombatSystem.isAdjacent(enemy, this.player)) {
      CombatSystem.attack(enemy, this.player);
      this.updateUI();
      return;
    }

    // A*でパスを計算
    const nextPos = AStar.getNextMove(enemyPos, playerPos, (x, y) => {
      // マップ境界チェック
      if (!this.map.isInBounds(x, y)) return false;

      // 壁チェック
      if (!this.map.isWalkableAt(new Vector2D(x, y))) return false;

      // 他の敵と重ならないかチェック（ただし目的地は除く）
      if (x === playerPos.x && y === playerPos.y) return true;

      const occupied = this.enemies.some(
        e => e !== enemy && e.isAlive() && e.getPosition().equals(new Vector2D(x, y))
      );

      return !occupied;
    });

    // パスが見つからない、または移動先がない場合
    if (!nextPos) {
      // フォールバック: シンプルな追跡
      this.simpleEnemyMove(enemy);
      return;
    }

    // 移動
    enemy.setPosition(nextPos);
  }

  /**
   * シンプルな敵の移動（A*のフォールバック）
   */
  private simpleEnemyMove(enemy: Enemy): void {
    const enemyPos = enemy.getPosition();
    const playerPos = this.player.getPosition();

    const dx = playerPos.x - enemyPos.x;
    const dy = playerPos.y - enemyPos.y;

    let moveX = 0;
    let moveY = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveX = dx > 0 ? 1 : -1;
    } else {
      moveY = dy > 0 ? 1 : -1;
    }

    const newPos = enemyPos.add(new Vector2D(moveX, moveY));

    if (this.map.isWalkableAt(newPos)) {
      const occupied = this.enemies.some(
        e => e !== enemy && e.isAlive() && e.getPosition().equals(newPos)
      );

      if (!occupied && !this.player.getPosition().equals(newPos)) {
        enemy.setPosition(newPos);
      }
    }
  }

  /**
   * 描画処理
   */
  private render(): void {
    // 画面クリア
    this.renderer.clear('#1a1a1a');

    // マップ描画
    this.renderMap();

    // エンティティ描画
    this.renderEntities();

    // ダメージ数字描画
    this.renderer.renderDamageNumbers();

    // ミニマップ描画
    this.minimap.render(this.map, this.player.getPosition());

    // デバッグ情報（オプション）
    // this.renderDebugInfo();
  }

  /**
   * マップ描画
   */
  private renderMap(): void {
    const allCells = this.map.getAllCells();

    for (const cell of allCells) {
      if (!cell.explored && !cell.visible) continue;

      const pos = cell.position;
      const alpha = cell.visible ? 1.0 : 0.3;

      this.renderer.drawTile(pos.x, pos.y, {
        fillColor: cell.tile.getColor(),
        alpha: alpha,
      });

      // タイル文字を描画（オプション）
      if (cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        this.renderer.drawText(
          cell.tile.getChar(),
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: '#666',
            font: '20px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }
  }

  /**
   * エンティティ描画
   */
  private renderEntities(): void {
    // 階段を描画
    if (this.stairs) {
      const pos = this.stairs.getPosition();
      const cell = this.map.getCellAt(pos);

      if (cell && cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        const renderInfo = this.stairs.getRenderInfo();

        // 背景
        this.renderer.drawRect(screenPos.x, screenPos.y, tileSize, tileSize, {
          fillColor: '#3a3a1a',
        });

        // 階段
        this.renderer.drawText(
          renderInfo.char,
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: renderInfo.color,
            font: 'bold 28px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }

    // 店を描画
    if (this.shop) {
      const pos = this.shop.getPosition();
      const cell = this.map.getCellAt(pos);

      if (cell && cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        const renderInfo = this.shop.getRenderInfo();

        // 背景
        this.renderer.drawRect(screenPos.x, screenPos.y, tileSize, tileSize, {
          fillColor: '#4a3a1a',
        });

        // 商人
        this.renderer.drawText(
          renderInfo.char,
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: renderInfo.color,
            font: 'bold 28px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }

    // 宝箱を描画
    for (const chest of this.chests) {
      if (chest.isOpened) continue; // 開けた宝箱はスキップ

      const pos = chest.getPosition();
      const cell = this.map.getCellAt(pos);

      // 可視範囲内のみ描画
      if (cell && cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        const renderInfo = chest.getRenderInfo();

        // 背景
        this.renderer.drawRect(screenPos.x, screenPos.y, tileSize, tileSize, {
          fillColor: '#3a2a1a',
        });

        // 宝箱
        this.renderer.drawText(
          renderInfo.char,
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: renderInfo.color,
            font: 'bold 24px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }

    // アイテムを描画
    for (const item of this.items) {
      const pos = item.getPosition();
      const cell = this.map.getCellAt(pos);

      // 可視範囲内のみ描画
      if (cell && cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        const renderInfo = item.getRenderInfo();

        // 背景
        this.renderer.drawRect(screenPos.x, screenPos.y, tileSize, tileSize, {
          fillColor: '#1a3a1a',
        });

        // アイテム
        this.renderer.drawText(
          renderInfo.char,
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: renderInfo.color,
            font: 'bold 22px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }

    // 敵を描画
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;

      const pos = enemy.getPosition();
      const cell = this.map.getCellAt(pos);

      // 可視範囲内のみ描画
      if (cell && cell.visible) {
        const screenPos = this.renderer.gridToScreen(pos.x, pos.y);
        const tileSize = this.renderer.getTileSize();
        const renderInfo = enemy.getRenderInfo();

        // 背景
        this.renderer.drawRect(screenPos.x, screenPos.y, tileSize, tileSize, {
          fillColor: '#2a2a2a',
        });

        // キャラクター
        this.renderer.drawText(
          renderInfo.char,
          screenPos.x + tileSize / 2,
          screenPos.y + tileSize / 2,
          {
            color: renderInfo.color,
            font: 'bold 24px monospace',
            align: 'center',
            baseline: 'middle',
          }
        );
      }
    }

    // プレイヤーを描画
    const playerPos = this.player.getPosition();
    const screenPos = this.renderer.gridToScreen(playerPos.x, playerPos.y);
    const tileSize = this.renderer.getTileSize();
    const renderInfo = this.player.getRenderInfo();

    // 背景
    this.renderer.drawRect(screenPos.x, screenPos.y, tileSize, tileSize, { fillColor: '#4a4a4a' });

    // プレイヤー
    this.renderer.drawText(
      renderInfo.char,
      screenPos.x + tileSize / 2,
      screenPos.y + tileSize / 2,
      {
        color: renderInfo.color,
        font: 'bold 26px monospace',
        align: 'center',
        baseline: 'middle',
      }
    );
  }

  /**
   * UI更新
   */
  private updateUI(): void {
    const stats = this.player.stats.getInfo();
    this.uiManager.updatePlayerStats({
      ...stats,
      gold: this.player.gold,
    });
    this.uiManager.updateFloor(this.world.getCurrentFloor());

    // ステータス効果を更新
    const effects = this.player.statusEffects.getEffects().map(effect => ({
      type: effect.type,
      duration: effect.turnsRemaining,
    }));
    this.uiManager.updateStatusEffects(effects);

    // スキルを更新
    const skillKeys = ['1', '3', '5', '7', '9', 'Q', 'E', 'R'];
    const skills = this.player.skills.map((skill, index) => ({
      name: skill.data.name,
      icon: skill.data.icon,
      mpCost: skill.data.mpCost,
      cooldown: skill.currentCooldown,
      canUse: skill.canUse(this.player),
      hasEnoughMp: this.player.stats.mp >= skill.data.mpCost,
      key: skillKeys[index],
    }));
    this.uiManager.updateSkills(skills);

    // 装備を更新
    const weaponItem = this.player.equipment.getEquipped(EquipmentSlot.WEAPON);
    const armorItem = this.player.equipment.getEquipped(EquipmentSlot.ARMOR);
    const accessoryItem = this.player.equipment.getEquipped(EquipmentSlot.ACCESSORY);

    const equipment = {
      weapon: weaponItem
        ? {
            name: weaponItem.name,
            rarity: weaponItem.rarity,
          }
        : null,
      armor: armorItem
        ? {
            name: armorItem.name,
            rarity: armorItem.rarity,
          }
        : null,
      accessory: accessoryItem
        ? {
            name: accessoryItem.name,
            rarity: accessoryItem.rarity,
          }
        : null,
    };
    this.uiManager.updateEquipment(equipment);

    // デイリーチャレンジを更新
    const challenges = this.dailyChallenge.getChallenges();
    this.uiManager.updateDailyChallenges(challenges);
  }

  /**
   * ゲーム再起動
   */
  private restart(): void {
    // 状態リセット
    this.gameState.reset();
    this.enemies = [];
    this.items = [];
    this.input.clearActionQueue();

    // UI非表示
    this.uiManager.hideGameOver();
    this.uiManager.getMessageLog().clear();
    this.inventoryUI.close();

    // 再初期化
    this.initialize();
  }

  /**
   * ゲーム停止
   */
  stop(): void {
    this.running = false;
  }

  /**
   * メニューに戻る確認ダイアログ
   */
  private showReturnToMenuConfirmation(): void {
    const confirmed = window.confirm('ダンジョン選択に戻りますか？\n現在の進行状況は失われます。');

    if (confirmed) {
      this.returnToDungeonSelection();
    }
  }

  /**
   * ダンジョン選択画面に戻る
   */
  private returnToDungeonSelection(): void {
    // ゲームを停止
    this.stop();

    // ゲームコンテナを非表示
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.classList.remove('active');
    }

    // ダンジョン選択UIを表示
    if (this.dungeonSelectionUI) {
      this.dungeonSelectionUI.show();
    }

    // UIをクリーンアップ
    this.inventoryUI.close();
    this.shopUI.close();
    this.metaProgressionUI.close();
    this.skillSelectionUI.close();
    this.uiManager.hideGameOver();
  }

  /**
   * ゲームを保存（拡張版）
   */
  private saveGame(): void {
    // ゲーム状態をシリアライズ
    const gameData = this.serializeGameState();

    // 保存実行
    const success = EnhancedSaveManager.save(gameData, 0);

    if (success) {
      this.uiManager.addMessage('ゲームを保存しました', MessageType.SUCCESS);
      this.updateSaveInfo();
    } else {
      this.uiManager.addMessage('保存に失敗しました', MessageType.WARNING);
    }
  }

  /**
   * ゲーム状態をシリアライズ
   */
  private serializeGameState(): any {
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
   * セーブデータから続きを開始（公開メソッド）
   */
  continueFromSave(): void {
    const saveData = EnhancedSaveManager.load(0);
    if (!saveData) {
      console.error('セーブデータがありません');
      return;
    }

    // ダンジョンタイプを取得
    const dungeonType = saveData.world.dungeonType as DungeonType;

    // ゲームを初期化（セーブデータは使わず、基本初期化のみ）
    this.initialize(dungeonType);

    // セーブデータを復元
    this.deserializeGameState(saveData);

    // ゲームを開始
    this.start();

    this.uiManager.addMessage('セーブデータから再開しました', MessageType.SUCCESS);
    this.updateSaveInfo();
  }

  /**
   * ゲームを読み込み（内部用）
   */
  private loadGame(): void {
    const saveData = EnhancedSaveManager.load(0);
    if (!saveData) {
      this.uiManager.addMessage('セーブデータがありません', MessageType.WARNING);
      return;
    }

    // ゲーム状態を復元
    this.deserializeGameState(saveData);

    this.uiManager.addMessage('ゲームを読み込みました', MessageType.SUCCESS);
    this.updateSaveInfo();
  }

  /**
   * ゲーム状態をデシリアライズ
   */
  private deserializeGameState(saveData: any): void {
    // プレイヤー状態を復元
    this.player.setPosition(new Vector2D(saveData.player.position.x, saveData.player.position.y));
    this.player.level = saveData.player.level;
    this.player.experience = saveData.player.experience;
    this.player.experienceToNextLevel = saveData.player.experienceToNextLevel;
    this.player.gold = saveData.player.gold;
    this.player.stats.hp = saveData.player.hp;
    this.player.stats.maxHp = saveData.player.maxHp;
    this.player.stats.mp = saveData.player.mp;
    this.player.stats.maxMp = saveData.player.maxMp;
    this.player.stats.attack = saveData.player.attack;
    this.player.stats.defense = saveData.player.defense;
    this.player.stats.speed = saveData.player.speed;
    this.player.skillPoints = saveData.player.skillPoints;

    // ステータス効果を復元（簡易版）
    // 注: 完全な復元には StatusEffectManager の再構築が必要

    // スキルのクールダウンを復元（簡易版）
    // 注: 完全な復元にはスキルデータベースとのマッピングが必要

    // インベントリを復元（簡易版）
    this.player.inventory.clear();
    // 注: アイテムの完全な復元には ItemFactory が必要

    // 装備を復元（簡易版）
    // 注: 装備の完全な復元には Equipment の再構築が必要

    // マップを復元
    this.restoreMap(saveData.map, saveData.world);

    // エンティティを復元
    this.restoreEntities(saveData.entities);

    // 統計を復元
    this.statistics = { ...saveData.statistics };

    // UI更新
    this.updateUI();
  }

  /**
   * マップを復元
   */
  private restoreMap(mapData: any, worldData: any): void {
    // 階層を変更
    this.map = this.world.changeFloor(worldData.currentFloor);

    // セルの探索状態を復元
    for (const cellData of mapData.cells) {
      const cell = this.map.getCell(cellData.x, cellData.y);
      if (cell) {
        cell.explored = cellData.explored;
      }
    }
  }

  /**
   * エンティティを復元（簡易版）
   */
  private restoreEntities(entitiesData: any): void {
    // 敵を復元
    this.enemies = [];
    for (const enemyData of entitiesData.enemies) {
      // 注: 完全な復元にはEnemyFactoryとEnemyDatabaseが必要
      // 現状は新しい敵として再生成
    }

    // アイテムを復元
    this.items = [];
    // 注: 完全な復元にはItemFactoryが必要

    // 階段を復元
    if (entitiesData.stairs) {
      const stairsData = entitiesData.stairs;
      this.stairs = new Stairs(
        stairsData.x,
        stairsData.y,
        stairsData.direction,
        stairsData.targetFloor
      );
    }

    // 宝箱を復元
    this.chests = [];
    // 注: 完全な復元にはChestFactoryが必要

    // ショップは復元しない（階層ごとに再生成）
    this.shop = null;
  }

  /**
   * セーブ情報を更新
   */
  private updateSaveInfo(): void {
    const saveInfo = document.getElementById('save-info');
    if (!saveInfo) return;

    const saves = EnhancedSaveManager.listSaves();
    const activeSave = saves.find(s => s.slot === 0 && s.exists);

    if (activeSave && activeSave.timestamp) {
      const date = new Date(activeSave.timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      saveInfo.textContent = `${dateStr} (${activeSave.floor}階)`;
    } else {
      saveInfo.textContent = 'セーブなし';
    }
  }

  /**
   * クリーンアップ
   */
  async destroy(): Promise<void> {
    this.stop();
    this.input.destroy();
    this.inventoryUI.destroy();
    this.shopUI.destroy();
    await this.soundManager.destroy();
    eventBus.clear();
  }
}
