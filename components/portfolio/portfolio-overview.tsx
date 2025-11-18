'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Wallet, DollarSign, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent, getValueColor, cn } from '@/lib/utils'

interface PortfolioData {
  balance: number
  currentValue: number
  totalPnL: number
  openPositions: number
}

export function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      // For MVP, use demo data
      // TODO: Fetch from API when auth is ready
      setPortfolio({
        balance: 85450.50,
        currentValue: 112450.50,
        totalPnL: 12450.50,
        openPositions: 5,
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
      setLoading(false)
    }
  }

  if (loading || !portfolio) {
    return <div>Loading...</div>
  }

  const initialBalance = 100000
  const totalReturnPercent = ((portfolio.currentValue - initialBalance) / initialBalance) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Cash Balance"
        value={formatCurrency(portfolio.balance)}
        subtitle="Available to trade"
        icon={Wallet}
        iconColor="text-blue-500"
      />
      <StatCard
        title="Portfolio Value"
        value={formatCurrency(portfolio.currentValue)}
        subtitle={`${formatPercent(totalReturnPercent)} return`}
        icon={TrendingUp}
        iconColor="text-green-500"
        valueClassName={getValueColor(totalReturnPercent)}
      />
      <StatCard
        title="Total P&L"
        value={formatCurrency(portfolio.totalPnL)}
        subtitle={formatPercent(totalReturnPercent)}
        icon={DollarSign}
        iconColor="text-emerald-500"
        valueClassName={getValueColor(portfolio.totalPnL)}
      />
      <StatCard
        title="Open Positions"
        value={portfolio.openPositions.toString()}
        subtitle="Active trades"
        icon={Activity}
        iconColor="text-purple-500"
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: any
  iconColor?: string
  valueClassName?: string
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor, valueClassName }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClassName)}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
}
