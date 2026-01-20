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
import { GameMap } from '@/world/Map';
import { World } from '@/world/World';
import { RoomGenerator } from '@/world/generators/RoomGenerator';
import { CaveGenerator } from '@/world/generators/CaveGenerator';
import { BSPGenerator } from '@/world/generators/BSPGenerator';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Item, ItemType } from '@/entities/Item';
import { Stairs, StairsDirection } from '@/entities/Stairs';
import { Shop } from '@/entities/Shop';
import { Equipment as EquipmentComponent } from '@/entities/components/Equipment';
import { CombatEntity } from '@/entities/Entity';
import { CombatSystem } from '@/combat/CombatSystem';
import { Vector2D } from '@/utils/Vector2D';
import { MessageType } from '@/ui/MessageLog';
import { rollRandomItem, getItemData } from '@/data/items';
import { getRandomEnemyForFloor } from '@/data/enemies';
import { AStar } from '@/ai/pathfinding/AStar';
import { ItemAffixManager } from '@/items/ItemAffix';
import { StatusEffectType } from '@/combat/StatusEffect';
import { SaveManager, GameSaveData } from '@/utils/SaveManager';
import { SoundManager, SoundType } from '@/utils/SoundManager';

export class Game {
  private renderer: Renderer;
  private gameState: GameState;
  private input: Input;
  private uiManager: UIManager;
  private inventoryUI: InventoryUI;
  private shopUI: ShopUI;
  private minimap: Minimap;
  private soundManager: SoundManager;

  private world!: World;
  private map!: GameMap;
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: Item[] = [];
  private stairs!: Stairs;
  private shop!: Shop | null;

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

    // UI更新
    eventBus.on(GameEvents.UI_UPDATE, () => {
      this.updateUI();
    });

    // 戦闘ヒット時にダメージ数字表示
    eventBus.on(GameEvents.COMBAT_HIT, (data: { attacker: string; target: string; damage: number }) => {
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
    });

    // クリティカルヒット時にダメージ数字表示
    eventBus.on(GameEvents.COMBAT_CRITICAL, (data: { attacker: string; target: string; damage: number }) => {
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
    });

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
   * ゲーム初期化
   */
  initialize(): void {
    // ワールド生成
    this.world = new World();
    this.map = this.world.getCurrentMap();

    // プレイヤー配置
    const startPos = this.world.getRandomStartPosition();
    this.player = new Player(startPos.x, startPos.y);

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

    // 敵数は階層に応じて増加
    const enemyCount = 8 + this.world.getCurrentFloor() * 2;
    this.spawnEnemies(enemyCount);

    // アイテムを配置
    this.spawnItems(15);

    // 階段を配置
    this.spawnStairs();

    // 店を配置（30%の確率）
    if (Math.random() < 0.3) {
      this.spawnShop();
    }

    // インベントリUIの設定
    this.inventoryUI.setInventory(this.player.inventory);
    this.inventoryUI.setCallbacks(
      (item) => this.useItem(item),
      (item) => this.dropItem(item)
    );

    // カメラをプレイヤーに追従
    this.renderer.setCameraPosition(this.player.getPosition());

    // FOV更新
    this.map.updateFOV(this.player.getPosition(), 8);

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
    const cell = this.map.getRandomWalkableCell();
    if (!cell) return;

    const pos = cell.position;

    // プレイヤーから離れた位置に配置
    if (this.player.getPosition().distanceTo(pos) < 10) {
      this.spawnStairs(); // 再試行
      return;
    }

    // 下り階段を配置
    const targetFloor = this.world.getCurrentFloor() + 1;
    this.stairs = new Stairs(pos.x, pos.y, StairsDirection.DOWN, targetFloor);
  }

