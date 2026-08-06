# Arquitectura - Salón de Belleza

## Visión General

Aplicación web full-stack para gestión integral de salón de belleza con reservas, pagos, fidelización y paneles de control por roles.

## Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express.js
- **ORM**: Sequelize v6
- **Base de Datos**: MySQL 8.0
- **Auth**: JWT (access + refresh tokens), bcryptjs
- **Validación**: Joi
- **Archivos**: Multer + Cloudinary
- **Email**: Nodemailer (Gmail/SMTP)
- **WhatsApp**: Twilio
- **Pagos**: Mercado Pago SDK
- **Jobs**: node-cron

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Estilos**: Tailwind CSS + Design System custom
- **Estado**: Context API + Custom Hooks
- **Forms**: React Hook Form + Yup
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **HTTP**: Axios con interceptors
- **Notificaciones**: react-hot-toast

## Arquitectura Backend

```
backend/
├── src/
│   ├── config/         # DB, Cloudinary, Email, WhatsApp, MercadoPago
│   ├── controllers/    # Controladores delgados (delegar a services)
│   ├── middlewares/    # Auth, validation, error handling, rate limit, upload
│   ├── models/         # 15 modelos Sequelize + asociaciones
│   ├── routes/         # Rutas REST por recurso
│   ├── services/       # Lógica de negocio (availability, pricing, appointment)
│   ├── utils/          # Helpers (timeUtils)
│   ├── validators/     # Schemas Joi (en middlewares/validation.js)
│   └── index.js        # Entry point
```

### Patrones Implementados
- **Repository/Service Pattern**: Controllers → Services → Models
- **Middleware Chain**: Rate limit → Auth → Validation → Controller
- **Error Handling**: Clases AppError jerárquicas + handler centralizado
- **Async Wrapper**: `asyncHandler` para try/catch automático

## Arquitectura Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Atómicos: Button, Input, Card, Modal, Badge, Avatar
│   │   ├── layout/       # Header, Footer, ProtectedRoute
│   │   ├── booking/      # Steps, Calendar, TimeSlots, Payment
│   │   ├── client/       # Dashboard widgets, AppointmentCard
│   │   ├── professional/ # Schedule, Stats
│   │   └── admin/        # DataTable, StatsCards, Forms
│   ├── context/
│   │   ├── AuthContext.jsx    # User, login, register, tokens
│   │   └── CartContext.jsx    # Booking flow state (6 steps)
│   ├── hooks/            # useAuth, useCart, useApi, useDebounce, etc.
│   ├── pages/
│   │   ├── auth/         # Login, Register, ForgotPassword, ResetPassword
│   │   ├── booking/      # BookingFlow (wizard)
│   │   ├── client/       # Dashboard, Appointments, Profile, Loyalty
│   │   ├── professional/ # Dashboard, Schedule, Appointments
│   │   └── admin/        # Dashboard, Services, Branches, Professionals...
│   ├── services/
│   │   └── api.js        # Axios instance + endpoints por recurso
│   ├── utils/            # Formatters, validators, constants
│   └── assets/           # Images, fonts
```

### Estado Global
- **AuthContext**: user, tokens, login/logout, profile management
- **CartContext**: Booking wizard state (branch → service → pro → date → time → payment)

## Modelo de Datos (Entidades Principales)

```
User (1) ←→ (1) Professional
User (1) ←→ (N) Appointment (client)
Professional (1) ←→ (N) Appointment
Service (1) ←→ (N) Appointment
Branch (1) ←→ (N) Appointment
Professional (N) ←→ (M) Service [ProfessionalService]
Professional (N) ←→ (M) Branch [ProfessionalBranch + schedule]
Appointment (1) ←→ (N) Payment
Promotion (1) ←→ (N) PromotionUsage
User (1) ←→ (N) LoyaltyTransaction
Professional (1) ←→ (N) ScheduleBlock
Appointment (1) ←→ (1) Review
```

## Flujo de Reserva (Booking Flow)

```
1. SEDE          → GET /api/branches
2. SERVICIO      → GET /api/services?category=
3. PROFESIONAL   → GET /api/availability/professionals?serviceId=&branchId=&date=
4. FECHA         → Calendar picker (mín hoy)
5. HORA          → GET /api/availability/slots?professionalId=&branchId=&serviceId=&date=
6. PAGO          → POST /api/appointments (crea cita pending) → Mercado Pago preference
                  → Webhook confirma → cita confirmed
```

## Disponibilidad en Tiempo Real

**Algoritmo** (`services/availabilityService.js`):
1. Obtener horario profesional en sede (ProfessionalBranch.schedule[day])
2. Obtener horario sede (Branch.openingHours[day])
3. Calcular slots cada 15min dentro de intersección
4. Excluir: citas existentes, breaks, schedule blocks, buffer time
5. Retornar slots con `{ time, endTime, available }`

## Seguridad

- **Rate Limiting**: 3 niveles (auth: 10/15min, api: 100/15min, booking: 30/hr)
- **CORS**: Configurado para frontend URL
- **Helmet**: Headers de seguridad (a agregar)
- **Sanitización**: Joi validation en todas las entradas
- **JWT**: Access 7d, Refresh 30d, rotación en refresh
- **Passwords**: bcrypt 12 rounds
- **Env**: `.env.example` documentado, secrets nunca en repo

## Escalabilidad Considerada

- **Stateless**: JWT sin sesión en servidor
- **DB Indexes**: En foreign keys y campos de query frecuentes
- **Pagination**: Cursor/offset en todas las listas
- **Caching**: React Query/SWR planeado para server state
- **CDN**: Cloudinary para imágenes
- **Jobs**: Cron separados para reminders, point expiration

## Deployment (Planeado)

- **Backend**: PM2 + Nginx reverse proxy (VPS/Cloud)
- **Frontend**: Build estático → Nginx/Netlify/Vercel
- **DB**: MySQL managed (RDS/CloudSQL/PlanetScale)
- **SSL**: Let's Encrypt / Cloudflare
- **Monitoring**: Logs estructurados + health check endpoint