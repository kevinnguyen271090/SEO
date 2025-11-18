/**
 * Technical Indicators Library
 * Lightweight implementations of common trading indicators
 */

export interface CandleData {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }

    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j]
    }
    result.push(sum / period)
  }

  return result
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)

  // First EMA is SMA
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  result.push(ema)

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema
    result.push(ema)
  }

  return result
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  // Calculate RSI
  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period

    if (avgLoss === 0) {
      result.push(100)
    } else {
      const rs = avgGain / avgLoss
      const rsi = 100 - (100 / (1 + rs))
      result.push(rsi)
    }
  }

  return result
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)

  const macd: number[] = []
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macd.push(NaN)
    } else {
      macd.push(fastEMA[i] - slowEMA[i])
    }
  }

  const signal = calculateEMA(macd.filter(v => !isNaN(v)), signalPeriod)
  const histogram: number[] = []

  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i]) || !signal[i - (slowPeriod - 1)]) {
      histogram.push(NaN)
    } else {
      histogram.push(macd[i] - signal[i - (slowPeriod - 1)])
    }
  }

  return { macd, signal, histogram }
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(prices, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
      continue
    }

    const slice = prices.slice(i - period + 1, i + 1)
    const mean = middle[i]
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    upper.push(mean + stdDev * standardDeviation)
    lower.push(mean - stdDev * standardDeviation)
  }

  return { upper, middle, lower }
}

/**
 * Detect if RSI indicates oversold condition
 */
export function isOversold(rsi: number, threshold: number = 30): boolean {
  return rsi < threshold
}

/**
 * Detect if RSI indicates overbought condition
 */
export function isOverbought(rsi: number, threshold: number = 70): boolean {
  return rsi > threshold
}

/**
 * Detect MACD bullish crossover
 */
export function isMACDBullishCrossover(
  currentMACD: number,
  currentSignal: number,
  previousMACD: number,
  previousSignal: number
): boolean {
  return previousMACD < previousSignal && currentMACD > currentSignal
}

/**
 * Detect MACD bearish crossover
 */
export function isMACDBearishCrossover(
  currentMACD: number,
  currentSignal: number,
  previousMACD: number,
  previousSignal: number
): boolean {
  return previousMACD > previousSignal && currentMACD < currentSignal
}

/**
 * Calculate Average True Range (ATR) for volatility
 */
export function calculateATR(candles: CandleData[], period: number = 14): number[] {
  const tr: number[] = []

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low
    const prevClose = candles[i - 1].close

    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    )
    tr.push(trueRange)
  }

  return calculateSMA(tr, period)
}
