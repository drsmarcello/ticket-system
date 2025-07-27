# Production Security Checklist für sensible Daten

## 🔴 KRITISCH - Unbedingt implementieren:

### 1. **Automatisierte Backups** DONE
```bash
#!/bin/bash
# backup.sh - Täglich per Cron ausführen
BACKUP_DIR="/opt/Bachelor/ticket-system/.backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Datenbank Backup
docker exec ticket-postgres-prod pg_dump -U postgresuser postgres > $BACKUP_DIR/db_$DATE.sql

# Verschlüsseln
gpg --encrypt --recipient info@ricello.de $BACKUP_DIR/db_$DATE.sql
rm $BACKUP_DIR/db_$DATE.sql

# Alte Backups löschen (30 Tage)
find $BACKUP_DIR -name "*.gpg" -mtime +30 -delete
```

### 2. **Monitoring & Alerting** Selber coden mal

### 3. **Rate Limiting verstärken** DONE
```javascript
// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 5, // 5 Versuche
  message: 'Zu viele Login-Versuche',
  standardHeaders: true,
  legacyHeaders: false,
});

// In app.ts
app.use('/graphql', loginLimiter);
```

### 4. **Session Security**
```javascript
// JWT mit kürzerer Laufzeit
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '8h' } // Statt 24h oder länger
);

// Refresh Token implementieren
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

### 5. **Audit Logging**
```typescript
// backend/src/utils/auditLog.ts
export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  details?: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      details: JSON.stringify(details),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    }
  });
}
```

## 🟡 EMPFOHLEN - Sollte implementiert werden:

### 6. **Zwei-Faktor-Authentifizierung (2FA)**
```bash
npm install speakeasy qrcode
```

### 7. **Verschlüsselung sensibler Felder**
```typescript
// Für sehr sensible Daten
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // ... Verschlüsselungslogik
}
```

### 8. **Security Updates**
```bash
# Wöchentliches Update-Script
#!/bin/bash
docker pull postgres:15-alpine
docker pull node:18-alpine
npm audit fix
docker-compose build --no-cache
docker-compose up -d
```

### 9. **Firewall Regeln**
```bash
# UFW Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw enable
```

### 10. **Environment Secrets Management**
```bash
# Verwende Docker Secrets statt .env
docker secret create jwt_secret ./jwt_secret.txt
docker secret create db_password ./db_password.txt
```

## 🟢 NICE TO HAVE:

### 11. **WAF (Web Application Firewall)**
- Cloudflare (kostenlos für Basic)
- Oder ModSecurity in Nginx

### 12. **Penetration Testing**
- Jährlich von externem Dienstleister
- Oder Bug Bounty Programm

### 13. **Compliance**
- DSGVO-konform machen (Datenlöschung, Export)
- Verschlüsselung at rest für Datenbank

## Minimale Sofortmaßnahmen:

```bash
# 1. Backup-Script einrichten
mkdir -p /opt/backups/ticket-system
crontab -e
# Hinzufügen: 0 2 * * * /opt/backup.sh

# 2. Fail2ban installieren
apt-get install fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban

# 3. Monitoring
docker run -d --name=netdata \
  -p 19999:19999 \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  --cap-add SYS_PTRACE \
  netdata/netdata
```

## Fazit:

**Für normale Geschäftsdaten:** Ja, es ist sicher genug ✅

**Für hochsensible Daten (Gesundheit, Finanzen, etc.):** Implementiere mindestens Punkte 1-5 ⚠️

**Für regulierte Industrien:** Alle Punkte + externe Security Audits 🔴


Dashboard etc auf subscriptions oder mit websocket evtl? also real time updates