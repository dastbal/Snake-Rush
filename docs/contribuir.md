# Cómo trabajar en el proyecto

## Antes de subir cambios
```bash
npm test     # todas las pruebas deben pasar
npm start    # abre http://localhost:8000 y prueba el juego que cambiaste
```

## Commits: pequeños y seguidos
Un commit = **un cambio con sentido** (no "muchos cambios del día"). Así es fácil entender la historia y deshacer algo si sale mal.

Formato ([Conventional Commits](https://www.conventionalcommits.org/es/)):
```
tipo(alcance): qué cambia, en presente y en español

Por qué cambia (opcional, si no es obvio).
```

| Tipo | Cuándo |
|---|---|
| `feat` | algo nuevo para el jugador (una criatura, un mapa, un poder) |
| `fix` | arreglar un error |
| `refactor` | ordenar código sin cambiar lo que hace |
| `test` | agregar o cambiar pruebas |
| `docs` | documentación y ADRs |
| `style` | solo formato o CSS que no cambia funciones |

Alcances comunes: `snake`, `monster`, `compartido`, `portada`, `adr`.

Ejemplos:
```
feat(monster): agregar la criatura VOLTIX de tipo eléctrico
fix(snake): la serpiente ya no gira dos veces en el mismo paso
docs(adr): 0009 usar Tiled para diseñar mapas
```

## Comentarios en el código
- Cada archivo empieza con un comentario que dice **qué hace**.
- Las funciones públicas llevan un comentario `/** ... */` corto.
- Comenta el **por qué** cuando algo no es obvio (ej.: "no contamos la cola porque se mueve en este paso").
- No comentes lo que el código ya dice claro.

## ¿Cuándo escribir un ADR?
Cuando tomes una decisión que **cambia cómo se construye** el proyecto: una librería nueva, otra forma de guardar, un cambio de capas. Copia [adr/plantilla.md](adr/plantilla.md) con el siguiente número y agrégalo al índice en [README.md](README.md).

## Agregar contenido (sin tocar las reglas)
| Quiero agregar | Dónde | Prueba que lo revisa |
|---|---|---|
| Personaje de Snake | `snake/src/datos/personajes.js` | dibujos 10×10 y poderes válidos |
| Criatura | `monster-rush/src/datos/especies.js` + `encuentros` en `mapas.js` | arte 8×16, tipos y ataques válidos |
| Mapa | `monster-rush/src/datos/mapas.js` | filas iguales, salidas caminables |
| Entrenador | `personas` con `entrenador` en un mapa | especies válidas |
| Juego nuevo | carpeta nueva + ficha en `index.html` | agrega su `tests/` a `npm test` |
