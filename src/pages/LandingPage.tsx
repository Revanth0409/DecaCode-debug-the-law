import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Truck, FileCheck, Map, Shield, AlertTriangle, BookOpen, Users, ArrowRight, CheckCircle, Star, RefreshCw, Scale, ClipboardCheck, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import LandMap from '@/components/map/LandMap'
import type { VerificationStatus } from '@/types'

const STATS = [
  { label: 'landing.statParcels', value: '15', demo: true },
  { label: 'landing.statRequests', value: '5', demo: true },
  { label: 'landing.statResolved', value: '1', demo: true },
  { label: 'landing.statFlagged', value: '5', demo: true },
]

const FEATURES = [
  { icon: Search, key: 'Land Record Search', desc: 'Search parcels by survey number, owner name, village, taluk, or district.', href: '/land-records', color: 'bg-blue-100 text-blue-700' },
  { icon: BookOpen, key: 'Ownership Timeline', desc: 'Trace the complete ownership history of any parcel with a chronological timeline.', href: '/land-records', color: 'bg-indigo-100 text-indigo-700' },
  { icon: AlertTriangle, key: 'AI Discrepancy Detection', desc: 'AI-assisted analysis flags area mismatches, missing documents, and unusual changes.', href: '/discrepancies', color: 'bg-red-100 text-red-700' },
  { icon: FileCheck, key: 'Document Checklist', desc: 'Generate tailored checklists for 12 different land-record services in Karnataka.', href: '/document-checklist', color: 'bg-green-100 text-green-700' },
  { icon: Truck, key: 'Application Tracking', desc: 'Track your correction request or appeal using your unique BHUT tracking token.', href: '/track-application', color: 'bg-amber-100 text-amber-700' },
  { icon: Users, key: 'Bilingual Assistance', desc: 'Full English and Kannada support across all pages, forms, and generated documents.', href: '/', color: 'bg-purple-100 text-purple-700' },
]

const NEW_FEATURES = [
  {
    icon: Shield,
    key: 'Encumbrance & Risk Check',
    desc: 'Identify recorded mortgages, bank liens, court restrictions, and legal risks before a property transaction.',
    href: '/land-records',
    color: 'bg-red-100 text-red-700',
    badge: 'New',
  },
  {
    icon: ClipboardCheck,
    key: 'A-Khata Eligibility Check',
    desc: 'Pre-assess your property\'s eligibility for A-Khata regularization across 4 key criteria.',
    href: '/akhata-assessment',
    color: 'bg-green-100 text-green-700',
    badge: 'New',
  },
  {
    icon: TrendingUp,
    key: 'Transparency Dashboard',
    desc: 'View fee schedules, payment records, officer timelines, and submit process concerns.',
    href: '/transparency',
    color: 'bg-blue-100 text-blue-700',
    badge: 'New',
  },
  {
    icon: Scale,
    key: 'Legal Appeal Documents',
    desc: 'Generate pre-filled appeal letters and RTI applications in English or Kannada, ready to print or download.',
    href: '/track-application',
    color: 'bg-purple-100 text-purple-700',
    badge: 'New',
  },
]

const ACCESS_GROUPS = [
  { icon: '🌾', label: 'Farmers', desc: 'Understand your land records in plain language' },
  { icon: '🏠', label: 'First-time Owners', desc: 'Navigate ownership transfers step by step' },
  { icon: '🏘️', label: 'Rural Citizens', desc: 'Access records without visiting multiple offices' },
  { icon: '🛒', label: 'Property Buyers', desc: 'Verify ownership history before purchase' },
  { icon: '👴', label: 'Senior Citizens', desc: 'Simple, guided workflows in your language' },
  { icon: '⚖️', label: 'Legal Aid Workers', desc: 'Quick access to discrepancy details and timelines' },
]

const DEMO_SEARCHES = ['42/3', '78/2A', 'Kengeri', 'Yelahanka', 'Ramesh Kumar']

