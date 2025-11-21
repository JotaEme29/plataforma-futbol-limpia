# 🔐 Seguridad de Cuentas - Vision Coach

## 🛡️ Protecciones Implementadas

### **1. Recuperación de Contraseña (Firebase Authentication)**

#### **¿Cómo funciona?**
```
Usuario → Clic "Olvidé mi contraseña" → Ingresa email
         ↓
Firebase → Envía email con link temporal (válido 1 hora)
         ↓
Usuario → Abre su email → Clic en el link → Crea nueva contraseña
         ↓
Firebase → Contraseña actualizada ✅
```

#### **¿Por qué es seguro?**
- ✅ **No hay acceso directo:** No se puede cambiar sin el link del email
- ✅ **Link temporal:** Expira en 1 hora
- ✅ **Un solo uso:** El link se invalida después de usarlo
- ✅ **Requiere acceso al email:** El atacante necesitaría hackear el buzón de correo

---

### **2. Protección del Rol de Administrador**

**Reglas implementadas en Firestore:**
```javascript
// Los usuarios NO pueden cambiar su propio rol
match /usuarios/{userId} {
  allow update: if request.auth.uid == userId &&
                   // Verificar que no cambie el campo 'rol'
                   request.resource.data.rol == resource.data.rol;
}
```

**Esto previene:**
- ❌ Jugador no puede auto-promover a Administrador
- ❌ Entrenador no puede cambiar su rol
- ✅ Solo el Admin puede cambiar roles desde "Gestión de Roles"

---

### **3. Verificación de Email (Recomendado)**

**Puedes activar verificación de email obligatoria:**

1. Firebase Console → **Authentication** → **Templates**
2. Edita el template de "Email Address Verification"
3. Activa "Require email verification before login"

**Beneficios:**
- ✅ Confirma que el usuario controla el email
- ✅ Previene registros con emails falsos
- ✅ Detecta si alguien registró con email ajeno

---

### **4. Autenticación de Dos Factores (Opcional - Avanzado)**

**Para máxima seguridad del Administrador:**
```javascript
// Activar MFA en Firebase
import { multiFactor } from 'firebase/auth';

// El admin configura verificación por SMS
// Cada login requiere: email + contraseña + código SMS
```

**Implementación futura:**
- 📱 SMS de verificación
- 📧 Código por email
- 🔐 Aplicación autenticadora (Google Authenticator)

---

## 🚨 Escenarios de Ataque y Defensas

### **Escenario 1: Alguien conoce el email del admin**

**Ataque:**
```
Atacante → Clic "Olvidé contraseña" → Ingresa email del admin
         ↓
Firebase → Envía link al EMAIL DEL ADMIN (no al atacante)
         ↓
Atacante → ❌ NO recibe el link (fue al email real del admin)
```

**Defensa:**
- ✅ Firebase envía el link **solo al email registrado**
- ✅ El atacante no tiene acceso al buzón del admin
- ⚠️ **RIESGO:** Si el atacante hackea el email del admin

---

### **Escenario 2: Email comprometido**

**Si alguien hackea el email del admin:**

**Protecciones:**
1. **Cambiar contraseña del email** inmediatamente
2. **Activar 2FA en el email** (Gmail, Outlook, etc.)
3. **Revisar sesiones activas** en Firebase Console
4. **Cerrar sesiones remotamente:**

```javascript
// Firebase Console → Authentication → Users → 
// Buscar usuario → "Disable User" temporalmente
```

---

### **Escenario 3: Usuario interno malicioso**

**Si un jugador/entrenador intenta auto-promover:**

**Protección:**
```javascript
// Reglas de Firestore previenen cambio de rol
match /usuarios/{userId} {
  allow update: if request.auth.uid == userId &&
                   request.resource.data.rol == resource.data.rol;
                   // ☝️ El rol NO puede cambiar
}
```

**Resultado:**
```
Jugador → Intenta cambiar su rol a "administrador_club"
        ↓
Firestore → ❌ "Missing or insufficient permissions"
```

---

## ✅ Mejores Prácticas para el Administrador

### **1. Email Seguro**
- ✅ Usa email con **2FA activado** (Gmail, Outlook)
- ✅ Contraseña fuerte (mínimo 12 caracteres)
- ✅ No compartas el email con nadie

