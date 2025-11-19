# FinTrader - Quick Start Guide

## 🚀 Deploy to Vercel in 5 Minutes

### 1️⃣ Click Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kevinnguyen271090/SEO)

### 2️⃣ Configure Environment Variables

**Required:**
```
DATABASE_URL = postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET = [run: openssl rand -base64 32]
NEXTAUTH_URL = https://your-app.vercel.app
```

### 3️⃣ Setup Database

**Option A: Vercel Postgres (Easiest)**
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection string automatically
3. Done! ✅

**Option B: Supabase (Free Forever)**
1. Visit https://supabase.com
2. Create new project
3. Copy Postgres connection from Settings → Database
4. Paste as DATABASE_URL

### 4️⃣ Deploy!

Click "Deploy" và đợi ~2 phút.

---

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open http://localhost:3000

---

## 🔑 Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 📊 Default Features (MVP)

✅ Dashboard với AI signals
✅ Paper trading portfolio
✅ Backtesting engine
✅ TradingView charts
✅ Real-time notifications
✅ Authentication system

---

## 🎯 Demo Account

For testing (no signup required):
- Email: `demo@fintrader.com`
- Password: `demo123`

---

## 📱 Pages

- `/` - Home (redirects to dashboard)
- `/dashboard` - Main dashboard
- `/portfolio` - Paper trading
- `/backtest` - Strategy testing
- `/signals/AAPL` - Signal analysis

---

## 🔧 API Endpoints

- `GET /api/signals` - Trading signals
- `GET /api/market-data` - Stock quotes
- `POST /api/portfolio` - Execute trades
- `POST /api/backtest` - Run backtest
- `GET /api/alerts` - Notifications

---

## 💰 Cost Breakdown

**Vercel Free Tier:**
- ✅ Hosting: FREE
- ✅ SSL: FREE
- ✅ Bandwidth: 100GB/month FREE

**Vercel Postgres:**
- FREE tier: 256MB storage
- OR Supabase: FREE 500MB

**Total: $0/month** 🎉

---

## 🐛 Troubleshooting

**Build fails?**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**Database error?**
```bash
# Regenerate Prisma client
npx prisma generate
npx prisma db push
```

**Auth not working?**
- Check NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Regenerate secret: `openssl rand -base64 32`

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.

---

## 🆘 Support

Need help? Check:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
2. GitHub Issues
3. Vercel Documentation

---

**Built with Next.js 14 + TypeScript + Prisma + TradingView Charts**
