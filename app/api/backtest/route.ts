import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { db } from '@/lib/db'
import { runBacktest, type BacktestStrategy } from '@/lib/backtesting/engine'

export async function POST(request: Request) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { symbol, strategy, startDate, endDate, initialBalance, userId = 'demo-user' } = body

    // Validation
    if (!symbol || !strategy || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Run backtest
    const result = await runBacktest(
      symbol,
      strategy as BacktestStrategy,
      new Date(startDate),
      new Date(endDate),
      initialBalance || 100000
    )

    // Save backtest result to database (commented out for now - needs user auth)
    // const backtest = await db.backtest.create({
    //   data: {
    //     userId,
    //     name: `${strategy.name} - ${symbol}`,
    //     strategyConfig: JSON.stringify(strategy),
    //     symbols: symbol,
    //     startDate: new Date(startDate),
    //     endDate: new Date(endDate),
    //     totalTrades: result.totalTrades,
    //     winningTrades: result.winningTrades,
    //     losingTrades: result.losingTrades,
    //     winRate: result.winRate,
    //     profitFactor: result.profitFactor,
    //     maxDrawdown: result.maxDrawdownPercent,
    //     totalReturn: result.totalReturnPercent,
    //     sharpeRatio: result.sharpeRatio,
    //     results: JSON.stringify(result.trades),
    //   },
    // })

    return NextResponse.json({
      success: true,
      // backtestId: backtest.id,
      result,
    })
  } catch (error: any) {
    console.error('Backtest error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run backtest' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Commented out for MVP - will enable after proper auth
    return NextResponse.json({
      success: true,
      backtests: [],
    })
  } catch (error) {
    console.error('Get backtest error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backtests' },
      { status: 500 }
    )
  }
}
