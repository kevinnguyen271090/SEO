# FinTrader Deployment Guide - Vercel

## 🚀 Quick Deploy to Vercel

### Bước 1: Chuẩn bị Database (Production)

**Option A: PostgreSQL trên Vercel (Recommended)**
```bash
# Vercel cung cấp free Postgres database
# Sau khi tạo project, vào Dashboard -> Storage -> Create Database -> Postgres
```

**Option B: Supabase (Free tier tốt)**
1. Đăng ký tại https://supabase.com
2. Tạo project mới
3. Copy connection string từ Settings -> Database

### Bước 2: Update Prisma Schema cho Production

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Đổi từ sqlite sang postgresql
  url      = env("DATABASE_URL")
}
```

### Bước 3: Tạo file `.env.production`

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long-here"
NEXTAUTH_URL="https://your-app-name.vercel.app"

# API Keys (Optional cho MVP)
ALPHA_VANTAGE_API_KEY="your-key-here"
TIINGO_API_KEY="your-key-here"

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN="your-bot-token"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## 📦 Deploy Steps

### 1. Push code lên GitHub (Already done ✅)
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Deploy lên Vercel

#### Method 1: Vercel CLI (Fastest)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Method 2: Vercel Dashboard (Easiest)
1. Truy cập https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   - **Install Command**: `npm install`

### 3. Configure Environment Variables

Trong Vercel Dashboard -> Settings -> Environment Variables, thêm:

```
DATABASE_URL              = postgresql://...
NEXTAUTH_SECRET          = generate-using-openssl-rand-base64-32
NEXTAUTH_URL             = https://your-app.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to production database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

## 🔐 Environment Variables - Complete List

### Required (Minimum để chạy)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="min-32-chars-secret"
NEXTAUTH_URL="https://your-app.vercel.app"
```

### Optional (Enhance features)
```env
# Market Data APIs
ALPHA_VANTAGE_API_KEY="free-tier-key"
TIINGO_API_KEY="free-tier-key"

# Notifications
TELEGRAM_BOT_TOKEN="your-bot-token"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# AI Analysis (Future)
ANTHROPIC_API_KEY="your-claude-api-key"
```

## 📊 Vercel Project Settings

### Build & Development Settings
```
Build Command:        npm run build
Output Directory:     .next
Install Command:      npm install
Development Command:  npm run dev
```

### Root Directory
```
./
```

### Node.js Version
```
18.x (or latest)
```

## 🗄️ Database Migration Steps

### From SQLite to PostgreSQL

1. **Backup current data** (if needed)
```bash
npx prisma db pull
```

2. **Update schema**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Generate new client**
```bash
npx prisma generate
```

4. **Push to production DB**
```bash
npx prisma db push
```

## 🔧 Troubleshooting

### Build Error: "Prisma Client not found"
```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

### Database Connection Error
```bash
# Check DATABASE_URL format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# Make sure to enable SSL
```

### NextAuth Error: "No secret provided"
```bash
# Generate new secret
openssl rand -base64 32

# Add to Vercel environment variables
```

## 🎯 Post-Deployment Checklist

- [ ] Verify DATABASE_URL connection
- [ ] Test authentication flow (login/signup)
- [ ] Check API endpoints (/api/signals, /api/portfolio)
- [ ] Test paper trading execution
- [ ] Verify charts rendering
- [ ] Check notifications working
- [ ] Test backtesting engine
- [ ] Mobile responsive check

## 📱 Custom Domain (Optional)

1. Vercel Dashboard -> Settings -> Domains
2. Add your domain: `fintrader.com`
3. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Update NEXTAUTH_URL to custom domain

## 🚀 Continuous Deployment

Vercel tự động deploy khi:
- Push to `main` branch → Production
- Push to feature branches → Preview deployments
- Pull requests → Preview URLs

## 💡 Free Tier Limits (Vercel)

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (10s timeout)
- ✅ Custom domains
- ✅ SSL certificates

## 🔒 Security Best Practices

1. **Never commit `.env` files**
```bash
# Already in .gitignore
.env
.env*.local
```

2. **Use strong secrets**
```bash
# Generate strong NEXTAUTH_SECRET
openssl rand -base64 32
```

3. **Enable CORS protection**
```typescript
// Add to next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' }
      ]
    }
  ]
}
```

## 📈 Performance Optimization

Already configured:
- ✅ Static optimization
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading

## 🎉 Deploy Command Summary

```bash
# Quick deploy
vercel

# Production deploy
vercel --prod

# With environment variables
vercel --prod --env DATABASE_URL="postgresql://..." --env NEXTAUTH_SECRET="..."
```

---

## ⚡ Alternative: Railway.app

If you prefer Railway (easier database setup):

1. Visit https://railway.app
2. "New Project" -> "Deploy from GitHub"
3. Select repository
4. Add PostgreSQL service (one-click)
5. Configure environment variables
6. Deploy!

Railway auto-provides DATABASE_URL for you.

---

## 🎯 Recommended Setup for MVP

**Hosting**: Vercel (Frontend + API)
**Database**: Supabase (Free 500MB)
**Domain**: Vercel subdomain (free) or custom ($12/year)

**Total Cost**: $0/month for MVP! 🎉

---

Need help with deployment? Ping me in the chat!
