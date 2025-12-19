export class Input {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;

    this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
    // Adicionar touchstart depois se necessário
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Passa coordenadas puras (X, Y) e coordenadas de tela (ScreenX, ScreenY) para UI
    this.game.handleInput(x, y, e.clientX - rect.left, e.clientY - rect.top);
  }
}
