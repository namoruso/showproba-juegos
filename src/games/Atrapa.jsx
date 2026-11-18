import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { formatTime } from '../hooks/useCountdown.js';
import { prizeCode, randomPrize } from '../data/prizes.js';
import { BAD_ITEMS, GOOD_ITEMS } from '../data/dropItems.js';
import './Atrapa.css';

const TIME = 40; // segundos
const GOAL = 200; // puntos para ganar
const LIVES = 3;
const BAD_RATIO = 0.28;
const ITEM = 44; // tamaño de cada objeto (px)
const BASKET_W = 92;
const BASKET_H = 44;

let uid = 0;

export default function Atrapa({ onBack, onFinish }) {
  const { play } = useFeedback();
  const areaRef = useRef(null);
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [frame, setFrame] = useState(0); // fuerza el render del bucle
  const s = useRef({ items: [], x: 0.5, score: 0, lives: LIVES, t: TIME, spawn: 0, last: 0, pops: [] });

  const end = useCallback((reason) => {
    setPhase('over');
    const { score, lives } = s.current;
    const win = score >= GOAL;
    play(win ? 'win' : 'lose');
    setTimeout(() => onFinish(win
      ? { win: true, kicker: '¡Meta cumplida!', title: 'Atrapaste', highlight: 'el brillo', stats: [{ label: 'Puntos', value: score }, { label: 'Vidas', value: lives }], prize: randomPrize(), code: prizeCode() }
      : { win: false, kicker: reason === 'lives' ? 'Sin vidas' : 'Se acabó el tiempo', title: '¡Casi lo', highlight: 'logras!', stats: [{ label: 'Puntos', value: `${score}/${GOAL}` }, { label: 'Vidas', value: lives }], tip: 'Esquiva las ✕ rojas: cada una te quita una vida.' }), 600);
  }, [onFinish, play]);

  // Bucle principal
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    let raf;
    const st = s.current;
    st.last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - st.last) / 1000);
      st.last = now;
      const area = areaRef.current;
      if (!area) return;
      const W = area.clientWidth, H = area.clientHeight;
      st.t -= dt;
      const elapsed = TIME - st.t;
      const speed = 170 + elapsed * 6; // px/s, acelera con el tiempo
      // Aparición
      st.spawn -= dt;
      if (st.spawn <= 0) {
        const bad = Math.random() < BAD_RATIO;
        const def = bad ? BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)] : GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)];
        st.items.push({ id: ++uid, bad, ...def, x: ITEM / 2 + Math.random() * (W - ITEM), y: -ITEM, v: speed * (0.85 + Math.random() * 0.4), spin: (Math.random() - 0.5) * 120, rot: 0 });
        st.spawn = Math.max(0.35, 0.85 - elapsed * 0.012);
      }
      // Movimiento y colisiones
      const bx = st.x * W, by = H - BASKET_H / 2 - 10;
      st.items = st.items.filter((it) => {
        it.y += it.v * dt;
        it.rot += it.spin * dt;
        const caught = Math.abs(it.x - bx) < (BASKET_W + ITEM) / 2 - 8 && Math.abs(it.y - by) < (BASKET_H + ITEM) / 2 - 10;
        if (caught) {
          if (it.bad) { st.lives -= 1; play('bad'); st.pops.push({ id: it.id, x: it.x, y: by - 30, text: '−1', bad: true, t: 0 }); st.hit = now; }
          else { st.score += it.points; play('good'); st.pops.push({ id: it.id, x: it.x, y: by - 30, text: `+${it.points}`, t: 0 }); st.catchFx = now; }
          return false;
        }
        return it.y < H + ITEM;
      });
      st.pops = st.pops.filter((p) => (p.t += dt) < 0.7);
      setFrame((f) => f + 1);
      if (st.lives <= 0) return end('lives');
      if (st.t <= 0) { st.t = 0; return end('time'); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, end, play]);

  // Mover la cesta con dedo o ratón (y flechas del teclado)
  const moveTo = (clientX) => {
    const r = areaRef.current.getBoundingClientRect();
    const half = BASKET_W / 2 / r.width;
    s.current.x = Math.min(1 - half, Math.max(half, (clientX - r.left) / r.width));
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      s.current.x = Math.min(0.88, Math.max(0.12, s.current.x + (e.key === 'ArrowLeft' ? -0.08 : 0.08)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const st = s.current;
  const hurt = st.hit && performance.now() - st.hit < 300;
  const glow = st.catchFx && performance.now() - st.catchFx < 200;

  return (
    <GameScreen onBack={onBack} kicker="Reflejos" title="Atrapa el" highlight="brillo">
      <Hud items={[
        { label: 'Puntos', value: `${st.score}` },
        { label: 'Tiempo', value: formatTime(Math.ceil(st.t)), warn: st.t <= 10 && phase === 'playing' },
        { label: 'Vidas', value: Math.max(0, st.lives), warn: st.lives === 1 },
      ]} />
      <div className="dr-goal"><span>Meta {GOAL}</span><div className="sp-progress"><i style={{ width: `${Math.min(100, (st.score / GOAL) * 100)}%` }} /></div></div>
      <div ref={areaRef} className={`dr-area${hurt ? ' is-hurt' : ''}`} data-frame={frame}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); moveTo(e.clientX); }}
        onPointerMove={(e) => moveTo(e.clientX)}>
        {st.items.map((it) => (
          <div key={it.id} className={`dr-item${it.bad ? ' is-bad' : ''}`} style={{ transform: `translate(${it.x - ITEM / 2}px, ${it.y - ITEM / 2}px) rotate(${it.bad ? 0 : it.rot}deg)` }}>
            <Icon name={it.icon} size={it.bad ? 24 : 26} stroke={it.bad ? 3 : 2} />
          </div>
        ))}
        {st.pops.map((p) => (
          <div key={`p${p.id}`} className={`dr-pop${p.bad ? ' is-bad' : ''}`} style={{ left: p.x, top: p.y - p.t * 50, opacity: 1 - p.t / 0.7 }}>{p.text}</div>
        ))}
        <div className={`dr-basket${glow ? ' is-glow' : ''}`} style={{ left: `${st.x * 100}%` }}>
          <Icon name="basket" size={28} stroke={2.2} />
        </div>
        {phase === 'ready' && (
          <div className="dr-overlay">
            <div className="dr-legend">
              <span><i className="dr-mini"><Icon name="star" size={16} /></i>Atrápalos</span>
              <span><i className="dr-mini is-bad"><Icon name="x" size={14} stroke={3} /></i>Esquívalos</span>
            </div>
            <p>Desliza el dedo de izquierda a derecha para mover la cesta. Junta <b>{GOAL} puntos</b> en {TIME} segundos.</p>
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
