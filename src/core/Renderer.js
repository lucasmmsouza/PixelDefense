export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear() {
    this.ctx.fillStyle = '#5da130';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawMap(levelData) {
    const ctx = this.ctx;
    if (!levelData) return;
    const path = levelData.path;

    // Desenha Caminho
    ctx.beginPath();
    ctx.strokeStyle = '#e6c589';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (path.length > 0) {
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
    }
    ctx.stroke();

    // Desenha Spots
    for (let spot of levelData.spots) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawEntities(entities) {
    // Ordena para desenhar quem está mais "embaixo" na tela depois (efeito de profundidade)
    entities.sort((a, b) => a.y - b.y);

    for (const e of entities) {
      this.ctx.save();
      switch (e.renderType) {
        case 'ENEMY': this.drawEnemy(e); break;
        case 'TOWER': this.drawTower(e); break;
        case 'PROJECTILE': this.drawProjectile(e); break;
        case 'SOLDIER': this.drawSoldier(e); break;
      }
      this.ctx.restore();
    }
  }

  drawEnemy(e) {
    const ctx = this.ctx;
    ctx.fillStyle = e.stats.color;

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.stats.radius, 0, Math.PI*2);
    ctx.fill();

    this.drawHealthBar(e.x, e.y - 15, e.hp, e.maxHp, 20);
  }

  drawTower(t) {
    const ctx = this.ctx;
    // Base
    ctx.fillStyle = '#5e412f';
    ctx.fillRect(t.x - 12, t.y - 10, 24, 20);

    // Topo (cor específica)
    ctx.fillStyle = t.stats.color;
    ctx.fillRect(t.x - 10, t.y - 25, 20, 20);

    // Se quiser desenhar o ícone/emoji no canvas em vez de retângulo:
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.stats.icon, t.x, t.y - 15);
  }

  drawSoldier(s) {
    this.ctx.fillStyle = '#3498db';
    this.ctx.fillRect(s.x - 4, s.y - 8, 8, 10);
    this.drawHealthBar(s.x, s.y - 12, s.hp, s.maxHp, 10);
  }

  drawProjectile(p) {
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
    this.ctx.fill();
  }

  drawHealthBar(x, y, current, max, width) {
    const pct = Math.max(0, current / max);
    this.ctx.fillStyle = '#c0392b';
    this.ctx.fillRect(x - width/2, y, width, 4);
    this.ctx.fillStyle = '#2ecc71';
    this.ctx.fillRect(x - width/2, y, width * pct, 4);
  }

  // --- CORREÇÃO DO CÍRCULO DE RANGE ---
  drawSelection(entity) {
    if (!entity) return;

    this.ctx.save(); // Salva estado anterior

    let r = 20;
    if (entity.renderType === 'TOWER') r = entity.stats.range;
    else if (entity.renderType === 'ENEMY') r = 25;

    this.ctx.beginPath(); // INÍCIO IMPORTANTE
    this.ctx.arc(entity.x, entity.y, r, 0, Math.PI*2);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Linha do Quartel para o ponto de reunião
    if (entity.renderType === 'TOWER' && entity.stats.type === 'barracks') {
      this.ctx.beginPath();
      this.ctx.moveTo(entity.x, entity.y);
      this.ctx.lineTo(entity.rallyPoint.x, entity.rallyPoint.y);
      this.ctx.strokeStyle = '#fff';
      this.ctx.setLineDash([5, 5]); // Linha pontilhada estilosa
      this.ctx.stroke();
      this.ctx.setLineDash([]); // Reseta

      // Desenha o ponto final
      this.ctx.beginPath();
      this.ctx.arc(entity.rallyPoint.x, entity.rallyPoint.y, 5, 0, Math.PI*2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();
    }

    this.ctx.restore(); // Restaura estado
  }
}
