/**
 * Escena de la pelea: corre el game loop (avanza el motor) y dibuja todo.
 * Las animaciones (chispas, temblor, KO) reaccionan a los eventos del motor.
 */
import { ESCENARIOS, ANCHO_MUNDO, ALTO_MUNDO } from '../datos/escenarios.js';
import { LUCHADORES } from '../datos/luchadores.js';
import { OBJETOS } from '../datos/objetos.js';
import { CUERPO } from '../nucleo/pelea.js';
import { FONDOS, pintarPlataformas } from './fondos.js';
import { crearTexturas } from './texturas.js';

export class EscenaPelea extends Phaser.Scene {
  constructor() {
    super('pelea');
  }

  /**
   * @param {object} datos
   * @param {object} datos.pelea        el motor (nucleo/pelea.js)
   * @param {string} datos.escenario
   * @param {(dt:number) => object[]} datos.leerEntradas  botones de cada jugador
   * @param {object} datos.eventos      el megáfono
   * @param {string[]} datos.etiquetas  "P1", "P2", "CPU"… sobre cada luchador
   */
  init(datos) {
    this.d = datos;
    this.pausado = false;
  }

  create() {
    crearTexturas(this);
    const esc = ESCENARIOS[this.d.escenario];
    const estado = this.d.pelea.estado;

    const fondo = this.add.graphics();
    FONDOS[esc.fondo](fondo);
    pintarPlataformas(this.add.graphics(), esc, estado.superficies);

    this.capaObjetos = this.add.graphics().setDepth(4);
    this.clones = estado.luchadores.map((l) => this.add.image(0, 0, `l-${l.personaje}`).setOrigin(0.5, 1).setAlpha(0.45).setTint(0x404060).setVisible(false).setDepth(4));
    this.sprites = estado.luchadores.map((l) => this.add.image(l.x, l.y, `l-${l.personaje}`).setOrigin(0.5, 1).setDepth(5));
    this.capaEfectos = this.add.graphics().setDepth(6);
    this.etiquetas = estado.luchadores.map((l, i) => this.add.text(0, 0, this.d.etiquetas[i], {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: LUCHADORES[l.personaje].color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(7));

    const ev = this.d.eventos;
    ev.en('golpe', ({ x, y, fuerza }) => {
      this.chispa(x, y, Math.min(3, 0.6 + fuerza / 500));
      if (fuerza > 650) this.cameras.main.shake(140, Math.min(0.02, fuerza / 60000));
    });
    ev.en('ko', ({ x, y }) => this.explosionKO(x, y));
    ev.en('explosion', ({ x, y }) => {
      this.chispa(x, y, 3, 0xff8020);
      this.cameras.main.shake(200, 0.015);
    });
    ev.en('objeto', ({ x, y, tipo }) => this.texto(x, y - 20, OBJETOS[tipo].nombre.toUpperCase()));
    ev.en('especial', ({ potencia }) => {
      if (potencia > 1) this.cameras.main.flash(150, 255, 200, 80);
    });
  }

  /** El game loop: avanzar el motor y dibujar. */
  update(tiempo, delta) {
    const pelea = this.d.pelea;
    if (!this.pausado && !pelea.estado.terminado) pelea.actualizar(delta / 1000, this.d.leerEntradas(delta / 1000));
    this.dibujar(tiempo);
  }

  dibujar(tiempo) {
    const estado = this.d.pelea.estado;
    const g = this.capaEfectos;
    g.clear();

    estado.luchadores.forEach((l, i) => {
      const s = this.sprites[i];
      const clon = this.clones[i];
      s.setVisible(!l.fuera);
      this.etiquetas[i].setVisible(!l.fuera);
      clon.setVisible(false);
      if (l.fuera) return;

      const conPoder = l.ataque?.tipo === 'especial' || l.potenciado > 1;
      s.setTexture(`l-${l.personaje}${conPoder ? '-poder' : ''}`);
      s.setFlipX(l.mira < 0);
      // Pasito al correr, parpadeo si es invencible, blanco si está aturdido
      const pasito = l.enSuelo && Math.abs(l.vx) > 30 ? Math.floor(tiempo / 90) % 2 : 0;
      s.setPosition(Math.round(l.x), Math.round(l.y) - pasito);
      s.setAlpha(l.invencible > 0 && Math.floor(tiempo / 80) % 2 ? 0.35 : 1);
      if (l.aturdido > 0 && Math.floor(tiempo / 60) % 2) s.setTintFill(0xffffff); else s.clearTint();
      s.setScale(l.ataque?.tipo === 'golpe' ? 1.06 : 1, l.ataque?.tipo === 'golpe' ? 0.96 : 1);
      this.etiquetas[i].setPosition(l.x, l.y - CUERPO.alto - 6);

      if (l.potenciado > 1) {
        g.lineStyle(2, 0xffb020, 0.4 + 0.3 * Math.sin(tiempo / 80));
        g.strokeCircle(l.x, l.y - 24, 26);
      }
      this.dibujarAtaque(g, l, clon, tiempo);
    });

    for (const p of estado.proyectiles) {
      g.fillStyle(p.color, 0.35);
      g.fillCircle(p.x, p.y, p.radio + 5);
      g.fillStyle(p.color);
      g.fillCircle(p.x, p.y, p.radio);
      g.fillStyle(0xffffff);
      g.fillCircle(p.x, p.y, p.radio * 0.45);
    }
    this.dibujarObjetos(estado.objetos, tiempo);
    this.indicadoresFuera(g, estado.luchadores);
  }

  /** Dibuja el golpe o especial en curso (puño, espada, brazo elástico, clon…). */
  dibujarAtaque(g, l, clon, tiempo) {
    const a = l.ataque;
    if (!a) return;
    const datos = LUCHADORES[l.personaje];
    const pechoY = l.y - 28;
    if (a.tipo === 'golpe') {
      const alcance = datos.golpe.alcance * Math.min(1, a.t / 0.08);
      if (datos.golpe.espada) {
        g.lineStyle(3, 0xe8f0ff);
        g.beginPath();
        g.arc(l.x, pechoY, alcance, l.mira > 0 ? -1.2 : Math.PI - 0.2, l.mira > 0 ? 0.2 : Math.PI + 1.2);
        g.strokePath();
      } else {
        g.fillStyle(datos.paleta.S);
        g.fillRect(l.mira > 0 ? l.x + 6 : l.x - 6 - alcance, pechoY - 3, alcance, 6);
        g.fillStyle(datos.paleta.D ?? datos.paleta.S);
        g.fillCircle(l.x + l.mira * (6 + alcance), pechoY, 5);
      }
    }
    if (a.tipo === 'recuperacion') {
      g.lineStyle(2, 0xffffff, 0.8);
      g.strokeCircle(l.x, l.y - 24, 20 + Math.sin(tiempo / 30) * 4);
    }
    if (a.tipo !== 'especial') return;
    if (a.especial === 'proyectil' && !a.disparado) {
      // Cargando la onda: una bola que crece frente a las manos
      const r = 3 + (a.t / datos.especial.carga) * datos.especial.radio;
      g.fillStyle(datos.especial.color, 0.8);
      g.fillCircle(l.x + l.mira * 18, pechoY, r);
    }
    if (a.especial === 'clon' && a.clonX !== undefined) {
      clon.setVisible(true).setPosition(a.clonX, l.y).setFlipX(l.mira < 0);
    }
    if (a.especial === 'estirar' && a.punoX !== undefined) {
      g.lineStyle(5, datos.paleta.S);
      g.lineBetween(l.x + l.mira * 8, pechoY, a.punoX, pechoY);
      g.fillStyle(datos.paleta.R ?? 0xd02828);
      g.fillCircle(a.punoX, pechoY, 7);
    }
    if (a.especial === 'embestida') {
      g.lineStyle(2, 0xe8f0ff, 0.9);
      for (let k = 1; k <= 3; k++) g.lineBetween(l.x - l.mira * k * 12, pechoY - 10 + k * 5, l.x - l.mira * (k * 12 + 20), pechoY - 10 + k * 5);
      g.lineStyle(3, 0xffffff);
      g.lineBetween(l.x, pechoY, l.x + l.mira * 40, pechoY - 6);
    }
  }

  dibujarObjetos(objetos, tiempo) {
    const g = this.capaObjetos;
    g.clear();
    for (const o of objetos) {
      if (o.vida < 2 && Math.floor(tiempo / 100) % 2) continue; // parpadea antes de desaparecer
      if (o.tipo === 'comida') {
        g.fillStyle(0xf8f8f8);
        g.fillTriangle(o.x - 8, o.y, o.x + 8, o.y, o.x, o.y - 13);
        g.fillStyle(0x203020);
        g.fillRect(o.x - 5, o.y - 4, 10, 4);
      } else if (o.tipo === 'bomba') {
        g.fillStyle(0x303038);
        g.fillCircle(o.x, o.y - 7, 7);
        g.fillStyle(Math.floor(tiempo / 100) % 2 ? 0xff4020 : 0xffd040);
        g.fillCircle(o.x + 5, o.y - 15, 2);
      } else {
        g.fillStyle(0xffb020);
        g.fillCircle(o.x, o.y - 7, 7);
        g.fillStyle(0xd02020);
        g.fillCircle(o.x, o.y - 7, 2.5);
      }
    }
  }

  /** Flechas en el borde de la pantalla si alguien voló fuera de la vista. */
  indicadoresFuera(g, luchadores) {
    for (const l of luchadores) {
      if (l.fuera) continue;
      const fueraX = l.x < 0 || l.x > ANCHO_MUNDO;
      const fueraY = l.y - CUERPO.alto < 0;
      if (!fueraX && !fueraY) continue;
      const x = Phaser.Math.Clamp(l.x, 8, ANCHO_MUNDO - 8);
      const y = Phaser.Math.Clamp(l.y - 24, 10, ALTO_MUNDO - 8);
      g.fillStyle(Phaser.Display.Color.HexStringToColor(LUCHADORES[l.personaje].color).color);
      g.fillCircle(x, y, 6);
    }
  }

  // ---------- Animaciones de eventos ----------
  chispa(x, y, tamaño = 1, color = 0xffffff) {
    const rayos = 8;
    for (let i = 0; i < rayos; i++) {
      const ang = (Math.PI * 2 * i) / rayos;
      const r = this.add.rectangle(x, y, 4 * tamaño, 2, i % 2 ? 0xffd84d : color).setRotation(ang).setDepth(8);
      this.tweens.add({
        targets: r, x: x + Math.cos(ang) * 18 * tamaño, y: y + Math.sin(ang) * 18 * tamaño, alpha: 0,
        duration: 220, onComplete: () => r.destroy(),
      });
    }
  }

  explosionKO(x, y) {
    const cx = Phaser.Math.Clamp(x, 0, ANCHO_MUNDO);
    const cy = Phaser.Math.Clamp(y, 0, ALTO_MUNDO);
    const angulo = Math.atan2(ALTO_MUNDO / 2 - cy, ANCHO_MUNDO / 2 - cx);
    const rayo = this.add.rectangle(cx, cy, 260, 26, 0xffffff).setRotation(angulo).setDepth(9).setOrigin(0, 0.5);
    this.tweens.add({ targets: rayo, scaleY: 0, alpha: 0, duration: 450, onComplete: () => rayo.destroy() });
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(120, 255, 255, 255);
  }

  texto(x, y, mensaje) {
    const t = this.add.text(x, y, mensaje, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(9);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }
}

