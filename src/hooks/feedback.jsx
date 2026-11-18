import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const Ctx = createContext(null);

const TONES = {
  tap: [[660, 0.05]],
  tick: [[880, 0.03]],
  flip: [[520, 0.05]],
  good: [[660, 0.08], [990, 0.12]],
  bad: [[220, 0.18]],
  win: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.25]],
  lose: [[392, 0.15], [330, 0.15], [262, 0.3]],
};

/** Sonidos cortos (WebAudio, sin archivos) y vibración. */
export function FeedbackProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef(null);

  const play = useCallback(
    (name) => {
      if (name === 'bad' || name === 'lose') navigator.vibrate?.(name === 'bad' ? 120 : [80, 60, 120]);
      if (name === 'good' || name === 'win') navigator.vibrate?.(30);
      if (muted) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ac = (ctxRef.current ||= new AC());
        let t = ac.currentTime;
        for (const [freq, dur] of TONES[name] || []) {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(g).connect(ac.destination);
          o.start(t);
          o.stop(t + dur + 0.02);
          t += dur * 0.9;
        }
      } catch {
        /* audio no disponible */
      }
    },
    [muted]
  );

  const value = useMemo(() => ({ muted, toggleMute: () => setMuted((m) => !m), play }), [muted, play]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFeedback = () => useContext(Ctx);
