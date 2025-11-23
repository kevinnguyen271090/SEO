"use client"

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignalsFeed } from '@/components/signals/signals-feed'
import { PortfolioSummary } from '@/components/analytics/portfolio-summary'
import { MarketHeatmap } from '@/components/analytics/market-heatmap'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { SymbolSearch } from '@/components/dashboard/symbol-search'
import { Watchlist } from '@/components/dashboard/watchlist'

// Default watchlist symbols
const DEFAULT_WATCHLIST = ['AAPL', 'TSLA', 'NVDA']

export function DashboardContent() {
  const [watchlist, setWatchlist] = useState<string[]>([])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('watchlist')
    if (saved) {
      setWatchlist(JSON.parse(saved))
    } else {
      setWatchlist(DEFAULT_WATCHLIST)
    }
  }, [])

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('watchlist', JSON.stringify(watchlist))
    }
  }, [watchlist])

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol])
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol))
  }

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <SymbolSearch onAddToWatchlist={addToWatchlist} watchlist={watchlist} />
        <p className="text-sm text-muted-foreground">
          Search symbols to view charts or add to watchlist
        </p>
      </div>

      {/* Portfolio Summary */}
      <Suspense fallback={<LoadingCard />}>
        <PortfolioSummary />
      </Suspense>

      {/* Quick Actions */}
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Signals Feed - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Live Signals
              </CardTitle>
              <CardDescription>
                AI-generated trading signals updated in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSignals />}>
                <SignalsFeed />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar - 1 column */}
        <div className="space-y-4">
          {/* Watchlist */}
          <Watchlist symbols={watchlist} onRemove={removeFromWatchlist} />

          {/* Market Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>
                Sector performance heatmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingCard />}>
                <MarketHeatmap />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSignals() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
          <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}
