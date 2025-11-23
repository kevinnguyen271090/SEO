'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Play } from 'lucide-react'

export function BacktestForm() {
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState('AAPL')
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState('2024-01-01')

  // Strategy parameters
  const [rsiOversold, setRsiOversold] = useState('30')
  const [rsiOverbought, setRsiOverbought] = useState('70')
  const [useMacd, setUseMacd] = useState(true)
  const [takeProfit, setTakeProfit] = useState('5')
  const [stopLoss, setStopLoss] = useState('2')
  const [positionSize, setPositionSize] = useState('10000')

  const handleBacktest = async () => {
    setLoading(true)

    try {
      const strategy = {
        name: 'RSI + MACD Strategy',
        entryRules: {
          rsiOversold: Number(rsiOversold),
          rsiOverbought: Number(rsiOverbought),
          useMACDCrossover: useMacd,
          volumeThreshold: 1.5,
        },
        exitRules: {
          takeProfitPercent: Number(takeProfit),
          stopLossPercent: Number(stopLoss),
        },
        positionSize: Number(positionSize),
      }

      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          strategy,
          startDate,
          endDate,
          initialBalance: 100000,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Backtest failed')
        setLoading(false)
        return
      }

      // Dispatch event to update results
      window.dispatchEvent(
        new CustomEvent('backtestComplete', { detail: data.result })
      )

      setLoading(false)
    } catch (error) {
      console.error('Backtest error:', error)
      alert('Failed to run backtest')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Entry Rules</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rsiOversold">RSI Oversold</Label>
              <Input
                id="rsiOversold"
                type="number"
                value={rsiOversold}
                onChange={(e) => setRsiOversold(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rsiOverbought">RSI Overbought</Label>
              <Input
                id="rsiOverbought"
                type="number"
                value={rsiOverbought}
                onChange={(e) => setRsiOverbought(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useMacd"
              checked={useMacd}
              onChange={(e) => setUseMacd(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="useMacd" className="cursor-pointer">
              Use MACD Crossover
            </Label>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Exit Rules</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit %</Label>
              <Input
                id="takeProfit"
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss %</Label>
              <Input
                id="stopLoss"
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="positionSize">Position Size ($)</Label>
          <Input
            id="positionSize"
            type="number"
            value={positionSize}
            onChange={(e) => setPositionSize(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={handleBacktest}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Backtest...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Run Backtest
          </>
        )}
      </Button>
    </div>
  )
}
