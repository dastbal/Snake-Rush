/**
 * Escena del mundo: dibuja el mapa, las personas y al jugador,
 * y mueve al jugador casilla por casilla.
 * Lo que pasa al llegar a una casilla lo decide el "director" (interfaz/director.js).
 */
import { partida } from '../nucleo/partida.js';
import { mapa, ancho, alto, caminable, buscarCamino, vecinaParaHablar, interactuable, DIRS } from '../nucleo/mundo.js';
import { crearTexturas, LOSETA } from './texturas.js';

const MS_PASO = 160;
/** Si el dedo se mueve más que esto (en píxeles del juego), no cuenta como toque. */
const TOQUE_MAXIMO = 6;

export class EscenaMundo extends Phaser.Scene {
  constructor() {
    super('mundo');
    /** Se asigna desde main.js: { alLlegar(x,y), alHablar(x,y), ocupado() } */
    this.director = null;
    this.camino = [];
    this.caminando = false;
    this.alTerminarCamino = null;
  }

  create() {
    crearTexturas(this);
    this.capa = this.add.container(0, 0);
    this.jugador = this.add.image(0, 0, 'p-jugador-frente').setOrigin(0).setDepth(10);
    this.cameras.main.setRoundPixels(true);
    /** Dirección que mantiene apretada la cruceta en pantalla (o null). */
    this.direccionMando = null;

    // Marcador que muestra a dónde vas al tocar el mapa
    this.marcador = this.add.rectangle(0, 0, LOSETA - 2, LOSETA - 2)
      .setStrokeStyle(2, 0xffffff).setOrigin(0).setDepth(9).setVisible(false);

    // Tocar el mapa: caminar hasta ahí (o ir a hablar con alguien).
    // Se decide al LEVANTAR el dedo, y solo si no lo deslizaste: así un
    // deslizamiento o un toque doble del navegador no manda a otro lado.
    this.input.on('pointerup', (puntero) => {
      if (!this.director || this.director.ocupado()) return;
      if (puntero.getDistance() > TOQUE_MAXIMO || puntero.getDuration() > 600) return;
      const x = Math.floor(puntero.worldX / LOSETA);
      const y = Math.floor(puntero.worldY / LOSETA);
      this.irA(x, y);
    });
    this.events.emit('lista');
  }

  /** Muestra el marcador en (x, y) un momento. */
  marcar(x, y) {
    this.marcador.setPosition(x * LOSETA + 1, y * LOSETA + 1).setVisible(true).setAlpha(1);
    this.tweens.killTweensOf(this.marcador);
    this.tweens.add({ targets: this.marcador, alpha: 0, delay: 250, duration: 350, onComplete: () => this.marcador.setVisible(false) });
  }

  /** Detiene el camino automático (por ejemplo, al usar la cruceta). */
  detener() {
    this.camino = [];
    this.alTerminarCamino = null;
  }

  /** Dibuja el mapa actual completo. */
  dibujarMapa() {
    const m = mapa(partida.mapa);
    this.capa.removeAll(true);
    for (let y = 0; y < alto(m); y++) {
      for (let x = 0; x < ancho(m); x++) {
        this.capa.add(this.add.image(x * LOSETA, y * LOSETA, `t-${m.losetas[y][x]}`).setOrigin(0));
      }
    }
    for (const p of m.personas) {
      this.capa.add(this.add.image(p.x * LOSETA, p.y * LOSETA, `p-${p.sprite}-frente`).setOrigin(0));
    }
    this.cameras.main.setBounds(0, 0, ancho(m) * LOSETA, alto(m) * LOSETA);
    this.colocarJugador();
    this.cameras.main.startFollow(this.jugador, true);
  }

  colocarJugador() {
    this.tweens.killTweensOf(this.jugador);
    this.camino = [];
    this.caminando = false;
    this.jugador.setPosition(partida.x * LOSETA, partida.y * LOSETA);
    this.mirar(partida.dir);
  }

