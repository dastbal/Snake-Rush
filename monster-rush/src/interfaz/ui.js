/**
 * Piezas básicas de la interfaz: caja de texto y menús de opciones.
 * Todo devuelve Promesas, así la historia se escribe en orden con `await`:
 *
 *   await ui.decir('¡Hola!');
 *   const i = await ui.elegir(['SÍ', 'NO']);
 */
export function crearUI({ capa, sonido }) {
  let ocupados = 0;
  const caja = document.createElement('div');
  caja.className = 'caja-texto';
  caja.hidden = true;
  const texto = document.createElement('p');
  const flecha = document.createElement('span');
  flecha.className = 'flecha';
  flecha.textContent = '▼';
  caja.append(texto, flecha);
  capa.appendChild(caja);

  let avanzar = null;
  let inicioLinea = 0;
  /** Toque o tecla para avanzar el texto (ignora el mismo toque que abrió el texto). */
  const tocar = () => {
    if (avanzar && performance.now() - inicioLinea > 150) avanzar();
  };
  // Tocar en cualquier parte de la pantalla avanza el texto
  capa.parentElement.addEventListener('pointerdown', tocar);
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && avanzar) {
      e.preventDefault();
      tocar();
    }
  });

  /** Escribe el texto letra por letra; un toque lo completa y otro avanza. */
  function unaLinea(linea, { esperar = true } = {}) {
    return new Promise((listo) => {
      caja.hidden = false;
      flecha.hidden = true;
      inicioLinea = performance.now();
      texto.textContent = '';
      let i = 0;
      const escribir = setInterval(() => {
        i += 1;
        texto.textContent = linea.slice(0, i);
        if (i >= linea.length) terminarEscritura();
      }, 22);
      function terminarEscritura() {
        clearInterval(escribir);
        texto.textContent = linea;
        if (!esperar) {
          avanzar = null;
          listo();
          return;
        }
        flecha.hidden = false;
        avanzar = () => {
          avanzar = null;
          sonido.blip();
          listo();
        };
      }
      avanzar = terminarEscritura;
    });
  }

  async function decir(lineas, opciones = {}) {
    ocupados++;
    try {
      for (const linea of [].concat(lineas)) await unaLinea(linea, opciones);
    } finally {
      ocupados--;
      if (!opciones.mantener) caja.hidden = true;
    }
  }

  /**
   * Muestra un menú. opciones: textos u objetos { texto, detalle, imagen, deshabilitado }.
   * Devuelve el índice elegido, o -1 si se canceló.
   */
  function elegir(opciones, { titulo = '', cancelar = true, columnas = 1, clase = '' } = {}) {
    ocupados++;
    return new Promise((listo) => {
      const menu = document.createElement('div');
      menu.className = `menu ${clase}`;
      if (titulo) {
        const h = document.createElement('p');
        h.className = 'menu-titulo';
        h.textContent = titulo;
        menu.appendChild(h);
      }
      const lista = document.createElement('div');
      lista.className = 'menu-lista';
      lista.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
      menu.appendChild(lista);

      const cerrar = (valor) => {
        menu.remove();
        ocupados--;
        sonido.blip();
        listo(valor);
      };
      opciones.forEach((op, i) => {
        const o = typeof op === 'string' ? { texto: op } : op;
        const b = document.createElement('button');
        b.type = 'button';
        b.disabled = Boolean(o.deshabilitado);
        if (o.imagen) {
          const img = document.createElement('img');
          img.src = o.imagen;
          img.alt = '';
          b.appendChild(img);
        }
        const t = document.createElement('span');
        t.className = 'op-texto';
        t.textContent = o.texto;
        b.appendChild(t);
        if (o.detalle) {
          const d = document.createElement('span');
          d.className = 'op-detalle';
          d.textContent = o.detalle;
          b.appendChild(d);
        }
        b.addEventListener('pointerdown', (e) => e.stopPropagation());
        b.addEventListener('click', () => cerrar(i));
        lista.appendChild(b);
      });
      if (cancelar) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'volver';
        b.textContent = 'VOLVER';
        b.addEventListener('pointerdown', (e) => e.stopPropagation());
        b.addEventListener('click', () => cerrar(-1));
        menu.appendChild(b);
      }
      menu.addEventListener('pointerdown', (e) => e.stopPropagation());
      capa.appendChild(menu);
      menu.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
    });
  }

  /** Cartelito arriba (nombre del lugar, "Partida guardada"...). */
  function aviso(mensaje) {
    const a = document.createElement('div');
    a.className = 'aviso';
    a.textContent = mensaje;
    capa.appendChild(a);
    setTimeout(() => a.remove(), 1800);
  }

  return { decir, elegir, aviso, ocupado: () => ocupados > 0, ocultarTexto: () => { caja.hidden = true; } };
}
