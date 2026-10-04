/**
 * Pruebas de Anime Rush: física, golpes, vidas y datos. Corren con Node: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LUCHADORES, arteDe } from '../src/datos/luchadores.js';
import { ESCENARIOS } from '../src/datos/escenarios.js';
import { crearPelea, CUERPO } from '../src/nucleo/pelea.js';
import { crearIA, NIVELES_IA } from '../src/nucleo/ia.js';

const DT = 1 / 60;
const nada = () => ({});
/** Avanza la pelea `seg` segundos con entradas fijas por jugador. */
function correr(pelea, seg, entradas = []) {
  for (let t = 0; t < seg; t += DT) pelea.actualizar(DT, entradas.map((e) => (typeof e === 'function' ? e() : e)));
}
/** Un botón apretado solo en el primer cuadro. */
function toque(boton, extra = {}) {
  let primero = true;
  return () => {
    const e = primero ? { [boton]: true, ...extra } : { ...extra };
    primero = false;
    return e;
  };
}
const nueva = (cfg = {}) => crearPelea({
  jugadores: [{ personaje: 'goku' }, { personaje: 'naruto' }],
  escenario: 'cielo', reglas: { tipo: 'vidas', vidas: 3 }, objetos: false, azar: () => 0.5, ...cfg,
});

// ---------- Datos ----------
test('hay 8 series de 4 luchadores', async () => {
  const { SERIES } = await import('../src/datos/luchadores.js');
  assert.equal(Object.keys(SERIES).length, 8);
  for (const [id, s] of Object.entries(SERIES)) assert.equal(Object.keys(s.luchadores).length, 4, id);
});

test('cada luchador tiene arte 32×51 con colores válidos y un especial conocido', () => {
  for (const [id, l] of Object.entries(LUCHADORES)) {
    const arte = arteDe(id);
    assert.equal(arte.length, 51, `${id}: 51 filas`);
    for (const fila of arte) {
      assert.equal(fila.length, 32, `${id}: filas de 32`);
      for (const letra of fila) assert.ok(letra === '.' || l.paleta[letra] !== undefined, `${id}: color ${letra}`);
    }
    assert.ok(['proyectil', 'clon', 'estirar', 'embestida'].includes(l.especial.tipo), `${id}: especial`);
  }
});

test('cada escenario tiene el suelo dentro del mundo', () => {
  for (const [id, e] of Object.entries(ESCENARIOS)) {
    assert.ok(e.suelo.x >= 0 && e.suelo.x + e.suelo.ancho <= 480, id);
    for (const p of e.plataformas) assert.ok(p.y < e.suelo.y, `${id}: plataforma sobre el suelo`);
  }
});

// ---------- Física ----------
test('los luchadores empiezan parados en el suelo y se quedan ahí', () => {
  const p = nueva();
  correr(p, 1, [{}, {}]);
  for (const l of p.estado.luchadores) {
    assert.equal(l.enSuelo, true);
    assert.equal(l.y, ESCENARIOS.cielo.suelo.y);
  }
});

test('saltar sube y vuelve a caer al suelo; hay doble salto', () => {
  const p = nueva();
  const yo = p.estado.luchadores[0];
  correr(p, 0.2, [toque('arriba'), nada]);
  assert.ok(yo.y < ESCENARIOS.cielo.suelo.y - 50, 'subió');
  assert.equal(yo.saltosAire, 1);
  correr(p, 0.05, [toque('arriba'), nada]);
  assert.equal(yo.saltosAire, 0, 'usó el doble salto');
  correr(p, 2, [{}, {}]);
  assert.equal(yo.enSuelo, true);
});

test('caminar fuera del borde hace caer y perder una vida', () => {
  const p = nueva();
  const yo = p.estado.luchadores[0];
  // Camina a la izquierda hasta caerse una vez, y suelta el botón
  for (let t = 0; t < 4 && yo.caidas === 0; t += DT) p.actualizar(DT, [{ izq: true }, {}]);
  correr(p, 1, [{}, {}]);
  assert.equal(yo.vidas, 2);
  assert.equal(yo.caidas, 1);
  assert.ok(yo.invencible > 0 || yo.y < 200, 'reaparece arriba e invencible');
});

