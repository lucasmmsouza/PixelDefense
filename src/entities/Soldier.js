import { Entity } from './Entity.js';
import { getDistance } from '../utils/math.js';

export class Soldier extends Entity {
  constructor(x, y, parentTower) {
    super(x, y);
    this.renderType = 'SOLDIER';
    this.hp = 38;
    this.maxHp = 38;
    this.damage = 3.8;
    this.parentTower = parentTower;

    // Offset aleatório para não ficarem empilhados
    this.offsetX = (Math.random() - 0.5) * 20;
    this.offsetY = (Math.random() - 0.5) * 20;

    this.isFighting = false;
    this.fightTarget = null;
    this.attackCooldown = 0;
  }

  update(dt, gameState) {
    if (!this.isFighting && this.hp < this.maxHp) {
      this.hp += 0.05; // Regeneração
    }

    // Lógica de Engajamento
    if (!this.isFighting) {
      this.checkForEnemies(gameState.enemies);
      this.moveToRallyPoint();
    } else {
      this.handleCombat(dt);
    }
  }

  moveToRallyPoint() {
    const targetX = this.parentTower.rallyPoint.x + this.offsetX;
    const targetY = this.parentTower.rallyPoint.y + this.offsetY;

    const dist = getDistance(this.x, this.y, targetX, targetY);
    if (dist > 5) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      this.x += (dx / dist) * 1.0;
      this.y += (dy / dist) * 1.0;
    }
  }

  checkForEnemies(enemies) {
    for (let e of enemies) {
      if (e.markedForDeletion || e.isFighting) continue;
      if (getDistance(this.x, this.y, e.x, e.y) < 20) {
        this.engage(e);
        break;
      }
    }
  }

  engage(enemy) {
    this.isFighting = true;
    this.fightTarget = enemy;
    enemy.isFighting = true;
    enemy.fightTarget = this;
  }

  handleCombat(dt) {
    if (!this.fightTarget || this.fightTarget.markedForDeletion) {
      this.disengage();
      return;
    }

    this.attackCooldown -= dt;
    if (this.attackCooldown <= 0) {
      this.fightTarget.takeDamage(this.damage);
      this.attackCooldown = 1000;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) this.markedForDeletion = true;
  }

  disengage() {
    this.isFighting = false;
    if (this.fightTarget) {
      this.fightTarget.isFighting = false;
      this.fightTarget.fightTarget = null;
      this.fightTarget = null;
    }
  }
}
