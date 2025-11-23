/**
 * Vietnam Stock API Client
 * Fetches data from available sources for Vietnam stocks (HOSE, HNX)
 *
 * Note: Real VN stock data requires SSI API or similar services.
 * This module provides a unified interface that can be extended.
 */

import axios from 'axios'

export interface VNStockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  marketType: 'vn-stock'
}

// VN Stock information database
export const VN_STOCKS: Record<string, { name: string; exchange: string }> = {
  // Banks
  'VCB': { name: 'Vietcombank', exchange: 'HOSE' },
  'BID': { name: 'BIDV', exchange: 'HOSE' },
  'CTG': { name: 'VietinBank', exchange: 'HOSE' },
  'TCB': { name: 'Techcombank', exchange: 'HOSE' },
  'MBB': { name: 'MB Bank', exchange: 'HOSE' },
  'VPB': { name: 'VPBank', exchange: 'HOSE' },
  'ACB': { name: 'ACB', exchange: 'HOSE' },
  'HDB': { name: 'HDBank', exchange: 'HOSE' },
  'STB': { name: 'Sacombank', exchange: 'HOSE' },
  'TPB': { name: 'TPBank', exchange: 'HOSE' },
  'LPB': { name: 'LienVietPostBank', exchange: 'HOSE' },
  'EIB': { name: 'Eximbank', exchange: 'HOSE' },
  'SHB': { name: 'SHB', exchange: 'HNX' },

  // Real Estate
  'VIC': { name: 'Vingroup', exchange: 'HOSE' },
  'VHM': { name: 'Vinhomes', exchange: 'HOSE' },
  'VRE': { name: 'Vincom Retail', exchange: 'HOSE' },
  'NVL': { name: 'Novaland', exchange: 'HOSE' },
  'KDH': { name: 'Khang Dien House', exchange: 'HOSE' },
  'DXG': { name: 'Dat Xanh', exchange: 'HOSE' },
  'PDR': { name: 'Phat Dat', exchange: 'HOSE' },
  'NLG': { name: 'Nam Long', exchange: 'HOSE' },

  // Tech
  'FPT': { name: 'FPT Corporation', exchange: 'HOSE' },
  'CMG': { name: 'CMC Group', exchange: 'HOSE' },

  // Retail
  'MWG': { name: 'The Gioi Di Dong', exchange: 'HOSE' },
  'PNJ': { name: 'Phu Nhuan Jewelry', exchange: 'HOSE' },
  'DGW': { name: 'Digiworld', exchange: 'HOSE' },

  // Industry & Manufacturing
  'HPG': { name: 'Hoa Phat Group', exchange: 'HOSE' },
  'HSG': { name: 'Hoa Sen Group', exchange: 'HOSE' },
  'NKG': { name: 'Nam Kim Steel', exchange: 'HOSE' },
  'GVR': { name: 'Vietnam Rubber', exchange: 'HOSE' },

  // Energy
  'GAS': { name: 'PV Gas', exchange: 'HOSE' },
  'PLX': { name: 'Petrolimex', exchange: 'HOSE' },
  'POW': { name: 'PV Power', exchange: 'HOSE' },
  'PVD': { name: 'PV Drilling', exchange: 'HOSE' },
  'PVS': { name: 'PV Technical Services', exchange: 'HNX' },
  'BSR': { name: 'Binh Son Refining', exchange: 'UPCOM' },

  // Consumer
  'MSN': { name: 'Masan Group', exchange: 'HOSE' },
  'VNM': { name: 'Vinamilk', exchange: 'HOSE' },
  'SAB': { name: 'Sabeco', exchange: 'HOSE' },
  'QNS': { name: 'QNS Sugar', exchange: 'UPCOM' },

  // Aviation & Logistics
  'HVN': { name: 'Vietnam Airlines', exchange: 'HOSE' },
  'VJC': { name: 'Vietjet Air', exchange: 'HOSE' },
  'ACV': { name: 'Airports Corp', exchange: 'UPCOM' },

  // Securities
  'SSI': { name: 'SSI Securities', exchange: 'HOSE' },
  'VND': { name: 'VNDirect', exchange: 'HOSE' },
  'HCM': { name: 'HCMC Securities', exchange: 'HOSE' },
  'VCI': { name: 'Viet Capital', exchange: 'HOSE' },

  // Insurance
  'BVH': { name: 'Bao Viet Holdings', exchange: 'HOSE' },

  // Utilities
  'REE': { name: 'REE Corporation', exchange: 'HOSE' },
  'PC1': { name: 'Power Construction 1', exchange: 'HOSE' },
  'NT2': { name: 'Nhon Trach 2 Power', exchange: 'HOSE' },
}

// Reference prices for VN stocks (approximate, in thousands VND)
const VN_REFERENCE_PRICES: Record<string, number> = {
  'VCB': 87000, 'BID': 45000, 'CTG': 31000, 'TCB': 24000, 'MBB': 21000,
  'VPB': 19000, 'ACB': 24000, 'HDB': 24000, 'STB': 30000, 'TPB': 18000,
  'VIC': 42000, 'VHM': 44000, 'VRE': 24000, 'NVL': 11000, 'KDH': 30000,
  'FPT': 125000, 'MWG': 52000, 'PNJ': 78000,
  'HPG': 25000, 'GAS': 78000, 'PLX': 40000, 'POW': 12000,
  'MSN': 75000, 'VNM': 72000, 'SAB': 58000,
  'VJC': 98000, 'SSI': 28000, 'VND': 18000,
}

