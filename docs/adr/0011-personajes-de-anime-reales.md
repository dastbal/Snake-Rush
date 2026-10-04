# 0011. Personajes de anime con sus nombres reales en Anime Rush

- **Estado:** Aceptado
- **Fecha:** 2026-10-04
- **Reemplaza en parte a:** [0008](0008-criaturas-originales.md) (solo para Anime Rush)

## Contexto
Anime Rush empezó con 4 luchadores originales "inspirados en" animes (RAIKO, KAGE, RUFO, SAYA), siguiendo el ADR 0008. El dueño del proyecto pidió expresamente usar a los personajes reales con sus nombres: los 4 más famosos de Dragon Ball, Naruto, One Piece, Bleach, Jujutsu Kaisen, My Hero Academia, Slime (Tensura) y Demon Slayer.

## Decisión
Usar los **32 personajes con sus nombres reales**, decidido por el dueño del proyecto conociendo el riesgo. Para reducirlo:
- Los dibujos son **pixel art propio** hecho con letras (ADR 0004), sin copiar sprites ni imágenes oficiales.
- **Aviso visible** en el título del juego y en la portada: juego de fans, no oficial, gratuito; los personajes pertenecen a sus creadores.
- **Sin fines de lucro:** no hay anuncios, pagos ni donaciones.

## Opciones consideradas
- **Personajes originales inspirados** — sin riesgo, pero no es lo que el dueño quiere.
- **Versión privada solo en el iPad** — sin riesgo público, pero no se puede compartir.
- **Nombres reales con aviso de fans** ✅ — lo que pidió el dueño.

## Consecuencias
- ✅ Los jugadores reconocen a sus personajes favoritos.
- ⚠️ **Riesgo:** los dueños de esos animes pueden pedir a GitHub que quite el contenido (un aviso DMCA). GitHub suele bajar el **repositorio completo**, con Snake Rush y Monster Rush incluidos.
- 🛟 **Plan si pasa:** mover Anime Rush a su propio repositorio (o volver a personajes originales, que siguen siendo fáciles de crear con las mismas piezas: `pelo`, `cara`, colores y especial) para no perder los otros juegos. Conviene tener una copia del repo fuera de GitHub.
