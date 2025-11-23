'use client'

import { useEffect, useRef, useState } from 'react'

interface IndicatorChartProps {
  title: string
  data: Array<{ time: number | string; value: number }>
  color?: string
  height?: number
  thresholds?: Array<{ value: number; color: string; label: string }>
}

export function IndicatorChart({
  title,
  data,
  color = '#3b82f6',
  height = 200,
  thresholds = [],
}: IndicatorChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    const initChart = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { createChart, ColorType } = await import('lightweight-charts')

        if (!chartContainerRef.current) return

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
            timeVisible: false,
            borderVisible: false,
          },
          rightPriceScale: {
            borderVisible: false,
          },
        })

        chartRef.current = chart

        // Convert time data to string format
        const formattedData = data.map((d, i) => {
          if (typeof d.time === 'number') {
            const date = new Date(d.time * 1000)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return { time: `${year}-${month}-${day}`, value: d.value }
          }
          return d
        })

        // Add line series
        const lineSeries = chart.addLineSeries({
          color,
          lineWidth: 2,
          crosshairMarkerVisible: true,
        })

        lineSeries.setData(formattedData as any)

        // Add threshold lines
        thresholds.forEach((threshold) => {
          const thresholdLine = chart.addLineSeries({
            color: threshold.color,
            lineWidth: 1,
            lineStyle: 2, // Dashed
            crosshairMarkerVisible: false,
          })

          // Create horizontal line data
          const thresholdData = [
            { time: formattedData[0].time, value: threshold.value },
            { time: formattedData[formattedData.length - 1].time, value: threshold.value },
          ]

          thresholdLine.setData(thresholdData as any)
        })

        chart.timeScale().fitContent()

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
        console.error('Indicator chart error:', err)
        setError(err.message || 'Failed to load chart')
      }
    }

    initChart()

    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data, color, height, thresholds])

  if (error) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-2">{title}</h4>
        <div className="flex items-center justify-center bg-muted rounded-lg" style={{ height }}>
          <p className="text-muted-foreground text-sm">Chart error</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" style={{ minHeight: height }} />
    </div>
  )
}
