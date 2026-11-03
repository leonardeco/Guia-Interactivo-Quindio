# Idiomas y traducciones

## Idiomas disponibles

Español, English, Português, Français, Deutsch, Italiano, Nederlands, Català, Svenska, Dansk, Norsk, Polski, Čeština, Română, Magyar, Ελληνικά, Türkçe, Русский, Українська, العربية, हिन्दी, Indonesia, 中文, 日本語 y 한국어.

La lista, los locales de voz y el campo de etiquetas del mapa están en `src/i18n/languages.ts`. Árabe usa `dir="rtl"`. El resto va de izquierda a derecha. Chino y japonés se tratan como escritura CJK al partir frases y al estimar la duración.

La primera visita usa el idioma del teléfono (`navigator.languages`); si no está disponible, español. El visitante lo cambia con el botón del globo o en Ajustes.

## Dónde está cada texto

| Qué | Archivo |
| --- | --- |
| Lista de idiomas | `src/i18n/languages.ts` |
| Interfaz (botones, niveles, medallas) | `src/i18n/messages.ts` |
| Diálogos del guía | `src/guide/lines.ts` |
| Saludo y rol de cada guía | `src/guide/characters.ts` |
| Historia del Quindío y de los lugares | `src/data/history.ts` |
| Texto corto de un lugar sin historia | `src/data/blurb.ts` |
| Nombres de los lugares | el nombre del mapa, igual en todos los idiomas |

Cada fila de `col()` y de `s()` lleva las 25 cadenas en el mismo orden que `languageCodes`.

## Añadir un idioma nuevo

1. Agregar el código a `languageCodes` y su entrada en `languageList`.
2. Sumar una cadena, en la misma posición, en cada `s()` de `messages.ts`, cada `col()` de `lines.ts`, `characters.ts` y `history.ts`, y en `blurb.ts`.
3. Sumar la voz en `server/tts.ts` y las palabras de velocidad en `speech.ts`.
4. `npm test`: fallan si falta una clave, un marcador `{{…}}` o el texto de un lugar.

## Reglas de escritura

- Frases cortas y fáciles de escuchar: el texto también se lee en voz alta.
- Los nombres de los lugares no se traducen.
- En chino y japonés la lista usa `、`. En coreano, comas.
