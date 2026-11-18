import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { Badge, Button, Logo } from './ui.jsx';
import { FEATURED_ID, GAMES } from '../data/games.js';

function MiniWheel() {
  const ref = useRef(null);
  useEffect(() => {
    const n = 8, r = 94;
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n - Math.PI / 2, b = ((i + 1) * 2 * Math.PI) / n - Math.PI / 2;
      s += `<path d="M100 100L${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)}A${r} ${r} 0 0 1 ${100 + r * Math.cos(b)} ${100 + r * Math.sin(b)}Z" fill="var(${i % 2 ? '--stage-700' : '--navy-800'})" stroke="var(--gold-500)" stroke-opacity=".6"/>`;
    }
    ref.current.innerHTML = s;
  }, []);
  return (
    <svg className="mn-wheel" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="none" stroke="var(--gold-400)" strokeWidth="4" />
      <g ref={ref} />
      <circle cx="100" cy="100" r="22" fill="var(--gold-500)" />
    </svg>
  );
}

export default function Menu({ onPlay }) {
  const featured = GAMES.find((g) => g.id === FEATURED_ID);
  const rest = GAMES.filter((g) => g.id !== FEATURED_ID);
  return (
    <main className="sp-screen mn">
      <aside className="mn-intro">
        <Logo size="lg" className="mn-logo" />
        <div className="sp-head mn-head">
          <div className="sp-kicker">Cartelera de juegos</div>
          <h1 className="sp-title">Juegos que encienden <span className="sp-hl">tu evento</span></h1>
          <p className="mn-help">Toca un juego para empezar. Diez juegos, partidas de menos de tres minutos.</p>
        </div>
        <div className="sp-bulbs mn-bulbs" />
      </aside>

      <section className="mn-games">
        <div className="mn-hero" role="button" tabIndex={0} onClick={() => onPlay(featured.id)} onKeyDown={(e) => e.key === 'Enter' && onPlay(featured.id)}>
          <div className="mn-hero-txt">
            <Badge live>Destacado</Badge>
            <h2>{featured.name}</h2>
            <p>{featured.desc}</p>
            <Button size="sm" icon="play" tabIndex={-1}>{featured.cta}</Button>
          </div>
          <MiniWheel />
        </div>

        <div className="mn-label">Más juegos</div>
        <div className="mn-grid">
          {rest.map((g) => (
            <button key={g.id} type="button" className="sp-gcard" onClick={() => onPlay(g.id)}>
              <div className={`sp-art sp-art-${g.art}`}>
                <div className="sp-gicon"><Icon name={g.icon} size={22} /></div>
              </div>
              <div className="sp-gbody"><h3>{g.name}</h3><p>{g.meta}</p></div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
