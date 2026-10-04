/**
 * Punto de entrada de Monster Rush: arma y conecta todas las piezas.
 *
 *   datos/      → QUÉ hay: especies, ataques, tipos, objetos, mapas y arte
 *   nucleo/     → CÓMO funciona: criaturas, combate, partida y mundo (sin Phaser)
 *   graficos/   → Phaser: mapa, jugador y animaciones de combate
 *   audio/      → música y efectos de 8 bits
 *   interfaz/   → textos, menús, combate, título y el "director" de la historia
 */
import '../../compartido/sin-zoom.js'; // sin zoom por doble toque o pellizco en iPad
import { EscenaMundo } from './graficos/escenaMundo.js';
import { EscenaCombate } from './graficos/escenaCombate.js';
import { crearSonido } from './audio/sonido.js';
import { crearUI } from './interfaz/ui.js';
import { crearTitulo } from './interfaz/titulo.js';
import { crearDirector } from './interfaz/director.js';
import { crearMando } from './interfaz/mando.js';

const capa = document.getElementById('capa');
const sonido = crearSonido();
const ui = crearUI({ capa, sonido });

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: 160,
  height: 144,
  pixelArt: true,
  backgroundColor: '#f8f8f0',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [EscenaMundo, EscenaCombate],
});

let director = null;
const titulo = crearTitulo({
  capa,
  alElegir: (nueva) => {
    sonido.iniciar(); // el audio necesita un toque del jugador
    director.empezar(nueva);
  },
});

// Cuando el mundo está listo, se conecta con el director
juego.events.once('ready', () => {
  const mundo = juego.scene.getScene('mundo');
  const conectar = () => {
    director = crearDirector({ juego, ui, capa, sonido, titulo });
    mundo.director = director;
    director.mostrarTitulo();
  };
  if (mundo.capa) conectar();
  else mundo.events.once('lista', conectar);
});

// El mando: cruceta, A, B y START (en pantalla y teclado)
crearMando({
  capa,
  ui,
  sonido,
  mundo: () => juego.scene.getScene('mundo'),
  abrirMenu: () => director?.abrirMenu(),
});

document.getElementById('boton-sonido').addEventListener('click', (e) => {
  sonido.iniciar();
  const callado = sonido.alternar();
  e.currentTarget.textContent = callado ? '🔇' : '🔊';
  e.currentTarget.setAttribute('aria-pressed', String(callado));
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) sonido.musica(null);
});

// Si la pantalla cambia de tamaño (girar el iPad, aparece la barra de Safari),
// Phaser recalcula su tamaño para que cada toque caiga en la casilla correcta.
new ResizeObserver(() => juego.scale.refresh()).observe(document.querySelector('.pantalla'));

// Para depurar desde la consola del navegador
window.monsterRush = { juego, ui };
