import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe, Home, Search, AlertTriangle, FileCheck, Send, Truck, Shield, Info, Scale, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import i18n from '@/i18n/i18n'

const navLinks = [
  { key: 'nav.home', href: '/', icon: Home },
  { key: 'nav.landRecords', href: '/land-records', icon: Search },
  { key: 'nav.discrepancies', href: '/discrepancies', icon: AlertTriangle },
  { key: 'nav.docChecklist', href: '/document-checklist', icon: FileCheck },
  { key: 'nav.submitRequest', href: '/submit-request', icon: Send },
  { key: 'nav.trackApplication', href: '/track-application', icon: Truck },
  { key: 'nav.officerDashboard', href: '/officer-dashboard', icon: Shield },
  { key: 'nav.about', href: '/about', icon: Info },
]

const extraLinks = [
  { label: 'A-Khata Check', labelKn: 'ಎ-ಖಾತ ಪರಿಶೀಲನೆ', href: '/akhata-assessment', icon: Star },
  { label: 'Transparency', labelKn: 'ಪಾರದರ್ಶಕತೆ', href: '/transparency', icon: Scale },
  { label: 'Report Concern', labelKn: 'ದೂರು ನೀಡಿ', href: '/report-process-concern', icon: AlertTriangle },
]

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const currentLang = i18n.language === 'kn' ? 'kn' : 'en'

  function toggleLanguage() {
    i18n.changeLanguage(currentLang === 'en' ? 'kn' : 'en')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-[#1e3a5f] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">भ</span>
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-wide">BHU-TRACE</div>
              <div className="text-xs text-blue-200 leading-tight hidden sm:block">AI-Powered Land Record Portal</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 6).map(link => (
              <Link key={link.href} to={link.href}
                className={cn('px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === link.href ? 'bg-orange-500 text-white' : 'text-blue-100 hover:bg-[#152440] hover:text-white'
                )}>
                {t(link.key)}
              </Link>
            ))}
            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-[#152440] hover:text-white transition-colors flex items-center gap-1"
              >
                More ▾
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-48 z-50" onMouseLeave={() => setMoreOpen(false)}>
                  {extraLinks.map(link => (
                    <Link key={link.href} to={link.href} onClick={() => setMoreOpen(false)}
                      className={cn('flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg',
                        location.pathname === link.href ? 'bg-blue-50 text-[#1e3a5f] font-medium' : 'text-gray-700'
                      )}>
                      <link.icon className="h-4 w-4 text-gray-400" />
                      {currentLang === 'kn' ? link.labelKn : link.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100">
                    {navLinks.slice(6).map(link => (
                      <Link key={link.href} to={link.href} onClick={() => setMoreOpen(false)}
                        className={cn('flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg',
                          location.pathname === link.href ? 'bg-blue-50 text-[#1e3a5f] font-medium' : 'text-gray-700'
                        )}>
                        <link.icon className="h-4 w-4 text-gray-400" />
                        {t(link.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-blue-100 hover:text-white hover:bg-[#152440] text-sm transition-colors" aria-label="Toggle language">
              <Globe className="h-4 w-4" />
              <span>{currentLang === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>
            <Link to="/officer-dashboard">
              <Button size="sm" variant="saffron" className="hidden sm:flex text-xs px-3">Officer Dashboard</Button>
            </Link>
            <button className="lg:hidden p-2 rounded-md text-blue-100 hover:text-white hover:bg-[#152440]" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#152440] bg-[#0f1a2e]">
          <nav className="container mx-auto px-4 py-3 space-y-1">
            {([
              ...navLinks.map(l => ({ label: t(l.key), href: l.href, icon: l.icon })),
              ...extraLinks.map(l => ({ label: currentLang === 'kn' ? l.labelKn : l.label, href: l.href, icon: l.icon }))
            ] as { label: string; href: string; icon: React.ElementType }[]).map(link => (
              <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  location.pathname === link.href ? 'bg-orange-500 text-white' : 'text-blue-100 hover:bg-[#152440] hover:text-white'
                )}>
                <link.icon className="h-4 w-4 flex-shrink-0" />
                {link.label}
              </Link>
            ))}
            <button onClick={toggleLanguage} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-blue-100 hover:bg-[#152440] hover:text-white">
              <Globe className="h-4 w-4" />
              {currentLang === 'en' ? 'Switch to ಕನ್ನಡ' : 'Switch to English'}
            </button>
          </nav>
        </div>
      )}

      <div className="bg-amber-400 text-amber-900 text-xs py-1 text-center font-medium">
        🔬 HACKATHON PROTOTYPE — All records are illustrative sample data. Not an official government system.
      </div>
    </header>
  )
}
