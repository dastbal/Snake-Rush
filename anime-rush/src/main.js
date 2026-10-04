/**
 * Punto de entrada de Anime Rush: arma las piezas y maneja el recorrido
 * título → configurar → pelea → resultados.
 *
 *   datos/      → QUÉ hay: luchadores, escenarios, objetos
 *   nucleo/     → CÓMO funciona: el motor de la pelea y la IA (sin Phaser)
 *   graficos/   → Phaser: fondos, luchadores y efectos
 *   audio/      → música y golpes de 8 bits
 *   interfaz/   → menús, marcador y mandos
 */
import { crearEventos } from '../../compartido/eventos.js';
import { crearPelea } from './nucleo/pelea.js';
import { crearIA } from './nucleo/ia.js';
import { ESCENARIOS } from './datos/escenarios.js';
import { LUCHADORES } from './datos/luchadores.js';
import { EscenaPelea } from './graficos/escena.js';
import { FONDOS } from './graficos/fondos.js';
import { crearTexturas, retrato } from './graficos/texturas.js';
import { crearSonido, conectarSonido } from './audio/sonido.js';
import { crearMenus } from './interfaz/menus.js';
import { crearMarcador } from './interfaz/marcador.js';
import { crearMandos } from './interfaz/mando.js';

/** Escena de portada: el escenario de la ciudad con los 4 luchadores. */
class EscenaPortada extends Phaser.Scene {
  constructor() { super('portada'); }
  create() {
    crearTexturas(this);
    FONDOS.ciudad(this.add.graphics());
    Object.keys(LUCHADORES).forEach((id, i) => {
      const img = this.add.image(120 + i * 80, 230, `l-${id}`).setOrigin(0.5, 1).setScale(1.5).setFlipX(i >= 2);
      this.tweens.add({ targets: img, y: 226, duration: 400 + i * 60, yoyo: true, repeat: -1 });
    });
  }
}

const capa = document.getElementById('capa');
const sonido = crearSonido();
const menus = crearMenus({ capa, sonido });
const marcador = crearMarcador(document.getElementById('hud'));

const juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: 480,
  height: 270,
  pixelArt: true,
  backgroundColor: '#0a0a28',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [EscenaPortada, EscenaPelea],
});
new ResizeObserver(() => juego.scale.refresh()).observe(document.querySelector('.pantalla'));

let enPelea = null; // { pelea, config } mientras se pelea
const mandos = crearMandos({
  izquierda: document.getElementById('mando-izq'),
  derecha: document.getElementById('mando-der'),
  alPausar: () => pausar(),
});

// ---------- Título ----------
const titulo = document.getElementById('titulo');
const retratos = titulo.querySelector('.retratos');
for (const id of Object.keys(LUCHADORES)) {
  const img = document.createElement('img');
  img.src = retrato(id, 4);
  img.alt = LUCHADORES[id].nombre;
  retratos.appendChild(img);
}
document.getElementById('jugar').addEventListener('click', async () => {
  sonido.iniciar();
  titulo.hidden = true;
  await irAlMenu();
});

async function irAlMenu(anterior) {
  sonido.musica('titulo');
  const config = await menus.configurar(anterior);
  if (!config) {
    titulo.hidden = false;
    return;
  }
  empezar(config);
}

// ---------- Pelea ----------
function empezar(config) {
  const eventos = crearEventos();
  conectarSonido(sonido, eventos);
  const pelea = crearPelea({ ...config, emitir: eventos.emitir });
  const humanos = config.jugadores.filter((j) => j.control === 'humano').length;
  mandos.preparar(humanos);
  document.body.classList.add('peleando');

  // Cada jugador lee sus botones: humanos del mando, la compu de su IA
  let h = 0;
  const lectores = config.jugadores.map((j, i) => {
    if (j.control === 'humano') {
      const entrada = mandos.entradas[h++];
      return () => ({ ...entrada });
    }
    const ia = crearIA({ nivel: j.nivel, escenario: config.escenario });
    return (dt) => ia(pelea.estado, i, dt);
  });

  marcador.preparar(pelea.estado, config.jugadores);
  enPelea = { pelea, config };
  eventos.en('fin', () => setTimeout(() => terminar(pelea, config), 1500));

  juego.scene.stop('portada');
  juego.scene.start('pelea', {
    pelea,
    escenario: config.escenario,
    eventos,
    etiquetas: config.jugadores.map((j) => j.etiqueta),
    leerEntradas: (dt) => {
      marcador.actualizar(pelea.estado);
      return lectores.map((leer) => leer(dt));
    },
  });
  sonido.musica(ESCENARIOS[config.escenario].musica);
}

async function terminar(pelea, config) {
  if (enPelea?.pelea !== pelea) return;
  enPelea = null;
  const r = await menus.resultados(pelea.estado, config.jugadores);
  if (r === 'revancha') empezar({ ...config });
  else salirAlMenu(config.elecciones);
}

function salirAlMenu(elecciones) {
  enPelea = null;
  document.body.classList.remove('peleando');
  marcador.limpiar();
  juego.scene.stop('pelea');
  juego.scene.start('portada');
  irAlMenu(elecciones);
}

async function pausar() {
  if (!enPelea || capa.querySelector('.menu')) return;
  const escena = juego.scene.getScene('pelea');
  escena.pausado = true;
  sonido.musica(null);
  const r = await menus.pausa();
  if (r === 'salir') {
    salirAlMenu(enPelea.config.elecciones);
    return;
  }
  escena.pausado = false;
  sonido.musica(ESCENARIOS[enPelea.config.escenario].musica);
}

document.getElementById('boton-pausa').addEventListener('click', () => pausar());
document.getElementById('boton-sonido').addEventListener('click', (e) => {
  sonido.iniciar();
  const callado = sonido.alternar();
  e.currentTarget.textContent = callado ? '🔇' : '🔊';
  e.currentTarget.setAttribute('aria-pressed', String(callado));
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pausar();
});

// Para depurar desde la consola del navegador
window.animeRush = { juego, get enPelea() { return enPelea; } };
