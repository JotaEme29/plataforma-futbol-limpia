# ⚽ Vision Coach - Plataforma Profesional de Gestión Deportiva

> **Transforma la gestión de tu club de fútbol con tecnología profesional**

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 ¿Por qué Vision Coach?

**Vision Coach** es una plataforma web completa diseñada para **entrenadores, directores deportivos y clubes de fútbol base** que buscan profesionalizar su gestión deportiva sin invertir en software costoso.

### 💡 Problema que resolvemos

Los clubes de fútbol amateur y semiprofesional enfrentan desafíos diarios:
- ❌ Gestión manual de plantillas en Excel o papel
- ❌ Pérdida de datos de rendimiento de jugadores
- ❌ Imposibilidad de hacer seguimiento histórico
- ❌ Comunicación desorganizada entre cuerpo técnico
- ❌ Falta de análisis estadístico para tomar decisiones

### ✅ Nuestra solución

**Vision Coach** centraliza toda la gestión deportiva en una única plataforma intuitiva:

#### 📊 **Dashboard Inteligente**
- Vista global de tu club en tiempo real
- Métricas clave: jugadores, equipos, eventos próximos
- Acceso rápido a todas las herramientas

#### 👥 **Gestión de Plantilla**
- Registro completo de jugadores (datos personales, posición, edad)
- Estadísticas individuales (goles, asistencias, minutos jugados)
- Rankings automáticos (Top goleadores, mejores valoraciones)
- Gráficos visuales de rendimiento

#### 📅 **Calendario de Eventos**
- Programación de partidos y entrenamientos
- Registro de resultados y marcadores
- Estadísticas acumuladas (PJ, PG, PE, PP, GF, GC, DG)
- Filtrado por equipo

#### ⚙️ **Sistema de Roles**
- **Administrador**: Control total del club
- **Entrenador**: Gestión de equipo y jugadores
- **Jugador**: Visualización de estadísticas personales (próximamente)

#### 🎨 **Experiencia de Usuario Premium**
- Modo oscuro/claro
- Diseño responsive (móvil, tablet, desktop)
- Animaciones fluidas
- Interfaz intuitiva sin curva de aprendizaje

## 🚀 Casos de Uso Reales

### Para Clubes de Fútbol Base
- Gestiona múltiples categorías (benjamín, alevín, infantil, cadete, juvenil)
- Centraliza información de +100 jugadores
- Genera reportes automáticos para directiva

### Para Entrenadores
- Registra rendimiento de cada jugador
- Toma decisiones basadas en datos
- Planifica entrenamientos y convocatorias

### Para Escuelas de Fútbol
- Seguimiento personalizado del desarrollo de cada alumno
- Comunicación transparente con padres
- Métricas de progreso a lo largo del año

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite (ultra rápido)
- **Backend**: Firebase (Firestore + Authentication)
- **UI/UX**: Tailwind CSS + Framer Motion
- **Gráficos**: Chart.js
- **Hosting**: Vercel/Netlify (deploy en 2 minutos)

## 📦 Instalación

### Requisitos previos
- Node.js 16+ instalado
- Cuenta gratuita en Firebase
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/JotaEme29/plataforma-futbol-limpia.git
cd plataforma-futbol-limpia

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase
# - Copia .env.example a .env
# - Rellena tus credenciales de Firebase Console
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🔧 Configuración de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Activa **Authentication** (Email/Password)
4. Activa **Firestore Database**
5. Copia las credenciales a tu archivo `.env`
6. Configura las reglas de seguridad (ver documentación de Firebase)

## 🚀 Despliegue en Producción

### Opción 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Opción 2: Netlify

```bash
# Build de producción
npm run build

# Sube la carpeta 'dist' a Netlify
```

### Variables de entorno en producción
No olvides configurar las variables de entorno en tu plataforma de hosting:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📊 Estado del Proyecto

| Funcionalidad | Estado |
|--------------|--------|
| ✅ Autenticación | Completo |
| ✅ Dashboard Club | Completo |
| ✅ Gestión Plantilla | Completo |
| ✅ Gestión Eventos | Completo |
| ✅ Estadísticas | Completo |
| ✅ Modo Oscuro | Completo |
| 🚧 Evaluaciones en vivo | En desarrollo |
| 🚧 Módulo Finanzas | Planificado |
| 🚧 App Móvil | Planificado |

## 🎥 Demo

🔗 [Ver Demo en Vivo](#) *(próximamente)*

## 🤝 ¿Para quién es este proyecto?

### Ideal para:
- ✅ Clubes de fútbol base (hasta 500 jugadores)
- ✅ Escuelas de fútbol
- ✅ Equipos amateur y semiprofesionales
- ✅ Entrenadores freelance con múltiples equipos

### No es para:
- ❌ Clubes profesionales de élite (necesitan software enterprise)
- ❌ Gestión financiera compleja
- ❌ Transmisión de video en vivo

## 💼 Modelo de Negocio (Futuro)

- **Versión Gratuita**: Hasta 50 jugadores, 2 equipos
- **Pro**: $15/mes - Hasta 200 jugadores, equipos ilimitados
- **Club**: $50/mes - Jugadores ilimitados, soporte prioritario

## 🤝 Contribuir

¿Quieres mejorar Vision Coach? ¡Contribuciones bienvenidas!

1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📧 Contacto

**Desarrollador**: [Tu Nombre]
- LinkedIn: [Tu Perfil LinkedIn]
- Email: tu.email@ejemplo.com
- Portfolio: [tu-portfolio.com]

## 📄 Licencia

MIT License - Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**¿Te gusta el proyecto? Dale una ⭐ en GitHub!**

Hecho con ❤️ para la comunidad del fútbol base
