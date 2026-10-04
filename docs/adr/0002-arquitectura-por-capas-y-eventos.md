# 0002. Arquitectura por capas con eventos

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Snake Rush empezó como un solo archivo de ~800 líneas. Cada mejora (personajes, poderes, niveles) obligaba a tocar código mezclado de reglas, dibujo, sonido y botones. Queríamos poder agregar contenido sin miedo a romper otras cosas, y probar las reglas automáticamente.

## Decisión
Cada juego se divide en las mismas capas:

| Capa | Responsabilidad | Puede usar |
|---|---|---|
| `datos/` | QUÉ hay (personajes, criaturas, mapas…) | nada (solo datos) |
| `nucleo/` | CÓMO funciona (reglas puras) | `datos/` |
| `graficos/` | dibujar y animar con Phaser | `nucleo/`, `datos/` |
| `audio/` | música y efectos | `compartido/` |
| `interfaz/` | HTML, controles, menús, historia | todas |

El **núcleo nunca importa Phaser ni toca el HTML**. Se comunica hacia afuera con:
- **Eventos** (Snake Rush): las reglas "gritan" `comio`, `nivel`, `perdio`… y el dibujo, el sonido y las pantallas escuchan.
- **Valores de retorno** (Monster Rush): el combate devuelve una lista de pasos (ver ADR 0007).

## Opciones consideradas
- **Todo en la escena de Phaser** — más corto al inicio, pero imposible de probar sin navegador y difícil de crecer.
- **Capas + eventos** ✅ — un poco más de archivos, a cambio de piezas pequeñas e independientes.

## Consecuencias
- ✅ Las reglas se prueban con `node --test`, sin navegador.
- ✅ Agregar contenido es agregar datos (un personaje, una criatura, un mapa).
- ✅ Se puede cambiar cómo se ve o suena algo sin tocar las reglas.
- ❌ Más archivos que recorrer; por eso cada uno empieza con un comentario que explica su trabajo.
