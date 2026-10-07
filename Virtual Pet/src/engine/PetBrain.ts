import type { PetEntity } from '../types/pet';

export type BrainState = 'SLEEPING' | 'IDLE_WANDER' | 'BEGGING' | 'EATING' | 'BATHING' | 'EVOLVING' | 'SICK';

export class PetBrain {
  public currentState: BrainState = 'IDLE_WANDER';
  public stateTimer: number = 0;
  public blinkTimer: number = 2.5;
  public isBlinking: boolean = false;
  public lookDirection: number = 1; // 1 = right, -1 = left
  public mouthOpenAmount: number = 0; // 0.0 (closed) to 1.0 (open wide)

  public update(
    dt: number,
    pet: PetEntity,
    interaction: {
      isFeeding: boolean;
      isScrubbing: boolean;
      isEvolving: boolean;
      cursorDist: number;
      cursorX: number;
      petX: number;
    }
  ) {
    this.stateTimer += dt;

    // Direction facing
    if (interaction.cursorDist < 300) {
      this.lookDirection = interaction.cursorX > interaction.petX ? 1 : -1;
    }

    // Eye Blink logic
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -0.15) {
        this.isBlinking = false;
        this.blinkTimer = 2.0 + Math.random() * 3.5;
      }
    }

    // Determine state
    if (interaction.isEvolving) {
      this.currentState = 'EVOLVING';
      this.mouthOpenAmount = 0.5 + Math.sin(this.stateTimer * 6) * 0.4;
      return;
    }

    if (pet.isSleeping) {
      this.currentState = 'SLEEPING';
      this.mouthOpenAmount = 0;
      return;
    }

    if (pet.mood === 'SICK' || pet.vitals.hygiene < 15 || pet.vitals.hunger < 12) {
      this.currentState = 'SICK';
      this.mouthOpenAmount = 0.1;
      return;
    }

    if (interaction.isScrubbing) {
      this.currentState = 'BATHING';
      this.mouthOpenAmount = 0.4;
      return;
    }

    if (interaction.isFeeding) {
      this.currentState = 'EATING';
      // Mouth opens wide when food is near
      this.mouthOpenAmount = Math.min(1.0, this.mouthOpenAmount + dt * 6);
      return;
    }

    // Mouth closes back smoothly
    this.mouthOpenAmount = Math.max(0, this.mouthOpenAmount - dt * 4);

    if (pet.vitals.hunger < 35) {
      this.currentState = 'BEGGING';
      return;
    }

    this.currentState = 'IDLE_WANDER';
  }
}
