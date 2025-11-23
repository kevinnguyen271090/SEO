/**
 * Unified Market Data Service
 * Combines data from multiple FREE sources (optimized for MVP):
 * - Binance (Crypto) - unlimited calls
 * - Yahoo Finance (US Stocks) - no API key needed
 * - Finnhub (Forex) - 60 calls/min free tier
 * - VN Stocks (simulated) - SSI API pending
 */

import { getCrypto24hrTicker, getMultipleCrypto24hrTickers, isCryptoSymbol, CryptoQuote } from './binance'
import { getForexQuote, getMultipleForexQuotes, isForexSymbol, ForexQuote, getStockQuote as getFinnhubStockQuote } from './finnhub'
import { getVNStockQuote, getMultipleVNStockQuotes, isVNStockSymbol, VNStockQuote } from './vn-stocks'
import { getQuote, getMultipleQuotes, MarketQuote } from './market-data'
// Massive API available but limited to 5 calls/min on free tier
// import { getStockQuote as getMassiveStockQuote, getMultipleSnapshots } from './massive'

export type MarketType = 'crypto' | 'forex' | 'stock' | 'vn-stock'

export interface UnifiedQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume?: number
  high?: number
  low?: number
  marketType: MarketType
  currency: string
  lastUpdated: Date
}

/**
 * Detect market type from symbol
 */
export function detectMarketType(symbol: string): MarketType {
  if (isCryptoSymbol(symbol)) {
    return 'crypto'
  }
  if (isForexSymbol(symbol)) {
    return 'forex'
  }
  if (isVNStockSymbol(symbol)) {
    return 'vn-stock'
  }
  return 'stock'
}

/**
 * Get currency symbol based on market type
 */
export function getCurrencySymbol(marketType: MarketType, symbol?: string): string {
  switch (marketType) {
    case 'crypto':
      return '$'
    case 'forex':
      // For forex, the currency depends on the pair
      if (symbol?.includes('JPY')) return '¥'
      if (symbol?.includes('GBP') && !symbol?.startsWith('GBP')) return '£'
      if (symbol?.includes('EUR') && !symbol?.startsWith('EUR')) return '€'
      return '$'
    case 'vn-stock':
      return '₫'
    case 'stock':
    default:
      return '$'
  }
}

/**
 * Format price based on market type
 */