### **2. Contraseña de Vision Coach**
- ✅ Mínimo **8-10 caracteres**
- ✅ Combinación de letras, números y símbolos
- ✅ Diferente a otras contraseñas

### **3. Monitoreo**
- 👀 Revisa la sección "Usuarios del Club" regularmente
- 👀 Verifica que no haya usuarios desconocidos
- 👀 Cancela invitaciones sospechosas

### **4. Gestión de Invitaciones**
- ✅ Cancela invitaciones que no uses (no las dejes pendientes)
- ✅ Verifica la identidad antes de invitar
- ✅ Usa emails verificables (institucionales si es posible)

---

## 🔧 Configuración Recomendada en Firebase

### **Paso 1: Activar Email Verification**
```
Firebase Console → Authentication → Settings
→ "Email enumeration protection" → ✅ Enable
```

### **Paso 2: Configurar Plantillas de Email**
```
Authentication → Templates → Password Reset
→ Personaliza el mensaje
→ Agrega logo del club
→ Instrucciones claras
```

### **Paso 3: Revisar Usuarios Regularmente**
```
Authentication → Users
→ Filtrar por "Email Verified"
→ Desactivar usuarios sospechosos
```

---

## 📊 Comparación con Otras Plataformas

| Característica | Vision Coach + Firebase | Otras Plataformas |
|----------------|-------------------------|-------------------|
| Verificación de email | ✅ Disponible | ✅ Sí |
| Reset de contraseña seguro | ✅ Link temporal | ✅ Sí |
| 2FA disponible | ✅ Sí (SMS/App) | ⚠️ No siempre |
| Roles inmutables | ✅ Sí (Firestore Rules) | ⚠️ Depende |
| Logs de auditoría | ⚠️ Manual | ✅ Automático |

---

## 🚀 Próximos Pasos (Opcional)

### **Nivel 1: Básico (Actual)**
- ✅ Email + Contraseña
- ✅ Reset por email
- ✅ Roles protegidos

### **Nivel 2: Intermedio**
- [ ] Verificación de email obligatoria
- [ ] Límite de intentos de login
- [ ] Notificaciones de login desde nuevo dispositivo

### **Nivel 3: Avanzado**
- [ ] Autenticación de dos factores (2FA)
- [ ] Logs de auditoría (quién hizo qué y cuándo)
- [ ] Restricción de IP (solo desde ubicaciones conocidas)
- [ ] Sesiones con expiración automática

---

## 📝 Resumen Ejecutivo

### **¿Puede alguien hackear la cuenta solo con el email?**
**❌ NO.** Necesitaría:
1. Conocer el email ✅ (fácil)
2. **TENER ACCESO al buzón de correo** ❌ (difícil)

### **¿Qué pasa si hackean el email del admin?**
**⚠️ RIESGO ALTO.** Pueden:
- Cambiar la contraseña de Vision Coach
- Acceder a la cuenta

**Solución:**
- Protege el email con **2FA** (autenticación de dos factores)
- Usa contraseñas diferentes para email y Vision Coach

### **¿Cómo proteger la cuenta del admin?**
1. **Email con 2FA** ← MÁS IMPORTANTE
2. Contraseña fuerte y única
3. Revisar usuarios regularmente
4. No compartir credenciales

---

## 🆘 En Caso de Emergencia

### **Si sospechas que la cuenta fue comprometida:**

1. **Cambia contraseña inmediatamente:**
   - Clic "Olvidé mi contraseña"
   - Usa el link del email

2. **Revisa usuarios del club:**
   - Gestión de Roles → Usuarios
   - Busca usuarios desconocidos
   - Elimínalos si los encuentras

3. **Desactiva cuenta temporalmente:**
   - Firebase Console → Authentication → Users
   - Busca al admin → "Disable User"
   - Investiga → Re-activa cuando sea seguro

4. **Cambia contraseña del email:**
   - Gmail/Outlook → Configuración → Seguridad
   - Cambia contraseña
   - Activa 2FA si no lo tenías

---

**Conclusión:** Firebase ya es bastante seguro. La mayor vulnerabilidad es el **email comprometido**, no Vision Coach en sí.

**Recomendación #1:** Activa 2FA en tu email (Gmail, Outlook, etc.)
