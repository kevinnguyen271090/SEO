/**
 * Market Data API Client
 * Fetches real-time and historical market data from various sources
 */

import axios from 'axios'

export interface MarketQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: Date
}

export interface HistoricalCandle {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Fetch real-time quote from Yahoo Finance API
 */
export async function getQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    // Using Yahoo Finance alternative API
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          interval: '1d',
          range: '1d',
        },
      }
    )

    const result = response.data.chart.result[0]
    const quote = result.meta
    const indicators = result.indicators.quote[0]

    return {
      symbol: symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketPrice - quote.chartPreviousClose,
      changePercent: ((quote.regularMarketPrice - quote.chartPreviousClose) / quote.chartPreviousClose) * 100,
      volume: indicators.volume[indicators.volume.length - 1] || 0,
      timestamp: new Date(quote.regularMarketTime * 1000),
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch historical data from Yahoo Finance
 */
export async function getHistoricalData(
  symbol: string,
  interval: '1d' | '1h' | '5m' = '1d',
  range: string = '1mo'
): Promise<HistoricalCandle[]> {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          interval,
          range,
        },
      }
    )

    const result = response.data.chart.result[0]
    const timestamps = result.timestamp
    const indicators = result.indicators.quote[0]

    const candles: HistoricalCandle[] = []

    for (let i = 0; i < timestamps.length; i++) {
      if (
        indicators.open[i] !== null &&
        indicators.high[i] !== null &&
        indicators.low[i] !== null &&
        indicators.close[i] !== null
      ) {
        candles.push({
          timestamp: new Date(timestamps[i] * 1000),
          open: indicators.open[i],
          high: indicators.high[i],
          low: indicators.low[i],
          close: indicators.close[i],
          volume: indicators.volume[i] || 0,
        })
      }
    }

    return candles
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    return []
  }
}

/**
 * Fetch quotes for multiple symbols
 */
export async function getMultipleQuotes(symbols: string[]): Promise<MarketQuote[]> {
  const promises = symbols.map(symbol => getQuote(symbol))
  const results = await Promise.all(promises)
  return results.filter((quote): quote is MarketQuote => quote !== null)
}

/**
 * Get trending stocks (S&P 500 top movers)
 */
export async function getTrendingStocks(): Promise<string[]> {
  // Default list of popular stocks
  return [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
    'TSLA', 'META', 'BRK.B', 'V', 'JNJ'
  ]
}

/**
 * Check if market is open (US market hours)
 */
export function isMarketOpen(): boolean {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcDay = now.getUTCDay()

  // Market is open Monday-Friday, 14:30-21:00 UTC (9:30 AM - 4:00 PM ET)
  const isWeekday = utcDay >= 1 && utcDay <= 5
  const isDuringMarketHours = utcHour >= 14 && utcHour < 21

  return isWeekday && isDuringMarketHours
}
