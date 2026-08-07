# API Documentation - Salón de Belleza

**Base URL**: `http://localhost:3000/api`  
**Content-Type**: `application/json`  
**Auth**: `Authorization: Bearer <accessToken>`

---

## Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro usuario |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Usuario actual |
| PUT | `/auth/me` | Actualizar perfil |
| POST | `/auth/change-password` | Cambiar contraseña |
| POST | `/auth/forgot-password` | Solicitar reset |
| POST | `/auth/reset-password` | Reset con token |
| POST | `/auth/verify-email` | Verificar email |
| POST | `/auth/resend-verification` | Reenviar verificación |

### Register
```json
POST /auth/register
{
  "name": "María González",
  "email": "maria@email.com",
  "password": "123456",
  "phone": "+573101234567",
  "dateOfBirth": "1990-05-15",
  "gender": "female"
}
```

### Login
```json
POST /auth/login
{
  "email": "maria@email.com",
  "password": "123456"
}
```

---

## Usuarios (Admin)

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/users` | admin |
| GET | `/users/:id` | admin |
| PUT | `/users/:id` | admin |
| DELETE | `/users/:id` | admin |
| GET | `/users/:id/appointments` | admin, professional |
| GET | `/users/:id/payments` | admin |
| GET | `/users/:id/loyalty` | admin, client |

---

## Servicios

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/services` | public |
| GET | `/services/categories` | public |
| GET | `/services/:id` | public |
| POST | `/services` | admin |
| PUT | `/services/:id` | admin |
| DELETE | `/services/:id` | admin |
| POST | `/services/:id/professionals` | admin |
| DELETE | `/services/:id/professionals/:professionalId` | admin |

### Query Params (GET /services)
- `page`, `limit`, `sortBy`, `sortOrder`
- `category`: nails, hair, eyelashes, other
- `isActive`, `isPopular`
- `search`

---

## Sedes

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/branches` | public |
| GET | `/branches/admin` | admin |
| GET | `/branches/:id` | public |
| POST | `/branches` | admin |
| PUT | `/branches/:id` | admin |
| DELETE | `/branches/:id` | admin |
| POST | `/branches/:id/professionals` | admin |
| DELETE | `/branches/:id/professionals/:professionalId` | admin |

---

## Profesionales

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/professionals` | public |
| GET | `/professionals/admin` | admin |
| GET | `/professionals/:id` | public |
| POST | `/professionals` | admin |
| PUT | `/professionals/:id` | admin |
| DELETE | `/professionals/:id` | admin |
| POST | `/professionals/:id/services` | admin |
| DELETE | `/professionals/:id/services/:serviceId` | admin |
| POST | `/professionals/:id/branches` | admin |
| DELETE | `/professionals/:id/branches/:branchId` | admin |

---

## Disponibilidad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/availability/slots` | Slots para pro + servicio + sede + fecha |
| GET | `/availability/professionals` | Profesionales disponibles para servicio + sede + fecha |
| GET | `/availability/branch/:branchId` | Todos los servicios/pros de una sede en fecha |
| GET | `/availability/calendar` | Vista calendario rango de fechas |

### Parámetros Comunes
```
serviceId, professionalId, branchId, date (YYYY-MM-DD)
```

### Response Slots
```json
{
  "date": "2024-01-15",
  "slots": [
    { "time": "09:00", "endTime": "10:00", "available": true, "duration": 60 },
    { "time": "09:15", "endTime": "10:15", "available": false, "duration": 60 }
  ]
}
```

---

## Citas

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/appointments` | client (own), pro (own), admin |
| GET | `/appointments/upcoming` | client, pro |
| GET | `/appointments/:id` | owner |
| POST | `/appointments` | client |
| PUT | `/appointments/:id` | admin, pro |
| POST | `/appointments/:id/reschedule` | client, pro |
| POST | `/appointments/:id/cancel` | client, pro |
| POST | `/appointments/:id/confirm` | admin, pro |
| POST | `/appointments/:id/complete` | admin, pro |
| POST | `/appointments/:id/no-show` | admin, pro |

### Crear Cita
```json
POST /appointments
{
  "serviceId": 5,
  "professionalId": 1,
  "branchId": 1,
  "date": "2024-01-20",
  "startTime": "10:00",
  "couponCode": "BIENVENIDA20",
  "notes": "Preferencia tonos nude"
}
```

---

## Pagos

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/payments` | admin |
| GET | `/payments/:id` | owner |
| POST | `/payments` | admin, pro |
| POST | `/payments/:id/refund` | admin |
| POST | `/payments/mercadopago/webhook` | public (MP) |

