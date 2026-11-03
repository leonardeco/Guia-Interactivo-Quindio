# Guía interactivo del Quindío

El departamento, en el celular. Doce municipios, un guía que camina con el visitante, una ruta corta y un pasaporte de sellos. Sirve para quien llega de paso y para quien quiere armar el día: pueblos, café, naturaleza, comida, miradores, rumba y dónde dormir.

Se abre en el navegador, se puede dejar en la pantalla de inicio y habla en 25 idiomas. El árabe se lee de derecha a izquierda. La primera vez usa el idioma del teléfono.

El paso a paso está en el [manual](docs/manual.md).

## Qué se lleva el visitante

- Un mapa de todo el Quindío, no de un solo parque.
- Seis guías. Cada uno tiene un oficio: naturaleza, ciudad, mesa, montaña, pueblos u hospedaje.
- Una ruta de hasta 6 paradas, cerca del pueblo de salida. No atraviesa el departamento de punta a punta.
- Historia del Quindío, y la del lugar cuando hay un hecho público. Si no la hay, el guía dice qué es el sitio y en qué pueblo queda.
- Un pasaporte: sellos, puntos y medallas. El progreso queda en ese teléfono.

## Los doce municipios

Armenia, Buenavista, Calarcá, Circasia, Córdoba, Filandia, Génova, La Tebaida, Montenegro, Pijao, Quimbaya y Salento.

## Los guías

| Guía | Se encarga de |
| --- | --- |
| Camila | Naturaleza: palmas, miradores y pueblos |
| Santiago | Ciudad y rumba |
| Lucía | La mesa: restaurantes y cafés |
| Mateo | Montaña y caminos |
| Valentina | Pueblos y su historia |
| Andrés | Dónde dormir |

Se elige uno al entrar. Se puede cambiar después, en Ajustes.

## Cómo se recorre

1. Idioma, guía, gustos y pueblo de salida. También se puede mirar el mapa sin armar ruta.
2. El mapa abre con todo el departamento. De lejos se ven pueblos, parques, miradores, lugares concurridos y las llegadas: el aeropuerto El Edén, en La Tebaida, y la terminal de Armenia. Al acercarse aparecen hoteles, restaurantes y cafés. «3D» inclina el mapa y muestra el relieve.
3. «Siguiente parada» lleva al guía. Si hay red, la línea sigue las vías principales. Si no, queda una guía en línea recta y el guía lo dice. «Ubícame» sigue al visitante. El sello se marca al llegar al lugar al que iba, o con el botón «Llegué».
4. En el cuadro se le pregunta, escribiendo o con el micrófono: la historia de un pueblo, dónde comer, dónde dormir o qué ver. «Calendario» reúne las fiestas con fecha pública y pide confirmarlas en la alcaldía.

Ejemplos que entiende: `historia de Salento`, `dónde comer`, `hotel en Armenia`, `qué ver`.

## Sellos

Cada lugar nuevo deja un sello. La meta del pasaporte son los pueblos y los sitios con historia escrita, no cada hotel ni cada restaurante.

Los niveles van de Visitante a Embajador del Quindío. Las medallas premian el primer sello, cinco y diez visitas, el café, los miradores, la mesa, una ruta terminada y el recorrido de los imprescindibles.

## De dónde sale lo que se cuenta

Los lugares y el contorno salen de OpenStreetMap. El hospedaje es el que el mapa marca como hotel, finca, hostal, apartamento o camping. El filtro se llama Hospedaje. Varios también se reservan por Airbnb; esta guía no reserva ni se conecta con esa plataforma.

La historia se cuenta solo donde hay un hecho público: la fundación de un pueblo, el departamento en 1966, el sismo de 1999, el Paisaje Cultural Cafetero y sitios como el Parque Nacional del Café, el valle del Cocora o el Museo del Oro Quimbaya. El paisaje es Patrimonio Mundial desde 2011. La lista oficial cubre 11 de los 12 municipios; La Tebaida no está en esa lista, aunque sí está en el departamento y ahí queda el aeropuerto. Un negocio sin fecha no recibe una inventada.

En la ficha de un pueblo aparecen las fiestas que ya tienen fecha pública, con la nota de confirmar en la alcaldía. El clima de la ficha sale de Open-Meteo: temperatura y si llueve o no. Las fotos, cuando hay, son de Wikimedia Commons y llevan el crédito. Salento, Filandia, el valle del Cocora y el Parque Nacional del Café tienen foto. El resto no, para no inventar una imagen.

Nombres y horarios cambian. Conviene confirmar antes de ir. La ficha enlaza la página oficial del Paisaje Cultural Cafetero y quindiocorazondecolombia.com.

## Privacidad

La ubicación no sale del teléfono y el GPS solo sigue dentro del Quindío. Idioma, guía, gustos, pueblo de salida y sellos quedan en el navegador. No hay cuenta. El texto de la voz sale del teléfono solo mientras el guía habla.

## Correrla

Hace falta Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`.

| Comando | Qué hace |
| --- | --- |
| `npm test` | Pruebas |
| `npm run build` | Deja la app en `dist/` |
| `npm run preview` | Muestra ese resultado |

En el build de producción, lo ya visto queda disponible sin conexión. El botón de descarga en el mapa guarda la vista actual, no el departamento entero. En desarrollo ese guardado no queda para después: el modo local no usa el servicio que guarda los mosaicos.

`vercel.json` publica `dist/`. La voz neuronal, si el servicio responde, entra por `api/tts`. Si no responde, habla la voz del teléfono.

```bash
npx vercel --prod
```

## Cómo está armada

React 19, TypeScript y Vite 7. El mapa es MapLibre, con el estilo Liberty de OpenFreeMap y mosaicos de OpenStreetMap si ese estilo falla.

```
src/App.tsx            Recorrido, voz, GPS y paneles
src/data/              Lugares, historia y contorno
src/guide/             Guías, voz, ruta, preguntas y llegada
src/i18n/              25 idiomas
src/map/ParkMap.tsx    Mapa, pines y filtros
src/game/progress.ts   Puntos, niveles y medallas
public/                Instalación y uso sin conexión
api/tts.ts             Voz al publicar
server/tts.ts          La misma voz, en local
```

Más detalle para quien mantiene el código: [arquitectura](docs/arquitectura.md), [voz y avatares](docs/voz-y-avatares.md), [idiomas](docs/idiomas.md), [cambios](docs/CHANGELOG.md).

## Créditos

Mapa © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright). Estilo [OpenFreeMap](https://openfreemap.org/) Liberty. Motor [MapLibre GL JS](https://maplibre.org/). Iconos de [Lucide](https://lucide.dev/). Fredoka y Public Sans, de Google Fonts.
