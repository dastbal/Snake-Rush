/**
 * Fondos y plataformas de cada escenario, dibujados con formas (sin imágenes).
 * Cada fondo es una función que recibe el "lápiz" (Graphics de Phaser).
 * Para agregar uno: escribe la función y úsala por su nombre en datos/escenarios.js.
 */
import { ANCHO_MUNDO as W, ALTO_MUNDO as H } from '../datos/escenarios.js';

/** Cielo en franjas, del color de arriba al de abajo (estilo 16 bits). */
function degradado(g, arriba, abajo, franjas = 12) {
  const a = Phaser.Display.Color.IntegerToColor(arriba);
  const b = Phaser.Display.Color.IntegerToColor(abajo);
  for (let i = 0; i < franjas; i++) {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, franjas - 1, i);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
    g.fillRect(0, (H / franjas) * i, W, H / franjas + 1);
  }
}

function nube(g, x, y, t) {
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(x, y, 14 * t);
  g.fillCircle(x + 16 * t, y - 6 * t, 18 * t);
  g.fillCircle(x + 34 * t, y, 14 * t);
  g.fillRect(x, y, 34 * t, 12 * t);
}

export const FONDOS = {
  cielo(g) {
    degradado(g, 0x3a78e8, 0xbfe4ff);
    nube(g, 30, 60, 1.2); nube(g, 380, 40, 1); nube(g, 300, 230, 1.5); nube(g, 20, 240, 1.3);
    // Columnas del templo a lo lejos
    g.fillStyle(0xe8dcc0, 0.6);
    for (const x of [60, 410]) g.fillRect(x, 120, 14, 90);
  },
  aldea(g) {
    degradado(g, 0xf07848, 0xffd890);
    g.fillStyle(0xffe080);
    g.fillCircle(380, 70, 26); // sol
    g.fillStyle(0x6a4a7a);
    g.fillTriangle(0, 220, 120, 90, 240, 220); // montañas
    g.fillTriangle(180, 220, 330, 110, 480, 220);
    g.fillStyle(0x3a2a3a);
    for (const [x, h] of [[20, 60], [420, 70]]) { // casas
      g.fillRect(x, 230 - h, 40, h);
      g.fillTriangle(x - 8, 230 - h, x + 20, 205 - h, x + 48, 230 - h);
    }
  },
  barco(g) {
    degradado(g, 0x58a8f0, 0xd8f0ff, 8);
    g.fillStyle(0x2a68b8);
    g.fillRect(0, 225, W, 45); // mar
    g.fillStyle(0x80c0f0);
    for (let x = 0; x < W; x += 24) g.fillRect(x, 228 + ((x / 24) % 2) * 4, 12, 2); // olas
    g.fillStyle(0x6a4020);
    g.fillRect(236, 30, 8, 180); // mástil
    g.fillStyle(0xf8f0e0);
    g.fillTriangle(244, 40, 244, 120, 320, 120); // vela
    g.fillStyle(0x181820);
    g.fillRect(240, 18, 22, 12); // bandera
  },
  ciudad(g) {
    degradado(g, 0x0a0a28, 0x3a1a58);
    g.fillStyle(0xfff4c0);
    g.fillCircle(400, 50, 18); // luna
    for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % 120, 1, 1); // estrellas
    const edificios = [[0, 90], [50, 140], [110, 70], [170, 120], [250, 160], [320, 100], [380, 130], [430, 80]];
    for (const [x, h] of edificios) {
      g.fillStyle(0x1a1438);
      g.fillRect(x, H - h, 48, h);
      for (let wy = H - h + 8; wy < H - 10; wy += 14) {
        for (let wx = x + 6; wx < x + 42; wx += 12) {
          g.fillStyle([0xff4f9a, 0x4fd8ff, 0xffd84d][(wx + wy) % 3], (wx * wy) % 5 === 0 ? 0.2 : 0.8);
          g.fillRect(wx, wy, 5, 6);
        }
      }
    }
  },
};

/** Estilo de las plataformas de cada escenario. */
const PISOS = {
  cielo: { arriba: 0xd8d0b8, cuerpo: 0xa89c80, borde: 0x6a6050 },
  aldea: { arriba: 0xc08850, cuerpo: 0x8a5a30, borde: 0x4a2a10 },
  barco: { arriba: 0xb07840, cuerpo: 0x7a4a20, borde: 0x3a2010 },
  ciudad: { arriba: 0x4fd8ff, cuerpo: 0x2a2048, borde: 0xff4f9a },
};

export function pintarPlataformas(g, escenario, superficies) {
  const p = PISOS[escenario.fondo] || PISOS.cielo;
  for (const s of superficies) {
    if (s.fina) {
      g.fillStyle(p.arriba);
      g.fillRect(s.x, s.y, s.ancho, 4);
      g.fillStyle(p.borde);
      g.fillRect(s.x, s.y + 4, s.ancho, 2);
    } else {
      g.fillStyle(p.cuerpo);
      g.fillRect(s.x, s.y, s.ancho, 22);
      g.fillTriangle(s.x, s.y + 22, s.x + s.ancho, s.y + 22, s.x + s.ancho / 2, s.y + 60);
      g.fillStyle(p.arriba);
      g.fillRect(s.x, s.y, s.ancho, 6);
      g.fillStyle(p.borde);
      g.fillRect(s.x, s.y + 6, s.ancho, 2);
      for (let x = s.x + 20; x < s.x + s.ancho; x += 40) g.fillRect(x, s.y + 8, 2, 14);
    }
  }
}
