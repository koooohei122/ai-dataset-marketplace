// FPSモニター: ローリング平均でFPSを計測する
export class FpsMonitor {
  private samples: number[] = [];
  private lastTime = performance.now();
  private readonly windowSize: number;

  constructor(windowSize = 30) {
    this.windowSize = windowSize;
  }

  tick(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    if (delta > 0) {
      this.samples.push(1000 / delta);
      if (this.samples.length > this.windowSize) {
        this.samples.shift();
      }
    }

    return this.fps;
  }

  get fps(): number {
    if (this.samples.length === 0) return 60;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
}
