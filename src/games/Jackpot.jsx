import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { PRIZES, prizeCode, randomPrize } from '../data/prizes.js';
import './Jackpot.css';

// Símbolo → premio al alinear tres. La estrella es el premio mayor.
const SYMBOLS = [
  { icon: 'bulb', prize: PRIZES[0] },
  { icon: 'mirror', prize: PRIZES[1] },
  { icon: 'party', prize: PRIZES[2] },
  { icon: 'disco', prize: PRIZES[3] },
  { icon: 'star', prize: 'Jackpot mayor' },
];
const TRIES = 3;
const WIN_CHANCE = 0.22; // probabilidad de forzar tres iguales por tirada

const rnd = () => Math.floor(Math.random() * SYMBOLS.length);
const wrap = (i) => (i + SYMBOLS.length) % SYMBOLS.length;

function Reel({ value, spinning, hit }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!spinning) { setShown(value); return undefined; }
    const id = setInterval(() => setShown((s) => wrap(s + 1)), 70);
    return () => clearInterval(id);
  }, [spinning, value]);
  return (
    <div className={`jp-reel${spinning ? ' is-spinning' : ''}${hit ? ' is-hit' : ''}`}>
      <span className="jp-ghost"><Icon name={SYMBOLS[wrap(shown - 1)].icon} size={26} stroke={1.8} /></span>
      <span className="jp-main"><Icon name={SYMBOLS[shown].icon} size={40} stroke={1.8} /></span>
      <span className="jp-ghost"><Icon name={SYMBOLS[wrap(shown + 1)].icon} size={26} stroke={1.8} /></span>
    </div>
  );
}

export default function Jackpot({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [reels, setReels] = useState([4, 0, 3]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [tries, setTries] = useState(TRIES);
  const [state, setState] = useState('idle'); // idle | spinning | win | miss
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pull = () => {
    if (state === 'spinning' || tries <= 0) return;
    const forced = Math.random() < WIN_CHANCE;
    const s = forced ? rnd() : null;
    const target = forced ? [s, s, s] : [rnd(), rnd(), rnd()];
    setTries((t) => t - 1);
    setState('spinning');
    setSpinning([true, true, true]);
    play('tap');
    [900, 1350, 1800].forEach((ms, i) => {
      timers.current.push(setTimeout(() => {
        setReels((r) => { const n = [...r]; n[i] = target[i]; return n; });
        setSpinning((sp) => { const n = [...sp]; n[i] = false; return n; });
        play('flip');
        if (i === 2) {
          const win = target[0] === target[1] && target[1] === target[2];
          setState(win ? 'win' : 'miss');
          play(win ? 'win' : 'bad');
        }
      }, ms));
    });
  };

  const won = state === 'win';
  const sym = SYMBOLS[reels[0]];
  const finish = () => won
    ? onFinish({ win: true, kicker: sym.icon === 'star' ? '¡Jackpot!' : '¡Tres iguales!', title: 'Ganaste', highlight: sym.icon === 'star' ? 'el mayor' : 'el premio', stats: [{ label: 'Tiradas', value: TRIES - tries }], prize: sym.icon === 'star' ? randomPrize() + ' + sorpresa' : sym.prize, code: prizeCode() })
    : onFinish({ win: false, kicker: 'Sin tiradas', title: '¡Casi lo', highlight: 'logras!', stats: [{ label: 'Tiradas', value: TRIES }], tip: 'La suerte cambia en cada ronda. ¡Vuelve a intentarlo!' });

  return (
    <GameScreen onBack={onBack} kicker="Jackpot" title="Alinea el" highlight="oro">
      <Hud items={[{ label: 'Tiradas', value: tries }, { label: 'Premio', value: won ? 1 : 0 }]} />
      <div className={`jp-machine${won ? ' is-won' : ''}`}>
        <div className="jp-bulbs">{Array.from({ length: 13 }, (_, i) => <i key={i} />)}</div>
        <div className="jp-sign">JACKPOT</div>
        <div className="jp-window">
          {reels.map((v, i) => <Reel key={i} value={v} spinning={spinning[i]} hit={won} />)}
          <div className="jp-line" />
        </div>
        <div className="jp-bulbs">{Array.from({ length: 13 }, (_, i) => <i key={i} />)}</div>
      </div>

      {won ? (
        <div className="jp-msg"><div className="sp-kicker">{sym.icon === 'star' ? '¡Jackpot!' : 'Tres iguales'}</div><strong>{sym.icon === 'star' ? 'Ganaste el premio mayor' : sym.prize}</strong></div>
      ) : (
        <div className="jp-pay">
          {SYMBOLS.map((s) => <span key={s.icon}><Icon name={s.icon} size={16} />×3 {s.icon === 'star' ? 'Mayor' : s.prize}</span>)}
        </div>
      )}
      {state === 'miss' && <div className="jp-miss" aria-live="polite">{tries > 0 ? `Sin suerte · te ${tries === 1 ? 'queda 1 tirada' : `quedan ${tries} tiradas`}` : 'Se acabaron las tiradas'}</div>}

      <Actions>
        {won || (state === 'miss' && tries === 0)
          ? <Button block onClick={finish}>{won ? 'Cobrar premio' : 'Continuar'}</Button>
          : <Button block className="jp-pull" onClick={pull} disabled={state === 'spinning'}>{state === 'spinning' ? 'Girando…' : '¡Jugar!'}</Button>}
      </Actions>
    </GameScreen>
  );
}
