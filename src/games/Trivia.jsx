import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Badge, Button, GameScreen } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { useCountdown } from '../hooks/useCountdown.js';
import { prizeCode, randomPrize, shuffle } from '../data/prizes.js';
import { QUESTIONS } from '../data/trivia.js';
import './Trivia.css';

const ROUNDS = 5;
const SECONDS = 10;
const LETTERS = ['A', 'B', 'C', 'D'];

function Intro({ onStart }) {
  return (
    <>
      <div className="tv-podium"><div className="tv-q">?</div><div className="tv-spot" /></div>
      <div className="tv-rules">
        <div><b>{ROUNDS}</b><span>Preguntas</span></div>
        <div><b>{SECONDS}s</b><span>Por reto</span></div>
        <div><b>1</b><span>Vida</span></div>
      </div>
      <p className="tv-lead">Responde todo seguido. Un error y se apaga el show.</p>
      <Actions><Button block onClick={onStart}>Comenzar</Button></Actions>
    </>
  );
}

export default function Trivia({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [started, setStarted] = useState(false);
  const [set] = useState(() => shuffle(QUESTIONS).slice(0, ROUNDS));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null); // índice elegido, o -1 si se acabó el tiempo
  const q = set[idx];

  const [left, setLeft] = useCountdown(SECONDS, {
    running: started && picked === null,
    onEnd: () => { setPicked(-1); play('bad'); },
  });

  useEffect(() => { if (started && picked === null && left <= 3 && left > 0) play('tick'); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    play(i === q.a ? 'good' : 'bad');
  };

  const correct = picked !== null && picked === q.a;
  const next = () => {
    if (!correct) {
      onFinish({ win: false, kicker: picked === -1 ? 'Se acabó el tiempo' : 'Respuesta incorrecta', title: '¡Casi lo', highlight: 'logras!',
        stats: [{ label: 'Aciertos', value: `${idx}/${ROUNDS}` }], tip: `La respuesta era: ${q.o[q.a]}.` });
      return;
    }
    if (idx + 1 === ROUNDS) {
      play('win');
      onFinish({ win: true, kicker: '¡Pleno!', title: 'Trivia', highlight: 'superada', stats: [{ label: 'Aciertos', value: `${ROUNDS}/${ROUNDS}` }], prize: randomPrize(), code: prizeCode() });
      return;
    }
    setIdx(idx + 1); setPicked(null); setLeft(SECONDS);
  };

  return (
    <GameScreen onBack={onBack} kicker={started ? null : 'Trivia'} title="Desafío" highlight="ShowProba">
      {!started ? <Intro onStart={() => setStarted(true)} /> : (
        <>
          <div className="tv-head">
            <Badge>Pregunta {idx + 1}/{ROUNDS}</Badge>
            <span className={`tv-timer${left <= 3 ? ' is-warn' : ''}`}><Icon name="clock" size={16} stroke={2.2} /><b>{left}</b>s</span>
          </div>
          <div className="tv-steps">{set.map((_, i) => <i key={i} className={i < idx ? 'is-done' : i === idx ? (picked === null ? 'is-now' : correct ? 'is-done' : 'is-fail') : ''} />)}</div>
          <div className="sp-progress tv-bar"><i style={{ width: `${(left / SECONDS) * 100}%` }} /></div>
          <div className="tv-card" key={idx}>{q.q}</div>
          <div className="tv-opts">
            {q.o.map((o, i) => {
              const state = picked === null ? '' : i === q.a ? 'is-correct' : i === picked ? 'is-wrong' : 'is-off';
              return (
                <button key={o} type="button" className={`tv-opt ${state}`} onClick={() => choose(i)} disabled={picked !== null}>
                  <b>{LETTERS[i]}</b><span>{o}</span>
                  {state === 'is-correct' && <Icon name="check" size={20} stroke={3} />}
                  {state === 'is-wrong' && <Icon name="x" size={20} stroke={3} />}
                </button>
              );
            })}
          </div>
          <div className={`tv-feedback${correct ? ' is-good' : ''}`} aria-live="assertive">
            {picked !== null && (correct ? <><Icon name="check" size={16} stroke={3} /> ¡Correcto!</> : <><Icon name="x" size={16} stroke={3} /> {picked === -1 ? 'Tiempo agotado' : 'Incorrecta'} · era <b>{q.o[q.a]}</b></>)}
          </div>
          <Actions>
            <Button block onClick={next} disabled={picked === null}>
              {picked === null ? 'Elige una opción' : correct ? (idx + 1 === ROUNDS ? 'Ver resultado' : 'Siguiente') : 'Ver resultado'}
            </Button>
          </Actions>
        </>
      )}
    </GameScreen>
  );
}