### Crear Pago Manual
```json
POST /payments
{
  "appointmentId": 1,
  "amount": 15000,
  "type": "deposit",
  "method": "cash",
  "reference": "EFECTIVO-001"
}
```

---

## Promociones

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/promotions` | public (activas) |
| GET | `/promotions/admin` | admin |
| GET | `/promotions/validate` | public |
| GET | `/promotions/:id` | admin |
| POST | `/promotions` | admin |
| PUT | `/promotions/:id` | admin |
| DELETE | `/promotions/:id` | admin |
| GET | `/promotions/:id/usages` | admin |

### Validar Cupón
```
GET /promotions/validate?code=BIENVENIDA20&serviceId=5&professionalId=1&branchId=1&clientId=2&amount=45000
```

---

## Fidelización

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/loyalty/program` | public |
| GET | `/loyalty/my-points` | client |
| GET | `/loyalty/transactions` | client |
| POST | `/loyalty/redeem` | client |
| POST | `/loyalty/admin/adjust` | admin |
| GET | `/loyalty/admin/transactions` | admin |
| PUT | `/loyalty/admin/program` | admin |

### Canjear Puntos
```json
POST /loyalty/redeem
{
  "pointsToRedeem": 1000,
  "appointmentId": 5
}
```

---

## Galería

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/gallery` | public |
| GET | `/gallery/admin` | admin |
| GET | `/gallery/categories/list` | public |
| GET | `/gallery/:id` | public |
| POST | `/gallery` | admin |
| PUT | `/gallery/:id` | admin |
| DELETE | `/gallery/:id` | admin |

---

## Reseñas

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/reviews` | public |
| GET | `/reviews/professional/:professionalId/stats` | public |
| GET | `/reviews/:id` | public |
| POST | `/reviews` | client |
| PUT | `/reviews/:id` | admin |
| POST | `/reviews/:id/respond` | admin, pro |
| DELETE | `/reviews/:id` | admin |

### Crear Reseña
```json
POST /reviews
{
  "appointmentId": 5,
  "rating": 5,
  "comment": "Excelente servicio",
  "images": ["https://..."]
}
```

---

## Horarios (Schedule Blocks)

| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/schedule` | pro (own), admin |
| GET | `/schedule/professional/:professionalId` | pro, admin |
| GET | `/schedule/:id` | owner |
| POST | `/schedule` | pro, admin |
| PUT | `/schedule/:id` | pro, admin |
| DELETE | `/schedule/:id` | pro, admin |

---

## Webhooks

| Método | Endpoint | Fuente |
|--------|----------|--------|
| POST | `/webhooks/cron/reminders` | Cron job (2h antes) |
| POST | `/webhooks/cron/expire-points` | Cron job (mensual) |
| POST | `/webhooks/mercadopago` | Mercado Pago |
| POST | `/webhooks/twilio/status` | Twilio |
| POST | `/webhooks/email/bounce` | Email provider |

---

## Códigos de Error

| Código | HTTP | Descripción |
|--------|------|-------------|
| VALIDATION_ERROR | 400 | Datos inválidos (detalle en `errors`) |
| AUTHENTICATION_ERROR | 401 | Token faltante/inválido/expirado |
| AUTHORIZATION_ERROR | 403 | Sin permisos |
| NOT_FOUND | 404 | Recurso no existe |
| CONFLICT_ERROR | 409 | Duplicado / conflicto negocio |
| RATE_LIMIT_EXCEEDED | 429 | Demasiadas requests |
| INTERNAL_ERROR | 500 | Error servidor |

---

## Paginação

```
GET /resource?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```