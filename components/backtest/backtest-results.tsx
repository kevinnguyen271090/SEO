'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatPercent, getValueColor, cn } from '@/lib/utils'
import { TrendingUp, Target, TrendingDown, Award } from 'lucide-react'

interface BacktestResult {
  symbol: string
  initialBalance: number
  finalBalance: number
  totalReturn: number
  totalReturnPercent: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  profitFactor: number
  maxDrawdownPercent: number
  sharpeRatio: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
}

export function BacktestResults() {
  const [result, setResult] = useState<BacktestResult | null>(null)

  useEffect(() => {
    const handleBacktestComplete = (event: any) => {
      setResult(event.detail)
    }

    window.addEventListener('backtestComplete', handleBacktestComplete)

    return () => {
      window.removeEventListener('backtestComplete', handleBacktestComplete)
    }
  }, [])

  if (!result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Configure and run a backtest to see results</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Total Return</p>
          <p className={cn('text-2xl font-bold', getValueColor(result.totalReturn))}>
            {formatCurrency(result.totalReturn)}
          </p>
          <p className={cn('text-sm', getValueColor(result.totalReturnPercent))}>
            {formatPercent(result.totalReturnPercent)}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
          <p className="text-2xl font-bold">{result.winRate.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">
            {result.winningTrades} / {result.totalTrades} trades
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Profit Factor</p>
          <p className="text-2xl font-bold">{result.profitFactor.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Avg Win/Loss: {(result.avgWin / Math.abs(result.avgLoss)).toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground mb-1">Max Drawdown</p>
          <p className="text-2xl font-bold text-red-500">
            {result.maxDrawdownPercent.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground">
            Sharpe: {result.sharpeRatio.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-4">Detailed Metrics</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Initial Balance</span>
            <span className="font-medium">{formatCurrency(result.initialBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Final Balance</span>
            <span className="font-medium">{formatCurrency(result.finalBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Trades</span>
            <span className="font-medium">{result.totalTrades}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Winning Trades</span>
            <span className="font-medium text-green-500">{result.winningTrades}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Losing Trades</span>
            <span className="font-medium text-red-500">{result.losingTrades}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Win</span>
            <span className="font-medium text-green-500">
              {formatCurrency(result.avgWin)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Loss</span>
            <span className="font-medium text-red-500">
              {formatCurrency(result.avgLoss)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Largest Win</span>
            <span className="font-medium text-green-500">
              {formatCurrency(result.largestWin)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Largest Loss</span>
            <span className="font-medium text-red-500">
              {formatCurrency(result.largestLoss)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
