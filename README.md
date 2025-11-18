# FinTrader - AI-Powered Trading Platform 📈

A modern, full-stack financial trading platform with AI-powered signal generation, backtesting, and portfolio management capabilities.

## 🎯 Vision

FinTrader is building the ultimate financial toolkit for traders and CFOs:

- **Phase 1 (2024-2025)**: Trading Platform for Traders - AI signals, backtesting, paper trading
- **Phase 2 (2025-2026)**: Advanced Trading Tools - Bond analysis, advisor integration
- **Phase 3 (2026-2027)**: CFO Tools - Cash flow management, financial forecasting
- **Phase 4 (2027+)**: Full Financial Suite - M&A tools, treasury management

## ✨ Current Features (MVP - Phase 1)

### 🤖 AI Signal Generator
- Automatic analysis of 50+ stocks (VN30 + S&P 500)
- Real-time BUY/SELL/HOLD signals based on:
  - Technical indicators (RSI, MACD, Bollinger Bands)
  - Price action patterns
  - Volume analysis
- Signal confidence scoring (60-95%)
- Push alerts via Telegram/Email

### 📊 Smart Backtesting Engine
- One-click strategy backtesting
- Performance metrics: Win Rate, Profit Factor, Max Drawdown
- Compare strategy vs market benchmark
- Export results as PDF reports

### 💼 Paper Trading
- Virtual portfolio with $100,000 starting balance
- Risk-free signal testing
- Leaderboard with other traders
- Trading journal for notes

### 📈 Dashboard Analytics
- Real-time P&L tracking
- Market sector heatmap
- Risk meter for portfolio
- AI-generated daily reports

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn/ui + Radix UI
- **Charts**: Lightweight Charts (TradingView)
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (free tier)

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **APIs**: Yahoo Finance (free), Alpha Vantage (free tier)

### AI/Analytics
- **Indicators**: Custom TypeScript implementation
- **ML**: Scikit-learn (Python microservice - coming soon)
- **AI Analysis**: Claude API (optional)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd SEO
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env and add your API keys (optional for basic features)
```

4. Initialize database
```bash
npx prisma generate
npx prisma db push
```

5. Start development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
fintech-trading-platform/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── dashboard/           # Main dashboard
│   ├── signals/             # Signal pages
│   ├── backtest/            # Backtesting interface
│   ├── portfolio/           # Portfolio management
│   └── api/                 # API routes
│       ├── signals/         # Signal generation API
│       ├── backtest/        # Backtesting API
│       └── market-data/     # Market data proxy
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── charts/              # Chart components
│   ├── signals/             # Signal-related components
│   ├── analytics/           # Analytics widgets
│   └── layout/              # Layout components
├── lib/                     # Utility libraries
│   ├── api/                 # API clients
│   ├── indicators/          # Technical indicators
│   ├── ai/                  # AI integration
│   ├── db/                  # Database client
│   └── utils/               # Helper functions
├── prisma/                  # Database schema
│   └── schema.prisma
└── public/                  # Static assets
```

## 🎨 Features Showcase

### Dashboard
- **Portfolio Summary**: Real-time balance, P&L, open positions, win rate
- **Live Signals Feed**: AI-generated signals with confidence scores
- **Market Heatmap**: Visual sector performance analysis
- **Quick Actions**: Fast access to backtesting, trading, settings

### Signal Cards
Each signal includes:
- Symbol and signal type (BUY/SELL)
- Confidence score (0-100%)
- Entry price, target price, stop loss
- Technical indicator values (RSI, MACD, etc.)
- AI-generated reasoning
- One-click trade execution

### Technical Indicators
Implemented indicators:
- ✅ SMA (Simple Moving Average)
- ✅ EMA (Exponential Moving Average)
- ✅ RSI (Relative Strength Index)
- ✅ MACD (Moving Average Convergence Divergence)
- ✅ Bollinger Bands
- ✅ ATR (Average True Range)

## 🔌 API Endpoints

### Signals API
```
GET /api/signals?symbols=AAPL,TSLA,NVDA
```
Returns AI-generated trading signals for specified symbols.

### Market Data API
```
GET /api/market-data?symbol=AAPL
GET /api/market-data?symbols=AAPL,TSLA
GET /api/market-data?action=trending
GET /api/market-data?action=status
```

## 🗄 Database Schema

- **Users**: Authentication and preferences
- **Portfolios**: Paper/live trading portfolios
- **Signals**: AI-generated trading signals
- **Trades**: Executed trades with P&L
- **Backtests**: Strategy testing results
- **Alerts**: User notifications
- **MarketData**: Cached market data

## 🎯 Roadmap

### Phase 1 - MVP (Current) ✅
- [x] Project structure setup
- [x] Database schema
- [x] Technical indicators library
- [x] AI signal generator
- [x] Dashboard UI with dark mode
- [ ] Backtesting engine (in progress)
- [ ] Paper trading system
- [ ] Telegram/Email alerts
- [ ] User authentication

### Phase 2 - Enhanced Features (Q2 2025)
- [ ] Real-time WebSocket updates
- [ ] Advanced charting with TradingView
- [ ] Portfolio optimization algorithms
- [ ] Risk management tools
- [ ] Social trading features
- [ ] Mobile app (React Native)

### Phase 3 - CFO Tools (2026)
- [ ] Cash flow forecasting
- [ ] Financial statement analysis
- [ ] Unit economics calculator
- [ ] ERP system integration

## 🤝 Contributing

This is currently a private project. For questions or suggestions, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- Market data provided by Yahoo Finance API
- UI components from Shadcn/ui
- Charts powered by TradingView Lightweight Charts

---

**Note**: This is an MVP in active development. Features and APIs are subject to change.

Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.
