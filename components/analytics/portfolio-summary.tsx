"use client"

import { TrendingUp, Wallet, Target, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent, getValueColor, cn } from '@/lib/utils'

// Mock data - will be replaced with real API
const mockPortfolio = {
  balance: 112450.50,
  initialBalance: 100000,
  totalPnL: 12450.50,
  pnlPercent: 12.45,
  openPositions: 5,
  winRate: 68.5,
}

export function PortfolioSummary() {
  const { balance, initialBalance, totalPnL, pnlPercent, openPositions, winRate } = mockPortfolio

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Portfolio Value"
        value={formatCurrency(balance)}
        subtitle={`Started with ${formatCurrency(initialBalance)}`}
        icon={Wallet}
        trend={pnlPercent}
      />
      <StatCard
        title="Total P&L"
        value={formatCurrency(totalPnL)}
        subtitle={formatPercent(pnlPercent)}
        icon={TrendingUp}
        trend={pnlPercent}
        showTrendInValue
      />
      <StatCard
        title="Open Positions"
        value={openPositions.toString()}
        subtitle="Active trades"
        icon={Target}
      />
      <StatCard
        title="Win Rate"
        value={`${winRate}%`}
        subtitle="Last 30 days"
        icon={Award}
        trend={winRate > 50 ? winRate - 50 : -(50 - winRate)}
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: any
  trend?: number
  showTrendInValue?: boolean
}

function StatCard({ title, value, subtitle, icon: Icon, trend, showTrendInValue }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", showTrendInValue && trend !== undefined && getValueColor(trend))}>
          {value}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          {trend !== undefined && !showTrendInValue && (
            <span className={getValueColor(trend)}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '•'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  )
}
