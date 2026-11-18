// Premios del evento. Edita esta lista para cada fiesta.
export const PRIZES = ['Foto LED', 'Selfie Mirror', 'Hora Loca', 'Descuento'];

export const randomPrize = () => PRIZES[Math.floor(Math.random() * PRIZES.length)];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const prizeCode = () =>
  'SHOW-' + Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
