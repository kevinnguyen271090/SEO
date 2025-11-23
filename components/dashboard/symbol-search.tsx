"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, Plus, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Popular symbols for quick access
const popularSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'AMD', name: 'AMD Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
]

interface SymbolSearchProps {
  onAddToWatchlist?: (symbol: string) => void
  watchlist?: string[]
}

export function SymbolSearch({ onAddToWatchlist, watchlist = [] }: SymbolSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<typeof popularSymbols>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter results based on query
  useEffect(() => {
    if (query.trim() === '') {
      setResults(popularSymbols.slice(0, 5))
    } else {
      const filtered = popularSymbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
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

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol)

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symbols (AAPL, TSLA, ...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {query === '' && (
              <p className="text-xs text-muted-foreground px-2 py-1 mb-2">
                Popular Symbols
              </p>
            )}

            {results.length === 0 ? (
              <div className="px-2 py-4 text-center text-muted-foreground">
                <p className="text-sm">No symbols found</p>
                <p className="text-xs mt-1">Try searching for AAPL, TSLA, etc.</p>
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
                        <p className="font-semibold">{item.symbol}</p>
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
