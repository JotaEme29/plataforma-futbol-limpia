# 📨 Flujo de Invitaciones - Vision Coach

## 🎯 Problema Solucionado

Antes, cuando invitabas a un jugador o entrenador, **no podían crear cuenta** porque solo existía el registro de club.

## ✅ Solución Implementada

### **1. Invitar Usuario (Administrador/Entrenador)**

**Desde:** `Gestión de Roles` → Botón "Invitar Usuario"

**Proceso:**
1. Rellenas el formulario:
   - Nombre y Apellido
   - Email
   - Rol (Jugador, Entrenador, Asistente)
   - Equipo (opcional)

2. Al crear la invitación:
   - ✅ Se guarda en Firestore (`invitaciones` collection)
   - ✅ Se genera un **link único**: `https://tudominio.com/aceptar-invitacion?id=ABC123`
   - ✅ El link se **copia automáticamente** al portapapeles
   - ✅ Aparece un alert con el link completo

3. **Tú compartes ese link** con el invitado (por WhatsApp, email, etc.)

---

### **2. Aceptar Invitación (Usuario Invitado)**

**Desde:** Link recibido → `/aceptar-invitacion?id=ABC123`

**Proceso:**
1. El invitado hace clic en el link
2. Ve una página con:
   - ✅ Logo de Vision Coach
   - ✅ Su nombre y email (pre-cargados)
   - ✅ Su rol asignado
   - ✅ Formulario para crear contraseña

3. Crea su contraseña y confirma
4. Sistema:
   - ✅ Crea cuenta en Firebase Auth
   - ✅ Crea perfil en Firestore (`usuarios` collection)
   - ✅ Asigna automáticamente: `clubId`, `rol`, `equipoId`
   - ✅ Marca invitación como "aceptada"

5. Redirige a **Login** → Ya puede iniciar sesión normalmente

---

### **3. Flujos de Entrada**

#### **Administrador del Club:**
```
Home → Registro → Crear Club → Dashboard
```

#### **Usuario Invitado (Jugador/Entrenador):**
```
Link de invitación → Aceptar Invitación → Crear contraseña → Login → Dashboard
```

#### **Usuario Existente:**
```
Home → Login → Dashboard
```

---

## 🔐 Seguridad

- ✅ Cada invitación tiene un **ID único** (no se puede reutilizar)
- ✅ Las invitaciones verifican que el `estado === 'pendiente'`
- ✅ Una vez aceptada, la invitación se marca como `'aceptada'`
- ✅ No se puede usar el mismo link dos veces

---

## 📱 UX Mejorada

### **En la Home:**
- Si eres **nuevo club** → Botón "Continuar al Registro del Club"
- Si tienes **invitación** → Link "¿Recibiste una invitación? Haz clic aquí"
- Si ya tienes **cuenta** → Tab "Iniciar Sesión"

### **En Gestión de Roles:**
- Al crear invitación → **Link se copia automáticamente**
- Alert muestra el link completo para verificar antes de enviarlo

---

## 🛠️ Archivos Modificados

1. **`src/pages/AceptarInvitacion.jsx`** ← ✨ NUEVO
   - Página para aceptar invitaciones
   - Formulario de creación de contraseña
   - Validación de invitación

2. **`src/components/GestionRoles.jsx`** ← Actualizado
   - Genera link único al crear invitación
   - Copia link al portapapeles automáticamente

3. **`src/pages/Home.jsx`** ← Actualizado
   - Agregado link "¿Recibiste una invitación?"

4. **`src/App.jsx`** ← Actualizado
   - Nueva ruta: `/aceptar-invitacion`

---

## 📊 Estructura de Datos

### **Colección `invitaciones`:**
```javascript
{
  id: "ABC123", // Auto-generado
  email: "jugador@example.com",
  nombre: "Juan",
  apellido: "Pérez",
  rol: "jugador",
  equipoId: "equipo123", // Opcional
  clubId: "club456",
  clubNombre: "FC Barcelona",
  invitadoPor: "uid_administrador",
  fechaInvitacion: Timestamp,
  estado: "pendiente", // "pendiente" | "aceptada" | "cancelada"
  fechaAceptacion: Timestamp, // Cuando acepta
  usuarioId: "uid_nuevo_usuario" // Cuando acepta
}
```

### **Colección `usuarios`:**
```javascript
{
  uid: "uid_nuevo_usuario",
  email: "jugador@example.com",
  nombre: "Juan",
  apellido: "Pérez",
  clubId: "club456",
  rol: "jugador",
  equipoId: "equipo123",
  activo: true,
  fechaRegistro: Timestamp
}
```

---

## ✅ Testing

### **Prueba el flujo completo:**

1. **Como Administrador:**
   ```
   1. Login → Gestión de Roles
   2. Clic "Invitar Usuario"
   3. Rellenar: nombre, email, rol
   4. Copiar link generado
   ```

2. **Como Invitado:**
   ```
   1. Abrir link en navegador
   2. Verificar que aparece tu nombre
   3. Crear contraseña (mín. 6 caracteres)
   4. Confirmar contraseña
   5. Clic "Crear Cuenta"
   6. Login con email y contraseña creada
   ```

3. **Verificar permisos:**
   - Jugador → Solo ve su perfil y estadísticas
   - Entrenador → Gestiona su equipo
   - Administrador → Acceso total

---

## 🚀 Próximos Pasos (Opcional)

- [ ] Envío automático de email con el link (usando Cloud Functions)
- [ ] Expiración de invitaciones (ej: 7 días)
- [ ] Re-enviar invitación
- [ ] Notificaciones en app cuando alguien acepta

---

**¡El flujo está 100% funcional!** 🎉
