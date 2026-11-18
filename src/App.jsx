import { useState } from 'react';
import Menu from './components/Menu.jsx';
import Results from './components/Results.jsx';
import { GAMES } from './data/games.js';
import { FeedbackProvider } from './hooks/feedback.jsx';

/** Navegación simple por estado: menú → juego → resultados. */
export default function App() {
  const [view, setView] = useState({ screen: 'menu' });
  const [runId, setRunId] = useState(0); // remonta el juego al repetir

  const home = () => setView({ screen: 'menu' });
  const playGame = (id) => { setRunId((n) => n + 1); setView({ screen: 'game', id }); window.scrollTo(0, 0); };
  const finish = (result) => setView((v) => ({ screen: 'results', id: v.id, result }));

  let content;
  if (view.screen === 'game') {
    const { Component } = GAMES.find((g) => g.id === view.id);
    content = <Component key={runId} onBack={home} onFinish={finish} />;
  } else if (view.screen === 'results') {
    content = <Results result={view.result} onHome={home} onReplay={() => playGame(view.id)} />;
  } else {
    content = <Menu onPlay={playGame} />;
  }

  return (
    <FeedbackProvider>
      <div className="sp sp-stage sp-app">{content}</div>
    </FeedbackProvider>
  );
}
