# Manual de la guía del Quindío

Este manual es para quien usa la aplicación y para quien la muestra. Los nombres entre comillas son los botones tal como aparecen en español.

## 1. Entrar por primera vez

La primera visita tiene tres pasos. No se puede saltar el idioma ni el guía.

1. **Idioma.** Hay 25. Si el teléfono está en uno de ellos, ese queda marcado. Si no, abre en español. «Continuar».
2. **Guía.** Hay seis. Al tocar uno, saluda. El elegido es el que acompaña el recorrido. Se puede cambiar después en Ajustes.

| Guía | Oficio |
| --- | --- |
| Camila | Naturaleza |
| Santiago | Ciudad |
| Lucía | Mesa |
| Mateo | Montaña |
| Valentina | Pueblos |
| Andrés | Hospedaje |

3. **Gustos y pueblo de salida.** Los gustos son Pueblos, Naturaleza, Café, Comer, Miradores, Dónde dormir, Rumba y En familia. Hay que marcar al menos uno para «¡Armar mi ruta!». El pueblo de salida, por defecto Armenia, es el centro de esa ruta.

«Explorar sin ruta» entra al mapa con el guía elegido y sin paradas armadas.

## 2. Leer el mapa

Al entrar, el mapa muestra todo el Quindío.

- De lejos se ven pueblos, parques, miradores, lugares concurridos, sitios destacados y las llegadas: el aeropuerto El Edén y la terminal de Armenia.
- En el zoom medio se ocultan restaurantes y cafés, para que el mapa no se llene.
- De cerca se ve todo: hoteles, fincas, restaurantes, cafés y rumba.
- Los filtros de arriba muestran un solo tipo. El de hospedaje se llama Hospedaje. El de lugares concurridos reúne las plazas donde se junta la gente. La parada de la ruta, el lugar elegido y la siguiente parada siguen visibles.
- «3D» inclina el mapa y muestra el relieve. «2D» lo deja plano.
- «Ver todo el Quindío» vuelve al encuadre del departamento.
- El botón de descarga guarda la vista que se está viendo, para volver a verla sin red en la versión publicada. No baja el departamento entero. En `npm run dev` el mapa sigue pidiendo red.
- El buscador de Lugares ignora las tildes: `jardin botanico` encuentra el Jardín Botánico del Quindío.

Cada pin abre la ficha del lugar: nombre, pueblo, distancia y lo que el guía dice de ese sitio. Si el lugar tiene foto, es de Wikimedia Commons y el crédito incluye el año de la toma. Hay foto de Filandia (2025), Circasia (2024), el valle del Cocora, el Parque Nacional del Café, el aeropuerto El Edén y Calarcá (2022–2023) y Salento (2020). Armenia se queda sin foto porque en Commons no hay una reciente de la plaza. La ficha muestra la temperatura y si llueve, con el crédito de Open-Meteo. En un pueblo, si hay fiesta con fecha pública, sale ahí y pide confirmar en la alcaldía. El botón «Calendario» junta esas fiestas: Calarcá en junio, Armenia hacia el 14 de octubre, Quimbaya el 7 y 8 de diciembre, y Filandia en agosto. Esa de Filandia se suspendió en 2026 y no hay fecha nueva. Las fechas cambian de un año a otro. «Compartir» copia un enlace del lugar abierto o, si no hay lugar, de la ruta armada. Abajo hay enlace a la página oficial del paisaje cafetero y a quindiocorazondecolombia.com.

Al valle del Cocora no se llega caminando desde Armenia. El jeep sale de la plaza de Salento. El aeropuerto queda en La Tebaida, a unos 18 km de Armenia.

El botón «Mapas», arriba, cambia de mapa. Quindío es el de esta guía. Aruba es la isla, con la costa, sus pueblos y sus sellos aparte; ahí el encuadre dice «Ver todo» y no hay calendario de fiestas. «Quindío y vecinos» deja estos lugares y suma Pereira, Manizales y tres pueblos del norte del Valle: Sevilla, Caicedonia y Alcalá. El verde sigue siendo solo el departamento. No hay línea del eje cafetero ni de Los Nevados. Cada mapa guarda sus sellos. La ruta de un día no salta de Pereira a Armenia, ni de una de esas ciudades a otra.

## 3. La ruta

Con gustos elegidos, la ruta tiene como máximo 6 paradas y se queda en una zona, cerca del pueblo de salida.

- «Siguiente parada» manda al guía hacia la próxima que falta.
- La línea sigue las vías principales cuando la red de rutas responde. Si no responde, queda una recta de guía y el guía lo dice en voz alta.
- «Recorrido automático» sigue solo. «Pausar» lo detiene.
- El contador dice cuántas paradas de la ruta ya tienen sello, por ejemplo `Ruta 2/6`.
- «Nueva ruta», en Ajustes, vuelve a pedir gustos y pueblo de salida. Los sellos no se borran.

## 4. Llegar a un lugar

Hay dos maneras de marcar el sello.

