import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { Soldier } from './Soldier.js';
import { getClosestPointOnPath, getDistance } from '../utils/math.js';

export class Tower extends Entity {
  constructor(config, x, y, levelPath) {
    super(x, y);
    this.renderType = 'TOWER';
    this.stats = config;
    this.cooldown = 0;
    this.levelPath = levelPath; // Necessário para quartéis

    if (this.stats.type === 'barracks') {
      this.soldiers = [];
      this.spawnTimer = 0;
      // Ponto inicial de rally é o ponto mais próximo no caminho
      this.rallyPoint = getClosestPointOnPath(this.x, this.y, levelPath);
    }
  }

  update(dt, gameState) {
    this.cooldown -= dt;

    if (this.stats.type === 'barracks') {
      this.handleBarracks(dt, gameState);
    } else {
      if (this.cooldown <= 0) {
        const target = this.findTarget(gameState.enemies);
        if (target) {
          this.shoot(target, gameState);
          this.cooldown = this.stats.rate;
        }
      }
    }
  }

  handleBarracks(dt, gameState) {
    this.soldiers = this.soldiers.filter(s => !s.markedForDeletion);
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0 && this.soldiers.length < 3) {
      const s = new Soldier(this.x, this.y, this);
      this.soldiers.push(s);
      gameState.addEntity(s); // Adiciona à lista global
      this.spawnTimer = this.stats.respawnRate;
    }
  }

  setRallyPoint(x, y) {
    if (this.stats.type !== 'barracks') return;
    this.rallyPoint = getClosestPointOnPath(x, y, this.levelPath);
    this.soldiers.forEach(s => s.disengage());
  }

  findTarget(enemies) {
    let closest = null;
    let minDst = Infinity;

    for (const enemy of enemies) {
      const dist = getDistance(this.x, this.y, enemy.x, enemy.y);
      if (dist <= this.stats.range && dist < minDst) {
        minDst = dist;
        closest = enemy;
      }
    }
    return closest;
  }

  shoot(target, gameState) {
    gameState.addEntity(new Projectile(this.x, this.y - 10, target, this.stats));
  }
}
