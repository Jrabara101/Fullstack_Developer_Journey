import type { CombatEntity, EnemyEntity, TelegraphZone, ArenaHazard, Projectile, Vector2D } from '../types';
import { ParticleSystem } from './particles';
import { FloatingTextManager } from './floatingText';

export interface RenderState {
  cameraShake: number; // 0 to 1
  shakeOffset: Vector2D;
  parryFlashTimer: number; // ms remaining
  postureBreakFlashTimer: number; // ms remaining
}

export class ArenaRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: CombatEntity & { fighterClass: string; abilities: any[] },
    enemies: EnemyEntity[],
    hazards: ArenaHazard[],
    projectiles: Projectile[],
    particles: ParticleSystem,
    floatingTexts: FloatingTextManager,
    renderState: RenderState,
    cursorWorldPos: Vector2D
  ) {
    // Clear canvas
    ctx.fillStyle = '#06080D';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Camera Center & Shake
    const centerX = width / 2 + renderState.shakeOffset.x;
    const centerY = height / 2 + renderState.shakeOffset.y;

    // Smooth soft camera track towards player
    const camOffsetX = (centerX - player.pos.x * 0.25);
    const camOffsetY = (centerY - player.pos.y * 0.25);

    ctx.translate(camOffsetX, camOffsetY);

    // 1. Draw Arena Colosseum Floor
    this.renderArenaFloor(ctx);

    // 2. Draw Hazards
    this.renderHazards(ctx, hazards);

    // 3. Draw Telegraph Zones
    this.renderTelegraphs(ctx, enemies);

    // 4. Draw Projectiles
    this.renderProjectiles(ctx, projectiles);

    // 5. Draw Enemies
    for (const enemy of enemies) {
      this.renderEnemy(ctx, enemy);
    }

    // 6. Draw Player
    this.renderPlayer(ctx, player, cursorWorldPos);

    // 7. Draw Particles
    particles.render(ctx);

    // 8. Draw Floating Combat Text
    floatingTexts.render(ctx);

    ctx.restore();

    // 9. Fullscreen Juice Overlays (Parry flash & Posture Break flash)
    this.renderScreenJuice(ctx, width, height, renderState);
  }

  private renderArenaFloor(ctx: CanvasRenderingContext2D) {
    const arenaRadius = 520;

    // Outer colosseum shadow & basalt ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, arenaRadius + 40, 0, Math.PI * 2);
    ctx.fillStyle = '#090D15';
    ctx.fill();

    // Stone wall border
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Outer Runic Gold Ring
    ctx.beginPath();
    ctx.arc(0, 0, arenaRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Arena Sand Pit Radial Gradient
    const sandGrad = ctx.createRadialGradient(0, 0, 50, 0, 0, arenaRadius);
    sandGrad.addColorStop(0, '#161922');
    sandGrad.addColorStop(0.7, '#10141D');
    sandGrad.addColorStop(1, '#0B0E16');
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.arc(0, 0, arenaRadius, 0, Math.PI * 2);
    ctx.fill();

    // Etched Runic Concentric Floor Rings
    ctx.strokeStyle = 'rgba(38, 49, 71, 0.4)';
    ctx.lineWidth = 1.5;

    [150, 280, 420].forEach((r) => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Cardinal Colosseum Quadrant Lines
    ctx.beginPath();
    ctx.moveTo(-arenaRadius, 0);
    ctx.lineTo(arenaRadius, 0);
    ctx.moveTo(0, -arenaRadius);
    ctx.lineTo(0, arenaRadius);
    ctx.stroke();

    // Center Runic Glyph
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Center 8-pointed runic star
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 55, Math.sin(angle) * 55);
      ctx.stroke();
    }
    ctx.restore();

    // Perimeter Stone Pillars with Flaming Torches
    const numPillars = 16;
    for (let i = 0; i < numPillars; i++) {
      const angle = (i * Math.PI * 2) / numPillars;
      const px = Math.cos(angle) * (arenaRadius + 18);
      const py = Math.sin(angle) * (arenaRadius + 18);

      // Pillar base
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();

      // Torch flame glow
      const time = performance.now() * 0.005 + i;
      const flicker = 10 + Math.sin(time * 3) * 3;
      const flameGrad = ctx.createRadialGradient(px, py, 2, px, py, flicker);
      flameGrad.addColorStop(0, '#FEF08A');
      flameGrad.addColorStop(0.4, '#F97316');
      flameGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(px, py, flicker, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderHazards(ctx: CanvasRenderingContext2D, hazards: ArenaHazard[]) {
    for (const h of hazards) {
      ctx.save();
      if (h.type === 'LAVA_GRATE') {
        const cycle = (h.elapsedMs % h.periodMs) / h.periodMs;
        const isSpurting = cycle > 0.6;
        h.isActive = isSpurting;

        // Grate base circle
        ctx.fillStyle = '#1A1D26';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(h.pos.x, h.pos.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Molten lava core
        const coreIntensity = isSpurting ? 0.9 : 0.35 + Math.sin(cycle * Math.PI * 2) * 0.2;
        const lavaGrad = ctx.createRadialGradient(h.pos.x, h.pos.y, 5, h.pos.x, h.pos.y, h.radius * 0.85);
        lavaGrad.addColorStop(0, `rgba(254, 240, 138, ${coreIntensity})`);
        lavaGrad.addColorStop(0.5, `rgba(249, 115, 22, ${coreIntensity})`);
        lavaGrad.addColorStop(1, `rgba(220, 38, 38, ${coreIntensity * 0.8})`);

        ctx.fillStyle = lavaGrad;
        ctx.beginPath();
        ctx.arc(h.pos.x, h.pos.y, h.radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Iron bars across grate
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        for (let o = -h.radius * 0.6; o <= h.radius * 0.6; o += 14) {
          ctx.beginPath();
          ctx.moveTo(h.pos.x + o, h.pos.y - h.radius * 0.7);
          ctx.lineTo(h.pos.x + o, h.pos.y + h.radius * 0.7);
          ctx.stroke();
        }

        // Spurting fire glow when active
        if (isSpurting) {
          ctx.strokeStyle = '#F97316';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(h.pos.x, h.pos.y, h.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (h.type === 'PENDULUM_BLADE') {
        const cycle = (h.elapsedMs % h.periodMs) / h.periodMs;
        const swingAngle = Math.sin(cycle * Math.PI * 2) * (Math.PI * 0.45);
        const armLength = 110;
        const bx = h.pos.x + Math.sin(swingAngle) * armLength;
        const by = h.pos.y + Math.cos(swingAngle) * armLength;

        h.isActive = true;

        // Shadow beneath blade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(bx, by + 10, h.radius, h.radius * 0.5, swingAngle, 0, Math.PI * 2);
        ctx.fill();

        // Pivot mount
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(h.pos.x, h.pos.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Iron chain/rod
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(h.pos.x, h.pos.y);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Curved steel blade head
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(swingAngle);

        ctx.fillStyle = '#CBD5E1';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, h.radius, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.lineTo(-h.radius * 0.2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
  }

  private renderTelegraphs(ctx: CanvasRenderingContext2D, enemies: EnemyEntity[]) {
    for (const enemy of enemies) {
      const t = enemy.activeTelegraph;
      if (!t) continue;

      const progress = Math.min(1, t.elapsedMs / t.durationMs);
      // Interpolate countdown heat from semi-transparent crimson to fiery opaque red
      const alphaFill = 0.25 + progress * 0.55;
      const alphaStroke = 0.5 + progress * 0.5;

      ctx.save();

      if (t.type === 'CIRCLE') {
        // Outer warning contour
        ctx.strokeStyle = `rgba(220, 38, 38, ${alphaStroke})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(t.origin.x, t.origin.y, t.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Expanding inner fill disk based on elapsed time (signals exact strike frame!)
        ctx.setLineDash([]);
        const curRadius = t.radius * progress;
        const fillGrad = ctx.createRadialGradient(
          t.origin.x, t.origin.y, 0,
          t.origin.x, t.origin.y, t.radius
        );
        fillGrad.addColorStop(0, `rgba(245, 158, 11, ${alphaFill * 0.8})`);
        fillGrad.addColorStop(progress, `rgba(220, 38, 38, ${alphaFill})`);
        fillGrad.addColorStop(1, 'rgba(220, 38, 38, 0.1)');

        ctx.fillStyle = fillGrad;
        ctx.beginPath();
        ctx.arc(t.origin.x, t.origin.y, curRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.type === 'CONE') {
        const halfAngle = ((t.coneAngleDeg || 90) * Math.PI) / 360;
        const baseAngle = t.angleRad || 0;
        const startAngle = baseAngle - halfAngle;
        const endAngle = baseAngle + halfAngle;

        // Expanding cone sweep
        ctx.beginPath();
        ctx.moveTo(t.origin.x, t.origin.y);
        ctx.arc(t.origin.x, t.origin.y, t.radius, startAngle, endAngle);
        ctx.closePath();

        const coneGrad = ctx.createRadialGradient(
          t.origin.x, t.origin.y, 0,
          t.origin.x, t.origin.y, t.radius
        );
        coneGrad.addColorStop(0, `rgba(245, 158, 11, ${alphaFill * 0.9})`);
        coneGrad.addColorStop(progress, `rgba(220, 38, 38, ${alphaFill})`);
        coneGrad.addColorStop(1, 'rgba(220, 38, 38, 0.15)');

        ctx.fillStyle = coneGrad;
        ctx.fill();

        ctx.strokeStyle = `rgba(220, 38, 38, ${alphaStroke})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (t.type === 'LINE_CHARGING') {
        const length = t.radius; // line length
        const width = 34; // corridor width
        const angle = t.angleRad || 0;

        ctx.save();
        ctx.translate(t.origin.x, t.origin.y);
        ctx.rotate(angle);

        // Rectangular charging corridor
        ctx.strokeStyle = `rgba(220, 38, 38, ${alphaStroke})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 6]);
        ctx.strokeRect(0, -width / 2, length, width);

        // Filling corridor progress
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(220, 38, 38, ${alphaFill * 0.7})`;
        ctx.fillRect(0, -width / 2, length * progress, width);

        // Animated charging chevron arrows
        const arrowSpacing = 50;
        const offset = (t.elapsedMs * 0.15) % arrowSpacing;
        ctx.strokeStyle = `rgba(245, 158, 11, ${alphaStroke})`;
        ctx.lineWidth = 2.5;

        for (let x = offset; x < length; x += arrowSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, -width / 3);
          ctx.lineTo(x + 12, 0);
          ctx.lineTo(x, width / 3);
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.pos.x, p.pos.y);

      const angle = Math.atan2(p.velocity.y, p.velocity.x);
      ctx.rotate(angle);

      if (p.isPlayer) {
        // Arcane or frost shard
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 2, p.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cyan glow
        ctx.strokeStyle = '#67E8F9';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Piercing Archer Arrow
        ctx.fillStyle = '#94A3B8';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;

        // Arrow shaft
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(4, -4);
        ctx.lineTo(4, 4);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyEntity) {
    ctx.save();
    ctx.translate(enemy.pos.x, enemy.pos.y);

    // Entity shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius * 0.8, enemy.radius, enemy.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Staggered / Posture Break Amber Aura
    if (enemy.isStaggered) {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 8, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning stun stars above head
      const stunAngle = performance.now() * 0.006;
      for (let s = 0; s < 3; s++) {
        const starAng = stunAngle + (s * Math.PI * 2) / 3;
        const sx = Math.cos(starAng) * (enemy.radius + 14);
        const sy = Math.sin(starAng) * (enemy.radius * 0.4) - enemy.radius - 10;
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Frozen blue frost overlay
    if (enemy.statusEffects?.frozenMs && enemy.statusEffects.frozenMs > 0) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rotation towards facing direction
    ctx.rotate(enemy.rotationAngle);

    // Archetype specific rendering
    switch (enemy.archetype) {
      case 'MINION_MELEE': {
        // Dual-Blade Skirmisher
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Skull mask
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.arc(3, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Crimson eyes
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(5, -3, 3, 2);
        ctx.fillRect(5, 1, 3, 2);

        // Twin curved scimitars
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(8, -10);
        ctx.lineTo(20, -14);
        ctx.moveTo(8, 10);
        ctx.lineTo(20, 14);
        ctx.stroke();
        break;
      }

      case 'ARCHER': {
        // Wood & Bone Archer
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Green hunter cowl
        ctx.fillStyle = '#065F46';
        ctx.beginPath();
        ctx.arc(2, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bow
        ctx.strokeStyle = '#A16207';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(12, 0, 16, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        break;
      }

      case 'ARENA_BRUTE': {
        // Spiked Iron Juggernaut
        ctx.fillStyle = '#1F2937';
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Spiked pauldrons
        ctx.fillStyle = '#4B5563';
        ctx.fillRect(-6, -enemy.radius - 4, 12, 8);
        ctx.fillRect(-6, enemy.radius - 4, 12, 8);

        // Massive hammer head
        ctx.fillStyle = '#374151';
        ctx.fillRect(14, -10, 16, 20);
        ctx.strokeStyle = '#F59E0B';
        ctx.strokeRect(14, -10, 16, 20);
        break;
      }

      case 'BOSS_WARLORD': {
        // "Valerius, The Hollow Champion"
        const isPhase3 = enemy.phase === 3;

        // Flaming or runic mantle
        if (isPhase3) {
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Monumental Dark Iron Armor
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = isPhase3 ? '#EF4444' : '#F59E0B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Crown of thorns / Obsidian Crest
        ctx.fillStyle = '#F59E0B';
        for (let c = -2; c <= 2; c++) {
          ctx.beginPath();
          ctx.moveTo(8, c * 6);
          ctx.lineTo(22, c * 5);
          ctx.lineTo(8, c * 6 + 3);
          ctx.fill();
        }

        // Colossal Greatsword
        ctx.fillStyle = isPhase3 ? '#DC2626' : '#94A3B8';
        ctx.fillRect(16, -5, 34, 10);
        ctx.strokeStyle = isPhase3 ? '#FEF08A' : '#F59E0B';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, -5, 34, 10);
        break;
      }
    }

    ctx.restore();

    // Overhead Health & Posture Pips
    this.renderOverheadVitals(ctx, enemy);
  }

  private renderOverheadVitals(ctx: CanvasRenderingContext2D, enemy: EnemyEntity) {
    const barWidth = enemy.radius * 2 + 10;
    const barHeight = 4;
    const barX = enemy.pos.x - barWidth / 2;
    const barY = enemy.pos.y - enemy.radius - 16;

    // HP Bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight * 2 + 3);

    // HP Fill (Crimson)
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    // Posture Fill (Amber)
    const postureRatio = Math.min(1, enemy.posture / 100);
    ctx.fillStyle = enemy.isStaggered ? '#F59E0B' : '#EAB308';
    ctx.fillRect(barX, barY + barHeight + 1, barWidth * postureRatio, barHeight);
  }

  private renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: CombatEntity & { fighterClass: string; abilities: any[] },
    cursorWorldPos: Vector2D
  ) {
    ctx.save();
    ctx.translate(player.pos.x, player.pos.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, player.radius * 0.8, player.radius, player.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dodge Roll I-Frames Ghost Effect
    if (player.isInvulnerable) {
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Active Parry Aegis Barrier (150ms window)
    const parryAbility = player.abilities.find(a => a.id === 'PARRY');
    const isParrying = parryAbility && (performance.now() - parryAbility.lastUsedTimestamp < 150);
    if (isParrying) {
      ctx.save();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2);
      ctx.stroke();

      const aegisGrad = ctx.createRadialGradient(0, 0, player.radius, 0, 0, player.radius + 14);
      aegisGrad.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
      aegisGrad.addColorStop(1, 'rgba(6, 182, 212, 0.6)');
      ctx.fillStyle = aegisGrad;
      ctx.fill();
      ctx.restore();
    }

    // Overdrive Arcane Aura
    if (player.statusEffects?.overdriveMs && player.statusEffects.overdriveMs > 0) {
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rotate player towards cursor
    ctx.rotate(player.rotationAngle);

    // Player base body
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Class specific visual features
    if (player.fighterClass === 'WARRIOR') {
      // Golden Runic Broadsword & Shield
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(8, 4, 24, 6); // Sword blade
      ctx.fillStyle = '#475569';
      ctx.fillRect(-2, -player.radius - 4, 14, 6); // Tower shield edge
    } else if (player.fighterClass === 'BATTLE_MAGE') {
      // Arcane Robe & Floating Orbs
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.arc(6, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Floating frost orb & fire orb
      const orbAngle = performance.now() * 0.005;
      const ox1 = Math.cos(orbAngle) * 26;
      const oy1 = Math.sin(orbAngle) * 26;
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(ox1, oy1, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.arc(-ox1, -oy1, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // ROGUE: Dual daggers
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(22, -12);
      ctx.moveTo(6, 8);
      ctx.lineTo(22, 12);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderScreenJuice(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    renderState: RenderState
  ) {
    // 1. Parry Deflect Cyan Perimeter Flash
    if (renderState.parryFlashTimer > 0) {
      const alpha = Math.min(0.65, renderState.parryFlashTimer / 250);
      ctx.save();
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
      ctx.lineWidth = 18;
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();
    }

    // 2. Posture Break Shatter Amber Flash
    if (renderState.postureBreakFlashTimer > 0) {
      const alpha = Math.min(0.7, renderState.postureBreakFlashTimer / 280);
      ctx.save();
      ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.35})`;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
      ctx.lineWidth = 22;
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();
    }
  }
}
