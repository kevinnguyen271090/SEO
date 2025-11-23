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

// Symbol names database
const symbolNames: Record<string, string> = {
  // Tech
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  MSFT: 'Microsoft Corp.',
  AMZN: 'Amazon.com Inc.',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA Corp.',
  TSLA: 'Tesla Inc.',
  AMD: 'AMD Inc.',
  INTC: 'Intel Corp.',
  CRM: 'Salesforce Inc.',
  ORCL: 'Oracle Corp.',
  ADBE: 'Adobe Inc.',
  CSCO: 'Cisco Systems',
  AVGO: 'Broadcom Inc.',
  QCOM: 'Qualcomm Inc.',
  // Media
  NFLX: 'Netflix Inc.',
  DIS: 'Walt Disney Co.',
  CMCSA: 'Comcast Corp.',
  SPOT: 'Spotify',
  // Finance
  JPM: 'JPMorgan Chase',
  BAC: 'Bank of America',
  WFC: 'Wells Fargo',
  GS: 'Goldman Sachs',
  MS: 'Morgan Stanley',
  V: 'Visa Inc.',
  MA: 'Mastercard Inc.',
  PYPL: 'PayPal Holdings',
  SQ: 'Block Inc.',
  COIN: 'Coinbase',
  // Healthcare
  JNJ: 'Johnson & Johnson',
  UNH: 'UnitedHealth',
  PFE: 'Pfizer Inc.',
  MRK: 'Merck & Co.',
  ABBV: 'AbbVie Inc.',
  LLY: 'Eli Lilly',
  TMO: 'Thermo Fisher',
  // Consumer
  WMT: 'Walmart Inc.',
  COST: 'Costco',
  HD: 'Home Depot',
  MCD: "McDonald's",
  SBUX: 'Starbucks',
  NKE: 'Nike Inc.',
  KO: 'Coca-Cola',
  PEP: 'PepsiCo',
  // Energy
  XOM: 'Exxon Mobil',
  CVX: 'Chevron Corp.',
  COP: 'ConocoPhillips',
  // Industrial
  BA: 'Boeing Co.',
  CAT: 'Caterpillar',
  GE: 'General Electric',
  UPS: 'UPS',
  FDX: 'FedEx Corp.',
  // ETFs
  SPY: 'S&P 500 ETF',
  QQQ: 'Nasdaq 100 ETF',
  DIA: 'Dow Jones ETF',
  IWM: 'Russell 2000 ETF',
  VTI: 'Total Stock Market ETF',
  VOO: 'Vanguard S&P 500',
  ARKK: 'ARK Innovation ETF',
  // Crypto
  MSTR: 'MicroStrategy',
  MARA: 'Marathon Digital',
  RIOT: 'Riot Platforms',
}

// Generate mock price data for any symbol
function generateMockData(symbol: string): WatchlistItem {
  // Use symbol hash to generate consistent "random" data
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const basePrice = 50 + (hash % 500)
  const change = ((hash % 20) - 10) + Math.random() * 2 - 1
  const changePercent = (change / basePrice) * 100

  return {
    symbol,
    name: symbolNames[symbol] || `${symbol} Stock`,
    price: basePrice + Math.random() * 10,
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
  }
}

interface WatchlistProps {
  symbols: string[]
  onRemove?: (symbol: string) => void
}

export function Watchlist({ symbols, onRemove }: WatchlistProps) {
  const router = useRouter()
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([])

  useEffect(() => {
    // Generate data for all symbols (including custom ones)
    const data = symbols.map((symbol) => generateMockData(symbol))
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
