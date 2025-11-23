import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { db } from '@/lib/db'
import { getQuote } from '@/lib/api/market-data'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/portfolio
 * Get user's portfolios
 */
export async function GET(request: Request) {
  try {
    // For MVP, return demo portfolio
    // TODO: Enable auth after proper setup
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('id')
    const userId = searchParams.get('userId') || 'demo-user'

    if (portfolioId) {
      // Get specific portfolio with trades
      const portfolio = await db.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          trades: {
            orderBy: { entryDate: 'desc' },
            take: 50,
          },
        },
      })

      if (!portfolio) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
      }

      // Calculate current P&L
      const openTrades = portfolio.trades.filter(t => t.status === 'open')
      let totalPnL = 0

      for (const trade of openTrades) {
        const quote = await getQuote(trade.symbol)
        if (quote) {
          const currentPnL = (quote.price - trade.entryPrice) * trade.quantity
          totalPnL += currentPnL
        }
      }

      // Add closed trades P&L
      const closedPnL = portfolio.trades
        .filter(t => t.status === 'closed')
        .reduce((sum, t) => sum + (t.pnl || 0), 0)

      return NextResponse.json({
        success: true,
        portfolio: {
          ...portfolio,
          currentValue: portfolio.balance + totalPnL + closedPnL,
          totalPnL: totalPnL + closedPnL,
          openPositions: openTrades.length,
        },
      })
    }

    // Get all user portfolios
    const portfolios = await db.portfolio.findMany({
      where: { userId },
      include: {
        trades: {
          where: { status: 'open' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      portfolios: portfolios.map(p => ({
        ...p,
        openPositions: p.trades.length,
      })),
    })
  } catch (error) {
    console.error('Get portfolio error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/portfolio/trade
 * Execute a trade (buy/sell)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { portfolioId, symbol, type, quantity, signalId, userId = 'demo-user' } = body

    // Validation
    if (!portfolioId || !symbol || !type || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid trade type' },
        { status: 400 }
      )
    }

    // Get portfolio
    const portfolio = await db.portfolio.findUnique({
      where: { id: portfolioId },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get current price
    const quote = await getQuote(symbol)
    if (!quote) {
      return NextResponse.json(
        { error: `Failed to fetch price for ${symbol}` },
        { status: 400 }
      )
    }

    const entryPrice = quote.price
    const totalCost = entryPrice * quantity

    if (type === 'BUY') {
      // Check if user has enough balance
      if (portfolio.balance < totalCost) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }

      // Create trade
      const trade = await db.trade.create({
        data: {
          portfolioId,
          signalId,
          symbol,
          type: 'BUY',
          quantity,
          entryPrice,
          status: 'open',
        },
      })

      // Update portfolio balance
      await db.portfolio.update({
        where: { id: portfolioId },
        data: { balance: portfolio.balance - totalCost },
      })

      return NextResponse.json({
        success: true,
        trade,
        message: `Successfully bought ${quantity} shares of ${symbol} at $${entryPrice.toFixed(2)}`,
      })
    } else {
      // SELL - close existing position
      const openTrade = await db.trade.findFirst({
        where: {
          portfolioId,
          symbol,
          status: 'open',
        },
      })

      if (!openTrade) {
        return NextResponse.json(
          { error: `No open position for ${symbol}` },
          { status: 400 }
        )
      }

      if (openTrade.quantity < quantity) {
        return NextResponse.json(
          { error: 'Insufficient shares to sell' },
          { status: 400 }
        )
      }

      const exitPrice = entryPrice
      const pnl = (exitPrice - openTrade.entryPrice) * quantity
      const pnlPercent = ((exitPrice - openTrade.entryPrice) / openTrade.entryPrice) * 100

      // Update trade
      const updatedTrade = await db.trade.update({
        where: { id: openTrade.id },
        data: {
          exitPrice,
          exitDate: new Date(),
          pnl,
          pnlPercent,
          status: 'closed',
          quantity: openTrade.quantity - quantity, // Update remaining quantity
        },
      })

      // If fully closed, mark as closed
      if (updatedTrade.quantity === 0) {
        await db.trade.update({
          where: { id: openTrade.id },
          data: { status: 'closed' },
        })
      }

      // Update portfolio balance
      const proceeds = exitPrice * quantity
      await db.portfolio.update({
        where: { id: portfolioId },
        data: { balance: portfolio.balance + proceeds },
      })

      return NextResponse.json({
        success: true,
        trade: updatedTrade,
        pnl,
        pnlPercent,
        message: `Successfully sold ${quantity} shares of ${symbol} at $${exitPrice.toFixed(2)}. P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`,
      })
    }
  } catch (error: any) {
    console.error('Trade execution error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to execute trade' },
      { status: 500 }
    )
  }
}
