// src/components/FootballSVG.jsx - Football-themed SVG components

export const FootballBall = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="currentColor" strokeWidth="2"/>
    <path d="M50 10 L60 35 L50 50 L40 35 Z" fill="currentColor"/>
    <path d="M10 50 L35 40 L50 50 L35 60 Z" fill="currentColor"/>
    <path d="M50 90 L40 65 L50 50 L60 65 Z" fill="currentColor"/>
    <path d="M90 50 L65 60 L50 50 L65 40 Z" fill="currentColor"/>
    <path d="M30 25 L40 35 L35 40 L25 30 Z" fill="currentColor"/>
    <path d="M70 25 L60 35 L65 40 L75 30 Z" fill="currentColor"/>
    <path d="M30 75 L40 65 L35 60 L25 70 Z" fill="currentColor"/>
    <path d="M70 75 L60 65 L65 60 L75 70 Z" fill="currentColor"/>
  </svg>
);

export const FootballField = ({ className = "w-full h-full" }) => (
  <svg className={className} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="140" fill="url(#fieldGradient)"/>
    <defs>
      <linearGradient id="fieldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#059669" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    {/* Field lines */}
    <rect x="5" y="5" width="190" height="130" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
    <line x1="100" y1="5" x2="100" y2="135" stroke="white" strokeWidth="2" opacity="0.6"/>
    <circle cx="100" cy="70" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
    <circle cx="100" cy="70" r="2" fill="white" opacity="0.6"/>
    {/* Goal areas */}
    <rect x="5" y="45" width="20" height="50" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
    <rect x="175" y="45" width="20" height="50" fill="none" stroke="white" strokeWidth="2" opacity="0.6"/>
  </svg>
);

export const Trophy = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 20 L30 10 L70 10 L70 20" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M35 20 L35 45 Q35 55 45 55 L55 55 Q65 55 65 45 L65 20" fill="currentColor"/>
    <rect x="25" y="15" width="10" height="15" rx="2" fill="currentColor"/>
    <rect x="65" y="15" width="10" height="15" rx="2" fill="currentColor"/>
    <rect x="45" y="55" width="10" height="20" fill="currentColor"/>
    <rect x="35" y="75" width="30" height="8" rx="2" fill="currentColor"/>
    <circle cx="50" cy="35" r="8" fill="white" opacity="0.3"/>
  </svg>
);

export const Whistle = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="45" cy="50" rx="25" ry="20" fill="currentColor"/>
    <circle cx="45" cy="50" r="8" fill="white" opacity="0.3"/>
    <path d="M70 50 L85 45 L85 55 Z" fill="currentColor"/>
    <line x1="45" y1="30" x2="45" y2="15" stroke="currentColor" strokeWidth="3"/>
    <circle cx="45" cy="12" r="3" fill="currentColor"/>
  </svg>
);

export const CoachBoard = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="80" height="70" rx="4" fill="currentColor"/>
    <rect x="15" y="20" width="70" height="60" rx="2" fill="white"/>
    {/* Field representation */}
    <rect x="20" y="25" width="60" height="50" fill="#10b981" opacity="0.2"/>
    <line x1="50" y1="25" x2="50" y2="75" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    {/* Player markers */}
    <circle cx="35" cy="40" r="3" fill="currentColor"/>
    <circle cx="50" cy="35" r="3" fill="currentColor"/>
    <circle cx="65" cy="40" r="3" fill="currentColor"/>
    <circle cx="50" cy="60" r="3" fill="currentColor"/>
  </svg>
);

export const VisionCoachLogo = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="50%" stopColor="#8b5cf6"/>
        <stop offset="100%" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    {/* Eye shape representing "Vision" */}
    <ellipse cx="50" cy="50" rx="45" ry="30" fill="url(#logoGradient)" opacity="0.9"/>
    <ellipse cx="50" cy="50" rx="35" ry="22" fill="white" opacity="0.3"/>
    {/* Football in the center */}
    <circle cx="50" cy="50" r="15" fill="white"/>
    <path d="M50 38 L55 48 L50 53 L45 48 Z" fill="url(#logoGradient)"/>
    <path d="M38 50 L48 45 L53 50 L48 55 Z" fill="url(#logoGradient)"/>
    <path d="M50 62 L45 52 L50 47 L55 52 Z" fill="url(#logoGradient)"/>
    <path d="M62 50 L52 55 L47 50 L52 45 Z" fill="url(#logoGradient)"/>
  </svg>
);