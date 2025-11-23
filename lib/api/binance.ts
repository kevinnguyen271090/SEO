/**
 * Binance API Client
 * Fetches real-time crypto data from Binance
 * Docs: https://developers.binance.com/docs/binance-spot-api-docs/rest-api
 */

import axios from 'axios'

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3'

export interface BinancePrice {
  symbol: string
  price: string
}

export interface Binance24hrTicker {
  symbol: string
  priceChange: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  quoteVolume: string
  openPrice: string
  highPrice: string
  lowPrice: string
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

// Map common crypto symbols to Binance format
const SYMBOL_MAP: Record<string, string> = {
  'BTC-USD': 'BTCUSDT',
  'ETH-USD': 'ETHUSDT',
  'BNB-USD': 'BNBUSDT',
  'XRP-USD': 'XRPUSDT',
  'SOL-USD': 'SOLUSDT',
  'ADA-USD': 'ADAUSDT',
  'DOGE-USD': 'DOGEUSDT',
  'DOT-USD': 'DOTUSDT',
  'MATIC-USD': 'MATICUSDT',
  'SHIB-USD': 'SHIBUSDT',
  'AVAX-USD': 'AVAXUSDT',
  'LINK-USD': 'LINKUSDT',
  'UNI-USD': 'UNIUSDT',
  'ATOM-USD': 'ATOMUSDT',
  'LTC-USD': 'LTCUSDT',
  'FIL-USD': 'FILUSDT',
  'APT-USD': 'APTUSDT',
  'ARB-USD': 'ARBUSDT',
  'OP-USD': 'OPUSDT',
  'NEAR-USD': 'NEARUSDT',
  'PEPE-USD': 'PEPEUSDT',
  'SUI-USD': 'SUIUSDT',
  'INJ-USD': 'INJUSDT',
  'SEI-USD': 'SEIUSDT',
  'TIA-USD': 'TIAUSDT',
}

// Crypto names for display
const CRYPTO_NAMES: Record<string, string> = {
  'BTCUSDT': 'Bitcoin',
  'ETHUSDT': 'Ethereum',
  'BNBUSDT': 'Binance Coin',
  'XRPUSDT': 'Ripple',
  'SOLUSDT': 'Solana',
  'ADAUSDT': 'Cardano',
  'DOGEUSDT': 'Dogecoin',
  'DOTUSDT': 'Polkadot',
  'MATICUSDT': 'Polygon',
  'SHIBUSDT': 'Shiba Inu',
  'AVAXUSDT': 'Avalanche',
  'LINKUSDT': 'Chainlink',
  'UNIUSDT': 'Uniswap',
  'ATOMUSDT': 'Cosmos',
  'LTCUSDT': 'Litecoin',
  'FILUSDT': 'Filecoin',
  'APTUSDT': 'Aptos',
  'ARBUSDT': 'Arbitrum',
  'OPUSDT': 'Optimism',
  'NEARUSDT': 'NEAR Protocol',
  'PEPEUSDT': 'Pepe',
  'SUIUSDT': 'Sui',
  'INJUSDT': 'Injective',
  'SEIUSDT': 'Sei',
  'TIAUSDT': 'Celestia',
}

/**
 * Convert symbol to Binance format
 */
export function toBinanceSymbol(symbol: string): string {
  // Check if it's in our map
  if (SYMBOL_MAP[symbol]) {
    return SYMBOL_MAP[symbol]
  }
  // If it ends with -USD, convert to USDT
  if (symbol.endsWith('-USD')) {
    return symbol.replace('-USD', 'USDT')
  }
  // If it already has USDT, return as is
  if (symbol.endsWith('USDT')) {
    return symbol
  }
  // Otherwise, assume it's a crypto symbol and add USDT
  return `${symbol}USDT`
}

/**
 * Convert Binance symbol back to standard format
 */
export function fromBinanceSymbol(binanceSymbol: string): string {
  return binanceSymbol.replace('USDT', '-USD')
}

/**
 * Get current price for a single crypto
 */
export async function getCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const binanceSymbol = toBinanceSymbol(symbol)
    const response = await axios.get<BinancePrice>(`${BINANCE_BASE_URL}/ticker/price`, {
      params: { symbol: binanceSymbol }
    })
    return parseFloat(response.data.price)
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error)
    return null
  }
}

/**
 * Get 24hr ticker data for a crypto
 */
export async function getCrypto24hrTicker(symbol: string): Promise<CryptoQuote | null> {
  try {
    const binanceSymbol = toBinanceSymbol(symbol)
    const response = await axios.get<Binance24hrTicker>(`${BINANCE_BASE_URL}/ticker/24hr`, {
      params: { symbol: binanceSymbol }
    })

    const data = response.data
    const standardSymbol = fromBinanceSymbol(binanceSymbol)

    return {
      symbol: standardSymbol,
      name: CRYPTO_NAMES[binanceSymbol] || standardSymbol,
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChange),
      changePercent: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.quoteVolume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      marketType: 'crypto'
    }
  } catch (error) {
    console.error(`Error fetching 24hr ticker for ${symbol}:`, error)
    return null
  }
}

/**
 * Get 24hr ticker data for multiple cryptos
 */
export async function getMultipleCrypto24hrTickers(symbols: string[]): Promise<CryptoQuote[]> {
  try {
    // Get all tickers at once (more efficient)
    const response = await axios.get<Binance24hrTicker[]>(`${BINANCE_BASE_URL}/ticker/24hr`)

    const binanceSymbols = symbols.map(s => toBinanceSymbol(s))
    const results: CryptoQuote[] = []

    for (const ticker of response.data) {
      if (binanceSymbols.includes(ticker.symbol)) {
        const standardSymbol = fromBinanceSymbol(ticker.symbol)
        results.push({
          symbol: standardSymbol,
          name: CRYPTO_NAMES[ticker.symbol] || standardSymbol,
          price: parseFloat(ticker.lastPrice),
          change: parseFloat(ticker.priceChange),
          changePercent: parseFloat(ticker.priceChangePercent),
          volume: parseFloat(ticker.quoteVolume),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          marketType: 'crypto'
        })
      }
    }

    return results
  } catch (error) {
    console.error('Error fetching multiple crypto tickers:', error)
    // Fallback to individual requests
    const promises = symbols.map(s => getCrypto24hrTicker(s))
    const results = await Promise.all(promises)
    return results.filter((q): q is CryptoQuote => q !== null)
  }
}

/**
 * Get all available crypto trading pairs
 */
export async function getAvailableCryptoPairs(): Promise<string[]> {
  try {
    const response = await axios.get(`${BINANCE_BASE_URL}/exchangeInfo`)
    const symbols = response.data.symbols
      .filter((s: { quoteAsset: string; status: string }) =>
        s.quoteAsset === 'USDT' && s.status === 'TRADING'
      )
      .map((s: { symbol: string }) => fromBinanceSymbol(s.symbol))

    return symbols
  } catch (error) {
    console.error('Error fetching available pairs:', error)
    return []
  }
}

/**
 * Check if a symbol is a crypto symbol
 */
export function isCryptoSymbol(symbol: string): boolean {
  return symbol.endsWith('-USD') ||
         symbol.endsWith('USDT') ||
         Object.keys(SYMBOL_MAP).includes(symbol)
}
