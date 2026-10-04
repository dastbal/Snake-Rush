# 0007. Motor de combate que devuelve "pasos"

- **Estado:** Aceptado
- **Fecha:** 2026-10-04

## Contexto
Un turno de combate tiene muchas cosas en orden: "¡FLAMIX usó ASCUAS!", la vida baja, "¡Es muy eficaz!", el rival se debilita, ganas experiencia, subes de nivel, aprendes un ataque, sale la siguiente criatura… La pantalla debe mostrarlas **una por una**, esperando al jugador. Pero queremos que las reglas se puedan probar sin pantalla.

## Decisión
`nucleo/combate.js` resuelve el turno completo **de una vez** y devuelve una **lista de pasos**:

```js
combate.turno({ tipo: 'atacar', indice: 0 })
// → [ { tipo: 'texto', texto: '¡FLAMIX usó ASCUAS!' },
//     { tipo: 'ps', lado: 'rival', ps: 3, psMax: 17 },
//     { tipo: 'texto', texto: '¡Es muy eficaz!' }, ... ]
```

`interfaz/combateUI.js` recorre la lista y muestra cada paso (escribir texto, animar la barra, sacudir la bola…).

El azar se **inyecta** (`azar = Math.random` por defecto), así las pruebas usan dados falsos y siempre dan el mismo resultado.

## Opciones consideradas
- **Lógica dentro de la animación** — el combate avanza mientras se anima; imposible de probar sin navegador.
- **Lista de pasos** ✅ — el motor es una función pura y la interfaz solo "reproduce".

## Consecuencias
- ✅ Las pruebas verifican daño, tipos, captura, derrota y experiencia con dados controlados.
- ✅ Agregar un tipo de paso nuevo (por ejemplo, estados como "envenenado") es agregar un `case` en la interfaz.
- ❌ El estado cambia antes de que la animación termine; la interfaz usa los valores que trae cada paso (no relee la criatura) para no adelantarse.
