# 🚀 Guía de Despliegue - Vision Coach

Esta guía te ayudará a desplegar Vision Coach en producción en menos de 10 minutos.

## 📋 Prerequisitos

- ✅ Cuenta de Firebase configurada
- ✅ Proyecto funcionando localmente
- ✅ Git instalado
- ✅ Código subido a GitHub

## 🌐 Opción 1: Despliegue en Vercel (Recomendado)

### ¿Por qué Vercel?
- ⚡ Deploy instantáneo desde GitHub
- 🔄 CI/CD automático
- 🆓 Plan gratuito generoso
- 🌍 CDN global
- ✅ Optimizado para React + Vite

### Pasos

#### 1. Preparar el proyecto

```bash
# Asegúrate de que el build funciona localmente
npm run build
npm run preview
```

#### 2. Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub
3. Autoriza el acceso a tus repositorios

#### 3. Importar proyecto

1. Clic en "New Project"
2. Selecciona tu repositorio `plataforma-futbol-limpia`
3. Vercel detectará automáticamente Vite

#### 4. Configurar variables de entorno

En el panel de Vercel, ve a **Settings** > **Environment Variables** y añade:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

⚠️ **IMPORTANTE**: Marca todas como disponibles en **Production**, **Preview** y **Development**

#### 5. Deploy

1. Clic en "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

#### 6. Configurar dominio personalizado (Opcional)

1. Ve a **Settings** > **Domains**
2. Añade tu dominio (ej: `visioncoach.com`)
3. Configura los DNS según las instrucciones
4. Vercel genera automáticamente SSL

### Deploy desde CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

## 🔷 Opción 2: Despliegue en Netlify

### ¿Por qué Netlify?
- 🎯 Interfaz muy intuitiva
- 🆓 Plan gratuito
- 📝 Formularios integrados
- 🔐 Autenticación simplificada

### Pasos

#### 1. Build del proyecto

```bash
npm run build
# Esto crea la carpeta 'dist/'
```

#### 2. Crear cuenta en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Regístrate con GitHub

#### 3. Deploy manual (Primera vez)

1. Arrastra la carpeta `dist/` a netlify.app/drop
2. ¡Listo en 30 segundos!

#### 4. Deploy automático desde GitHub

1. En Netlify, clic en "New site from Git"
2. Conecta con GitHub
3. Selecciona el repositorio
4. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### 5. Variables de entorno

Ve a **Site settings** > **Environment variables**:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

#### 6. Redeploy

Después de añadir las variables:
1. Ve a **Deploys**
2. Clic en "Trigger deploy"

---

## 🔥 Configuración adicional de Firebase

### Añadir dominio autorizado

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. **Authentication** > **Settings** > **Authorized domains**
4. Añade:
   - `tu-proyecto.vercel.app`
   - `tu-dominio.com` (si tienes dominio propio)

### Configurar CORS (si es necesario)

Si usas Storage, añade tu dominio:

```bash
firebase init hosting
# Sigue las instrucciones
```

---

## ✅ Checklist Post-Deploy

- [ ] App carga correctamente
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard muestra datos
- [ ] Modo oscuro funciona
- [ ] Responsive en móvil
- [ ] No hay errores en consola
- [ ] Meta tags correctos (ver con F12 > Elements > head)
- [ ] Dominio de Firebase autorizado

---

## 🐛 Solución de Problemas

### Error: "Firebase API key is not defined"
**Solución**: Verifica que las variables de entorno estén configuradas y redesplega.

### Error 401: Unauthorized domain
**Solución**: Añade tu dominio de Vercel/Netlify a Firebase > Authentication > Authorized domains

### La app muestra "Loading..." infinito
**Solución**: 
1. Abre DevTools (F12)
2. Revisa errores en Console
3. Verifica que Firebase esté configurado
4. Comprueba las reglas de Firestore

### CSS/Estilos no se cargan
**Solución**:
- Limpia caché del navegador
- En Vercel/Netlify, fuerza un redeploy
- Verifica que `index.css` esté importado en `main.jsx`

---

## 📊 Monitoreo

### Analytics (Opcional)

Añade Google Analytics en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Errores en producción

Considera integrar:
- [Sentry](https://sentry.io) - Seguimiento de errores
- [LogRocket](https://logrocket.com) - Session replay

---

## 🎯 Optimizaciones Adicionales

### Performance

```bash
# Analizar bundle size
npm run build
npx vite-bundle-visualizer
```

### SEO

1. Añade `sitemap.xml`
2. Configura `robots.txt`
3. Añade meta tags en `index.html`

### PWA (Opcional)

Para convertir en Progressive Web App:

```bash
npm install vite-plugin-pwa -D
```

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas desplegando:
1. Revisa los logs en Vercel/Netlify
2. Consulta la [documentación de Vite](https://vitejs.dev/guide/static-deploy.html)
3. Abre un issue en GitHub

---

**¡Felicidades! 🎉 Tu app está en producción**

Ahora puedes compartir el link en LinkedIn y mostrar tu proyecto al mundo.
