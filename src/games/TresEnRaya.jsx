import { useEffect, useState } from 'react';
import { Actions, Button, GameScreen } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { prizeCode, randomPrize } from '../data/prizes.js';
import './TresEnRaya.css';

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const TARGET = 3; // rondas para ganar la partida
const MISTAKE = 0.25; // probabilidad de que la máquina juegue al azar (para que sea ganable)

const winner = (b) => {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { who: b[l[0]], line: l };
  return b.every(Boolean) ? { who: 'draw', line: [] } : null;
};

function aiMove(b) {
  const free = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  if (Math.random() < MISTAKE) return free[Math.floor(Math.random() * free.length)];
  const tryFor = (p) => free.find((i) => { const n = [...b]; n[i] = p; return winner(n)?.who === p; });
  return tryFor('O') ?? tryFor('X') ?? (b[4] ? undefined : 4) ?? [0, 2, 6, 8].filter((i) => !b[i]).sort(() => Math.random() - 0.5)[0] ?? free[0];
}

const X = () => <svg viewBox="0 0 60 60" className="ttt-x"><path d="M14 14l32 32M46 14L14 46" /></svg>;
const O = () => <svg viewBox="0 0 60 60" className="ttt-o"><circle cx="30" cy="30" r="17" /></svg>;

export default function TresEnRaya({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [round, setRound] = useState(1);
  const result = winner(board);

  // Turno de la máquina
  useEffect(() => {
    if (turn !== 'O' || result) return undefined;
    const id = setTimeout(() => {
      const i = aiMove(board);
      setBoard((b) => { const n = [...b]; n[i] = 'O'; return n; });
      setTurn('X');
      play('flip');
    }, 550);
    return () => clearTimeout(id);
  }, [turn, result, board, play]);

  // Fin de ronda
  useEffect(() => {
    if (!result) return;
    if (result.who === 'draw') { play('tick'); return; }
    setScore((s) => ({ ...s, [result.who]: s[result.who] + 1 }));
    play(result.who === 'X' ? 'good' : 'bad');
  }, [result?.who, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const matchOver = score.X >= TARGET || score.O >= TARGET;

  const tap = (i) => {
    if (board[i] || turn !== 'X' || result) return;
    const n = [...board]; n[i] = 'X';
    setBoard(n); setTurn('O'); play('tap');
  };

  const nextRound = () => {
    if (matchOver) {
      const win = score.X >= TARGET;
      onFinish(win
        ? { win: true, kicker: '¡Ganaste la partida!', title: 'Estratega', highlight: 'del show', stats: [{ label: 'Tú', value: score.X }, { label: 'Máquina', value: score.O }], prize: randomPrize(), code: prizeCode() }
        : { win: false, kicker: 'Ganó la máquina', title: '¡Casi lo', highlight: 'logras!', stats: [{ label: 'Tú', value: score.X }, { label: 'Máquina', value: score.O }], tip: 'Ocupa el centro o una esquina en tu primera jugada.' });
      return;
    }
    setBoard(Array(9).fill(null));
    setRound((r) => r + 1);
    setTurn(round % 2 ? 'O' : 'X'); // se alterna quién empieza
  };

  const status = result
    ? result.who === 'X' ? '¡Ganaste la ronda!' : result.who === 'O' ? 'Punto para la máquina' : 'Empate'
    : turn === 'X' ? 'Tu turno' : 'Piensa la máquina…';

  return (
    <GameScreen onBack={onBack} kicker="Estrategia" title="Tres en" highlight="línea">
      <div className="ttt-players">
        <div className={`ttt-p${turn === 'X' && !result ? ' is-on' : ''}`}><b className="ttt-xm">X</b><div><small>Tú</small><strong>{score.X}</strong></div></div>
        <div className="ttt-vs">A {TARGET}</div>
        <div className={`ttt-p${turn === 'O' && !result ? ' is-on' : ''}`}><b className="ttt-om">O</b><div><small>Máquina</small><strong>{score.O}</strong></div></div>
      </div>
      <div className={`ttt-status${result?.who === 'X' ? ' is-won' : result?.who === 'O' ? ' is-lost' : ''}`} aria-live="polite">
        {!result && <i />}{status}
      </div>
      <div className="ttt-board">
        {board.map((v, i) => (
          <button key={i} type="button" className={`ttt-cell${result?.line.includes(i) ? ` is-win is-${result.who}` : ''}`}
            onClick={() => tap(i)} aria-label={v ? `Casilla ${i + 1}: ${v}` : `Casilla ${i + 1} libre`} disabled={!!v || !!result || turn !== 'X'}>
            {v === 'X' && <X />}{v === 'O' && <O />}
          </button>
        ))}
      </div>
      <Actions>
        {result ? (
          <Button block icon={matchOver ? undefined : 'refresh'} onClick={nextRound}>{matchOver ? 'Ver resultado' : 'Siguiente ronda'}</Button>
        ) : (
          <Button variant="secondary" block onClick={onBack}>Salir</Button>
        )}
      </Actions>
    </GameScreen>
  );
}
