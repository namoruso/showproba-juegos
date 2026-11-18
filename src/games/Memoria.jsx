import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { formatTime, useCountdown } from '../hooks/useCountdown.js';
import { prizeCode, randomPrize, shuffle } from '../data/prizes.js';
import './Memoria.css';

const ICONS = ['speaker', 'camera', 'bulb', 'disco', 'star', 'mic', 'music', 'mirror'];
const TIME = 120;

const newDeck = () => shuffle([...ICONS, ...ICONS]).map((icon, id) => ({ id, icon }));

export default function Memoria({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [deck, setDeck] = useState(newDeck);
  const [open, setOpen] = useState([]); // ids volteadas (máx 2)
  const [matched, setMatched] = useState(() => new Set());
  const [wrong, setWrong] = useState([]);
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(true);
  const lock = useRef(false);
  const timer = useRef(null);

  const [left, setLeft] = useCountdown(TIME, {
    running,
    onEnd: () => {
      setRunning(false);
      play('lose');
      onFinish({ win: false, kicker: 'Se acabó el tiempo', title: '¡Casi lo', highlight: 'logras!',
        stats: [{ label: 'Tiempo', value: '0:00' }, { label: 'Parejas', value: `${matched.size / 2}/8` }, { label: 'Jugadas', value: moves }],
        tip: `Te faltaron ${8 - matched.size / 2} parejas. Intenta recordar las esquinas primero.` });
    },
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (matched.size === deck.length && running) {
      setRunning(false);
      play('win');
      setTimeout(() => onFinish({ win: true, kicker: '¡Lo lograste!', title: 'Memoria', highlight: 'completada',
        stats: [{ label: 'Tiempo', value: formatTime(TIME - left) }, { label: 'Parejas', value: '8/8' }, { label: 'Jugadas', value: moves }],
        prize: randomPrize(), code: prizeCode() }), 700);
    }
  }, [matched]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (card) => {
    if (lock.current || !running || open.includes(card.id) || matched.has(card.id)) return;
    play('flip');
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => deck[id]);
    if (a.icon === b.icon) {
      play('good');
      setMatched((s) => new Set([...s, a.id, b.id]));
      setOpen([]);
    } else {
      lock.current = true;
      setTimeout(() => { setWrong(next); play('bad'); }, 350);
      timer.current = setTimeout(() => { setOpen([]); setWrong([]); lock.current = false; }, 1100);
    }
  };

  const restart = () => {
    clearTimeout(timer.current);
    lock.current = false;
    setDeck(newDeck()); setOpen([]); setMatched(new Set()); setWrong([]); setMoves(0); setLeft(TIME); setRunning(true);
  };

  return (
    <GameScreen onBack={onBack} kicker="Memoria" title="Empareja el" highlight="brillo LED">
      <Hud items={[{ label: 'Tiempo', value: formatTime(left), warn: left <= 10 }, { label: 'Parejas', value: `${matched.size / 2}/8` }, { label: 'Jugadas', value: moves }]} />
      <div className="mm-grid">
        {deck.map((c) => {
          const isMatch = matched.has(c.id);
          const isUp = isMatch || open.includes(c.id);
          const isWrong = wrong.includes(c.id);
          return (
            <button key={c.id} type="button" className={`mm-card${isUp ? ' is-up' : ''}${isMatch ? ' is-match' : ''}${isWrong ? ' is-wrong' : ''}`}
              onClick={() => flip(c)} aria-label={isUp ? c.icon : 'Carta oculta'}>
              <span className="mm-inner">
                <span className="mm-face mm-back" />
                <span className="mm-face mm-front">
                  <Icon name={c.icon} size={34} stroke={1.8} />
                  {isMatch && <i className="mm-ok"><Icon name="check" size={13} stroke={3} /></i>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Actions>
        <Button variant="secondary" block icon="refresh" onClick={restart}>Reiniciar</Button>
      </Actions>
    </GameScreen>
  );
}
