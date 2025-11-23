import { NextResponse } from 'next/server'
import { getQuote, getMultipleQuotes, getTrendingStocks, isMarketOpen } from '@/lib/api/market-data'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/market-data?symbol=AAPL
 * or
 * GET /api/market-data?symbols=AAPL,TSLA,NVDA
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const symbols = searchParams.get('symbols')
    const action = searchParams.get('action')

    // Check market status
    if (action === 'status') {
      return NextResponse.json({
        isOpen: isMarketOpen(),
        timestamp: new Date().toISOString(),
      })
    }

    // Get trending stocks
    if (action === 'trending') {
      const trendingSymbols = await getTrendingStocks()
      const quotes = await getMultipleQuotes(trendingSymbols)

      return NextResponse.json({
        success: true,
        data: quotes,
      })
    }

    // Get single quote
    if (symbol) {
      const quote = await getQuote(symbol)

      if (!quote) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch data for ${symbol}` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: quote,
      })
    }

    // Get multiple quotes
    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim())
      const quotes = await getMultipleQuotes(symbolList)

      return NextResponse.json({
        success: true,
        count: quotes.length,
        data: quotes,
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
