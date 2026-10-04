/**
 * Funciones para pintar dibujos de letras, la serpiente y el HUD.
 */
import { CASILLA, COLORES } from '../config/ajustes.js';
import { estado, personaje } from '../nucleo/estado.js';
import { esInvencible } from '../nucleo/reglas.js';

/** Pinta un dibujo de letras de 10×10 en una casilla. */
export function pintarDibujo(g, diseño, cx, cy) {
  diseño.dibujo.forEach((fila, y) => {
    [...fila].forEach((letra, x) => {
      if (letra === '.') return;
      g.fillStyle(diseño.paleta[letra]);
      g.fillRect(cx * CASILLA + x * 2, cy * CASILLA + y * 2, 2, 2);
    });
  });
}

/** Color del pedazo i del cuerpo (arcoíris si eres invencible). */
export function colorCuerpo(i, ahora) {
  if (esInvencible(ahora)) {
    return Phaser.Display.Color.HSVToRGB(((ahora / 600) + i * 0.08) % 1, 0.8, 1).color;
  }
  const base = Phaser.Display.Color.IntegerToColor(COLORES[estado.eleccion.color]);
  return i % 2 === 0 ? base.color : base.clone().darken(12).color;
}

/** Cabeza clásica: cuadro redondeado con ojos que miran hacia donde vas. */
function cabezaClasica(g, cabeza, invencible) {
  const { x: dx, y: dy } = estado.direccion;
  const px = cabeza.x * CASILLA;
  const py = cabeza.y * CASILLA;
  g.fillStyle(invencible ? 0xffd700 : COLORES[estado.eleccion.color]);
  g.fillRoundedRect(px, py, CASILLA, CASILLA, 7);
  const ojos = dx !== 0
    ? [[px + 8 + dx * 3, py + 3], [px + 8 + dx * 3, py + 11]]
    : [[px + 3, py + 8 + dy * 3], [px + 11, py + 8 + dy * 3]];
  for (const [ox, oy] of ojos) {
    g.fillStyle(0xffffff);
    g.fillRect(ox, oy, 6, 6);
    g.fillStyle(0x111111);
    g.fillRect(ox + 2 + dx * 2, oy + 2 + dy * 2, 3, 3);
  }
}

export function pintarSerpiente(g, ahora) {
  const s = estado.serpiente;
  // 1. Uniones entre pedazos, para que el cuerpo se vea continuo
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1];
    const b = s[i];
    g.fillStyle(colorCuerpo(i, ahora));
    g.fillRect(
      Math.min(a.x, b.x) * CASILLA + 3,
      Math.min(a.y, b.y) * CASILLA + 3,
      (Math.abs(a.x - b.x) + 1) * CASILLA - 6,
      (Math.abs(a.y - b.y) + 1) * CASILLA - 6,
    );
  }
  // 2. Pedazos redondeados con brillo; la cola es más chica
  for (let i = s.length - 1; i >= 1; i--) {
    const p = s[i];
    const borde = i === s.length - 1 ? 4 : 1;
    g.fillStyle(colorCuerpo(i, ahora));
    g.fillRoundedRect(p.x * CASILLA + borde, p.y * CASILLA + borde, CASILLA - borde * 2, CASILLA - borde * 2, 6);
    g.fillStyle(0xffffff, 0.25);
    g.fillRoundedRect(p.x * CASILLA + borde + 3, p.y * CASILLA + borde + 3, 6, 4, 2);
  }
  // 3. La cabeza
  const cabeza = s[0];
  const diseño = personaje().cabeza;
  const invencible = esInvencible(ahora);
  if (diseño === null) {
    cabezaClasica(g, cabeza, invencible);
  } else {
    if (invencible) {
      g.fillStyle(0xffd700, 0.5);
      g.fillRect(cabeza.x * CASILLA - 2, cabeza.y * CASILLA - 2, CASILLA + 4, CASILLA + 4);
    }
    pintarDibujo(g, diseño, cabeza.x, cabeza.y);
  }
}
