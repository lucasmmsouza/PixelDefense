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
    this.reset();
    this.wavesData = levelData.waves;
    // CORREÇÃO: Timer zerado para não iniciar sozinho. Requer ação do jogador.
    this.autoStartTimer = 0;
  }

  update(dt) {
    if (this.activeWave) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        if (this.waveQueue.length > 0) {
          const enemyKey = this.waveQueue.shift();
          this.game.spawnEnemy(ENEMY_TYPES[enemyKey]);
          this.spawnTimer = 1000;
        } else {
          this.activeWave = false;
          this.waveIndex++;

          if (this.waveIndex < this.wavesData.length) {
            this.autoStartTimer = 15000;
          }
        }
      }
    } else {
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

    if (this.autoStartTimer > 0) {
      this.game.addGold(Math.floor(this.autoStartTimer / 1000) * 2);
    }

    this.waveQueue = [...this.wavesData[this.waveIndex]];
    this.activeWave = true;
    this.spawnTimer = 0;
    this.autoStartTimer = 0;
  }

  isLevelComplete() {
    return !this.activeWave && this.waveIndex >= this.wavesData.length;
  }
}
