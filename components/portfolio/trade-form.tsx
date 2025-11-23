'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

export function TradeForm() {
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    setError('')
    setMessage('')

    if (!symbol || !quantity) {
      setError('Please fill in all fields')
      return
    }

    if (Number(quantity) <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId: 'demo-portfolio', // TODO: Use actual portfolio ID
          symbol: symbol.toUpperCase(),
          type,
          quantity: Number(quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to execute trade')
        setLoading(false)
        return
      }

      setMessage(data.message)
      setSymbol('')
      setQuantity('')

      // Refresh portfolio data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setError('Failed to execute trade. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-green-500/10 text-green-500 text-sm p-3 rounded-md">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          placeholder="AAPL, TSLA, NVDA..."
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          placeholder="100"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleTrade('BUY')}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="mr-2 h-4 w-4" />
          )}
          Buy
        </Button>
        <Button
          onClick={() => handleTrade('SELL')}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TrendingDown className="mr-2 h-4 w-4" />
          )}
          Sell
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        This is paper trading. No real money is involved.
      </p>
    </div>
  )
}
