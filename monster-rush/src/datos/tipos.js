/**
 * Tipos de criaturas y su tabla de ventajas.
 * Para agregar un tipo: agrégalo a TIPOS y escribe contra quién es fuerte o débil.
 */
export const TIPOS = {
  normal: { nombre: 'NORMAL', color: '#a8a878' },
  fuego: { nombre: 'FUEGO', color: '#f08030' },
  agua: { nombre: 'AGUA', color: '#6890f0' },
  planta: { nombre: 'PLANTA', color: '#78c850' },
  electrico: { nombre: 'ELÉCTRICO', color: '#f8d030' },
  volador: { nombre: 'VOLADOR', color: '#a890f0' },
};

/** atacante → { defensor: multiplicador }. Lo que no aparece vale x1. */
const TABLA = {
  fuego: { planta: 2, agua: 0.5, fuego: 0.5 },
  agua: { fuego: 2, planta: 0.5, agua: 0.5 },
  planta: { agua: 2, fuego: 0.5, planta: 0.5, volador: 0.5 },
  electrico: { agua: 2, volador: 2, planta: 0.5, electrico: 0.5 },
  volador: { planta: 2, electrico: 0.5 },
};

/** Multiplicador de un ataque de tipo `ataque` contra una criatura con `tiposDefensor`. */
export function efectividad(ataque, tiposDefensor) {
  return tiposDefensor.reduce((total, t) => total * ((TABLA[ataque] || {})[t] ?? 1), 1);
}
