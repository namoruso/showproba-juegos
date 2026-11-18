# ShowProba · Juegos (React)

Rediseño "noche de show" de los 10 juegos de ShowProba, con lógica completa. Es React 18 con Vite y no usa ninguna otra librería.

## Puesta en marcha

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # versión final en dist/ (sirve como sitio estático; rutas relativas)
```

## GitHub Pages

Al hacer push a `main`, el workflow `.github/workflows/pages.yml` construye el proyecto y publica la carpeta `dist/`.

1. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. La demo queda en: `https://namoruso.github.io/showproba-juegos/`

## Estructura

```
src/
  App.jsx                 navegación: menú → juego → resultados
  styles/
    tokens.css            colores, sombras, espaciado, radios y fuentes (del design system)
    system.css            componentes base .sp-* (botones, HUD, tarjetas, estados, animaciones)
    app.css               layout de pantallas, menú (móvil + tótem) y resultados
  components/
    ui.jsx                Logo, Button, IconButton, TopBar, GameHeader, Hud, Badge, GameScreen, Actions
    Icon.jsx              set de íconos de línea
    Menu.jsx              menú con juego destacado
    Results.jsx           resultados compartidos (victoria / derrota, premio con código)
  games/                  un componente + CSS por juego
  data/
    games.js              catálogo del menú y juego destacado (FEATURED_ID)
    prizes.js             premios del evento y generador de códigos
    trivia.js             banco de preguntas
  hooks/
    useCountdown.js       temporizador
    feedback.jsx          sonidos (WebAudio, sin archivos), vibración y botón de silencio
```

## Contrato de un juego

Cada juego recibe `onBack()` y `onFinish(result)`:

```js
onFinish({
  win: true,
  kicker: '¡Lo lograste!',
  title: 'Memoria', highlight: 'completada',
  stats: [{ label: 'Tiempo', value: '1:12' }],
  prize: 'Selfie Mirror', code: 'SHOW-9QX2',   // solo si gana
  tip: 'Consejo para la derrota',              // opcional
});
```

Para agregar un juego, crea `src/games/MiJuego.jsx` y súmalo a `data/games.js` con su arte `.sp-art-*` (en `system.css`).

## Ajustes rápidos

| Qué | Dónde |
| --- | --- |
| Premios | `data/prizes.js` → `PRIZES` |
| Juego destacado | `data/games.js` → `FEATURED_ID` |
| Preguntas de trivia | `data/trivia.js` |
| Giros de la ruleta | `games/Ruleta.jsx` → `SPINS` |
| Tiempo de cada juego | constante `TIME` / `SECONDS` en cada archivo |
| Probabilidad del jackpot | `games/Jackpot.jsx` → `WIN_CHANCE` |
| Dificultad de la máquina (tres en raya) | `games/TresEnRaya.jsx` → `MISTAKE` |
| Probabilidad de boleto ganador (rasca y gana) | `games/RascaGana.jsx` → `WIN_CHANCE` |
| Productos y obstáculos que caen (atrapa) | `data/dropItems.js` |
| Meta, vidas y tiempo (atrapa) | `games/Atrapa.jsx` → `GOAL`, `LIVES`, `TIME` |
| Meta, puntos y penalización (topo) | `games/Topo.jsx` → `GOAL`, `HIT`, `GOLD`, `PENALTY` |

## Notas

- **Logo:** `src/assets/showproba-logo-white.png` se recortó de una captura de pantalla. Reemplázalo por el original con el mismo nombre. Siempre se muestra con alto fijo y ancho automático, así que nunca se deforma.
- **Tótem / escritorio:** desde 1024 px de ancho en horizontal, el menú cambia a dos columnas. Desde 900 px, los juegos se muestran en una columna centrada.
- **Accesibilidad:** respeta `prefers-reduced-motion`, todos los controles son botones con etiqueta y los estados se distinguen sin depender solo del color.
- **Fuentes:** Unbounded y Outfit vienen de `@fontsource`, sin Google Fonts en tiempo de ejecución, así que también funcionan sin conexión.

## Juegos de reflejos y tacto

- **Rasca y Gana:** la capa dorada es un `<canvas>` que se borra con el dedo. Al raspar el 55 %, se descubre el resto. Para ganar hay que sacar tres símbolos iguales; si el boleto pierde, muestra dos iguales y uno distinto para dejar la sensación de "casi".
- **Atrapa el Brillo:** el bucle corre con `requestAnimationFrame` y los objetos caen cada vez más rápido. La cesta se mueve con el dedo, el ratón o las flechas del teclado. Para cada marca, cambia los íconos en `data/dropItems.js`.
- **Golpea al Topo:** cuadrícula de 3×3 con tres personajes: topo (+10), topo dorado (+30) y foco rojo (−15). Los topos aparecen cada vez más rápido y cinco aciertos seguidos dan un bonus.
