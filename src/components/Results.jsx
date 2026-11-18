import Icon from './Icon.jsx';
import { Actions, Button, GameHeader, Hud, TopBar } from './ui.jsx';

/**
 * Resultados compartidos.
 * result = { win, kicker, title, highlight, stats: [{label, value}], prize?, code?, tip? }
 */
export default function Results({ result, onReplay, onHome }) {
  const { win, kicker, title, highlight, stats = [], prize, code, tip } = result;
  return (
    <main className={`sp-screen rs${win ? ' is-win' : ' is-lose'}`}>
      <TopBar onBack={onHome} showSound={false} />
      <div className="rs-hero">
        {win && <div className="rs-rays" />}
        <div className="rs-medal"><Icon name={win ? 'trophy' : 'clock'} size={64} stroke={1.8} /></div>
        <GameHeader kicker={kicker} title={title} highlight={highlight} />
      </div>
      {stats.length > 0 && <Hud items={stats} />}
      {prize ? (
        <div className="rs-ticket">
          <div><small>Tu premio</small><strong>{prize}</strong></div>
          {code && <div className="rs-code" aria-label={`Código ${code}`}>{code}</div>}
        </div>
      ) : null}
      {prize && <p className="rs-tip">Muestra este código en la cabina de ShowProba.</p>}
      {tip && <p className="rs-tip">{tip}</p>}
      <Actions>
        <Button variant="secondary" icon="home" onClick={onHome}>Inicio</Button>
        <Button icon="refresh" onClick={onReplay}>{win ? 'Jugar otra vez' : 'Reintentar'}</Button>
      </Actions>
    </main>
  );
}
