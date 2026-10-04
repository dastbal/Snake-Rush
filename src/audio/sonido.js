/**
 * Sonidos de 8 bits generados con la Web Audio API (sin archivos).
 * Un "oscilador" crea una onda, como un sintetizador.
 */

const MELODIA = [523, 0, 659, 0, 784, 659, 523, 0, 587, 0, 698, 0, 880, 698, 587, 0,
                 523, 0, 659, 0, 784, 880, 988, 0, 1047, 0, 784, 0, 523, 0, 0, 0];

export function crearSonido() {
  let ctx = null;
  let silencio = false;
  let musicaTimer = null;
  let nota = 0;

  /** El navegador solo deja sonar audio después de un toque del jugador. */
  function iniciar() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {
      ctx = null;
    }
  }

  /** Un "beep": frecuencia (Hz), duración (s), forma de onda y volumen. */
  function tono(freq, dur, tipo = 'square', vol = 0.12, retraso = 0, freqFinal = null) {
    if (silencio || !ctx) return;
    const t = ctx.currentTime + retraso;
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    if (freqFinal) osc.frequency.exponentialRampToValueAtTime(freqFinal, t + dur);
    gan.gain.setValueAtTime(vol, t);
    gan.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gan).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const arpegio = (notas, separacion) => notas.forEach((f, i) => tono(f, 0.12, 'square', 0.1, i * separacion));

  return {
    iniciar,
    comer: () => { tono(660, 0.07); tono(990, 0.09, 'square', 0.12, 0.07); },
    perder: () => tono(440, 0.6, 'sawtooth', 0.15, 0, 60),
    poder: () => arpegio([523, 659, 784, 1047, 1319], 0.07),
    nivel: () => arpegio([392, 523, 659, 784, 659, 784, 1047], 0.1),
    romper: () => tono(180, 0.12, 'square', 0.12, 0, 60),
    musica(encender) {
      clearInterval(musicaTimer);
      musicaTimer = null;
      if (!encender) return;
      musicaTimer = setInterval(() => {
        const f = MELODIA[nota % MELODIA.length];
        if (f) tono(f / 2, 0.16, 'triangle', 0.06);
        nota++;
      }, 170);
    },
    /** Prende o apaga el sonido. Devuelve true si quedó en silencio. */
    alternar() {
      silencio = !silencio;
      return silencio;
    },
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
