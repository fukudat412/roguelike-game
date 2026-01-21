/**
 * デイリーチャレンジシステム
 * 日替わりミッションとボーナス報酬
 */

export enum ChallengeType {
  KILL_ENEMIES = 'KILL_ENEMIES',
  KILL_BOSSES = 'KILL_BOSSES',
  OPEN_CHESTS = 'OPEN_CHESTS',
  COLLECT_ITEMS = 'COLLECT_ITEMS',
  REACH_FLOOR = 'REACH_FLOOR',
  EARN_GOLD = 'EARN_GOLD',
  SURVIVE_TURNS = 'SURVIVE_TURNS',
}

export interface Challenge {
  type: ChallengeType;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: {
    metaPoints: number;
    gold: number;
  };
}

export interface DailyChallengeData {
  date: string;
  challenges: Challenge[];
  allCompleted: boolean;
}

export class DailyChallenge {
  private static STORAGE_KEY = 'dailyChallenge';
  private currentData: DailyChallengeData | null = null;

  constructor() {
    this.loadOrGenerate();
  }

  /**
   * 今日の日付を取得（YYYY-MM-DD形式）
   */
  private getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * ローカルストレージから読み込み、または新規生成
   */
  private loadOrGenerate(): void {
    const today = this.getTodayDate();
    const saved = localStorage.getItem(DailyChallenge.STORAGE_KEY);

    if (saved) {
      try {
        const data: DailyChallengeData = JSON.parse(saved);

        // 日付が今日なら既存データを使用
        if (data.date === today) {
          this.currentData = data;
          return;
        }
      } catch (e) {
        console.error('Failed to parse daily challenge data:', e);
      }
    }

    // 新しいチャレンジを生成
    this.currentData = this.generateChallenges(today);
    this.save();
  }

  /**
   * チャレンジを生成
   */
  private generateChallenges(date: string): DailyChallengeData {
    // シード値として日付を使用（同じ日は同じチャレンジ）
    const seed = this.dateToSeed(date);
    const rng = this.seededRandom(seed);

    const challengePool: Array<{
      type: ChallengeType;
      baseTarget: number;
      desc: (n: number) => string;
    }> = [
      {
        type: ChallengeType.KILL_ENEMIES,
        baseTarget: 10,
        desc: n => `敵を${n}体倒す`,
      },
      {
        type: ChallengeType.KILL_BOSSES,
        baseTarget: 1,
        desc: n => `ボスを${n}体倒す`,
      },
      {
        type: ChallengeType.OPEN_CHESTS,
        baseTarget: 3,
        desc: n => `宝箱を${n}個開ける`,
      },
      {
        type: ChallengeType.COLLECT_ITEMS,
        baseTarget: 15,
        desc: n => `アイテムを${n}個収集する`,
      },
      {
        type: ChallengeType.REACH_FLOOR,
        baseTarget: 5,
        desc: n => `${n}階層に到達する`,
      },
      {
        type: ChallengeType.EARN_GOLD,
        baseTarget: 500,
        desc: n => `${n}ゴールドを獲得する`,
      },
      {
        type: ChallengeType.SURVIVE_TURNS,
        baseTarget: 100,
        desc: n => `${n}ターン生き延びる`,
      },
    ];

    // ランダムに3つのチャレンジを選択
    const selectedChallenges: Challenge[] = [];
    const poolCopy = [...challengePool];

    for (let i = 0; i < 3; i++) {
      const index = Math.floor(rng() * poolCopy.length);
      const selected = poolCopy.splice(index, 1)[0];

      // 難易度をランダムに調整
      const difficultyMultiplier = 0.8 + rng() * 0.4; // 0.8~1.2倍
      const target = Math.ceil(selected.baseTarget * difficultyMultiplier);

      // 報酬を計算（難しいほど高い）
      const metaPoints = Math.ceil(target * 5);
      const gold = Math.ceil(target * 20);

      selectedChallenges.push({
        type: selected.type,
        description: selected.desc(target),
        target,
        current: 0,
        completed: false,
        reward: {
          metaPoints,
          gold,
        },
      });
    }

    return {
      date,
      challenges: selectedChallenges,
      allCompleted: false,
    };
  }

  /**
   * 日付文字列をシード値に変換
   */
  private dateToSeed(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * シード付き疑似乱数生成器
   */
  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  /**
   * 保存
   */
  private save(): void {
    if (this.currentData) {
      localStorage.setItem(DailyChallenge.STORAGE_KEY, JSON.stringify(this.currentData));
    }
  }

  /**
   * チャレンジを取得
   */
  getChallenges(): Challenge[] {
    return this.currentData?.challenges || [];
  }

  /**
   * 進捗を更新
   */
  updateProgress(type: ChallengeType, amount: number = 1): void {
    if (!this.currentData) return;

    let anyUpdated = false;

    for (const challenge of this.currentData.challenges) {
      if (challenge.type === type && !challenge.completed) {
        challenge.current = Math.min(challenge.current + amount, challenge.target);

        if (challenge.current >= challenge.target) {
          challenge.completed = true;
        }

        anyUpdated = true;
      }
    }

    // 全て完了したかチェック
    const allCompleted = this.currentData.challenges.every(c => c.completed);
    if (allCompleted && !this.currentData.allCompleted) {
      this.currentData.allCompleted = true;
    }

    if (anyUpdated) {
      this.save();
    }
  }

  /**
   * 全て完了したか
   */
  isAllCompleted(): boolean {
    return this.currentData?.allCompleted || false;
  }

  /**
   * 完了済みの報酬を取得
   */
  getCompletedRewards(): { metaPoints: number; gold: number } {
    if (!this.currentData) {
      return { metaPoints: 0, gold: 0 };
    }

    let totalMetaPoints = 0;
    let totalGold = 0;

    for (const challenge of this.currentData.challenges) {
      if (challenge.completed) {
        totalMetaPoints += challenge.reward.metaPoints;
        totalGold += challenge.reward.gold;
      }
    }

    return { metaPoints: totalMetaPoints, gold: totalGold };
  }

  /**
   * リセット（デバッグ用）
   */
  reset(): void {
    localStorage.removeItem(DailyChallenge.STORAGE_KEY);
    this.loadOrGenerate();
  }
}
