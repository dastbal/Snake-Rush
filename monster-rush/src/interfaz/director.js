/**
 * El director decide qué pasa en el mundo: puertas, salidas, pasto alto,
 * hablar con personas, combates, evoluciones y la pantalla de título.
 * Las escenas de Phaser solo le avisan "llegué aquí" o "toqué esto".
 */
import { REAPARECER } from '../datos/mapas.js';
import {
  partida, reiniciarPartida, cargarPartida, hayGuardado, guardarPartida,
  agregarCriatura, curarEquipo,
} from '../nucleo/partida.js';
import { mapa, loseta, personaEn, letreroEn, puertaEn, salidaEn, tirarEncuentro } from '../nucleo/mundo.js';
import { crearCriatura, nombre, evolucionPendiente, evolucionar } from '../nucleo/criatura.js';
import { crearCombate } from '../nucleo/combate.js';
import { ESPECIES } from '../datos/especies.js';
import { jugarCombate } from './combateUI.js';
import { crearMenus } from './menus.js';

export function crearDirector({ juego, ui, capa, sonido, titulo }) {
  const mundo = () => juego.scene.getScene('mundo');
  let enCombate = false;
  let enTitulo = true;

  const menus = crearMenus({ ui, sonido, alSalir: mostrarTitulo });

  function entrarAlMapa({ anunciar = true } = {}) {
    const m = mapa(partida.mapa);
    mundo().dibujarMapa();
    sonido.musica(m.musica);
    if (anunciar) ui.aviso(m.nombre);
  }

  // ---------- Puertas ----------
  const PUERTAS = {
    async casa() {
      curarEquipo();
      guardarPartida();
      sonido.curar();
      await ui.decir(['MAMÁ: ¡Hola, cariño! Descansa un poco.', '...Tu equipo está como nuevo.', 'Partida guardada.']);
    },
    async laboratorio() {
      if (!partida.banderas.inicial) {
        await ui.decir([
          'PROF. ROBLE: ¡Hola! Te estaba esperando.',
          'El mundo está lleno de criaturas. Algunas son amigas y otras... ¡salvajes!',
          'Para empezar tu aventura necesitas una compañera.',
        ]);
        await menus.elegirInicial();
        guardarPartida();
        await ui.decir('PROF. ROBLE: Ve al norte por la RUTA 1. La LÍDER VOLTA te espera.');
      } else {
        await ui.decir('PROF. ROBLE: ¿Ya fuiste a la RUTA 1? ¡Atrapa criaturas en el pasto alto!');
      }
    },
    async centro() {
      await ui.decir('¡Bienvenido al CENTRO DE CURACIÓN! Cuidaremos de tu equipo.');
      curarEquipo();
      sonido.curar();
      guardarPartida();
      await ui.decir(['...', '¡Listo! Tus criaturas están como nuevas.', 'Partida guardada.']);
    },
    async tienda() {
      await menus.tienda();
      guardarPartida();
    },
  };

  /** Después de entrar por una puerta, el jugador sale un paso hacia abajo. */
  function salirDePuerta() {
    partida.y += 1;
    partida.dir = 'abajo';
    mundo().colocarJugador();
  }

  // ---------- Combates ----------
  async function combatir(rival) {
    enCombate = true;
    await mundo().destello();
    const escena = juego.scene.getScene('combate');
    const lista = new Promise((r) => escena.events.once('lista', r));
    juego.scene.start('combate'); // corre encima del mundo, sin detenerlo
    await lista;
    const combate = crearCombate({ equipo: partida.equipo, rival, mochila: partida.mochila });
    const resultado = await jugarCombate({ combate, escena, ui, capa, equipo: partida.equipo, mochila: partida.mochila, sonido });

    if (resultado === 'captura') {
      const c = combate.capturada;
      const destino = agregarCriatura(c);
      await ui.decir(destino === 'equipo' ? `¡${nombre(c)} se unió a tu equipo!` : `Tu equipo está lleno: ${nombre(c)} se fue a la CAJA.`);
    }
    if (resultado === 'victoria' && rival.entrenador) partida.dinero += rival.entrenador.dinero;
    await revisarEvoluciones(escena);

    juego.scene.stop('combate');
    enCombate = false;
    if (resultado === 'derrota') {
      partida.dinero = Math.floor(partida.dinero / 2);
      curarEquipo();
      Object.assign(partida, { mapa: REAPARECER.mapa, x: REAPARECER.x, y: REAPARECER.y, dir: 'arriba' });
      entrarAlMapa({ anunciar: false });
      await ui.decir(['...', 'Despiertas en el CENTRO DE CURACIÓN.', 'Perdiste la mitad de tu dinero.']);
    } else {
      sonido.musica(mapa(partida.mapa).musica);
    }
    guardarPartida();
    return resultado;
  }

  async function revisarEvoluciones(escena) {
    for (const c of partida.equipo) {
      const nueva = evolucionPendiente(c);
      if (!nueva) continue;
      const antes = c.especie;
      await ui.decir(`¿Qué? ¡${nombre(c)} está evolucionando!`);
      sonido.evolucion();
      await escena.evolucion(antes, nueva);
      evolucionar(c);
      await ui.decir(`¡${ESPECIES[antes].nombre} evolucionó en ${nombre(c)}!`);
    }
  }

  // ---------- Lo que avisan las escenas ----------
  /** El jugador llegó a una casilla. Devuelve false para detener su camino. */
  async function alLlegar(x, y) {
    const m = mapa(partida.mapa);

    const salida = salidaEn(m, x, y);
    if (salida) {
      if (salida.requiere && !partida.banderas[salida.requiere]) {
        await ui.decir(['PROF. ROBLE: ¡Espera! ¡No salgas sin una criatura!', 'Ven a mi LABORATORIO, la casa de techo azul.']);
        partida.y += 1;
        mundo().colocarJugador();
        return false;
      }
      Object.assign(partida, { mapa: salida.a, x: salida.ax, y: salida.ay });
      entrarAlMapa();
      guardarPartida();
      return false;
    }

    const puerta = puertaEn(m, x, y);
    if (puerta) {
      sonido.puerta();
      await PUERTAS[puerta.accion]();
      salirDePuerta();
      return false;
    }

    if (loseta(m, x, y).alto) {
      const salvaje = tirarEncuentro(m);
      if (salvaje) {
        await combatir({ criaturas: [salvaje] });
        return false;
      }
    }
    return true;
  }

  /** El jugador habló con lo que hay en (x, y). */
  async function alHablar(x, y) {
    if (ocupado()) return;
    const m = mapa(partida.mapa);
    const letrero = letreroEn(m, x, y);
    if (letrero) {
      await ui.decir(letrero.texto);
      return;
    }
    const p = personaEn(m, x, y);
    if (!p) return;
    const e = p.entrenador;
    if (!e) {
      await ui.decir(p.dialogo);
      return;
    }
    if (partida.banderas[p.id]) {
      await ui.decir(e.derrota.at(-1));
      return;
    }
    await ui.decir(p.dialogo);
    const rival = {
      criaturas: e.equipo.map(([especie, nivel]) => crearCriatura(especie, nivel)),
      entrenador: { nombre: e.nombre, dinero: e.dinero },
    };
    const resultado = await combatir(rival);
    if (resultado === 'victoria') {
      partida.banderas[p.id] = true;
      if (e.lider) {
        partida.banderas.medalla = true;
        sonido.victoria();
      }
      guardarPartida();
      await ui.decir(e.derrota);
    }
  }

  async function abrirMenu() {
    if (ocupado()) return;
    sonido.blip();
    await menus.menuPrincipal();
  }

  // ---------- Título ----------
  function mostrarTitulo() {
    enTitulo = true;
    sonido.musica('titulo');
    titulo.mostrar({ hayGuardado: hayGuardado() });
  }

  async function empezar(nueva) {
    enTitulo = false;
    titulo.ocultar();
    if (nueva || !cargarPartida()) {
      reiniciarPartida();
      entrarAlMapa();
      await ui.decir([
        '¡Hola! Bienvenido al mundo de MONSTER RUSH.',
        'Aquí viven criaturas increíbles. ¡Tu aventura empieza hoy!',
        'Toca el mapa para caminar. Toca a las personas para hablar.',
        'Primero, ve al LABORATORIO del PROF. ROBLE: la casa de techo azul.',
      ]);
      guardarPartida();
    } else {
      entrarAlMapa();
    }
  }

  const ocupado = () => enTitulo || enCombate || ui.ocupado();

  return { alLlegar, alHablar, abrirMenu, mostrarTitulo, empezar, ocupado };
}
