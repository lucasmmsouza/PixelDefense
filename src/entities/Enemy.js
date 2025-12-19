import { Entity } from './Entity.js';
import { getDistance } from '../utils/math.js';

export class Enemy extends Entity {
  constructor(config, path) {
    super(path[0].x, path[0].y);
    this.renderType = 'ENEMY';

    // Copiar dados da config para evitar mutação da referência
    this.stats = { ...config };
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.currentSpeed = this.stats.speed;

    this.path = path;
    this.waypointIndex = 1;
    this.slowTimer = 0;

    this.isFighting = false;
    this.fightTarget = null;
    this.attackCooldown = 0;
  }

  update(dt, gameState) {
    if (this.hp <= 0) {
      this.die(gameState);
      return;
    }

    this.handleSlow(dt);

    if (this.isFighting) {
      this.handleCombat(dt);
    } else {
      this.move(dt, gameState);
    }
  }

  handleSlow(dt) {
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.currentSpeed = this.stats.speed;
    }
  }

  handleCombat(dt) {
    if (!this.fightTarget || this.fightTarget.markedForDeletion) {
      this.isFighting = false;
      this.fightTarget = null;
      return;
    }

    this.attackCooldown -= dt;
    if (this.attackCooldown <= 0) {
      this.fightTarget.takeDamage(10); // Dano fixo contra soldados por enquanto
      this.attackCooldown = 1000;
    }
  }

  move(dt, gameState) {
    const target = this.path[this.waypointIndex];
    const dist = getDistance(this.x, this.y, target.x, target.y);

    if (dist < this.currentSpeed) {
      this.x = target.x;
      this.y = target.y;
      this.waypointIndex++;
      if (this.waypointIndex >= this.path.length) {
        gameState.takeLife(this.stats.damage);
        this.markedForDeletion = true;
      }
    } else {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      this.x += (dx / dist) * this.currentSpeed;
      this.y += (dy / dist) * this.currentSpeed;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
  }

  applySlow(factor, duration) {
    this.currentSpeed = this.stats.speed * (1 - factor);
    this.slowTimer = duration;
  }

  die(gameState) {
    gameState.addGold(this.stats.gold);
    this.markedForDeletion = true;
  }
}