/**
 * Normalize VN stock symbol (remove .VN suffix if present)
 */
export function normalizeVNSymbol(symbol: string): string {
  return symbol.replace('.VN', '').toUpperCase()
}

/**
 * Check if symbol is a VN stock
 */
export function isVNStockSymbol(symbol: string): boolean {
  const normalized = normalizeVNSymbol(symbol)
  return symbol.endsWith('.VN') ||
         normalized in VN_STOCKS ||
         symbol === 'VNINDEX' ||
         symbol === 'VN30'
}

/**
 * Try to fetch VN stock from available free sources
 * Currently using simulated data based on reference prices
 * TODO: Integrate with SSI API or other VN stock data providers when available
 */
export async function getVNStockQuote(symbol: string): Promise<VNStockQuote | null> {
  const normalized = normalizeVNSymbol(symbol)

  // Handle index symbols
  if (normalized === 'VNINDEX' || normalized === 'VN30') {
    return getVNIndexQuote(normalized)
  }

  const stockInfo = VN_STOCKS[normalized]
  if (!stockInfo) {
    return null
  }

  // Try to fetch from TCV (TradingView-compatible source)
  // Fallback to simulated data if unavailable
  try {
    // Attempt to fetch real data from a proxy or available API
    const realData = await fetchRealVNStockData(normalized)
    if (realData) {
      return realData
    }
  } catch (error) {
    console.log(`Using simulated data for ${symbol}`)
  }

  // Generate simulated data based on reference price
  return generateSimulatedVNQuote(normalized, stockInfo.name)
}

/**
 * Attempt to fetch real VN stock data
 * This function can be extended to use SSI API, Fireant, or other sources
 */
async function fetchRealVNStockData(symbol: string): Promise<VNStockQuote | null> {
  // TODO: Implement real data fetching when SSI API or MCP is available
  // For now, return null to fall back to simulated data

  // Example implementation for future SSI integration:
  // const SSI_API_URL = process.env.SSI_API_URL
  // if (SSI_API_URL) {
  //   const response = await axios.get(`${SSI_API_URL}/stock/${symbol}`)
  //   return transformSSIResponse(response.data)
  // }

  return null
}

/**
 * Generate simulated VN stock quote based on reference price
 * Uses deterministic variation based on current time (changes every minute)
 */
function generateSimulatedVNQuote(symbol: string, name: string): VNStockQuote {
  const refPrice = VN_REFERENCE_PRICES[symbol] || 50000

  // Create time-based variation (changes every minute)
  const now = new Date()
  const timeHash = now.getHours() * 60 + now.getMinutes()
  const symbolHash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const seed = (timeHash + symbolHash) % 1000

  // Generate realistic variation (-3% to +3%)
  const variation = (seed / 1000 - 0.5) * 0.06
  const price = Math.round(refPrice * (1 + variation))
  const change = price - refPrice
  const changePercent = (change / refPrice) * 100

  // Generate volume (random between 1M and 10M)
  const volume = Math.round((seed % 9 + 1) * 1000000)

  // High/Low based on variation
  const high = Math.round(price * 1.015)
  const low = Math.round(price * 0.985)

  return {
    symbol: `${symbol}.VN`,
    name,
    price,
    change,
    changePercent,
    volume,
    high,
    low,
    open: refPrice,
    previousClose: refPrice,
    marketType: 'vn-stock'
  }
}

/**
 * Get VN Index quote
 */
async function getVNIndexQuote(indexSymbol: string): Promise<VNStockQuote> {
  const baseValue = indexSymbol === 'VNINDEX' ? 1250 : 1280

  const now = new Date()
  const timeHash = now.getHours() * 60 + now.getMinutes()
  const variation = ((timeHash % 100) / 100 - 0.5) * 0.02

  const value = Math.round(baseValue * (1 + variation) * 100) / 100
  const change = Math.round((value - baseValue) * 100) / 100

  return {
    symbol: indexSymbol,
    name: indexSymbol === 'VNINDEX' ? 'VN-Index' : 'VN30 Index',
    price: value,
    change,
    changePercent: (change / baseValue) * 100,
    volume: Math.round(Math.random() * 500000000),
    high: Math.round(value * 1.005 * 100) / 100,
    low: Math.round(value * 0.995 * 100) / 100,
    open: baseValue,
    previousClose: baseValue,
    marketType: 'vn-stock'
  }
}

/**
 * Get quotes for multiple VN stocks
 */
export async function getMultipleVNStockQuotes(symbols: string[]): Promise<VNStockQuote[]> {
  const promises = symbols.map(s => getVNStockQuote(s))
  const results = await Promise.all(promises)
  return results.filter((q): q is VNStockQuote => q !== null)
}

/**
 * Get all available VN stock symbols
 */
export function getAvailableVNStocks(): { symbol: string; name: string; exchange: string }[] {
  return Object.entries(VN_STOCKS).map(([symbol, info]) => ({
    symbol: `${symbol}.VN`,
    name: info.name,
    exchange: info.exchange
  }))
}

/**
 * Format VN stock price (in thousands VND)
 */
export function formatVNPrice(price: number): string {
  if (price >= 1000) {
    return new Intl.NumberFormat('vi-VN').format(price)
  }
  return price.toFixed(2)
}
