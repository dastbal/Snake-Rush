/**
 * Menús de Anime Rush (HTML encima del canvas, ADR 0005):
 * título → modo → luchadores → rivales → escenario → reglas, y los resultados.
 * Cada pantalla es una Promesa; VOLVER regresa al paso anterior.
 */
import { LUCHADORES, SERIES } from '../datos/luchadores.js';
import { ESCENARIOS } from '../datos/escenarios.js';
import { NIVELES_IA } from '../nucleo/ia.js';
import { retrato } from '../graficos/texturas.js';

const VOLVER = Symbol('volver');

export function crearMenus({ capa, sonido }) {
  /** Muestra una pantalla de opciones. Devuelve el valor elegido o VOLVER. */
  function elegir({ titulo, opciones, columnas = 2, volver = true, clase = '' }) {
    return new Promise((listo) => {
      const div = document.createElement('div');
      div.className = `menu ${clase}`;
      div.innerHTML = `<h2></h2><div class="opciones"></div>`;
      div.querySelector('h2').textContent = titulo;
      const lista = div.querySelector('.opciones');
      lista.style.gridTemplateColumns = `repeat(${columnas}, minmax(0, 1fr))`;
      const cerrar = (valor) => {
        sonido.elegir();
        div.remove();
        listo(valor);
      };
      for (const op of opciones) {
        const b = document.createElement('button');
        b.type = 'button';
        if (op.color) b.style.setProperty('--color', op.color);
        if (op.imagen) {
          const img = document.createElement('img');
          img.src = op.imagen;
          img.alt = '';
          b.appendChild(img);
        }
        const t = document.createElement('span');
        t.className = 'op-texto';
        t.textContent = op.texto;
        b.appendChild(t);
        if (op.detalle) {
          const d = document.createElement('span');
          d.className = 'op-detalle';
          d.textContent = op.detalle;
          b.appendChild(d);
        }
        b.addEventListener('click', () => cerrar(op.valor));
        lista.appendChild(b);
      }
      if (volver) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'volver';
        b.textContent = '◀ VOLVER';
        b.addEventListener('click', () => cerrar(VOLVER));
        div.appendChild(b);
      }
      capa.appendChild(div);
    });
  }

  /**
   * Elegir luchador en dos pasos: primero el anime, después el personaje.
   * Devuelve el id del luchador, o VOLVER.
   */
  async function elegirLuchador(titulo) {
    while (true) {
      const serie = await elegir({
        titulo: `${titulo}: ELIGE EL ANIME`, columnas: 4, clase: 'menu-luchadores',
        opciones: Object.entries(SERIES).map(([id, s]) => ({
          texto: s.nombre.toUpperCase(), imagen: retrato(Object.keys(s.luchadores)[0], 2), color: s.color, valor: id,
        })),
      });
      if (serie === VOLVER) return VOLVER;
      const id = await elegir({
        titulo: `${titulo}: ${SERIES[serie].nombre.toUpperCase()}`, columnas: 4, clase: 'menu-luchadores',
        opciones: Object.keys(SERIES[serie].luchadores).map((lid) => {
          const l = LUCHADORES[lid];
          return { texto: l.nombre, detalle: `${l.lema}\nB: ${l.especial.nombre}${l.poderes ? `\n▶B: ${l.poderes.lado?.nombre ?? '-'} · ▼B: ${l.poderes.abajo?.nombre ?? '-'}\n▼▶B: ${l.poderes.super?.nombre ?? '-'}` : ''}`, imagen: retrato(lid, 3), color: l.color, valor: lid };
        }),
      });
      if (id !== VOLVER) return id;
    }
  }

  /**
   * Arma la configuración de la pelea paso a paso.
   * Devuelve { jugadores, escenario, reglas, objetos } o null si vuelve al título.
   */
  async function configurar(anterior = {}) {
    const c = { ...anterior };
    const pasos = ['modo', 'j1', 'j2', 'rivales', 'dificultad', 'escenario', 'reglas', 'objetos'];
    let i = 0;
    while (i < pasos.length) {
      const paso = pasos[i];
      // Pasos que no aplican se saltan (en la dirección en que vamos)
      const saltar = (paso === 'j2' && c.humanos !== 2) || (paso === 'dificultad' && c.rivales === 0);
      if (saltar) { i += c.ultimoPaso === 'atras' ? -1 : 1; continue; }

      let r;
      if (paso === 'modo') {
        r = await elegir({
          titulo: 'MODO', volver: true, opciones: [
            { texto: '1 JUGADOR', detalle: 'Tú contra la compu', valor: 1 },
            { texto: '2 JUGADORES', detalle: 'Dos mandos en este iPad', valor: 2 },
          ],
        });
        if (r === VOLVER) return null;
        c.humanos = r;
      } else if (paso === 'j1' || paso === 'j2') {
        r = await elegirLuchador(paso === 'j1' ? 'J1' : 'J2');
        if (r !== VOLVER) c[paso] = r;
      } else if (paso === 'rivales') {
        const min = c.humanos === 1 ? 1 : 0;
        const max = 4 - c.humanos;
        const ops = [];
        for (let n = min; n <= max; n++) ops.push({ texto: n === 0 ? 'NINGUNO' : `${n} RIVAL${n > 1 ? 'ES' : ''}`, detalle: n === 0 ? 'Solo ustedes dos' : 'Controlados por la compu', valor: n });
        r = await elegir({ titulo: 'RIVALES DE LA COMPU', opciones: ops, columnas: ops.length });
        if (r !== VOLVER) c.rivales = r;
      } else if (paso === 'dificultad') {
        r = await elegir({ titulo: 'DIFICULTAD', opciones: Object.keys(NIVELES_IA).map((n) => ({ texto: n.toUpperCase(), valor: n })), columnas: 3 });
        if (r !== VOLVER) c.dificultad = r;
      } else if (paso === 'escenario') {
        r = await elegir({ titulo: 'ESCENARIO', opciones: Object.entries(ESCENARIOS).map(([id, e]) => ({ texto: e.nombre.toUpperCase(), valor: id })), columnas: 2 });
        if (r !== VOLVER) c.escenario = r;
      } else if (paso === 'reglas') {
        r = await elegir({
          titulo: 'REGLAS', columnas: 3, opciones: [
            { texto: '1 VIDA', valor: { tipo: 'vidas', vidas: 1 } },
            { texto: '3 VIDAS', valor: { tipo: 'vidas', vidas: 3 } },
            { texto: '5 VIDAS', valor: { tipo: 'vidas', vidas: 5 } },
            { texto: '1 MINUTO', detalle: 'Gana quien saque más', valor: { tipo: 'tiempo', segundos: 60 } },
            { texto: '2 MINUTOS', detalle: 'Gana quien saque más', valor: { tipo: 'tiempo', segundos: 120 } },
            { texto: '3 MINUTOS', detalle: 'Gana quien saque más', valor: { tipo: 'tiempo', segundos: 180 } },
          ],
        });
        if (r !== VOLVER) c.reglas = r;
      } else if (paso === 'objetos') {
        r = await elegir({
          titulo: 'OBJETOS', columnas: 2, opciones: [
            { texto: 'SÍ', detalle: 'Onigiri, bombas y esferas de poder', valor: true },
            { texto: 'NO', detalle: 'Pelea pura', valor: false },
          ],
        });
        if (r !== VOLVER) c.objetos = r;
      }
      c.ultimoPaso = r === VOLVER ? 'atras' : 'adelante';
      i += r === VOLVER ? -1 : 1;
    }
    return armarPelea(c);
  }

  /** Convierte las elecciones en la lista de jugadores para el motor. */
  function armarPelea(c) {
    const ids = Object.keys(LUCHADORES);
    const jugadores = [{ personaje: c.j1, control: 'humano', etiqueta: 'J1' }];
    if (c.humanos === 2) jugadores.push({ personaje: c.j2, control: 'humano', etiqueta: 'J2' });
    const libres = ids.filter((id) => !jugadores.some((j) => j.personaje === id));
    for (let n = 0; n < c.rivales; n++) {
      const personaje = libres.length ? libres.splice(Math.floor(Math.random() * libres.length), 1)[0] : ids[n % ids.length];
      jugadores.push({ personaje, control: 'cpu', nivel: c.dificultad, etiqueta: 'CPU' });
    }
    return { jugadores, escenario: c.escenario, reglas: c.reglas, objetos: c.objetos, elecciones: c };
  }

  /** Pantalla de resultados. Devuelve 'revancha' o 'menu'. */
  async function resultados(estado, jugadores) {
    const g = estado.ganador;
    const tabla = estado.luchadores
      .map((l) => `${LUCHADORES[l.personaje].nombre} (${jugadores[l.indice].etiqueta}) · KOs ${l.kos} · caídas ${l.caidas}`)
      .join('\n');
    return elegir({
      titulo: g === null ? '¡EMPATE!' : `¡GANA ${LUCHADORES[estado.luchadores[g].personaje].nombre}!`,
      clase: 'menu-resultados',
      volver: false,
      columnas: g === null ? 2 : 3,
      opciones: [
        ...(g === null ? [] : [{ texto: jugadores[g].etiqueta, detalle: tabla, imagen: retrato(estado.luchadores[g].personaje, 5), valor: 'revancha' }]),
        { texto: 'REVANCHA', detalle: 'La misma pelea otra vez', valor: 'revancha' },
        { texto: 'MENÚ', detalle: 'Cambiar luchadores o escenario', valor: 'menu' },
      ],
    });
  }

  async function pausa() {
    return elegir({
      titulo: 'PAUSA', volver: false, columnas: 2, opciones: [
        { texto: 'SEGUIR', valor: 'seguir' },
        { texto: 'SALIR', detalle: 'Volver al menú', valor: 'salir' },
      ],
    });
  }

  return { configurar, resultados, pausa };
}
