import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getAllParcels } from '@/services/dataService'
import type { LandParcel, VerificationStatus } from '@/types'

const STATUS_COLORS: Record<VerificationStatus, string> = {
  verified: '#16a34a',
  pending: '#d97706',
  discrepancy: '#dc2626',
  disputed: '#9333ea',
}

const STATUS_FILL: Record<VerificationStatus, string> = {
  verified: '#bbf7d0',
  pending: '#fef3c7',
  discrepancy: '#fee2e2',
  disputed: '#f3e8ff',
}

interface MapProps {
  height?: string
  filterStatus?: VerificationStatus | 'all'
  showLegend?: boolean
}

// Schematic SVG-based map fallback (works without leaflet tiles)
export default function LandMap({ height = '500px', filterStatus = 'all', showLegend = true }: MapProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [parcels, setParcels] = useState<LandParcel[]>([])
  const [selected, setSelected] = useState<LandParcel | null>(null)
  const [useLeaflet, setUseLeaflet] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)

  useEffect(() => {
    const all = getAllParcels()
    setParcels(filterStatus === 'all' ? all : all.filter(p => p.verificationStatus === filterStatus))
  }, [filterStatus])

  // Attempt to init Leaflet
  useEffect(() => {
    if (!mapRef.current || parcels.length === 0) return
    let L: any
    try {
      L = (window as any).L
    } catch {
      setUseLeaflet(false)
      return
    }
    if (!L) { setUseLeaflet(false); return }

    // Avoid re-init
    if (leafletMapRef.current) {
      leafletMapRef.current.remove()
    }

    try {
      const map = L.map(mapRef.current, { center: [12.97, 77.59], zoom: 11 })
      leafletMapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      parcels.forEach(parcel => {
        if (!parcel.geometry || parcel.geometry.length < 3) return
        const color = STATUS_COLORS[parcel.verificationStatus]
        const fill = STATUS_FILL[parcel.verificationStatus]
        const poly = L.polygon(parcel.geometry, { color, fillColor: fill, fillOpacity: 0.5, weight: 2 }).addTo(map)
        
        const popupContent = `
          <div style="min-width:200px;font-family:Inter,sans-serif">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#1e3a5f">${parcel.surveyNumber}</div>
            <div style="font-size:12px;color:#555;margin-bottom:4px">👤 ${parcel.currentRecordedOwner}</div>
            <div style="font-size:12px;color:#555;margin-bottom:4px">📍 ${parcel.village}, ${parcel.district}</div>
            <div style="font-size:12px;color:#555;margin-bottom:4px">📐 ${parcel.area} ${parcel.areaUnit}</div>
            <div style="font-size:12px;color:#555;margin-bottom:8px">🏷️ ${parcel.classification}</div>
            <div style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;background:${fill};color:${color};border:1px solid ${color};margin-bottom:8px">${parcel.verificationStatus.toUpperCase()}</div>
            <br/>
            <button onclick="window._bhutrace_nav('${parcel.id}')" style="background:#1e3a5f;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;margin-top:4px">View Full Details →</button>
          </div>`
        poly.bindPopup(popupContent)
        poly.on('click', () => setSelected(parcel))
      })

      // expose nav fn for popup buttons
      ;(window as any)._bhutrace_nav = (id: string) => navigate(`/land-records/${id}`)

    } catch (err) {
      setUseLeaflet(false)
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [parcels, navigate])

  const legend = [
    { status: 'verified' as VerificationStatus, label: t('common.verified') },
    { status: 'pending' as VerificationStatus, label: t('common.pending') },
    { status: 'discrepancy' as VerificationStatus, label: t('common.discrepancy') },
    { status: 'disputed' as VerificationStatus, label: t('common.disputed') },
  ]

  return (
    <div className="relative rounded-xl overflow-hidden border shadow-md" style={{ height }}>
      {/* Leaflet map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Fallback schematic if leaflet unavailable */}
      {!useLeaflet && (
        <SchematicMap parcels={parcels} onSelect={setSelected} navigate={navigate} />
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
          <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
          <div className="space-y-1.5">
            {legend.map(l => (
              <div key={l.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm border" style={{ background: STATUS_FILL[l.status], borderColor: STATUS_COLORS[l.status] }} />
                <span className="text-xs text-gray-600">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t text-[10px] text-gray-400">Demo dataset only</div>
        </div>
      )}

      {/* Selected parcel info panel */}
      {selected && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000] w-64">
          <div className="flex items-start justify-between mb-2">
            <div className="font-bold text-navy-800 text-sm">Survey No. {selected.surveyNumber}</div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-2">×</button>
          </div>
          <div className="text-xs text-gray-600 space-y-1 mb-3">
            <div>👤 {selected.currentRecordedOwner}</div>
            <div>📍 {selected.village}, {selected.district}</div>
            <div>📐 {selected.area} {selected.areaUnit}</div>
            <div>🏷️ {selected.classification}</div>
          </div>
          <button
            onClick={() => navigate(`/land-records/${selected.id}`)}
            className="w-full bg-[#1e3a5f] text-white text-xs py-2 rounded-md hover:bg-[#152440] transition-colors"
          >
            View Full Details →
          </button>
        </div>
      )}
    </div>
  )
}

// Schematic fallback map using SVG
function SchematicMap({ parcels, onSelect, navigate }: { parcels: LandParcel[]; onSelect: (p: LandParcel) => void; navigate: (path: string) => void }) {
  // Simple grid-based layout
  const cols = 4
  return (
    <div className="w-full h-full bg-gray-100 p-4 overflow-auto">
      <div className="text-center text-sm text-gray-500 mb-3">📍 Schematic Map View (Tiles unavailable)</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {parcels.map(parcel => (
          <button
            key={parcel.id}
            onClick={() => onSelect(parcel)}
            className="rounded-lg border-2 p-3 text-left hover:shadow-md transition-shadow cursor-pointer"
            style={{ borderColor: STATUS_COLORS[parcel.verificationStatus], background: STATUS_FILL[parcel.verificationStatus] }}
          >
            <div className="font-bold text-xs text-gray-800">Survey {parcel.surveyNumber}</div>
            <div className="text-xs text-gray-600 truncate mt-1">{parcel.currentRecordedOwner}</div>
            <div className="text-xs text-gray-500 mt-1">{parcel.village}</div>
            <div className="text-xs font-medium mt-1" style={{ color: STATUS_COLORS[parcel.verificationStatus] }}>
              {parcel.verificationStatus}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

