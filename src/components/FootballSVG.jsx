// src/components/FootballSVG.jsx - Football-themed SVG components

export const FootballBall = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="currentColor" strokeWidth="2" />
    <path d="M50 10 L60 35 L50 50 L40 35 Z" fill="currentColor" />
    <path d="M10 50 L35 40 L50 50 L35 60 Z" fill="currentColor" />
    <path d="M50 90 L40 65 L50 50 L60 65 Z" fill="currentColor" />
    <path d="M90 50 L65 60 L50 50 L65 40 Z" fill="currentColor" />
    <path d="M30 25 L40 35 L35 40 L25 30 Z" fill="currentColor" />
    <path d="M70 25 L60 35 L65 40 L75 30 Z" fill="currentColor" />
    <path d="M30 75 L40 65 L35 60 L25 70 Z" fill="currentColor" />
    <path d="M70 75 L60 65 L65 60 L75 70 Z" fill="currentColor" />
  </svg>
);

// Fondo táctico tipo pizarra: campo horizontal, X, O y flechas
export const FootballField = ({ className = "w-full h-full" }) => (
  <svg
    className={className}
    viewBox="0 0 160 96"
    preserveAspectRatio="xMidYMid slice"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Campo */}
    <g
      stroke="#0f172a"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.45"
    >
      {/* Bordes del campo */}
      <rect x="8" y="8" width="144" height="80" rx="4" />
      {/* Línea de medio campo */}
      <line x1="80" y1="8" x2="80" y2="88" />
      {/* Círculo central */}
      <circle cx="80" cy="48" r="10" />

      {/* Área y portería izquierda */}
      <rect x="8" y="24" width="22" height="48" />
      <rect x="8" y="36" width="10" height="24" />
      <path d="M30 32 Q 40 48 30 64" />

      {/* Área y portería derecha */}
      <rect x="130" y="24" width="22" height="48" />
      <rect x="142" y="36" width="10" height="24" />
      <path d="M130 32 Q 120 48 130 64" />
    </g>

    {/* Jugadores - O (equipo propio) */}
    <g
      stroke="#0f172a"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    >
      {/* Línea defensiva propia */}
      <circle cx="40" cy="30" r="2.4" />
      <circle cx="52" cy="30" r="2.4" />
      <circle cx="64" cy="30" r="2.4" />

      {/* Mediocampo propio */}
      <circle cx="44" cy="48" r="2.4" />
      <circle cx="56" cy="48" r="2.4" />
      <circle cx="68" cy="48" r="2.4" />

      {/* Delanteros propios */}
      <circle cx="48" cy="66" r="2.4" />
      <circle cx="60" cy="66" r="2.4" />
    </g>

    {/* Jugadores rivales - X */}
    <g
      stroke="#0f172a"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    >
      {/* Línea defensiva rival */}
      <path d="M104 30 L108 26" />
      <path d="M108 30 L104 26" />

      <path d="M120 30 L124 26" />
      <path d="M124 30 L120 26" />

      {/* Mediocampo rival */}
      <path d="M100 48 L104 44" />
      <path d="M104 48 L100 44" />

      <path d="M116 48 L120 44" />
      <path d="M120 48 L116 44" />

      {/* Delanteros rivales */}
      <path d="M108 66 L112 62" />
      <path d="M112 66 L108 62" />

      <path d="M124 66 L128 62" />
      <path d="M128 66 L124 62" />
    </g>

    {/* Flechas de movimiento y pase (jugadas) */}
    <g stroke="#0f172a" strokeWidth="0.7" fill="#0f172a" strokeLinecap="round" opacity="0.7">
      {/* Salida desde el lateral izquierdo hacia dentro */}
      <path d="M40 66 C 48 72, 60 74, 72 70" fill="none" />
      <polygon points="70,69 74,69.5 71.5,72.5" />

      {/* Pase interior del mediocentro a la media punta */}
      <path d="M44 48 C 52 46, 60 46, 68 48" fill="none" />
      <polygon points="66,47.5 70,48.5 67,51" />

      {/* Cambio de orientación larga hacia banda derecha */}
      <path d="M52 30 C 72 24, 96 26, 120 36" fill="none" />
      <polygon points="118,35 122,36.5 118.5,38.5" />

      {/* Desmarque del delantero propio entre centrales rivales */}
      <path d="M48 66 C 72 60, 92 58, 110 54" fill="none" />
      <polygon points="108,53.5 112,54 109,57" />

      {/* Repliegue de un mediocampista hacia línea defensiva */}
      <path d="M68 48 C 60 40, 52 36, 44 34" fill="none" />
      <polygon points="43,33.5 47,34.5 44,37" />
    </g>
  </svg>
);

export const Trophy = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 20 L30 10 L70 10 L70 20" stroke="currentColor" strokeWidth="3" fill="none" />
    <path d="M35 20 L35 45 Q35 55 45 55 L55 55 Q65 55 65 45 L65 20" fill="currentColor" />
    <rect x="25" y="15" width="10" height="15" rx="2" fill="currentColor" />
    <rect x="65" y="15" width="10" height="15" rx="2" fill="currentColor" />
    <rect x="45" y="55" width="10" height="20" fill="currentColor" />
    <rect x="35" y="75" width="30" height="8" rx="2" fill="currentColor" />
    <circle cx="50" cy="35" r="8" fill="white" opacity="0.3" />
  </svg>
);

export const Whistle = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="45" cy="50" rx="25" ry="20" fill="currentColor" />
    <circle cx="45" cy="50" r="8" fill="white" opacity="0.3" />
    <path d="M70 50 L85 45 L85 55 Z" fill="currentColor" />
    <line x1="45" y1="30" x2="45" y2="15" stroke="currentColor" strokeWidth="3" />
    <circle cx="45" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const CoachBoard = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="80" height="70" rx="4" fill="currentColor" />
    <rect x="15" y="20" width="70" height="60" rx="2" fill="white" />
    {/* Field representation */}
    <rect x="20" y="25" width="60" height="50" fill="#10b981" opacity="0.2" />
    <line x1="50" y1="25" x2="50" y2="75" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    {/* Player markers */}
    <circle cx="35" cy="40" r="3" fill="currentColor" />
    <circle cx="50" cy="35" r="3" fill="currentColor" />
    <circle cx="65" cy="40" r="3" fill="currentColor" />
    <circle cx="50" cy="60" r="3" fill="currentColor" />
  </svg>
);

export const VisionCoachLogo = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    {/* Eye shape representing "Vision" */}
    <ellipse cx="50" cy="50" rx="45" ry="30" fill="url(#logoGradient)" opacity="0.9" />
    <ellipse cx="50" cy="50" rx="35" ry="22" fill="white" opacity="0.3" />
    {/* Football in the center */}
    <circle cx="50" cy="50" r="15" fill="white" />
    <path d="M50 38 L55 48 L50 53 L45 48 Z" fill="url(#logoGradient)" />
    <path d="M38 50 L48 45 L53 50 L48 55 Z" fill="url(#logoGradient)" />
    <path d="M50 62 L45 52 L50 47 L55 52 Z" fill="url(#logoGradient)" />
    <path d="M62 50 L52 55 L47 50 L52 45 Z" fill="url(#logoGradient)" />
  </svg>
);
