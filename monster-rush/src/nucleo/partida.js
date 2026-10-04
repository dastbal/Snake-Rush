/**
 * La partida: todo lo que se guarda (dónde estás, tu equipo, tu mochila...).
 */
import { leer, guardar, borrar } from '../../../compartido/guardado.js';
import { INICIO } from '../datos/mapas.js';
import { crearCriatura, curar, debilitada } from './criatura.js';

const CLAVE = 'monster-rush-partida';
export const MAX_EQUIPO = 6;

export function partidaNueva() {
  return {
    mapa: INICIO.mapa,
    x: INICIO.x,
    y: INICIO.y,
    dir: 'abajo',
    equipo: [],
    caja: [], // criaturas atrapadas cuando el equipo está lleno
    mochila: { pocion: 2, bola: 0 },
    dinero: 500,
    /** Cosas que ya pasaron: { inicial: true, tito: true, lider: true } */
    banderas: {},
  };
}

/** La partida que se está jugando ahora. */
export const partida = partidaNueva();

export function reiniciarPartida() {
  Object.assign(partida, partidaNueva());
}

export const hayGuardado = () => leer(CLAVE) !== null;

export function guardarPartida() {
  return guardar(CLAVE, partida);
}

export function cargarPartida() {
  const datos = leer(CLAVE);
  if (!datos) return false;
  Object.assign(partida, partidaNueva(), datos);
  return true;
}

export const borrarPartida = () => borrar(CLAVE);

// ---------- Ayudantes ----------
export function agregarCriatura(c) {
  if (partida.equipo.length < MAX_EQUIPO) {
    partida.equipo.push(c);
    return 'equipo';
  }
  partida.caja.push(c);
  return 'caja';
}

export function darInicial(especie) {
  agregarCriatura(crearCriatura(especie, 5));
  partida.banderas.inicial = true;
  partida.mochila.bola = (partida.mochila.bola || 0) + 5;
}

export const curarEquipo = () => partida.equipo.forEach((c) => curar(c));
export const equipoVivo = () => partida.equipo.some((c) => !debilitada(c));

export function comprar(id, precio, cantidad = 1) {
  const total = precio * cantidad;
  if (partida.dinero < total) return false;
  partida.dinero -= total;
  partida.mochila[id] = (partida.mochila[id] || 0) + cantidad;
  return true;
}
