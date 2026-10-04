/**
 * Evita que Safari en iPad haga zoom mientras se juega:
 *  - doble toque rápido (al apretar A/B muy seguido) → zoom de "doble tap"
 *  - pellizco con dos dedos (dos jugadores tocando a la vez) → zoom de "pinch"
 * iOS ignora `user-scalable=no`, por eso hay que frenarlo también con JavaScript.
 * Se usa en todos los juegos: basta con importar este archivo.
 */
let ultimoToque = 0;

// Doble toque: si dos toques terminan muy seguidos, se cancela el segundo
// (los botones del juego usan pointerdown, así que siguen funcionando).
// En botones y enlaces no: ahí basta `touch-action: manipulation` (CSS) y así
// un toque rápido en un menú nunca se pierde.
document.addEventListener('touchend', (e) => {
  const ahora = performance.now();
  const esBoton = e.target.closest?.('button, a, input, select, label');
  if (!esBoton && ahora - ultimoToque < 350 && e.cancelable) e.preventDefault();
  ultimoToque = ahora;
}, { passive: false });

// Pellizco (gestos de zoom propios de Safari)
for (const evento of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(evento, (e) => e.preventDefault(), { passive: false });
}

// Zoom con dos dedos en navegadores que no usan "gesture"
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1 && e.scale !== undefined && e.scale !== 1 && e.cancelable) e.preventDefault();
}, { passive: false });

document.addEventListener('dblclick', (e) => e.preventDefault());
