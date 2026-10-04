/**
 * La escena de Phaser: corre el "game loop" y dibuja.
 * Escucha los eventos de las reglas para mostrar animaciones.
 */
import { CASILLA, ANCHO, ALTO } from '../config/ajustes.js';
import { PODERES } from '../datos/poderes.js';
import { estado, personaje } from '../nucleo/estado.js';
import { espera } from '../nucleo/reglas.js';
import { FONDOS } from './fondos.js';
import { pintarDibujo, pintarSerpiente, colorCuerpo } from './pintar.js';

const FUENTE = 'Courier New, monospace';

/**
 * Crea la clase de la escena.
 * @param {{ reglas, eventos, record: () => number }} deps
 */
export function crearEscena({ reglas, eventos, record }) {
  return class EscenaJuego extends Phaser.Scene {
    constructor() {
      super('EscenaJuego');
      this.ultimoPaso = 0;
    }

    create() {
      this.lapiz = this.add.graphics();
      this.hud = this.add.text(6, 4, '', {
        fontFamily: FUENTE, fontSize: '14px', color: '#ffffff',
        backgroundColor: '#000000aa', padding: { x: 4, y: 2 },
      }).setDepth(10);
      this.cartel = this.add.text(ANCHO / 2, ALTO / 2, '', {
        fontFamily: FUENTE, fontSize: '26px', fontStyle: 'bold', color: '#ffd83a',
        align: 'center', stroke: '#000000', strokeThickness: 6,
      }).setOrigin(0.5).setDepth(20).setAlpha(0);

      // Animaciones según lo que pasa en el juego
      eventos.en('inicio', ({ nombreNivel }) => this.anunciar(`NIVEL 1\n${nombreNivel}`));
      eventos.en('nivel', ({ nivel, nombreNivel }) => this.anunciar(`¡NIVEL ${nivel + 1}!\n${nombreNivel}`));
      eventos.en('comio', ({ casilla, color, gana }) => {
        this.chispas(casilla, color);
        this.textoFlotante(casilla, `+${gana}`);
      });
      eventos.en('poder', ({ casilla, poder }) => this.textoFlotante(casilla, `${poder.icono} ${poder.nombre}`));
      eventos.en('rompio', ({ casilla }) => this.chispas(casilla, 0xbbbbbb));
      eventos.en('destello', () => {
        this.cameras.main.flash(250, 255, 240, 120);
        this.cameras.main.shake(200, 0.01);
      });
      eventos.en('perdio', () => {
        this.cameras.main.shake(300, 0.015);
        this.explotar();
      });
    }

    /** El "game loop": corre ~60 veces por segundo. */
    update(ahora) {
      if (estado.modo === 'jugando' && ahora > estado.esperaHasta && ahora - this.ultimoPaso >= espera(ahora)) {
        this.ultimoPaso = ahora;
        reglas.paso(ahora);
      }
      this.dibujar(ahora);
    }

    dibujar(ahora) {
      const g = this.lapiz;
      const mundo = personaje();
      g.clear();
      FONDOS[mundo.fondo](g);
      for (const muro of estado.muros) pintarDibujo(g, mundo.muro, muro.x, muro.y);
      pintarDibujo(g, mundo.comida, estado.comida.x, estado.comida.y);

      // El poder parpadea cuando está por desaparecer
      const poder = estado.poder;
      if (poder && (poder.hasta - ahora > 3000 || Math.floor(ahora / 150) % 2 === 0)) {
        pintarDibujo(g, PODERES[poder.tipo], poder.x, poder.y);
      }

      if (!estado.explotada) pintarSerpiente(g, ahora);

      let texto = `Puntos ${estado.puntos} · Nivel ${estado.nivel + 1} · Récord ${Math.max(record(), estado.puntos)}`;
      for (const [tipo, hasta] of Object.entries(estado.efectos)) {
        if (hasta > ahora) texto += `  ${PODERES[tipo].icono} ${Math.ceil((hasta - ahora) / 1000)}s`;
      }
      this.hud.setText(texto).setVisible(estado.modo !== 'menu');
    }

    // ---------- Animaciones ----------
    chispas(casilla, color) {
      const cx = casilla.x * CASILLA + CASILLA / 2;
      const cy = casilla.y * CASILLA + CASILLA / 2;
      for (let i = 0; i < 12; i++) {
        const angulo = (Math.PI * 2 * i) / 12;
        const chispa = this.add.rectangle(cx, cy, 4, 4, i % 2 ? color : 0xffffff).setDepth(5);
        this.tweens.add({
          targets: chispa,
          x: cx + Math.cos(angulo) * 26,
          y: cy + Math.sin(angulo) * 26,
          alpha: 0,
          duration: 380,
          ease: 'Cubic.easeOut',
          onComplete: () => chispa.destroy(),
        });
      }
    }

    textoFlotante(casilla, texto) {
      const t = this.add.text(casilla.x * CASILLA + CASILLA / 2, casilla.y * CASILLA, texto, {
        fontFamily: FUENTE, fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(15);
      this.tweens.add({
        targets: t, y: t.y - 30, alpha: 0, duration: 800, ease: 'Sine.easeOut',
        onComplete: () => t.destroy(),
      });
    }

    anunciar(texto) {
      this.tweens.killTweensOf(this.cartel);
      this.cartel.setText(texto).setAlpha(1).setScale(0.6);
      this.tweens.add({ targets: this.cartel, scale: 1, duration: 300, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.cartel, alpha: 0, delay: 1300, duration: 400 });
    }

    explotar() {
      estado.serpiente.forEach((p, i) => {
        const pedazo = this.add.rectangle(
          p.x * CASILLA + CASILLA / 2, p.y * CASILLA + CASILLA / 2,
          CASILLA - 4, CASILLA - 4, i === 0 ? 0xffffff : colorCuerpo(i, 0),
        ).setDepth(6);
        const angulo = Math.random() * Math.PI * 2;
        const distancia = 40 + Math.random() * 80;
        this.tweens.add({
          targets: pedazo,
          x: pedazo.x + Math.cos(angulo) * distancia,
          y: pedazo.y + Math.sin(angulo) * distancia,
          angle: Phaser.Math.Between(-360, 360),
          alpha: 0,
          scale: 0.3,
          duration: 800,
          ease: 'Cubic.easeOut',
          onComplete: () => pedazo.destroy(),
        });
      });
    }
  };
}
