# Arquitectura

El uso para el visitante está en [manual.md](manual.md). Esto es cómo está armado el código.

## Stack

- **React 19 + TypeScript + Vite 7**, sin backend. Todo corre en el navegador.
- **MapLibre GL JS 6** con el estilo vectorial *Liberty* de OpenFreeMap; si falla, cambia a mosaicos raster de OpenStreetMap; si también falla, muestra un aviso y el guía sigue funcionando.
- **i18next / react-i18next** para la interfaz; los diálogos del guía viven en `src/guide/lines.ts` como funciones tipadas por idioma.
- **Vitest + Testing Library**.
- **Voz neuronal** en `api/tts` (y en el servidor de Vite durante `npm run dev`). Si no responde, se usa la voz del teléfono.

## Flujo principal

```
Onboarding (idioma → guía → gustos y pueblo de salida)
        │
        ▼
App ── buildRoute(gustos, pueblo, lugares del mapa) ──► ruta corta, sin saltar de ciudad
 │
 ├─ "Siguiente parada" ─► goTo() ─► useWalker anima al guía ─► checkpoint()
 ├─ GPS (watchPosition) ─► findArrival() ─────────────────────► checkpoint()
 └─ Tocar un pin / buscar en Lugares ─► selectPlace() ─► ficha + narración

checkpoint() ─► guarda sello ─► XP / nivel / medallas ─► Celebration ─► narración ─► continueTour()
```

`App.tsx` guarda en `live` (ref) los valores que leen los callbacks asíncronos (voz, GPS, animación) para evitar cierres con estado viejo.

## Estado persistido (`localStorage`)

| Clave | Contenido |
| --- | --- |
| `pdc.lang` | Idioma elegido (o detectado del teléfono en la primera visita) |
| `qui.guide` | Guía elegido |
| `qui.tastes` | Gustos para la ruta |
| `qui.region` | Mapa abierto: `quindio`, `aruba` o `eje` |
| `qui.base` | Pueblo de salida del Quindío. Aruba y el mapa de vecinos usan `qui.base.aruba` y `qui.base.eje` |
| `qui.visited` | Sellos del Quindío. Los otros mapas usan `qui.visited.aruba` y `qui.visited.eje` |
| `qui.routes` | Rutas completadas en el Quindío. Los otros mapas usan `qui.routes.aruba` y `qui.routes.eje` |
| `pdc.voice` / `pdc.speed` | Voz activada y velocidad |

Todas las lecturas y escrituras están envueltas en `try/catch` (modo privado, almacenamiento bloqueado).

## Mapa

Hay tres mapas: Quindío, Aruba y el de vecinos. Cada uno trae sus lugares y su contorno. El de vecinos reutiliza el contorno del departamento; Pereira, Manizales, Sevilla, Caicedonia y Alcalá quedan fuera de ese verde. Los pines se reconstruyen al cambiar de mapa.

- Los pines son elementos DOM (`Marker`) con fichas CSS. **MapLibre posiciona los marcadores con `transform`**, así que las animaciones (rebote, pulso) se aplican al hijo `.pin-token`, nunca al marcador.
- De lejos (zoom menor a 11,5) se ven pueblos, destacados, miradores, parques y lugares concurridos. En el medio se ocultan restaurantes y cafés. De cerca se ve todo. Un filtro de tipo muestra solo esa categoría. La ruta, el lugar elegido y la siguiente parada siempre quedan visibles.
- La ruta se dibuja con tres capas (borde, base y trazo) y el trazo "marcha" cambiando `line-dasharray` a ~14 fps; se pausa con la pestaña oculta o con *reducir movimiento*.
- `localizeLabels()` reemplaza el `text-field` de las capas de símbolos por `coalesce(name:<idioma>, name)`.
- El encuadre usa el alto real del panel del guía, limitado al 72 % del mapa, y en horizontal ignora el panel (va al costado).

## Diseño responsivo

- Vertical normal: panel inferior con acción principal a todo el ancho.
- Pantallas bajas (≤ 760 px de alto): todas las acciones en una fila, burbuja de 3 líneas, avatar más pequeño.
- ≤ 360 px de ancho: herramientas solo con icono (con `aria-label`).
- Horizontal (≤ 520 px de alto): el guía pasa a un panel lateral derecho.

## Offline

`public/sw.js` (solo en producción):

- Navegación: red primero, respaldo en caché.
- `/assets/*` (con hash): caché primero.
- Mosaicos y fuentes: *stale-while-revalidate*, máximo 1 500 entradas. No se descargan mosaicos por adelantado, para respetar las políticas de uso de los servidores de mapas.
