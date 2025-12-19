// Mapas de Sprites (0 = transparente, outras letras = cores)
const SPRITES_MAP = {
  ARCHER: [
    "   ooo  ",
    "  ooooo ",
    "  ofofo ",
    "  ooooo ",
    "   bbb  ",
    "  bbbbb ",
    "  b b b "
  ],
  MAGE: [
    "   pp   ",
    "  pppp  ",
    " pppppp ",
    "  fff   ",
    "  www   ",
    "  mmm   ",
    "  m m   "
  ],
  BOMB: [
    "        ",
    "   kk   ",
    "  kkkk  ",
    " kkkkkk ",
    "kkkkkkkk",
    " s s s  ",
    "s s s s "
  ],
  BARRACKS: [
    "   rr   ",
    "  rrrr  ",
    " rrrrrr ",
    " cccccc ",
    " c cc c ",
    " c cc c ",
    " cccccc "
  ],
  NORMAL: [
    "  gggg  ",
    " gggggg ",
    " grggrg ",
    " gggggg ",
    "  gggg  ",
    "  g  g  "
  ],
  FAST: [
    "        ",
    "   yy   ",
    "  yyyyy ",
    " yyyyyyy",
    " y y y  ",
    " y y y  "
  ],
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

const PALETTE = {
  'o': '#d35400',
  'f': '#ffccaa',
  'b': '#8d6e63',
  'p': '#8e44ad',
  'w': '#ffffff',
  'm': '#5e35b1',
  'k': '#2c3e50',
  's': '#95a5a6',
  'r': '#c0392b',
  'c': '#7f8c8d',
  'g': '#27ae60',
  'y': '#f1c40f',
  'a': '#3498db',
};

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.spriteCache = {};
    this.generateAllSprites();
  }

  generateAllSprites() {
    Object.keys(SPRITES_MAP).forEach(key => {
      this.spriteCache[key] = this.createSpriteFromMap(SPRITES_MAP[key]);
    });
  }

  createSpriteFromMap(map) {
    const size = 4;
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

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 44;
    this.tracePath(ctx, levelData.path);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#e6c589';
    ctx.lineWidth = 36;
    this.tracePath(ctx, levelData.path);
    ctx.stroke();

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

      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(e.x, e.y + 2, 10, 5, 0, 0, Math.PI*2);
      this.ctx.fill();

      let spriteKey = '';
      if (e.renderType === 'TOWER') spriteKey = e.stats.id;
      else if (e.renderType === 'ENEMY') spriteKey = e.stats.id;
      else if (e.renderType === 'SOLDIER') spriteKey = 'SOLDIER';

      const img = this.spriteCache[spriteKey];
      if (img) {
        this.ctx.drawImage(img, e.x - img.width/2, e.y - img.height + 4);
      } else {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(e.x-5, e.y-10, 10, 10);
      }

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

    // CORREÇÃO: Reseta a largura da linha
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.arc(entity.x, entity.y, r, 0, Math.PI*2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.setLineDash([5, 5]);
    this.ctx.stroke();

    if (entity.renderType === 'TOWER' && entity.stats.type === 'barracks') {
      this.ctx.beginPath();
      this.ctx.moveTo(entity.x, entity.y);
      this.ctx.lineTo(entity.rallyPoint.x, entity.rallyPoint.y);
      this.ctx.strokeStyle = '#fff';
      this.ctx.setLineDash([]); // Linha sólida para o rally
      this.ctx.stroke();

      this.ctx.fillStyle = '#f1c40f';
      this.ctx.fillRect(entity.rallyPoint.x - 2, entity.rallyPoint.y - 10, 4, 6);
    }

    this.ctx.restore();
  }
}
