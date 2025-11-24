'use client'

import { Suspense, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/charts/price-chart'
import { IndicatorChart } from '@/components/charts/indicator-chart'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageProps {
  params: {
    symbol: string
  }
}

interface PriceData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketType: string
  currency: string
  formattedPrice?: string
}

export default function SignalDetailPage({ params }: PageProps) {
  const symbol = decodeURIComponent(params.symbol).toUpperCase()
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real price data
  const fetchPrice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/market-data?symbol=${encodeURIComponent(symbol)}`)
      const result = await response.json()

      if (result.success && result.data) {
        setPriceData(result.data)
        setError(null)
      } else {
        setError('Unable to fetch price')
      }
    } catch (err) {
      console.error('Error fetching price:', err)
      setError('Failed to load price data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrice()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrice, 30000)
    return () => clearInterval(interval)
  }, [symbol])

  // Generate signal based on price (mock AI analysis)
  const generateSignal = (price: number) => {
    // Simple mock signal generation based on price
    const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const isBuy = hash % 2 === 0

    const targetMultiplier = isBuy ? 1.08 : 0.92
    const stopMultiplier = isBuy ? 0.965 : 1.035

    return {
      symbol,
      type: isBuy ? 'BUY' : 'SELL',
      confidence: 75 + (hash % 20),
      entryPrice: price,
      targetPrice: price * targetMultiplier,
      stopLoss: price * stopMultiplier,
      reasoning: isBuy
        ? 'Technical indicators suggest bullish momentum. RSI showing oversold conditions with potential for reversal.'
        : 'Technical analysis indicates bearish pressure. Consider taking profits or setting protective stops.',
      indicators: {
        rsi: 30 + (hash % 40),
        macd: ((hash % 100) - 50) / 100,
        signal: ((hash % 80) - 40) / 100,
        volume: 50000000 + (hash % 50000000),
        avgVolume: 45000000,
      },
    }
  }

  const currentPrice = priceData?.price || 0
  const signal = generateSignal(currentPrice)

  const potentialProfit = signal.entryPrice > 0
    ? ((signal.targetPrice - signal.entryPrice) / signal.entryPrice) * 100
    : 0
  const riskReward = signal.entryPrice > 0
    ? Math.abs((signal.targetPrice - signal.entryPrice) / (signal.entryPrice - signal.stopLoss))
    : 0

  // Format price based on market type
  const formatPrice = (price: number) => {
    if (!priceData) return `$${price.toFixed(2)}`

    switch (priceData.marketType) {
      case 'crypto':
        if (price < 0.01) return `$${price.toFixed(6)}`
        if (price < 1) return `$${price.toFixed(4)}`
        return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      case 'forex':
        return price.toFixed(5)
      case 'vn-stock':
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
      default:
        return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{symbol}</h1>
              {priceData?.marketType && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded uppercase",
                  priceData.marketType === 'crypto' ? "bg-orange-500/20 text-orange-600" :
                  priceData.marketType === 'forex' ? "bg-blue-500/20 text-blue-600" :
                  priceData.marketType === 'vn-stock' ? "bg-red-500/20 text-red-600" :
                  "bg-primary/20 text-primary"
                )}>
                  {priceData.marketType === 'vn-stock' ? 'VN' : priceData.marketType}
                </span>
              )}
            </div>
            {loading ? (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading price...
              </p>
            ) : priceData ? (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-semibold">{formatPrice(priceData.price)}</span>
                <span className={cn(
                  "text-sm",
                  priceData.change >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchPrice}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1">{error || 'Price unavailable'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>
                  Real-time chart powered by TradingView
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <PriceChart symbol={symbol} height={400} />
                </Suspense>
              </CardContent>
            </Card>

            {/* Technical Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Suspense fallback={<ChartSkeleton height={150} />}>
                  <IndicatorChart
                    title="RSI (14)"
                    data={generateMockRSIData()}
                    color="#8b5cf6"
                    height={150}
                    thresholds={[
                      { value: 70, color: '#ef4444', label: 'Overbought' },
                      { value: 30, color: '#22c55e', label: 'Oversold' },
                    ]}
                  />
                </Suspense>
                <Suspense fallback={<ChartSkeleton height={150} />}>
                  <IndicatorChart
                    title="MACD (12, 26, 9)"
                    data={generateMockMACDData()}
                    color="#3b82f6"
                    height={150}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Signal Info - 1 column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {signal.type === 'BUY' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  {signal.type} Signal
                </CardTitle>
                <CardDescription>
                  {signal.confidence}% confidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-lg font-semibold">
                      {loading ? '...' : formatPrice(signal.entryPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-lg font-semibold text-green-500">
                      {loading ? '...' : formatPrice(signal.targetPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stop Loss</p>
                    <p className="text-lg font-semibold text-red-500">
                      {loading ? '...' : formatPrice(signal.stopLoss)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Potential</p>
                    <p className="text-lg font-semibold text-primary">
                      {signal.type === 'BUY' ? '+' : ''}{potentialProfit.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Risk/Reward Ratio</p>
                  <p className="text-2xl font-bold">1:{riskReward.toFixed(2)}</p>
                </div>

                <Button className="w-full" size="lg">
                  Execute Trade
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{signal.reasoning}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RSI:</span>
                    <span className="font-medium">{signal.indicators.rsi.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MACD:</span>
                    <span className="font-medium">{signal.indicators.macd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-medium">
                      {((signal.indicators.volume / signal.indicators.avgVolume - 1) * 100).toFixed(0)}%
                      above avg
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {priceData && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-[10px] text-muted-foreground text-center">
                    Data from {priceData.marketType === 'crypto' ? 'CoinGecko' :
                      priceData.marketType === 'forex' ? 'Finnhub' :
                      priceData.marketType === 'vn-stock' ? 'VN Stocks' : 'Yahoo Finance'}
                    • Auto-refresh every 30s
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div
      className="bg-muted animate-pulse rounded-lg"
      style={{ height: `${height}px` }}
    />
  )
}

// Mock data generators
function generateMockRSIData() {
  const data = []
  const now = Date.now() / 1000
  for (let i = 90; i >= 0; i--) {
    data.push({
      time: now - i * 86400,
      value: 50 + Math.sin(i / 10) * 20 + (Math.random() - 0.5) * 10,
    })
  }
  return data
}

function generateMockMACDData() {
  const data = []
  const now = Date.now() / 1000
  for (let i = 90; i >= 0; i--) {
    data.push({
      time: now - i * 86400,
      value: Math.sin(i / 15) * 2 + (Math.random() - 0.5) * 0.5,
    })
  }
  return data
}
