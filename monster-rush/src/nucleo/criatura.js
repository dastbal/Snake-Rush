/**
 * Criaturas: crear, calcular estadísticas, ganar experiencia y evolucionar.
 * Funciones puras sobre objetos simples (se pueden guardar con JSON).
 */
import { ESPECIES } from '../datos/especies.js';
import { ATAQUES } from '../datos/ataques.js';

export const MAX_ATAQUES = 4;
export const NIVEL_MAXIMO = 100;

/** Experiencia total necesaria para llegar a un nivel. */
export const expParaNivel = (nivel) => nivel ** 3;

/** Estadísticas reales según la especie y el nivel. */
export function stats(c) {
  const b = ESPECIES[c.especie].base;
  const calc = (base) => Math.floor((base * 2 * c.nivel) / 100) + 5;
  return {
    psMax: Math.floor((b.ps * 2 * c.nivel) / 100) + c.nivel + 10,
    ataque: calc(b.ataque),
    defensa: calc(b.defensa),
    velocidad: calc(b.velocidad),
  };
}

/** Los últimos 4 ataques que la especie aprende hasta ese nivel. */
function ataquesIniciales(especie, nivel) {
  return ESPECIES[especie].aprende
    .filter(([n]) => n <= nivel)
    .map(([, id]) => id)
    .slice(-MAX_ATAQUES)
    .map((id) => ({ id, pp: ATAQUES[id].pp }));
}

export function crearCriatura(especie, nivel) {
  if (!ESPECIES[especie]) throw new Error(`No existe la especie ${especie}`);
  const c = { especie, nivel, exp: expParaNivel(nivel), ataques: ataquesIniciales(especie, nivel), ps: 0 };
  c.ps = stats(c).psMax;
  return c;
}

export const nombre = (c) => ESPECIES[c.especie].nombre;
export const debilitada = (c) => c.ps <= 0;

export function curar(c, cantidad = Infinity) {
  const max = stats(c).psMax;
  const antes = c.ps;
  c.ps = Math.min(max, c.ps + cantidad);
  if (cantidad === Infinity) c.ataques.forEach((a) => { a.pp = ATAQUES[a.id].pp; });
  return c.ps - antes;
}

/** Experiencia que da una criatura al ser derrotada. */
export function expQueDa(c, deEntrenador) {
  const base = Math.floor((ESPECIES[c.especie].expBase * c.nivel) / 7);
  return deEntrenador ? Math.floor(base * 1.5) : base;
}

/**
 * Suma experiencia. Devuelve lo que pasó, en orden:
 * [{ tipo: 'nivel', nivel }, { tipo: 'aprende', ataque, olvida? }]
 */
export function ganarExp(c, cantidad) {
  const sucesos = [];
  c.exp += cantidad;
  while (c.nivel < NIVEL_MAXIMO && c.exp >= expParaNivel(c.nivel + 1)) {
    const maxAntes = stats(c).psMax;
    c.nivel += 1;
    c.ps += stats(c).psMax - maxAntes; // al subir de nivel también sube la vida actual
    sucesos.push({ tipo: 'nivel', nivel: c.nivel });
    for (const [n, id] of ESPECIES[c.especie].aprende) {
      if (n !== c.nivel || c.ataques.some((a) => a.id === id)) continue;
      let olvida = null;
      if (c.ataques.length >= MAX_ATAQUES) olvida = c.ataques.shift().id;
      c.ataques.push({ id, pp: ATAQUES[id].pp });
      sucesos.push({ tipo: 'aprende', ataque: id, olvida });
    }
  }
  return sucesos;
}

/** ¿Le toca evolucionar? Devuelve la especie nueva o null. */
export function evolucionPendiente(c) {
  const evo = ESPECIES[c.especie].evoluciona;
  return evo && c.nivel >= evo.nivel ? evo.a : null;
}

export function evolucionar(c) {
  const nueva = evolucionPendiente(c);
  if (!nueva) return false;
  const maxAntes = stats(c).psMax;
  c.especie = nueva;
  c.ps += stats(c).psMax - maxAntes;
  return true;
}
