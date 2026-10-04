/**
 * Pruebas de Monster Rush. Corren con Node, sin navegador: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESPECIES, INICIALES } from '../src/datos/especies.js';
import { ATAQUES } from '../src/datos/ataques.js';
import { TIPOS, efectividad } from '../src/datos/tipos.js';
import { MAPAS } from '../src/datos/mapas.js';
import { LOSETAS, PERSONAS } from '../src/datos/sprites.js';
import { crearCriatura, stats, ganarExp, evolucionPendiente, evolucionar, expParaNivel } from '../src/nucleo/criatura.js';
import { crearCombate } from '../src/nucleo/combate.js';
import { buscarCamino, caminable, tirarEncuentro } from '../src/nucleo/mundo.js';

/** Dados falsos que siempre devuelven la secuencia dada (y luego repiten el último). */
const dados = (...valores) => { let i = 0; return () => valores[Math.min(i++, valores.length - 1)]; };

// ---------- Datos ----------
test('cada especie es válida (tipos, ataques, evolución y arte)', () => {
  for (const [id, e] of Object.entries(ESPECIES)) {
    for (const t of e.tipos) assert.ok(TIPOS[t], `${id}: tipo ${t}`);
    for (const [, a] of e.aprende) assert.ok(ATAQUES[a], `${id}: ataque ${a}`);
    if (e.evoluciona) assert.ok(ESPECIES[e.evoluciona.a], `${id}: evoluciona a algo que no existe`);
    assert.equal(e.arte.length, 16, `${id}: 16 filas`);
    for (const fila of e.arte) {
      assert.equal(fila.length, 8, `${id}: filas de 8`);
      for (const letra of fila) assert.ok(letra === '.' || e.paleta[letra] !== undefined, `${id}: color ${letra}`);
    }
  }
  for (const id of INICIALES) assert.ok(ESPECIES[id]);
});

test('cada mapa es válido (filas iguales, losetas, salidas y encuentros)', () => {
  for (const [id, m] of Object.entries(MAPAS)) {
    const ancho = m.losetas[0].length;
    m.losetas.forEach((fila, y) => {
      assert.equal(fila.length, ancho, `${id}: fila ${y} mide ${fila.length}`);
      for (const letra of fila) assert.ok(LOSETAS[letra], `${id}: loseta "${letra}"`);
    });
    for (const s of m.salidas) {
      assert.ok(MAPAS[s.a], `${id}: salida a ${s.a}`);
      assert.ok(caminable(MAPAS[s.a], s.ax, s.ay), `${id}: llegada a ${s.a} (${s.ax},${s.ay}) no es caminable`);
    }
    for (const p of m.puertas) assert.equal(m.losetas[p.y][p.x], 'D', `${id}: puerta en (${p.x},${p.y})`);
    for (const p of m.personas) {
      assert.ok(PERSONAS[p.sprite], `${id}: sprite ${p.sprite}`);
      for (const [esp] of p.entrenador?.equipo || []) assert.ok(ESPECIES[esp]);
    }
    for (const e of m.encuentros) assert.ok(ESPECIES[e.especie], `${id}: encuentro ${e.especie}`);
  }
});

test('se puede caminar del inicio del pueblo a cada puerta y a la ruta', () => {
  const p = MAPAS.pueblo;
  for (const puerta of p.puertas) assert.ok(buscarCamino(p, 4, 5, puerta.x, puerta.y), `puerta ${puerta.accion}`);
  assert.ok(buscarCamino(p, 4, 5, 9, 0));
  assert.ok(buscarCamino(MAPAS.ruta1, 9, 28, 9, 2), 'cruzar la ruta hasta la líder');
});

// ---------- Tipos ----------
test('tabla de tipos', () => {
  assert.equal(efectividad('fuego', ['planta']), 2);
  assert.equal(efectividad('agua', ['fuego']), 2);
  assert.equal(efectividad('planta', ['agua']), 2);
  assert.equal(efectividad('fuego', ['agua']), 0.5);
  assert.equal(efectividad('electrico', ['normal', 'volador']), 2);
  assert.equal(efectividad('normal', ['fuego']), 1);
});

// ---------- Criaturas ----------
test('una criatura nueva tiene vida llena y hasta 4 ataques', () => {
  const c = crearCriatura('flamix', 5);
  assert.equal(c.ps, stats(c).psMax);
  assert.ok(c.ataques.length >= 1 && c.ataques.length <= 4);
  assert.equal(c.exp, expParaNivel(5));
});

