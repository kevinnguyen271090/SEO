"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, Plus, Star, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Expanded list of symbols by category
const allSymbols = [
  // Tech Giants
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Tech' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Tech' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'Tech' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Tech' },
  { symbol: 'META', name: 'Meta Platforms', category: 'Tech' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'Tech' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'Tech' },
  { symbol: 'AMD', name: 'AMD Inc.', category: 'Tech' },
  { symbol: 'INTC', name: 'Intel Corp.', category: 'Tech' },
  { symbol: 'CRM', name: 'Salesforce Inc.', category: 'Tech' },
  { symbol: 'ORCL', name: 'Oracle Corp.', category: 'Tech' },
  { symbol: 'ADBE', name: 'Adobe Inc.', category: 'Tech' },
  { symbol: 'CSCO', name: 'Cisco Systems', category: 'Tech' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', category: 'Tech' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', category: 'Tech' },

  // Entertainment & Media
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Media' },
  { symbol: 'DIS', name: 'Walt Disney Co.', category: 'Media' },
  { symbol: 'CMCSA', name: 'Comcast Corp.', category: 'Media' },
  { symbol: 'SPOT', name: 'Spotify', category: 'Media' },

  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase', category: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America', category: 'Finance' },
  { symbol: 'WFC', name: 'Wells Fargo', category: 'Finance' },
  { symbol: 'GS', name: 'Goldman Sachs', category: 'Finance' },
  { symbol: 'MS', name: 'Morgan Stanley', category: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', category: 'Finance' },
  { symbol: 'MA', name: 'Mastercard Inc.', category: 'Finance' },
  { symbol: 'PYPL', name: 'PayPal Holdings', category: 'Finance' },
  { symbol: 'SQ', name: 'Block Inc.', category: 'Finance' },
  { symbol: 'COIN', name: 'Coinbase', category: 'Finance' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', category: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', category: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co.', category: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly', category: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher', category: 'Healthcare' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', category: 'Consumer' },
  { symbol: 'COST', name: 'Costco', category: 'Consumer' },
  { symbol: 'HD', name: 'Home Depot', category: 'Consumer' },
  { symbol: 'MCD', name: "McDonald's", category: 'Consumer' },
  { symbol: 'SBUX', name: 'Starbucks', category: 'Consumer' },
  { symbol: 'NKE', name: 'Nike Inc.', category: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola', category: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo', category: 'Consumer' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil', category: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corp.', category: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', category: 'Energy' },

  // Industrial
  { symbol: 'BA', name: 'Boeing Co.', category: 'Industrial' },
  { symbol: 'CAT', name: 'Caterpillar', category: 'Industrial' },
  { symbol: 'GE', name: 'General Electric', category: 'Industrial' },
  { symbol: 'UPS', name: 'UPS', category: 'Industrial' },
  { symbol: 'FDX', name: 'FedEx Corp.', category: 'Industrial' },

  // ETFs
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'ETF' },
  { symbol: 'DIA', name: 'Dow Jones ETF', category: 'ETF' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', category: 'ETF' },
  { symbol: 'VTI', name: 'Total Stock Market ETF', category: 'ETF' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', category: 'ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', category: 'ETF' },

  // Crypto-related
  { symbol: 'MSTR', name: 'MicroStrategy', category: 'Crypto' },
  { symbol: 'MARA', name: 'Marathon Digital', category: 'Crypto' },
  { symbol: 'RIOT', name: 'Riot Platforms', category: 'Crypto' },
]

// Popular symbols shown by default
const popularSymbols = allSymbols.slice(0, 10)

interface SymbolSearchProps {
  onAddToWatchlist?: (symbol: string) => void
  watchlist?: string[]
}

export function SymbolSearch({ onAddToWatchlist, watchlist = [] }: SymbolSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<typeof allSymbols>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter results based on query
  useEffect(() => {
    if (query.trim() === '') {
      setResults(popularSymbols)
    } else {
      const searchQuery = query.toLowerCase()
      const filtered = allSymbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery) ||
          s.name.toLowerCase().includes(searchQuery) ||
          s.category.toLowerCase().includes(searchQuery)
      )

      // If user typed a valid symbol format but not in list, add it as custom
      if (filtered.length === 0 && query.match(/^[A-Za-z]{1,5}$/)) {
        filtered.push({
          symbol: query.toUpperCase(),
          name: 'Custom Symbol',
          category: 'Custom'
        })
      }

      setResults(filtered.slice(0, 15)) // Limit to 15 results
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleViewChart = (symbol: string) => {
    router.push(`/signals/${symbol}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleAddToWatchlist = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToWatchlist) {
      onAddToWatchlist(symbol)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      // Go to the first result or the custom symbol
      const symbol = results.length > 0 ? results[0].symbol : query.toUpperCase()
      handleViewChart(symbol)
    }
  }

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol)

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search 70+ symbols (AAPL, SPY, tech, ...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {query === '' && (
              <p className="text-xs text-muted-foreground px-2 py-1 mb-2">
                Popular Symbols - Type to search 70+ stocks & ETFs
              </p>
            )}

            {query !== '' && results.length > 0 && (
              <p className="text-xs text-muted-foreground px-2 py-1 mb-2">
                {results.length} result{results.length > 1 ? 's' : ''} found
              </p>
            )}

            {results.length === 0 && query !== '' ? (
              <div className="px-2 py-4">
                <div
                  onClick={() => handleViewChart(query.toUpperCase())}
                  className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-muted cursor-pointer transition-colors border border-dashed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{query.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">Search this symbol</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Press Enter or click to view chart
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((item) => (
                  <div
                    key={item.symbol}
                    onClick={() => handleViewChart(item.symbol)}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.symbol}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleAddToWatchlist(item.symbol, e)}
                      className={cn(
                        "h-8 w-8",
                        isInWatchlist(item.symbol) && "text-yellow-500"
                      )}
                    >
                      {isInWatchlist(item.symbol) ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
