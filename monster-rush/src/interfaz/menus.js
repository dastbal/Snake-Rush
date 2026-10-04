/**
 * Menús del mundo: MENÚ (equipo, mochila, guardar), tienda y elegir inicial.
 */
import { ESPECIES, INICIALES } from '../datos/especies.js';
import { OBJETOS, TIENDA } from '../datos/objetos.js';
import { ATAQUES } from '../datos/ataques.js';
import { TIPOS } from '../datos/tipos.js';
import { partida, guardarPartida, comprar, darInicial } from '../nucleo/partida.js';
import { stats, nombre, curar, debilitada, expParaNivel } from '../nucleo/criatura.js';
import { imagenCriatura } from '../graficos/texturas.js';

const tiposDe = (especie) => ESPECIES[especie].tipos.map((t) => TIPOS[t].nombre).join('/');

export function crearMenus({ ui, sonido, alSalir }) {
  function opcionCriatura(c, deshabilitado = false) {
    return {
      texto: `${nombre(c)} Nv${c.nivel}`,
      detalle: `PS ${c.ps}/${stats(c).psMax} · ${tiposDe(c.especie)}`,
      imagen: imagenCriatura(c.especie, 2),
      deshabilitado,
    };
  }

  async function verCriatura(c) {
    const s = stats(c);
    const falta = expParaNivel(c.nivel + 1) - c.exp;
    await ui.decir([
      `${nombre(c)} · ${tiposDe(c.especie)} · Nv${c.nivel}\nPS ${c.ps}/${s.psMax} · ATQ ${s.ataque} · DEF ${s.defensa} · VEL ${s.velocidad}`,
      `Le faltan ${falta} EXP para subir de nivel.\nAtaques: ${c.ataques.map((a) => ATAQUES[a.id].nombre).join(', ')}.`,
    ]);
  }

  async function menuEquipo() {
    while (true) {
      const i = await ui.elegir(partida.equipo.map((c) => opcionCriatura(c)), { titulo: 'EQUIPO' });
      if (i < 0) return;
      const c = partida.equipo[i];
      const op = await ui.elegir(['VER DATOS', 'PONER PRIMERA'], { titulo: nombre(c) });
      if (op === 0) await verCriatura(c);
      if (op === 1) {
        partida.equipo.splice(i, 1);
        partida.equipo.unshift(c);
      }
    }
  }

  async function menuMochila() {
    while (true) {
      const ids = Object.keys(partida.mochila).filter((id) => partida.mochila[id] > 0 && OBJETOS[id]);
      if (!ids.length) {
        await ui.decir('La mochila está vacía.');
        return;
      }
      const i = await ui.elegir(ids.map((id) => ({
        texto: OBJETOS[id].nombre.toUpperCase(), detalle: `×${partida.mochila[id]} · ${OBJETOS[id].texto}`,
      })), { titulo: 'MOCHILA' });
      if (i < 0) return;
      const objeto = OBJETOS[ids[i]];
      if (objeto.usar !== 'curar') {
        await ui.decir('Eso solo se usa en combate.');
        continue;
      }
      const j = await ui.elegir(partida.equipo.map((c) => opcionCriatura(c, debilitada(c) || c.ps >= stats(c).psMax)), { titulo: '¿A quién curas?' });
      if (j < 0) continue;
      partida.mochila[ids[i]] -= 1;
      const c = partida.equipo[j];
      const curado = curar(c, objeto.cura);
      sonido.curar();
      await ui.decir(`${nombre(c)} recuperó ${curado} PS.`);
    }
  }

  async function menuPrincipal() {
    while (true) {
      const medallas = partida.banderas.lider ? '🏅1' : '🏅0';
      const op = await ui.elegir(['EQUIPO', 'MOCHILA', 'GUARDAR', 'SALIR AL TÍTULO'], {
        titulo: `$${partida.dinero}  ·  ${medallas}`, columnas: 2,
      });
      if (op < 0) return;
      if (op === 0) {
        if (partida.equipo.length) await menuEquipo();
        else await ui.decir('Todavía no tienes criaturas.');
      }
      if (op === 1) await menuMochila();
      if (op === 2) {
        await ui.decir(guardarPartida() ? 'Partida guardada.' : 'No se pudo guardar en este navegador.');
      }
      if (op === 3) {
        const seguro = await ui.elegir(['SÍ, SALIR', 'NO'], { titulo: '¿Salir? Se guardará la partida.', cancelar: false });
        if (seguro === 0) {
          guardarPartida();
          alSalir();
          return;
        }
      }
    }
  }

  async function tienda() {
    await ui.decir('¡Bienvenido a la TIENDA! ¿Qué necesitas?');
    while (true) {
      const i = await ui.elegir(TIENDA.map((id) => ({
        texto: OBJETOS[id].nombre.toUpperCase(),
        detalle: `$${OBJETOS[id].precio} · tienes ${partida.mochila[id] || 0}`,
        deshabilitado: partida.dinero < OBJETOS[id].precio,
      })), { titulo: `TU DINERO: $${partida.dinero}` });
      if (i < 0) break;
      const id = TIENDA[i];
      if (comprar(id, OBJETOS[id].precio)) {
        sonido.comprar();
      } else {
        await ui.decir('No te alcanza el dinero.');
      }
    }
    await ui.decir('¡Vuelve pronto!');
  }

  async function elegirInicial() {
    while (true) {
      const i = await ui.elegir(INICIALES.map((id) => ({
        texto: ESPECIES[id].nombre, detalle: tiposDe(id), imagen: imagenCriatura(id, 3),
      })), { titulo: 'Elige tu primera criatura', cancelar: false, columnas: 3, clase: 'menu-iniciales' });
      const id = INICIALES[i];
      const ok = await ui.elegir(['¡SÍ!', 'NO, OTRA'], { titulo: `¿Eliges a ${ESPECIES[id].nombre}, de tipo ${tiposDe(id)}?`, cancelar: false });
      if (ok === 0) {
        darInicial(id);
        sonido.victoria();
        await ui.decir([`¡Recibiste a ${ESPECIES[id].nombre}!`, 'También te doy 5 MONSTER BALLS para atrapar criaturas.']);
        return;
      }
    }
  }

  return { menuPrincipal, tienda, elegirInicial };
}
