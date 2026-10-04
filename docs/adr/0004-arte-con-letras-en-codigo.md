# 0004. Arte de pixel hecho con letras, sin archivos de imagen

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Necesitamos muchos dibujos pequeños (cabezas, comidas, criaturas, losetas, personas). Crear y subir imágenes desde un iPad es lento, y cada imagen sería un archivo más que cargar.

## Decisión
Cada dibujo es una lista de textos donde **cada letra es un color** de una paleta y `.` es transparente:

```js
paleta: { K: 0x181818, O: 0xf08030 },
arte: ['..KKKK..', '.KOOOOK.', ...]
```

- Losetas: 8×8, se pintan al doble (16×16).
- Criaturas y personas de Monster Rush: se escribe **media figura** (8 columnas) y se refleja para hacerla simétrica.
- Al iniciar, `graficos/texturas.js` convierte cada dibujo en un `<canvas>` y lo registra como textura de Phaser. Los menús usan el mismo canvas como `<img>`.
- Las variantes se hacen cambiando solo la paleta (techos de colores, Luigi = Mario en verde, personas con distinta ropa).

## Opciones consideradas
- **Archivos PNG / hojas de sprites** — más detalle, pero hay que dibujarlos en otro programa y cargarlos.
- **Letras en el código** ✅ — se editan en cualquier editor de texto y se revisan con pruebas.

## Consecuencias
- ✅ Cero archivos de imagen: el juego carga rápido y se edita desde el iPad.
- ✅ Las pruebas revisan que cada dibujo tenga el tamaño correcto y que cada letra tenga color.
- ❌ El detalle está limitado (16×16 por criatura), lo cual encaja con el estilo Game Boy.
- ❌ Dibujar con letras requiere práctica: conviene hacerlo en papel cuadriculado primero.
