"use client"

import { LineChart, Target, TrendingUp, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  {
    title: 'Backtest Strategy',
    description: 'Test your strategy on historical data',
    icon: LineChart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    href: '/backtest',
  },
  {
    title: 'New Trade',
    description: 'Execute a manual trade',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    href: '/portfolio',
  },
  {
    title: 'View Signals',
    description: 'Browse all active signals',
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    href: '/signals',
  },
  {
    title: 'Settings',
    description: 'Configure alerts and preferences',
    icon: Settings,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    href: '/settings',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Card
          key={action.title}
          className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          onClick={() => {
            // Navigation will be handled by router
            console.log('Navigate to:', action.href)
          }}
        >
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className={`p-3 rounded-lg ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {action.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
