import { TOWER_TYPES } from '../data/towers.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.els = {
      lives: document.getElementById('lives-display'),
      gold: document.getElementById('gold-display'),
      level: document.getElementById('level-display'),
      wave: document.getElementById('wave-display'),
      timer: document.getElementById('timer-display'),
      buildMenu: document.getElementById('build-menu'),
      startWaveBtn: document.getElementById('start-wave-btn'),
      screens: document.getElementById('screens'),
      infoPanel: document.getElementById('info-panel'),
      infoContent: document.getElementById('info-content'),
      infoTitle: document.getElementById('info-title'),
      pauseMenu: document.getElementById('pause-menu'),
      // Botões
      pauseBtn: document.getElementById('btn-pause'),
      restartMapBtn: document.getElementById('btn-restart-map'), // Botão da barra superior
      resumeBtn: document.getElementById('btn-resume'),
      menuBtn: document.getElementById('btn-menu-principal')
    };

    this.bindEvents();
  }

  bindEvents() {
    // Botões de Tela Cheia
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if(el) el.onclick = fn;
    };

    bind('btn-start-game', () => this.game.startLevel(1));
    bind('btn-retry', () => this.game.startLevel(this.game.state.levelIndex + 1)); // Reinicia mesmo nível
    bind('btn-next-level', () => this.game.startLevel(this.game.state.levelIndex + 2)); // Próximo

    // Botões In-Game
    if (this.els.pauseBtn) this.els.pauseBtn.onclick = () => this.togglePauseMenu();
    if (this.els.restartMapBtn) this.els.restartMapBtn.onclick = () => this.game.startLevel(this.game.state.levelIndex + 1);

    // Menu de Pause
    if (this.els.resumeBtn) this.els.resumeBtn.onclick = () => this.togglePauseMenu();
    if (this.els.menuBtn) this.els.menuBtn.onclick = () => window.location.reload(); // Simples refresh para menu

    // Botão Iniciar Onda
    this.els.startWaveBtn.onclick = () => {
      this.game.waveManager.startNextWave();
      // Esconde imediatamente ao clicar
      this.els.startWaveBtn.classList.add('hidden');
    };
  }

  togglePauseMenu() {
    this.game.togglePause();
    if (this.game.state.isPaused) {
      this.els.pauseMenu.classList.remove('hidden');
    } else {
      this.els.pauseMenu.classList.add('hidden');
    }
  }

  updateHUD(state) {
    this.els.lives.innerText = state.lives;
    this.els.gold.innerText = state.gold;
    this.els.level.innerText = state.levelIndex + 1;

    // Atualiza botões de construção (dinheiro)
    const buttons = document.querySelectorAll('.build-btn');
    buttons.forEach(btn => {
      const cost = parseInt(btn.dataset.cost);
      if (state.gold < cost) btn.classList.add('disabled');
      else btn.classList.remove('disabled');
    });
  }

  updateWaveInfo(current, total, timer, isActive) {
    this.els.wave.innerText = `${current}/${total}`;

    if (timer > 0) {
      this.els.timer.innerText = `(${Math.ceil(timer/1000)}s)`;
    } else {
      this.els.timer.innerText = '';
    }

    // LÓGICA DO BOTÃO INICIAR ONDA
    // Se não tem onda ativa E ainda restam ondas no nível
    if (!isActive && current < total) {
      this.els.startWaveBtn.classList.remove('hidden');
    } else {
      this.els.startWaveBtn.classList.add('hidden');
    }
  }

  // === MOSTRAR/ESCONDER PAINEL DE INFO ===

  showEntityInfo(entity) {
    this.els.infoPanel.classList.remove('hidden');

    // Injeção de HTML para formatar igual ao original
    if(entity.renderType === 'TOWER') {
      this.els.infoTitle.innerText = entity.stats.name;

      let rows = `
                <div class="info-row"><span>Dano ⚔️:</span> <span style="color:#f39c12">${entity.stats.damage}</span></div>
                <div class="info-row"><span>Alcance 🎯:</span> <span style="color:#f39c12">${this.getRangeText(entity.stats.range)}</span></div>
            `;

      if (entity.stats.type !== 'barracks') {
        rows += `<div class="info-row"><span>Taxa ⏳:</span> <span style="color:#f39c12">${this.getRateText(entity.stats.rate)}</span></div>`;
      } else {
        rows += `<div class="info-row"><span>Unidades:</span> <span style="color:#f39c12">3 Soldados</span></div>`;
      }

      this.els.infoContent.innerHTML = rows;

    } else if (entity.renderType === 'ENEMY') {
      this.els.infoTitle.innerText = entity.stats.name;
      this.els.infoContent.innerHTML = `
                <div class="info-row"><span>Vida ❤:</span> <span style="color:#e74c3c">${Math.ceil(entity.hp)}/${entity.maxHp}</span></div>
                <div class="info-row"><span>Velocidade 👞:</span> <span style="color:#f39c12">${entity.stats.speed}</span></div>
             `;
    }
  }

  hideEntityInfo() {
    this.els.infoPanel.classList.add('hidden');
  }

  // Helpers de texto
  getRangeText(val) {
    if (val < 100) return 'Curto';
    if (val < 130) return 'Médio';
    return 'Longo';
  }

  getRateText(ms) {
    if (ms < 800) return 'Rápido';
    if (ms < 1500) return 'Médio';
    return 'Lento';
  }

  // === BUILD MENU ===

  showBuildMenu(x, y, onSelect) {
    const menu = this.els.buildMenu;
    menu.innerHTML = '';
    menu.classList.remove('hidden');

    // Posiciona centralizado no clique
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    Object.values(TOWER_TYPES).forEach(type => {
      const btn = document.createElement('div');
      // Adiciona classe de cor específica (ex: btn-ARCHER)
      btn.className = `build-btn btn-${type.id}`;
      btn.dataset.cost = type.cost;

      // HTML Interno do botão
      btn.innerHTML = `
                <div class="icon">${type.icon}</div>
                <div class="price">$${type.cost}</div>
            `;

      btn.onclick = (e) => {
        e.stopPropagation();
        onSelect(type.id);
      };
      menu.appendChild(btn);
    });
  }

  hideBuildMenu() {
    this.els.buildMenu.classList.add('hidden');
  }

  showScreen(id) {
    this.els.screens.classList.remove('hidden');
    Array.from(this.els.screens.children).forEach(c => c.classList.add('hidden'));
    const screen = document.getElementById(id);
    if(screen) screen.classList.remove('hidden');
  }

  hideScreens() {
    this.els.screens.classList.add('hidden');
  }
}
