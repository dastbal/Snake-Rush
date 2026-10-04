/**
 * Música y efectos de Monster Rush, con el sintetizador compartido.
 * Las melodías son listas de notas en Hz (0 = silencio).
 * Para agregar una melodía: ponla en MELODIAS y úsala por su nombre en un mapa.
 */
import { crearSintetizador } from '../../../compartido/sintetizador.js';

// Notas
const C4 = 262, D4 = 294, E4 = 330, F4 = 349, G4 = 392, A4 = 440, B4 = 494;
const C5 = 523, D5 = 587, E5 = 659, G5 = 784;

const MELODIAS = {
  titulo: { notas: [E4, G4, C5, 0, B4, G4, A4, 0, F4, A4, D5, 0, C5, B4, G4, 0], ms: 200 },
  pueblo: { notas: [C5, 0, E5, D5, C5, 0, G4, 0, A4, 0, C5, B4, A4, 0, G4, 0, F4, 0, A4, G4, F4, 0, E4, 0, D4, E4, F4, G4, C5, 0, 0, 0], ms: 190 },
  ruta: { notas: [G4, G4, C5, 0, D5, 0, E5, D5, C5, 0, A4, 0, G4, 0, 0, 0, F4, F4, A4, 0, C5, 0, D5, C5, B4, 0, G4, 0, A4, B4, C5, 0], ms: 150 },
  combate: { notas: [E4, E4, G4, E4, A4, E4, G4, E4, F4, F4, A4, F4, B4, F4, A4, F4, G4, G4, B4, G4, C5, G4, B4, G4, A4, G4, F4, E4, D4, E4, F4, G4], ms: 110, tipo: 'square', vol: 0.04 },
};

export function crearSonido() {
  const s = crearSintetizador();
  let actual = null;
  return {
    iniciar: s.iniciar,
    alternar: s.alternar,
    /** Cambia la música (no la reinicia si ya está sonando). */
    musica(nombre) {
      if (nombre === actual) return;
      actual = nombre;
      const m = MELODIAS[nombre];
      s.musica(m ? m.notas : null, m?.ms, m?.tipo, m?.vol);
    },
    blip: () => s.tono(880, 0.04, 'square', 0.06),
    golpe: () => s.tono(160, 0.15, 'sawtooth', 0.14, 0, 60),
    debilitada: () => s.tono(500, 0.5, 'square', 0.1, 0, 80),
    bola: () => s.arpegio([300, 600, 300], 0.08),
    nivel: () => s.arpegio([C5, E5, G5, C5 * 2], 0.09),
    curar: () => s.arpegio([C5, E5, G5, E5, G5, C5 * 2], 0.12, 'triangle', 0.12),
    victoria: () => s.arpegio([G4, C5, E5, G5, E5, G5], 0.12),
    comprar: () => s.arpegio([E5, G5], 0.06),
    puerta: () => s.tono(300, 0.08, 'square', 0.08),
    evolucion: () => s.arpegio([C4, E4, G4, C5, E5, G5, C5 * 2], 0.15, 'triangle', 0.12),
  };
}
