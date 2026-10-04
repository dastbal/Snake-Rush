# 0010. Motor de pelea propio (sin el motor de física de Phaser)

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Anime Rush es un juego de peleas tipo Smash: saltos dobles, plataformas que se atraviesan desde abajo, golpes con cajas de choque, y un empuje que crece con el % de daño. Phaser trae un motor de física (Arcade), pero mezclarlo con las reglas haría imposible probarlas sin navegador (ADR 0002).

## Decisión
Escribir un **motor propio y puro** en `anime-rush/src/nucleo/pelea.js`:
- `actualizar(dt, entradas)` avanza el mundo con los botones de cada jugador; no sabe si los aprieta una persona o la compu.
- Avisa lo que pasa con el megáfono compartido (`golpe`, `ko`, `especial`, `fin`…), como Snake Rush.
- Los ataques son **datos** (`datos/luchadores.js`): alcance, daño, empuje, ángulo. Los especiales son 4 tipos reutilizables: `proyectil`, `clon`, `estirar`, `embestida`.
- El `dt` se limita a 1/30 s para que un tirón del iPad no haga atravesar plataformas.
- La IA (`nucleo/ia.js`) "aprieta botones" igual que un jugador; no hace trampa.

## Opciones consideradas
- **Física Arcade de Phaser** — menos código, pero las reglas quedan atadas a la escena y no se prueban con Node.
- **Motor propio** ✅ — más código propio, a cambio de reglas claras y 16 pruebas automáticas (saltos, golpes, KO, especiales, IA).

## Consecuencias
- ✅ Agregar un luchador = datos + elegir uno de los 4 tipos de especial.
- ✅ Las pruebas encontraron dos errores reales de la IA antes de dibujar nada (perseguir rivales fuera del borde).
- ❌ Sin colisiones entre luchadores (se atraviesan), como en Smash; si algún día se quieren, hay que agregarlas al motor.
- ⚠️ Los luchadores son originales con estilo anime (ver ADR 0008), no personajes con dueño.
