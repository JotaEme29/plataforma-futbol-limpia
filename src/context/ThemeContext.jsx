 // src/context/ThemeContext.jsx
 import { createContext, useState, useContext, useEffect } from 'react';
 
 const ThemeContext = createContext();
 
 export const useTheme = () => useContext(ThemeContext);
 
 export const ThemeProvider = ({ children }) => {
   // Lee el tema del localStorage o usa 'light' por defecto
   const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
 
   useEffect(() => {
     const root = window.document.documentElement;
     const isDark = theme === 'dark';
 
     root.classList.remove(isDark ? 'light' : 'dark');
     root.classList.add(theme);
 
     localStorage.setItem('theme', theme);
   }, [theme]);
 
   const toggleTheme = () => {
     setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
   };
 
   return (
     <ThemeContext.Provider value={{ theme, toggleTheme }}>
       {children}
     </ThemeContext.Provider>
   );
 };
