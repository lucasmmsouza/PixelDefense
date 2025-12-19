import { ENEMY_TYPES } from '../data/enemies.js';

export class WaveManager {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.waveIndex = 0;
    this.wavesData = [];
    this.activeWave = false;
    this.waveQueue = [];
    this.spawnTimer = 0;
    this.autoStartTimer = 0;
  }

  loadLevel(levelData) {
    this.wavesData = levelData.waves;
    this.reset();
    this.autoStartTimer = 5000; // Tempo antes da primeira onda
  }

  update(dt) {
    if (this.activeWave) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        if (this.waveQueue.length > 0) {
          const enemyKey = this.waveQueue.shift();
          this.game.spawnEnemy(ENEMY_TYPES[enemyKey]);
          this.spawnTimer = 1000; // Delay entre inimigos
        } else {
          this.activeWave = false;
          this.waveIndex++;

          if (this.waveIndex < this.wavesData.length) {
            this.autoStartTimer = 15000; // Tempo entre ondas
          } else {
            // Fim das ondas
            this.game.checkVictoryCondition();
          }
        }
      }
    } else {
      // Contagem regressiva
      if (this.autoStartTimer > 0 && this.waveIndex < this.wavesData.length) {
        this.autoStartTimer -= dt;
        if (this.autoStartTimer <= 0) {
          this.startNextWave();
        }
      }
    }
  }

  startNextWave() {
    if (this.activeWave || this.waveIndex >= this.wavesData.length) return;

    // Bonus de ouro se adiantar onda
    if (this.autoStartTimer > 0) {
      this.game.addGold(Math.floor(this.autoStartTimer / 1000) * 2);
    }

    this.waveQueue = [...this.wavesData[this.waveIndex]];
    this.activeWave = true;
    this.spawnTimer = 0;
    this.autoStartTimer = 0;
  }
}
