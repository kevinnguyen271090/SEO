'use client'

import { useEffect, useRef, memo } from 'react'

interface PriceChartProps {
  symbol: string
  height?: number
}

// Map symbols to TradingView format
function toTradingViewSymbol(symbol: string): string {
  // Crypto symbols
  if (symbol.endsWith('-USD')) {
    const base = symbol.replace('-USD', '')
    return `BINANCE:${base}USDT`
  }

  // Forex symbols
  if (symbol.includes('/')) {
    return `FX:${symbol.replace('/', '')}`
  }

  // Vietnam stocks
  if (symbol.endsWith('.VN')) {
    const base = symbol.replace('.VN', '')
    return `HOSE:${base}`
  }

  // VN Index
  if (symbol === 'VNINDEX') {
    return 'HOSE:VNINDEX'
  }
  if (symbol === 'VN30') {
    return 'HOSE:VN30'
  }

  // US stocks (default)
  return symbol
}

function PriceChartComponent({ symbol, height = 400 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ''

    const tradingViewSymbol = toTradingViewSymbol(symbol)

    // Create TradingView widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tradingViewSymbol,
      interval: 'D',
      timezone: 'Asia/Ho_Chi_Minh',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      container_id: `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`
    })

    // Create container div for TradingView
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container'
    widgetContainer.style.height = `${height}px`
    widgetContainer.style.width = '100%'

    const widgetDiv = document.createElement('div')
    widgetDiv.id = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`
    widgetDiv.style.height = '100%'
    widgetDiv.style.width = '100%'

    widgetContainer.appendChild(widgetDiv)
    widgetContainer.appendChild(script)
    containerRef.current.appendChild(widgetContainer)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, height])

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: '100%' }}
      className="rounded-lg overflow-hidden bg-[#131722]"
    />
  )
}

export const PriceChart = memo(PriceChartComponent)
