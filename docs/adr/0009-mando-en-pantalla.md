# 0009. Mando en pantalla además de tocar el mapa

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Monster Rush empezó solo con "tocar el mapa para caminar". Jugando en el iPad resultó difícil de manejar y se veían movimientos extraños:
- un deslizamiento del dedo contaba como toque en el punto donde empezó;
- el camino automático hacía zigzag;
- no se veía a qué casilla iba el personaje.

## Decisión
1. Agregar un **mando en pantalla** como en el Game Boy: cruceta, **A**, **B** y **START**. Toda la traducción de botones a acciones vive en `interfaz/mando.js` (también el teclado).
2. Mantener **tocar el mapa**, pero más preciso: cuenta al levantar el dedo y solo si no se deslizó, muestra un marcador y el camino prefiere ir derecho (Dijkstra con costo por giro, ver `nucleo/mundo.js`).
3. En iPad **horizontal**, la cruceta y A/B van a los lados de la pantalla (como un GBA); en vertical, debajo.

## Opciones consideradas
- **Solo tocar el mapa** — simple, pero impreciso con el dedo.
- **Solo cruceta** — preciso, pero más lento para cruzar el mapa.
- **Las dos** ✅ — cruceta para precisión y combates; tocar para viajes largos.

## Consecuencias
- ✅ Se juega como un Game Boy de verdad, también con teclado.
- ✅ Los menús se manejan sin tocar la pantalla (la cruceta mueve la selección).
- ❌ Dos formas de moverse: la cruceta cancela el camino automático para que no peleen.
- ⚠️ Probado en un iPad simulado; falta confirmar en un iPad real.
