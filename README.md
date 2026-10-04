# Snake Rush 🐍

🐍 Retro arcade Snake for the browser and iPad. Pick your head, color and difficulty, dodge walls, grab ⭐ and ⚡ power-ups, and chase the top 5. Built with Phaser, 8-bit sounds made with code.

Mi primer juego, hecho con [Phaser](https://phaser.io) mientras aprendía a programar.

**Jugar:** https://dastbal.github.io/Snake-Rush/

## Qué tiene
- 6 personajes, cada uno con su mundo: Clásica, Pikachu, Mario, Luigi, Kirby y Sonic
- 3 niveles por mundo (subes a los 10 y 20 puntos), con mapas nuevos y más velocidad
- Poderes: ⭐ Estrella, ⚡ Rayo, 🧲 Imán, ⏱️ Reloj lento y ✖️2 Doble puntos
- Controles: botones de arcade, deslizar el dedo o flechas del teclado
- Cuerpo redondeado, chispas al comer, "+1" flotante y explosión al perder
- Música y sonidos de 8 bits generados con código, con botón de silencio
- Pausa, Game Over y tabla de los 5 mejores
- Se instala como app: en iPad toca Compartir → "Agregar a pantalla de inicio"

## Correrlo en tu computadora
Los módulos de JavaScript necesitan un servidor (no funcionan con doble clic en el archivo):

```bash
npm start      # abre http://localhost:8000
npm test       # pruebas de las reglas (Node 18+)
```

No hay que instalar nada ni compilar: Phaser se carga desde internet.

## Arquitectura

```
index.html            ← solo la estructura de la página
css/estilos.css       ← el aspecto (máquina arcade, botones)
src/
├── main.js           ← arma y conecta todas las piezas
├── config/
│   └── ajustes.js    ← números del juego (tamaño, velocidades, colores)
├── datos/            ← QUÉ hay en el juego (solo datos)
│   ├── personajes.js ← cabeza, comida, muro, fondo, poderes y niveles de cada mundo
│   ├── poderes.js    ← cada poder: dibujo + comportamiento
│   └── niveles.js    ← mapas de muros y velocidad de cada nivel
├── nucleo/           ← CÓMO funciona (reglas puras, sin Phaser ni HTML)
│   ├── estado.js     ← todo lo que existe ahora (serpiente, comida, puntos…)
│   ├── tablero.js    ← ayudantes de casillas
│   ├── reglas.js     ← moverse, comer, chocar, subir de nivel, poderes
│   └── eventos.js    ← "megáfono" para avisar lo que pasa
├── graficos/         ← Phaser: dibuja y anima
│   ├── escena.js     ← game loop + animaciones
│   ├── pintar.js     ← serpiente y dibujos de pixel art
│   └── fondos.js     ← el fondo de cada mundo
├── audio/
│   └── sonido.js     ← sonidos de 8 bits con Web Audio
└── interfaz/         ← lo que ve y toca el jugador
    ├── pantallas.js  ← menú, pausa, Game Over, barra de botones
    ├── controles.js  ← botones, deslizar y teclado
    └── records.js    ← tabla de los 5 mejores
tests/
└── reglas.test.js    ← pruebas de las reglas y de los datos
```

### La idea principal
Las **reglas** (`nucleo/`) no saben nada de dibujos, sonidos ni botones. Solo cambian el `estado` y **gritan eventos** (`comio`, `nivel`, `poder`, `perdio`…). Las demás piezas escuchan y reaccionan:

```
controles ──girar()──▶ reglas ──cambia──▶ estado ◀──lee── escena (dibuja)
                          │
                          └──eventos──▶ escena (animaciones)
                                     ├▶ sonido
                                     └▶ pantallas (Game Over)
```

Por eso las reglas se pueden probar sin navegador, y se puede cambiar el dibujo o el sonido sin tocar las reglas.

### Cómo agregar cosas
- **Un personaje:** copia una entrada en `src/datos/personajes.js`, cambia sus dibujos y elige su `fondo` y sus `poderes`. El menú lo muestra solo.
- **Un poder:** agrega una entrada en `src/datos/poderes.js`. Puedes usar campos listos (`duracion`, `invencible`, `multiplicaPuntos`, `multiplicaEspera`) o escribir `alAgarrar` / `cadaPaso`. Después ponlo en la lista de algún personaje.
- **Un nivel:** agrega un objeto a `NIVELES` en `src/datos/niveles.js` y un nombre más en `niveles` de cada personaje.
- **Un fondo:** agrega una función en `src/graficos/fondos.js` y úsala por su nombre.

Los dibujos son de 10×10: cada letra es un color de la `paleta` y `.` es transparente. Las pruebas revisan que cada dibujo tenga el tamaño correcto y que cada letra tenga color.
