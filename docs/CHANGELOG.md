# Historial de cambios

## 0.3.0 — 2026-11-03

### Nuevo

- El mapa cubre el Quindío, no solo el Parque del Café: los doce municipios, hospedaje, comida, café, rumba, parques, miradores y lugares concurridos.
- Seis guías turísticos. Cuentan la historia del departamento y la del lugar cuando existe, y responden preguntas.
- La ruta se arma cerca del pueblo de salida, con hasta 6 paradas, sin cruzar todo el departamento.
- 25 idiomas, incluido árabe de derecha a izquierda.
- Voz neuronal gratuita, con la voz del teléfono como respaldo. Con el micrófono también se le puede hablar al guía.
- Vista 3D con relieve, calendario de fiestas y lugares concurridos (plazas y parques donde se junta la gente).
- Paleta verde y barro. El pasaporte cuenta los lugares imprescindibles.

## 0.2.0 — 2026-10-22

### Nuevo

- **9 idiomas**: se suman alemán, italiano, chino, japonés y coreano (interfaz, diálogos del guía, personajes y las 45 atracciones). Detección automática del idioma del teléfono.
- **Avatares articulados**: codo, mano, rodilla y pie; ojos que miran y parpadean; cejas expresivas; boca con 6 formas sincronizada palabra por palabra con la voz; gestos por frase (saludar, señalar, explicar, pensar, celebrar).
- **Voz mejorada**: prioridad a voces naturales/neuronales y acento latinoamericano, tono natural cuando la voz coincide con el personaje, lectura de "km/h" y "g", velocidad ajustable, prueba de voz, aviso si falta la voz del idioma.
- **Dinámica de juego**: XP, 7 niveles, 8 medallas, celebración con rayos, confeti, subida de nivel y medalla nueva; sonidos de sello, nivel y medalla; "blips" al escribir si la voz está apagada.
- **Pasaporte** con nivel, medallas y los 45 sellos.
- **Lugares**: buscador sin tildes, filtros por zona, distancia y estatura.
- **Ajustes**: idioma, voz, velocidad, cambiar guía, nueva ruta, borrar progreso.
- **Mapa**: fichas por zona con icono, nombres al acercarse, sellos dorados, ruta animada, vista 3D, "ver todo el parque", etiquetas del mapa en el idioma del visitante, aviso si el mapa no carga.
- Chip de "Siguiente parada" con flecha de dirección y distancia.
- Modo sin conexión (service worker) y MapLibre en un archivo aparte para cachearlo mejor.
- Diseño para cualquier celular: pantallas bajas, 320 px y horizontal.

### Corregido

- El mapa volvía solo al último lugar enfocado cada vez que cambiaba el alto del panel.
- El anillo y la burbuja del avatar en el mapa se separaban del personaje.
- Las hojas se desbordaban a la derecha en celulares.
- Las animaciones de pines podían mover el marcador fuera de su coordenada.
- "¿Estoy en el parque?" usaba un círculo de 900 m; ahora usa el contorno real del parque.
- La ruta de "Mitos y leyendas" tenía una sola parada.
- `characters.ts` tenía un BOM al inicio del archivo.
- Sellos duplicados en `localStorage` se contaban dos veces.
- Errores al leer `localStorage` bloqueado ya no rompen la app.
- La voz de Chrome se cortaba en textos largos o justo después de cancelar.

## 0.1.0

- Mapa con 45 atracciones, guía que habla en 4 idiomas, rutas por gustos, sellos y GPS.
