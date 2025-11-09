// src/components/RankingGoles.jsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Text } from 'recharts';

function RankingGoles({ jugadores }) {
  // Ordenamos y tomamos el top 10 para mayor claridad visual
  const jugadoresOrdenados = [...jugadores]
    .sort((a, b) => (b.total_goles || 0) - (a.total_goles || 0))
    .slice(0, 10);
  
  // Recharts prefiere un array de objetos
  const data = jugadoresOrdenados.map(j => ({
    name: j.apodo || `${j.nombre} ${j.apellidos.split(' ')[0]}`, // Usar apodo o nombre + primer apellido
    Goles: j.total_goles || 0,
  }));
  
  return (
    // ResponsiveContainer hace que el gráfico se adapte al 100% del contenedor padre.
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 40, right: 30, left: 0, bottom: 5 }}
        barSize={30}
      >
        {/* Definimos un gradiente para las barras */}
        <defs>
          <linearGradient id="colorGoles" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        
        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip 
          cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
          labelStyle={{ color: '#f9fafb' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
        <Bar dataKey="Goles" fill="url(#colorGoles)" radius={[4, 4, 0, 0]} />
        <Text x="50%" y={20} textAnchor="middle" fill="#e2e8f0" fontSize={18} fontWeight="bold">
          Ranking de Goleadores
        </Text>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RankingGoles;