// ---------- Golpes ----------
test('el golpe suma daño y empuja; con más daño vuela más lejos', () => {
  const p = nueva();
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 25; // al alcance
  a.mira = 1;
  correr(p, 0.1, [toque('A'), nada]); // justo después del golpe
  assert.equal(b.daño, LUCHADORES.goku.golpe.daño);
  assert.ok(b.vx > 0, 'empujado hacia la derecha');

  const debil = nueva().estado.luchadores[1];
  const p2 = nueva();
  const fuerte = p2.estado.luchadores[1];
  fuerte.daño = 120;
  p2.golpear(fuerte, { daño: 5, empuje: 300, angulo: 40 }, 1);
  nueva().golpear(debil, { daño: 5, empuje: 300, angulo: 40 }, 1);
  assert.ok(Math.abs(fuerte.vx) > Math.abs(debil.vx) * 2);
});

test('la onda de energía viaja y golpea a distancia', () => {
  const p = nueva();
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 120;
  a.mira = 1;
  correr(p, 0.8, [toque('B'), nada]);
  assert.equal(b.daño, LUCHADORES.goku.especial.daño);
});

test('el puño elástico alcanza lejos', () => {
  const p = nueva({ jugadores: [{ personaje: 'luffy' }, { personaje: 'zoro' }] });
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 120;
  a.mira = 1;
  correr(p, 0.5, [toque('B'), nada]);
  assert.equal(b.daño, LUCHADORES.luffy.especial.daño);
});

test('la esfera de poder potencia el siguiente especial', () => {
  const p = nueva({ jugadores: [{ personaje: 'zoro' }, { personaje: 'naruto' }] });
  const [a, b] = p.estado.luchadores;
  a.potenciado = 1.8;
  b.x = a.x + 60;
  a.mira = 1;
  correr(p, 0.4, [toque('B'), nada]);
  assert.ok(Math.abs(b.daño - LUCHADORES.zoro.especial.daño * 1.8) < 0.01);
  assert.equal(a.potenciado, 1, 'se gasta al usarla');
});

test('▲+B es el súper salto de recuperación (una vez por salto)', () => {
  const p = nueva();
  const yo = p.estado.luchadores[0];
  yo.enSuelo = false;
  yo.y = 260;
  yo.vy = 100;
  correr(p, 0.05, [toque('B', { arriba: true }), nada]);
  assert.ok(yo.vy < -400, 'sale disparado hacia arriba');
  assert.equal(yo.usoRecuperacion, true);
});

test('un golpe no afecta a quien acaba de reaparecer (invencible)', () => {
  const p = nueva();
  const b = p.estado.luchadores[1];
  b.invencible = 1;
  assert.equal(p.golpear(b, { daño: 10, empuje: 300, angulo: 40 }, 1), false);
  assert.equal(b.daño, 0);
});

// ---------- Reglas ----------
test('con vidas, gana el último que queda', () => {
  const eventos = [];
  const p = nueva({ reglas: { tipo: 'vidas', vidas: 1 }, emitir: (n, d) => eventos.push([n, d]) });
  p.estado.luchadores[1].x = -200; // fuera del mundo
  correr(p, DT * 2, [{}, {}]);
  assert.equal(p.estado.terminado, true);
  assert.equal(p.estado.ganador, 0);
  assert.ok(eventos.some(([n]) => n === 'ko'));
});

test('con tiempo, gana quien tenga más KOs menos caídas', () => {
  const p = nueva({ reglas: { tipo: 'tiempo', segundos: 1 } });
  p.estado.luchadores[0].kos = 2;
  correr(p, 1.1, [{}, {}]);
  assert.equal(p.estado.terminado, true);
  assert.equal(p.estado.ganador, 0);
});

// ---------- IA ----------
test('la IA se acerca al rival y lo ataca', () => {
  for (const nivel of Object.keys(NIVELES_IA)) {
    const p = nueva();
    const ia = crearIA({ nivel, escenario: 'cielo', azar: () => 0.1 });
    correr(p, 4, [nada, () => ia(p.estado, 1, DT)]);
    const rival = p.estado.luchadores[0];
    // Si lo sacó volando, su daño volvió a 0 pero cuenta una caída
    assert.ok(rival.daño > 0 || rival.caidas > 0, `${nivel}: la IA golpeó`);
  }
});

