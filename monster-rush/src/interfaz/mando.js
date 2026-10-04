/**
 * El mando: cruceta, A, B y START, en pantalla y en el teclado.
 * Es el único lugar que traduce botones a acciones, según lo que hay en pantalla:
 *
 *              │ Mundo                     │ Texto      │ Menú / título
 *  ────────────┼───────────────────────────┼────────────┼──────────────────────
 *  Cruceta     │ caminar (mantener = sigue)│ —          │ mover la selección
 *  A           │ hablar / leer lo de enfrente│ avanzar  │ elegir
 *  B           │ —                         │ avanzar    │ VOLVER
 *  START       │ abrir el MENÚ             │ —          │ —
 *
 * Teclado: flechas = cruceta · Z, Enter o Espacio = A · X, Escape o Retroceso = B · M = START
 */
const TECLAS = {
  ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izquierda', ArrowRight: 'derecha',
  z: 'A', Z: 'A', Enter: 'A', ' ': 'A',
  x: 'B', X: 'B', Escape: 'B', Backspace: 'B',
  m: 'START', M: 'START',
};
const DIRECCIONES = ['arriba', 'abajo', 'izquierda', 'derecha'];

export function crearMando({ capa, ui, mundo, abrirMenu, sonido }) {
  /** La capa de botones que está encima (menú abierto o título), o null. */
  function capaActiva() {
    const menus = capa.querySelectorAll('.menu');
    if (menus.length) return menus[menus.length - 1];
    const titulo = capa.querySelector('.titulo:not([hidden])');
    return titulo || null;
  }
  const botonesDe = (el) => [...el.querySelectorAll('button')].filter((b) => !b.disabled && !b.hidden);

  /** Mueve la selección en un menú con la cruceta. */
  function moverSeleccion(dir, el) {
    const botones = botonesDe(el);
    if (!botones.length) return;
    const i = botones.indexOf(document.activeElement);
    const lista = el.querySelector('.menu-lista');
    const columnas = lista ? getComputedStyle(lista).gridTemplateColumns.split(' ').length : 1;
    const salto = dir === 'arriba' ? -columnas : dir === 'abajo' ? columnas : dir === 'izquierda' ? -1 : 1;
    const destino = i < 0 ? 0 : Math.min(botones.length - 1, Math.max(0, i + salto));
    botones[destino].focus({ preventScroll: false });
    sonido.blip();
  }

  /** Aprieta un botón (A, B, START o una dirección). */
  function apretar(boton) {
    const el = capaActiva();
    if (DIRECCIONES.includes(boton)) {
      if (el) moverSeleccion(boton, el);
      return;
    }
    if (boton === 'A') {
      if (ui.hayTexto()) return ui.avanzarTexto();
      if (el) {
        const elegido = el.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON'
          ? document.activeElement : botonesDe(el)[0];
        elegido?.click();
        return;
      }
      if (!ui.ocupado()) mundo().hablarEnfrente();
      return;
    }
    if (boton === 'B') {
      if (ui.hayTexto()) return ui.avanzarTexto();
      el?.querySelector('.volver')?.click();
      return;
    }
    if (boton === 'START' && !el && !ui.ocupado()) abrirMenu();
  }

  /** Mantener una dirección: camina en el mundo; en menús se mueve una vez. */
  function presionarDireccion(dir) {
    if (capaActiva() || ui.ocupado()) {
      apretar(dir);
      return;
    }
    const escena = mundo();
    escena.detener(); // la cruceta manda sobre el camino automático
    escena.direccionMando = dir;
    escena.pasoMando(dir); // un toque rápido también da un paso (o gira)
  }
  function soltarDireccion(dir) {
    const escena = mundo();
    if (escena.direccionMando === dir) escena.direccionMando = null;
  }

  // ---------- Botones en pantalla ----------
  for (const b of document.querySelectorAll('[data-boton]')) {
    const nombre = b.dataset.boton;
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        b.setPointerCapture(e.pointerId); // seguir al dedo aunque se salga del botón
      } catch (error) {
        // si el navegador no puede capturar, el botón funciona igual
      }
      b.classList.add('pulsado');
      if (DIRECCIONES.includes(nombre)) presionarDireccion(nombre);
      else apretar(nombre);
    });
    const soltar = () => {
      b.classList.remove('pulsado');
      if (DIRECCIONES.includes(nombre)) soltarDireccion(nombre);
    };
    b.addEventListener('pointerup', soltar);
    b.addEventListener('pointercancel', soltar);
    b.addEventListener('lostpointercapture', soltar);
    b.addEventListener('contextmenu', (e) => e.preventDefault()); // sin menú al mantener apretado
  }

  // ---------- Teclado ----------
  document.addEventListener('keydown', (e) => {
    const boton = TECLAS[e.key];
    if (!boton) return;
    // En el campo de texto (ninguno por ahora) no robamos teclas
    if (e.target.tagName === 'INPUT') return;
    e.preventDefault();
    if (e.repeat && !DIRECCIONES.includes(boton)) return;
    if (DIRECCIONES.includes(boton)) {
      if (!e.repeat) presionarDireccion(boton);
    } else {
      apretar(boton);
    }
  });
  document.addEventListener('keyup', (e) => {
    const boton = TECLAS[e.key];
    if (DIRECCIONES.includes(boton)) soltarDireccion(boton);
  });
  // Si la ventana pierde el foco, soltar todo (evita caminar solo)
  window.addEventListener('blur', () => { mundo().direccionMando = null; });

  return { apretar };
}
