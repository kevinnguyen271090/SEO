"use client"

import { useState, useEffect } from 'react'
import { Star, TrendingUp, TrendingDown, X, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// Mock data - will be replaced with real API
const mockWatchlistData: Record<string, WatchlistItem> = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: 2.35, changePercent: 1.34 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: -5.20, changePercent: -2.13 },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 522.35, change: 12.80, changePercent: 2.51 },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.95, changePercent: 0.67 },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 4.25, changePercent: 1.13 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: -1.45, changePercent: -0.81 },
  META: { symbol: 'META', name: 'Meta Platforms', price: 505.20, change: 8.90, changePercent: 1.79 },
  AMD: { symbol: 'AMD', name: 'AMD Inc.', price: 142.50, change: 3.20, changePercent: 2.30 },
}

interface WatchlistProps {
  symbols: string[]
  onRemove?: (symbol: string) => void
}

export function Watchlist({ symbols, onRemove }: WatchlistProps) {
  const router = useRouter()
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([])

  useEffect(() => {
    // In production, fetch real data from API
    const data = symbols
      .map((symbol) => mockWatchlistData[symbol])
      .filter(Boolean)
    setWatchlistData(data)
  }, [symbols])

  const handleViewChart = (symbol: string) => {
    router.push(`/signals/${symbol}`)
  }

  const handleRemove = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(symbol)
    }
  }

  if (symbols.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Your watchlist is empty</p>
            <p className="text-xs mt-1">Search and add symbols to track them here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Watchlist
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {symbols.length} symbols
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchlistData.map((item) => (
          <div
            key={item.symbol}
            onClick={() => handleViewChart(item.symbol)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                item.change >= 0 ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {item.change >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-semibold">{item.symbol}</p>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold">${item.price.toFixed(2)}</p>
                <p className={cn(
                  "text-xs",
                  item.change >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChart(item.symbol)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={(e) => handleRemove(item.symbol, e)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
