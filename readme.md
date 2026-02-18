# 🛒 E-commerce Backend - Entrega Final

Sistema backend completo de e-commerce con autenticación JWT, autorización por roles, gestión de carritos y sistema de compras con verificación de stock.

## 👨‍💻 Autor

**Leonardo Ledesma**  
Comisión: Backend II  
Fecha: Febrero 2026

---

## 📋 Descripción

API RESTful desarrollada con Node.js y Express que implementa un sistema completo de e-commerce con las siguientes características:

- ✅ **Autenticación** con JWT y Passport
- ✅ **Autorización** por roles (user, premium, admin)
- ✅ **Sistema de compras** con verificación de stock en tiempo real
- ✅ **Generación de tickets** de compra
- ✅ **Recuperación de contraseña** con envío de emails
- ✅ **Arquitectura en capas** (DAO, Repository, Service, Controller)
- ✅ **DTOs** para proteger información sensible

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | v22.14.0 | Runtime de JavaScript |
| Express | ^4.18.2 | Framework web |
| MongoDB | Atlas | Base de datos NoSQL |
| Mongoose | ^8.0.0 | ODM para MongoDB |
| JWT | ^9.0.2 | Autenticación con tokens |
| Passport | ^0.7.0 | Estrategias de autenticación |
| Bcrypt | ^5.1.1 | Encriptación de contraseñas |
| Nodemailer | ^6.9.7 | Envío de emails |
| Socket.io | ^4.6.0 | Comunicación en tiempo real |
| Handlebars | ^4.7.8 | Motor de plantillas |

---

## 📁 Estructura del Proyecto

```
src/
├── config/              # Configuraciones centralizadas
│   ├── envConfig.js     # Variables de entorno
│   ├── passportConfig.js # Estrategias de autenticación
│   └── roles.js         # Definición de roles y permisos
├── dao/
│   └── models/          # Modelos de Mongoose (DAOs)
│       ├── userModel.js
│       ├── productModel.js
│       ├── cartModel.js
│       ├── ticketModel.js
│       └── passwordResetTokenModel.js
├── dto/                 # Data Transfer Objects
│   ├── userDTO.js
│   ├── productDTO.js
│   ├── cartDTO.js
│   └── ticketDTO.js
├── repositories/        # Patrón Repository
│   ├── baseRepository.js
│   ├── userRepository.js
│   ├── productRepository.js
│   ├── cartRepository.js
│   ├── ticketRepository.js
│   └── passwordResetTokenRepository.js
├── services/            # Lógica de negocio
│   ├── authService.js
│   ├── userService.js
│   ├── productService.js
│   ├── cartService.js
│   ├── purchaseService.js
│   └── emailService.js
├── middlewares/         # Middlewares personalizados
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── routes/              # Rutas de la API
│   ├── sessionRouter.js
│   ├── productRouter.js
│   ├── cartRouter.js
│   ├── ticketRouter.js
│   └── viewsRouter.js
├── utils/               # Utilidades
│   ├── hashPassword.js
│   └── constantsUtil.js
├── views/               # Vistas Handlebars
├── public/              # Archivos estáticos
├── websocket.js         # Configuración de Socket.io
└── app.js               # Punto de entrada
```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Leoledes/entrega-final-backend2.git
cd entrega-final-backend2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto basándose en `.env.profesor`:

```bash
# Copiar el template
cp .env.profesor .env
```

Luego editar `.env` con tus valores reales:

```env
# Configuración mínima requerida
MONGO_URI=tu-conexion-mongodb-real
JWT_SECRET=tu-secreto-jwt-real
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-real
```

**Ver `.env.profesor` para la lista completa de variables.**

⚠️ **IMPORTANTE:** Nunca subir el archivo `.env` a GitHub (ya está en `.gitignore`).

### 4. Ejecutar el servidor

```bash
npm start
```

El servidor estará disponible en: `http://localhost:8080`

