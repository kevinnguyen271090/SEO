import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { BacktestForm } from '@/components/backtest/backtest-form'
import { BacktestResults } from '@/components/backtest/backtest-results'
import { BacktestHistory } from '@/components/backtest/backtest-history'

export default function BacktestPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Strategy Backtesting</h1>
          <p className="text-muted-foreground mt-1">
            Test your trading strategies on historical data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Builder - 1 column */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Build Strategy</CardTitle>
                <CardDescription>
                  Configure your trading strategy parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <BacktestForm />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Results - 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Backtest Results</CardTitle>
                <CardDescription>
                  Performance metrics and trade analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSkeleton />}>
                  <BacktestResults />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Backtest History</CardTitle>
            <CardDescription>
              Your previous backtest results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSkeleton />}>
              <BacktestHistory />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
      ))}
    </div>
  )
}
