import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { formatTime } from '../hooks/useCountdown.js';
import { prizeCode, randomPrize } from '../data/prizes.js';
import './Topo.css';

const HOLES = 9;
const TIME = 30;
const GOAL = 150;
const HIT = 10; // puntos por topo
const GOLD = 30; // topo dorado (raro)
const PENALTY = 15; // tocar el foco rojo
const GOLD_CHANCE = 0.1;
const BAD_CHANCE = 0.18;

/** Personaje original: topo navy con casco de luz. */
function Mole({ kind, hit }) {
  if (kind === 'bad') {
    return (
      <svg viewBox="0 0 100 100" className="tp-char is-bad" aria-hidden="true">
        <circle cx="50" cy="56" r="34" className="tp-bad-body" />
        <path d="M38 44l10 10M48 44L38 54M56 44l10 10M66 44L56 54" className="tp-bad-eyes" />
        <path d="M38 74q12-8 24 0" className="tp-bad-eyes" />
        <path d="M50 22v-12M42 16l-4-6M58 16l4-6" className="tp-bad-spark" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={`tp-char${kind === 'gold' ? ' is-gold' : ''}`} aria-hidden="true">
      <ellipse cx="50" cy="66" rx="34" ry="32" className="tp-body" />
      <ellipse cx="50" cy="78" rx="20" ry="14" className="tp-belly" />
      <path d="M22 40a28 22 0 0156 0z" className="tp-helmet" />
      <circle cx="50" cy="30" r="7" className="tp-lamp" />
      {hit ? (
        <path d="M33 52l8 8M41 52l-8 8M59 52l8 8M67 52l-8 8" className="tp-xeyes" />
      ) : (
        <>
          <circle cx="38" cy="56" r="6" className="tp-eye" /><circle cx="62" cy="56" r="6" className="tp-eye" />
          <circle cx="39" cy="57" r="3" className="tp-pupil" /><circle cx="63" cy="57" r="3" className="tp-pupil" />
        </>
      )}
      <ellipse cx="50" cy="68" rx="7" ry="5" className="tp-nose" />
    </svg>
  );
}

export default function Topo({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [phase, setPhase] = useState('ready');
  const [holes, setHoles] = useState(() => Array(HOLES).fill(null)); // {kind, id, hit}
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [left, setLeft] = useState(TIME);
  const [pops, setPops] = useState([]);
  const timers = useRef(new Set());
  const scoreRef = useRef(0);
  scoreRef.current = score;
  const leftRef = useRef(TIME);
  leftRef.current = left;

  const later = (fn, ms) => { const id = setTimeout(() => { timers.current.delete(id); fn(); }, ms); timers.current.add(id); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = useCallback(() => {
    setPhase('over');
    timers.current.forEach(clearTimeout);
    const sc = scoreRef.current;
    const win = sc >= GOAL;
    play(win ? 'win' : 'lose');
    later(() => onFinish(win
      ? { win: true, kicker: '¡Reflejos de show!', title: 'Topos', highlight: 'atrapados', stats: [{ label: 'Puntos', value: sc }], prize: randomPrize(), code: prizeCode() }
      : { win: false, kicker: 'Se acabó el tiempo', title: '¡Casi lo', highlight: 'logras!', stats: [{ label: 'Puntos', value: `${sc}/${GOAL}` }], tip: 'No toques los focos rojos: restan puntos y cortan tu racha.' }), 700);
  }, [onFinish, play]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reloj
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    if (left <= 0) { finish(); return undefined; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, left, finish]);

  // Aparición de personajes: cada vez más rápido
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    let stop = false;
    let id = 0;
    const spawn = () => {
      if (stop) return;
      const elapsed = TIME - leftRef.current;
      const up = Math.max(520, 1050 - elapsed * 18); // tiempo visible
      const gap = Math.max(320, 750 - elapsed * 14); // entre apariciones
      setHoles((h) => {
        const free = h.map((v, i) => (v ? null : i)).filter((i) => i !== null);
        if (!free.length) return h;
        const i = free[Math.floor(Math.random() * free.length)];
        const r = Math.random();
        const kind = r < BAD_CHANCE ? 'bad' : r < BAD_CHANCE + GOLD_CHANCE ? 'gold' : 'mole';
        const n = [...h];
        const myId = ++id + Math.random();
        n[i] = { kind, id: myId, hit: false };
        later(() => setHoles((hh) => { if (hh[i]?.id !== myId) return hh; const m = [...hh]; m[i] = null; return m; }), up);
        return n;
      });
      later(spawn, gap * (0.7 + Math.random() * 0.6));
    };
    spawn();
    return () => { stop = true; };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const whack = (i) => {
    const c = holes[i];
    if (phase !== 'playing' || !c || c.hit) return;
    let pts;
    if (c.kind === 'bad') { pts = -PENALTY; setStreak(0); play('bad'); navigator.vibrate?.(80); }
    else {
      const bonus = streak >= 4 ? 5 : 0;
      pts = (c.kind === 'gold' ? GOLD : HIT) + bonus;
      setStreak((s) => s + 1); play('good');
    }
    setScore((s) => Math.max(0, s + pts));
    setHoles((h) => { const n = [...h]; n[i] = { ...c, hit: true }; return n; });
    const pid = Math.random();
    setPops((p) => [...p, { id: pid, i, text: pts > 0 ? `+${pts}` : `${pts}`, bad: pts < 0 }]);
    later(() => setPops((p) => p.filter((x) => x.id !== pid)), 650);
    later(() => setHoles((h) => (h[i]?.id === c.id ? Object.assign([...h], { [i]: null }) : h)), 260);
  };

  return (
    <GameScreen onBack={onBack} kicker="Reflejos" title="Golpea al" highlight="topo">
      <Hud items={[
        { label: 'Puntos', value: score },
        { label: 'Tiempo', value: formatTime(left), warn: left <= 5 && phase === 'playing' },
        { label: 'Racha', value: `×${streak}` },
      ]} />
      <div className="dr-goal tp-goal"><span>Meta {GOAL}</span><div className="sp-progress"><i style={{ width: `${Math.min(100, (score / GOAL) * 100)}%` }} /></div></div>
      <div className="tp-field">
        {holes.map((c, i) => (
          <button key={i} type="button" className={`tp-hole${c ? ' is-up' : ''}${c?.hit ? ' is-hit' : ''}${c ? ` is-${c.kind}` : ''}`}
            onPointerDown={() => whack(i)} onClick={(e) => e.detail === 0 && whack(i)} aria-label={c ? (c.kind === 'bad' ? 'Foco rojo, no tocar' : 'Topo, ¡tócalo!') : 'Agujero vacío'}>
            <span className="tp-pit" />
            <span className="tp-pop-wrap">{c && <Mole kind={c.kind} hit={c.hit} />}</span>
            <span className="tp-rim" />
            {pops.filter((p) => p.i === i).map((p) => <span key={p.id} className={`tp-score${p.bad ? ' is-bad' : ''}`}>{p.text}</span>)}
          </button>
        ))}
        {phase === 'ready' && (
          <div className="dr-overlay tp-overlay">
            <div className="dr-legend">
              <span><i className="dr-mini"><Icon name="target" size={16} /></i>+{HIT} · dorado +{GOLD}</span>
              <span><i className="dr-mini is-bad"><Icon name="x" size={14} stroke={3} /></i>−{PENALTY}</span>
            </div>
            <p>Toca los topos antes de que se escondan. Haz <b>{GOAL} puntos</b> en {TIME} segundos. Cinco seguidos dan bonus.</p>
          </div>
        )}
      </div>
      <Actions>
        {phase === 'ready'
          ? <Button block icon="play" onClick={() => { setPhase('playing'); play('tap'); }}>Comenzar</Button>
          : <Button variant="secondary" block onClick={onBack}>Salir</Button>}
      </Actions>
    </GameScreen>
  );
}