export function formatPrice(price: number, marketType: MarketType): string {
  switch (marketType) {
    case 'crypto':
      // Crypto can have very small or very large prices
      if (price < 0.01) return price.toFixed(6)
      if (price < 1) return price.toFixed(4)
      if (price < 100) return price.toFixed(2)
      return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
    case 'forex':
      // Forex typically shows 4-5 decimal places
      return price.toFixed(5)
    case 'vn-stock':
      // VN stocks are in VND (usually thousands)
      return new Intl.NumberFormat('vi-VN').format(price)
    case 'stock':
    default:
      return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
}

/**
 * Get quote for a single symbol (auto-detects market type)
 */
export async function getUnifiedQuote(symbol: string): Promise<UnifiedQuote | null> {
  const marketType = detectMarketType(symbol)

  try {
    switch (marketType) {
      case 'crypto': {
        const quote = await getCrypto24hrTicker(symbol)
        if (!quote) return null
        return transformToUnified(quote, marketType)
      }
      case 'forex': {
        const quote = await getForexQuote(symbol)
        if (!quote) return null
        return transformToUnified(quote, marketType)
      }
      case 'vn-stock': {
        const quote = await getVNStockQuote(symbol)
        if (!quote) return null
        return transformToUnified(quote, marketType)
      }
      case 'stock':
      default: {
        // Primary: Yahoo Finance (no API key needed, reliable)
        const yahooQuote = await getQuote(symbol)
        if (yahooQuote && yahooQuote.price > 0) {
          return {
            symbol: yahooQuote.symbol,
            name: yahooQuote.symbol,
            price: yahooQuote.price,
            change: yahooQuote.change,
            changePercent: yahooQuote.changePercent,
            volume: yahooQuote.volume,
            marketType: 'stock',
            currency: '$',
            lastUpdated: yahooQuote.timestamp
          }
        }

        // Fallback: Finnhub (60 calls/min)
        const finnhubQuote = await getFinnhubStockQuote(symbol)
        if (finnhubQuote && finnhubQuote.price > 0) {
          return transformToUnified(finnhubQuote, marketType)
        }

        return null
      }
    }
  } catch (error) {
    console.error(`Error fetching unified quote for ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch multiple stock quotes
 * Primary: Yahoo Finance (no rate limit, no API key)
 */
async function fetchMultipleStockQuotes(symbols: string[]): Promise<MarketQuote[]> {
  return getMultipleQuotes(symbols)
}

/**
 * Get quotes for multiple symbols (optimized for batching)
 */
export async function getUnifiedQuotes(symbols: string[]): Promise<UnifiedQuote[]> {
  // Group symbols by market type
  const cryptoSymbols: string[] = []
  const forexSymbols: string[] = []
  const vnStockSymbols: string[] = []
  const stockSymbols: string[] = []

  for (const symbol of symbols) {
    const marketType = detectMarketType(symbol)
    switch (marketType) {
      case 'crypto':
        cryptoSymbols.push(symbol)
        break
      case 'forex':
        forexSymbols.push(symbol)
        break
      case 'vn-stock':
        vnStockSymbols.push(symbol)
        break
      default:
        stockSymbols.push(symbol)
    }
  }

  // Fetch all quotes in parallel
  const [cryptoQuotes, forexQuotes, vnQuotes, stockQuotes] = await Promise.all([
    cryptoSymbols.length > 0 ? getMultipleCrypto24hrTickers(cryptoSymbols) : [],
    forexSymbols.length > 0 ? getMultipleForexQuotes(forexSymbols) : [],
    vnStockSymbols.length > 0 ? getMultipleVNStockQuotes(vnStockSymbols) : [],
    stockSymbols.length > 0 ? fetchMultipleStockQuotes(stockSymbols) : []
  ])

  // Transform and combine results
  const results: UnifiedQuote[] = []

  for (const quote of cryptoQuotes) {
    results.push(transformToUnified(quote, 'crypto'))
  }

  for (const quote of forexQuotes) {
    results.push(transformToUnified(quote, 'forex'))
  }

  for (const quote of vnQuotes) {
    results.push(transformToUnified(quote, 'vn-stock'))
  }

  for (const quote of stockQuotes) {
    results.push({
      symbol: quote.symbol,
      name: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      marketType: 'stock',
      currency: '$',
      lastUpdated: quote.timestamp
    })
  }

  return results
}

/**
 * Transform specific quote type to unified format
 */
function transformToUnified(
  quote: CryptoQuote | ForexQuote | VNStockQuote | { symbol: string; name: string; price: number; change: number; changePercent: number; high: number; low: number; marketType: string },
  marketType: MarketType
): UnifiedQuote {
  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    high: 'high24h' in quote ? quote.high24h : 'high' in quote ? quote.high : undefined,
    low: 'low24h' in quote ? quote.low24h : 'low' in quote ? quote.low : undefined,
    volume: 'volume' in quote ? quote.volume : undefined,
    marketType,
    currency: getCurrencySymbol(marketType, quote.symbol),
    lastUpdated: new Date()
  }
}

/**
 * Get market status
 */
export function getMarketStatus(marketType: MarketType): {
  isOpen: boolean
  message: string
} {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcDay = now.getUTCDay()

  switch (marketType) {
    case 'crypto':
      // Crypto markets are 24/7
      return { isOpen: true, message: '24/7 Trading' }

    case 'forex':
      // Forex is open 24/5 (closed on weekends)
      const isWeekend = utcDay === 0 || utcDay === 6
      return {
        isOpen: !isWeekend,
        message: isWeekend ? 'Closed (Weekend)' : '24h Trading'
      }

    case 'vn-stock':
      // Vietnam market: Mon-Fri, 9:00-15:00 ICT (UTC+7) = 2:00-8:00 UTC
      const isVNWeekday = utcDay >= 1 && utcDay <= 5
      const isVNTradingHours = utcHour >= 2 && utcHour < 8
      return {
        isOpen: isVNWeekday && isVNTradingHours,
        message: isVNWeekday && isVNTradingHours ? 'Market Open' : 'Market Closed'
      }

    case 'stock':
    default:
      // US market: Mon-Fri, 9:30-16:00 ET = 14:30-21:00 UTC
      const isUSWeekday = utcDay >= 1 && utcDay <= 5
      const isUSTradingHours = (utcHour === 14 && now.getUTCMinutes() >= 30) ||
                               (utcHour > 14 && utcHour < 21)
      return {
        isOpen: isUSWeekday && isUSTradingHours,
        message: isUSWeekday && isUSTradingHours ? 'Market Open' : 'Market Closed'
      }
  }
}
