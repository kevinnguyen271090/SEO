import { NextResponse } from 'next/server'
import { getHistoricalData, getQuote } from '@/lib/api/market-data'
import {
  calculateRSI,
  calculateMACD,
  isOversold,
  isOverbought,
  isMACDBullishCrossover,
  isMACDBearishCrossover,
} from '@/lib/indicators'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/signals
 * Generate trading signals for specified symbols
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get('symbols')

    // Default symbols to analyze
    const symbols = symbolsParam
      ? symbolsParam.split(',')
      : ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']

    const signals = []

    for (const symbol of symbols) {
      try {
        // Fetch historical data (30 days for indicator calculation)
        const historicalData = await getHistoricalData(symbol, '1d', '1mo')

        if (historicalData.length < 30) {
          console.log(`Insufficient data for ${symbol}`)
          continue
        }

        // Extract close prices
        const closePrices = historicalData.map(candle => candle.close)
        const volumes = historicalData.map(candle => candle.volume)

        // Calculate indicators
        const rsiValues = calculateRSI(closePrices, 14)
        const macdData = calculateMACD(closePrices)

        // Get latest values
        const currentRSI = rsiValues[rsiValues.length - 1]
        const currentMACD = macdData.macd[macdData.macd.length - 1]
        const currentSignal = macdData.signal[macdData.signal.length - 1]
        const previousMACD = macdData.macd[macdData.macd.length - 2]
        const previousSignal = macdData.signal[macdData.signal.length - 2]

        const currentPrice = closePrices[closePrices.length - 1]
        const currentVolume = volumes[volumes.length - 1]
        const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20

        // Generate signal based on indicators
        let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD'
        let confidence = 50
        let reasoning = ''

        // BUY signal conditions
        if (
          isOversold(currentRSI, 35) &&
          isMACDBullishCrossover(currentMACD, currentSignal, previousMACD, previousSignal)
        ) {
          signalType = 'BUY'
          confidence = 85
          reasoning = `Strong BUY: RSI oversold (${currentRSI.toFixed(1)}), MACD bullish crossover`
        } else if (isOversold(currentRSI, 30)) {
          signalType = 'BUY'
          confidence = 70
          reasoning = `RSI oversold (${currentRSI.toFixed(1)}), potential reversal`
        } else if (isMACDBullishCrossover(currentMACD, currentSignal, previousMACD, previousSignal)) {
          signalType = 'BUY'
          confidence = 65
          reasoning = `MACD bullish crossover detected`
        }

        // SELL signal conditions
        if (
          isOverbought(currentRSI, 65) &&
          isMACDBearishCrossover(currentMACD, currentSignal, previousMACD, previousSignal)
        ) {
          signalType = 'SELL'
          confidence = 85
          reasoning = `Strong SELL: RSI overbought (${currentRSI.toFixed(1)}), MACD bearish crossover`
        } else if (isOverbought(currentRSI, 70)) {
          signalType = 'SELL'
          confidence = 70
          reasoning = `RSI overbought (${currentRSI.toFixed(1)}), potential correction`
        } else if (isMACDBearishCrossover(currentMACD, currentSignal, previousMACD, previousSignal)) {
          signalType = 'SELL'
          confidence = 65
          reasoning = `MACD bearish crossover detected`
        }

        // Volume confirmation
        if (currentVolume > avgVolume * 1.5) {
          confidence += 5
          reasoning += `, high volume (${((currentVolume / avgVolume - 1) * 100).toFixed(0)}% above avg)`
        }

        // Only return signals with confidence > 60
        if (confidence > 60) {
          // Calculate targets and stop loss
          const atr = (Math.max(...closePrices.slice(-14)) - Math.min(...closePrices.slice(-14))) / 14
          const targetPrice = signalType === 'BUY'
            ? currentPrice + atr * 2
            : currentPrice - atr * 2
          const stopLoss = signalType === 'BUY'
            ? currentPrice - atr * 1.5
            : currentPrice + atr * 1.5

          signals.push({
            symbol,
            type: signalType,
            confidence,
            entryPrice: currentPrice,
            targetPrice: parseFloat(targetPrice.toFixed(2)),
            stopLoss: parseFloat(stopLoss.toFixed(2)),
            indicators: {
              rsi: parseFloat(currentRSI.toFixed(2)),
              macd: parseFloat(currentMACD.toFixed(2)),
              signal: parseFloat(currentSignal.toFixed(2)),
              volume: currentVolume,
              avgVolume,
            },
            reasoning,
            createdAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      count: signals.length,
      signals: signals.sort((a, b) => b.confidence - a.confidence),
    })
  } catch (error) {
    console.error('Error generating signals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate signals' },
      { status: 500 }
    )
  }
}