  mirar(dir) {
    partida.dir = dir;
    this.jugador.setTexture(dir === 'arriba' ? 'p-jugador-espalda' : 'p-jugador-frente');
    this.jugador.setFlipX(dir === 'izquierda');
  }

  /** Planea un camino hasta (x, y). Si ahí hay alguien, camina a su lado y le habla. */
  irA(x, y) {
    const m = mapa(partida.mapa);
    if (x === partida.x && y === partida.y) return;
    if (interactuable(m, x, y)) {
      const plan = vecinaParaHablar(m, partida.x, partida.y, x, y);
      if (!plan) return;
      this.marcar(x, y);
      this.seguir(plan.camino, () => {
        this.mirar(plan.mirar);
        this.director.alHablar(x, y);
      });
      return;
    }
    const camino = buscarCamino(m, partida.x, partida.y, x, y, partida.dir);
    if (!camino) return;
    this.marcar(x, y);
    this.seguir(camino, null);
  }

  seguir(camino, alTerminar) {
    this.camino = camino;
    this.alTerminarCamino = alTerminar;
    if (!this.caminando) this.siguientePaso();
  }

  /** Da un paso del camino. Al llegar, pregunta al director qué pasa. */
  siguientePaso() {
    if (!this.camino.length) {
      this.caminando = false;
      const fin = this.alTerminarCamino;
      this.alTerminarCamino = null;
      if (fin) fin();
      return;
    }
    const destino = this.camino.shift();
    const dx = destino.x - partida.x;
    const dy = destino.y - partida.y;
    const dir = Object.keys(DIRS).find((k) => DIRS[k].x === dx && DIRS[k].y === dy);
    this.mirar(dir);
    if (!caminable(mapa(partida.mapa), destino.x, destino.y)) {
      this.camino = [];
      this.caminando = false;
      return;
    }
    this.caminando = true;
    partida.x = destino.x;
    partida.y = destino.y;
    this.tweens.add({
      targets: this.jugador,
      x: destino.x * LOSETA,
      y: destino.y * LOSETA,
      duration: MS_PASO,
      onComplete: async () => {
        // El director puede detener el camino (puerta, criatura salvaje...)
        const seguir = await this.director.alLlegar(destino.x, destino.y);
        if (seguir === false) {
          this.camino = [];
          this.alTerminarCamino = null;
          this.caminando = false;
          return;
        }
        this.siguientePaso();
      },
    });
  }

  /**
   * Cruceta (en pantalla o flechas del teclado, ver interfaz/mando.js):
   * mientras está apretada, camina una casilla tras otra.
   */
  update() {
    if (this.direccionMando) this.pasoMando(this.direccionMando);
  }

  /**
   * Un paso con la cruceta: avanza si se puede; si hay algo enfrente, solo gira.
   * Se llama al apretar (para que un toque rápido también cuente) y en cada
   * cuadro mientras se mantiene apretado.
   */
  pasoMando(dir) {
    if (!this.director || this.director.ocupado() || this.caminando) return;
    const d = DIRS[dir];
    const nx = partida.x + d.x;
    const ny = partida.y + d.y;
    const m = mapa(partida.mapa);
    if (caminable(m, nx, ny)) this.seguir([{ x: nx, y: ny }], null);
    else this.mirar(dir);
  }

  /** Habla con lo que tiene enfrente (botón A). */
  hablarEnfrente() {
    if (this.caminando) return;
    const d = DIRS[partida.dir];
    const x = partida.x + d.x;
    const y = partida.y + d.y;
    if (interactuable(mapa(partida.mapa), x, y)) this.director.alHablar(x, y);
  }

  /** Destello de entrada a combate. */
  destello() {
    return new Promise((listo) => {
      this.cameras.main.flash(180, 255, 255, 255);
      this.time.delayedCall(200, () => {
        this.cameras.main.flash(180, 0, 0, 0);
        this.time.delayedCall(220, listo);
      });
    });
  }
}
