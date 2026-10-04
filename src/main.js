/**
 * Punto de entrada: arma todas las piezas y las conecta.
 *
 *   datos/      → qué hay en el juego (personajes, poderes, niveles)
 *   nucleo/     → reglas puras (no saben de Phaser ni del HTML)
 *   graficos/   → Phaser: dibuja y anima
 *   audio/      → sonidos generados con código
 *   interfaz/   → menú, pantallas, controles y récords
 *
 * Las piezas se comunican con eventos (nucleo/eventos.js).
 */
import { ANCHO, ALTO } from './config/ajustes.js';
import { crearEventos } from './nucleo/eventos.js';
import { crearReglas } from './nucleo/reglas.js';
import { crearEscena } from './graficos/escena.js';
import { crearSonido, conectarSonido } from './audio/sonido.js';
import { record } from './interfaz/records.js';
import { crearPantallas } from './interfaz/pantallas.js';
import { conectarControles } from './interfaz/controles.js';

const eventos = crearEventos();
const reglas = crearReglas(eventos);
const sonido = crearSonido();
conectarSonido(sonido, eventos);

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: ANCHO,
  height: ALTO,
  backgroundColor: '#000000',
  pixelArt: true,
  scene: crearEscena({ reglas, eventos, record }),
});

/** La hora del juego (la misma que usa el game loop de Phaser). */
const reloj = () => juego.loop.time;

const pantallas = crearPantallas({ reglas, eventos, sonido, reloj });
pantallas.iniciar();
conectarControles({ reglas, pausar: pantallas.pausar });

// Para depurar desde la consola del navegador
window.snakeRush = { juego, reglas, eventos };
