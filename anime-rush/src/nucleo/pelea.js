/**
 * El motor de la pelea: física, saltos, golpes, empuje, objetos y vidas.
 * Es puro: no sabe de Phaser ni del HTML. Cada cuadro recibe los botones
 * de cada jugador y avanza el mundo; avisa lo que pasa con eventos
 * ('golpe', 'ko', 'salto', 'especial', 'objeto', 'explosion', 'fin').
 *
 * Unidades: píxeles y segundos. La "y" de un luchador es la de sus PIES.
 */
import { LUCHADORES } from '../datos/luchadores.js';
import { ESCENARIOS, LIMITES, ANCHO_MUNDO } from '../datos/escenarios.js';
import { OBJETOS, SEGUNDOS_ENTRE_OBJETOS } from '../datos/objetos.js';

export const FISICA = {
  gravedad: 1500,
  caidaMaxima: 620,
  caidaRapida: 900,
  aceleracionSuelo: 2200,
  aceleracionAire: 1100,
  frenoSuelo: 2400,
};

/** Tamaño del cuerpo (la caja que recibe golpes). */
export const CUERPO = { ancho: 22, alto: 48 };

const INVENCIBLE_AL_VOLVER = 2;
const RECUPERACION = { impulso: 640, duracion: 0.35, daño: 5, empuje: 300, angulo: 80 };

const rad = (g) => (g * Math.PI) / 180;
const choca = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const cajaCuerpo = (l) => ({ x: l.x - CUERPO.ancho / 2, y: l.y - CUERPO.alto, w: CUERPO.ancho, h: CUERPO.alto });

/**
 * Crea una pelea.
 * @param {object} cfg
 * @param {{personaje: string}[]} cfg.jugadores
 * @param {string} cfg.escenario
 * @param {{tipo:'vidas', vidas:number} | {tipo:'tiempo', segundos:number}} cfg.reglas
 * @param {boolean} [cfg.objetos=true]
 * @param {() => number} [cfg.azar=Math.random]
 * @param {(nombre: string, datos: object) => void} [cfg.emitir]
 */
