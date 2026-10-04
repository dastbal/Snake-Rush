/**
 * Pruebas de las reglas. Corren con Node, sin navegador:
 *   npm test
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearEventos } from '../src/nucleo/eventos.js';
import { crearReglas, espera } from '../src/nucleo/reglas.js';
import { estado } from '../src/nucleo/estado.js';
import { PERSONAJES } from '../src/datos/personajes.js';
import { PODERES } from '../src/datos/poderes.js';
import { NIVELES } from '../src/datos/niveles.js';

let eventos;
let reglas;
let gritos;

beforeEach(() => {
  eventos = crearEventos();
  gritos = [];
  for (const nombre of ['inicio', 'comio', 'nivel', 'poder', 'rompio', 'perdio']) {
    eventos.en(nombre, (datos) => gritos.push({ nombre, datos }));
  }
  reglas = crearReglas(eventos);
  estado.eleccion = { color: 'Verde', personaje: 'Clásica', dificultad: 'Normal' };
  reglas.empezar(0);
  estado.muros = [];
  estado.comida = { x: 15, y: 0 }; // lejos del camino
});

test('avanza una casilla y mantiene el largo', () => {
  reglas.paso(2000);
  assert.deepEqual(estado.serpiente[0], { x: 5, y: 10 });
  assert.equal(estado.serpiente.length, 3);
});

test('no deja dar media vuelta', () => {
  reglas.girar('izquierda');
  reglas.paso(2000);
  assert.deepEqual(estado.serpiente[0], { x: 5, y: 10 });
});

test('al comer crece y suma puntos', () => {
  estado.comida = { x: 5, y: 10 };
  reglas.paso(2000);
  assert.equal(estado.serpiente.length, 4);
  assert.equal(estado.puntos, 1);
  assert.ok(gritos.some((g) => g.nombre === 'comio'));
});

test('chocar con la pared termina el juego', () => {
  estado.serpiente = [{ x: 19, y: 10 }, { x: 18, y: 10 }];
  reglas.paso(2000);
  assert.equal(estado.modo, 'fin');
  assert.ok(gritos.some((g) => g.nombre === 'perdio'));
});

test('morderse termina el juego', () => {
  estado.serpiente = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }];
  estado.direccion = estado.siguiente = { x: 1, y: 0 };
  reglas.girar('abajo'); reglas.paso(2000);
  reglas.girar('izquierda'); reglas.paso(2001);
  reglas.girar('arriba'); reglas.paso(2002);
  assert.equal(estado.modo, 'fin');
});

test('con la estrella rompe muros en vez de perder', () => {
  estado.efectos.estrella = 99999;
  estado.muros = [{ x: 5, y: 10 }];
  reglas.paso(2000);
  assert.equal(estado.modo, 'jugando');
  assert.equal(estado.muros.length, 0);
});

test('doble puntos suma 2 por comida', () => {
  estado.efectos.doble = 99999;
  estado.comida = { x: 5, y: 10 };
  reglas.paso(2000);
  assert.equal(estado.puntos, 2);
});

test('el reloj hace el juego más lento', () => {
  const normal = espera(2000);
  estado.efectos.reloj = 99999;
  assert.ok(espera(2000) > normal);
});

test('a los 10 puntos sube al nivel 2 con su mapa', () => {
  estado.puntos = 9;
  estado.comida = { x: 5, y: 10 };
  reglas.paso(2000);
  assert.equal(estado.nivel, 1);
  assert.equal(estado.muros.length, NIVELES[1].mapa().length);
  assert.ok(gritos.some((g) => g.nombre === 'nivel'));
});

test('datos: cada personaje usa poderes, fondos y niveles válidos', () => {
  for (const [nombre, p] of Object.entries(PERSONAJES)) {
    assert.equal(p.niveles.length, NIVELES.length, `${nombre}: un nombre por nivel`);
    for (const poder of p.poderes) assert.ok(PODERES[poder], `${nombre}: poder ${poder} no existe`);
    for (const dibujo of [p.cabeza, p.comida, p.muro].filter(Boolean)) {
      assert.equal(dibujo.dibujo.length, 10, `${nombre}: dibujo de 10 filas`);
      for (const fila of dibujo.dibujo) {
        assert.equal(fila.length, 10, `${nombre}: fila de 10 letras`);
        for (const letra of fila) assert.ok(letra === '.' || dibujo.paleta[letra] !== undefined, `${nombre}: color ${letra}`);
      }
    }
  }
});

test('datos: ningún mapa de nivel tapa la fila de salida', () => {
  for (const nivel of NIVELES) {
    assert.ok(nivel.mapa().every((m) => m.y !== 10));
  }
});
