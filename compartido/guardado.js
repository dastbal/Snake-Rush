/**
 * Guardar y leer datos en el aparato del jugador (localStorage).
 * Si el navegador no deja guardar (modo privado), el juego sigue sin fallar.
 */
export function leer(clave, porDefecto = null) {
  try {
    const texto = localStorage.getItem(clave);
    return texto === null ? porDefecto : JSON.parse(texto);
  } catch (e) {
    return porDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (e) {
    return false;
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (e) {
    // nada que borrar
  }
}
