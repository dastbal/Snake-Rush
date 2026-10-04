/**
 * Interfaz del combate: cajas de vida, menú de acciones y mostrar los "pasos"
 * que devuelve el motor de combate (nucleo/combate.js).
 */
import { ATAQUES } from '../datos/ataques.js';
import { OBJETOS } from '../datos/objetos.js';
import { TIPOS } from '../datos/tipos.js';
import { stats, nombre, debilitada } from '../nucleo/criatura.js';
import { imagenCriatura } from '../graficos/texturas.js';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Crea una caja de información (nombre, nivel y barra de vida). */
function crearInfo(capa, lado) {
  const div = document.createElement('div');
  div.className = `info info-${lado}`;
  div.innerHTML = '<p class="info-nombre"></p><div class="barra"><span>PS</span><div class="vida"><i></i></div></div><p class="info-ps"></p>';
  capa.appendChild(div);
  return {
    div,
    mostrar(c, animar = false) {
      const s = stats(c);
      div.querySelector('.info-nombre').textContent = `${nombre(c)}  Nv${c.nivel}`;
      const pct = Math.max(0, (c.ps / s.psMax) * 100);
      const barra = div.querySelector('.vida i');
      barra.style.transition = animar ? 'width 450ms linear' : 'none';
      barra.style.width = `${pct}%`;
      barra.dataset.nivel = pct > 50 ? 'alto' : pct > 20 ? 'medio' : 'bajo';
      div.querySelector('.info-ps').textContent = lado === 'jugador' ? `${c.ps}/${s.psMax}` : '';
    },
  };
}

/**
 * Juega un combate completo. Devuelve el resultado:
 * 'victoria' | 'derrota' | 'huida' | 'captura'
 */
export async function jugarCombate({ combate, escena, ui, capa, equipo, mochila, sonido }) {
  const info = { rival: crearInfo(capa, 'rival'), jugador: crearInfo(capa, 'jugador') };
  const refrescar = (lado, animar) => info[lado].mostrar(combate.activa(lado), animar);

  sonido.musica('combate');
  info.jugador.div.hidden = true;
  refrescar('rival');
  await escena.entrar('rival', combate.activa('rival').especie);

  const inicio = combate.inicio();
  for (const paso of inicio) {
    await ui.decir(paso.texto);
  }
  await escena.entrar('jugador', combate.activa('jugador').especie);
  info.jugador.div.hidden = false;
  refrescar('jugador');

  async function mostrarPaso(paso) {
    switch (paso.tipo) {
      case 'texto':
        await ui.decir(paso.texto);
        break;
      case 'ps':
        sonido.golpe();
        await escena.golpe(paso.lado);
        refrescar(paso.lado, true);
        await espera(480);
        break;
      case 'entra':
        refrescar(paso.lado);
        await escena.entrar(paso.lado, combate.activa(paso.lado).especie);
        break;
      case 'debilitada':
        sonido.debilitada();
        await escena.debilitar(paso.lado);
        break;
      case 'bola':
        sonido.bola();
        await escena.bola(paso.sacudidas, paso.atrapada);
        break;
      case 'nivel':
        sonido.nivel();
        refrescar('jugador');
        break;
      default:
        break;
    }
  }

  /** Menús: LUCHAR / MOCHILA / EQUIPO / HUIR. Devuelve una acción o null. */
  async function elegirAccion() {
    const yo = combate.activa('jugador');
    const op = await ui.elegir(['LUCHAR', 'MOCHILA', 'EQUIPO', 'HUIR'], {
      titulo: `¿Qué hará ${nombre(yo)}?`, cancelar: false, columnas: 2, clase: 'menu-combate',
    });
    if (op === 0) {
      const i = await ui.elegir(yo.ataques.map((a) => {
        const at = ATAQUES[a.id];
        return { texto: at.nombre.toUpperCase(), detalle: `${TIPOS[at.tipo].nombre} · PP ${a.pp}/${at.pp}`, deshabilitado: a.pp <= 0 };
      }), { titulo: 'ATAQUES', columnas: 2, clase: 'menu-combate' });
      if (i < 0) return null;
      return { tipo: 'atacar', indice: i };
    }
    if (op === 1) {
      const ids = Object.keys(mochila).filter((id) => mochila[id] > 0 && OBJETOS[id]);
      if (!ids.length) {
        await ui.decir('¡La mochila está vacía!');
        return null;
      }
      const i = await ui.elegir(ids.map((id) => ({ texto: OBJETOS[id].nombre.toUpperCase(), detalle: `×${mochila[id]} · ${OBJETOS[id].texto}` })), { titulo: 'MOCHILA' });
      if (i < 0) return null;
      const id = ids[i];
      if (OBJETOS[id].usar === 'curar') {
        const j = await elegirCriatura('¿A quién curas?', (c) => !debilitada(c));
        if (j < 0) return null;
        return { tipo: 'objeto', id, objetivo: j };
      }
      return { tipo: 'objeto', id };
    }
    if (op === 2) {
      const j = await elegirCriatura('¿A quién envías?', (c, k) => !debilitada(c) && k !== combate.indiceJugador());
      if (j < 0) return null;
      return { tipo: 'cambiar', indice: j };
    }
    return { tipo: 'huir' };
  }

  function elegirCriatura(titulo, valida) {
    return ui.elegir(equipo.map((c, k) => ({
      texto: `${nombre(c)} Nv${c.nivel}`,
      detalle: `PS ${c.ps}/${stats(c).psMax}`,
      imagen: imagenCriatura(c.especie, 2),
      deshabilitado: !valida(c, k),
    })), { titulo });
  }

  while (!combate.resultado) {
    const accion = await elegirAccion();
    if (!accion) continue;
    for (const paso of combate.turno(accion)) await mostrarPaso(paso);
  }

  if (combate.resultado === 'victoria') sonido.victoria();
  await espera(300);
  info.rival.div.remove();
  info.jugador.div.remove();
  return combate.resultado;
}
