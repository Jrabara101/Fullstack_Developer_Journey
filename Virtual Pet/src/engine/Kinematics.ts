// Spring kinematics for squash-and-stretch deformation
export class Spring {
  public value: number;
  public target: number;
  public velocity: number = 0;
  public stiffness: number;
  public damping: number;

  constructor(initial = 1, stiffness = 160, damping = 12) {
    this.value = initial;
    this.target = initial;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  public update(dt: number) {
    const clampedDt = Math.min(dt, 0.05); // prevent exploding steps
    const force = -this.stiffness * (this.value - this.target);
    const dampingForce = -this.damping * this.velocity;
    const accel = force + dampingForce;

    this.velocity += accel * clampedDt;
    this.value += this.velocity * clampedDt;
  }

  public impulse(amount: number) {
    this.velocity += amount;
  }

  public setTarget(target: number) {
    this.target = target;
  }
}

export class SquashAndStretch {
  public scaleX: Spring;
  public scaleY: Spring;
  public rotation: Spring;

  constructor() {
    this.scaleX = new Spring(1, 190, 14);
    this.scaleY = new Spring(1, 190, 14);
    this.rotation = new Spring(0, 140, 12);
  }

  public update(dt: number) {
    this.scaleX.update(dt);
    this.scaleY.update(dt);
    this.rotation.update(dt);
  }

  // Squish down (e.g. landing jump, receiving pet)
  public squish(intensity = 0.35) {
    this.scaleY.impulse(-intensity * 12);
    this.scaleX.impulse(intensity * 10);
  }

  // Stretch tall (e.g. jumping up, leaping for food)
  public stretch(intensity = 0.35) {
    this.scaleY.impulse(intensity * 12);
    this.scaleX.impulse(-intensity * 10);
  }

  // Wiggle rotation (e.g. joy, chewing)
  public wobble(amount = 0.2) {
    this.rotation.impulse((Math.random() > 0.5 ? 1 : -1) * amount * 10);
  }
}
