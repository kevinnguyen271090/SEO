/**
 * Massive API Client
 * Comprehensive market data from major U.S. exchanges
 * Docs: https://massive.com/docs/rest/quickstart
 *
 * Coverage: Stocks, Options, Futures, Indices, Forex, Crypto
 */

import axios from 'axios'

const MASSIVE_BASE_URL = 'https://api.massive.com/v3'

export interface MassiveQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
}

export interface MassiveAggregate {
  c: number  // Close price
  h: number  // High price
  l: number  // Low price
  n: number  // Number of transactions
  o: number  // Open price
  t: number  // Timestamp (Unix ms)
  v: number  // Volume
  vw: number // Volume weighted average price
}

export interface MassiveTicker {
  ticker: string
  name: string
  market: string
  locale: string
  primary_exchange: string
  type: string
  active: boolean
  currency_name: string
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const key = process.env.MESSARI_API_KEY || process.env.MASSIVE_API_KEY
  if (!key) {
    throw new Error('MASSIVE_API_KEY or MESSARI_API_KEY is not set')
  }
  return key
}

/**
 * Make authenticated request to Massive API
 */
async function massiveRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const response = await axios.get<T>(`${MASSIVE_BASE_URL}${endpoint}`, {
    params: {
      ...params,
      apiKey: getApiKey()
    }
  })
  return response.data
}

/**
 * Get previous day's aggregates for a stock
 */
export async function getPreviousDayAggs(symbol: string): Promise<MassiveQuote | null> {
  try {
    const data = await massiveRequest<{
      results: MassiveAggregate[]
      ticker: string
      status: string
    }>(`/aggs/ticker/${symbol}/prev`)

    if (data.status !== 'OK' || !data.results?.[0]) {
      return null
    }

    const agg = data.results[0]
    const change = agg.c - agg.o
    const changePercent = (change / agg.o) * 100

    return {
      symbol,
      price: agg.c,
      change,
      changePercent,
      volume: agg.v,
      high: agg.h,
      low: agg.l,
      open: agg.o,
      previousClose: agg.o
    }
  } catch (error) {
    console.error(`Error fetching previous day aggs for ${symbol}:`, error)
    return null
  }
}

/**
 * Get real-time snapshot for a stock
 */
export async function getStockSnapshot(symbol: string): Promise<MassiveQuote | null> {
  try {
    const data = await massiveRequest<{
      results: {
        ticker: string
        todaysChange: number
        todaysChangePerc: number
        updated: number
        day: {
          c: number
          h: number
          l: number
          o: number
          v: number
          vw: number
        }
        prevDay: {
          c: number
          h: number
          l: number
          o: number
          v: number
          vw: number
        }
      }
      status: string
    }>(`/snapshot/ticker/${symbol}`)

    if (data.status !== 'OK' || !data.results) {
      return null
    }

    const result = data.results
    return {
      symbol,
      price: result.day?.c || result.prevDay?.c || 0,
      change: result.todaysChange || 0,
      changePercent: result.todaysChangePerc || 0,
      volume: result.day?.v || 0,
      high: result.day?.h || 0,
      low: result.day?.l || 0,
      open: result.day?.o || 0,
      previousClose: result.prevDay?.c || 0
    }
  } catch (error) {
    console.error(`Error fetching snapshot for ${symbol}:`, error)
    return null
  }
}

/**
 * Get aggregates for date range
 */
export async function getAggregates(
  symbol: string,
  multiplier: number = 1,
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'day',
  from: string,
  to: string
): Promise<MassiveAggregate[]> {
  try {
    const data = await massiveRequest<{
      results: MassiveAggregate[]
      status: string
    }>(`/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`)

    if (data.status !== 'OK') {
      return []
    }

    return data.results || []
  } catch (error) {
    console.error(`Error fetching aggregates for ${symbol}:`, error)
    return []
  }
}

/**
 * Get forex quote
 */
export async function getForexQuote(from: string, to: string): Promise<MassiveQuote | null> {
  try {
    const data = await massiveRequest<{
      last: {
        ask: number
        bid: number
        exchange: number
        timestamp: number
      }
      status: string
      symbol: string
    }>(`/last_quote/currencies/${from}/${to}`)

    if (data.status !== 'OK' || !data.last) {
      return null
    }

    const price = (data.last.ask + data.last.bid) / 2

    return {
      symbol: `${from}/${to}`,
      price,
      change: 0, // Need previous data to calculate
      changePercent: 0,
      volume: 0,
      high: data.last.ask,
      low: data.last.bid,
      open: price,
      previousClose: price
    }
  } catch (error) {
    console.error(`Error fetching forex quote for ${from}/${to}:`, error)
    return null
  }
}

/**
 * Get crypto aggregates
 */
export async function getCryptoAggregates(
  symbol: string,
  multiplier: number = 1,
  timespan: 'minute' | 'hour' | 'day' = 'day',
  from: string,
  to: string
): Promise<MassiveAggregate[]> {
  try {
    // Crypto symbols in Massive use X: prefix
    const cryptoSymbol = symbol.startsWith('X:') ? symbol : `X:${symbol.replace('-', '')}`

    const data = await massiveRequest<{
      results: MassiveAggregate[]
      status: string
    }>(`/aggs/ticker/${cryptoSymbol}/range/${multiplier}/${timespan}/${from}/${to}`)

    if (data.status !== 'OK') {
      return []
    }

    return data.results || []
  } catch (error) {
    console.error(`Error fetching crypto aggregates for ${symbol}:`, error)
    return []
  }
}

/**
 * Search for tickers
 */
export async function searchTickers(
  query: string,
  market?: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices'
): Promise<MassiveTicker[]> {
  try {
    const params: Record<string, string> = {
      search: query,
      active: 'true',
      limit: '20'
    }

    if (market) {
      params.market = market
    }

    const data = await massiveRequest<{
      results: MassiveTicker[]
      status: string
    }>('/reference/tickers', params)

    if (data.status !== 'OK') {
      return []
    }

    return data.results || []
  } catch (error) {
    console.error(`Error searching tickers for ${query}:`, error)
    return []
  }
}

/**
 * Get market status
 */
export async function getMarketStatus(): Promise<{
  market: string
  serverTime: string
  exchanges: Record<string, string>
  currencies: Record<string, string>
} | null> {
  try {
    const data = await massiveRequest<{
      market: string
      serverTime: string
      exchanges: Record<string, string>
      currencies: Record<string, string>
      status: string
    }>('/marketstatus/now')

    if (data.status !== 'OK') {
      return null
    }

    return {
      market: data.market,
      serverTime: data.serverTime,
      exchanges: data.exchanges,
      currencies: data.currencies
    }
  } catch (error) {
    console.error('Error fetching market status:', error)
    return null
  }
}

/**
 * Get multiple stock snapshots
 */
export async function getMultipleSnapshots(symbols: string[]): Promise<MassiveQuote[]> {
  const promises = symbols.map(s => getStockSnapshot(s))
  const results = await Promise.all(promises)
  return results.filter((q): q is MassiveQuote => q !== null)
}

/**
 * Get stock quote with fallback to previous day
 */
export async function getStockQuote(symbol: string): Promise<MassiveQuote | null> {
  // Try snapshot first (real-time), fallback to previous day
  const snapshot = await getStockSnapshot(symbol)
  if (snapshot && snapshot.price > 0) {
    return snapshot
  }

  return getPreviousDayAggs(symbol)
}
