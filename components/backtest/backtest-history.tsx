'use client'

import { useEffect, useState } from 'react'
import { formatPercent, getValueColor, cn } from '@/lib/utils'
import { Calendar, TrendingUp } from 'lucide-react'

interface BacktestHistoryItem {
  id: string
  name: string
  symbol: string
  totalReturnPercent: number
  winRate: number
  totalTrades: number
  createdAt: Date
}

export function BacktestHistory() {
  const [history, setHistory] = useState<BacktestHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      // Mock data for MVP
      setHistory([
        {
          id: '1',
          name: 'RSI + MACD Strategy',
          symbol: 'AAPL',
          totalReturnPercent: 15.6,
          winRate: 68.5,
          totalTrades: 42,
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'Bollinger Bands Strategy',
          symbol: 'TSLA',
          totalReturnPercent: -3.2,
          winRate: 45.2,
          totalTrades: 31,
          createdAt: new Date('2024-01-12'),
        },
        {
          id: '3',
          name: 'Moving Average Crossover',
          symbol: 'NVDA',
          totalReturnPercent: 22.8,
          winRate: 72.1,
          totalTrades: 38,
          createdAt: new Date('2024-01-08'),
        },
      ])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch backtest history:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading history...</div>
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No backtest history yet. Run your first backtest above!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{item.name}</h3>
              <span className="text-sm text-muted-foreground">
                {item.symbol}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              <span>{item.totalTrades} trades</span>
              <span>{item.winRate.toFixed(1)}% win rate</span>
            </div>
          </div>

          <div className="text-right">
            <div className={cn('text-lg font-bold', getValueColor(item.totalReturnPercent))}>
              {formatPercent(item.totalReturnPercent)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
