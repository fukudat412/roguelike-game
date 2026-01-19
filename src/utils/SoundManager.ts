/**
 * サウンド管理システム
 * Web Audio APIを使用して効果音を生成
 */

export enum SoundType {
  ATTACK = 'ATTACK',
  DAMAGE = 'DAMAGE',
  PICKUP = 'PICKUP',
  STAIRS = 'STAIRS',
  LEVEL_UP = 'LEVEL_UP',
  PURCHASE = 'PURCHASE',
  ERROR = 'ERROR',
}

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    // AudioContextは初回のユーザーインタラクションで初期化
  }

  /**
   * AudioContextを初期化（遅延初期化）
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * サウンドを有効/無効にする
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 音量を設定（0.0 - 1.0）
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * サウンドを再生
   */
  play(type: SoundType): void {
    if (!this.enabled) return;

    try {
      this.initAudioContext();
      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;

      switch (type) {
        case SoundType.ATTACK:
          this.playAttackSound(now);
          break;
        case SoundType.DAMAGE:
          this.playDamageSound(now);
          break;
        case SoundType.PICKUP:
          this.playPickupSound(now);
          break;
        case SoundType.STAIRS:
          this.playStairsSound(now);
          break;
        case SoundType.LEVEL_UP:
          this.playLevelUpSound(now);
          break;
        case SoundType.PURCHASE:
          this.playPurchaseSound(now);
          break;
        case SoundType.ERROR:
          this.playErrorSound(now);
          break;
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }

  /**
   * 攻撃音
   */
  private playAttackSound(startTime: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.1);

    gain.gain.value = this.volume;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

    // リソースのクリーンアップ
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }

  /**
   * ダメージ音
   */
  private playDamageSound(startTime: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.2);

    gain.gain.value = this.volume;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    // リソースのクリーンアップ
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }

  /**
   * アイテム拾得音
   */
  private playPickupSound(startTime: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 800;
    osc.frequency.exponentialRampToValueAtTime(1200, startTime + 0.1);

    gain.gain.value = this.volume * 0.5;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

    // リソースのクリーンアップ
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }

  /**
   * 階段使用音
   */
  private playStairsSound(startTime: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 400;
    osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.3);

    gain.gain.value = this.volume * 0.6;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

    // リソースのクリーンアップ
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  /**
   * レベルアップ音
   */
  private playLevelUpSound(startTime: number): void {
    if (!this.audioContext) return;

    const frequencies = [523, 659, 784]; // C, E, G
    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);

      const time = startTime + i * 0.1;
      osc.frequency.value = freq;

      gain.gain.value = this.volume * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

      // リソースのクリーンアップ
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };

      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  /**
   * 購入音
   */
  private playPurchaseSound(startTime: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 600;
    osc.frequency.exponentialRampToValueAtTime(900, startTime + 0.15);

    gain.gain.value = this.volume * 0.5;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

    // リソースのクリーンアップ
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  /**
   * エラー音
   */
  private playErrorSound(startTime: number): void {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.type = 'square';
    osc.frequency.value = 200;

    gain.gain.value = this.volume * 0.4;
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

    // リソースのクリーンアップ
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };

    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  /**
   * AudioContextをクリーンアップ
   */
  async destroy(): Promise<void> {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }
    this.audioContext = null;
  }
}
