/**
 * Escena de combate: el fondo y las criaturas con sus animaciones.
 * Los textos, la vida y los menús son HTML (interfaz/combateUI.js).
 */
const ANCHO = 160;

const POS = {
  rival: { x: 118, y: 38, escala: 2, flip: false },
  jugador: { x: 42, y: 74, escala: 2.5, flip: true },
};

export class EscenaCombate extends Phaser.Scene {
  constructor() {
    super('combate');
  }

  create() {
    const g = this.add.graphics();
    g.fillStyle(0xf8f8f0);
    g.fillRect(0, 0, ANCHO, 144);
    g.fillStyle(0xd8ecc0);
    g.fillEllipse(POS.rival.x, POS.rival.y + 14, 64, 14);
    g.fillEllipse(POS.jugador.x, POS.jugador.y + 18, 72, 16);
    this.sprites = {};
    this.events.emit('lista');
  }

  /** Pone (o cambia) la criatura de un lado, entrando desde afuera. */
  entrar(lado, especie) {
    return new Promise((listo) => {
      const p = POS[lado];
      if (this.sprites[lado]) this.sprites[lado].destroy();
      const s = this.add.image(lado === 'rival' ? ANCHO + 30 : -30, p.y, `c-${especie}`)
        .setScale(p.escala).setFlipX(p.flip);
      this.sprites[lado] = s;
      this.tweens.add({ targets: s, x: p.x, duration: 350, ease: 'Cubic.easeOut', onComplete: listo });
    });
  }

  /** Parpadeo al recibir un golpe. */
  golpe(lado) {
    return new Promise((listo) => {
      const s = this.sprites[lado];
      if (!s) return listo();
      this.tweens.add({ targets: s, alpha: 0, duration: 70, yoyo: true, repeat: 2, onComplete: listo });
      this.cameras.main.shake(120, 0.01);
    });
  }

  /** La criatura cae y desaparece. */
  debilitar(lado) {
    return new Promise((listo) => {
      const s = this.sprites[lado];
      if (!s) return listo();
      this.tweens.add({ targets: s, y: s.y + 30, alpha: 0, duration: 350, onComplete: listo });
    });
  }

  /** Se lanza una bola: entra, la criatura desaparece, la bola se sacude. */
  bola(sacudidas, atrapada) {
    return new Promise((listo) => {
      const rival = this.sprites.rival;
      const bola = this.add.graphics({ x: 30, y: 100 });
      bola.fillStyle(0xe03030).fillCircle(0, -2, 5).fillStyle(0xf8f8f8).fillCircle(0, 2, 5)
        .fillStyle(0x181818).fillRect(-5, -1, 10, 2).fillStyle(0xf8f8f8).fillCircle(0, 0, 2);
      this.tweens.add({
        targets: bola, x: POS.rival.x, y: POS.rival.y + 8, duration: 400, ease: 'Quad.easeOut',
        onComplete: () => {
          if (rival) rival.setVisible(false);
          const sacudir = (n) => {
            if (n === 0) {
              if (!atrapada && rival) {
                rival.setVisible(true);
                bola.destroy();
              }
              this.time.delayedCall(250, listo);
              return;
            }
            this.tweens.add({ targets: bola, angle: { from: -20, to: 20 }, duration: 120, yoyo: true, onComplete: () => this.time.delayedCall(200, () => sacudir(n - 1)) });
          };
          sacudir(Math.max(1, sacudidas));
        },
      });
    });
  }

  /** Animación de evolución: parpadea entre las dos formas. */
  evolucion(antes, despues) {
    return new Promise((listo) => {
      this.children.removeAll(true);
      this.add.graphics().fillStyle(0x181828).fillRect(0, 0, ANCHO, 144);
      const s = this.add.image(80, 60, `c-${antes}`).setScale(3);
      let n = 0;
      this.time.addEvent({
        delay: 180, repeat: 13,
        callback: () => {
          n++;
          s.setTexture(`c-${n % 2 ? despues : antes}`).setTintFill(n < 13 ? 0xffffff : undefined);
          if (n >= 13) {
            s.clearTint().setTexture(`c-${despues}`);
            this.cameras.main.flash(300, 255, 255, 255);
            this.time.delayedCall(400, listo);
          }
        },
      });
    });
  }
}
