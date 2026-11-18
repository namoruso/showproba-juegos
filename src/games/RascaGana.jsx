import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Actions, Button, GameScreen, Hud } from '../components/ui.jsx';
import { useFeedback } from '../hooks/feedback.jsx';
import { PRIZES, prizeCode, shuffle } from '../data/prizes.js';
import './RascaGana.css';

// Tres símbolos iguales = premio. Cada símbolo representa un premio de PRIZES.
const SYMBOLS = [
  { icon: 'bulb', prize: PRIZES[0] },
  { icon: 'mirror', prize: PRIZES[1] },
  { icon: 'party', prize: PRIZES[2] },
  { icon: 'star', prize: PRIZES[3] },
];
const WIN_CHANCE = 0.35; // probabilidad de que el boleto sea ganador
const REVEAL_AT = 0.55; // al raspar este porcentaje se descubre todo
const BRUSH = 24; // radio del "dedo" en px

function makeTicket() {
  if (Math.random() < WIN_CHANCE) {
    const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    return { win: true, cells: [s, s, s] };
  }
  // Perdedor: dos iguales y uno distinto (el "casi" genera emoción)
  const [a, b] = shuffle(SYMBOLS);
  return { win: false, cells: shuffle([a, a, b]) };
}

export default function RascaGana({ onBack, onFinish }) {
  const { play } = useFeedback();
  const [ticket] = useState(makeTicket);
  const [serial] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [pct, setPct] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef(null);
  const last = useRef(null);
  const moves = useRef(0);

  // Pinta la capa dorada para raspar
  useEffect(() => {
    const cv = canvasRef.current;
    const { width, height } = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = width * dpr;
    cv.height = height * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(cv);
    const v = (n) => css.getPropertyValue(n).trim();
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, v('--gold-300'));
    g.addColorStop(0.45, v('--gold-500'));
    g.addColorStop(1, v('--amber-500'));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // Brillos diagonales
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffffff';
    for (let x = -height; x < width; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, height); ctx.lineTo(x + height, 0); ctx.lineTo(x + height + 10, 0); ctx.lineTo(x + 10, height);
      ctx.fill();
    }
    // Texto
    ctx.globalAlpha = 1;
    ctx.fillStyle = v('--gold-ink');
    ctx.textAlign = 'center';
    ctx.font = `800 22px ${v('--font-display')}`;
    ctx.fillText('RASCA AQUÍ', width / 2, height / 2 + 2);
    ctx.font = `600 11px ${v('--font-body')}`;
    ctx.globalAlpha = 0.7;
    ctx.fillText('Tres iguales = premio', width / 2, height / 2 + 24);
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const measure = () => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) { total++; if (data[i] === 0) clear++; }
    return clear / total;
  };

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    setPct(1);
    play(ticket.win ? 'win' : 'lose');
  };

  const scratch = (e) => {
    if (revealed) return;
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const ctx = cv.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = BRUSH * 2;
    ctx.beginPath();
    if (last.current) ctx.moveTo(last.current.x, last.current.y); else ctx.moveTo(x - 0.1, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
    if (++moves.current % 6 === 0) {
      const p = measure();
      setPct(p);
      if (moves.current % 18 === 0) play('tick');
      if (p >= REVEAL_AT) reveal();
    }
  };

  const onDown = (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); last.current = null; scratch(e); };
  const onMove = (e) => { if (e.buttons || e.pointerType === 'touch') scratch(e); };
  const onUp = () => { last.current = null; };

  const prize = ticket.cells[0].prize;
  const finish = () => onFinish(ticket.win
    ? { win: true, kicker: '¡Boleto ganador!', title: 'Rasca y', highlight: 'ganaste', stats: [{ label: 'Iguales', value: '3/3' }], prize, code: prizeCode() }
    : { win: false, kicker: 'Boleto sin premio', title: '¡Casi lo', highlight: 'logras!', stats: [{ label: 'Iguales', value: '2/3' }], tip: 'Estuviste a un símbolo. ¡Prueba con otro boleto!' });

  return (
    <GameScreen onBack={onBack} kicker="Rasca" title="Rasca y" highlight="gana">
      <Hud items={[{ label: 'Raspado', value: `${Math.round(pct * 100)}%` }, { label: 'Para ganar', value: '3 iguales' }]} />
      <div className={`rg-ticket${revealed ? (ticket.win ? ' is-win' : ' is-lose') : ''}`}>
        <div className="rg-head"><span className="sp-kicker">Boleto ShowProba</span><span className="rg-no">N.º {serial}</span></div>
        <div className="rg-area">
          <div className="rg-under">
            {ticket.cells.map((c, i) => (
              <div key={i} className="rg-cell"><Icon name={c.icon} size={44} stroke={1.8} /></div>
            ))}
          </div>
          <canvas ref={canvasRef} className={`rg-foil${revealed ? ' is-gone' : ''}`}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            aria-label="Capa para raspar. Desliza el dedo para descubrir los símbolos." role="img" />
        </div>
        <div className="rg-foot">
          {revealed
            ? ticket.win ? <><Icon name="check" size={16} stroke={3} /> ¡Tres iguales! Ganaste <b>{prize}</b></> : <><Icon name="x" size={16} stroke={3} /> Sin premio esta vez</>
            : <>Desliza el dedo sobre la franja dorada</>}
        </div>
      </div>
      <Actions>
        {revealed
          ? <Button block onClick={finish}>{ticket.win ? 'Cobrar premio' : 'Continuar'}</Button>
          : <Button variant="ghost" block onClick={reveal} disabled={pct < 0.15}>Descubrir todo</Button>}
      </Actions>
    </GameScreen>
  );
}
