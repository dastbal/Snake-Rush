/**
 * El marcador de abajo: retrato, nombre, % de daño y vidas de cada luchador,
 * y el reloj arriba si se juega por tiempo. Se actualiza cada cuadro, pero solo
 * toca el HTML cuando algo cambió.
 */
import { LUCHADORES } from '../datos/luchadores.js';
import { retrato } from '../graficos/texturas.js';

/** Color del % : blanco → amarillo → naranja → rojo a medida que sube. */
function colorDaño(d) {
  if (d < 40) return '#ffffff';
  if (d < 80) return '#ffe066';
  if (d < 120) return '#ff9a3c';
  return '#ff4040';
}

export function crearMarcador(contenedor) {
  let tarjetas = [];
  let reloj = null;
  let ultimo = '';

  function preparar(estado, jugadores) {
    contenedor.replaceChildren();
    reloj = null;
    ultimo = '';
    const barra = document.createElement('div');
    barra.className = 'marcador';
    tarjetas = estado.luchadores.map((l, i) => {
      const d = LUCHADORES[l.personaje];
      const t = document.createElement('div');
      t.className = 'tarjeta';
      t.style.setProperty('--color', d.color);
      t.innerHTML = `<img alt=""><div><p class="t-nombre"></p><p class="t-daño"></p><p class="t-vidas"></p></div>`;
      t.querySelector('img').src = retrato(l.personaje, 2);
      t.querySelector('.t-nombre').textContent = `${jugadores[i].etiqueta} ${d.nombre}`;
      barra.appendChild(t);
      return t;
    });
    contenedor.appendChild(barra);
    if (estado.restante !== null) {
      reloj = document.createElement('div');
      reloj.className = 'reloj';
      contenedor.appendChild(reloj);
    }
  }

  function actualizar(estado) {
    const firma = estado.luchadores.map((l) => `${Math.round(l.daño)}|${l.vidas}|${l.fuera}`).join(',') + Math.ceil(estado.restante ?? 0);
    if (firma === ultimo) return;
    ultimo = firma;
    estado.luchadores.forEach((l, i) => {
      const t = tarjetas[i];
      const daño = t.querySelector('.t-daño');
      daño.textContent = l.fuera ? 'FUERA' : `${Math.round(l.daño)}%`;
      daño.style.color = l.fuera ? '#888' : colorDaño(l.daño);
      t.querySelector('.t-vidas').textContent = Number.isFinite(l.vidas) ? '●'.repeat(Math.max(0, l.vidas)) : `KO ${l.kos}`;
      t.classList.toggle('fuera', l.fuera);
    });
    if (reloj) {
      const s = Math.ceil(estado.restante);
      reloj.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }
  }

  return { preparar, actualizar, limpiar: () => contenedor.replaceChildren() };
}
