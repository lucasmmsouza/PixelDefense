export class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.markedForDeletion = false;
    this.renderType = 'GENERIC'; // Usado pelo Renderer
  }

  update(dt, gameState) {
    // Implementado nas classes filhas
  }
}
