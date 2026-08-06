# Reglas Permanentes del Proyecto - Salón de Belleza

## Estructura y Organización

### Repositorio y Carpetas
- **Un repositorio Git por proyecto** (monorepo: backend + frontend)
- **Carpetas separadas**: `/backend` y `/frontend` en la raíz
- **Documentación en `/docs`**: PROJECT_STATUS.md, ARCHITECTURE.md, API_DOCS.md, DEPLOYMENT.md

### Commits y Flujo de Trabajo
- **Commit antes de cambios importantes** (nueva feature, refactor, fix crítico)
- **Mensajes de commit convencionales**: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- **Una funcionalidad importante = una sesión de trabajo**
- **Revisar y probar antes de commit** (lint, typecheck, tests manuales)
- **Al terminar cada sesión**: actualizar `docs/PROJECT_STATUS.md` y hacer commit

### Planificación
- **Primero planear → después implementar**
- **Trabajo por módulos**: completar y validar uno antes de pasar al siguiente
- **No avanzar a otro módulo hasta comprobar que el actual funciona**

## Estándares de Código

### Backend (Node.js/Express/Sequelize)
- **Arquitectura modular**: controllers, routes, models, services, middlewares, validators, utils, config
- **Separación de responsabilidades**: controladores delgados, lógica en services
- **Validación dual**: frontend + backend (nunca confiar solo en frontend)
- **Manejo de errores centralizado** con clases personalizadas
- **Variables de entorno obligatorias** (`.env.example` documentado)
- **Seguridad**: rate limiting, CORS, helmet, sanitización, JWT con refresh tokens
- **Base de datos**: migraciones via Sequelize sync, seeds para desarrollo

### Frontend (React/Vite/Tailwind)
- **Componentes pequeños y reutilizables** (máx 200 líneas)
- **Custom hooks para lógica de negocio**
- **Context API para estado global** (Auth, Cart, UI)
- **React Query / SWR para server state** (cuando se implemente)
- **Formularios con React Hook Form + Yup/Zod**
- **Responsive mobile-first** (breakpoints: sm, md, lg, xl)
- **Diseño system consistente** (colores, tipografía, spacing, shadows)
- **Accesibilidad**: labels, aria-*, focus states, contraste

### UX/UI
- **Diseño que transmita belleza, elegancia y profesionalismo**
- **Paleta**: primary (rosa/magenta), secondary (púrpura), accent (naranja)
- **Tipografía**: Inter (UI) + Playfair Display (headings)
- **Animaciones sutiles** con Framer Motion (micro-interacciones)
- **Estados**: loading, empty, error, success en todos los componentes
- **Feedback visual** inmediato (toast, skeletons, progress)

## Módulos del Proyecto (Orden de Implementación)

### Fase 1: Fundación (Backend + Frontend Base)
1. **Auth & Usuarios** - Registro, login, JWT, roles, perfil
2. **Servicios** - CRUD, categorías, precios, duración
3. **Sedes** - CRUD, horarios, ubicación, mapas
4. **Profesionales** - Perfil, servicios, sedes, horarios

### Fase 2: Core Business
5. **Disponibilidad en Tiempo Real** - Algoritmo de slots, bloqueos, breaks
6. **Reservas (Booking Flow)** - 6 pasos: Sede → Servicio → Pro → Fecha → Hora → Pago
7. **Pagos y Abonos** - Mercado Pago (CO), efectivo, Nequi, Daviplata, depósitos
8. **Estados de Cita** - pending → confirmed → in_progress → completed/cancelled/no_show

### Fase 3: Fidelización y Marketing
9. **Promociones y Cupones** - % descuento, monto fijo, primera visita, referidos
10. **Programa de Fidelización** - Puntos, tiers (bronze→platinum), beneficios, canje
11. **Recordatorios Automáticos** - Email + WhatsApp (2h antes, 24h antes)

### Fase 4: Áreas Privadas
12. **Área de Clienta** - Dashboard, historial, próximas citas, perfil, puntos
13. **Panel Profesional** - Agenda, mis citas, bloqueos, estadísticas
14. **Panel Admin** - Dashboard, gestión completa, reportes, usuarios

### Fase 5: Extras y Pulido
15. **Galería** - Filtros, lightbox, tags, destacados
16. **Reseñas** - Post-cita, moderación, respuesta pro
17. **Notificaciones** - In-app, push, email, WhatsApp
18. **Testing, Performance, SEO, Deployment**

## Servicios Externos (Configurar cuando se necesiten)
- **Cloudinary**: imágenes (servicios, profesionales, galería, sedes)
- **Mapbox/Google Maps**: ubicación sedes, direcciones
- **Mercado Pago**: pagos online Colombia
- **Twilio WhatsApp**: notificaciones, recordatorios
- **Nodemailer/SendGrid**: emails transaccionales
- **Node-cron**: jobs automáticos (recordatorios, expiración puntos)

## Definición de "Hecho" (Definition of Done)
- [ ] Código implementado y modularizado
- [ ] Validaciones frontend + backend
- [ ] Manejo de errores y edge cases
- [ ] Estados de carga, vacío, error
- [ ] Responsive verificado (mobile, tablet, desktop)
- [ ] Pruebas manuales del flujo completo
- [ ] Documentación actualizada (PROJECT_STATUS.md)
- [ ] Commit realizado
- [ ] Lint/Typecheck pasan

## Comandos Útiles
```bash
# Backend
cd backend && npm run dev          # Desarrollo
cd backend && npm run db:sync      # Sincronizar BD
cd backend && npm run db:seed      # Datos de prueba

# Frontend
cd frontend && npm run dev         # Desarrollo
cd frontend && npm run build       # Build producción
cd frontend && npm run lint        # Linting
```

## Contacto y Decisiones
- **Arquitecto/Lead**: Decisiones técnicas finales
- **Issues**: Documentar en GitHub Issues antes de implementar features grandes
- **Code Review**: Requerido para merges a main