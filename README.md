# Rush Arcade 🕹️

Juegos retro para el navegador y el iPad, hechos con [Phaser](https://phaser.io) mientras aprendía a programar.

**Jugar:** https://dastbal.github.io/Snake-Rush/

| Juego | Qué es |
|---|---|
| 🐍 **Snake Rush** (`/snake/`) | La serpiente clásica con 6 personajes, 3 niveles por mundo y 5 poderes |
| 👾 **Monster Rush** (`/monster-rush/`) | RPG estilo Game Boy Color: atrapa criaturas, entrénalas y vence a la Líder |

Se instala como app: en iPad toca **Compartir → Agregar a pantalla de inicio**.

📚 **Documentación:** [docs/](docs/) — arquitectura, [cómo se guarda](docs/guardado.md), [cómo contribuir](docs/contribuir.md) y las [decisiones (ADRs)](docs/README.md#decisiones).

## Correrlo en tu computadora
Los módulos de JavaScript necesitan un servidor (no funcionan con doble clic):

```bash
npm start      # abre http://localhost:8000
npm test       # pruebas de los dos juegos (Node 18+)
```

No hay que instalar nada ni compilar: Phaser se carga desde internet.

## Organización del repo

```
index.html          ← portada: elige el juego
compartido/         ← piezas que usan todos los juegos
│   ├── sintetizador.js   (sonidos de 8 bits con código)
│   └── guardado.js       (guardar en el aparato, sin fallar)
snake/              ← Snake Rush
monster-rush/       ← Monster Rush
```

Cada juego usa la **misma arquitectura por capas**:

```
src/
├── datos/      ← QUÉ hay en el juego (solo datos: agregar contenido = agregar datos)
├── nucleo/     ← CÓMO funciona (reglas puras, sin Phaser ni HTML → se prueban con Node)
├── graficos/   ← Phaser: dibuja y anima
├── audio/      ← música y efectos
└── interfaz/   ← lo que ve y toca el jugador
tests/          ← pruebas automáticas
```

**Para agregar un juego nuevo:** crea su carpeta con la misma estructura, usa `compartido/` y agrega su ficha en `index.html`.

---

## 🐍 Snake Rush

- 6 personajes, cada uno con su mundo: Clásica, Pikachu, Mario, Luigi, Kirby y Sonic
- 3 niveles por mundo (subes a los 10 y 20 puntos), con mapas nuevos y más velocidad
- Poderes: ⭐ Estrella, ⚡ Rayo, 🧲 Imán, ⏱️ Reloj lento y ✖️2 Doble puntos
- Controles: botones de arcade, deslizar el dedo o flechas del teclado
- Chispas al comer, "+1" flotante, explosión al perder y tabla de los 5 mejores

Las reglas (`snake/src/nucleo/`) no saben de dibujos ni sonidos: cambian el estado y **gritan eventos** (`comio`, `nivel`, `perdio`…) que el resto escucha.

**Agregar:** un personaje en `datos/personajes.js`, un poder en `datos/poderes.js`, un nivel en `datos/niveles.js`, un fondo en `graficos/fondos.js`.

---

## 👾 Monster Rush

- Pueblo con tu casa, laboratorio, centro de curación y tienda; ruta con pasto alto
- 3 iniciales (fuego, agua y planta) que **evolucionan**, más 6 criaturas salvajes
- Tipos con ventajas: fuego, agua, planta, normal, eléctrico y volador
- Combate por turnos con 4 ataques, niveles, experiencia, pociones y bolas de captura
- Un entrenador en la ruta y la **LÍDER VOLTA** al final (¡gana la Medalla Trueno!)
- Toca el mapa para caminar (o usa las flechas); guardado automático y en el MENÚ

**Cómo está hecho:**
- `nucleo/combate.js` — el motor de combate devuelve una lista de "pasos" (texto, daño, debilitada, bola…) que la interfaz muestra uno por uno.
- `nucleo/mundo.js` — qué se puede pisar, el camino más corto al tocar (búsqueda en anchura) y los encuentros en el pasto.
- `interfaz/director.js` — la historia: puertas, salidas, hablar, combates y evoluciones, escrita en orden con `await`.

**Agregar:**
- **Una criatura:** una entrada en `datos/especies.js` (media figura de 8×16 letras que se refleja) y ponla en los `encuentros` de un mapa.
- **Un ataque:** `datos/ataques.js` · **Un tipo:** `datos/tipos.js` · **Un objeto:** `datos/objetos.js`
- **Un mapa:** una entrada en `datos/mapas.js` conectada con `salidas`.
- **Un entrenador:** una persona con `entrenador` en un mapa.

Las pruebas revisan que cada criatura, mapa, salida y puerta sea válida, así que si algo queda mal escrito, `npm test` te avisa.

Las criaturas y personajes de Monster Rush son originales, inspirados en los RPG de Game Boy.
