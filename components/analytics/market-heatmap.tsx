"use client"

import { cn } from '@/lib/utils'

// Mock sector data
const sectors = [
  { name: 'Tech', change: 2.3, volume: 'High' },
  { name: 'Finance', change: -0.8, volume: 'Medium' },
  { name: 'Healthcare', change: 1.5, volume: 'Medium' },
  { name: 'Energy', change: -1.2, volume: 'Low' },
  { name: 'Consumer', change: 0.4, volume: 'High' },
  { name: 'Industrial', change: -0.3, volume: 'Low' },
]

export function MarketHeatmap() {
  return (
    <div className="space-y-2">
      {sectors.map((sector) => (
        <SectorBar key={sector.name} sector={sector} />
      ))}
    </div>
  )
}

function SectorBar({ sector }: { sector: typeof sectors[0] }) {
  const isPositive = sector.change > 0
  const intensity = Math.min(Math.abs(sector.change) / 3, 1)

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm font-medium truncate">
        {sector.name}
      </div>
      <div className="flex-1 h-8 relative rounded overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isPositive
              ? "bg-gradient-to-r from-green-500/30 to-green-500"
              : "bg-gradient-to-r from-red-500/30 to-red-500"
          )}
          style={{
            width: `${intensity * 100}%`,
            opacity: 0.3 + intensity * 0.7
          }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-xs font-medium">
            {sector.volume}
          </span>
          <span className={cn(
            "text-sm font-bold",
            isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {isPositive ? '+' : ''}{sector.change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}