test('la IA vuelve al escenario si se cae', () => {
  const p = nueva();
  const ia = crearIA({ nivel: 'Normal', escenario: 'cielo', azar: () => 0.5 });
  const yo = p.estado.luchadores[1];
  Object.assign(yo, { x: ESCENARIOS.cielo.suelo.x + ESCENARIOS.cielo.suelo.ancho + 40, y: 210, enSuelo: false, vy: 50 });
  correr(p, 2.5, [nada, () => ia(p.estado, 1, DT)]);
  assert.equal(yo.caidas, 0, 'no se cayó');
  assert.ok(yo.y <= ESCENARIOS.cielo.suelo.y + 1, 'está sobre el escenario (puede estar saltando)');
});

test('el cuerpo cabe en el dibujo (32×51)', () => {
  assert.ok(CUERPO.ancho <= 32 && CUERPO.alto <= 51);
});

// ---------- Combos ----------
/** Aprieta botones en distintos momentos: [[segundo, {botones}], ...] */
function guion(pasos) {
  let t = 0;
  return () => {
    t += DT;
    const actual = pasos.find(([desde, , hasta = desde + DT * 2]) => t >= desde && t < hasta);
    return actual ? actual[1] : {};
  };
}

test('cadena A-A-A: tres golpes seguidos y el tercero lanza', () => {
  const eventos = [];
  const p = nueva({ emitir: (n, d) => eventos.push([n, d]) });
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 26;
  a.mira = 1;
  correr(p, 1.2, [guion([[0, { A: true }], [0.12, { A: true }], [0.3, { A: true }]]), nada]);
  const pasos = eventos.filter(([n]) => n === 'cadena').map(([, d]) => d.paso);
  assert.deepEqual(pasos, [2, 3], 'siguió la cadena hasta el 3.er golpe');
  const g = LUCHADORES.goku.golpe;
  assert.equal(b.daño, g.daño * 2 + Math.round(g.daño * 1.6), 'acertaron los tres');
  const combos = eventos.filter(([n]) => n === 'combo').map(([, d]) => d.golpes);
  assert.deepEqual(combos, [2, 3], 'el contador mostró 2 y 3 HITS');
});

test('▲+A golpea hacia arriba (para malabares)', () => {
  const p = nueva();
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 4;
  correr(p, 0.1, [toque('A', { arriba: true }), nada]);
  assert.ok(b.vy < -200 && Math.abs(b.vx) < Math.abs(b.vy), 'sale hacia arriba');
});

test('▼+A es una barrida baja; A en el aire es una patada aérea', () => {
  const p = nueva();
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 26;
  a.mira = 1;
  correr(p, 0.15, [toque('A', { abajo: true }), nada]);
  assert.equal(a.ataque?.forma ?? 'barrida', 'barrida');
  assert.ok(b.daño > 0 && Math.abs(b.vy) < Math.abs(b.vx), 'empuje casi horizontal');

  const p2 = nueva();
  const [c, d] = p2.estado.luchadores;
  Object.assign(c, { enSuelo: false, y: 120, vy: 0 });
  Object.assign(d, { enSuelo: false, y: 120, vy: 0, x: c.x + 20 });
  p2.actualizar(DT, [{ A: true }, {}]);
  assert.equal(c.ataque.forma, 'aereo');
});

test('súper combo ▼ ▶ B: el especial sale el doble de fuerte', () => {
  const eventos = [];
  const p = nueva({ emitir: (n, d) => eventos.push([n, d]) });
  const [a, b] = p.estado.luchadores;
  b.x = a.x + 120;
  a.mira = 1;
  // 0,7 s: justo después del impacto (con más tiempo, el súper lo saca del escenario y su daño vuelve a 0)
  correr(p, 0.7, [guion([[0, { abajo: true }], [0.1, { der: true }], [0.2, { B: true }]]), nada]);
  const esp = eventos.find(([n]) => n === 'especial')[1];
  assert.equal(esp.super, true);
  assert.equal(b.daño, LUCHADORES.goku.especial.daño * 2);
});

test('B solo (sin ▼ ▶) es el especial normal', () => {
  const eventos = [];
  const p = nueva({ emitir: (n, d) => eventos.push([n, d]) });
  correr(p, 0.1, [toque('B'), nada]);
  assert.equal(eventos.find(([n]) => n === 'especial')[1].super, false);
});
