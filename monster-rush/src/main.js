/**
 * Punto de entrada de Monster Rush: arma y conecta todas las piezas.
 *
 *   datos/      → QUÉ hay: especies, ataques, tipos, objetos, mapas y arte
 *   nucleo/     → CÓMO funciona: criaturas, combate, partida y mundo (sin Phaser)
 *   graficos/   → Phaser: mapa, jugador y animaciones de combate
 *   audio/      → música y efectos de 8 bits
 *   interfaz/   → textos, menús, combate, título y el "director" de la historia
 */
import { EscenaMundo } from './graficos/escenaMundo.js';
import { EscenaCombate } from './graficos/escenaCombate.js';
import { crearSonido } from './audio/sonido.js';
import { crearUI } from './interfaz/ui.js';
import { crearTitulo } from './interfaz/titulo.js';
import { crearDirector } from './interfaz/director.js';

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

// Botones de la consola
document.getElementById('boton-menu').addEventListener('click', () => director?.abrirMenu());
document.getElementById('boton-sonido').addEventListener('click', (e) => {
  sonido.iniciar();
  const callado = sonido.alternar();
  e.currentTarget.textContent = callado ? '🔇' : '🔊';
  e.currentTarget.setAttribute('aria-pressed', String(callado));
});
document.addEventListener('keydown', (e) => {
  if (!director || director.ocupado()) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    juego.scene.getScene('mundo').hablarEnfrente();
  } else if (e.key === 'Escape' || e.key === 'm') {
    director.abrirMenu();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) sonido.musica(null);
});

// Para depurar desde la consola del navegador
window.monsterRush = { juego, ui };
