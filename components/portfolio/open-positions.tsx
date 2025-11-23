'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent, getValueColor, cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface Position {
  id: string
  symbol: string
  quantity: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  entryDate: Date
}

export function OpenPositions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      // Mock data for MVP
      setPositions([
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 50,
          entryPrice: 178.25,
          currentPrice: 185.50,
          pnl: 362.50,
          pnlPercent: 4.07,
          entryDate: new Date('2024-01-10'),
        },
        {
          id: '2',
          symbol: 'NVDA',
          quantity: 30,
          entryPrice: 522.35,
          currentPrice: 545.20,
          pnl: 685.50,
          pnlPercent: 4.37,
          entryDate: new Date('2024-01-12'),
        },
        {
          id: '3',
          symbol: 'TSLA',
          quantity: 40,
          entryPrice: 238.45,
          currentPrice: 232.10,
          pnl: -254.00,
          pnlPercent: -2.66,
          entryDate: new Date('2024-01-15'),
        },
      ])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch positions:', error)
      setLoading(false)
    }
  }

  const handleClose = async (positionId: string) => {
    // TODO: Implement close position
    console.log('Close position:', positionId)
  }

  if (loading) {
    return <div>Loading positions...</div>
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No open positions. Execute your first trade above!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {positions.map((position) => (
        <div
          key={position.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg">{position.symbol}</h3>
              <span className="text-sm text-muted-foreground">
                {position.quantity} shares @ {formatCurrency(position.entryPrice)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Opened {new Date(position.entryDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right mr-4">
            <div className="font-medium">
              {formatCurrency(position.currentPrice)}
            </div>
            <div className={cn('text-sm font-semibold', getValueColor(position.pnl))}>
              {formatCurrency(position.pnl)} ({formatPercent(position.pnlPercent)})
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleClose(position.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
