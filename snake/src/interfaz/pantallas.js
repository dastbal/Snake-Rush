/**
 * Las pantallas HTML encima del juego: menú, pausa y Game Over,
 * más los botones de la barra (pausa, pantalla completa, sonido).
 */
import { COLORES, DIFICULTADES } from '../config/ajustes.js';
import { PERSONAJES } from '../datos/personajes.js';
import { PODERES } from '../datos/poderes.js';
import { estado, personaje } from '../nucleo/estado.js';
import { record, entraAlTop, agregarRecord, pintarTabla } from './records.js';

const $ = (id) => document.getElementById(id);

/** Tiempo para ver la explosión antes de mostrar Game Over (ms). */
const PAUSA_EXPLOSION = 900;

export function crearPantallas({ reglas, eventos, sonido, reloj }) {
  function cambiarModo(nuevo) {
    estado.modo = nuevo;
    $('menu').hidden = nuevo !== 'menu';
    $('pausado').hidden = nuevo !== 'pausa';
    $('fin').hidden = nuevo !== 'fin';
    $('pausa').disabled = nuevo !== 'jugando';
    if (nuevo === 'menu') {
      estado.explotada = false;
      pintarTabla($('tabla-menu'));
    }
  }

  function mostrarFin() {
    const esRecord = estado.puntos > 0 && estado.puntos > record();
    const titulo = esRecord ? `¡NUEVO RÉCORD! ${estado.puntos} puntos` : `Hiciste ${estado.puntos} puntos`;
    $('resumen').textContent = `${titulo} · llegaste al nivel ${estado.nivel + 1}`;
    $('form-record').hidden = !entraAlTop(estado.puntos);
    $('iniciales').value = '';
    pintarTabla($('tabla-fin'));
    cambiarModo('fin');
  }

  function jugar() {
    sonido.iniciar();
    reglas.empezar(reloj());
    cambiarModo('jugando');
  }

  function pausar() {
    if (estado.modo === 'jugando') {
      cambiarModo('pausa');
      sonido.musica(false);
    } else if (estado.modo === 'pausa') {
      cambiarModo('jugando');
      sonido.musica(true);
    }
  }

  let avisoTimer = null;
  function avisar(texto) {
    $('aviso').textContent = texto;
    $('aviso').hidden = false;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => { $('aviso').hidden = true; }, 4500);
  }

  async function pantallaCompleta() {
    const el = document.documentElement;
    const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else if (pedir) {
        await pedir.call(el);
      } else {
        throw new Error('sin soporte');
      }
    } catch (e) {
      avisar('En iPad: toca Compartir y luego "Agregar a pantalla de inicio" para jugar en pantalla completa.');
    }
  }

  /** Crea una fila de botones de opción (personaje, color o dificultad). */
  function crearOpciones(contenedorId, opciones, clave, decorar) {
    const contenedor = $(contenedorId);
    for (const nombre of Object.keys(opciones)) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.id = `${clave}-${nombre}`;
      boton.setAttribute('aria-pressed', String(estado.eleccion[clave] === nombre));
      decorar(boton, nombre);
      boton.addEventListener('click', () => {
        estado.eleccion[clave] = nombre;
        contenedor.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
        if (clave === 'personaje') mostrarPoderes();
      });
      contenedor.appendChild(boton);
    }
  }

  function mostrarPoderes() {
    const lista = personaje().poderes.map((p) => `${PODERES[p].icono} ${PODERES[p].nombre}`).join(' · ');
    $('info-personaje').textContent = `Poderes: ${lista}`;
  }

  function iniciar() {
    crearOpciones('cabezas', PERSONAJES, 'personaje', (b, n) => { b.textContent = n; });
    crearOpciones('colores', COLORES, 'color', (b, n) => {
      b.className = 'color';
      b.style.background = '#' + COLORES[n].toString(16).padStart(6, '0');
      b.setAttribute('aria-label', n);
      b.title = n;
    });
    crearOpciones('dificultades', DIFICULTADES, 'dificultad', (b, n) => { b.textContent = n; });
    mostrarPoderes();

    $('jugar').addEventListener('click', jugar);
    $('otra-vez').addEventListener('click', jugar);
    $('al-menu').addEventListener('click', () => cambiarModo('menu'));
    $('pausa').addEventListener('click', pausar);
    $('seguir').addEventListener('click', pausar);
    $('salir').addEventListener('click', () => cambiarModo('menu'));
    $('completa').addEventListener('click', pantallaCompleta);
    $('sonido').addEventListener('click', () => {
      sonido.iniciar();
      const callado = sonido.alternar();
      $('sonido').textContent = callado ? '🔇 Silencio' : '🔊 Sonido';
      $('sonido').setAttribute('aria-pressed', String(callado));
    });

    $('form-record').addEventListener('submit', (e) => {
      e.preventDefault();
      const iniciales = ($('iniciales').value.trim().toUpperCase() || '???').slice(0, 3);
      agregarRecord({ iniciales, puntos: estado.puntos, personaje: estado.eleccion.personaje });
      $('form-record').hidden = true;
      pintarTabla($('tabla-fin'));
    });

    // Si cambias de app, el juego se pausa solo
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && estado.modo === 'jugando') pausar();
    });

    eventos.en('perdio', () => {
      $('pausa').disabled = true;
      setTimeout(() => {
        if (estado.modo === 'fin') mostrarFin();
      }, PAUSA_EXPLOSION);
    });

    cambiarModo('menu');
  }

  return { iniciar, pausar };
}
