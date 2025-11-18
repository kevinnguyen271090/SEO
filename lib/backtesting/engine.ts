/**
 * Backtesting Engine
 * Test trading strategies on historical data
 */

import { getHistoricalData, type HistoricalCandle } from '../api/market-data'
import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  isOversold,
  isOverbought,
  isMACDBullishCrossover,
  isMACDBearishCrossover,
} from '../indicators'

export interface BacktestStrategy {
  name: string
  // Entry rules
  entryRules: {
    rsiOversold?: number // e.g., 30
    rsiOverbought?: number // e.g., 70
    useMACDCrossover?: boolean
    useBollingerBands?: boolean
    volumeThreshold?: number // e.g., 1.5 (150% of average)
  }
  // Exit rules
  exitRules: {
    takeProfitPercent?: number // e.g., 5 (5% profit)
    stopLossPercent?: number // e.g., 2 (2% loss)
    useTrailingStop?: boolean
    trailingStopPercent?: number
  }
  // Position sizing
  positionSize: number // Dollar amount per trade
}

export interface Trade {
  entryDate: Date
  exitDate: Date
  symbol: string
  type: 'BUY' | 'SELL'
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  reason: string
}

export interface BacktestResult {
  strategy: BacktestStrategy
  symbol: string
  startDate: Date
  endDate: Date
  initialBalance: number
  finalBalance: number
  totalReturn: number
  totalReturnPercent: number
  // Metrics
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  profitFactor: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  // Trades
  trades: Trade[]
}

