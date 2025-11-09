// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react( )],
  // ¡¡¡LA PARTE IMPORTANTE!!!
  // Esto asegura que las variables de entorno se carguen correctamente.
  // No necesitas 'loadEnv' explícitamente para este caso simple.
  // El comportamiento por defecto de Vite debería funcionar si el archivo
  // .env.local está en la raíz. Pero si no, esta es la forma de forzarlo.
  // Para mantenerlo simple, nos aseguraremos de que el prefijo sea el correcto.
  envPrefix: 'VITE_', // Asegura que solo las variables con este prefijo se carguen.
});
