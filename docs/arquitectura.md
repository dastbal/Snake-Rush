# Arquitectura

Resumen de cómo está armado el código. El **por qué** de cada decisión está en [adr/](adr/).

## El repo
```
index.html        portada "Rush Arcade"
manifest.json     app instalable (ícono, nombre)
compartido/       sintetizador.js · guardado.js
snake/            Snake Rush
monster-rush/     Monster Rush
docs/             esta documentación
```

## Capas de cada juego ([ADR 0002](adr/0002-arquitectura-por-capas-y-eventos.md))
```
datos/  →  nucleo/  →  graficos/ · audio/ · interfaz/
 QUÉ        CÓMO          mostrar y escuchar al jugador
```
La flecha indica quién puede usar a quién. El **núcleo nunca usa Phaser ni el HTML**.

## Snake Rush: el viaje de un toque
```
botón ▲ (interfaz/controles.js)
   └─▶ reglas.girar('arriba')            (nucleo/reglas.js)
escena.update() cada ~16 ms             (graficos/escena.js, game loop de Phaser)
   └─▶ reglas.paso(ahora)
         ├─ cambia estado.serpiente      (nucleo/estado.js)
         └─ eventos.emitir('comio')      (nucleo/eventos.js)
               ├─▶ escena: chispas y "+1"
               ├─▶ sonido: "bling"
               └─▶ pantallas: (al perder) Game Over
```

## Monster Rush: el viaje de un toque
```
tocar el mapa (graficos/escenaMundo.js)
   └─▶ buscarCamino()                     (nucleo/mundo.js, búsqueda en anchura)
         └─▶ un paso a la vez → director.alLlegar(x, y)
               (interfaz/director.js)
               ├─ ¿salida?  → cambiar de mapa y guardar
               ├─ ¿puerta?  → casa / laboratorio / centro / tienda
               └─ ¿pasto alto? → tirarEncuentro() → combatir()
                                    ├─ crearCombate()      (nucleo/combate.js)
                                    └─ jugarCombate()      (interfaz/combateUI.js)
                                          muestra los "pasos" uno por uno (ADR 0007)
```

## Dónde vive cada cosa
| Quiero cambiar… | Archivo |
|---|---|
| Velocidad, tamaño o colores de Snake | `snake/src/config/ajustes.js` |
| Personajes / poderes / niveles de Snake | `snake/src/datos/` |
| Criaturas, ataques, tipos, objetos | `monster-rush/src/datos/` |
| Mapas, personas, entrenadores, encuentros | `monster-rush/src/datos/mapas.js` |
| Dibujos de losetas y personas | `monster-rush/src/datos/sprites.js` |
| Fórmula de daño o captura | `monster-rush/src/nucleo/combate.js` |
| Historia (qué dice cada puerta) | `monster-rush/src/interfaz/director.js` |
| Música y efectos | `*/src/audio/sonido.js` |
| Cómo se guarda | `compartido/guardado.js` · [guardado.md](guardado.md) |
