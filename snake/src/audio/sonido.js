/**
 * Sonidos de Snake Rush, hechos con el sintetizador compartido.
 */
import { crearSintetizador } from '../../../compartido/sintetizador.js';

const MELODIA = [523, 0, 659, 0, 784, 659, 523, 0, 587, 0, 698, 0, 880, 698, 587, 0,
                 523, 0, 659, 0, 784, 880, 988, 0, 1047, 0, 784, 0, 523, 0, 0, 0].map((f) => f / 2);

export function crearSonido() {
  const s = crearSintetizador();
  return {
    iniciar: s.iniciar,
    alternar: s.alternar,
    comer: () => { s.tono(660, 0.07); s.tono(990, 0.09, 'square', 0.12, 0.07); },
    perder: () => s.tono(440, 0.6, 'sawtooth', 0.15, 0, 60),
    poder: () => s.arpegio([523, 659, 784, 1047, 1319], 0.07),
    nivel: () => s.arpegio([392, 523, 659, 784, 659, 784, 1047], 0.1),
    romper: () => s.tono(180, 0.12, 'square', 0.12, 0, 60),
    musica: (encender) => s.musica(encender ? MELODIA : null),
  };
}

/** Conecta los sonidos a los eventos del juego. */
export function conectarSonido(sonido, eventos) {
  eventos.en('inicio', () => sonido.musica(true));
  eventos.en('comio', () => sonido.comer());
  eventos.en('nivel', () => sonido.nivel());
  eventos.en('poder', () => sonido.poder());
  eventos.en('rompio', () => sonido.romper());
  eventos.en('perdio', () => {
    sonido.musica(false);
    sonido.perder();
  });
}
