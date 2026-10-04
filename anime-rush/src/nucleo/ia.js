/**
 * Inteligencia de los rivales de la compu. Mira la pelea y "aprieta botones",
 * igual que un jugador. No hace trampa: solo usa las mismas entradas.
 *
 * Reglas simples, en orden de prioridad:
 *  1. Si está fuera del escenario → volver (moverse al centro, saltar, ▲+B).
 *  2. Elegir al rival más cercano.
 *  3. Si está cerca y a su altura → golpe (A).
 *  4. Si está a media distancia y a su altura → a veces especial (B).
 *  5. Si no → acercarse; saltar si el rival está más arriba.
 */
import { LUCHADORES } from '../datos/luchadores.js';
import { ESCENARIOS } from '../datos/escenarios.js';

/** Qué tan rápido piensa y qué tan agresiva es cada dificultad. */
export const NIVELES_IA = {
  Fácil: { pensar: 0.35, agresion: 0.35, especial: 0.15 },
  Normal: { pensar: 0.2, agresion: 0.6, especial: 0.3 },
  Difícil: { pensar: 0.08, agresion: 0.9, especial: 0.45 },
};

export function crearIA({ nivel = 'Normal', escenario, azar = Math.random }) {
  const n = NIVELES_IA[nivel];
  const suelo = ESCENARIOS[escenario].suelo;
  let espera = 0;
  let entrada = {};

  /** Decide los botones de este cuadro para el luchador `yo`. */
  return function decidir(estado, yo, dt) {
    espera -= dt;
    const l = estado.luchadores[yo];
    // Entre decisiones mantiene la dirección (pero sin repetir A/B/saltar)
    const botones = espera > 0 ? soltarPulsos(entrada) : pensar(estado, yo);
    return frenarEnLaOrilla(botones, l);
  };

  /** Nunca perseguir a nadie fuera del borde: frenar al llegar a la orilla (cada cuadro). */
  function frenarEnLaOrilla(botones, l) {
    if (!l.enSuelo) return botones;
    const orilla = 22;
    const b = { ...botones };
    if (b.izq && l.x < suelo.x + orilla) b.izq = false;
    if (b.der && l.x > suelo.x + suelo.ancho - orilla) b.der = false;
    return b;
  }

  function pensar(estado, yo) {
    espera = n.pensar * (0.7 + azar() * 0.6);

    const l = estado.luchadores[yo];
    entrada = {};
    if (l.fuera) return entrada;

    // 1. Volver al escenario
    const fueraDelSuelo = l.x < suelo.x - 5 || l.x > suelo.x + suelo.ancho + 5;
    if (fueraDelSuelo || l.y > suelo.y + 10) {
      const centro = suelo.x + suelo.ancho / 2;
      entrada.der = l.x < centro;
      entrada.izq = l.x > centro;
      if (l.vy > 0 && l.saltosAire > 0) entrada.arriba = true;
      else if (l.vy > 0 && !l.usoRecuperacion && l.y > suelo.y - 20) {
        entrada.arriba = true;
        entrada.B = true;
      }
      return entrada;
    }

    // 2. Rival más cercano
    const rivales = estado.luchadores.filter((o) => o.indice !== yo && !o.fuera);
    if (!rivales.length) return entrada;
    const objetivo = rivales.reduce((a, b) => (Math.abs(b.x - l.x) < Math.abs(a.x - l.x) ? b : a));
    const dx = objetivo.x - l.x;
    const dy = objetivo.y - l.y;
    const distancia = Math.abs(dx);
    const alcance = LUCHADORES[l.personaje].golpe.alcance + 14;
    const mismaAltura = Math.abs(dy) < 40;

    // Mirar hacia el rival
    if (dx > 0) entrada.der = true; else entrada.izq = true;

    if (distancia < alcance && mismaAltura) {
      // 3. Golpear (y no acercarse más)
      entrada.der = dx > 0 && distancia > alcance * 0.6;
      entrada.izq = dx < 0 && distancia > alcance * 0.6;
      if (azar() < n.agresion) entrada.A = true;
    } else if (distancia < 220 && mismaAltura && azar() < n.especial) {
      // 4. Especial a media distancia
      entrada.B = true;
    } else if (dy < -50 && l.enSuelo && azar() < 0.6) {
      // 5. Saltar hacia el rival
      entrada.arriba = true;
    }
    return entrada;
  }
}

/** Los botones de "un toque" (A, B, saltar) se sueltan entre decisiones. */
function soltarPulsos(entrada) {
  return { izq: entrada.izq, der: entrada.der, abajo: entrada.abajo };
}
