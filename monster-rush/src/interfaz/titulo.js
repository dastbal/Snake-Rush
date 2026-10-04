/**
 * Pantalla de título: CONTINUAR / NUEVA PARTIDA.
 */
import { INICIALES } from '../datos/especies.js';
import { imagenCriatura } from '../graficos/texturas.js';

export function crearTitulo({ capa, alElegir }) {
  const div = document.createElement('div');
  div.className = 'titulo';
  div.hidden = true;
  div.innerHTML = `
    <h1>MONSTER<br>RUSH</h1>
    <div class="titulo-criaturas"></div>
    <div class="titulo-botones">
      <button type="button" id="continuar">CONTINUAR</button>
      <button type="button" id="nueva">NUEVA PARTIDA</button>
    </div>
    <p class="titulo-nota">Toca el mapa para caminar</p>`;
  for (const id of INICIALES) {
    const img = document.createElement('img');
    img.src = imagenCriatura(id, 4);
    img.alt = '';
    div.querySelector('.titulo-criaturas').appendChild(img);
  }
  div.addEventListener('pointerdown', (e) => e.stopPropagation());
  capa.appendChild(div);

  const continuar = div.querySelector('#continuar');
  continuar.addEventListener('click', () => alElegir(false));
  div.querySelector('#nueva').addEventListener('click', async () => {
    if (!continuar.hidden && !div.dataset.confirmar) {
      // Pedir confirmación dentro de la página: se borrará la partida guardada
      div.dataset.confirmar = '1';
      div.querySelector('#nueva').textContent = '¿BORRAR LA PARTIDA? TOCA OTRA VEZ';
      return;
    }
    delete div.dataset.confirmar;
    alElegir(true);
  });

  return {
    mostrar({ hayGuardado }) {
      continuar.hidden = !hayGuardado;
      delete div.dataset.confirmar;
      div.querySelector('#nueva').textContent = 'NUEVA PARTIDA';
      div.hidden = false;
    },
    ocultar() {
      div.hidden = true;
    },
  };
}
