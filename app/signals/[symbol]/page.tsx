import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriceChart } from '@/components/charts/price-chart'
import { IndicatorChart } from '@/components/charts/indicator-chart'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    symbol: string
  }
}

export default function SignalDetailPage({ params }: PageProps) {
  const symbol = params.symbol.toUpperCase()

  // Mock signal data
  const signal = {
    symbol,
    type: 'BUY',
    confidence: 87,
    entryPrice: 178.25,
    targetPrice: 192.50,
    stopLoss: 172.00,
    reasoning: 'RSI oversold (28.5), MACD bullish crossover, strong volume increase',
    indicators: {
      rsi: 28.5,
      macd: 0.45,
      signal: -0.12,
      volume: 85432100,
      avgVolume: 65234000,
    },
  }

  const potentialProfit = ((signal.targetPrice - signal.entryPrice) / signal.entryPrice) * 100
  const riskReward = Math.abs((signal.targetPrice - signal.entryPrice) / (signal.entryPrice - signal.stopLoss))

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
          <div>
            <h1 className="text-3xl font-bold">{symbol}</h1>
            <p className="text-muted-foreground mt-1">
              {signal.type} Signal - {signal.confidence}% Confident
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>
                  90-day candlestick chart with volume
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
                    <p className="text-sm text-muted-foreground">Entry Price</p>
                    <p className="text-lg font-semibold">${signal.entryPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-lg font-semibold text-green-500">
                      ${signal.targetPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stop Loss</p>
                    <p className="text-lg font-semibold text-red-500">
                      ${signal.stopLoss.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Potential</p>
                    <p className="text-lg font-semibold text-primary">
                      +{potentialProfit.toFixed(2)}%
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
                    <span className="font-medium">{signal.indicators.rsi}</span>
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
