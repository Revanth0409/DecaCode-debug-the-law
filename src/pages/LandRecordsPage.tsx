import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal, MapPin, User, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VerificationBadge } from '@/components/layout/StatusBadge'
import { searchParcels, getAllParcels } from '@/services/dataService'
import type { LandParcel } from '@/types'

const DEMO_SEARCHES = [
  { label: 'Survey 42/3 (Kengeri)', query: { surveyNumber: '42/3' } },
  { label: 'Yelahanka parcels', query: { village: 'Yelahanka' } },
  { label: 'Ramesh Kumar', query: { ownerName: 'Ramesh' } },
  { label: 'Discrepancy records', query: { status: 'discrepancy' } },
]

export default function LandRecordsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState<LandParcel[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    surveyNumber: searchParams.get('q') || '',
    ownerName: '',
    village: '',
    taluk: '',
    district: '',
    classification: '',
    status: '',
  })

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      const query: any = {}
      if (/^\d+[\/\d]*$/.test(q)) query.surveyNumber = q
      else if (/village|kengeri|yelahanka|whitefield|doddaballapura/i.test(q)) query.village = q
      else query.ownerName = q
      doSearch(query)
    } else {
      setResults(getAllParcels())
    }
  }, [searchParams])

  function doSearch(query = filters) {
    setLoading(true)
    setTimeout(() => {
      const r = searchParcels({
        surveyNumber: query.surveyNumber || undefined,
        ownerName: query.ownerName || undefined,
        village: query.village || undefined,
        taluk: query.taluk || undefined,
        district: query.district || undefined,
        classification: query.classification || undefined,
        status: query.status || undefined,
      })
      setResults(r)
      setLoading(false)
    }, 200)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    doSearch()
  }

  function resetFilters() {
    const empty = { surveyNumber: '', ownerName: '', village: '', taluk: '', district: '', classification: '', status: '' }
    setFilters(empty)
    setResults(getAllParcels())
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('search.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('search.subtitle')}</p>
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 inline-block">
          ⚠️ {t('common.sampleDataNotice')}
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={filters.surveyNumber}
              onChange={e => setFilters(f => ({ ...f, surveyNumber: e.target.value }))}
              placeholder="Survey number, owner name, village…"
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="default">{t('common.search')}</Button>
          <Button type="button" variant="outline" onClick={() => setShowFilters(f => !f)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" />Filters
          </Button>
          <Button type="button" variant="ghost" onClick={resetFilters}><X className="h-4 w-4" /></Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-50 rounded-xl p-4 border">
            <Input value={filters.ownerName} onChange={e => setFilters(f => ({ ...f, ownerName: e.target.value }))} placeholder={t('search.ownerName')} className="text-sm" />
            <Input value={filters.village} onChange={e => setFilters(f => ({ ...f, village: e.target.value }))} placeholder={t('search.village')} className="text-sm" />
            <Input value={filters.taluk} onChange={e => setFilters(f => ({ ...f, taluk: e.target.value }))} placeholder={t('search.taluk')} className="text-sm" />
            <Input value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))} placeholder={t('search.district')} className="text-sm" />
            <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v === 'all' ? '' : v }))}>
              <SelectTrigger className="text-sm"><SelectValue placeholder={t('search.status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="discrepancy">Discrepancy</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.classification} onValueChange={v => setFilters(f => ({ ...f, classification: v === 'all' ? '' : v }))}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Classification" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Agricultural">Agricultural</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quick search suggestions */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-gray-500">Quick search:</span>
          {DEMO_SEARCHES.map(d => (
            <button key={d.label} type="button" onClick={() => { const f = { ...{ surveyNumber: '', ownerName: '', village: '', taluk: '', district: '', classification: '', status: '' }, ...d.query }; setFilters(f); doSearch(f) }}
              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100">
              {d.label}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Searching…' : `${results.length} ${t('search.results')}`}
        </p>
      </div>

      {results.length === 0 && !loading ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t('search.noResults')}</p>
          <p className="text-sm mt-1">{t('search.tryDifferent')}</p>
          <Button variant="outline" className="mt-4" onClick={resetFilters}>Show All Records</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(parcel => (
            <Card key={parcel.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => navigate(`/land-records/${parcel.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-[#1e3a5f] text-lg">Survey {parcel.surveyNumber}</div>
                    {parcel.subdivisionNumber && <div className="text-xs text-gray-400">Sub: {parcel.subdivisionNumber}</div>}
                  </div>
                  <VerificationBadge status={parcel.verificationStatus} />
                </div>
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-gray-400" /><span className="truncate">{parcel.currentRecordedOwner}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /><span>{parcel.village}, {parcel.district}</span></div>
                  <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-gray-400" /><span>{parcel.area} {parcel.areaUnit} · {parcel.classification}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Updated {parcel.lastUpdated}</span>
                  <span className="text-xs text-[#1e3a5f] font-medium group-hover:underline">View Details →</span>
                </div>
                {parcel.discrepancyIds && parcel.discrepancyIds.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
                    ⚠️ {parcel.discrepancyIds.length} discrepancy alert(s) flagged
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

