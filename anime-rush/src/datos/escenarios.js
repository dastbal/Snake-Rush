/**
 * Escenarios. El mundo mide 480×270 (como una pantalla 16:9 pequeña).
 *
 *  - suelo: la plataforma principal { x, y, ancho } (se puede caer por los bordes)
 *  - plataformas: plataformas finas que se atraviesan desde abajo
 *    (y hacia abajo manteniendo ▼)
 *  - fondo: nombre de un dibujo de graficos/fondos.js
 *  - musica: nombre de una melodía de audio/sonido.js
 *
 * Para agregar un escenario: copia una entrada y cambia las plataformas.
 */
export const ESCENARIOS = {
  cielo: {
    nombre: 'Torneo en el cielo',
    fondo: 'cielo', musica: 'torneo',
    suelo: { x: 90, y: 200, ancho: 300 },
    plataformas: [{ x: 130, y: 145, ancho: 70 }, { x: 280, y: 145, ancho: 70 }, { x: 205, y: 95, ancho: 70 }],
  },
  aldea: {
    nombre: 'Aldea ninja',
    fondo: 'aldea', musica: 'aldea',
    suelo: { x: 70, y: 210, ancho: 340 },
    plataformas: [{ x: 95, y: 160, ancho: 60 }, { x: 325, y: 160, ancho: 60 }, { x: 180, y: 120, ancho: 120 }],
  },
  barco: {
    nombre: 'Barco pirata',
    fondo: 'barco', musica: 'barco',
    suelo: { x: 60, y: 205, ancho: 360 },
    plataformas: [{ x: 150, y: 140, ancho: 50 }, { x: 290, y: 140, ancho: 50 }, { x: 215, y: 80, ancho: 50 }],
  },
  ciudad: {
    nombre: 'Ciudad de noche',
    fondo: 'ciudad', musica: 'ciudad',
    suelo: { x: 100, y: 195, ancho: 280 },
    plataformas: [{ x: 40, y: 165, ancho: 60 }, { x: 380, y: 165, ancho: 60 }, { x: 200, y: 130, ancho: 80 }],
  },
};

/** Zona de muerte: si sales de este rectángulo, pierdes una vida. */
export const LIMITES = { izquierda: -90, derecha: 570, arriba: -220, abajo: 360 };
export const ANCHO_MUNDO = 480;
export const ALTO_MUNDO = 270;
