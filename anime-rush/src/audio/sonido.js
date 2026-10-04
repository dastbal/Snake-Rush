/**
 * Música y efectos de Anime Rush, con el sintetizador compartido.
 * Cada escenario tiene su melodía (nombre en datos/escenarios.js).
 */
import { crearSintetizador } from '../../../compartido/sintetizador.js';

const A3 = 220, C4 = 262, D4 = 294, E4 = 330, G4 = 392, A4 = 440, B4 = 494, C5 = 523, D5 = 587, E5 = 659;

const MELODIAS = {
  titulo: { notas: [E4, G4, A4, 0, A4, C5, B4, A4, G4, 0, E4, G4, A4, 0, 0, 0], ms: 160 },
  torneo: { notas: [A4, A4, C5, A4, D5, C5, A4, G4, A4, A4, C5, A4, E5, D5, C5, 0], ms: 120, tipo: 'square', vol: 0.035 },
  aldea: { notas: [E4, G4, A4, 0, B4, A4, G4, E4, D4, E4, G4, 0, E4, D4, C4, 0], ms: 140, tipo: 'triangle', vol: 0.06 },
  barco: { notas: [D4, D4, A4, 0, G4, E4, D4, 0, C4, C4, G4, 0, E4, D4, C4, A3], ms: 150, tipo: 'square', vol: 0.035 },
  ciudad: { notas: [A3, A4, A3, A4, C4, C5, C4, C5, D4, D5, D4, D5, E4, E5, G4, E5], ms: 110, tipo: 'sawtooth', vol: 0.03 },
};

export function crearSonido() {
  const s = crearSintetizador();
  let actual = null;
  return {
    iniciar: s.iniciar,
    alternar: s.alternar,
    musica(nombre) {
      if (nombre === actual) return;
      actual = nombre;
      const m = MELODIAS[nombre];
      s.musica(m ? m.notas : null, m?.ms, m?.tipo, m?.vol);
    },
    elegir: () => s.tono(880, 0.05, 'square', 0.07),
    golpe: (fuerza) => s.tono(220 - Math.min(150, fuerza / 8), 0.09 + Math.min(0.2, fuerza / 4000), 'square', 0.14, 0, 70),
    salto: () => s.tono(300, 0.1, 'square', 0.06, 0, 600),
    especial: () => s.arpegio([C5, E5, G4 * 2], 0.05, 'sawtooth', 0.07),
    ko: () => { s.tono(120, 0.6, 'sawtooth', 0.18, 0, 40); s.arpegio([E5, C5, A4, E4], 0.08); },
    objeto: () => s.arpegio([C5, E5], 0.06),
    explosion: () => s.tono(90, 0.5, 'sawtooth', 0.2, 0, 30),
    fin: () => s.arpegio([C4, E4, G4, C5, E5, G4 * 2], 0.12),
  };
}

/** Conecta los sonidos a los eventos de una pelea. */
export function conectarSonido(sonido, eventos) {
  eventos.en('golpe', ({ fuerza }) => sonido.golpe(fuerza));
  eventos.en('salto', () => sonido.salto());
  eventos.en('especial', () => sonido.especial());
  eventos.en('ko', () => sonido.ko());
  eventos.en('objeto', ({ tipo }) => (tipo === 'bomba' ? null : sonido.objeto()));
  eventos.en('explosion', () => sonido.explosion());
  eventos.en('fin', () => {
    sonido.musica(null);
    sonido.fin();
  });
}
