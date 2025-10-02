# Deployment Guide

Production deployment guide for the Stripe Integration Boilerplate.

## Pre-Deployment Checklist

- [ ] Update environment variables with live Stripe keys
- [ ] Configure production database
- [ ] Set up webhook endpoint in Stripe
- [ ] Enable HTTPS/SSL
- [ ] Configure monitoring and logging
- [ ] Set up error tracking
- [ ] Test payment flows thoroughly
- [ ] Review security settings

## Platform-Specific Guides

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Configure environment variables
- Deploy!

3. **Environment Variables**
Add these in Vercel dashboard:
```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
DATABASE_URL=postgresql://xxx
```

4. **Configure Webhooks**
- Get your deployment URL from Vercel
- Add webhook endpoint in Stripe: `https://yourdomain.com/api/webhooks/stripe`

### Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login and Initialize**
```bash
railway login
railway init
```

3. **Set Environment Variables**
```bash
railway variables set STRIPE_SECRET_KEY=sk_live_xxx
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
railway variables set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

4. **Deploy**
```bash
railway up
```

### Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

2. **Build and Run**
```bash
docker build -t stripe-integration .
docker run -p 3000:3000 --env-file .env stripe-integration
```

## Database Migration

### PostgreSQL (Production)

```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

## Webhook Configuration

1. **Get Production URL**
Your production URL will be something like:
- Vercel: `https://your-app.vercel.app`
- Railway: `https://your-app.up.railway.app`
- Custom domain: `https://yourdomain.com`

2. **Configure in Stripe Dashboard**
- Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- Click "Add endpoint"
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Select events or choose "Receive all events"
- Copy the signing secret
- Add to your production environment variables

3. **Test Webhook**
```bash
stripe trigger payment_intent.succeeded --api-key sk_live_xxx
```

## Security Configuration

### Environment Variables

Never commit these to version control:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL`

### Rate Limiting

Adjust for production traffic:
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### HTTPS

Ensure all traffic uses HTTPS:
- Vercel/Railway handle this automatically
- For custom deployments, use Let's Encrypt or Cloudflare

## Monitoring

### Error Tracking

Integrate Sentry:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Logging

Set up structured logging:

```env
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

### Uptime Monitoring

Use services like:
- **UptimeRobot** - Free uptime monitoring
- **Pingdom** - Advanced monitoring
- **Better Uptime** - Status pages

## Backup Strategy

### Database Backups

#### PostgreSQL
```bash
# Daily backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Automated backups
# Set up cron job or use managed database backups
```

#### Stripe Data
Stripe maintains all transaction data. Access via:
- Dashboard: https://dashboard.stripe.com
- API: Regular exports
- Webhook events: Stored in your database

## Performance Optimization

### Caching

Add Redis for caching:
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)
```

### CDN

Use CDN for static assets:
- Vercel Edge Network (automatic)
- Cloudflare
- AWS CloudFront

## Scaling

### Horizontal Scaling

Configure auto-scaling:
- Vercel: Automatic
- Railway: Configure in dashboard
- Custom: Use load balancer

### Database Connection Pooling

Use PgBouncer or similar:
```env
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
```

## Rollback Strategy

### Git-based Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific version
git reset --hard <commit-hash>
git push origin main --force
```

### Database Rollback

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

## Health Checks

Add health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database
  await prisma.$queryRaw`SELECT 1`
  
  // Check Stripe
  await stripe.accounts.retrieve()
  
  return Response.json({ status: 'ok' })
}
```

## Troubleshooting Production

### Payment Failures

1. Check Stripe Dashboard logs
2. Review application logs
3. Verify webhook deliveries
4. Test with live cards

### Webhook Issues

1. Verify webhook secret
2. Check endpoint URL
3. Review delivery attempts in Stripe
4. Test signature verification

### Database Issues

1. Check connection string
2. Verify migrations are applied
3. Monitor connection pool
4. Review query performance
