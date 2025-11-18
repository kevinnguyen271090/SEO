"use client"

import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

// Mock data - will be replaced with real API calls
const mockSignals = [
  {
    id: '1',
    symbol: 'AAPL',
    type: 'BUY',
    confidence: 87,
    entryPrice: 178.25,
    targetPrice: 192.50,
    stopLoss: 172.00,
    reasoning: 'RSI oversold (28.5), MACD bullish crossover, strong volume increase',
    createdAt: new Date('2024-01-15T09:30:00'),
  },
  {
    id: '2',
    symbol: 'TSLA',
    type: 'SELL',
    confidence: 73,
    entryPrice: 238.45,
    targetPrice: 220.00,
    stopLoss: 245.00,
    reasoning: 'Bearish divergence, resistance at $240, decreasing volume',
    createdAt: new Date('2024-01-15T10:15:00'),
  },
  {
    id: '3',
    symbol: 'NVDA',
    type: 'BUY',
    confidence: 92,
    entryPrice: 522.35,
    targetPrice: 560.00,
    stopLoss: 510.00,
    reasoning: 'Strong uptrend, breaking resistance, AI sector momentum',
    createdAt: new Date('2024-01-15T11:00:00'),
  },
]

export function SignalsFeed() {
  return (
    <div className="space-y-3">
      {mockSignals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  )
}

function SignalCard({ signal }: { signal: typeof mockSignals[0] }) {
  const isBuy = signal.type === 'BUY'
  const potentialProfit = ((signal.targetPrice - signal.entryPrice) / signal.entryPrice) * 100

  return (
    <Card
      className={cn(
        'p-4 border-l-4 transition-all hover:shadow-md',
        isBuy ? 'signal-gradient-buy border-l-green-500' : 'signal-gradient-sell border-l-red-500'
      )}
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
            <h3 className="font-bold text-lg">{signal.symbol}</h3>
            <p className="text-sm text-muted-foreground">
              {signal.type} Signal
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-muted-foreground">
              {signal.confidence}% Confident
            </span>
          </div>
          <div className="text-sm font-medium">
            {formatCurrency(signal.entryPrice)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Target</p>
          <p className="font-semibold text-green-500">
            {formatCurrency(signal.targetPrice)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Stop Loss</p>
          <p className="font-semibold text-red-500">
            {formatCurrency(signal.stopLoss)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Potential</p>
          <p className="font-semibold text-primary">
            {formatPercent(Math.abs(potentialProfit))}
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
        <Button size="sm" variant="outline">
          View Chart
        </Button>
      </div>
    </Card>
  )
}
