// Mapas de Sprites (0 = transparente, outras letras = cores)
const SPRITES_MAP = {
  // Arqueiro: Capuz marrom, rosto pele, arco madeira
  ARCHER: [
    "   ooo  ",
    "  ooooo ",
    "  ofofo ",
    "  ooooo ",
    "   bbb  ",
    "  bbbbb ",
    "  b b b "
  ],
  // Mago: Chapéu roxo, barba branca
  MAGE: [
    "   pp   ",
    "  pppp  ",
    " pppppp ",
    "  fff   ",
    "  www   ",
    "  mmm   ",
    "  m m   "
  ],
  // Canhão: Preto e cinza, rodas
  BOMB: [
    "        ",
    "   kk   ",
    "  kkkk  ",
    " kkkkkk ",
    "kkkkkkkk",
    " s s s  ",
    "s s s s "
  ],
  // Quartel: Telhado vermelho, paredes pedra
  BARRACKS: [
    "   rr   ",
    "  rrrr  ",
    " rrrrrr ",
    " cccccc ",
    " c cc c ",
    " c cc c ",
    " cccccc "
  ],
  // Orc: Pele verde, olhos vermelhos
  NORMAL: [
    "  gggg  ",
    " gggggg ",
    " grggrg ",
    " gggggg ",
    "  gggg  ",
    "  g  g  "
  ],
  // Lobo: Amarelo/Laranja, rápido
  FAST: [
    "        ",
    "   yy   ",
    "  yyyyy ",
    " yyyyyyy",
    " y y y  ",
    " y y y  "
  ],
  // Ogro: Grande, vermelho
  TANK: [
    "  rrrr  ",
    " rrrrrr ",
    " ryrryr ",
    " rrrrrr ",
    " rrrrrr ",
    "  rr rr "
  ],
  SOLDIER: [
    "  aaaa  ",
    "  aaaa  ",
    "  aaaa  ",
    "   aa   "
  ]
};

// Paleta de Cores para os caracteres
const PALETTE = {
  'o': '#d35400', // Marrom Arqueiro
  'f': '#ffccaa', // Pele
  'b': '#8d6e63', // Roupa Arqueiro
  'p': '#8e44ad', // Roxo Mago
  'w': '#ffffff', // Barba
  'm': '#5e35b1', // Manto Mago
  'k': '#2c3e50', // Metal Canhão
  's': '#95a5a6', // Rodas
  'r': '#c0392b', // Vermelho (Telhado/Ogro)
  'c': '#7f8c8d', // Pedra
  'g': '#27ae60', // Verde Orc
  'y': '#f1c40f', // Amarelo Lobo
  'a': '#3498db', // Azul Soldado
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Cache de sprites gerados
    this.spriteCache = {};
    this.generateAllSprites();
  }

  generateAllSprites() {
    Object.keys(SPRITES_MAP).forEach(key => {
      this.spriteCache[key] = this.createSpriteFromMap(SPRITES_MAP[key]);
    });
  }

  createSpriteFromMap(map) {
    const size = 4; // Tamanho de cada "pixel" do sprite
    const rows = map.length;
    const cols = map[0].length;

    const c = document.createElement('canvas');
    c.width = cols * size;
    c.height = rows * size;
    const x = c.getContext('2d');

    for(let i=0; i<rows; i++) {
      for(let j=0; j<cols; j++) {
        const char = map[i][j];
        if (PALETTE[char]) {
          x.fillStyle = PALETTE[char];
          x.fillRect(j * size, i * size, size, size);
        }
      }
    }
    return c;
  }

  clear() {
    this.ctx.fillStyle = '#5da130';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawMap(levelData) {
    const ctx = this.ctx;
    if (!levelData) return;

    // Desenha Estrada
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Borda
    ctx.beginPath();
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 44;
    this.tracePath(ctx, levelData.path);
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.strokeStyle = '#e6c589';
    ctx.lineWidth = 36;
    this.tracePath(ctx, levelData.path);
    ctx.stroke();

    // Spots
    for (let spot of levelData.spots) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  tracePath(ctx, path) {
    if (path.length === 0) return;
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
  }

  drawEntities(entities) {
    entities.sort((a, b) => a.y - b.y);

    for (const e of entities) {
      if (e.renderType === 'PROJECTILE') {
        this.drawProjectile(e);
        continue;
      }

      this.ctx.save();

      // Sombra
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(e.x, e.y + 2, 10, 5, 0, 0, Math.PI*2);
      this.ctx.fill();

      // Sprite
      let spriteKey = '';
      if (e.renderType === 'TOWER') spriteKey = e.stats.id;
      else if (e.renderType === 'ENEMY') spriteKey = e.stats.id;
      else if (e.renderType === 'SOLDIER') spriteKey = 'SOLDIER';

      const img = this.spriteCache[spriteKey];
      if (img) {
        // Desenha centralizado
        this.ctx.drawImage(img, e.x - img.width/2, e.y - img.height + 4);
      } else {
        // Fallback
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(e.x-5, e.y-10, 10, 10);
      }

      // Barra de vida (para inimigos e soldados)
      if (e.renderType === 'ENEMY' || e.renderType === 'SOLDIER') {
        this.drawHealthBar(e.x, e.y - 25, e.hp, e.maxHp, 20);
      }

      this.ctx.restore();
    }
  }

  drawProjectile(p) {
    this.ctx.fillStyle = '#2c3e50';
    if(p.stats.type === 'magic') this.ctx.fillStyle = '#8e44ad';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
    this.ctx.fill();
  }

  drawHealthBar(x, y, current, max, width) {
    if (current >= max) return;
    const pct = Math.max(0, current / max);
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(x - width/2, y, width, 4);
    this.ctx.fillStyle = '#2ecc71';
    this.ctx.fillRect(x - width/2, y, width * pct, 4);
  }

  drawSelection(entity) {
    if (!entity) return;
    this.ctx.save();

    let r = entity.renderType === 'ENEMY' ? 25 : entity.stats.range;

    this.ctx.beginPath();
    this.ctx.arc(entity.x, entity.y, r, 0, Math.PI*2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke();

    // Linha de Rally do Quartel
    if (entity.renderType === 'TOWER' && entity.stats.type === 'barracks') {
      this.ctx.beginPath();
      this.ctx.moveTo(entity.x, entity.y);
      this.ctx.lineTo(entity.rallyPoint.x, entity.rallyPoint.y);
      this.ctx.strokeStyle = '#fff';
      this.ctx.stroke();

      // Bandeira no destino
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.fillRect(entity.rallyPoint.x - 2, entity.rallyPoint.y - 10, 4, 6);
      this.ctx.beginPath();
      this.ctx.moveTo(entity.rallyPoint.x, entity.rallyPoint.y - 4);
      this.ctx.lineTo(entity.rallyPoint.x, entity.rallyPoint.y);
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}
