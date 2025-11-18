import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignalsFeed } from '@/components/signals/signals-feed'
import { PortfolioSummary } from '@/components/analytics/portfolio-summary'
import { MarketHeatmap } from '@/components/analytics/market-heatmap'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 space-y-6">
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

          {/* Market Heatmap - 1 column */}
          <div className="space-y-4">
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
    </div>
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