test('subir de nivel aprende ataques y evoluciona', () => {
  const c = crearCriatura('flamix', 7);
  const sucesos = ganarExp(c, expParaNivel(9) - c.exp);
  assert.equal(c.nivel, 9);
  assert.ok(sucesos.some((s) => s.tipo === 'aprende' && s.ataque === 'ataqueRapido'));
  assert.equal(evolucionPendiente(c), 'flamaro');
  evolucionar(c);
  assert.equal(c.especie, 'flamaro');
});

// ---------- Combate ----------
test('atacar baja la vida del rival', () => {
  const yo = crearCriatura('flamix', 5);
  const salvaje = crearCriatura('hojita', 3);
  const combate = crearCombate({ equipo: [yo], rival: { criaturas: [salvaje] }, mochila: {}, azar: dados(0.5) });
  combate.inicio();
  const antes = salvaje.ps;
  const indice = yo.ataques.findIndex((a) => a.id === 'ascuas');
  const pasos = combate.turno({ tipo: 'atacar', indice });
  assert.ok(salvaje.ps < antes);
  assert.ok(pasos.some((p) => p.texto === '¡Es muy eficaz!'));
});

test('ganar el combate da experiencia', () => {
  const yo = crearCriatura('flamix', 10);
  const salvaje = crearCriatura('hojita', 2);
  const combate = crearCombate({ equipo: [yo], rival: { criaturas: [salvaje] }, mochila: {}, azar: dados(0.5) });
  const expAntes = yo.exp;
  const pasos = combate.turno({ tipo: 'atacar', indice: yo.ataques.findIndex((a) => a.id === 'ascuas') });
  assert.equal(combate.resultado, 'victoria');
  assert.ok(yo.exp > expAntes);
  assert.ok(pasos.at(-1).tipo === 'fin');
});

test('capturar con una bola cuando los dados ayudan', () => {
  const yo = crearCriatura('gotin', 5);
  const salvaje = crearCriatura('ratin', 3);
  const mochila = { bola: 1 };
  const combate = crearCombate({ equipo: [yo], rival: { criaturas: [salvaje] }, mochila, azar: dados(0) });
  combate.turno({ tipo: 'objeto', id: 'bola' });
  assert.equal(combate.resultado, 'captura');
  assert.equal(combate.capturada, salvaje);
  assert.equal(mochila.bola, 0);
});

test('no se puede huir de un entrenador ni capturar sus criaturas', () => {
  const yo = crearCriatura('gotin', 5);
  const rival = { criaturas: [crearCriatura('ratin', 3)], entrenador: { nombre: 'X', dinero: 10 } };
  const mochila = { bola: 1 };
  const combate = crearCombate({ equipo: [yo], rival, mochila, azar: dados(0) });
  combate.turno({ tipo: 'huir' });
  combate.turno({ tipo: 'objeto', id: 'bola' });
  assert.equal(combate.resultado, null);
  assert.equal(mochila.bola, 1);
});

test('si tu criatura se debilita sale la siguiente; sin criaturas pierdes', () => {
  const debil = crearCriatura('brotin', 2);
  debil.ps = 1;
  const otra = crearCriatura('gotin', 2);
  otra.ps = 1;
  const rival = { criaturas: [crearCriatura('ascuin', 20)] };
  // dados(0): el rival elige su primer ataque (Ascuas) y siempre acierta
  const combate = crearCombate({ equipo: [debil, otra], rival, mochila: {}, azar: dados(0) });
  const pasos1 = combate.turno({ tipo: 'atacar', indice: 0 });
  assert.ok(pasos1.some((p) => p.tipo === 'entra' && p.lado === 'jugador'));
  combate.turno({ tipo: 'atacar', indice: 0 });
  assert.equal(combate.resultado, 'derrota');
});

test('los encuentros salen de la tabla del mapa', () => {
  assert.equal(tirarEncuentro(MAPAS.ruta1, dados(0.99)), null);
  const c = tirarEncuentro(MAPAS.ruta1, dados(0.01, 0, 0));
  assert.equal(c.especie, 'ratin');
  assert.equal(tirarEncuentro(MAPAS.pueblo, dados(0)), null);
});
