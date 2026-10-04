# 💾 Cómo se guarda

Todo se guarda en el **navegador del aparato** donde juegas (`localStorage`). Decisión: [ADR 0006](adr/0006-guardado-en-localstorage.md).

## Monster Rush — clave `monster-rush-partida`

### Qué se guarda
```js
{
  mapa: 'ruta1', x: 10, y: 20, dir: 'arriba',   // dónde estás
  equipo: [ { especie: 'flamix', nivel: 9, exp: 729, ps: 30,
              ataques: [ { id: 'ascuas', pp: 22 }, ... ] } ],
  caja: [],                                      // atrapadas con el equipo lleno
  mochila: { pocion: 2, bola: 4 },
  dinero: 620,
  banderas: { inicial: true, tito: true }        // cosas que ya pasaron
}
```
Las estadísticas (ataque, defensa…) **no** se guardan: se calculan con la especie y el nivel (`nucleo/criatura.js → stats()`).

### Cuándo se guarda (automático)
| Momento | Dónde está el código |
|---|---|
| Al elegir tu primera criatura | `interfaz/director.js → PUERTAS.laboratorio` |
| Al entrar a tu casa, al centro o a la tienda | `director.js → PUERTAS` |
| Al cambiar de mapa | `director.js → alLlegar` (salidas) |
| Después de cada combate | `director.js → combatir` |
| Al ganarle a un entrenador | `director.js → alHablar` |

### Cuándo se guarda (manual)
- **MENÚ → GUARDAR**
- **MENÚ → SALIR AL TÍTULO** (guarda antes de salir)

### Cargar
En el título, **CONTINUAR** aparece solo si hay partida guardada. **NUEVA PARTIDA** pide tocar dos veces para no borrar una partida por accidente.

## Snake Rush — clave `snake-top5`
La tabla de los 5 mejores: `[{ iniciales: 'DAV', puntos: 15, cabeza: 'Mario' }, ...]`. Se guarda al escribir tus iniciales en el Game Over.

## Limitaciones
- **No viaja entre aparatos:** el iPad y la computadora tienen partidas distintas.
- **Se borra** si limpias los datos de Safari ("Borrar historial y datos").
- **Modo privado:** no se guarda, pero el juego funciona igual.

## Para probar o borrar desde la consola del navegador
```js
JSON.parse(localStorage.getItem('monster-rush-partida'))  // ver la partida
localStorage.removeItem('monster-rush-partida')           // borrarla
```
