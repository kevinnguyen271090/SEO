'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatPercent, getValueColor, cn } from '@/lib/utils'

interface Trade {
  id: string
  symbol: string
  type: string
  quantity: number
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercent: number
  entryDate: Date
  exitDate: Date
}

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTradeHistory()
  }, [])

  const fetchTradeHistory = async () => {
    try {
      // Mock data for MVP
      setTrades([
        {
          id: '1',
          symbol: 'MSFT',
          type: 'BUY',
          quantity: 25,
          entryPrice: 385.20,
          exitPrice: 395.50,
          pnl: 257.50,
          pnlPercent: 2.67,
          entryDate: new Date('2024-01-05'),
          exitDate: new Date('2024-01-18'),
        },
        {
          id: '2',
          symbol: 'GOOGL',
          type: 'BUY',
          quantity: 35,
          entryPrice: 142.50,
          exitPrice: 138.20,
          pnl: -150.50,
          pnlPercent: -3.02,
          entryDate: new Date('2024-01-08'),
          exitDate: new Date('2024-01-16'),
        },
      ])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch trade history:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading trade history...</div>
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No closed trades yet. Your trade history will appear here.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="py-3 px-4 font-medium">Symbol</th>
            <th className="py-3 px-4 font-medium">Qty</th>
            <th className="py-3 px-4 font-medium">Entry</th>
            <th className="py-3 px-4 font-medium">Exit</th>
            <th className="py-3 px-4 font-medium">P&L</th>
            <th className="py-3 px-4 font-medium">%</th>
            <th className="py-3 px-4 font-medium">Closed</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-semibold">{trade.symbol}</td>
              <td className="py-3 px-4">{trade.quantity}</td>
              <td className="py-3 px-4">{formatCurrency(trade.entryPrice)}</td>
              <td className="py-3 px-4">{formatCurrency(trade.exitPrice)}</td>
              <td className={cn('py-3 px-4 font-semibold', getValueColor(trade.pnl))}>
                {formatCurrency(trade.pnl)}
              </td>
              <td className={cn('py-3 px-4', getValueColor(trade.pnlPercent))}>
                {formatPercent(trade.pnlPercent)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {new Date(trade.exitDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
