/**
 * Finnhub API Client
 * Fetches real-time Forex and Stock data
 * Docs: https://finnhub.io/docs/api
 */

import axios from 'axios'

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

export interface FinnhubQuote {
  c: number  // Current price
  d: number  // Change
  dp: number // Percent change
  h: number  // High price of the day
  l: number  // Low price of the day
  o: number  // Open price of the day
  pc: number // Previous close price
  t: number  // Timestamp
}

export interface ForexQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  marketType: 'forex'
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  marketType: 'stock'
}

// Common Forex pairs
export const FOREX_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen' },
  { symbol: 'XAU/USD', name: 'Gold / US Dollar' },
  { symbol: 'XAG/USD', name: 'Silver / US Dollar' },
]

const FOREX_NAMES: Record<string, string> = Object.fromEntries(
  FOREX_PAIRS.map(p => [p.symbol, p.name])
)

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key) {
    throw new Error('FINNHUB_API_KEY is not set')
  }
  return key
}

/**
 * Convert forex symbol to Finnhub format
 * EUR/USD -> OANDA:EUR_USD
 */
export function toFinnhubForexSymbol(symbol: string): string {
  return `OANDA:${symbol.replace('/', '_')}`
}

/**
 * Get quote for a stock symbol
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await axios.get<FinnhubQuote>(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol,
        token: getApiKey()
      }
    })

    const data = response.data

    // Check if we got valid data
    if (data.c === 0 && data.d === 0) {
      return null
    }

    return {
      symbol,
      name: symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      marketType: 'stock'
    }
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error)
    return null
  }
}

/**
 * Get quote for a forex pair
 */
export async function getForexQuote(symbol: string): Promise<ForexQuote | null> {
  try {
    const finnhubSymbol = toFinnhubForexSymbol(symbol)
    const response = await axios.get<FinnhubQuote>(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: finnhubSymbol,
        token: getApiKey()
      }
    })

    const data = response.data

    // Check if we got valid data
    if (data.c === 0 && data.d === 0) {
      return null
    }

    return {
      symbol,
      name: FOREX_NAMES[symbol] || symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      marketType: 'forex'
    }
  } catch (error) {
    console.error(`Error fetching forex quote for ${symbol}:`, error)
    return null
  }
}

/**
 * Get quotes for multiple forex pairs
 */
export async function getMultipleForexQuotes(symbols: string[]): Promise<ForexQuote[]> {
  const promises = symbols.map(s => getForexQuote(s))
  const results = await Promise.all(promises)
  return results.filter((q): q is ForexQuote => q !== null)
}

/**
 * Get quotes for multiple stocks
 */
export async function getMultipleStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  const promises = symbols.map(s => getStockQuote(s))
  const results = await Promise.all(promises)
  return results.filter((q): q is StockQuote => q !== null)
}

/**
 * Check if symbol is forex
 */
export function isForexSymbol(symbol: string): boolean {
  return symbol.includes('/') && (
    symbol.includes('USD') ||
    symbol.includes('EUR') ||
    symbol.includes('GBP') ||
    symbol.includes('JPY') ||
    symbol.includes('XAU') ||
    symbol.includes('XAG')
  )
}

/**
 * Get company profile (for stock name)
 */
export async function getCompanyProfile(symbol: string): Promise<{ name: string } | null> {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
      params: {
        symbol: symbol,
        token: getApiKey()
      }
    })

    return { name: response.data.name || symbol }
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error)
    return null
  }
}
