'use client'

import { useEffect, useRef, useState, memo } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface PriceChartProps {
  symbol: string
  height?: number
  range?: string // 1mo, 3mo, 6mo, 1y, 2y, 5y
}

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

function PriceChartComponent({ symbol, height = 400, range = '3mo' }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initChart = async () => {
      if (!chartContainerRef.current) return

      try {
        setLoading(true)
        setError(null)

        // Fetch historical data from our API
        const response = await fetch(
          `/api/market-data/history?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=1d`
        )
        const result = await response.json()

        if (!isMounted) return

        // Dynamic import lightweight-charts
        const { createChart, ColorType } = await import('lightweight-charts')

        if (!chartContainerRef.current || !isMounted) return

        // Clear previous chart
        if (chartRef.current) {
          chartRef.current.remove()
          chartRef.current = null
        }

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
            borderColor: '#1f2937',
          },
          rightPriceScale: {
            borderColor: '#1f2937',
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

        // Use fetched data or generate fallback
        let chartData: CandleData[] = []

        if (result.success && result.data && result.data.length > 0) {
          chartData = result.data
        } else {
          // Generate fallback data based on current price if available
          chartData = generateFallbackData(90, result.regularMarketPrice || 100)
          if (!result.data || result.data.length === 0) {
            setError('Historical data not available. Showing simulated data.')
          }
        }

        candlestickSeries.setData(chartData)

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
          color: '#3b82f6',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
        })

        volumeSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        })

        const volumeData = chartData.map((d: CandleData) => ({
          time: d.time,
          value: d.volume || 0,
          color: d.close >= d.open ? '#22c55e40' : '#ef444440',
        }))

        volumeSeries.setData(volumeData)

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
        if (isMounted) {
          setError(err.message || 'Failed to load chart')
          setLoading(false)
        }
      }
    }

    initChart()

    return () => {
      isMounted = false
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [symbol, height, range])

  return (
    <div className="relative" style={{ minHeight: height }}>
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/80 z-10"
          style={{ height }}
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute top-2 left-2 right-2 z-10">
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 text-xs px-3 py-2 rounded">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        </div>
      )}

      <div
        ref={chartContainerRef}
        className="rounded-lg overflow-hidden"
        style={{ height }}
      />

      <div className="text-[10px] text-muted-foreground text-center mt-2">
        Data from Yahoo Finance • {range} history
      </div>
    </div>
  )
}

// Generate fallback candlestick data
function generateFallbackData(days: number, basePrice: number = 100): CandleData[] {
  const data: CandleData[] = []
  let price = basePrice
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    // Random walk with mean reversion
    const change = (Math.random() - 0.5) * price * 0.03
    price = Math.max(price * 0.5, Math.min(price * 1.5, price + change))

    const open = price
    const volatility = price * 0.02
    const close = price + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * volatility
    const low = Math.min(open, close) - Math.random() * volatility

    data.push({
      time: `${year}-${month}-${day}`,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    })

    price = close
  }

  return data
}

export const PriceChart = memo(PriceChartComponent)
