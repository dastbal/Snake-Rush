/**
 * Mandos de la pelea: en pantalla (táctil, multitoque) y teclado.
 *
 * 1 jugador:  cruceta a la izquierda · A y B a la derecha
 * 2 jugadores: cada uno tiene su mando completo, uno en cada lado del iPad
 *
 * La cruceta es una almohadilla: se puede deslizar el dedo y hacer diagonales
 * (por ejemplo, correr y saltar a la vez). ▲ = saltar · ▼ = bajar de plataformas.
 *
 * Teclado:
 *  1 jugador:  flechas o WASD · A = Z, J o F · B = X, K o G
 *  2 jugadores: J1 = WASD + F (A) + G (B) · J2 = flechas + K (A) + L (B)
 *  Pausa: Escape, Enter o P
 */
const ZONA_MUERTA = 0.28;

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
  function cruceta(entrada, chica = false) {
    const pad = document.createElement('div');
    pad.className = `pad${chica ? ' chica' : ''}`;
    pad.setAttribute('role', 'group');
    pad.setAttribute('aria-label', 'Cruceta');
    pad.innerHTML = '<span class="flecha f-arriba">▲</span><span class="flecha f-izq">◀</span><span class="flecha f-der">▶</span><span class="flecha f-abajo">▼</span><span class="perilla"></span>';
    const perilla = pad.querySelector('.perilla');

    const leer = (e) => {
      const r = pad.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const dy = ((e.clientY - r.top) / r.height) * 2 - 1;
      entrada.izq = dx < -ZONA_MUERTA;
      entrada.der = dx > ZONA_MUERTA;
      entrada.arriba = dy < -0.45;
      entrada.abajo = dy > 0.45;
      const lim = (v) => Math.max(-1, Math.min(1, v));
      perilla.style.transform = `translate(${lim(dx) * 30}%, ${lim(dy) * 30}%)`;
    };
    const soltar = () => {
      delete pad.dataset.activo;
      Object.assign(entrada, { izq: false, der: false, arriba: false, abajo: false });
      perilla.style.transform = '';
    };
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      capturar(pad, e);
      pad.dataset.activo = '1';
      leer(e);
    });
    pad.addEventListener('pointermove', (e) => {
      if (pad.dataset.activo) leer(e);
    });
    pad.addEventListener('pointerup', soltar);
    pad.addEventListener('pointercancel', soltar);
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
      const soltar = () => { entrada[boton] = false; b.classList.remove('pulsado'); };
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        capturar(b, e);
        entrada[boton] = true;
        b.classList.add('pulsado');
      });
      b.addEventListener('pointerup', soltar);
      b.addEventListener('pointercancel', soltar);
      b.addEventListener('contextmenu', (e) => e.preventDefault());
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
