# Deployment Guide - Salón de Belleza

## Requisitos Previos

- Node.js 18+
- MySQL 8.0
- Cuenta Cloudinary
- Cuenta Mercado Pago (producción)
- Cuenta Twilio (WhatsOps)
- SMTP para emails (Gmail, SendGrid, etc.)
- Dominio + SSL

---

## Variables de Entorno

### Backend (.env)
```bash
# Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://tusalon.com

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salon_belleza
DB_USER=salon_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=super_secure_random_string_64_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another_secure_random_string_64_chars
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password
EMAIL_FROM="Salón de Belleza <noreply@tusalon.com>"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=whsec_xxx

# Mapas
MAPBOX_ACCESS_TOKEN=pk.xxx
# GOOGLE_MAPS_API_KEY=AIza...

# Seguridad
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cron
CRON_SECRET=internal_cron_secret
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://api.tusalon.com/api
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
VITE_MAPBOX_TOKEN=pk.xxx
```

---

## Desarrollo Local

```bash
# 1. Clonar y configurar
git clone <repo>
cd salon-belleza

# 2. Backend
cd backend
cp .env.example .env
# Editar .env con credenciales locales
npm install
npm run db:sync
npm run db:seed
npm run dev  # Puerto 3000

# 3. Frontend (otra terminal)
cd frontend
npm install
npm run dev  # Puerto 5173
```

### MySQL Local (Docker)
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

---

## Producción

### 1. Build Frontend
```bash
cd frontend
npm run build
# Output en frontend/dist/
```

### 2. Backend con PM2
```bash
cd backend
npm install --production

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'salon-api',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Config
```nginx
# Frontend
server {
    listen 80;
    server_name tusalon.com www.tusalon.com;
    root /var/www/salon-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SSL (Let's Encrypt)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/tusalon.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tusalon.com/privkey.pem;
}
```

### 4. SSL con Certbot
```bash
sudo certbot --nginx -d tusalon.com -d www.tusalon.com
```

### 5. Base de Datos Producción
- Usar MySQL managed (AWS RDS, Google Cloud SQL, PlanetScale, Railway)
- Configurar backups automáticos
- Read replicas para escalar lecturas

---

## Variables Críticas por Ambiente

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| NODE_ENV | development | staging | production |
| JWT_SECRET | dev_secret | staging_secret | **PROD_SECRET_64_CHARS** |
| DB_HOST | localhost | staging-db | prod-db.xxx.rds.amazonaws.com |
| FRONTEND_URL | http://localhost:5173 | https://staging.tusalon.com | https://tusalon.com |
| MERCADOPAGO_* | TEST credentials | TEST credentials | **LIVE credentials** |

---

## Health Checks

```bash
# Backend
curl https://api.tusalon.com/api/health

# Frontend
curl -I https://tusalon.com
```

Response esperado:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Monitoreo y Logs

### PM2 Logs
```bash
pm2 logs salon-api --lines 100
pm2 monit
```

### Logs Estructurados (Winston - a implementar)
```javascript
// logger.js
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

---

## Backup Strategy

### Base de Datos
```bash
# Daily backup (cron 0 2 * * *)
mysqldump -u backup_user -p salon_belleza | gzip > /backups/salon_$(date +%F).sql.gz

# Retención: 30 días
find /backups -name "salon_*.sql.gz" -mtime +30 -delete
```

### Archivos (Cloudinary)
- Configurar backup automático en Cloudinary dashboard
- Versionado de uploads

---

## CI/CD Pipeline (GitHub Actions - Planeado)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: '18' }
      - name: Install & Test Backend
        run: |
          cd backend && npm ci && npm run lint && npm run test
      - name: Install & Test Frontend
        run: |
          cd frontend && npm ci && npm run lint && npm run test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/salon-belleza
            git pull origin main
            cd backend && npm ci --production && pm2 reload salon-api
            cd frontend && npm ci && npm run build
```

---

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en servidor
- [ ] Base de datos migrada (`npm run db:sync` o migraciones)
- [ ] SSL certificado válido
- [ ] Webhooks configurados (MP, Twilio)
- [ ] CORS permite dominio producción
- [ ] Rate limiting configurado con Redis (producción)
- [ ] Logs rotados (logrotate)
- [ ] Backups programados
- [ ] Health check responde OK
- [ ] Tests de humo pasan (login, reserva, pago)

---

## Rollback

```bash
# Backend
pm2 stop salon-api
git checkout <previous-tag>
npm ci --production
pm2 start ecosystem.config.js

# Frontend
# Servir build anterior desde Nginx o redeploy build anterior
```