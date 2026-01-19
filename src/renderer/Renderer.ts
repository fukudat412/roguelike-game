/**
 * Canvas描画システム
 * レイヤー管理、カメラ、スプライト描画
 */

import { Vector2D } from '@/utils/Vector2D';

export interface RenderOptions {
  fillColor?: string;
  strokeColor?: string;
  lineWidth?: number;
  alpha?: number;
}

export class Camera {
  constructor(
    public position: Vector2D = Vector2D.zero(),
    public width: number = 800,
    public height: number = 600
  ) {}

  /**
   * ワールド座標をスクリーン座標に変換
   */
  worldToScreen(worldPos: Vector2D): Vector2D {
    return new Vector2D(
      worldPos.x - this.position.x + this.width / 2,
      worldPos.y - this.position.y + this.height / 2
    );
  }

  /**
   * スクリーン座標をワールド座標に変換
   */
  screenToWorld(screenPos: Vector2D): Vector2D {
    return new Vector2D(
      screenPos.x + this.position.x - this.width / 2,
      screenPos.y + this.position.y - this.height / 2
    );
  }

  /**
   * カメラを対象に追従
   */
  followTarget(target: Vector2D): void {
    this.position = target.clone();
  }
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private tileSize: number = 32;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    this.ctx = ctx;
    this.camera = new Camera(Vector2D.zero(), canvas.width, canvas.height);

    // ピクセルアート用の設定
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * 画面をクリア
   */
  clear(color: string = '#1a1a1a'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 矩形を描画
   */
  drawRect(x: number, y: number, width: number, height: number, options: RenderOptions = {}): void {
    const oldAlpha = this.ctx.globalAlpha;
    if (options.alpha !== undefined) {
      this.ctx.globalAlpha = options.alpha;
    }

    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
      this.ctx.fillRect(x, y, width, height);
    }

    if (options.strokeColor) {
      this.ctx.strokeStyle = options.strokeColor;
      this.ctx.lineWidth = options.lineWidth || 1;
      this.ctx.strokeRect(x, y, width, height);
    }

    this.ctx.globalAlpha = oldAlpha;
  }

  /**
   * タイルを描画（グリッドベース）
   */
  drawTile(gridX: number, gridY: number, options: RenderOptions): void {
    const screenPos = this.gridToScreen(gridX, gridY);
    this.drawRect(screenPos.x, screenPos.y, this.tileSize, this.tileSize, options);
  }

  /**
   * 円を描画
   */
  drawCircle(x: number, y: number, radius: number, options: RenderOptions = {}): void {
    const oldAlpha = this.ctx.globalAlpha;
    if (options.alpha !== undefined) {
      this.ctx.globalAlpha = options.alpha;
    }

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
      this.ctx.fill();
    }

    if (options.strokeColor) {
      this.ctx.strokeStyle = options.strokeColor;
      this.ctx.lineWidth = options.lineWidth || 1;
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = oldAlpha;
  }

  /**
   * テキストを描画
   */
  drawText(text: string, x: number, y: number, options: {
    color?: string;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  } = {}): void {
    this.ctx.fillStyle = options.color || '#ffffff';
    this.ctx.font = options.font || '16px monospace';
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'top';
    this.ctx.fillText(text, x, y);
  }

  /**
   * グリッド座標をスクリーン座標に変換
   */
  gridToScreen(gridX: number, gridY: number): Vector2D {
    const worldX = gridX * this.tileSize;
    const worldY = gridY * this.tileSize;

    // カメラを中心にオフセット
    const screenX = worldX - this.camera.position.x + this.canvas.width / 2 - this.tileSize / 2;
    const screenY = worldY - this.camera.position.y + this.canvas.height / 2 - this.tileSize / 2;

    return new Vector2D(screenX, screenY);
  }

  /**
   * スクリーン座標をグリッド座標に変換
   */
  screenToGrid(screenX: number, screenY: number): Vector2D {
    const worldX = screenX + this.camera.position.x - this.canvas.width / 2 + this.tileSize / 2;
    const worldY = screenY + this.camera.position.y - this.canvas.height / 2 + this.tileSize / 2;

    return new Vector2D(
      Math.floor(worldX / this.tileSize),
      Math.floor(worldY / this.tileSize)
    );
  }

  /**
   * カメラを取得
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * カメラ位置を設定（ワールド座標）
   */
  setCameraPosition(worldPos: Vector2D): void {
    this.camera.position = worldPos.multiply(this.tileSize);
  }

  /**
   * タイルサイズを取得
   */
  getTileSize(): number {
    return this.tileSize;
  }

  /**
   * タイルサイズを設定
   */
  setTileSize(size: number): void {
    this.tileSize = size;
  }

  /**
   * Canvasを取得
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * コンテキストを取得
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
