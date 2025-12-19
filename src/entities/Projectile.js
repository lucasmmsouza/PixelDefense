import { Entity } from './Entity.js';
import { getDistance } from '../utils/math.js';

export class Projectile extends Entity {
  constructor(x, y, target, stats) {
    super(x, y);
    this.renderType = 'PROJECTILE';
    this.target = target;
    this.stats = stats;
    this.speed = 5; // Pixels por frame, pode ser ajustado para delta time
  }

  update(dt, gameState) {
    if (this.markedForDeletion) return;

    if (this.stats.type !== 'area' && (this.target.markedForDeletion || this.target.hp <= 0)) {
      this.markedForDeletion = true;
      return;
    }

    const dist = getDistance(this.x, this.y, this.target.x, this.target.y);

    const moveStep = this.speed * (dt / 16);

    if (dist < moveStep) {
      this.hit(gameState);
    } else {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.x += (dx / dist) * moveStep;
      this.y += (dy / dist) * moveStep;
    }
  }

  hit(gameState) {
    this.markedForDeletion = true;

    if (this.stats.type === 'area') {
      // Dano em área
      gameState.enemies.forEach(e => {
        if (getDistance(e.x, e.y, this.x, this.y) <= this.stats.aoe) {
          e.takeDamage(this.stats.damage);
        }
      });
      // Aqui você poderia pedir ao Renderer criar uma explosão visual
    } else {
      // Dano único
      this.target.takeDamage(this.stats.damage);
      if (this.stats.type === 'magic') {
        this.target.applySlow(this.stats.slowFactor, this.stats.slowDuration);
      }
    }
  }
}
