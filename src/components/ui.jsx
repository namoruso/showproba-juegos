import logo from '../assets/showproba-logo-white.png';
import Icon from './Icon.jsx';
import { useFeedback } from '../hooks/feedback.jsx';

/** Logo: alto fijo, ancho automático. Nunca pasarle width. */
export function Logo({ size = 'sm', className = '' }) {
  return <img src={logo} alt="ShowProba" className={`${size === 'lg' ? 'sp-logo-lg' : 'sp-logo'} ${className}`} draggable="false" />;
}

export function Button({ variant = 'primary', size, block, icon, children, className = '', ...rest }) {
  const cls = ['sp-btn', `sp-btn-${variant}`, size === 'sm' && 'sp-btn-sm', block && 'sp-btn-block', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={18} stroke={icon === 'play' ? 2 : 2.4} />}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, ...rest }) {
  return (
    <button type="button" className="sp-iconbtn" aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={20} stroke={icon === 'back' ? 2.4 : 2} />
    </button>
  );
}

export function TopBar({ onBack, showSound = true }) {
  const { muted, toggleMute } = useFeedback();
  return (
    <div className="sp-topbar">
      {onBack ? <IconButton icon="back" label="Volver al inicio" onClick={onBack} /> : <span />}
      <Logo />
      {showSound ? <IconButton icon={muted ? 'mute' : 'sound'} label={muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute} /> : <span />}
    </div>
  );
}

/** Cabecera: kicker + título con palabra destacada. */
export function GameHeader({ kicker, title, highlight }) {
  return (
    <div className="sp-head">
      <div className="sp-kicker">{kicker}</div>
      <h1 className="sp-title">
        {title} {highlight && <span className="sp-hl">{highlight}</span>}
      </h1>
    </div>
  );
}

export function Hud({ items }) {
  return (
    <div className="sp-hud" role="status" aria-live="polite">
      {items.map((it) => (
        <div key={it.label} className={`sp-chip${it.warn ? ' is-warn' : ''}`}>
          <b>{it.value}</b>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Badge({ live, children }) {
  return <span className={`sp-badge${live ? ' is-live' : ''}`}>{children}</span>;
}

/** Pantalla de juego: escenario + barra superior + cabecera. */
export function GameScreen({ onBack, kicker, title, highlight, children, className = '' }) {
  return (
    <main className={`sp-screen ${className}`}>
      <TopBar onBack={onBack} />
      {kicker && <GameHeader kicker={kicker} title={title} highlight={highlight} />}
      {children}
    </main>
  );
}

export function Actions({ children }) {
  return <div className="sp-actions">{children}</div>;
}