---

## 📡 Endpoints Principales

### **Autenticación** (`/api/sessions`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/current` | Obtener usuario actual | Sí |
| POST | `/logout` | Cerrar sesión | Sí |
| POST | `/forgot-password` | Solicitar recuperación | No |
| POST | `/reset-password` | Restablecer contraseña | No |

### **Productos** (`/api/products`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar productos | Público |
| GET | `/:pid` | Obtener producto | Público |
| POST | `/` | Crear producto | Admin, Premium |
| PUT | `/:pid` | Actualizar producto | Admin, Owner |
| DELETE | `/:pid` | Eliminar producto | Admin, Owner |

### **Carritos** (`/api/carts`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/` | Crear carrito | Público |
| GET | `/:cid` | Obtener carrito | User, Premium |
| POST | `/:cid/products/:pid` | Agregar producto | User, Premium |
| PUT | `/:cid/products/:pid` | Actualizar cantidad | User, Premium |
| DELETE | `/:cid/products/:pid` | Eliminar producto | User, Premium |
| DELETE | `/:cid` | Vaciar carrito | User, Premium |
| POST | `/:cid/purchase` | Finalizar compra | User, Premium |

### **Tickets** (`/api/tickets`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar mis tickets | User, Premium |
| GET | `/:tid` | Obtener ticket | User, Premium |
| GET | `/stats/sales` | Estadísticas | Admin |

---

## 🔐 Sistema de Roles

### **Roles Disponibles:**

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **user** | Usuario normal | Comprar productos |
| **premium** | Usuario premium | Comprar y vender productos |
| **admin** | Administrador | Control total del sistema |

### **Matriz de Permisos:**

| Acción | USER | PREMIUM | ADMIN |
|--------|------|---------|-------|
| Ver productos | ✅ | ✅ | ✅ |
| Comprar | ✅ | ✅ | ❌ |
| Crear productos | ❌ | ✅ | ✅ |
| Editar propios productos | ❌ | ✅ | ✅ |
| Editar cualquier producto | ❌ | ❌ | ✅ |
| Eliminar propios productos | ❌ | ✅ | ✅ |
| Eliminar cualquier producto | ❌ | ❌ | ✅ |
| Ver estadísticas | ❌ | ❌ | ✅ |

---

## 🧪 Testing

### **Resultados de Pruebas**

#### **✅ Bloque 1: Autenticación (5/5)**

| Test | Endpoint | Método | Status | Resultado |
|------|----------|--------|--------|-----------|
| Registro | `/register` | POST | 201 | ✅ Pasó |
| Email duplicado | `/register` | POST | 400 | ✅ Pasó |
| Login | `/login` | POST | 200 | ✅ Pasó |
| Current con token | `/current` | GET | 200 | ✅ Pasó |
| Current sin token | `/current` | GET | 401 | ✅ Pasó |

#### **✅ Bloque 2: Productos y Roles (4/4)**

| Test | Descripción | Status | Resultado |
|------|-------------|--------|-----------|
| USER crea producto | Debe fallar | 403 | ✅ Pasó |
| ADMIN crea producto | Debe funcionar | 201 | ✅ Pasó |
| Listar productos | Público | 200 | ✅ Pasó |
| Ver producto | Público | 200 | ✅ Pasó |

#### **✅ Bloque 3: Compras (7/7)**

| Test | Descripción | Status | Resultado |
|------|-------------|--------|-----------|
| Agregar al carrito | Con stock | 200 | ✅ Pasó |
| Validación stock | Sin stock | 400 | ✅ Pasó |
| Finalizar compra | Completa | 200 | ✅ Pasó |
| Stock actualizado | En BD | 200 | ✅ Pasó |
| Carrito vaciado | Después de compra | 200 | ✅ Pasó |
| Ver tickets | Del usuario | 200 | ✅ Pasó |
| Estadísticas | Admin | 200 | ✅ Pasó |

