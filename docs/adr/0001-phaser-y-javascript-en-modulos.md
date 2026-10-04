# 0001. Phaser + JavaScript en módulos, sin compilar

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Queremos juegos 2D que corran en el iPad sin instalar nada, que se publiquen gratis en GitHub Pages y que sirvan para **aprender a programar**. El autor trabaja casi siempre desde un iPad, donde no puede correr herramientas de compilación.

## Decisión
Usar **Phaser 3** cargado desde un CDN y escribir el código en **módulos de JavaScript** (`import`/`export`) que el navegador entiende directamente. Sin paso de compilación.

## Opciones consideradas
- **TypeScript + Vite** — tipos y herramientas modernas, pero exige compilar en una computadora antes de publicar.
- **Godot** — muy completo para 2D y 3D, pero hay que instalarlo y usa otro lenguaje (GDScript).
- **RPG Maker** — rápido para RPGs, pero es de pago y se aprende menos a programar.
- **Unity / Unreal** — pensados para 3D grande; demasiado para juegos de 8 bits.
- **Phaser + módulos JS** ✅ — corre en el navegador, se publica copiando archivos, y su escena/loop/tweens cubren todo lo que necesitamos.

## Consecuencias
- ✅ Se publica con un `git push`: GitHub Pages sirve los archivos tal cual.
- ✅ Funciona en el iPad y se puede instalar como app.
- ❌ Para probar en una computadora hace falta un servidor (`npm start`); abrir el archivo con doble clic no funciona con módulos.
- ❌ Sin tipos: los errores de escritura se atrapan con **pruebas** (`npm test`), no con un compilador.
