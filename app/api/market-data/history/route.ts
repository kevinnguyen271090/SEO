import { NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic'

interface YahooCandle {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * GET /api/market-data/history?symbol=AAPL&range=3mo&interval=1d
 * Fetches historical OHLCV data from Yahoo Finance
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const range = searchParams.get('range') || '3mo' // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    const interval = searchParams.get('interval') || '1d' // 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Missing symbol parameter' },
        { status: 400 }
      )
    }

    // Convert symbol format for Yahoo Finance
    let yahooSymbol = symbol

    // Crypto: BTC-USD stays as BTC-USD (Yahoo supports this)
    // Forex: EUR/USD -> EURUSD=X
    if (symbol.includes('/')) {
      yahooSymbol = symbol.replace('/', '') + '=X'
    }

    // VN Stocks: VCB.VN -> VCB.VN (Yahoo might not support, will fallback)
    // US Stocks: AAPL -> AAPL (direct)

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`,
      {
        params: {
          interval,
          range,
        },
        timeout: 10000,
      }
    )

    const result = response.data.chart.result?.[0]
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'No data available for this symbol' },
        { status: 404 }
      )
    }

    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}
    const { open, high, low, close, volume } = quotes

    const candles: YahooCandle[] = []

    for (let i = 0; i < timestamps.length; i++) {
      // Skip if any OHLC value is null
      if (
        open?.[i] == null ||
        high?.[i] == null ||
        low?.[i] == null ||
        close?.[i] == null
      ) {
        continue
      }

      // Convert Unix timestamp to YYYY-MM-DD format for lightweight-charts
      const date = new Date(timestamps[i] * 1000)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      candles.push({
        time: `${year}-${month}-${day}`,
        open: parseFloat(open[i].toFixed(2)),
        high: parseFloat(high[i].toFixed(2)),
        low: parseFloat(low[i].toFixed(2)),
        close: parseFloat(close[i].toFixed(2)),
        volume: volume?.[i] || 0,
      })
    }

    // Get current price info
    const meta = result.meta || {}

    return NextResponse.json({
      success: true,
      symbol: symbol,
      currency: meta.currency || 'USD',
      regularMarketPrice: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose,
      data: candles,
    })
  } catch (error: any) {
    console.error('Error fetching historical data:', error.message)

    // Return empty data instead of error for unsupported symbols
    return NextResponse.json({
      success: true,
      symbol: request.url,
      data: [],
      error: 'Data not available',
    })
  }
}
