/**
 * Mandos de la pelea: en pantalla (táctil, multitoque) y teclado.
 *
 * 1 jugador:  cruceta a la izquierda · A y B a la derecha
 * 2 jugadores: cada uno tiene su mando completo, uno en cada lado del iPad
 *
 * Las flechas son 4 botones de arcade separados: se tocan y se mantienen
 * (con dos dedos se puede correr y saltar a la vez). ▲ = saltar · ▼ = bajar de plataformas.
 *
 * Teclado:
 *  1 jugador:  flechas o WASD · A = Z, J o F · B = X, K o G
 *  2 jugadores: J1 = WASD + F (A) + G (B) · J2 = flechas + K (A) + L (B)
 *  Pausa: Escape, Enter o P
 */
/** Captura el dedo en el botón (si el navegador no puede, se sigue igual). */
function capturar(el, e) {
  try {
    el.setPointerCapture(e.pointerId);
  } catch (error) {
    // Sin captura: el botón funciona, solo que no sigue al dedo si sale de él
  }
}

const nuevaEntrada = () => ({ izq: false, der: false, arriba: false, abajo: false, A: false, B: false });

export function crearMandos({ izquierda, derecha, alPausar }) {
  /** Entradas de los jugadores humanos (las lee la escena cada cuadro). */
  const entradas = [nuevaEntrada(), nuevaEntrada()];
  let humanos = 1;

  // ---------- Piezas en pantalla ----------
  /**
   * Un botón que se mantiene apretado mientras el dedo siga encima.
   * El dedo queda "pegado" al botón que tocó: arrastrarlo no cambia de botón.
   * Un toque muy rápido dura al menos 60 ms para que el juego alcance a verlo.
   */
  function botonSostenido(b, entrada, campo) {
    let desde = 0;
    let dedo = null;
    const soltar = (e) => {
      if (e.pointerId !== dedo) return;
      dedo = null;
      const espera = Math.max(0, 60 - (performance.now() - desde));
      setTimeout(() => {
        if (dedo !== null) return; // lo volvieron a tocar
        entrada[campo] = false;
        b.classList.remove('pulsado');
      }, espera);
    };
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      capturar(b, e);
      dedo = e.pointerId;
      desde = performance.now();
      entrada[campo] = true;
      b.classList.add('pulsado');
    });
    b.addEventListener('pointerup', soltar);
    b.addEventListener('pointercancel', soltar);
    b.addEventListener('lostpointercapture', soltar);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Cruceta de 4 botones de arcade: hay que tocarlos y mantenerlos (no se arrastra). */
  function cruceta(entrada, chica = false) {
    const pad = document.createElement('div');
    pad.className = `pad${chica ? ' chica' : ''}`;
    pad.setAttribute('role', 'group');
    pad.setAttribute('aria-label', 'Flechas');
    for (const [campo, texto, nombre] of [['arriba', '▲', 'Saltar'], ['izq', '◀', 'Izquierda'], ['der', '▶', 'Derecha'], ['abajo', '▼', 'Abajo']]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `flecha f-${campo}`;
      b.textContent = texto;
      b.setAttribute('aria-label', nombre);
      botonSostenido(b, entrada, campo);
      pad.appendChild(b);
    }
    return pad;
  }

  function botonesAB(entrada, chica = false) {
    const caja = document.createElement('div');
    caja.className = `botones-ab${chica ? ' chica' : ''}`;
    for (const [boton, texto] of [['B', 'B'], ['A', 'A']]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `boton-${boton.toLowerCase()}`;
      b.textContent = texto;
      b.setAttribute('aria-label', boton === 'A' ? 'A: golpe' : 'B: especial');
      botonSostenido(b, entrada, boton);
      caja.appendChild(b);
    }
    return caja;
  }

  /** Arma los mandos para 1 o 2 jugadores humanos. */
  function preparar(cantidad) {
    humanos = cantidad;
    entradas.forEach((e) => Object.assign(e, nuevaEntrada()));
    izquierda.replaceChildren();
    derecha.replaceChildren();
    if (cantidad === 1) {
      izquierda.appendChild(cruceta(entradas[0]));
      derecha.appendChild(botonesAB(entradas[0]));
    } else {
      izquierda.append(etiqueta('J1'), cruceta(entradas[0], true), botonesAB(entradas[0], true));
      derecha.append(etiqueta('J2'), cruceta(entradas[1], true), botonesAB(entradas[1], true));
    }
  }

  function etiqueta(texto) {
    const p = document.createElement('p');
    p.className = 'etiqueta-jugador';
    p.textContent = texto;
    return p;
  }

  // ---------- Teclado ----------
  const TECLAS_1J = {
    ArrowLeft: 'izq', a: 'izq', ArrowRight: 'der', d: 'der', ArrowUp: 'arriba', w: 'arriba', ArrowDown: 'abajo', s: 'abajo',
    z: 'A', j: 'A', f: 'A', x: 'B', k: 'B', g: 'B',
  };
  const TECLAS_2J = [
    { a: 'izq', d: 'der', w: 'arriba', s: 'abajo', f: 'A', g: 'B' },
    { ArrowLeft: 'izq', ArrowRight: 'der', ArrowUp: 'arriba', ArrowDown: 'abajo', k: 'A', l: 'B' },
  ];
  function teclaA(e, apretada) {
    const tecla = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (apretada && ['Escape', 'Enter', 'p'].includes(tecla)) {
      alPausar();
      return;
    }
    const mapas = humanos === 1 ? [TECLAS_1J] : TECLAS_2J;
    mapas.forEach((mapa, i) => {
      if (!mapa[tecla]) return;
      e.preventDefault();
      entradas[i][mapa[tecla]] = apretada;
    });
  }
  document.addEventListener('keydown', (e) => { if (!e.repeat) teclaA(e, true); });
  document.addEventListener('keyup', (e) => teclaA(e, false));
  window.addEventListener('blur', () => entradas.forEach((e) => Object.assign(e, nuevaEntrada())));

  return { entradas, preparar };
}
