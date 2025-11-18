import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview'
import { OpenPositions } from '@/components/portfolio/open-positions'
import { TradeHistory } from '@/components/portfolio/trade-history'
import { TradeForm } from '@/components/portfolio/trade-form'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground mt-1">
              Manage your paper trading portfolio
            </p>
          </div>
        </div>

        {/* Portfolio Overview */}
        <Suspense fallback={<LoadingCard />}>
          <PortfolioOverview />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trade Form - 1 column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Execute Trade</CardTitle>
                <CardDescription>
                  Buy or sell stocks in your paper portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <TradeForm />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Open Positions - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
                <CardDescription>
                  Your active trades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingTable />}>
                  <OpenPositions />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trade History */}
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>
              All your closed positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingTable />}>
              <TradeHistory />
            </Suspense>
          </CardContent>
        </Card>
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
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingTable() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
      ))}
    </div>
  )
}