export function crearPelea({ jugadores, escenario, reglas, objetos = true, azar = Math.random, emitir = () => {} }) {
  const esc = ESCENARIOS[escenario];
  const superficies = [
    { ...esc.suelo, fina: false },
    ...esc.plataformas.map((p) => ({ ...p, fina: true })),
  ];

  const separacion = esc.suelo.ancho / (jugadores.length + 1);
  const luchadores = jugadores.map((j, i) => ({
    indice: i,
    personaje: j.personaje,
    x: esc.suelo.x + separacion * (i + 1),
    y: esc.suelo.y,
    vx: 0,
    vy: 0,
    mira: i % 2 === 0 ? 1 : -1,
    enSuelo: true,
    saltosAire: 1,
    daño: 0,
    vidas: reglas.tipo === 'vidas' ? reglas.vidas : Infinity,
    kos: 0,
    caidas: 0,
    aturdido: 0,
    invencible: 0,
    enfriamiento: 0,
    ataque: null,
    usoRecuperacion: false,
    potenciado: 1,
    atraviesaHasta: 0,
    ultimoGolpe: null,
    fuera: false,
    previa: {},
  }));

  const estado = {
    luchadores,
    proyectiles: [],
    objetos: [],
    superficies,
    tiempo: 0,
    restante: reglas.tipo === 'tiempo' ? reglas.segundos : null,
    proximoObjeto: SEGUNDOS_ENTRE_OBJETOS,
    terminado: false,
    ganador: null, // índice, o null si hay empate
  };

  // ---------- Golpes ----------
  /** Aplica un golpe: suma daño y empuja. Más daño acumulado = vuela más lejos. */
  function golpear(objetivo, { daño, empuje, angulo }, direccion, atacante = null) {
    if (objetivo.fuera || objetivo.invencible > 0) return false;
    objetivo.daño = Math.min(999, objetivo.daño + daño);
    const fuerza = (empuje * (1 + objetivo.daño / 80)) / LUCHADORES[objetivo.personaje].stats.peso;
    objetivo.vx = direccion * Math.cos(rad(angulo)) * fuerza;
    objetivo.vy = -Math.sin(rad(angulo)) * fuerza;
    objetivo.aturdido = Math.min(1.2, fuerza / 900);
    objetivo.enSuelo = false;
    objetivo.ataque = null;
    if (atacante) objetivo.ultimoGolpe = { quien: atacante.indice, tiempo: estado.tiempo };
    emitir('golpe', { objetivo: objetivo.indice, atacante: atacante?.indice ?? null, x: objetivo.x, y: objetivo.y - CUERPO.alto / 2, fuerza });
    return true;
  }

  /** Revisa una caja de ataque contra todos los demás (cada uno recibe una vez por ataque). */
  function revisarCaja(atacante, caja, datos) {
    for (const otro of luchadores) {
      if (otro === atacante || otro.fuera || atacante.ataque.golpeados.has(otro.indice)) continue;
      if (!choca(caja, cajaCuerpo(otro))) continue;
      atacante.ataque.golpeados.add(otro.indice);
      const direccion = Math.sign(otro.x - atacante.x) || atacante.mira;
      golpear(otro, datos, direccion, atacante);
    }
  }

  // ---------- Ataques ----------
  function iniciarGolpe(l) {
    const g = LUCHADORES[l.personaje].golpe;
    l.ataque = { tipo: 'golpe', t: 0, duracion: g.duracion, golpeados: new Set() };
  }

  function iniciarEspecial(l) {
    const e = LUCHADORES[l.personaje].especial;
    const potencia = l.potenciado;
    l.potenciado = 1;
    const duracion = e.tipo === 'proyectil' ? e.carga + 0.15 : e.duracion + 0.05;
    l.ataque = { tipo: 'especial', especial: e.tipo, t: 0, duracion, golpeados: new Set(), potencia, x0: l.x, disparado: false };
    emitir('especial', { quien: l.indice, tipo: e.tipo, potencia });
  }

  function iniciarRecuperacion(l) {
    l.usoRecuperacion = true;
    l.saltosAire = 0;
    l.vy = -RECUPERACION.impulso;
    l.enSuelo = false;
    l.ataque = { tipo: 'recuperacion', t: 0, duracion: RECUPERACION.duracion, golpeados: new Set() };
    emitir('salto', { quien: l.indice, fuerte: true });
  }

  /** Avanza el ataque en curso y revisa a quién golpea. */
  function avanzarAtaque(l, dt) {
    const a = l.ataque;
    a.t += dt;
    const datos = LUCHADORES[l.personaje];

    if (a.tipo === 'golpe') {
      const g = datos.golpe;
      if (a.t > 0.04 && a.t < g.duracion * 0.85) {
        const x = l.mira > 0 ? l.x + 8 : l.x - 8 - g.alcance;
        revisarCaja(l, { x, y: l.y - 38, w: g.alcance, h: 24 }, g);
      }
    } else if (a.tipo === 'recuperacion') {
      revisarCaja(l, { x: l.x - 18, y: l.y - 52, w: 36, h: 56 }, RECUPERACION);
    } else if (a.tipo === 'especial') {
      const e = datos.especial;
      const fuerte = { daño: e.daño * a.potencia, empuje: e.empuje * a.potencia, angulo: e.angulo };
      if (a.especial === 'proyectil' && !a.disparado && a.t >= e.carga) {
        a.disparado = true;
        estado.proyectiles.push({
          dueño: l.indice, x: l.x + l.mira * 18, y: l.y - 28, vx: l.mira * e.velocidad,
          radio: e.radio * Math.sqrt(a.potencia), ...fuerte, vida: 1.6, color: e.color,
        });
      }
      if (a.especial === 'clon') {
        const avance = Math.min(1, a.t / e.duracion);
        a.clonX = a.x0 + l.mira * e.distancia * avance;
        revisarCaja(l, { x: a.clonX - CUERPO.ancho / 2, y: l.y - CUERPO.alto, w: CUERPO.ancho, h: CUERPO.alto }, fuerte);
      }
      if (a.especial === 'estirar') {
        const mitad = e.duracion / 2;
        const extension = a.t < mitad ? a.t / mitad : Math.max(0, 1 - (a.t - mitad) / mitad);
        a.punoX = l.x + l.mira * (14 + e.alcance * extension);
        if (extension > 0.3) revisarCaja(l, { x: a.punoX - 8, y: l.y - 36, w: 16, h: 14 }, fuerte);
      }
      if (a.especial === 'embestida') {
        if (a.t < e.duracion) {
          l.vx = l.mira * (e.distancia / e.duracion);
          const x = l.mira > 0 ? l.x + 6 : l.x - 6 - 36;
          revisarCaja(l, { x, y: l.y - 40, w: 36, h: 30 }, fuerte);
        }
      }
    }

    if (a.t >= a.duracion) {
      if (a.especial === 'embestida') l.vx *= 0.3;
      l.ataque = null;
      l.enfriamiento = 0.12;
    }
  }

  // ---------- Movimiento ----------
  function controlar(l, ent, dt) {
    const s = LUCHADORES[l.personaje].stats;
    const prev = l.previa;
    const apreto = (b) => ent[b] && !prev[b];

    const dir = (ent.der ? 1 : 0) - (ent.izq ? 1 : 0);
    const acel = l.enSuelo ? FISICA.aceleracionSuelo : FISICA.aceleracionAire;
    if (dir !== 0) {
      l.mira = dir;
      const objetivo = dir * s.velocidad;
      l.vx += Math.sign(objetivo - l.vx) * Math.min(Math.abs(objetivo - l.vx), acel * dt);
    } else if (l.enSuelo) {
      l.vx -= Math.sign(l.vx) * Math.min(Math.abs(l.vx), FISICA.frenoSuelo * dt);
    }

    if (apreto('arriba') && !ent.B) {
      if (l.enSuelo) {
        l.vy = -s.salto;
        l.enSuelo = false;
        emitir('salto', { quien: l.indice });
      } else if (l.saltosAire > 0) {
        l.vy = -s.salto * 0.9;
        l.saltosAire -= 1;
        emitir('salto', { quien: l.indice, doble: true });
      }
    }
    if (ent.abajo && !l.enSuelo && l.vy > 0) l.vy = Math.max(l.vy, FISICA.caidaRapida);
    if (apreto('abajo') && l.enSuelo && sobreSuperficie(l)?.fina) {
      l.atraviesaHasta = estado.tiempo + 0.25;
      l.enSuelo = false;
      l.y += 2;
    }

    if (l.enfriamiento > 0) return;
    if (apreto('A')) iniciarGolpe(l);
    else if (apreto('B')) {
      if (ent.arriba && !l.usoRecuperacion) iniciarRecuperacion(l);
      else if (!ent.arriba) iniciarEspecial(l);
    }
  }

  function sobreSuperficie(l) {
    return superficies.find((p) => Math.abs(l.y - p.y) < 1 && l.x >= p.x - 4 && l.x <= p.x + p.ancho + 4) || null;
  }

  function moverYAterrizar(l, dt) {
    const yAntes = l.y;
    if (!l.enSuelo) {
      // Límite de caída: más alto si sale volando o si ya venía en caída rápida
      const limite = l.aturdido > 0 ? 1400 : Math.max(FISICA.caidaMaxima, l.vy);
      l.vy = Math.min(l.vy + FISICA.gravedad * dt, limite);
    }
    l.x += l.vx * dt;
    l.y += l.vy * dt;

    if (l.enSuelo) {
      if (!sobreSuperficie(l)) l.enSuelo = false; // caminó fuera del borde
      return;
    }
    if (l.vy < 0) return;
    for (const p of superficies) {
      if (p.fina && estado.tiempo < l.atraviesaHasta) continue;
      const dentro = l.x >= p.x - 4 && l.x <= p.x + p.ancho + 4;
      if (dentro && yAntes <= p.y && l.y >= p.y) {
        l.y = p.y;
        l.vy = 0;
        l.enSuelo = true;
        l.saltosAire = 1;
        l.usoRecuperacion = false;
        if (l.aturdido > 0) l.vx *= 0.5;
        return;
      }
    }
  }

  // ---------- Vidas ----------
  function perderVida(l) {
    emitir('ko', { quien: l.indice, x: l.x, y: l.y });
    l.caidas += 1;
    if (l.ultimoGolpe && estado.tiempo - l.ultimoGolpe.tiempo < 8) luchadores[l.ultimoGolpe.quien].kos += 1;
    l.vidas -= 1;
    if (l.vidas <= 0) {
      l.fuera = true;
      l.ataque = null;
      return;
    }
    Object.assign(l, {
      x: ANCHO_MUNDO / 2, y: esc.suelo.y - 120, vx: 0, vy: 0, daño: 0, aturdido: 0, ataque: null,
      invencible: INVENCIBLE_AL_VOLVER, enSuelo: false, saltosAire: 1, usoRecuperacion: false, ultimoGolpe: null,
    });
  }

  function revisarFin() {
    if (estado.terminado) return;
    const vivos = luchadores.filter((l) => !l.fuera);
    if (reglas.tipo === 'vidas' && vivos.length <= 1) {
      terminar(vivos[0]?.indice ?? null);
    } else if (reglas.tipo === 'tiempo' && estado.restante <= 0) {
      const puntos = luchadores.map((l) => l.kos - l.caidas);
      const max = Math.max(...puntos);
      const mejores = puntos.filter((p) => p === max).length;
      terminar(mejores === 1 ? puntos.indexOf(max) : null);
    }
  }

  function terminar(ganador) {
    estado.terminado = true;
    estado.ganador = ganador;
    emitir('fin', { ganador });
  }

  // ---------- Objetos y proyectiles ----------
  function soltarObjeto() {
    const tipos = Object.entries(OBJETOS);
    const total = tipos.reduce((s, [, o]) => s + o.peso, 0);
    let tiro = azar() * total;
    const [tipo] = tipos.find(([, o]) => (tiro -= o.peso) < 0) || tipos[0];
    const x = esc.suelo.x + 20 + azar() * (esc.suelo.ancho - 40);
    estado.objetos.push({ tipo, x, y: -10, vy: 0, enSuelo: false, vida: 12 });
  }

  function tocarObjeto(l, o) {
    const datos = OBJETOS[o.tipo];
    if (datos.efecto === 'curar') l.daño = Math.max(0, l.daño - datos.cantidad);
    if (datos.efecto === 'potenciar') l.potenciado = datos.multiplicador;
    if (datos.efecto === 'explotar') {
      emitir('explosion', { x: o.x, y: o.y });
      golpear(l, { daño: datos.daño, empuje: datos.empuje, angulo: 70 }, Math.sign(l.x - o.x) || 1);
    }
    emitir('objeto', { quien: l.indice, tipo: o.tipo, x: o.x, y: o.y });
  }

  function actualizarObjetos(dt) {
    if (objetos) {
      estado.proximoObjeto -= dt;
      if (estado.proximoObjeto <= 0) {
        estado.proximoObjeto = SEGUNDOS_ENTRE_OBJETOS;
        soltarObjeto();
      }
    }
    for (const o of estado.objetos) {
      o.vida -= dt;
      if (!o.enSuelo) {
        const yAntes = o.y;
        o.vy = Math.min(o.vy + FISICA.gravedad * dt, FISICA.caidaMaxima);
        o.y += o.vy * dt;
        const p = superficies.find((s) => o.x >= s.x && o.x <= s.x + s.ancho && yAntes <= s.y && o.y >= s.y);
        if (p) { o.y = p.y; o.enSuelo = true; }
      }
      const caja = { x: o.x - 7, y: o.y - 14, w: 14, h: 14 };
      const quien = luchadores.find((l) => !l.fuera && choca(caja, cajaCuerpo(l)));
      if (quien) {
        tocarObjeto(quien, o);
        o.vida = 0;
      }
      if (o.y > LIMITES.abajo) o.vida = 0;
    }
    estado.objetos = estado.objetos.filter((o) => o.vida > 0);

    for (const p of estado.proyectiles) {
      p.vida -= dt;
      p.x += p.vx * dt;
      const caja = { x: p.x - p.radio, y: p.y - p.radio, w: p.radio * 2, h: p.radio * 2 };
      for (const l of luchadores) {
        if (l.indice === p.dueño || l.fuera || p.vida <= 0) continue;
        if (choca(caja, cajaCuerpo(l)) && golpear(l, p, Math.sign(p.vx), luchadores[p.dueño])) p.vida = 0;
      }
      if (p.x < LIMITES.izquierda || p.x > LIMITES.derecha) p.vida = 0;
    }
    estado.proyectiles = estado.proyectiles.filter((p) => p.vida > 0);
  }

  /**
   * Avanza el mundo dt segundos.
   * @param {number} dt
   * @param {{izq,der,arriba,abajo,A,B}[]} entradas  botones de cada jugador
   */
  function actualizar(dt, entradas) {
    if (estado.terminado) return;
    dt = Math.min(dt, 1 / 30); // si el iPad se traba, no atravesar plataformas
    estado.tiempo += dt;
    if (estado.restante !== null) estado.restante = Math.max(0, estado.restante - dt);

    luchadores.forEach((l, i) => {
      if (l.fuera) return;
      const ent = entradas[i] || {};
      l.invencible = Math.max(0, l.invencible - dt);
      l.enfriamiento = Math.max(0, l.enfriamiento - dt);
      if (l.aturdido > 0) {
        l.aturdido = Math.max(0, l.aturdido - dt);
        l.vx *= 1 - Math.min(1, 1.2 * dt);
      } else if (l.ataque) {
        // Al atacar en el suelo se frena (menos en la embestida, que avanza sola)
        if (l.enSuelo && l.ataque.especial !== 'embestida') {
          l.vx -= Math.sign(l.vx) * Math.min(Math.abs(l.vx), FISICA.frenoSuelo * dt);
        }
        avanzarAtaque(l, dt);
      } else {
        controlar(l, ent, dt);
      }
      l.previa = { ...ent };
      moverYAterrizar(l, dt);
      const fueraDeLimites = l.x < LIMITES.izquierda || l.x > LIMITES.derecha || l.y > LIMITES.abajo || l.y < LIMITES.arriba;
      if (fueraDeLimites) perderVida(l);
    });

    actualizarObjetos(dt);
    revisarFin();
  }

  return { estado, actualizar, golpear };
}
