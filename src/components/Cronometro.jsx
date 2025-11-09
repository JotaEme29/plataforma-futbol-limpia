// src/components/Cronometro.jsx

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const Cronometro = ({ segundos, fase }) => {
  const getFaseTexto = () => {
    switch (fase) {
      case 'preparacion': return 'Preparación';
      case 'primer_tiempo': return '1er Tiempo';
      case 'descanso': return 'Descanso';
      case 'segundo_tiempo': return '2do Tiempo';
      case 'finalizado': return 'Finalizado';
      default: return '';
    }
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-black text-gray-900 dark:text-white tracking-widest tabular-nums">
        {formatTime(segundos)}
      </div>
      <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
        {getFaseTexto()}
      </div>
    </div>
  );
};

export default Cronometro;
