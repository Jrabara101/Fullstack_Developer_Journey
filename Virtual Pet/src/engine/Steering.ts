export interface Vector2D {
  x: number;
  y: number;
}

export interface WasteEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export class SteeringSystem {
  public wanderAngle: number = Math.random() * Math.PI * 2;
  public wanderChangeRate: number = 0.8;

  // Wall avoidance calculation
  public getWallAvoidanceForce(pos: Vector2D, bounds: { width: number; height: number; groundY: number }, margin = 80): Vector2D {
    const force: Vector2D = { x: 0, y: 0 };
    const strength = 180;

    if (pos.x < margin) {
      force.x += strength * (1 - pos.x / margin);
    } else if (pos.x > bounds.width - margin) {
      force.x -= strength * (1 - (bounds.width - pos.x) / margin);
    }

    // Floor repulsion if below ground line
    if (pos.y > bounds.groundY) {
      force.y -= strength * 2.5;
    } else if (pos.y < 120) {
      // Don't fly into top HUD
      force.y += strength * (1 - pos.y / 120);
    }

    return force;
  }

  // Smooth wander force
  public getWanderForce(speed = 45): Vector2D {
    this.wanderAngle += (Math.random() - 0.5) * this.wanderChangeRate;
    return {
      x: Math.cos(this.wanderAngle) * speed,
      y: (Math.sin(this.wanderAngle) * speed) * 0.25, // less vertical drift
    };
  }

  // Curiosity towards cursor
  public getCuriosityForce(petPos: Vector2D, cursor: Vector2D | null, maxDist = 450, pull = 70): Vector2D {
    if (!cursor) return { x: 0, y: 0 };
    const dx = cursor.x - petPos.x;
    const dy = cursor.y - petPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 40 || dist > maxDist) return { x: 0, y: 0 };

    const normX = dx / dist;
    const normY = dy / dist;
    const factor = Math.min(1, dist / 150);

    return {
      x: normX * pull * factor,
      y: normY * pull * factor * 0.4,
    };
  }

  // Flee from waste droppings
  public getWasteRepulsionForce(petPos: Vector2D, wasteList: WasteEntity[], dangerRadius = 140): Vector2D {
    const totalForce: Vector2D = { x: 0, y: 0 };

    for (const waste of wasteList) {
      const dx = petPos.x - waste.x;
      const dy = petPos.y - waste.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < dangerRadius) {
        const repulsion = (1 - dist / dangerRadius) * 120;
        totalForce.x += (dx / dist) * repulsion;
        totalForce.y += (dy / dist) * repulsion * 0.3;
      }
    }

    return totalForce;
  }
}
