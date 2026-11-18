import { useState } from 'react';
import { Actions, Button, GameScreen, Hud, Logo } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { formatTime, useCountdown } from '../hooks/useCountdown.js';
import { prizeCode, randomPrize } from '../data/prizes.js';
import './Puzzle.css';

const COLS = 3;
const ROWS = 2;
const N = COLS * ROWS;
const HOLE = N - 1; // la última pieza es el hueco
const TIME = 60;

const neighbors = (pos) => {
  const r = Math.floor(pos / COLS), c = pos % COLS;
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && y < ROWS && x >= 0 && x < COLS).map(([y, x]) => y * COLS + x);
};

/** Mezcla con movimientos legales: siempre tiene solución. order[pos] = pieza */
function scramble() {
  let order, guard = 0;
  do {
    order = [...Array(N).keys()];
    let hole = HOLE, prev = -1;
    for (let i = 0; i < 40; i++) {
      const opts = neighbors(hole).filter((p) => p !== prev);
      const p = opts[Math.floor(Math.random() * opts.length)];
      [order[hole], order[p]] = [order[p], order[hole]];
      prev = hole; hole = p;
    }
    guard++;
  } while (order.every((v, i) => v === i) && guard < 10);
  return order;
}

export default function Puzzle({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [order, setOrder] = useState(scramble);
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(true);
  const holePos = order.indexOf(HOLE);
  const movable = neighbors(holePos);

  const [left, setLeft] = useCountdown(TIME, {
    running,
    onEnd: () => {
      setRunning(false);
      play('lose');
      const ok = order.filter((v, i) => v === i && v !== HOLE).length;
      onFinish({ win: false, kicker: 'Se acabó el tiempo', title: '¡Casi lo', highlight: 'logras!',
        stats: [{ label: 'Piezas', value: `${ok}/${N - 1}` }, { label: 'Movimientos', value: moves }],
        tip: 'Ordena primero la fila de arriba y luego la de abajo.' });
    },
  });

  const move = (pos) => {
    if (!running || !movable.includes(pos)) return;
    const n = [...order];
    [n[holePos], n[pos]] = [n[pos], n[holePos]];
    setOrder(n);
    setMoves((m) => m + 1);
    play('flip');
    if (n.every((v, i) => v === i)) {
      setRunning(false);
      play('win');
      setTimeout(() => onFinish({ win: true, kicker: '¡Lo lograste!', title: 'Logo', highlight: 'armado',
        stats: [{ label: 'Tiempo', value: formatTime(TIME - left) }, { label: 'Movimientos', value: moves + 1 }],
        prize: randomPrize(), code: prizeCode() }), 700);
    }
  };

  const restart = () => { setOrder(scramble()); setMoves(0); setLeft(TIME); setRunning(true); };
  const solved = !running && order.every((v, i) => v === i);

  return (
    <GameScreen onBack={onBack} kicker="Ordena" title="Arma el" highlight="logo">
      <Hud items={[{ label: 'Tiempo', value: formatTime(left), warn: left <= 10 }, { label: 'Movimientos', value: moves }]} />
      <div className="sp-panel">
        <div className={`pz-board${solved ? ' is-solved' : ''}`}>
          {order.map((piece, pos) => {
            if (piece === HOLE) return null;
            const r = Math.floor(pos / COLS), c = pos % COLS;
            const pr = Math.floor(piece / COLS), pc = piece % COLS;
            return (
              <button key={piece} type="button"
                className={`pz-tile${piece === pos ? ' is-ok' : ''}${movable.includes(pos) ? ' is-movable' : ''}`}
                style={{ '--r': r, '--c': c }} onClick={() => move(pos)}
                aria-label={`Pieza ${piece + 1}${movable.includes(pos) ? ', se puede mover' : ''}`}>
                <span className="pz-art" style={{ '--pr': pr, '--pc': pc }}><Logo className="pz-logo" /></span>
                <span className="pz-n">{piece + 1}</span>
              </button>
            );
          })}
          <div className="pz-hole" style={{ '--r': Math.floor(holePos / COLS), '--c': holePos % COLS }} />
        </div>
      </div>
      <div className="pz-target">
        <div className="pz-thumb"><Logo className="pz-thumb-logo" /></div>
        <span>Objetivo · toca una pieza junto al hueco para moverla</span>
      </div>
      <Actions>
        <Button variant="secondary" block icon="refresh" onClick={restart}>Reiniciar</Button>
      </Actions>
    </GameScreen>
  );
}
