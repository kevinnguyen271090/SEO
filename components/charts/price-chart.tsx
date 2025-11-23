'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'

interface PriceChartProps {
  symbol: string
  data?: any[]
  height?: number
}

export function PriceChart({ symbol, data, height = 400 }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    seriesRef.current = candlestickSeries

    // Load data
    if (data && data.length > 0) {
      candlestickSeries.setData(data as any)
      chart.timeScale().fitContent()
      setLoading(false)
    } else {
      fetchChartData(symbol, candlestickSeries, chart)
    }

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
      chart.remove()
    }
  }, [symbol, data, height])

  const fetchChartData = async (
    symbol: string,
    series: ISeriesApi<'Candlestick'>,
    chart: IChartApi
  ) => {
    try {
      // Mock data for MVP - in production, fetch from API
      const mockData = generateMockCandlestickData(90)
      series.setData(mockData as any)
      chart.timeScale().fitContent()
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />
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
    const timestamp = Math.floor(date.getTime() / 1000)

    // Random walk
    const change = (Math.random() - 0.5) * 10
    basePrice += change

    const open = basePrice
    const close = basePrice + (Math.random() - 0.5) * 5
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3

    data.push({
      time: timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    })
  }

  return data
}
