# Guía interactivo del Quindío

Mapa para recorrer el Quindío desde el celular. Cubre los doce municipios: hospedaje, comida, cafés, parques, miradores, rumba y sitios concurridos. Un guía animado arma una ruta corta, cuenta la historia del departamento y la del lugar cuando hay un hecho público, y va marcando sellos en un pasaporte.

Funciona en pantallas desde 320 px, en vertical y en horizontal, y se puede instalar en la pantalla de inicio.

## Cómo se recorre

1. En la primera visita se elige idioma, guía, gustos y el pueblo de salida. También se puede entrar a mirar el mapa sin armar ruta.
2. El mapa abre encuadrado en todo el departamento.
3. Con gustos elegidos, la ruta se queda en una zona: hasta 6 paradas, sin cruzar el Quindío de punta a punta.
4. «Siguiente parada» lleva al guía caminando. «Ubícame» sigue al visitante y marca el sello al llegar.
5. Al llegar hay sello, puntos y, si toca, un nivel o una medalla.
6. En el cuadro de pregunta se puede pedir un lugar, la historia o qué ver cerca.

## Municipios

Armenia, Buenavista, Calarcá, Circasia, Córdoba, Filandia, Génova, La Tebaida, Montenegro, Pijao, Quimbaya y Salento.

## Mapa

Los lugares salen de OpenStreetMap y se dibujan con MapLibre. El estilo es Liberty, de OpenFreeMap. Si ese estilo no carga, el mapa pasa a los mosaicos de OpenStreetMap. Si tampoco cargan, queda un aviso y el guía sigue hablando.

De lejos se ven pueblos, parques, miradores y lugares destacados. Al acercarse aparecen hoteles, restaurantes y cafés. Hay filtros por tipo. La parada de la ruta, el lugar elegido y la siguiente parada se quedan visibles aunque el zoom los esconda.

El buscador ignora las tildes: `jardin botanico` encuentra el Jardín Botánico del Quindío.

## Guía y voz

Hay seis guías: Camila, Santiago, Lucía, Mateo, Valentina y Andrés. Caminan por el mapa, saludan, señalan y mueven la boca con lo que dicen.

La voz intenta primero un audio neuronal, sin clave. Si ese servicio no responde, habla con la voz del teléfono. Se puede bajar o subir la velocidad, silenciar, y el texto queda en pantalla. Si el teléfono no tiene voz para el idioma, se ve el texto y la boca se mueve igual.

La historia entra cuando el lugar la tiene: fundación de un pueblo, el departamento en 1966, el sismo de 1999, el Paisaje Cultural Cafetero, el Parque Nacional del Café y algunos sitios con nombre propio. Si no hay historia registrada, el guía dice qué es el sitio y en qué pueblo queda.

## Idiomas

Español, English, Português, Français, Deutsch, Italiano, Nederlands, Català, Svenska, Dansk, Norsk, Polski, Čeština, Română, Magyar, Ελληνικά, Türkçe, Русский, Українська, العربية, हिन्दी, Indonesia, 中文, 日本語 y 한국어.

La primera visita usa el idioma del teléfono. Si ese idioma no está, abre en español. El árabe va de derecha a izquierda. Se cambia con el globo o en Ajustes.

## Pasaporte

Cada lugar nuevo deja un sello. Los imprescindibles son la meta del pasaporte. Hay puntos de experiencia, 7 niveles (de Visitante a Embajador del Quindío) y 8 medallas. Todo eso queda guardado en el navegador de ese teléfono.

## De dónde salen los datos

| Qué | Origen |
| --- | --- |
| Lugares y contorno | OpenStreetMap |
| Hospedaje | Lo que el mapa marca como hotel, finca, hostal, apartamento o camping |
| Historia | Hechos públicos. Si un sitio no tiene fecha conocida, no se le pone una |
| Nombres en otros idiomas | El nombre del mapa se deja igual. Lo que se traduce es la interfaz, el guía y la historia |

Varios hospedajes también se reservan por Airbnb. Esta app no se conecta con Airbnb: la lista es la del mapa.

Horarios, nombres y si un negocio sigue abierto pueden cambiar. Conviene confirmar antes de ir.

## Privacidad

- La ubicación se usa solo en el teléfono. No se guarda ni se envía a ningún servidor.
- El GPS solo sigue al visitante dentro del Quindío.
- Idioma, guía, gustos, pueblo de salida, sellos y rutas completadas quedan en el `localStorage` del navegador.
- El texto que se lee en voz alta sale del teléfono únicamente mientras el guía habla. No hay cuenta ni historial.
- Los servidores de mapas reciben la petición de los mosaicos del área que se está mirando.

## Correrla en local

Hace falta Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`.

| Comando | Qué hace |
| --- | --- |
| `npm test` | Pruebas con Vitest |
| `npm run build` | Revisa TypeScript y deja la app en `dist/` |
| `npm run preview` | Sirve lo que quedó en `dist/` |

En producción, el service worker guarda la app y los mosaicos que ya se vieron. No descarga el mapa entero por adelantado.

## Publicarla

`vercel.json` compila con `npm run build`, publica `dist/` y define la caché: el service worker no se cachea; los assets con hash, un año. La voz neuronal entra por `api/tts`. En local la atiende el mismo servidor de `npm run dev`.

```bash
npx vercel --prod
```

## Cómo está armada

React 19, TypeScript y Vite 7. El mapa es MapLibre GL JS. Los textos de la interfaz pasan por i18next. No hay backend propio, salvo la ruta de voz al publicar.

```
src/
  App.tsx                  Recorrido: estado, voz, GPS, progreso y paneles
  data/
    attractions.ts         Catálogo, pueblos y colores
    catalog.json           Lugares de partida
    history.ts             Historia del departamento y de los lugares que la tienen
    blurb.ts               Texto corto cuando no hay historia
    boundary.json          Contorno del Quindío
  game/progress.ts         Puntos, niveles y medallas
  guide/
    Avatar.tsx             Guía dibujado
    speech.ts              Voz neuronal y voz del teléfono
    lines.ts               Lo que dice el guía
    characters.ts          Los seis guías
    ask.ts                 Preguntas
    route.ts               Ruta por gustos y pueblo
    checkpoint.ts          Llegada por GPS
  i18n/
    languages.ts           Idiomas y etiquetas del mapa
    messages.ts            Textos de la interfaz
  map/ParkMap.tsx          Mapa, pines, ruta y filtros
public/
  sw.js                    Service worker
  manifest.webmanifest     Instalación como app
api/tts.ts                 Voz en el despliegue
server/tts.ts              La misma voz, en desarrollo
```

El detalle está en `docs/`:

- [Arquitectura](docs/arquitectura.md)
- [Voz y avatares](docs/voz-y-avatares.md)
- [Idiomas](docs/idiomas.md)
- [Cambios](docs/CHANGELOG.md)

## Créditos

Mapa © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright). Estilo [OpenFreeMap](https://openfreemap.org/) Liberty. Motor [MapLibre GL JS](https://maplibre.org/). Iconos de [Lucide](https://lucide.dev/). Fredoka y Public Sans, de Google Fonts. El resto de escrituras usa las fuentes del sistema.
