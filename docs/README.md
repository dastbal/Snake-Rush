# Documentación de Rush Arcade

| Documento | Para qué sirve |
|---|---|
| [arquitectura.md](arquitectura.md) | Cómo está organizado el código y cómo viajan los datos |
| [guardado.md](guardado.md) | Qué se guarda, cuándo y dónde |
| [contribuir.md](contribuir.md) | Cómo trabajar: commits, pruebas y cómo agregar contenido |
| [adr/](adr/) | Decisiones de arquitectura (por qué hicimos las cosas así) |

## ¿Qué es un ADR?
Un **ADR** (*Architecture Decision Record*, "registro de decisión de arquitectura") es una nota corta que explica **una decisión importante**: qué problema había, qué elegimos, qué otras opciones vimos y qué consecuencias trae.

Sirve para que, dentro de meses, tú (o alguien más) entienda **por qué** el código es así, y no solo **cómo** es.

Reglas:
- Un ADR por decisión, numerado: `0001-...md`, `0002-...md`.
- Nunca se borra. Si cambiamos de idea, se escribe un ADR nuevo y el viejo pasa a estado **Reemplazado por 00XX**.
- Usa la plantilla [adr/plantilla.md](adr/plantilla.md).

## Decisiones
| # | Decisión | Estado |
|---|---|---|
| [0001](adr/0001-phaser-y-javascript-en-modulos.md) | Phaser + JavaScript en módulos, sin compilar | Aceptado |
| [0002](adr/0002-arquitectura-por-capas-y-eventos.md) | Arquitectura por capas con eventos | Aceptado |
| [0003](adr/0003-un-repo-varios-juegos.md) | Un repo con varios juegos y piezas compartidas | Aceptado |
| [0004](adr/0004-arte-con-letras-en-codigo.md) | Arte de pixel hecho con letras, sin archivos de imagen | Aceptado |
| [0005](adr/0005-textos-y-menus-en-html.md) | Textos y menús en HTML encima del canvas | Aceptado |
| [0006](adr/0006-guardado-en-localstorage.md) | Guardado en localStorage | Aceptado |
| [0007](adr/0007-combate-que-devuelve-pasos.md) | Motor de combate que devuelve "pasos" | Aceptado |
| [0008](adr/0008-criaturas-originales.md) | Criaturas y nombres originales | Aceptado |
| [0009](adr/0009-mando-en-pantalla.md) | Mando en pantalla además de tocar el mapa | Aceptado |
