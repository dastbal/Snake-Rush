# 0006. Guardado en localStorage

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Los récords de Snake Rush y la partida de Monster Rush deben sobrevivir al cerrar el navegador. El sitio es estático (GitHub Pages): no hay servidor ni base de datos propia.

## Decisión
Guardar en el **`localStorage` del navegador**, como JSON, a través de `compartido/guardado.js`:

- `leer(clave, porDefecto)` y `guardar(clave, valor)` **nunca lanzan errores**: si el navegador no deja guardar (modo privado, almacenamiento lleno), el juego sigue funcionando.
- Claves: `snake-top5` (tabla de récords) y `monster-rush-partida` (la partida).
- La partida es un objeto simple (sin clases ni funciones), así se convierte a JSON sin trucos.

Detalle de qué y cuándo se guarda: [docs/guardado.md](../guardado.md).

## Opciones consideradas
- **Servidor + base de datos** — partidas en cualquier aparato, pero hay que mantener un servidor y cuentas de usuario.
- **Archivo descargable** — el jugador guarda un archivo; incómodo en iPad.
- **localStorage** ✅ — gratis, instantáneo y funciona sin internet.

## Consecuencias
- ✅ Funciona sin conexión y sin cuentas.
- ❌ La partida vive **solo en ese navegador y ese aparato**.
- ❌ Se pierde si se borran los datos de Safari.
- ⚠️ Si cambia la forma de la partida (campos nuevos), `cargarPartida()` mezcla los datos guardados sobre una partida nueva para que no falten campos. Cambios más grandes necesitarán un número de versión.
