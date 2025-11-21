# 📨 Cómo Invitar Usuarios - Guía Simple

## 🎯 ¿Qué es una invitación?

Una invitación es un **link único** que le permites a alguien (jugador, entrenador, etc.) crear su cuenta y unirse a tu club.

**Firebase NO envía emails automáticamente** - tú debes copiar el link y enviárselo a la persona.

---

## 📋 Paso a Paso

### **1️⃣ Crear la Invitación**

1. Ve a **Gestión de Roles** (en el menú de navegación)
2. Haz clic en **"Invitar Usuario"**
3. Rellena el formulario:
   - Nombre y Apellido
   - Email
   - Rol (Jugador, Entrenador, Asistente)
   - Equipo (si aplica)
4. Haz clic en **"Enviar Invitación"**

✅ **El link se copia automáticamente al portapapeles**

---

### **2️⃣ Copiar el Link**

Después de crear la invitación, verás una tarjeta amarilla en **"Invitaciones Pendientes"** con:

```
🔗 LINK DE INVITACIÓN
┌─────────────────────────────────────────────────┐
│ http://localhost:5173/aceptar-invitacion?id=... │  [📋 Copiar]
└─────────────────────────────────────────────────┘
```

**Opciones para copiar:**
- Ya está copiado automáticamente cuando la creas
- O haz clic en el botón **"📋 Copiar"** en la tarjeta

---

### **3️⃣ Enviar el Link**

**Cómo enviarlo:**
- 📱 **WhatsApp:** Pega el link en un mensaje
- 📧 **Email:** Envía un correo con el link
- 💬 **Telegram/SMS:** Cualquier medio de mensajería

**Ejemplo de mensaje:**
```
Hola Juan,

Te he invitado a unirte a nuestro club en Vision Coach.

Abre este link para crear tu cuenta:
http://localhost:5173/aceptar-invitacion?id=ABC123

¡Nos vemos en la plataforma!
```

---

### **4️⃣ El Invitado Acepta**

**Qué hace el invitado:**
1. Abre el link que le enviaste
2. Ve una página con su nombre y rol
3. Crea una contraseña (mínimo 6 caracteres)
4. Hace clic en **"Crear Cuenta"**
5. ¡Ya puede hacer login!

**Página que verá:**
```
┌──────────────────────────────────┐
│  ¡Bienvenido!                    │
│                                  │
│  Juan Pérez                      │
│  jugador@email.com               │
│  Rol: Jugador                    │
│                                  │
│  [ Crear Contraseña ]            │
│  [ Confirmar Contraseña ]        │
│                                  │
│  [Crear Cuenta y Aceptar]        │
└──────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### **¿El invitado recibirá un email automático?**
❌ No. Firebase Authentication NO envía emails por defecto. **TÚ debes enviarle el link manualmente** por WhatsApp, email, etc.

### **¿Cuántas veces se puede usar el link?**
🔐 Solo **una vez**. Después de que el invitado crea su cuenta, el link queda invalidado.

### **¿Cómo sé si aceptó la invitación?**
✅ La tarjeta desaparecerá de "Invitaciones Pendientes" y el usuario aparecerá en la tabla de "Usuarios del Club".

### **¿Puedo cancelar una invitación?**
✅ Sí. En la tarjeta de invitación pendiente, haz clic en **"❌ Cancelar"**.

### **¿Qué pasa si pierdo el link?**
📋 Mientras la invitación esté en "Invitaciones Pendientes", puedes volver a copiar el link haciendo clic en **"📋 Copiar"**.

### **¿Funciona en producción?**
✅ Sí. Cuando subas tu app a un dominio real (ej: `https://miclub.com`), el link se generará automáticamente con ese dominio:
```
https://miclub.com/aceptar-invitacion?id=ABC123
```

---

## 🚀 Resumen Visual

```
ADMINISTRADOR                     INVITADO
     │                               │
     ├─► 1. Crea invitación         │
     │   (Gestión de Roles)         │
     │                               │
     ├─► 2. Copia link              │
     │   (Automático o manual)      │
     │                               │
     ├─► 3. Envía link ────────────►│
     │   (WhatsApp/Email)           │
     │                               │
     │                           4. Abre link
     │                               │
     │                           5. Crea contraseña
     │                               │
     │                           6. Clic "Crear Cuenta"
     │                               │
     │◄─────────────────── 7. Usuario creado
     │                               │
     │                           8. Hace login
     │                               │
     └───────────────────────────────┘
           Ambos en la plataforma
```

---

## ✅ Checklist

Antes de enviar la invitación, asegúrate de:
- [ ] Email correcto del invitado
- [ ] Rol apropiado seleccionado
- [ ] Equipo asignado (si es jugador/entrenador)
- [ ] Link copiado correctamente
- [ ] Mensaje claro al enviarlo

---

**¿Necesitas ayuda?** Revisa el archivo `FLUJO_INVITACIONES.md` para más detalles técnicos.
