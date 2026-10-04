/**
 * Controles: botones de arcade, deslizar el dedo y teclado.
 * Todos terminan llamando a reglas.girar(nombre).
 */
import { DIRECCIONES } from '../nucleo/reglas.js';
import { estado } from '../nucleo/estado.js';

/** Distancia mínima (px) para contar un deslizamiento. */
const UMBRAL_DESLIZAR = 24;

const TECLAS = { ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izquierda', ArrowRight: 'derecha' };

export function conectarControles({ reglas, pausar }) {
  // 1. Botones de arcade
  for (const nombre of Object.keys(DIRECCIONES)) {
    document.getElementById(nombre).addEventListener('pointerdown', (e) => {
      e.preventDefault();
      reglas.girar(nombre);
    });
  }

  // 2. Deslizar el dedo sobre el tablero (se pueden encadenar giros)
  const pantalla = document.querySelector('.pantalla');
  let inicio = null;
  pantalla.addEventListener('pointerdown', (e) => {
    if (estado.modo === 'jugando') inicio = { x: e.clientX, y: e.clientY };
  });
  pantalla.addEventListener('pointermove', (e) => {
    if (!inicio) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < UMBRAL_DESLIZAR) return;
    if (Math.abs(dx) > Math.abs(dy)) reglas.girar(dx > 0 ? 'derecha' : 'izquierda');
    else reglas.girar(dy > 0 ? 'abajo' : 'arriba');
    inicio = { x: e.clientX, y: e.clientY };
  });
  const soltar = () => { inicio = null; };
  pantalla.addEventListener('pointerup', soltar);
  pantalla.addEventListener('pointercancel', soltar);

  // 3. Teclado: flechas para girar, espacio o P para pausar
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    const nombre = TECLAS[e.key];
    if (nombre) {
      e.preventDefault();
      reglas.girar(nombre);
      const boton = document.getElementById(nombre);
      boton.classList.add('pulsado');
      setTimeout(() => boton.classList.remove('pulsado'), 120);
    } else if (e.key === ' ' || e.key === 'p') {
      e.preventDefault();
      pausar();
    }
  });
}
