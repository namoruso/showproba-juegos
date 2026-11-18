import { useMemo, useRef, useState } from 'react';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { PRIZES, prizeCode } from '../data/prizes.js';
import './Ruleta.css';

const TRY = 'Otra vez';
const SPINS = 3;
// Gajos alternos: premio / "Otra vez"
const SEGMENTS = PRIZES.flatMap((p) => [p, TRY]);
const N = SEGMENTS.length;
const STEP = 360 / N;
const C = 170;
const R = 150;

function polar(deg, r) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function Wheel({ rotation, spinning, winner }) {
  const segs = useMemo(
    () =>
      SEGMENTS.map((label, i) => {
        const [x1, y1] = polar(i * STEP - STEP / 2, R);
        const [x2, y2] = polar(i * STEP + STEP / 2, R);
        const isPrize = label !== TRY;
        const mid = i * STEP - 90; // ángulo en coordenadas SVG
        const flip = mid > 90 && mid < 270;
        return { i, label, isPrize, d: `M${C} ${C}L${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}Z`, mid, flip };
      }),
    []
  );
  return (
    <svg className={`rl-wheel${spinning ? ' is-spinning' : ''}`} viewBox="0 0 340 340" role="img" aria-label="Ruleta de premios">
      <circle cx={C} cy={C} r="166" className="rl-rim" />
      <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '170px 170px' }} className="rl-rotor">
        {segs.map((s) => (
          <g key={s.i}>
            <path d={s.d} className={`rl-seg ${s.isPrize ? 'is-prize' : ''} ${winner === s.i ? 'is-win' : ''}`} />
            <text
              className={`rl-lbl ${s.isPrize ? 'is-prize' : ''} ${winner === s.i ? 'is-win' : ''}`}
              transform={`rotate(${s.flip ? s.mid - 180 : s.mid} ${C} ${C}) translate(${s.flip ? 28 : 312} ${C + 4.5})`}
              textAnchor={s.flip ? 'start' : 'end'}
              style={{ fontSize: s.isPrize ? (s.label.length > 10 ? 10.5 : 13) : 11 }}
            >
              {s.label}
            </text>
          </g>
        ))}
      </g>
      {Array.from({ length: 24 }, (_, k) => {
        const [x, y] = polar(k * 15, 158);
        return <circle key={k} cx={x} cy={y} r="3.2" className={`rl-bulb ${k % 2 ? 'b2' : ''}`} />;
      })}
      <circle cx={C} cy={C} r="34" className="rl-hubring" />
      <circle cx={C} cy={C} r="28" className="rl-hub" />
      <path d="M164 158l16 12-16 12z" className="rl-hubicon" />
      <path d="M170 30l-14-26h28z" className="rl-pointer" />
    </svg>
  );
}

export default function Ruleta({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [rotation, setRotation] = useState(-8);
  const [spinning, setSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(SPINS);
  const [result, setResult] = useState(null); // índice del gajo
  const tickRef = useRef(null);

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    const target = Math.floor(Math.random() * N);
    // El gajo i está centrado en i*STEP; para dejarlo bajo el puntero, rotación = -i*STEP (mod 360)
    const jitter = (Math.random() - 0.5) * (STEP * 0.6);
    const base = rotation - (rotation % 360);
    const next = base + 360 * 6 + (360 - target * STEP) + jitter;
    setResult(null);
    setSpinning(true);
    setSpinsLeft((s) => s - 1);
    setRotation(next);
    play('tap');
    let i = 0;
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      i += 1;
      if (i % (i < 20 ? 1 : i < 32 ? 2 : 4) === 0) play('tick');
    }, 120);
    setTimeout(() => {
      clearInterval(tickRef.current);
      setSpinning(false);
      setResult(target);
      play(SEGMENTS[target] === TRY ? 'bad' : 'win');
    }, 5200);
  };

  const won = result !== null && SEGMENTS[result] !== TRY;
  const lostAll = result !== null && !won && spinsLeft === 0;

  return (
    <GameScreen onBack={onBack} kicker="Suerte" title="Gira y gana" highlight="el show" className="rl">
      <Hud items={[{ label: 'Giros', value: spinsLeft }, { label: 'Premios', value: PRIZES.length }]} />
      <div className={`rl-wrap${result !== null ? ' is-dim' : ''}`}>
        <Wheel rotation={rotation} spinning={spinning} winner={won ? result : null} />
      </div>

      {result === null ? (
        <Actions>
          <Button block icon="play" onClick={spin} disabled={spinning}>
            {spinning ? 'Girando…' : 'Girar ruleta'}
          </Button>
        </Actions>
      ) : (
        <div className="rl-sheet" role="dialog" aria-live="assertive">
          <div className="sp-bulbs" />
          {won ? (
            <>
              <div className="sp-kicker">Premio</div>
              <h2>{SEGMENTS[result]}</h2>
              <p>¡La ruleta habló! Reclama tu premio en la cabina.</p>
              <Actions>
                <Button onClick={() => onFinish({ win: true, kicker: '¡Ganaste!', title: 'Ruleta', highlight: 'completada', prize: SEGMENTS[result], code: prizeCode(), stats: [{ label: 'Giros usados', value: SPINS - spinsLeft }] })}>
                  Ver mi premio
                </Button>
              </Actions>
            </>
          ) : lostAll ? (
            <>
              <div className="sp-kicker">Sin giros</div>
              <h2 className="is-muted">Casi…</h2>
              <p>Se terminaron tus giros por ahora.</p>
              <Actions>
                <Button onClick={() => onFinish({ win: false, kicker: 'Sin giros', title: '¡Casi lo', highlight: 'logras!', stats: [{ label: 'Giros', value: SPINS }], tip: 'La suerte cambia en cada ronda. ¡Vuelve a intentarlo!' })}>
                  Continuar
                </Button>
              </Actions>
            </>
          ) : (
            <>
              <div className="sp-kicker">Sigue intentando</div>
              <h2 className="is-muted">Otra vez</h2>
              <p>
                Te {spinsLeft === 1 ? 'queda 1 giro' : `quedan ${spinsLeft} giros`}.
              </p>
              <Actions>
                <Button icon="play" onClick={spin}>Girar de nuevo</Button>
              </Actions>
            </>
          )}
        </div>
      )}
    </GameScreen>
  );
}
