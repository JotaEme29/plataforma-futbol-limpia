# 🛠️ Guía de Configuración - Plataforma Fútbol Limpia

## 📌 Resumen

Esta guía te explica cómo completar la plataforma copiando los archivos de lógica del repositorio anterior y agregando los nuevos archivos de registro y roles.

## 📋 Paso 1: Clonar Ambos Repositorios

```bash
# Clonar el nuevo repositorio
git clone https://github.com/JotaEme29/plataforma-futbol-limpia.git
cd plataforma-futbol-limpia

# Clonar el repositorio anterior (en otra carpeta)
cd ..
git clone https://github.com/JotaEme29/PlataformaFutbolClub.git
```

## 📝 Paso 2: Copiar Archivos del Repositorio Anterior

### 2.1 Componentes Completos
Copia TODA la carpeta `components` del repositorio anterior:

```bash
cp -r ../PlataformaFutbolClub/src/components ./src/
```

### 2.2 Páginas (excepto Login y Registro)
Copia las páginas del repositorio anterior, EXCLUYENDO Login.jsx y Registro.jsx:

```bash
# Crear carpeta pages
mkdir -p src/pages

# Copiar todas las páginas
cp ../PlataformaFutbolClub/src/pages/DashboardClub.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/Home.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/GestionRolesPage.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/CampoDeJuego.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/CardJugador.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/ClubManagement.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/Configuracion.jsx ./src/pages/
cp ../PlataformaFutbolClub/src/pages/Configuracion.css ./src/pages/

# NO copiar Login.jsx ni Registro.jsx (usaremos los nuevos)
```

### 2.3 Context
Copia el context del repositorio anterior:

```bash
mkdir -p src/context
cp ../PlataformaFutbolClub/src/context/AuthContext.jsx ./src/context/
```

### 2.4 Hooks
Copia los hooks:

```bash
mkdir -p src/hooks
cp -r ../PlataformaFutbolClub/src/hooks/* ./src/hooks/
```

### 2.5 Estilos
Copia los estilos:

```bash
mkdir -p src/styles
cp -r ../PlataformaFutbolClub/src/styles/* ./src/styles/
```

### 2.6 Assets
Copia los assets:

```bash
mkdir -p src/assets
cp -r ../PlataformaFutbolClub/src/assets/* ./src/assets/
```

### 2.7 Archivos Raíz
Copia los archivos de configuración:

```bash
# Firebase
cp ../PlataformaFutbolClub/src/firebase.js ./src/

# Archivos raíz
cp ../PlataformaFutbolClub/src/App.jsx ./src/
cp ../PlataformaFutbolClub/src/main.jsx ./src/
cp ../PlataformaFutbolClub/index.html ./
cp ../PlataformaFutbolClub/vite.config.js ./
```

## ✨ Paso 3: Agregar Nuevos Archivos de Roles Simplificados

### 3.1 Crear `src/constants/roles.js`

```javascript
export const ROLES = {
  ADMINISTRADOR: 'administrador',
  ENTRENADOR: 'entrenador',
  JUGADOR: 'jugador'
};

export const PERMISSIONS = {
  // Administrador - Acceso total
  [ROLES.ADMINISTRADOR]: [
    'gestionar_club',
    'gestionar_equipos',
    'gestionar_jugadores',
    'gestionar_eventos',
    'ver_estadisticas',
    'gestionar_roles'
  ],
  
  // Entrenador - Gestión de equipo asignado
  [ROLES.ENTRENADOR]: [
    'gestionar_jugadores',  // Solo de su equipo
    'gestionar_eventos',     // Solo de su equipo
    'ver_estadisticas'       // Solo de su equipo
  ],
  
  // Jugador - Solo visualización
  [ROLES.JUGADOR]: [
    'ver_estadisticas_propias',
    'ver_equipo_asignado'
  ]
};

export const hasPermission = (userRole, permission, context = {}) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};
```

### 3.2 Crear `src/config/firebase.js`

Copia tu configuración de Firebase:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3.3 Crear nuevos archivos de Login y Registro

En la rama `refactor/sistema-roles-limpio` del repositorio anterior, copia:

```bash
cp ../PlataformaFutbolClub/src/pages/Login.jsx ./src/pages/ # (desde rama refactor)
cp ../PlataformaFutbolClub/src/pages/Registro.jsx ./src/pages/ # (desde rama refactor)
cp ../PlataformaFutbolClub/src/pages/Registro.css ./src/pages/ # (desde rama refactor)
```

## 🚀 Paso 4: Configurar Variables de Entorno

Crea el archivo `.env` en la raíz:

```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

## 📚 Paso 5: Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## ✅ Verificar que Todo Funciona

1. La app debe iniciar en `http://localhost:3000`
2. Debes poder registrarte con el nuevo sistema simplificado
3. Los 3 roles deben funcionar correctamente
4. La lógica del repositorio anterior debe funcionar sin cambios

## 📝 Estructura Final

```
plataforma-futbol-limpia/
├── src/
│   ├── assets/           # Del repo anterior
│   ├── components/       # Del repo anterior
│   ├── config/
│   │   └── firebase.js    # NUEVO
│   ├── constants/
│   │   └── roles.js       # NUEVO (simplificado)
│   ├── context/          # Del repo anterior
│   ├── hooks/            # Del repo anterior
│   ├── pages/
│   │   ├── Login.jsx      # NUEVO
│   │   ├── Registro.jsx   # NUEVO
│   │   ├── Registro.css   # NUEVO
│   │   └── ...            # Resto del repo anterior
│   ├── styles/           # Del repo anterior
│   ├── App.jsx           # Del repo anterior
│   ├── main.jsx          # Del repo anterior
│   └── firebase.js       # Del repo anterior
├── index.html          # Del repo anterior
├── vite.config.js      # Del repo anterior
├── package.json        # Ya creado
└── .env                # Crear con tus credenciales
```

## 🎯 Diferencias Clave con el Repo Anterior

1. **Sistema de Roles**: 3 roles simples (vs 5+ roles confusos)
2. **Registro Unificado**: Un solo componente de registro
3. **AuthContext Limpio**: Sin lógica de versiones (v1.0, v2.0)
4. **Permisos Centralizados**: Archivo `roles.js` con toda la lógica

---

👉 **Repositorio Nuevo**: https://github.com/JotaEme29/plataforma-futbol-limpia
👉 **Repositorio Anterior**: https://github.com/JotaEme29/PlataformaFutbolClub
