'use client'

import { useEffect, useRef, useState } from 'react'

interface PriceChartProps {
  symbol: string
  data?: any[]
  height?: number
}

export function PriceChart({ symbol, data, height = 400 }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const initChart = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { createChart, ColorType } = await import('lightweight-charts')

        if (!chartContainerRef.current) return

        // Create chart
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#9ca3af',
          },
          grid: {
            vertLines: { color: '#1f2937' },
            horzLines: { color: '#1f2937' },
          },
          width: chartContainerRef.current.clientWidth,
          height,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          crosshair: {
            mode: 1,
          },
        })

        chartRef.current = chart

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })

        // Load data
        if (data && data.length > 0) {
          candlestickSeries.setData(data)
        } else {
          const mockData = generateMockCandlestickData(90)
          candlestickSeries.setData(mockData)
        }

        chart.timeScale().fitContent()
        setLoading(false)

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
            })
          }
        }

        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
        }
      } catch (err: any) {
        console.error('Chart init error:', err)
        setError(err.message || 'Failed to load chart')
        setLoading(false)
      }
    }

    initChart()

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [symbol, data, height])

  if (error) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-lg" style={{ height }}>
        <p className="text-muted-foreground">Chart error: {error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" style={{ minHeight: height }} />
    </div>
  )
}

// Generate mock candlestick data for demo
function generateMockCandlestickData(days: number) {
  const data = []
  let basePrice = 150
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Use YYYY-MM-DD format for lightweight-charts
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const timeString = `${year}-${month}-${day}`

    // Random walk
    const change = (Math.random() - 0.5) * 10
    basePrice += change

    const open = basePrice
    const close = basePrice + (Math.random() - 0.5) * 5
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3

    data.push({
      time: timeString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    })
  }

  return data
}