- **Yendo hacia él.** «Ir allí» o «Siguiente parada» deja ese lugar como destino. Con «Ubícame» prendido, el sello se marca al estar ahí. Si el GPS está apagado, el guía camina por el mapa y marca el sello al llegar.
- **Ya estando ahí.** En la ficha, «Llegué» marca el sello sin esperar al GPS.

«Ubícame» sigue dentro del mapa que está abierto. Si el teléfono está fuera, lo dice y no sigue. Pasar cerca de un café que no es el destino no marca sello.

La ubicación no se envía a ningún servidor. Queda en el teléfono, y solo mientras la app está abierta.

## 5. Preguntarle al guía

El cuadro dice «Pregúntale al guía». Unos ejemplos:

| Se escribe | Qué responde |
| --- | --- |
| `historia de Salento` | La historia de ese pueblo |
| `historia del Quindío` | La del departamento. También está el botón «Historia del Quindío» |
| `dónde comer` | Hasta tres restaurantes del pueblo más cercano |
| `dónde comer en Filandia` | Restaurantes de ese pueblo |
| `hotel Quimbaya` | El hotel, no el pueblo |
| `Quimbaya` | El pueblo, que es el lugar con historia |
| `qué ver` o `una ruta` | Una ruta corta desde donde está el visitante |

Si el lugar no tiene historia registrada, lo dice y describe qué es. No inventa el año de un negocio.

«¿Dónde estoy?» nombra lo que queda cerca en el mapa, sin marcar sellos.

## 6. Voz

Al hablar, el guía mueve la boca. Primero intenta una voz más natural. Si ese servicio no responde, usa la voz del teléfono y el resto de la visita sigue con esa. La primera frase puede tardar un momento.

En el cuadro de pregunta, el micrófono deja hablarle al guía. El teléfono convierte la voz en texto y el guía responde igual que si se hubiera escrito. Si el teléfono no tiene reconocimiento de voz, el botón no aparece y se escribe la pregunta. El audio no sale del teléfono.

- «Silenciar» deja el texto. «Activar voz» la devuelve.
- «Repetir» vuelve a decir la última frase. Con la voz apagada, la vuelve a escribir.
- «Callar» corta la frase en curso.
- En Ajustes se baja o se sube la velocidad, y se puede probar la voz.

Si el teléfono no tiene voz para ese idioma, se ve el texto y la boca se mueve igual.

## 7. Pasaporte

El botón de sellos abre el pasaporte.

- Cada lugar nuevo suma un sello y puntos.
- La cuadrícula del pasaporte muestra los imprescindibles: los doce pueblos y los sitios con historia escrita. Un hotel o un restaurante suman sello si se visitan, pero no hacen parte de esa meta.
- Niveles: Visitante, Caminante, Explorador, Baquiano, Guía de finca, Andariego, Embajador del Quindío.
- Medallas: Primer sello, cinco visitas, diez visitas, cuatro lugares de café, tres miradores, cuatro cafés o restaurantes, una ruta terminada, y Quindío mayor (todos los imprescindibles).

Al marcar un sello nuevo hay una pantalla de celebración. Si se toca el mapa en ese momento, el guía vuelve a su pose normal. El sello ya quedó guardado.

## 8. Ajustes

- Idioma.
- Voz y velocidad.
- «Cambiar guía».
- «Nueva ruta».
- Borrar el progreso. Eso quita sellos, ruta y guía, y vuelve a la primera visita. Conviene avisarlo antes de pulsarlo.

## 9. Instalarla y usarla sin red

En el celular, desde el navegador, se puede agregar a la pantalla de inicio. Queda con el nombre Quindío.

Sin conexión solo funciona lo que ya se abrió, o la vista guardada con el botón de descarga, en la versión publicada. En el computador, con `npm run dev`, siempre hace falta red para ver el mapa. No se descarga el departamento entero por adelantado.

## 10. Qué no hace

- No reserva hotel, finca ni mesa.
- No muestra precios ni horarios en vivo. El pin dice qué es el lugar y en qué pueblo está.
- La lista de hospedaje sale del mapa público. El filtro «Hospedaje» agrupa fincas, hostales, apartamentos y camping. Varios se reservan también por Airbnb; la guía no se conecta con esa plataforma.
- El clima es una lectura de Open-Meteo, no un pronóstico de la alcaldía. El uso libre de ese servicio es no comercial.
- La línea de la ruta es la vía principal cuando hay red. No es un navegador paso a paso.
- En el mapa del Quindío, «Ubícame» solo sigue dentro del departamento. En Aruba sigue dentro de la isla. En el de vecinos también sigue cerca de Pereira, Manizales, Sevilla, Caicedonia o Alcalá. Fuera de eso lo dice y no sigue.
- No crea una cuenta ni guarda la visita en un servidor.

## 11. Para quien la publica

Hace falta Node.js 20 o superior.

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

`npm test` corre las pruebas. `npm run build` deja la versión publicable en `dist/`. `npm run preview` la muestra. `npx vercel --prod` la sube si el proyecto ya está enlazado a Vercel.

La voz neuronal es un extra. Si no responde, la visita no se rompe: habla el teléfono.