  /**
   * 店を配置
   */
  private spawnShop(): void {
    const cell = this.map.getRandomWalkableCell();
    if (!cell) return;

    const pos = cell.position;

    // プレイヤーから離れた位置に配置
    if (this.player.getPosition().distanceTo(pos) < 15) {
      this.spawnShop(); // 再試行
      return;
    }

    // 店を配置
    this.shop = new Shop(pos.x, pos.y);
    this.uiManager.addMessage('この階には商人がいるようだ', MessageType.INFO);
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
    requestAnimationFrame((time) => this.gameLoop(time));
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

    let turnEnded = false;

    // インベントリアクション
    if (action === Action.INVENTORY) {
      this.inventoryUI.toggle();
      return;
    }

    // アイテム拾う
    if (action === Action.PICKUP) {
      turnEnded = this.pickupItem();
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

    // 移動アクション
    const direction = Input.actionToDirection(action);
    if (direction) {
      turnEnded = this.movePlayer(direction);
    }

    // ターン終了
    if (turnEnded) {
      // プレイヤーのステータス効果を処理
      this.player.processStatusEffects();
      this.gameState.advanceTurn();
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
    this.shopUI.setCallback((item) => this.buyItemFromShop(item));
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
   * 次の階層へ降りる
   */
  private descendToNextFloor(): void {
    const nextFloor = this.world.getCurrentFloor() + 1;

    this.uiManager.addMessage(
      `階段を降りて${nextFloor}階へ進んだ`,
      MessageType.INFO
    );

    // 新しい階層を生成
    this.map = this.world.descendFloor();

    // プレイヤーを新しい開始位置に配置
    const startPos = this.world.getRandomStartPosition();
    this.player.setPosition(startPos);

    // 階層をセットアップ
    this.setupFloor();
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
    const enemyAtPosition = this.enemies.find(e =>
      e.isAlive() && e.getPosition().equals(newPos)
    );

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

    // FOV更新
    this.map.updateFOV(newPos, 8);

    // 階段の上に立った時にメッセージを表示
    if (this.stairs && this.stairs.getPosition().equals(newPos)) {
      this.uiManager.addMessage('階段を発見した！(Enterで次の階へ)', MessageType.INFO);
    }

    // UI更新
    this.updateUI();

    return true;
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
   * アイテムを拾う
   */
  private pickupItem(): boolean {
    const playerPos = this.player.getPosition();

    // プレイヤーの位置にあるアイテムを検索
    const itemAtPosition = this.items.find(item =>
      item.getPosition().equals(playerPos)
    );

    if (!itemAtPosition) {
      this.uiManager.addMessage('ここにはアイテムがない', MessageType.INFO);
      return false;
    }

    // インベントリに追加
    const success = this.player.inventory.addItem(itemAtPosition);

    if (success) {
      // マップからアイテムを削除
      this.items = this.items.filter(item => item !== itemAtPosition);
      this.soundManager.play(SoundType.PICKUP);
      return true;
    }

    return false;
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
      this.uiManager.addMessage(
        `${item.name}は装備できません`,
        MessageType.INFO
      );
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
      this.uiManager.addMessage(
        `${item.name}を装備した`,
        MessageType.INFO
      );
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
      this.uiManager.addMessage(
        'テレポートに失敗した！',
        MessageType.WARNING
      );
      return;
    }

    // プレイヤーを移動
    const oldPos = this.player.getPosition();
    this.player.setPosition(randomCell.position);

    // カメラ追従
    this.renderer.setCameraPosition(randomCell.position);

    // FOV更新
    this.map.updateFOV(randomCell.position, 8);

    this.soundManager.play(SoundType.STAIRS);
    this.uiManager.addMessage(
      'テレポートの巻物を使った！別の場所に移動した',
      MessageType.INFO
    );

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
      this.uiManager.addMessage(
        '火球の巻物を使ったが、範囲内に敵がいなかった',
        MessageType.INFO
      );
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
    // ゴールドをドロップ
    const goldDrop = 5 + Math.floor(Math.random() * 10) + this.world.getCurrentFloor() * 2;
    this.player.addGold(goldDrop);

    this.uiManager.addMessage(
      `${enemy.name}を倒した！${goldDrop}ゴールドを手に入れた`,
      MessageType.SUCCESS
    );
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
    const nextPos = AStar.getNextMove(
      enemyPos,
      playerPos,
      (x, y) => {
        // マップ境界チェック
        if (!this.map.isInBounds(x, y)) return false;

        // 壁チェック
        if (!this.map.isWalkableAt(new Vector2D(x, y))) return false;

        // 他の敵と重ならないかチェック（ただし目的地は除く）
        if (x === playerPos.x && y === playerPos.y) return true;

        const occupied = this.enemies.some(e =>
          e !== enemy && e.isAlive() && e.getPosition().equals(new Vector2D(x, y))
        );

        return !occupied;
      }
    );

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
      const occupied = this.enemies.some(e =>
        e !== enemy && e.isAlive() && e.getPosition().equals(newPos)
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
        this.renderer.drawRect(
          screenPos.x,
          screenPos.y,
          tileSize,
          tileSize,
          { fillColor: '#3a3a1a' }
        );

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
        this.renderer.drawRect(
          screenPos.x,
          screenPos.y,
          tileSize,
          tileSize,
          { fillColor: '#4a3a1a' }
        );

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
        this.renderer.drawRect(
          screenPos.x,
          screenPos.y,
          tileSize,
          tileSize,
          { fillColor: '#1a3a1a' }
        );

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
        this.renderer.drawRect(
          screenPos.x,
          screenPos.y,
          tileSize,
          tileSize,
          { fillColor: '#2a2a2a' }
        );

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
    this.renderer.drawRect(
      screenPos.x,
      screenPos.y,
      tileSize,
      tileSize,
      { fillColor: '#4a4a4a' }
    );

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
   * ゲームを保存
   */
  private saveGame(): void {
    const saveData: GameSaveData = {
      version: '1.0',
      timestamp: Date.now(),
      player: {
        position: { x: this.player.getPosition().x, y: this.player.getPosition().y },
        level: this.player.level,
        experience: this.player.experience,
        experienceToNextLevel: this.player.experienceToNextLevel,
        gold: this.player.gold,
        hp: this.player.stats.hp,
        maxHp: this.player.stats.maxHp,
        attack: this.player.stats.attack,
        defense: this.player.stats.defense,
        speed: this.player.stats.speed,
        inventory: this.player.inventory.getItems().map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.itemType,
          rarity: item.rarity,
          stackable: item.stackable,
          stackCount: item.stackCount,
        })),
        equipment: {
          weapon: null,
          armor: null,
          accessory: null,
        },
      },
      world: {
        currentFloor: this.world.getCurrentFloor(),
      },
    };

    const success = SaveManager.save(saveData);
    if (success) {
      this.uiManager.addMessage('ゲームを保存しました', MessageType.SUCCESS);
      this.updateSaveInfo();
    } else {
      this.uiManager.addMessage('保存に失敗しました', MessageType.WARNING);
    }
  }

  /**
   * ゲームを読み込み（簡易版：現在の階層とゴールドのみ復元）
   */
  private loadGame(): void {
    const saveData = SaveManager.load();
    if (!saveData) {
      this.uiManager.addMessage('セーブデータがありません', MessageType.WARNING);
      return;
    }

    // プレイヤーステータスを復元
    this.player.level = saveData.player.level;
    this.player.experience = saveData.player.experience;
    this.player.experienceToNextLevel = saveData.player.experienceToNextLevel;
    this.player.gold = saveData.player.gold;
    this.player.stats.hp = saveData.player.hp;
    this.player.stats.maxHp = saveData.player.maxHp;

    // 階層を変更
    const targetFloor = saveData.world.currentFloor;
    this.map = this.world.changeFloor(targetFloor);

    // プレイヤー位置を復元
    const savedPos = saveData.player.position;
    this.player.setPosition(new Vector2D(savedPos.x, savedPos.y));

    // 階層をセットアップ
    this.setupFloor();

    this.uiManager.addMessage('ゲームを読み込みました', MessageType.SUCCESS);
    this.updateSaveInfo();
  }

  /**
   * セーブ情報を更新
   */
  private updateSaveInfo(): void {
    const saveInfo = document.getElementById('save-info');
    if (!saveInfo) return;

    const info = SaveManager.getSaveInfo();
    if (info) {
      const date = new Date(info.timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      saveInfo.textContent = `${dateStr} (${info.floor}階)`;
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
