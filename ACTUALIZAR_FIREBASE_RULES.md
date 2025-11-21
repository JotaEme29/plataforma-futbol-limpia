# 🔐 Actualizar Reglas de Firestore

## ⚠️ IMPORTANTE

Las reglas de seguridad de Firestore **NO se actualizan automáticamente** desde tu código local.

Debes copiarlas y pegarlas manualmente en la consola de Firebase.

---

## 📋 Pasos para Actualizar

### **1️⃣ Abre la Consola de Firebase**

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"Firestore Database"**
4. Haz clic en la pestaña **"Reglas"** (Rules)

---

### **2️⃣ Copia las Nuevas Reglas**

Abre el archivo `firestore.rules` de tu proyecto y copia TODO el contenido.

---

### **3️⃣ Pega en Firebase Console**

1. En la consola de Firebase, **borra todo** el contenido actual
2. **Pega** el contenido del archivo `firestore.rules`
3. Haz clic en **"Publicar"** (Publish)

---

### **4️⃣ Verifica**

Deberías ver un mensaje: ✅ "Reglas publicadas correctamente"

---

## 🔍 Cambios Importantes

### **Nueva regla agregada:**

```javascript
// Colección de invitaciones (a nivel raíz)
match /invitaciones/{invitacionId} {
  // Permitir lectura pública para usuarios sin autenticar
  allow read: if true;
  
  // Solo usuarios autenticados pueden crear
  allow create: if request.auth != null;
  
  // Permitir actualización para marcar como aceptada
  allow update: if true;
  
  // Solo el creador puede eliminar
  allow delete: if request.auth != null;
}
```

**¿Por qué?**
- `allow read: if true` → Permite que usuarios NO autenticados lean invitaciones
- Esto es necesario para que el link de invitación funcione ANTES de crear la cuenta

---

## ✅ Después de Actualizar

1. Recarga tu aplicación
2. Prueba crear una invitación
3. Abre el link en una ventana de incógnito
4. Ahora debería funcionar sin error de permisos

---

## 🚨 Si Olvidas Este Paso

Verás el error:
```
FirebaseError: Missing or insufficient permissions.
```

**Solución:** Sigue los pasos de arriba para actualizar las reglas.
