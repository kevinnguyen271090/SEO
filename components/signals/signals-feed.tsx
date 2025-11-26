"use client"

import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, RefreshCw, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Signal {
  id: string
  symbol: string
  name: string
  type: 'BUY' | 'SELL'
  confidence: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  reasoning: string
  marketType: string
  currency: string
}

// Popular symbols to generate signals for
const SIGNAL_SYMBOLS = [
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL',
  'BTC-USD', 'ETH-USD', 'SOL-USD',
  'EUR/USD', 'GBP/USD',
  'VCB.VN', 'FPT.VN'
]

export function SignalsFeed() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSignals = async () => {
    try {
      setLoading(true)

      // Fetch real-time prices for all symbols
      const response = await fetch(`/api/market-data?symbols=${SIGNAL_SYMBOLS.join(',')}`)
      const result = await response.json()

      if (result.success && result.data) {
        // Generate signals from price data
        const generatedSignals = result.data
          .filter((quote: any) => quote.price > 0)
          .slice(0, 8) // Show top 8 signals
          .map((quote: any, index: number) => generateSignal(quote, index))
          .sort((a: Signal, b: Signal) => b.confidence - a.confidence)

        setSignals(generatedSignals)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSignals, 60000)
    return () => clearInterval(interval)
  }, [])

  // Generate signal based on price data
  const generateSignal = (quote: any, index: number): Signal => {
    const { symbol, name, price, changePercent, marketType, currency } = quote

    // Use symbol hash to determine signal type consistently
    const symbolHash = symbol.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)
    const isBuy = (symbolHash + index) % 2 === 0

    // Generate target and stop loss based on volatility
    const volatility = Math.abs(changePercent) > 5 ? 0.08 : 0.05
    const targetMultiplier = isBuy ? 1 + volatility : 1 - volatility
    const stopMultiplier = isBuy ? 1 - (volatility * 0.6) : 1 + (volatility * 0.6)

    // Generate confidence based on change
    const baseConfidence = 70
    const confidenceBoost = Math.min(Math.abs(changePercent) * 2, 25)
    const confidence = Math.round(baseConfidence + confidenceBoost + (symbolHash % 10))

    // Generate reasoning based on market conditions
    const reasoning = generateReasoning(isBuy, changePercent, marketType)

    return {
      id: `${symbol}-${Date.now()}`,
      symbol,
      name: name || symbol,
      type: isBuy ? 'BUY' : 'SELL',
      confidence: Math.min(confidence, 95),
      entryPrice: price,
      targetPrice: price * targetMultiplier,
      stopLoss: price * stopMultiplier,
      reasoning,
      marketType,
      currency
    }
  }

  const generateReasoning = (isBuy: boolean, changePercent: number, marketType: string): string => {
    const reasons = []

    if (isBuy) {
      reasons.push('Technical indicators suggest bullish momentum')
      if (changePercent > 2) {
        reasons.push('strong upward price action')
      } else if (changePercent < -2) {
        reasons.push('oversold conditions with reversal potential')
      }
      reasons.push('favorable risk/reward setup')
    } else {
      reasons.push('Bearish pressure detected in price action')
      if (changePercent > 2) {
        reasons.push('overbought conditions')
      } else {
        reasons.push('downtrend continuation pattern')
      }
      reasons.push('consider protective stops')
    }

    if (marketType === 'crypto') {
      reasons.push('crypto market volatility')
    } else if (marketType === 'forex') {
      reasons.push('forex pair momentum')
    }

    return reasons.join(', ')
  }

  if (loading && signals.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading signals...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">
          {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 gap-1"
          onClick={fetchSignals}
          disabled={loading}
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>

      {signals.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No signals available
        </Card>
      ) : (
        signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))
      )}
    </div>
  )
}

function SignalCard({ signal }: { signal: Signal }) {
  const router = useRouter()
  const isBuy = signal.type === 'BUY'
  const potentialProfit = ((signal.targetPrice - signal.entryPrice) / signal.entryPrice) * 100

  const handleViewChart = () => {
    router.push(`/signals/${signal.symbol}`)
  }

  // Format price based on market type
  const formatPrice = (price: number) => {
    if (signal.marketType === 'crypto') {
      if (price < 0.01) return `${signal.currency}${price.toFixed(6)}`
      if (price < 1) return `${signal.currency}${price.toFixed(4)}`
      return `${signal.currency}${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    }
    if (signal.marketType === 'forex') {
      return price.toFixed(5)
    }
    if (signal.marketType === 'vn-stock') {
      return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
    }
    return `${signal.currency}${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }

  return (
    <Card
      className={cn(
        'p-4 border-l-4 transition-all hover:shadow-md cursor-pointer',
        isBuy ? 'signal-gradient-buy border-l-green-500' : 'signal-gradient-sell border-l-red-500'
      )}
      onClick={handleViewChart}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              isBuy ? 'bg-green-500/20' : 'bg-red-500/20'
            )}
          >
            {isBuy ? (
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{signal.symbol}</h3>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded uppercase",
                signal.marketType === 'crypto' ? "bg-orange-500/20 text-orange-600" :
                signal.marketType === 'forex' ? "bg-blue-500/20 text-blue-600" :
                signal.marketType === 'vn-stock' ? "bg-red-500/20 text-red-600" :
                "bg-primary/20 text-primary"
              )}>
                {signal.marketType === 'vn-stock' ? 'VN' : signal.marketType}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {signal.type} Signal
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <div className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              signal.confidence >= 80 ? "bg-green-500" :
              signal.confidence >= 70 ? "bg-yellow-500" : "bg-orange-500"
            )}></div>
            <span className="text-xs text-muted-foreground">
              {signal.confidence}% Confident
            </span>
          </div>
          <div className="text-sm font-medium">
            {formatPrice(signal.entryPrice)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Target</p>
          <p className="font-semibold text-green-500">
            {formatPrice(signal.targetPrice)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Stop Loss</p>
          <p className="font-semibold text-red-500">
            {formatPrice(signal.stopLoss)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Potential</p>
          <p className="font-semibold text-primary">
            {isBuy ? '+' : ''}{formatPercent(potentialProfit)}
          </p>
        </div>
      </div>

      <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
        <p className="text-muted-foreground">{signal.reasoning}</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" variant={isBuy ? "default" : "destructive"}>
          Execute Trade
        </Button>
        <Button size="sm" variant="outline" onClick={(e) => {
          e.stopPropagation()
          handleViewChart()
        }}>
          View Chart
        </Button>
      </div>
    </Card>
  )
}
