/**
 * CoinGecko API Client
 * Free crypto data API - more reliable than Binance in many regions
 * Docs: https://docs.coingecko.com/v3.0.1/reference/introduction
 * Rate limit: 10-30 calls/min on free tier
 */

import axios from 'axios'

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

export interface CoinGeckoPrice {
  [key: string]: {
    usd: number
    usd_24h_change: number
    usd_24h_vol: number
    usd_market_cap: number
  }
}

export interface CryptoQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  marketType: 'crypto'
}

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTC-USD': 'bitcoin',
  'ETH-USD': 'ethereum',
  'BNB-USD': 'binancecoin',
  'XRP-USD': 'ripple',
  'SOL-USD': 'solana',
  'ADA-USD': 'cardano',
  'DOGE-USD': 'dogecoin',
  'DOT-USD': 'polkadot',
  'MATIC-USD': 'matic-network',
  'SHIB-USD': 'shiba-inu',
  'AVAX-USD': 'avalanche-2',
  'LINK-USD': 'chainlink',
  'UNI-USD': 'uniswap',
  'ATOM-USD': 'cosmos',
  'LTC-USD': 'litecoin',
  'FIL-USD': 'filecoin',
  'APT-USD': 'aptos',
  'ARB-USD': 'arbitrum',
  'OP-USD': 'optimism',
  'NEAR-USD': 'near',
  'PEPE-USD': 'pepe',
  'SUI-USD': 'sui',
  'INJ-USD': 'injective-protocol',
  'SEI-USD': 'sei-network',
  'TIA-USD': 'celestia',
}

// Reverse map: CoinGecko ID to symbol
const COINGECKO_ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(SYMBOL_TO_COINGECKO_ID).map(([k, v]) => [v, k])
)

// Crypto names for display
const CRYPTO_NAMES: Record<string, string> = {
  'BTC-USD': 'Bitcoin',
  'ETH-USD': 'Ethereum',
  'BNB-USD': 'Binance Coin',
  'XRP-USD': 'Ripple',
  'SOL-USD': 'Solana',
  'ADA-USD': 'Cardano',
  'DOGE-USD': 'Dogecoin',
  'DOT-USD': 'Polkadot',
  'MATIC-USD': 'Polygon',
  'SHIB-USD': 'Shiba Inu',
  'AVAX-USD': 'Avalanche',
  'LINK-USD': 'Chainlink',
  'UNI-USD': 'Uniswap',
  'ATOM-USD': 'Cosmos',
  'LTC-USD': 'Litecoin',
  'FIL-USD': 'Filecoin',
  'APT-USD': 'Aptos',
  'ARB-USD': 'Arbitrum',
  'OP-USD': 'Optimism',
  'NEAR-USD': 'NEAR Protocol',
  'PEPE-USD': 'Pepe',
  'SUI-USD': 'Sui',
  'INJ-USD': 'Injective',
  'SEI-USD': 'Sei',
  'TIA-USD': 'Celestia',
}

/**
 * Get CoinGecko ID from symbol
 */
export function toCoinGeckoId(symbol: string): string | null {
  // Check direct mapping first
  if (SYMBOL_TO_COINGECKO_ID[symbol]) {
    return SYMBOL_TO_COINGECKO_ID[symbol]
  }

  // Try to extract base from -USD format
  if (symbol.endsWith('-USD')) {
    const base = symbol.replace('-USD', '').toLowerCase()
    // Check if we have a mapping for this base
    for (const [key, id] of Object.entries(SYMBOL_TO_COINGECKO_ID)) {
      if (key.toLowerCase().startsWith(base)) {
        return id
      }
    }
  }

  return null
}

/**
 * Check if symbol is a crypto symbol
 */
export function isCryptoSymbol(symbol: string): boolean {
  return symbol.endsWith('-USD') ||
         symbol.endsWith('USDT') ||
         Object.keys(SYMBOL_TO_COINGECKO_ID).includes(symbol)
}

/**
 * Get crypto quote using CoinGecko Simple Price API
 */
export async function getCrypto24hrTicker(symbol: string): Promise<CryptoQuote | null> {
  try {
    const coinId = toCoinGeckoId(symbol)
    if (!coinId) {
      console.error(`Unknown crypto symbol: ${symbol}`)
      return null
    }

    const response = await axios.get<CoinGeckoPrice>(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true
      },
      timeout: 10000
    })

    const data = response.data[coinId]
    if (!data) {
      console.error(`No data returned for ${coinId}`)
      return null
    }

    const price = data.usd
    const changePercent = data.usd_24h_change || 0
    const change = price * (changePercent / 100)

    return {
      symbol: symbol,
      name: CRYPTO_NAMES[symbol] || symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: data.usd_24h_vol || 0,
      high24h: price * 1.02, // Estimate (CoinGecko simple API doesn't include this)
      low24h: price * 0.98,  // Estimate
      marketType: 'crypto'
    }
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error)
    return null
  }
}

/**
 * Get multiple crypto quotes at once (more efficient)
 */
export async function getMultipleCrypto24hrTickers(symbols: string[]): Promise<CryptoQuote[]> {
  try {
    // Map symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {}
    const coinIds: string[] = []

    for (const symbol of symbols) {
      const coinId = toCoinGeckoId(symbol)
      if (coinId) {
        symbolToId[symbol] = coinId
        coinIds.push(coinId)
      }
    }

    if (coinIds.length === 0) {
      return []
    }

    const response = await axios.get<CoinGeckoPrice>(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinIds.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true
      },
      timeout: 15000
    })

    const results: CryptoQuote[] = []

    for (const symbol of symbols) {
      const coinId = symbolToId[symbol]
      if (!coinId) continue

      const data = response.data[coinId]
      if (!data) continue

      const price = data.usd
      const changePercent = data.usd_24h_change || 0
      const change = price * (changePercent / 100)

      results.push({
        symbol: symbol,
        name: CRYPTO_NAMES[symbol] || symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: data.usd_24h_vol || 0,
        high24h: price * 1.02,
        low24h: price * 0.98,
        marketType: 'crypto'
      })
    }

    return results
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error)

    // Fallback to individual requests
    const results: CryptoQuote[] = []
    for (const symbol of symbols) {
      const quote = await getCrypto24hrTicker(symbol)
      if (quote) {
        results.push(quote)
      }
    }
    return results
  }
}