export async function runBacktest(
  symbol: string,
  strategy: BacktestStrategy,
  startDate: Date,
  endDate: Date,
  initialBalance: number = 100000
): Promise<BacktestResult> {
  // Fetch historical data
  const historicalData = await getHistoricalData(symbol, '1d', '1y')

  if (historicalData.length === 0) {
    throw new Error(`No historical data available for ${symbol}`)
  }

  // Filter data by date range
  const filteredData = historicalData.filter(candle => {
    const date = new Date(candle.timestamp)
    return date >= startDate && date <= endDate
  })

  if (filteredData.length < 30) {
    throw new Error('Insufficient data for backtesting (need at least 30 days)')
  }

  // Calculate indicators
  const closePrices = filteredData.map(c => c.close)
  const volumes = filteredData.map(c => c.volume)
  const rsiValues = calculateRSI(closePrices, 14)
  const macdData = calculateMACD(closePrices)
  const bbData = calculateBollingerBands(closePrices, 20, 2)

  // Backtesting simulation
  let balance = initialBalance
  let position: 'long' | 'short' | null = null
  let entryPrice = 0
  let entryDate: Date | null = null
  let quantity = 0
  const trades: Trade[] = []
  let highestBalance = initialBalance

  for (let i = 30; i < filteredData.length; i++) {
    const candle = filteredData[i]
    const rsi = rsiValues[i - 15] || 50 // Adjusted index
    const macd = macdData.macd[i - 26] || 0
    const signal = macdData.signal[i - 35] || 0
    const prevMACD = macdData.macd[i - 27] || 0
    const prevSignal = macdData.signal[i - 36] || 0
    const bbUpper = bbData.upper[i]
    const bbLower = bbData.lower[i]
    const avgVolume = volumes.slice(Math.max(0, i - 20), i).reduce((a, b) => a + b, 0) / 20

    // Check for entry signals
    if (!position) {
      let shouldEnter = false
      let entryReason = ''

      // BUY signal logic
      if (strategy.entryRules.rsiOversold && rsi < strategy.entryRules.rsiOversold) {
        shouldEnter = true
        entryReason = `RSI oversold (${rsi.toFixed(1)})`
      }

      if (
        strategy.entryRules.useMACDCrossover &&
        isMACDBullishCrossover(macd, signal, prevMACD, prevSignal)
      ) {
        shouldEnter = true
        entryReason += (entryReason ? ', ' : '') + 'MACD bullish crossover'
      }

      if (strategy.entryRules.useBollingerBands && candle.close < bbLower) {
        shouldEnter = true
        entryReason += (entryReason ? ', ' : '') + 'Price below BB lower band'
      }

      if (strategy.entryRules.volumeThreshold && candle.volume > avgVolume * strategy.entryRules.volumeThreshold) {
        if (shouldEnter) {
          entryReason += ', high volume'
        }
      }

      if (shouldEnter && balance > strategy.positionSize) {
        position = 'long'
        entryPrice = candle.close
        entryDate = new Date(candle.timestamp)
        quantity = strategy.positionSize / entryPrice
        balance -= strategy.positionSize
      }
    }

    // Check for exit signals
    if (position === 'long') {
      const currentPnLPercent = ((candle.close - entryPrice) / entryPrice) * 100
      let shouldExit = false
      let exitReason = ''

      // Take profit
      if (strategy.exitRules.takeProfitPercent && currentPnLPercent >= strategy.exitRules.takeProfitPercent) {
        shouldExit = true
        exitReason = 'Take profit'
      }

      // Stop loss
      if (strategy.exitRules.stopLossPercent && currentPnLPercent <= -strategy.exitRules.stopLossPercent) {
        shouldExit = true
        exitReason = 'Stop loss'
      }

      // SELL signal (RSI overbought or MACD bearish crossover)
      if (strategy.entryRules.rsiOverbought && rsi > strategy.entryRules.rsiOverbought) {
        shouldExit = true
        exitReason = `RSI overbought (${rsi.toFixed(1)})`
      }

      if (
        strategy.entryRules.useMACDCrossover &&
        isMACDBearishCrossover(macd, signal, prevMACD, prevSignal)
      ) {
        shouldExit = true
        exitReason += (exitReason ? ', ' : '') + 'MACD bearish crossover'
      }

      if (shouldExit && entryDate) {
        const exitPrice = candle.close
        const pnl = (exitPrice - entryPrice) * quantity
        const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100

        trades.push({
          entryDate,
          exitDate: new Date(candle.timestamp),
          symbol,
          type: 'BUY',
          entryPrice,
          exitPrice,
          quantity,
          pnl,
          pnlPercent,
          reason: exitReason,
        })

        balance += exitPrice * quantity
        position = null
        entryPrice = 0
        entryDate = null
        quantity = 0

        // Track highest balance for drawdown calculation
        if (balance > highestBalance) {
          highestBalance = balance
        }
      }
    }
  }

  // Close any open position at the end
  if (position === 'long' && entryDate) {
    const lastCandle = filteredData[filteredData.length - 1]
    const exitPrice = lastCandle.close
    const pnl = (exitPrice - entryPrice) * quantity
    const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100

    trades.push({
      entryDate,
      exitDate: new Date(lastCandle.timestamp),
      symbol,
      type: 'BUY',
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      pnlPercent,
      reason: 'End of backtest period',
    })

    balance += exitPrice * quantity
  }

  // Calculate metrics
  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl < 0)
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
    : 0

  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
    : 0

  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0

  // Calculate max drawdown
  let maxDrawdown = 0
  let peak = initialBalance
  let currentBalance = initialBalance

  trades.forEach(trade => {
    currentBalance += trade.pnl
    if (currentBalance > peak) {
      peak = currentBalance
    }
    const drawdown = peak - currentBalance
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  })

  const maxDrawdownPercent = (maxDrawdown / initialBalance) * 100

  // Sharpe ratio (simplified)
  const returns = trades.map(t => t.pnlPercent)
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const stdDev = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  )
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0

  return {
    strategy,
    symbol,
    startDate,
    endDate,
    initialBalance,
    finalBalance: balance,
    totalReturn: balance - initialBalance,
    totalReturnPercent: ((balance - initialBalance) / initialBalance) * 100,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    profitFactor,
    maxDrawdown,
    maxDrawdownPercent,
    sharpeRatio,
    avgWin,
    avgLoss,
    largestWin: Math.max(...trades.map(t => t.pnl), 0),
    largestLoss: Math.min(...trades.map(t => t.pnl), 0),
    trades,
  }
}
