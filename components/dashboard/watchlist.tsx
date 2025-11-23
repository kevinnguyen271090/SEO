"use client"

import { useState, useEffect, useCallback } from 'react'
import { Star, TrendingUp, TrendingDown, X, Eye, RefreshCw, Loader2, Bitcoin, DollarSign } from 'lucide-react'
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
  marketType: 'crypto' | 'forex' | 'stock' | 'vn-stock'
  currency: string
  formattedPrice?: string
}

interface WatchlistProps {
  symbols: string[]
  onRemove?: (symbol: string) => void
  refreshInterval?: number // in milliseconds, default 30 seconds
}

// Fallback names for symbols
const SYMBOL_NAMES: Record<string, string> = {
  // US Tech
  AAPL: 'Apple Inc.', GOOGL: 'Alphabet Inc.', MSFT: 'Microsoft', AMZN: 'Amazon',
  META: 'Meta Platforms', NVDA: 'NVIDIA', TSLA: 'Tesla', AMD: 'AMD', INTC: 'Intel',
  // Finance
  JPM: 'JPMorgan', BAC: 'Bank of America', V: 'Visa', MA: 'Mastercard', GS: 'Goldman Sachs',
  // ETFs
  SPY: 'S&P 500 ETF', QQQ: 'Nasdaq 100 ETF', DIA: 'Dow Jones ETF',
  // Crypto
  'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum', 'SOL-USD': 'Solana', 'BNB-USD': 'Binance Coin',
  'XRP-USD': 'Ripple', 'ADA-USD': 'Cardano', 'DOGE-USD': 'Dogecoin', 'DOT-USD': 'Polkadot',
  // Forex
  'EUR/USD': 'Euro/USD', 'GBP/USD': 'Pound/USD', 'USD/JPY': 'USD/Yen', 'XAU/USD': 'Gold/USD',
  // VN Stocks
  'VCB.VN': 'Vietcombank', 'FPT.VN': 'FPT Corp', 'VIC.VN': 'Vingroup', 'VHM.VN': 'Vinhomes',
  'TCB.VN': 'Techcombank', 'MBB.VN': 'MB Bank', 'HPG.VN': 'Hoa Phat', 'GAS.VN': 'PV Gas',
}

export function Watchlist({ symbols, onRemove, refreshInterval = 30000 }: WatchlistProps) {
  const router = useRouter()
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API
  const fetchData = useCallback(async (showLoading = true) => {
    if (symbols.length === 0) {
      setWatchlistData([])
      return
    }

    if (showLoading) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const response = await fetch(`/api/market-data?symbols=${symbols.join(',')}`)
      const result = await response.json()

      if (result.success && result.data) {
        const data: WatchlistItem[] = result.data.map((item: WatchlistItem) => ({
          ...item,
          name: item.name || SYMBOL_NAMES[item.symbol] || item.symbol,
        }))
        setWatchlistData(data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        throw new Error(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      console.error('Error fetching watchlist data:', err)
      setError('Failed to load data')
      // Keep existing data on error
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [symbols])

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchData()

    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchData(false)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  const handleViewChart = (symbol: string) => {
    router.push(`/signals/${symbol}`)
  }

  const handleRemove = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(symbol)
    }
  }

  const handleManualRefresh = () => {
    fetchData(false)
  }

  // Get icon based on market type
  const getMarketIcon = (marketType: string, change: number) => {
    if (marketType === 'crypto') {
      return <Bitcoin className={cn("h-5 w-5", change >= 0 ? "text-green-500" : "text-red-500")} />
    }
    if (change >= 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />
    }
    return <TrendingDown className="h-5 w-5 text-red-500" />
  }

  // Format price with currency
  const formatPriceDisplay = (item: WatchlistItem) => {
    if (item.formattedPrice) {
      return `${item.currency}${item.formattedPrice}`
    }
    if (item.marketType === 'vn-stock') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)
    }
    if (item.marketType === 'forex') {
      return item.price.toFixed(5)
    }
    return `${item.currency}${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }

  // Get market type badge color
  const getMarketBadgeColor = (marketType: string) => {
    switch (marketType) {
      case 'crypto': return 'bg-orange-500/10 text-orange-600'
      case 'forex': return 'bg-blue-500/10 text-blue-600'
      case 'vn-stock': return 'bg-red-500/10 text-red-600'
      default: return 'bg-primary/10 text-primary'
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
          <span className="text-sm font-normal text-muted-foreground ml-auto flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            </Button>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">{error}</p>
            <Button variant="link" size="sm" onClick={() => fetchData()}>
              Try again
            </Button>
          </div>
        ) : (
          watchlistData.map((item) => (
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
                  {getMarketIcon(item.marketType, item.change)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.symbol}</p>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded uppercase",
                      getMarketBadgeColor(item.marketType)
                    )}>
                      {item.marketType === 'vn-stock' ? 'VN' : item.marketType}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">{formatPriceDisplay(item)}</p>
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
          ))
        )}

        {!isLoading && !error && watchlistData.length > 0 && (
          <div className="pt-2 border-t text-center">
            <p className="text-[10px] text-muted-foreground">
              Auto-refresh every {refreshInterval / 1000}s • Data from Binance, Yahoo Finance, Finnhub
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
