/**
 * Tabla de los 5 mejores, guardada en el aparato del jugador (localStorage).
 */
const CLAVE = 'snake-top5';
const MAXIMO = 5;

export function leerTop() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch (e) {
    return [];
  }
}

function guardarTop(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch (e) {
    // Sin guardado (modo privado): el juego sigue funcionando
  }
}

/** El mejor puntaje guardado (0 si no hay). */
export const record = () => (leerTop()[0] ? leerTop()[0].puntos : 0);

/** ¿Estos puntos entran a la tabla? */
export function entraAlTop(puntos) {
  const lista = leerTop();
  return puntos > 0 && (lista.length < MAXIMO || puntos > lista[MAXIMO - 1].puntos);
}

export function agregarRecord({ iniciales, puntos, personaje }) {
  const lista = leerTop();
  lista.push({ iniciales, puntos, cabeza: personaje });
  lista.sort((a, b) => b.puntos - a.puntos);
  guardarTop(lista.slice(0, MAXIMO));
}

/** Pinta la tabla dentro de una lista <ol>. */
export function pintarTabla(ol) {
  ol.replaceChildren();
  const lista = leerTop();
  if (lista.length === 0) {
    const li = document.createElement('li');
    li.className = 'vacia';
    li.textContent = 'Aún no hay récords';
    ol.appendChild(li);
    return;
  }
  lista.forEach((r, i) => {
    const li = document.createElement('li');
    const nombre = document.createElement('span');
    nombre.textContent = `${i + 1}. ${r.iniciales} (${r.cabeza})`;
    const pts = document.createElement('span');
    pts.textContent = r.puntos;
    li.append(nombre, pts);
    ol.appendChild(li);
  });
}
