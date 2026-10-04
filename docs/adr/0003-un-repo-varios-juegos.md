# 0003. Un repo con varios juegos y piezas compartidas

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Después de Snake Rush quisimos un segundo juego (Monster Rush). Los dos necesitan sonidos de 8 bits y guardar datos en el aparato. Publicar cada juego en un repo distinto obligaría a copiar ese código y a activar GitHub Pages varias veces.

## Decisión
Un solo repo, tipo "sala de arcade":

```
index.html      ← portada para elegir juego
compartido/     ← sintetizador.js, guardado.js
snake/          ← un juego por carpeta
monster-rush/
```

Cada juego importa lo común desde `../../../compartido/`. La app instalable (manifest e ícono) vive en la raíz.

## Opciones consideradas
- **Un repo por juego** — independientes, pero con código copiado y varios sitios que mantener.
- **Un repo, varios juegos** ✅ — un solo sitio, piezas compartidas y una portada.

## Consecuencias
- ✅ Un arreglo en `compartido/` mejora todos los juegos a la vez.
- ✅ Agregar un juego = una carpeta nueva + una ficha en la portada.
- ❌ Un cambio en `compartido/` puede romper a varios juegos: hay que correr `npm test` y probar cada uno.
- ❌ El repo se llama `Snake-Rush` aunque ya tiene más juegos (renombrarlo cambiaría el link de GitHub Pages).
