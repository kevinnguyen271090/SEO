'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'

interface IndicatorChartProps {
  title: string
  data: Array<{ time: number; value: number }>
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
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

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

    // Add line series
    const lineSeries = chart.addLineSeries({
      color,
      lineWidth: 2,
      crosshairMarkerVisible: true,
    })

    lineSeries.setData(data as any)

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
        { time: data[0].time as any, value: threshold.value },
        { time: data[data.length - 1].time as any, value: threshold.value },
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
      chart.remove()
    }
  }, [data, color, height, thresholds])

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />
    </div>
  )
}
