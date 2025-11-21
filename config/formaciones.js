// config/formaciones.js
// Configuración de formaciones tácticas para fútbol

export const formaciones = {
  '4-3-3': {
    'POR': { id: 'POR', top: '85%', left: '50%' },
    // Defensas
    'LI': { id: 'LI', top: '70%', left: '20%' },
    'DFC1': { id: 'DFC1', top: '70%', left: '40%' },
    'DFC2': { id: 'DFC2', top: '70%', left: '60%' },
    'LD': { id: 'LD', top: '70%', left: '80%' },
    // Medios
    'MC1': { id: 'MC1', top: '50%', left: '30%' },
    'MC2': { id: 'MC2', top: '50%', left: '50%' },
    'MC3': { id: 'MC3', top: '50%', left: '70%' },
    // Delanteros
    'EI': { id: 'EI', top: '25%', left: '25%' },
    'DC': { id: 'DC', top: '20%', left: '50%' },
    'ED': { id: 'ED', top: '25%', left: '75%' }
  },
  '4-4-2': {
    'POR': { id: 'POR', top: '85%', left: '50%' },
    // Defensas
    'LI': { id: 'LI', top: '70%', left: '20%' },
    'DFC1': { id: 'DFC1', top: '70%', left: '40%' },
    'DFC2': { id: 'DFC2', top: '70%', left: '60%' },
    'LD': { id: 'LD', top: '70%', left: '80%' },
    // Medios
    'MI': { id: 'MI', top: '50%', left: '20%' },
    'MC1': { id: 'MC1', top: '50%', left: '40%' },
    'MC2': { id: 'MC2', top: '50%', left: '60%' },
    'MD': { id: 'MD', top: '50%', left: '80%' },
    // Delanteros
    'DC1': { id: 'DC1', top: '25%', left: '40%' },
    'DC2': { id: 'DC2', top: '25%', left: '60%' }
  },
  '3-5-2': {
    'POR': { id: 'POR', top: '85%', left: '50%' },
    // Defensas
    'DFC1': { id: 'DFC1', top: '70%', left: '30%' },
    'DFC2': { id: 'DFC2', top: '70%', left: '50%' },
    'DFC3': { id: 'DFC3', top: '70%', left: '70%' },
    // Medios
    'CAI': { id: 'CAI', top: '55%', left: '15%' },
    'MC1': { id: 'MC1', top: '50%', left: '35%' },
    'MC2': { id: 'MC2', top: '50%', left: '50%' },
    'MC3': { id: 'MC3', top: '50%', left: '65%' },
    'CAD': { id: 'CAD', top: '55%', left: '85%' },
    // Delanteros
    'DC1': { id: 'DC1', top: '25%', left: '40%' },
    'DC2': { id: 'DC2', top: '25%', left: '60%' }
  }
};

// Orden de posiciones por líneas (de atrás hacia adelante)
export const ordenPosiciones = {
  '4-3-3': ['POR', 'LI', 'DFC1', 'DFC2', 'LD', 'MC1', 'MC2', 'MC3', 'EI', 'DC', 'ED'],
  '4-4-2': ['POR', 'LI', 'DFC1', 'DFC2', 'LD', 'MI', 'MC1', 'MC2', 'MD', 'DC1', 'DC2'],
  '3-5-2': ['POR', 'DFC1', 'DFC2', 'DFC3', 'CAI', 'MC1', 'MC2', 'MC3', 'CAD', 'DC1', 'DC2'],
};

export const prioridadPosiciones = {
  'Portero': 1,
  'Defensa': 2,
  'Lateral': 2,
  'Mediocentro': 3,
  'Medio': 3,
  'Mediocampista': 3,
  'Delantero': 4,
  'Extremo': 4
};

export const posicionesDisponibles = [
  'Portero',
  'Defensa Central',
  'Lateral Izquierdo',
  'Lateral Derecho',
  'Mediocentro Defensivo',
  'Mediocentro',
  'Mediocentro Ofensivo',
  'Extremo Izquierdo',
  'Extremo Derecho',
  'Mediapunta',
  'Delantero Centro'
];

export default formaciones;
