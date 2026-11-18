import Ruleta from '../games/Ruleta.jsx';
import Memoria from '../games/Memoria.jsx';
import Sopa from '../games/Sopa.jsx';
import TresEnRaya from '../games/TresEnRaya.jsx';
import Trivia from '../games/Trivia.jsx';
import Jackpot from '../games/Jackpot.jsx';
import Puzzle from '../games/Puzzle.jsx';
import RascaGana from '../games/RascaGana.jsx';
import Atrapa from '../games/Atrapa.jsx';
import Topo from '../games/Topo.jsx';

// Catálogo de la cartelera. `art` = clase .sp-art-* (identidad visual de cada juego).
export const GAMES = [
  { id: 'ruleta', name: 'Ruleta Show', meta: 'Gira y gana', desc: 'Gira la ruleta y descubre premios pensados para tu fiesta.', icon: 'wheel', art: 'ruleta', cta: 'Girar ahora', Component: Ruleta },
  { id: 'memoria', name: 'Memoria LED', meta: '2 min · parejas', icon: 'cards', art: 'memoria', Component: Memoria },
  { id: 'sopa', name: 'Sopa Proba', meta: '6 palabras', icon: 'search', art: 'sopa', Component: Sopa },
  { id: 'tres', name: 'Tres en raya', meta: 'Tú vs. máquina', icon: 'hash', art: 'tres', Component: TresEnRaya },
  { id: 'trivia', name: 'Trivia Show', meta: '5 retos · 10 s', icon: 'help', art: 'trivia', Component: Trivia },
  { id: 'jackpot', name: 'Jackpot Proba', meta: 'Tres iguales', icon: 'slot', art: 'jackpot', Component: Jackpot },
  { id: 'puzzle', name: 'Puzzle Logo', meta: '60 s · ordena', icon: 'puzzle', art: 'puzzle', Component: Puzzle },
  { id: 'rasca', name: 'Rasca y Gana', meta: 'Boleto instantáneo', icon: 'ticket', art: 'rasca', Component: RascaGana },
  { id: 'atrapa', name: 'Atrapa el Brillo', meta: '40 s · reflejos', icon: 'basket', art: 'atrapa', Component: Atrapa },
  { id: 'topo', name: 'Golpea al Topo', meta: '30 s · reflejos', icon: 'hammer', art: 'topo', Component: Topo },
];

// Juego destacado del menú (cámbialo por evento)
export const FEATURED_ID = 'ruleta';
