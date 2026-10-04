/**
 * Un "megáfono" simple: una parte del juego grita un evento y las partes
 * que escuchan reaccionan. Así las reglas no necesitan saber de sonidos,
 * dibujos ni pantallas.
 *
 * (Compartido por todos los juegos.)
 *
 * Eventos que usa Snake Rush:
 *  - 'inicio'   { nombreNivel }
 *  - 'comio'    { casilla, color, gana }
 *  - 'nivel'    { nivel, nombreNivel }
 *  - 'poder'    { casilla, poder }
 *  - 'rompio'   { casilla }
 *  - 'destello' {}
 *  - 'perdio'   { puntos, nivel }
 */
export function crearEventos() {
  const oyentes = {};
  return {
    /** Escucha un evento. */
    en(nombre, funcion) {
      (oyentes[nombre] ||= []).push(funcion);
    },
    /** Grita un evento con datos. */
    emitir(nombre, datos = {}) {
      for (const funcion of oyentes[nombre] || []) funcion(datos);
    },
  };
}