export default function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [mapFilter, setMapFilter] = useState<VerificationStatus | 'all'>('all')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/land-records?q=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/land-records')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#1a2f4e] to-[#0f1a2e] text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs text-orange-300 font-medium">Legal Accessibility & Social Justice · Hackathon Project</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('landing.searchPlaceholder')}
                className="flex-1 bg-white text-gray-800 border-0 text-sm h-11"
              />
              <Button type="submit" size="lg" variant="saffron" className="h-11 px-6">
                <Search className="h-4 w-4 mr-2" />
                {t('landing.searchLand')}
              </Button>
            </div>
          </form>

          {/* Quick demo searches */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-blue-300">Try:</span>
            {DEMO_SEARCHES.map(s => (
              <button key={s} onClick={() => { setSearchQuery(s); navigate(`/land-records?q=${encodeURIComponent(s)}`) }}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-full transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => navigate('/track-application')}>
              <Truck className="h-4 w-4 mr-2" />
              {t('landing.trackApp')}
            </Button>
            <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => navigate('/document-checklist')}>
              <FileCheck className="h-4 w-4 mr-2" />
              {t('landing.checkDocs')}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t('landing.statsTitle')}</h2>
            <p className="text-xs text-amber-600 mt-1 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" />{t('landing.statsSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl border">
                <div className="text-3xl font-bold text-[#1e3a5f]">{stat.value}</div>
                <div className="text-xs text-gray-600 mt-1">{t(stat.label)}</div>
                <div className="text-[10px] text-amber-600 mt-1">Sample Data</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">{t('landing.featuresTitle')}</h2>
            <p className="text-gray-500 mt-2">{t('landing.featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {FEATURES.map(feat => (
              <Card key={feat.key} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(feat.href)}>
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feat.color}`}>
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1.5">{feat.key}</h3>
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">{feat.desc}</p>
                  <div className="flex items-center text-xs text-[#1e3a5f] font-medium group-hover:gap-2 gap-1 transition-all">
                    <span>Explore</span><ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Advanced Features */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-4">
              <Star className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs text-orange-700 font-medium">Advanced Protection & Transparency Tools</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Beyond Records — Protect Your Rights</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">New tools that go further to help you verify, protect, and legally assert your land rights.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {NEW_FEATURES.map(feat => (
              <Card key={feat.key} className="hover:shadow-md transition-shadow cursor-pointer group border-2 hover:border-[#1e3a5f]/30" onClick={() => navigate(feat.href)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feat.color}`}>
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">{feat.badge}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">{feat.key}</h3>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{feat.desc}</p>
                  <div className="flex items-center text-xs text-[#1e3a5f] font-medium group-hover:gap-2 gap-1 transition-all">
                    <span>Explore</span><ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">{t('landing.mapTitle')}</h2>
            <p className="text-xs text-amber-600 mt-1 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" />{t('landing.mapSubtitle')}
            </p>
          </div>

          {/* Map filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {(['all', 'verified', 'pending', 'discrepancy', 'disputed'] as const).map(f => (
              <button key={f} onClick={() => setMapFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${mapFilter === f ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]'}`}>
                {f === 'all' ? 'All Parcels' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <LandMap height="450px" filterStatus={mapFilter} showLegend={true} />
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">Click any parcel to view details. Boundaries are illustrative and not legally accurate cadastral boundaries.</p>
        </div>
      </section>

      {/* Accessibility section */}
      <section className="py-16 bg-[#1e3a5f] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">{t('landing.accessTitle')}</h2>
            <p className="text-blue-200 mt-2 max-w-xl mx-auto">{t('landing.accessSubtitle')}</p>
            <div className="mt-4 inline-block bg-orange-500/20 border border-orange-400/30 rounded-lg px-4 py-2">
              <span className="text-orange-300 font-medium">ಕನ್ನಡದಲ್ಲಿ ಸಂಪೂರ್ಣ ಬೆಂಬಲ ಲಭ್ಯ</span>
              <span className="text-blue-200 text-sm ml-2">— Full Kannada support available</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {ACCESS_GROUPS.map(g => (
              <div key={g.label} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{g.icon}</div>
                <div className="font-semibold text-sm">{g.label}</div>
                <div className="text-xs text-blue-200 mt-1">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo panel */}
      <section className="py-12 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-amber-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 mb-1">Demo Exploration Panel</h3>
              <p className="text-sm text-amber-800 mb-3">Use these sample values to explore the portal immediately:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="font-medium text-gray-700 mb-1">Sample Survey Numbers</div>
                  {['42/3 (Kengeri) — Active Mortgage', '78/2A (Yelahanka) — No Risk Entry', '113/2 (Whitefield) — Court Restriction', '204/6B (Rural) — Incomplete Data'].map(s => (
                    <div key={s} className="text-xs text-gray-600 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />{s}</div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="font-medium text-gray-700 mb-1">Demo Tracking Tokens</div>
                  {['BHUT-2026-000001', 'BHUT-2026-000002', 'BHUT-2026-000003', 'BHUT-2026-000004'].map(tok => (
                    <div key={tok} className="text-xs font-mono text-gray-600 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-blue-500" />{tok}</div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="font-medium text-gray-700 mb-1">Quick Actions</div>
                  <div className="space-y-1.5">
                    <button onClick={() => navigate('/akhata-assessment')} className="w-full text-xs text-left text-blue-700 hover:underline flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />A-Khata Eligibility Check
                    </button>
                    <button onClick={() => navigate('/transparency')} className="w-full text-xs text-left text-blue-700 hover:underline flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />Transparency Dashboard
                    </button>
                    <button onClick={() => navigate('/report-process-concern')} className="w-full text-xs text-left text-blue-700 hover:underline flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />Report a Process Concern
                    </button>
                    <button onClick={() => navigate('/land-records/KA-BLR-KEN-001/encumbrance')} className="w-full text-xs text-left text-blue-700 hover:underline flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />View Encumbrance Report (Survey 42/3)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1a2e] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold">भ</span>
                </div>
                <span className="font-bold">BHU-TRACE</span>
              </div>
              <p className="text-xs text-blue-300 leading-relaxed">Your Land. Your Rights. Your Records.<br/>Making land records transparent, accessible, and accountable.</p>
            </div>
            <div>
              <div className="font-semibold text-sm mb-3">Quick Links</div>
              <div className="space-y-1.5">
                {[['Search Records', '/land-records'], ['Discrepancies', '/discrepancies'], ['Document Checklist', '/document-checklist'], ['Track Application', '/track-application'], ['A-Khata Check', '/akhata-assessment'], ['Transparency', '/transparency'], ['About', '/about']].map(([label, href]) => (
                  <a key={label} href={href} className="block text-xs text-blue-300 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm mb-3">Legal</div>
              <p className="text-xs text-blue-300 leading-relaxed">
                Bhu-Trace is a demonstration platform for a hackathon. Sample records are illustrative and not official government records. Not a legal advisory service.
              </p>
              <p className="text-xs text-blue-300 mt-2 leading-relaxed">
                ಭೂ-ಟ್ರೇಸ್ ಒಂದು ಪ್ರದರ್ಶನ ವೇದಿಕೆ. ಮಾದರಿ ದಾಖಲೆಗಳು ದೃಷ್ಟಾಂತ ಮಾತ್ರ.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-xs text-blue-400">
            © 2026 Bhu-Trace · Built for Legal Accessibility & Social Justice Hackathon · Not an official government system
          </div>
        </div>
      </footer>
    </div>
  )
}

