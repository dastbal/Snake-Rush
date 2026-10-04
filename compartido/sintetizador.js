/**
 * Sintetizador de 8 bits compartido por todos los juegos.
 * Crea sonidos con la Web Audio API, sin archivos.
 */
export function crearSintetizador() {
  let ctx = null;
  let silencio = false;
  let musicaTimer = null;

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

  /** Varias notas seguidas. */
  function arpegio(notas, separacion = 0.08, tipo = 'square', vol = 0.1) {
    notas.forEach((f, i) => tono(f, separacion * 1.4, tipo, vol, i * separacion));
  }

  /**
   * Toca una melodía en bucle. notas: lista de Hz (0 = silencio).
   * Llamar con null la detiene.
   */
  function musica(notas, ms = 170, tipo = 'triangle', vol = 0.06) {
    clearInterval(musicaTimer);
    musicaTimer = null;
    if (!notas) return;
    let i = 0;
    musicaTimer = setInterval(() => {
      const f = notas[i % notas.length];
      if (f) tono(f, (ms / 1000) * 0.95, tipo, vol);
      i++;
    }, ms);
  }

  /** Prende o apaga el sonido. Devuelve true si quedó en silencio. */
  function alternar() {
    silencio = !silencio;
    return silencio;
  }

  return { iniciar, tono, arpegio, musica, alternar };
}
