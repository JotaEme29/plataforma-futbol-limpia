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
    <span style={{display:'inline-block',fontVariantNumeric:'tabular-nums'}}>
      {formatTime(segundos)}
    </span>
  );
};

export default Cronometro;
