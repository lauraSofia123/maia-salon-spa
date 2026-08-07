# Salón de Belleza - Plataforma de Gestión y Reservas

Aplicación web full-stack para gestión integral de salón de belleza: reservas online, pagos, fidelización, paneles por roles (clienta, profesional, admin).

## Stack Tecnológico

### Backend
- **Node.js 18+** (ES Modules)
- **Express.js** - API REST
- **Sequelize ORM** + **MySQL 8.0**
- **JWT** (access + refresh tokens) + **bcryptjs**
- **Joi** - Validación
- **Multer** + **Cloudinary** - Subida de imágenes
- **Nodemailer** - Emails transaccionales
- **Twilio** - WhatsApp Business API
- **Mercado Pago SDK** - Pagos online Colombia
- **node-cron** - Jobs automáticos

### Frontend
- **React 18** + **Vite**
- **React Router v6**
- **Tailwind CSS** + Design System custom
- **Context API** + Custom Hooks (estado global)
- **React Hook Form** + **Yup** - Formularios
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **Axios** - HTTP client con interceptors
- **react-hot-toast** - Notificaciones

## Estructura del Proyecto

```
salon-belleza/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/         # DB, Cloudinary, Email, WhatsApp, MercadoPago
│   │   ├── controllers/    # Controladores delgados
│   │   ├── middlewares/    # Auth, validation, error handling, rate limit, upload
│   │   ├── models/         # 15 modelos Sequelize + asociaciones
│   │   ├── routes/         # Rutas REST por recurso
│   │   ├── services/       # Lógica de negocio (availability, pricing, appointment)
│   │   ├── utils/          # Helpers (timeUtils)
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                # SPA React
│   ├── src/
│   │   ├── components/     # UI atómicos, layout, booking, client, professional, admin
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Páginas por área (auth, booking, client, professional, admin)
│   │   ├── services/       # API client (Axios)
│   │   ├── utils/          # Formatters, validators
│   │   └── assets/         # Imágenes, fuentes
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/                    # Documentación
│   ├── ARCHITECTURE.md     # Arquitectura técnica
│   ├── API_DOCS.md         # Documentación endpoints
│   ├── DEPLOYMENT.md       # Guía despliegue
│   └── PROJECT_STATUS.md   # Estado actual del proyecto
│
├── AGENTS.md               # Reglas de trabajo para IA
├── .gitignore
└── README.md               # Este archivo
```

## Roles de Usuario

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Visitante** | Sin autenticar | Ver servicios, galería, profesionales, sedes |
| **Clienta** | Registrada | Reservar, ver historial, fidelidad, perfil, pagos |
| **Profesional** | Staff | Ver agenda, gestionar citas, bloquear horarios, stats |
| **Administrador** | Gestión total | Dashboard, CRUDs completos, reportes, usuarios |

## Módulos Principales

1. **Autenticación** - Registro, login, JWT, roles, recovery password
2. **Servicios** - CRUD, categorías (Uñas/Cabello/Pestañas), precios, duración
3. **Sedes** - CRUD, horarios, ubicación, mapas
4. **Profesionales** - Perfil, servicios, sedes, horarios, comisiones
5. **Disponibilidad** - Algoritmo slots tiempo real, bloqueos, breaks
6. **Reservas** - Flujo 6 pasos: Sede → Servicio → Pro → Fecha → Hora → Pago
7. **Pagos** - Mercado Pago (CO), efectivo, Nequi, Daviplata, depósitos
8. **Estados Cita** - pending → confirmed → in_progress → completed/cancelled/no_show
9. **Promociones/Cupones** - % descuento, monto fijo, primera visita, referidos
10. **Fidelización** - Puntos, tiers (bronze→platinum), beneficios, canje
11. **Recordatorios** - Email + WhatsApp (2h antes, 24h antes)
12. **Área Clienta** - Dashboard, historial, próximas citas, perfil, puntos
13. **Panel Profesional** - Agenda, mis citas, bloqueos, estadísticas
14. **Panel Admin** - Dashboard, gestión completa, reportes, usuarios
15. **Galería** - Filtros, lightbox, tags, destacados
16. **Reseñas** - Post-cita, moderación, respuesta pro

## Instalación

### Prerrequisitos
- Node.js 18+
- MySQL 8.0
- Cuenta Cloudinary (gratis)
- Cuenta Mercado Pago (para pagos)
- Cuenta Twilio (para WhatsApp - opcional en dev)

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Sincronizar base de datos (crea tablas)
npm run db:sync

# Poblar con datos de prueba (opcional)
npm run db:seed

# Desarrollo
npm run dev          # Puerto 3000 con --watch
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo
npm run dev          # Puerto 5173 (proxy a backend:3000)

# Build producción
npm run build        # Output en dist/

# Linting
npm run lint
```

### Base de Datos Local (Docker)

```bash
docker run -d \
  --name salon-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=salon_belleza \
  -e MYSQL_USER=salon_user \
  -e MYSQL_PASSWORD=secure_password \
  -p 3306:3306 \
  mysql:8.0
```

## Variables de Entorno Principales

### Backend (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salon_belleza
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=tu_secreto_64_chars
JWT_REFRESH_SECRET=otro_secreto_64_chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email (Gmail ejemplo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=app_password

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx
```

## Credenciales de Prueba (tras seed)

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@salon.com | 123456 |
| Clienta | maria@email.com | 123456 |
| Profesional | caro@salon.com | 123456 |

## Flujo de Reserva (Booking Flow)

```
1. SELECCIONAR SEDE      → GET /api/branches
2. SELECCIONAR SERVICIO  → GET /api/services?category=
3. SELECCIONAR PROFESIONAL → GET /api/availability/professionals?serviceId=&branchId=&date=
4. SELECCIONAR FECHA     → DatePicker (mín hoy)
5. SELECCIONAR HORA      → GET /api/availability/slots?professionalId=&branchId=&serviceId=&date=
6. PAGO                  → POST /api/appointments → Mercado Pago preference
                          → Webhook confirma → cita confirmed
```

## Disponibilidad en Tiempo Real

El algoritmo (`backend/src/services/availabilityService.js`):
1. Obtiene horario profesional en sede + horario sede
2. Calcula slots cada 15min en la intersección
3. Excluye: citas existentes, breaks, schedule blocks, buffer time
4. Retorna slots `{ time, endTime, available, duration }`

## Scripts Útiles

```bash
# Backend
cd backend
npm run dev           # Desarrollo con hot reload
npm run db:sync       # Sincronizar modelos (alter: true)
npm run db:seed       # Poblar datos de prueba (force: true)

# Frontend
cd frontend
npm run dev           # Desarrollo (Vite + proxy)
npm run build         # Build producción
npm run preview       # Preview build
npm run lint          # ESLint
```

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md) - Decisiones técnicas, patrones, modelo de datos
- [API Docs](docs/API_DOCS.md) - Endpoints, parámetros, responses, códigos error
- [Deployment](docs/DEPLOYMENT.md) - Variables, Docker, Nginx, PM2, SSL, CI/CD
- [Project Status](docs/PROJECT_STATUS.md) - Qué está hecho, qué falta, próximos pasos
- [Agents Rules](AGENTS.md) - Reglas de trabajo para desarrollo asistido por IA

## Estado Actual

Ver [PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

**Fase 1 completada**: Backend 100%, Frontend base 30%
**Siguiente**: Módulo 1 - Páginas Públicas (Home, Servicios, Galería, Profesionales, Sedes)

## Licencia

Proyecto privado - Salón de Belleza