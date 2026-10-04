/**
 * Objetos de la mochila. usar: 'curar' (en una criatura) o 'capturar' (en combate salvaje).
 */
export const OBJETOS = {
  pocion: { nombre: 'Poción', precio: 200, usar: 'curar', cura: 20, texto: 'Cura 20 PS.' },
  superPocion: { nombre: 'Superpoción', precio: 500, usar: 'curar', cura: 50, texto: 'Cura 50 PS.' },
  bola: { nombre: 'Monster Ball', precio: 150, usar: 'capturar', bono: 1, texto: 'Atrapa criaturas.' },
  superBola: { nombre: 'Super Ball', precio: 400, usar: 'capturar', bono: 1.5, texto: 'Atrapa mejor.' },
};

/** Lo que vende la tienda del pueblo. */
export const TIENDA = ['pocion', 'superPocion', 'bola', 'superBola'];
