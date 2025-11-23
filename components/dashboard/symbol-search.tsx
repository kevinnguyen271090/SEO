"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, Plus, Star, ArrowRight, Bitcoin } from 'lucide-react'
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

  // ============ CRYPTO ============
  // Major Cryptocurrencies
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'Crypto' },
  { symbol: 'BNB-USD', name: 'Binance Coin', category: 'Crypto' },
  { symbol: 'XRP-USD', name: 'Ripple', category: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana', category: 'Crypto' },
  { symbol: 'ADA-USD', name: 'Cardano', category: 'Crypto' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', category: 'Crypto' },
  { symbol: 'DOT-USD', name: 'Polkadot', category: 'Crypto' },
  { symbol: 'MATIC-USD', name: 'Polygon', category: 'Crypto' },
  { symbol: 'SHIB-USD', name: 'Shiba Inu', category: 'Crypto' },
  { symbol: 'AVAX-USD', name: 'Avalanche', category: 'Crypto' },
  { symbol: 'LINK-USD', name: 'Chainlink', category: 'Crypto' },
  { symbol: 'UNI-USD', name: 'Uniswap', category: 'Crypto' },
  { symbol: 'ATOM-USD', name: 'Cosmos', category: 'Crypto' },
  { symbol: 'LTC-USD', name: 'Litecoin', category: 'Crypto' },
  { symbol: 'FIL-USD', name: 'Filecoin', category: 'Crypto' },
  { symbol: 'APT-USD', name: 'Aptos', category: 'Crypto' },
  { symbol: 'ARB-USD', name: 'Arbitrum', category: 'Crypto' },
  { symbol: 'OP-USD', name: 'Optimism', category: 'Crypto' },
  { symbol: 'NEAR-USD', name: 'NEAR Protocol', category: 'Crypto' },
  { symbol: 'PEPE-USD', name: 'Pepe', category: 'Crypto' },
  { symbol: 'SUI-USD', name: 'Sui', category: 'Crypto' },
  { symbol: 'INJ-USD', name: 'Injective', category: 'Crypto' },
  { symbol: 'SEI-USD', name: 'Sei', category: 'Crypto' },
  { symbol: 'TIA-USD', name: 'Celestia', category: 'Crypto' },

  // Crypto-related Stocks
  { symbol: 'MSTR', name: 'MicroStrategy', category: 'Crypto Stock' },
  { symbol: 'MARA', name: 'Marathon Digital', category: 'Crypto Stock' },
  { symbol: 'RIOT', name: 'Riot Platforms', category: 'Crypto Stock' },
  { symbol: 'CLSK', name: 'CleanSpark', category: 'Crypto Stock' },
  { symbol: 'HUT', name: 'Hut 8 Mining', category: 'Crypto Stock' },
  { symbol: 'BITF', name: 'Bitfarms', category: 'Crypto Stock' },

  // ============ VIETNAM STOCKS (HOSE) ============
  // Banks
  { symbol: 'VCB.VN', name: 'Vietcombank', category: 'VN Bank' },
  { symbol: 'BID.VN', name: 'BIDV', category: 'VN Bank' },
  { symbol: 'CTG.VN', name: 'VietinBank', category: 'VN Bank' },
  { symbol: 'TCB.VN', name: 'Techcombank', category: 'VN Bank' },
  { symbol: 'MBB.VN', name: 'MB Bank', category: 'VN Bank' },
  { symbol: 'VPB.VN', name: 'VPBank', category: 'VN Bank' },
  { symbol: 'ACB.VN', name: 'ACB', category: 'VN Bank' },
  { symbol: 'HDB.VN', name: 'HDBank', category: 'VN Bank' },
  { symbol: 'STB.VN', name: 'Sacombank', category: 'VN Bank' },
  { symbol: 'TPB.VN', name: 'TPBank', category: 'VN Bank' },

  // Real Estate
  { symbol: 'VIC.VN', name: 'Vingroup', category: 'VN Real Estate' },
  { symbol: 'VHM.VN', name: 'Vinhomes', category: 'VN Real Estate' },
  { symbol: 'VRE.VN', name: 'Vincom Retail', category: 'VN Real Estate' },
  { symbol: 'NVL.VN', name: 'Novaland', category: 'VN Real Estate' },
  { symbol: 'KDH.VN', name: 'Khang Dien House', category: 'VN Real Estate' },
  { symbol: 'DXG.VN', name: 'Dat Xanh', category: 'VN Real Estate' },

  // Tech & Retail
  { symbol: 'FPT.VN', name: 'FPT Corporation', category: 'VN Tech' },
  { symbol: 'MWG.VN', name: 'The Gioi Di Dong', category: 'VN Retail' },
  { symbol: 'PNJ.VN', name: 'Phu Nhuan Jewelry', category: 'VN Retail' },

  // Industry & Energy
  { symbol: 'HPG.VN', name: 'Hoa Phat Group', category: 'VN Industry' },
  { symbol: 'GAS.VN', name: 'PV Gas', category: 'VN Energy' },
  { symbol: 'PLX.VN', name: 'Petrolimex', category: 'VN Energy' },
  { symbol: 'POW.VN', name: 'PV Power', category: 'VN Energy' },
  { symbol: 'GVR.VN', name: 'Vietnam Rubber', category: 'VN Industry' },
  { symbol: 'MSN.VN', name: 'Masan Group', category: 'VN Consumer' },
  { symbol: 'VNM.VN', name: 'Vinamilk', category: 'VN Consumer' },
  { symbol: 'SAB.VN', name: 'Sabeco', category: 'VN Consumer' },

  // VN Index & ETFs
  { symbol: 'VNINDEX', name: 'VN-Index', category: 'VN Index' },
  { symbol: 'VN30', name: 'VN30 Index', category: 'VN Index' },
  { symbol: 'E1VFVN30.VN', name: 'VN30 ETF', category: 'VN ETF' },
  { symbol: 'FUEVFVND.VN', name: 'VN Diamond ETF', category: 'VN ETF' },
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
  const [customSymbols, setCustomSymbols] = useState<typeof allSymbols>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load custom symbols from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customSymbols')
    if (saved) {
      setCustomSymbols(JSON.parse(saved))
    }
  }, [])

  // Filter results based on query
  useEffect(() => {
    const allAvailableSymbols = [...allSymbols, ...customSymbols]

    if (query.trim() === '') {
      setResults(popularSymbols)
    } else {
      const searchQuery = query.toLowerCase()
      const filtered = allAvailableSymbols.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery) ||
          s.name.toLowerCase().includes(searchQuery) ||
          s.category.toLowerCase().includes(searchQuery)
      )

      // If user typed a valid symbol format but not in list, add it as custom option
      if (filtered.length === 0 && query.match(/^[A-Za-z0-9.-]{1,12}$/)) {
        filtered.push({
          symbol: query.toUpperCase(),
          name: 'Custom Symbol',
          category: 'Custom'
        })
      }

      setResults(filtered.slice(0, 15)) // Limit to 15 results
    }
  }, [query, customSymbols])

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

  const handleAddCustomSymbol = (symbol: string, name: string = 'Custom Symbol') => {
    const newSymbol = { symbol: symbol.toUpperCase(), name, category: 'Custom' }
    const updated = [...customSymbols, newSymbol]
    setCustomSymbols(updated)
    localStorage.setItem('customSymbols', JSON.stringify(updated))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      // Go to the first result or the custom symbol
      const symbol = results.length > 0 ? results[0].symbol : query.toUpperCase()
      handleViewChart(symbol)
    }
  }

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol)
  const isCrypto = (category: string) => category.toLowerCase().includes('crypto')
  const isVN = (category: string) => category.toLowerCase().includes('vn')

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks, crypto, VN (BTC, VCB, tech...)"
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
              <div className="px-2 py-1 mb-2">
                <p className="text-xs text-muted-foreground">
                  150+ symbols: US Stocks, Crypto, Vietnam Stocks
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Try: "crypto", "vn bank", "tech", "BTC", "VCB"
                </p>
              </div>
            )}

            {query !== '' && results.length > 0 && (
              <p className="text-xs text-muted-foreground px-2 py-1 mb-2">
                {results.length} result{results.length > 1 ? 's' : ''} found
              </p>
            )}

            {results.length === 0 && query !== '' ? (
              <div className="px-2 py-4">
                <div
                  onClick={() => {
                    handleAddCustomSymbol(query)
                    handleViewChart(query.toUpperCase())
                  }}
                  className="flex items-center justify-between px-3 py-3 rounded-md hover:bg-muted cursor-pointer transition-colors border border-dashed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{query.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">Add & view this symbol</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Press Enter to add and view chart
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
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isCrypto(item.category) ? "bg-orange-500/10" :
                        isVN(item.category) ? "bg-red-500/10" : "bg-primary/10"
                      )}>
                        {isCrypto(item.category) ? (
                          <Bitcoin className="h-5 w-5 text-orange-500" />
                        ) : (
                          <TrendingUp className={cn(
                            "h-5 w-5",
                            isVN(item.category) ? "text-red-500" : "text-primary"
                          )} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{item.symbol}</p>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            isCrypto(item.category) ? "bg-orange-500/20 text-orange-600" :
                            isVN(item.category) ? "bg-red-500/20 text-red-600" :
                            "bg-muted text-muted-foreground"
                          )}>
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
