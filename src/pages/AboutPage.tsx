import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Shield, Eye, Scale, Users, Globe, Layers, Database, Cpu, Map,
  FileText, MessageSquare, GitBranch, Heart, ExternalLink, Info,
  CheckCircle, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const techStack = [
  { name: 'React + TypeScript', description: 'Type-safe component architecture', icon: Layers },
  { name: 'Vite', description: 'Fast development build tool', icon: Cpu },
  { name: 'Tailwind CSS', description: 'Utility-first responsive styling', icon: Eye },
  { name: 'React Router', description: 'Client-side navigation', icon: GitBranch },
  { name: 'Leaflet / OpenStreetMap', description: 'Interactive land parcel maps', icon: Map },
  { name: 'Recharts', description: 'Discrepancy analytics charts', icon: Database },
  { name: 'i18next', description: 'English + Kannada bilingual support', icon: Globe },
  { name: 'Mock AI Service', description: 'Intent-based chatbot (modular — plug in any LLM)', icon: MessageSquare },
  { name: 'localStorage', description: 'Browser-persistent demo data store', icon: FileText },
]

const values = [
  {
    icon: Scale,
    title: 'Legal Accessibility',
    titleKn: 'ಕಾನೂನು ಪ್ರವೇಶ',
    description: 'Land-rights information presented in plain language, not legal jargon, so every citizen can understand their records.',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  {
    icon: Eye,
    title: 'Transparency',
    titleKn: 'ಪಾರದರ್ಶಕತೆ',
    description: 'Every ownership change, correction request, and status update is visible to the applicant in real time.',
    color: 'text-green-700',
    bg: 'bg-green-50',
  },
  {
    icon: Shield,
    title: 'Accountability',
    titleKn: 'ಜವಾಬ್ದಾರಿ',
    description: 'Unique tracking tokens for every submission create a public audit trail for correction requests.',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  {
    icon: Users,
    title: 'Social Justice',
    titleKn: 'ಸಾಮಾಜಿಕ ನ್ಯಾಯ',
    description: 'Designed for farmers, rural citizens, senior citizens, and those without access to legal professionals.',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
  },
  {
    icon: Heart,
    title: 'Inclusivity',
    titleKn: 'ಸೇರ್ಪಡೆ',
    description: 'Full bilingual interface in English and Kannada. Accessible design for all screen sizes and abilities.',
    color: 'text-red-700',
    bg: 'bg-red-50',
  },
  {
    icon: Globe,
    title: 'Open Technology',
    titleKn: 'ತೆರೆದ ತಂತ್ರಜ್ಞಾನ',
    description: 'Built entirely on open-source tools. No proprietary lock-in. Designed to be extended by any government agency.',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
  },
]

const features = [
  'Search land parcels by survey number, owner name, village, taluk, or district',
  'Interactive map of sample land parcels with status-based color coding',
  'Chronological ownership timeline for every land parcel',
  'AI-assisted discrepancy detection across 8 categories of inconsistency',
  'Dynamic document checklist generator for 12 land-related services',
  'Multi-step correction / appeal request form with validation',
  'Unique BHUT-2026-XXXXXX tracking token for every submission',
  'Real-time status tracking with officer notes and next-steps guidance',
  'Bhu-Assist AI chatbot with intent detection and bilingual support',
  'Officer dashboard for reviewing and updating application statuses',
  'Full English and Kannada interface — switchable without page reload',
  'Browser-persistent data — demo submissions survive page refresh',
]

const limitations = [
  'No real government database is connected — all records are illustrative sample data.',
  'Bhu-Assist provides general information only, not formal legal advice.',
  'AI discrepancy alerts require human verification before any official action.',
  'Document checklist requirements are indicative; actual requirements vary by jurisdiction.',
  'Map boundaries are schematic and are not legally accurate cadastral boundaries.',
  'This prototype does not collect, store, or transmit any personal data beyond your browser\'s localStorage.',
]

export default function AboutPage() {
  const { t, i18n } = useTranslation()
  const isKn = i18n.language === 'kn'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-[#1e3a5f] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-4xl">भ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            {isKn ? 'ಭೂ-ಟ್ರೇಸ್' : 'BHU-TRACE'}
          </h1>
          <p className="text-xl text-orange-300 font-medium mb-4">
            {t('about.tagline')}
          </p>
          <p className="text-blue-200 max-w-2xl mx-auto text-lg">
            {t('about.mission')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Badge className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded-full">
              Hackathon Prototype
            </Badge>
            <Badge className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-full">
              Legal Accessibility & Social Justice
            </Badge>
            <Badge className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-full">
              Open Source Stack
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-14">
        {/* Mission Section */}
        <section>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Why Bhu-Trace?</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Land-record management in India is fragmented across agencies, difficult to navigate without
              professional help, and often inaccessible to the citizens most affected — farmers, rural
              landowners, inheritance claimants, and first-time buyers. Bhu-Trace demonstrates how technology
              can close this gap.
            </p>
            {isKn && (
              <p className="text-gray-600 mt-4 text-lg leading-relaxed font-kannada">
                ಭಾರತದಲ್ಲಿ ಭೂ ದಾಖಲೆ ನಿರ್ವಹಣೆ ಹಲವು ಇಲಾಖೆಗಳಲ್ಲಿ ಹರಡಿದೆ. ಭೂ-ಟ್ರೇಸ್ ಈ ಅಂತರವನ್ನು ತಂತ್ರಜ್ಞಾನದಿಂದ ಮುಚ್ಚುವ ಪ್ರಯತ್ನ.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(value => (
              <Card key={value.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mb-4`}>
                    <value.icon className={`h-6 w-6 ${value.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{value.title}</h3>
                  {isKn && (
                    <p className="text-sm text-orange-600 font-kannada mb-2">{value.titleKn}</p>
                  )}
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1e3a5f]">What This Prototype Demonstrates</CardTitle>
              <p className="text-gray-500 text-sm">Full list of functional features in this build</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Technology Stack */}
        <section>
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map(tech => (
              <div key={tech.name} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <tech.icon className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{tech.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bilingual Highlight */}
        <section>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-400">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Globe className="h-8 w-8 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bilingual by Design</h3>
                  <p className="text-gray-700 mb-3">
                    Every page, form, alert, and chatbot response is available in <strong>English</strong> and <strong>Kannada (ಕನ್ನಡ)</strong>.
                    The language can be switched at any time using the toggle in the navigation bar —
                    the entire interface updates without reloading the page.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <p className="text-gray-900 font-medium">
                      "ನಿಮ್ಮ ಭೂಮಿ. ನಿಮ್ಮ ಹಕ್ಕುಗಳು. ನಿಮ್ಮ ದಾಖಲೆಗಳು."
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Your Land. Your Rights. Your Records. — in Kannada</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How to Explore */}
        <section>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1e3a5f]">How to Explore the Demo</CardTitle>
              <p className="text-gray-500 text-sm">Suggested walkthrough for evaluators and judges</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 'A', label: 'Search a land parcel', detail: 'Go to Search Land Records → enter survey number 42/3 → open the result → view the ownership timeline.' },
                { step: 'B', label: 'Explore the interactive map', detail: 'Return to the Home page → scroll to the map section → click a coloured polygon to see parcel details.' },
                { step: 'C', label: 'Review a discrepancy', detail: 'Go to Discrepancy Detection → open any alert → mark it for review and observe the status change.' },
                { step: 'D', label: 'Generate a document checklist', detail: 'Go to Document Checklist → select "Mutation of Land Records" → choose Karnataka → generate the checklist.' },
                { step: 'E', label: 'Submit and track a request', detail: 'Go to Submit a Request → complete the five-step form → copy the BHUT token → paste it in Track Application.' },
                { step: 'F', label: 'Use Bhu-Assist chatbot', detail: 'Click the chat button (bottom-right) → ask "What is RTC?" → ask "Track BHUT-2026-000001" to see live status lookup.' },
                { step: 'G', label: 'Officer dashboard', detail: 'Go to Officer Dashboard → open any request → update the status → switch back to Track Application to confirm the change.' },
                { step: 'H', label: 'Switch to Kannada', detail: 'Click the language toggle (Globe icon, top-right) → navigate across pages → observe labels, badges, and chatbot switch language.' },
              ].map(w => (
                <div key={w.step} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {w.step}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{w.label}</p>
                    <p className="text-gray-600 text-sm mt-0.5">{w.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Demo Data Reference */}
        <section>
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-[#1e3a5f] flex items-center gap-2">
                <Info className="h-5 w-5" />
                Demo Data Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Sample Survey Numbers</p>
                  <div className="space-y-2">
                    {['42/3 — Kengeri, Bengaluru Urban', '78/2A — Yelahanka, Bengaluru Urban', '112/5 — Whitefield, Bengaluru Urban', '204/6B — Begur, Bengaluru Rural', '315/1 — Hesaraghatta, Bengaluru Rural'].map(s => (
                      <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Demo Tracking Tokens</p>
                  <div className="space-y-2">
                    {['BHUT-2026-000001', 'BHUT-2026-000002', 'BHUT-2026-000003', 'BHUT-2026-000004', 'BHUT-2026-000005'].map(token => (
                      <div key={token} className="flex items-center gap-2 text-sm">
                        <span className="font-mono bg-white border border-blue-200 rounded px-2 py-0.5 text-blue-700 text-xs">{token}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Limitations & Disclaimer */}
        <section>
          <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Important Limitations & Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {limitations.map((l, i) => (
                <div key={i} className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-900 text-sm">{l}</p>
                </div>
              ))}
              <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Official Disclaimer:</strong> {t('about.disclaimer')}
                </p>
                {isKn && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed font-kannada">
                    <strong>ಅಧಿಕೃತ ಹಕ್ಕುತ್ಯಾಗ:</strong> ಭೂ-ಟ್ರೇಸ್ ಒಂದು ಹ್ಯಾಕಥಾನ್‌ಗಾಗಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಿದ ಪ್ರದರ್ಶನ ವೇದಿಕೆ. ಮಾದರಿ ಭೂ ದಾಖಲೆಗಳು ದೃಷ್ಟಾಂತ ಮಾತ್ರ ಮತ್ತು ಅಧಿಕೃತ ಸರ್ಕಾರಿ ದಾಖಲೆಗಳಲ್ಲ.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Navigation */}
        <section className="text-center py-6">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Start Exploring</h2>
          <p className="text-gray-500 mb-8">All features are live and functional in this prototype.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/land-records">
              <Button variant="default" className="bg-[#1e3a5f] hover:bg-[#152440]">Search Land Records</Button>
            </Link>
            <Link to="/discrepancies">
              <Button variant="outline">Discrepancy Detection</Button>
            </Link>
            <Link to="/document-checklist">
              <Button variant="outline">Document Checklist</Button>
            </Link>
            <Link to="/submit-request">
              <Button variant="outline">Submit a Request</Button>
            </Link>
            <Link to="/track-application">
              <Button variant="outline">Track Application</Button>
            </Link>
            <Link to="/officer-dashboard">
              <Button variant="saffron">Officer Dashboard</Button>
            </Link>
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center text-gray-400 text-xs border-t pt-8 pb-4">
          <p>🏆 Hackathon Submission — Legal Accessibility & Social Justice Theme</p>
          <p className="mt-1">Built with React · TypeScript · Tailwind CSS · Leaflet · i18next · Recharts</p>
          <p className="mt-1">Not an official government system. All sample data is fictional and illustrative.</p>
        </div>
      </div>
    </div>
  )
}

