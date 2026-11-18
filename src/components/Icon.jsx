// Íconos de línea ShowProba (24×24, trazo redondeado). Uso: <Icon name="check" size={20} />
const PATHS = {
  "ticket": "<path d=\"M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z\"/><path d=\"M9.5 9.5l5 5M13 9.5l1.5 1.5\"/>",
  "basket": "<path d=\"M3 10h18l-2 9a2 2 0 01-2 1.6H7A2 2 0 015 19z\"/><path d=\"M8 10l3-6M16 10l-3-6M9 14v3M15 14v3M12 14v3\"/>",
  "hammer": "<path d=\"M14 4l6 6-3 3-6-6z\"/><path d=\"M12.5 8.5L4 17a1.4 1.4 0 002 2l8.5-8.5\"/>",
  "heart": "<path d=\"M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z\"/>",
  "target": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\"/>",
  "back": "<path d=\"M15 18l-6-6 6-6\"/>",
  "sound": "<path d=\"M11 5L6 9H3v6h3l5 4z\"/><path d=\"M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13\"/>",
  "help": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.5 9.2a2.6 2.6 0 015 .8c0 1.8-2.5 2.3-2.5 4\"/><path d=\"M12 17.3v.1\"/>",
  "refresh": "<path d=\"M20 11a8 8 0 10-2.3 5.7\"/><path d=\"M20 4v7h-7\"/>",
  "check": "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>",
  "x": "<path d=\"M6 6l12 12M18 6L6 18\"/>",
  "speaker": "<rect x=\"6\" y=\"3\" width=\"12\" height=\"18\" rx=\"2.5\"/><circle cx=\"12\" cy=\"15\" r=\"3\"/><circle cx=\"12\" cy=\"7.5\" r=\"1.5\"/>",
  "camera": "<rect x=\"3\" y=\"6.5\" width=\"18\" height=\"13\" rx=\"3\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/><path d=\"M8.5 6.5L10 4h4l1.5 2.5\"/>",
  "bulb": "<path d=\"M9 18h6M10 21h4\"/><path d=\"M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z\"/>",
  "disco": "<circle cx=\"12\" cy=\"13\" r=\"7\"/><path d=\"M5 13h14M12 6v14M7 8.5c3 1.5 7 1.5 10 0M7 17.5c3-1.5 7-1.5 10 0M12 2v4\"/>",
  "star": "<path d=\"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z\"/>",
  "mic": "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"/><path d=\"M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M8.5 21h7\"/>",
  "music": "<path d=\"M9 18V5l11-2v13\"/><circle cx=\"6.5\" cy=\"18\" r=\"2.5\"/><circle cx=\"17.5\" cy=\"16\" r=\"2.5\"/>",
  "party": "<path d=\"M4 20l5-14 9 9z\"/><path d=\"M14 4.5l.5-1.5M18 8l1.5-.5M17 3.5l-1.5 2.5M20.5 11l-2.5.5\"/>",
  "mirror": "<rect x=\"6\" y=\"2.5\" width=\"12\" height=\"16\" rx=\"6\"/><path d=\"M12 18.5V22M8.5 22h7M9.5 8.5l2.5-2.5M10 12l4.5-4.5\"/>",
  "trophy": "<path d=\"M7 4h10v5a5 5 0 01-10 0z\"/><path d=\"M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4M12 14v4M8 21h8\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>",
  "home": "<path d=\"M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z\"/>",
  "play": "<path d=\"M8 5l11 7-11 7z\" fill=\"currentColor\" stroke=\"none\"/>",
  "wheel": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"2.5\"/><path d=\"M12 3v6.5M12 14.5V21M3 12h6.5M14.5 12H21M5.6 5.6l4.6 4.6M13.8 13.8l4.6 4.6M18.4 5.6l-4.6 4.6M10.2 13.8l-4.6 4.6\"/>",
  "cards": "<rect x=\"2.5\" y=\"6\" width=\"11\" height=\"15\" rx=\"2\"/><path d=\"M8 6V5a2 2 0 012-2h9.5a2 2 0 012 2v11a2 2 0 01-2 2h-6\"/>",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-4-4M8 11h6\"/>",
  "hash": "<path d=\"M9 3v18M15 3v18M3 9h18M3 15h18\"/>",
  "slot": "<rect x=\"2.5\" y=\"5\" width=\"15\" height=\"14\" rx=\"2.5\"/><path d=\"M7.5 5v14M12.5 5v14M17.5 11H20V6\"/><circle cx=\"20\" cy=\"4.5\" r=\"1.5\"/>",
  "puzzle": "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"1.5\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"8\" rx=\"1.5\"/><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"1.5\"/><path d=\"M13 17h8M17 13v8\" stroke-dasharray=\"2 2.5\"/>",
  "mute": "<path d=\"M11 5L6 9H3v6h3l5 4z\"/><path d=\"M16 9l5 6M21 9l-5 6\"/>"
};

export const ICON_NAMES = Object.keys(PATHS);

export default function Icon({ name, size = 24, stroke = 2, className, title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + PATHS[name] }}
    />
  );
}
