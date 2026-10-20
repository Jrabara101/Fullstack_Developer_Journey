import type { Vector2D } from '../types';

export interface FloatingTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  scale: number;
  alpha: number;
  life: number;
  maxLife: number;
  isCrit: boolean;
}

export class FloatingTextManager {
  private items: FloatingTextItem[] = [];

  public update(dt: number) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.life += dt;
      if (item.life >= item.maxLife) {
        this.items.splice(i, 1);
        continue;
      }

      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.vy += 20 * dt; // slight deceleration of upward float

      const progress = item.life / item.maxLife;
      item.alpha = Math.max(0, 1 - Math.pow(progress, 2));

      // Bouncy scale-in
      if (progress < 0.2) {
        item.scale = 1 + (item.isCrit ? 0.6 : 0.3) * Math.sin((progress / 0.2) * Math.PI * 0.5);
      } else {
        item.scale = Math.max(0.7, 1 - (progress - 0.2) * 0.4);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      ctx.save();
      ctx.globalAlpha = item.alpha;
      ctx.translate(item.x, item.y);
      ctx.scale(item.scale, item.scale);

      ctx.font = item.isCrit
        ? 'bold 20px "JetBrains Mono", monospace'
        : 'bold 15px "JetBrains Mono", monospace';

      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = item.isCrit ? 4 : 3;
      ctx.strokeText(item.text, 0, 0);

      // Fill
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, 0, 0);

      ctx.restore();
    }
    ctx.restore();
  }

  public spawn(
    pos: Vector2D,
    text: string,
    color = '#FFFFFF',
    isCrit = false,
    maxLife = 0.8
  ) {
    this.items.push({
      id: Math.random().toString(36).slice(2, 9),
      text,
      x: pos.x + (Math.random() - 0.5) * 16,
      y: pos.y - 15,
      vx: (Math.random() - 0.5) * 40,
      vy: -90 - Math.random() * 40,
      color,
      scale: 1,
      alpha: 1,
      life: 0,
      maxLife,
      isCrit
    });
  }

  public clear() {
    this.items = [];
  }
}
