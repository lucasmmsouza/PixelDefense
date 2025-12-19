import { Renderer } from './Renderer.js';
import { Input } from './Input.js';
import { WaveManager } from './WaveManager.js';
import { UIManager } from '../ui/UIManager.js';
import { LEVELS } from '../data/levels.js';
import { TOWER_TYPES } from '../data/towers.js';
import { Tower } from '../entities/Tower.js';
import { Enemy } from '../entities/Enemy.js';
import { getDistance } from '../utils/math.js';

export class Game {
  constructor() {
    const canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas, this);
    this.ui = new UIManager(this);
    this.waveManager = new WaveManager(this);

    this.entities = [];
    this.towers = [];
    this.enemies = [];

    this.state = {
      gold: 200,
      lives: 5,
      levelIndex: 0,
      isPaused: true
    };

    this.levelData = null;
    this.selectedSpot = null;
    this.selectedEntity = null;
  }

  startLevel(levelIndex) {
    this.state.levelIndex = levelIndex - 1;
    this.levelData = LEVELS[this.state.levelIndex];

    if(!this.levelData) {
      alert("Você venceu o jogo!");
      return;
    }

    this.resetGame();
    this.ui.hideScreens();
    this.ui.updateHUD(this.state);
    this.waveManager.loadLevel(this.levelData);

    this.state.isPaused = false;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  resetGame() {
    this.entities = [];
    this.towers = [];
    this.enemies = [];
    this.state.gold = 200;
    this.state.lives = 5;
    this.selectedSpot = null;
    this.selectedEntity = null;
  }

  loop(timestamp) {
    if (this.state.isPaused) return;

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.waveManager.update(dt);

    this.ui.updateWaveInfo(
      this.waveManager.waveIndex,
      this.levelData.waves.length,
      this.waveManager.autoStartTimer,
      this.waveManager.activeWave
    );

    [...this.towers, ...this.entities].forEach(e => e.update(dt, this));

    // Limpeza de entidades mortas
    this.entities = this.entities.filter(e => !e.markedForDeletion);
    this.enemies = this.entities.filter(e => e.renderType === 'ENEMY');

    // === CORREÇÃO: Verificação de Vitória ===
    // Se não há mais ondas para vir E não há inimigos vivos
    if (this.waveManager.isLevelComplete() && this.enemies.length === 0) {
      this.checkVictoryCondition();
    }

    // Game Over
    if (this.state.lives <= 0) {
      this.state.isPaused = true;
      this.ui.showScreen('game-over-screen');
    }
  }

  draw() {
    this.renderer.clear();
    this.renderer.drawMap(this.levelData);
    this.renderer.drawEntities([...this.towers, ...this.entities]);
    this.renderer.drawSelection(this.selectedEntity);
  }

  spawnEnemy(config) {
    const enemy = new Enemy(config, this.levelData.path);
    this.addEntity(enemy);
  }

  addEntity(entity) {
    this.entities.push(entity);
    if (entity.renderType === 'ENEMY') {
      // Pequeno hack para manter a lista de enemies atualizada rapidamente
      // (embora o update() vá corrigir isso no próximo frame)
    }
  }

  addGold(amount) {
    this.state.gold += amount;
    this.ui.updateHUD(this.state);
  }

  takeLife(amount) {
    this.state.lives -= amount;
    this.ui.updateHUD(this.state);
  }

  checkVictoryCondition() {
    this.state.isPaused = true;
    this.ui.showScreen('victory-screen');
  }

  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    if (!this.state.isPaused) {
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  handleInput(x, y, screenX, screenY) {
    const clickedEntity = [...this.towers, ...this.enemies].find(e => {
      const r = e.renderType === 'ENEMY' ? 20 : 15;
      return getDistance(x, y, e.x, e.y) < r;
    });

    if (clickedEntity) {
      this.selectedEntity = clickedEntity;
      this.ui.hideBuildMenu();
      this.ui.showEntityInfo(clickedEntity);
      return;
    }

    if (this.selectedEntity && this.selectedEntity.renderType === 'TOWER' && this.selectedEntity.stats.type === 'barracks') {
      if (getDistance(x, y, this.selectedEntity.x, this.selectedEntity.y) < this.selectedEntity.stats.range) {
        this.selectedEntity.setRallyPoint(x, y);
        return;
      }
    }

    this.selectedEntity = null;
    this.ui.hideEntityInfo();

    const clickedSpot = this.levelData.spots.find(s => {
      const occupied = this.towers.some(t => getDistance(t.x, t.y, s.x, s.y) < 5);
      return !occupied && getDistance(x, y, s.x, s.y) < 20;
    });

    if (clickedSpot) {
      this.selectedSpot = clickedSpot;
      this.ui.showBuildMenu(screenX, screenY, (typeId) => this.buildTower(typeId));
    } else {
      this.ui.hideBuildMenu();
      this.selectedSpot = null;
    }
  }

  buildTower(typeId) {
    const stats = TOWER_TYPES[typeId];
    if (this.state.gold >= stats.cost && this.selectedSpot) {
      this.addGold(-stats.cost);
      const tower = new Tower(stats, this.selectedSpot.x, this.selectedSpot.y, this.levelData.path);
      this.towers.push(tower);
      this.ui.hideBuildMenu();
      this.selectedEntity = tower;
      this.ui.showEntityInfo(tower);
    }
  }
}
