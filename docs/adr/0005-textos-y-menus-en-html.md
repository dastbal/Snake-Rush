# 0005. Textos y menús en HTML encima del canvas

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Monster Rush dibuja a 160×144 píxeles, como el Game Boy. Un texto dibujado dentro del canvas a ese tamaño se ve borroso al agrandarlo en el iPad, y los botones dentro del canvas son difíciles de tocar y de leer con un lector de pantalla.

## Decisión
Phaser dibuja **solo el mundo y las animaciones** (mapa, personajes, criaturas). Todo lo que es texto o se toca es **HTML** en una capa encima (`#capa`): caja de diálogo, menús, cajas de vida, título.

La interfaz se usa con promesas para que la historia se escriba en orden:

```js
await ui.decir('¡Hola!');
const i = await ui.elegir(['SÍ', 'NO']);
```

El tamaño de letra se ajusta a la pantalla con unidades `cqw` (porcentaje del ancho de la pantalla del juego).

## Opciones consideradas
- **Texto en Phaser** — todo en un lugar, pero borroso y con botones pequeños.
- **HTML encima** ✅ — texto nítido, botones grandes y accesibles.

## Consecuencias
- ✅ Letras nítidas en cualquier tamaño y botones cómodos para el dedo.
- ✅ `async/await` hace que la historia del director se lea como un guion.
- ❌ Hay que coordinar dos mundos: el canvas ignora los toques mientras `ui.ocupado()` es verdadero.
