import { useCallback, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { formatTime, useCountdown } from '../hooks/useCountdown.js';
import { prizeCode, randomPrize, shuffle } from '../data/prizes.js';
import './Sopa.css';

const SIZE = 8;
const WORDS = ['PROBA', 'LUCES', 'HORA', 'FOCOS', 'BRILLO', 'GLOW'];
const TIME = 180;
const DIRS = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];
const FILL = 'ABCDEFGHIJKLMNOPRSTUVWYZ';

function build() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
    const placed = {};
    let ok = true;
    for (const w of [...WORDS].sort((a, b) => b.length - a.length)) {
      let done = false;
      for (let t = 0; t < 300 && !done; t++) {
        const [dr, dc] = DIRS[Math.floor(Math.random() * (attempt < 100 ? DIRS.length : 3))];
        const r0 = Math.floor(Math.random() * SIZE);
        const c0 = Math.floor(Math.random() * SIZE);
        const cells = [...w].map((_, i) => [r0 + dr * i, c0 + dc * i]);
        if (cells.some(([r, c]) => r < 0 || c < 0 || r >= SIZE || c >= SIZE)) continue;
        if (cells.some(([r, c], i) => g[r][c] && g[r][c] !== w[i])) continue;
        cells.forEach(([r, c], i) => (g[r][c] = w[i]));
        placed[w] = cells.map(([r, c]) => r * SIZE + c);
        done = true;
      }
      if (!done) { ok = false; break; }
    }
    if (!ok) continue;
    const letters = g.flat().map((ch) => ch || FILL[Math.floor(Math.random() * FILL.length)]);
    return { letters, placed };
  }
  throw new Error('No se pudo generar la sopa');
}

/** Celdas en línea recta entre a y b (horizontal, vertical o diagonal); [] si no es recta. */
function line(a, b) {
  const [r1, c1, r2, c2] = [Math.floor(a / SIZE), a % SIZE, Math.floor(b / SIZE), b % SIZE];
  const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
  const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
  if (r1 !== r2 && c1 !== c2 && Math.abs(r2 - r1) !== Math.abs(c2 - c1)) return [];
  return Array.from({ length: len + 1 }, (_, i) => (r1 + dr * i) * SIZE + (c1 + dc * i));
}

export default function Sopa({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [game, setGame] = useState(build);
  const [found, setFound] = useState([]); // palabras
  const [sel, setSel] = useState([]);
  const [flash, setFlash] = useState(false);
  const [running, setRunning] = useState(true);
  const start = useRef(null);
  const boardRef = useRef(null);

  const [left, setLeft] = useCountdown(TIME, {
    running,
    onEnd: () => {
      setRunning(false);
      play('lose');
      onFinish({ win: false, kicker: 'Se acabó el tiempo', title: '¡Casi lo', highlight: 'logras!',
        stats: [{ label: 'Palabras', value: `${found.length}/${WORDS.length}` }, { label: 'Tiempo', value: '0:00' }],
        tip: 'Busca primero las palabras largas: también se esconden en diagonal y al revés.' });
    },
  });

  const foundCells = new Set(found.flatMap((w) => game.placed[w]));
  const cellAt = (x, y) => {
    const el = document.elementFromPoint(x, y)?.closest('[data-cell]');
    return el && boardRef.current?.contains(el) ? Number(el.dataset.cell) : null;
  };

  const onDown = (e) => {
    if (!running) return;
    const c = cellAt(e.clientX, e.clientY);
    if (c === null) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    start.current = c;
    setSel([c]);
    play('tick');
  };
  const onMove = (e) => {
    if (start.current === null) return;
    const c = cellAt(e.clientX, e.clientY);
    if (c === null) return;
    const l = line(start.current, c);
    if (l.length && l.length !== sel.length) { setSel(l); play('tick'); }
  };
  const onUp = useCallback(() => {
    if (start.current === null) return;
    start.current = null;
    const word = sel.map((i) => game.letters[i]).join('');
    const rev = [...word].reverse().join('');
    const hit = WORDS.find((w) => !found.includes(w) && (w === word || w === rev) &&
      game.placed[w].slice().sort((a, b) => a - b).join() === sel.slice().sort((a, b) => a - b).join());
    if (hit) {
      const nf = [...found, hit];
      setFound(nf);
      setSel([]);
      if (nf.length === WORDS.length) {
        setRunning(false);
        play('win');
        setTimeout(() => onFinish({ win: true, kicker: '¡Lo lograste!', title: 'Sopa', highlight: 'resuelta',
          stats: [{ label: 'Palabras', value: `${WORDS.length}/${WORDS.length}` }, { label: 'Tiempo', value: formatTime(TIME - left) }],
          prize: randomPrize(), code: prizeCode() }), 600);
      } else play('good');
    } else {
      if (sel.length > 1) { play('bad'); setFlash(true); setTimeout(() => setFlash(false), 350); }
      setSel([]);
    }
  }, [sel, game, found, left, play, onFinish]);

  const restart = () => { setGame(build()); setFound([]); setSel([]); setLeft(TIME); setRunning(true); };
  const current = sel.map((i) => game.letters[i]).join('');

  return (
    <GameScreen onBack={onBack} kicker="Palabras" title="Encuentra el" highlight="ritmo">
      <Hud items={[{ label: 'Palabras', value: `${found.length}/${WORDS.length}` }, { label: 'Tiempo', value: formatTime(left), warn: left <= 10 }]} />
      <div ref={boardRef} className={`sp-panel sopa-board${flash ? ' is-wrong' : ''}`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {game.letters.map((ch, i) => (
          <div key={i} data-cell={i} className={`sopa-cell${foundCells.has(i) ? ' is-found' : ''}${sel.includes(i) ? ' is-sel' : ''}`}>{ch}</div>
        ))}
      </div>
      <div className="sopa-hint">{current.length > 1 ? <>Seleccionando · <b>{current}</b></> : 'Desliza el dedo sobre las letras: horizontal, vertical o diagonal'}</div>
      <div className="sopa-words">
        {WORDS.map((w) => (
          <span key={w} className={`sopa-word${found.includes(w) ? ' is-done' : ''}`}>
            {found.includes(w) && <Icon name="check" size={12} stroke={3} />}{w}
          </span>
        ))}
      </div>
      <Actions>
        <Button variant="secondary" block icon="refresh" onClick={restart}>Nueva grilla</Button>
      </Actions>
    </GameScreen>
  );
}
