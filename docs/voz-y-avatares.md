# Voz y avatares

## Voz (`src/guide/speech.ts`)

Primero pide una voz neuronal gratuita (`/api/tts`, sin clave). Si ese servicio no responde, o el navegador no deja reproducir el audio, usa la Web Speech API del teléfono. Las pruebas automáticas usan solo la voz del navegador.

**Elección de voz**

1. Filtra las voces del idioma según `languageInfo(lang).locales` (por ejemplo `es-CO`, `es-US`, `es-MX`, `es-419` primero para español).
2. Prioriza calidad: *Natural / Neural / Premium / Enhanced / Siri* > *Online* > *Google* > voces locales; descarta al final voces robóticas (*eSpeak*, *compact*).
3. Busca el género del personaje por el nombre de la voz y alterna variantes para que dos guías del mismo género no suenen igual.
4. Ajusta el tono: si la voz ya es del género correcto, solo lo matiza (`1 + (base − 1) × 0.45`); si no lo es, lo desplaza más para que un hombre no suene como mujer.

**Arreglos de errores conocidos de los navegadores**

| Problema | Solución |
| --- | --- |
| Chrome corta frases de más de ~15 s | Se habla frase por frase y, fuera de Android, se hace `pause()/resume()` cada 10 s |
| Chrome a veces descarta el habla justo después de `cancel()` | Espera de 60 ms antes de empezar |
| Chrome puede liberar el `SpeechSynthesisUtterance` y no disparar `end` | Se guardan referencias vivas |
| iOS solo deja hablar/sonar tras un toque | `unlockAudio()` en el primer `pointerdown` |
| Safari no tiene `addEventListener` en `speechSynthesis` | Respaldo con `onvoiceschanged` |
| Voces cargan asincrónicamente | `voicesReady()` espera el evento o 800 ms |
| Sin voz para el idioma | Modo silencioso: texto + "blips" + boca animada con tiempos estimados |

**Normalización**: `speakable()` convierte `km/h` en palabras por idioma, `4 g` → `4 G` y quita comillas que algunas voces leen en voz alta. `sentences()` separa también por `。！？` (chino/japonés).

## Avatares (`Avatar.tsx`, `avatar.css`, `useAvatarLife.ts`, `lipsync.ts`)

**Esqueleto SVG**: brazo (hombro → codo → mano con pulgar), pierna (cadera → rodilla → pie), torso, cabeza, cejas, ojos con pupilas y párpados, boca con 6 formas. Contorno marcado estilo caricatura.

**Animaciones CSS** por estado (`avatar--idle | talk | walk | cheer`):

- *Idle*: respiración, balanceo de brazo, giro ocasional de cabeza.
- *Walk*: ciclo de paso con flexión de rodilla y pie, brazos opuestos y balanceo del cuerpo.
- *Talk*: asentir y gestos según `data-gesture`: `wave` (saludo), `point` (señalar el camino), `explain`, `open` (brazos abiertos), `think` (mano al mentón), `celebrate`.
- *Cheer*: salto con estiramiento y brazos arriba.

**Vida sin re-render** (`useAvatarLife`): escribe directamente en el SVG (`data-viseme`, `data-gesture`, `--gx/--gy`, clases), así 3 avatares a la vez no cuestan renders de React.

- Parpadeo irregular (a veces doble).
- Mirada: deambula en reposo, mira al visitante al hablar, mira al frente al caminar.
- Cejas arriba en frases con `!` o `?`.

**Sincronía labial**: `speech.ts` emite eventos `sentence`, `word` (desde `onboundary`) y `end`. `lipsync.ts` convierte cada palabra en formas de boca: vocales → `A / E / O / U`, `m b p` → labios cerrados `M`; en chino, japonés y coreano, una forma por sílaba. Si la voz no informa límites de palabra (o no hay voz), se genera una línea de tiempo para toda la frase con pausas en comas.

Con *reducir movimiento* activado en el sistema, se desactivan gestos, mirada y animaciones.