### **Total: 16/16 tests pasados (100%)** ✅

---

## 📦 Colección de Postman

La colección completa de Postman con todos los endpoints está disponible en:

```
Postman_Collection.json
```

**Para importar:**
1. Abrir Postman
2. Click en "Import"
3. Seleccionar el archivo `Postman_Collection.json`

---

## 🏗️ Arquitectura

### **Patrón en Capas:**

```
┌─────────────────┐
│     Routes      │  ← Maneja HTTP (request/response)
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  ← Lógica de negocio
└────────┬────────┘
         │
┌────────▼────────┐
│  Repositories   │  ← Acceso a datos (CRUD)
└────────┬────────┘
         │
┌────────▼────────┐
│   DAO/Models    │  ← Esquemas de MongoDB
└────────┬────────┘
         │
┌────────▼────────┐
│    MongoDB      │  ← Base de datos
└─────────────────┘
```

### **Flujo de una compra:**

```
1. Usuario → POST /api/carts/:cid/purchase
2. purchaseService.processPurchase()
   ├── Verifica stock de cada producto
   ├── Separa disponibles/no disponibles
   ├── Crea ticket con ticketRepository
   ├── Actualiza stock con productRepository
   └── Limpia carrito con cartRepository
3. Respuesta con ticket + resumen
```

---

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con **bcrypt** (salt rounds: 10)
- ✅ Autenticación con **JWT** (tokens con expiración)
- ✅ Cookies **httpOnly** para proteger tokens
- ✅ **DTOs** para eliminar información sensible
- ✅ Middleware de **autorización** por roles
- ✅ Validación de **ownership** en recursos
- ✅ Tokens de recuperación con **expiración de 1 hora**

---

## 📧 Sistema de Emails

Configurado con **Nodemailer** para:
- Recuperación de contraseña
- Confirmación de cambio de contraseña

**Plantillas HTML profesionales** incluidas.

---

## 🎯 Características Destacadas

### **1. Verificación de Stock en Tiempo Real**
```javascript
// El sistema verifica stock antes de comprar
// Si un producto no tiene stock, se procesa compra parcial
{
  "purchasedProducts": [...],  // Con stock
  "unavailableProducts": [...] // Sin stock
}
```

### **2. Generación Automática de Tickets**
```javascript
// Cada compra genera un ticket único
{
  "code": "TICKET-1771423299499-3617",
  "amount": 4550,
  "purchaser": "carlos@test.com"
}
```

### **3. DTOs para Seguridad**
```javascript
// NUNCA exponemos contraseñas
// Antes: { password: "$2b$10$..." }
// Después: { firstName: "Carlos", role: "user" }
```

---

## 🐛 Troubleshooting

### **Error: Cannot connect to MongoDB**
```bash
# Verificar conexión en .env
MONGO_URI=mongodb+srv://...
```

### **Error: JWT_SECRET not found**
```bash
# Agregar en .env
JWT_SECRET=tu-secreto-aqui
```

### **Error: Email not sending**
```bash
# Verificar credenciales de Gmail App Password
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-16-chars
```

---

## 📝 Notas Importantes

### **Cambiar rol de usuario a ADMIN:**

Usar MongoDB Compass o Atlas:
```javascript
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

### **Tokens de recuperación:**
- Expiran en **1 hora**
- Solo se puede usar **una vez**
- No se puede reutilizar **la misma contraseña**

---

## 🤝 Contribuciones

Este es un proyecto educativo para la cursada de Backend II de Coderhouse.

---

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

---

## 📞 Contacto

**Leonardo Ledesma**  
GitHub: [@Leoledes](https://github.com/Leoledes)  
Repositorio: [entrega-final-backend2](https://github.com/Leoledes/entrega-final-backend2)

---

## ✨ Agradecimientos

- Coderhouse - Backend II
- Profesor y tutores de la comisión

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0