import { NextResponse } from 'next/server'
import {
  getUnifiedQuote,
  getUnifiedQuotes,
  getMarketStatus,
  detectMarketType,
  formatPrice
} from '@/lib/api/unified-market-data'
import { getTrendingStocks } from '@/lib/api/market-data'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/market-data?symbol=AAPL
 * GET /api/market-data?symbols=AAPL,TSLA,BTC-USD,EUR/USD,VCB.VN
 * GET /api/market-data?action=status&market=crypto
 * GET /api/market-data?action=trending
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const symbols = searchParams.get('symbols')
    const action = searchParams.get('action')
    const market = searchParams.get('market') as 'crypto' | 'forex' | 'stock' | 'vn-stock' | null

    // Check market status
    if (action === 'status') {
      const marketType = market || 'stock'
      const status = getMarketStatus(marketType)

      return NextResponse.json({
        success: true,
        market: marketType,
        ...status,
        timestamp: new Date().toISOString(),
      })
    }

    // Get trending stocks
    if (action === 'trending') {
      const trendingSymbols = await getTrendingStocks()
      const quotes = await getUnifiedQuotes(trendingSymbols)

      return NextResponse.json({
        success: true,
        data: quotes,
      })
    }

    // Get single quote
    if (symbol) {
      const quote = await getUnifiedQuote(symbol)

      if (!quote) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch data for ${symbol}` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...quote,
          formattedPrice: formatPrice(quote.price, quote.marketType)
        },
      })
    }

    // Get multiple quotes
    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim())
      const quotes = await getUnifiedQuotes(symbolList)

      return NextResponse.json({
        success: true,
        count: quotes.length,
        data: quotes.map(q => ({
          ...q,
          formattedPrice: formatPrice(q.price, q.marketType)
        })),
      })
    }

    return NextResponse.json(
      { success: false, error: 'Missing symbol or symbols parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
