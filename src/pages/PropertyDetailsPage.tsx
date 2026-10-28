import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, User, FileText, Calendar, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationBadge } from '@/components/layout/StatusBadge'
import { getParcelById, getOwnershipEvents, getDiscrepanciesForParcel, getRiskRecordForParcel } from '@/services/dataService'
import type { LandParcel, OwnershipEvent, LandDiscrepancy, VerificationStatus, PropertyRiskRecord } from '@/types'

const EVENT_ICONS: Record<VerificationStatus, React.ReactNode> = {
  verified: <CheckCircle className="h-4 w-4 text-green-600" />,
  pending: <Clock className="h-4 w-4 text-amber-600" />,
  discrepancy: <AlertTriangle className="h-4 w-4 text-red-600" />,
  disputed: <XCircle className="h-4 w-4 text-purple-600" />,
}
const EVENT_COLORS: Record<VerificationStatus, string> = {
  verified: 'border-green-400 bg-green-50',
  pending: 'border-amber-400 bg-amber-50',
  discrepancy: 'border-red-400 bg-red-50',
  disputed: 'border-purple-400 bg-purple-50',
}

type ActiveTab = 'overview' | 'timeline' | 'encumbrance'

export default function PropertyDetailsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [parcel, setParcel] = useState<LandParcel | null>(null)
  const [events, setEvents] = useState<OwnershipEvent[]>([])
  const [discrepancies, setDiscrepancies] = useState<LandDiscrepancy[]>([])
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [riskRecord, setRiskRecord] = useState<PropertyRiskRecord | null>(null)

  useEffect(() => {
    if (!propertyId) return
    const p = getParcelById(propertyId)
    if (!p) { navigate('/land-records'); return }
    setParcel(p)
    setEvents(getOwnershipEvents(propertyId))
    setDiscrepancies(getDiscrepanciesForParcel(propertyId))
    const risk = getRiskRecordForParcel(propertyId)
    setRiskRecord(risk || null)
  }, [propertyId, navigate])

  if (!parcel) return (
    <div className="container mx-auto px-4 py-16 text-center text-gray-400">
      <p>Loading property…</p>
    </div>
  )

  const toggleEvent = (id: string) => {
    setExpandedEvents(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const latestTwo = events.slice(-2)

  const riskStatusBadge = riskRecord ? {
    no_issues_found: { label: 'No Known Issues (Demo)', color: 'bg-green-100 text-green-800 border-green-300' },
    encumbrance_detected: { label: 'Encumbrance Detected (Demo)', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    court_restriction: { label: 'Court Restriction Flagged (Demo)', color: 'bg-red-100 text-red-800 border-red-300' },
    verification_required: { label: 'Verification Required', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    data_unavailable: { label: 'Data Unavailable', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  }[riskRecord.overallStatus] : null

  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Overview & Documents' },
    { id: 'timeline' as ActiveTab, label: 'Ownership Timeline' },
    { id: 'encumbrance' as ActiveTab, label: 'Encumbrance & Legal Risk' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/land-records" className="hover:text-[#1e3a5f] flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" />Search Results</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Survey {parcel.surveyNumber}</span>
      </div>

      {/* Demo notice */}
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mb-4 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        {t('common.sampleDataNotice')} Property ID: {parcel.id}
      </div>

      {/* Property Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Survey No. {parcel.surveyNumber}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{parcel.village}, {parcel.taluk}, {parcel.district}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <VerificationBadge status={parcel.verificationStatus} />
          {riskRecord && riskStatusBadge && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-gray-500" />
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${riskStatusBadge.color}`}>
                {riskStatusBadge.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#1e3a5f] text-[#1e3a5f] bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            } ${tab.id === 'encumbrance' ? 'flex items-center gap-1.5' : ''}`}
          >
            {tab.id === 'encumbrance' && <Shield className="h-3.5 w-3.5" />}
            {tab.label}
            {tab.id === 'encumbrance' && riskRecord && riskRecord.riskIndicatorCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{riskRecord.riskIndicatorCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[#1e3a5f]">Property Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    [t('property.owner'), parcel.currentRecordedOwner, User],
                    [t('property.village'), parcel.village, MapPin],
                    [t('property.taluk'), parcel.taluk, MapPin],
                    [t('property.district'), parcel.district, MapPin],
                    [t('property.state'), parcel.state, MapPin],
                    [t('property.area'), `${parcel.area} ${parcel.areaUnit}`, FileText],
                    [t('property.classification'), parcel.classification, FileText],
                    [t('property.lastUpdated'), parcel.lastUpdated, Calendar],
                  ].map(([label, value, Icon]) => (
                    <div key={String(label)}>
                      <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                        <Icon className="h-3 w-3" />{String(label)}
                      </p>
                      <p className="text-sm font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Discrepancy alerts */}
            {discrepancies.length > 0 && (
              <Card className="mt-4 border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-800 flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5" />Discrepancy Alerts ({discrepancies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {discrepancies.map(d => (
                    <div key={d.id} className="mb-3 bg-white rounded-lg border border-red-200 p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-semibold text-red-800">{d.category.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${d.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-200' : d.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                          {d.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{d.description}</p>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate('/discrepancies')}>View Full Alert →</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Record Comparison */}
            {latestTwo.length === 2 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-[#1e3a5f] text-base">{t('property.comparison')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Previous</div>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500 text-xs">Owner</span><p className="font-medium">{latestTwo[0].ownerName}</p></div>
                        <div><span className="text-gray-500 text-xs">Date</span><p>{latestTwo[0].eventDate}</p></div>
                        <div><span className="text-gray-500 text-xs">Event</span><p>{latestTwo[0].eventType}</p></div>
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 ${latestTwo[1].verificationStatus === 'discrepancy' ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Current</div>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500 text-xs">Owner</span><p className="font-medium">{latestTwo[1].ownerName}</p></div>
                        <div><span className="text-gray-500 text-xs">Date</span><p>{latestTwo[1].eventDate}</p></div>
                        <div><span className="text-gray-500 text-xs">Event</span><p>{latestTwo[1].eventType}</p></div>
                      </div>
                    </div>
                  </div>
                  {latestTwo[1].verificationStatus === 'discrepancy' && (
                    <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      Inconsistency detected between records. This requires verification by the competent authority.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {/* Documents */}
            {parcel.documents && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t('property.documents')}</CardTitle></CardHeader>
                <CardContent className="space-y-1.5">
                  {parcel.documents.map(doc => (
                    <div key={doc} className="flex items-start gap-2 text-xs text-gray-600">
                      <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />{doc}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="default" onClick={() => navigate('/submit-request')}>Submit Correction Request</Button>
              <Button className="w-full" variant="outline" onClick={() => setActiveTab('encumbrance')}>
                <Shield className="h-4 w-4 mr-2" />
                Check Encumbrance & Risk
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate(`/akhata-assessment?propertyId=${parcel.id}&surveyNumber=${parcel.surveyNumber}&village=${parcel.village}&taluk=${parcel.taluk}&district=${parcel.district}`)}>
                <Star className="h-4 w-4 mr-2" />
                A-Khata Readiness Check
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/discrepancies')}>View Discrepancy Alerts</Button>
              <Button className="w-full" variant="outline" onClick={() => navigate('/document-checklist')}>Generate Document Checklist</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Ownership Timeline */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">{t('property.timeline')}</CardTitle>
            <p className="text-xs text-amber-600 mt-1">{t('property.verificationNote')}</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {events.length === 0 && (
                  <p className="text-gray-400 text-sm pl-12">No ownership events recorded in the demonstration dataset for this property.</p>
                )}
                {events.map(event => (
                  <div key={event.id} className="relative pl-12">
                    <div className={`absolute left-3 top-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${event.verificationStatus === 'verified' ? 'bg-green-500' : event.verificationStatus === 'pending' ? 'bg-amber-400' : event.verificationStatus === 'discrepancy' ? 'bg-red-500' : 'bg-purple-500'}`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className={`rounded-xl border p-4 ${EVENT_COLORS[event.verificationStatus]}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {EVENT_ICONS[event.verificationStatus]}
                          <span className="font-semibold text-sm text-gray-800">{event.eventType}</span>
                        </div>
                        <div className="text-xs text-gray-500">{event.eventDate}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">👤 {event.ownerName}</div>
                      <p className="text-xs text-gray-600 mb-2 leading-relaxed">{event.description}</p>
                      <button onClick={() => toggleEvent(event.id)} className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-1">
                        {expandedEvents.has(event.id) ? <><ChevronUp className="h-3 w-3" />Hide details</> : <><ChevronDown className="h-3 w-3" />Show details</>}
                      </button>
                      {expandedEvents.has(event.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs text-gray-600">
                          {event.mutationReference && <div><span className="font-medium">Mutation Ref:</span> {event.mutationReference}</div>}
                          {event.recordedAuthority && <div><span className="font-medium">Authority:</span> {event.recordedAuthority}</div>}
                          {event.supportingDocuments && event.supportingDocuments.length > 0 && (
                            <div>
                              <span className="font-medium">Supporting Docs:</span>
                              <ul className="mt-1 space-y-0.5">
                                {event.supportingDocuments.map(d => <li key={d} className="flex items-start gap-1"><FileText className="h-3 w-3 mt-0.5 text-gray-400" />{d}</li>)}
                              </ul>
                            </div>
                          )}
                          {event.endDate && <div><span className="font-medium">End Date:</span> {event.endDate}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Encumbrance — redirect or inline summary */}
      {activeTab === 'encumbrance' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Encumbrance & Legal Risk — Demonstration Data</p>
              <p className="text-xs text-amber-800 mt-1">The information below is from the demonstration dataset. No actual bank, court, or government database has been queried. Always obtain a current Encumbrance Certificate from the Sub-Registrar Office before any property transaction.</p>
            </div>
          </div>

          {riskRecord ? (
            <>
              {/* Quick summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#1e3a5f] text-base flex items-center gap-2">
                      <Shield className="h-5 w-5" />Risk Summary
                    </CardTitle>
                    {riskStatusBadge && (
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${riskStatusBadge.color}`}>
                        {riskStatusBadge.label}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div><span className="text-gray-500 text-xs">Risk Indicators</span><p className="font-semibold">{riskRecord.riskIndicatorCount}</p></div>
                    <div><span className="text-gray-500 text-xs">Last Checked</span><p>{new Date(riskRecord.lastCheckedAt).toLocaleDateString()}</p></div>
                  </div>
                  {/* Mortgage */}
                  <div className="border rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-800">Bank Loan / Mortgage</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        riskRecord.mortgage.status === 'active_mortgage' ? 'bg-red-100 text-red-800 border-red-200' :
                        riskRecord.mortgage.status === 'mortgage_released' ? 'bg-green-100 text-green-800 border-green-200' :
                        riskRecord.mortgage.status === 'no_entry_found' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {riskRecord.mortgage.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    {riskRecord.mortgage.lender && <p className="text-xs text-gray-600">Lender: {riskRecord.mortgage.lender}</p>}
                    {riskRecord.mortgage.referenceNumber && <p className="text-xs text-gray-500">Ref: {riskRecord.mortgage.referenceNumber}</p>}
                    <p className="text-xs text-amber-700 mt-1 italic">{riskRecord.mortgage.notes}</p>
                  </div>
                  {/* Litigation */}
                  <div className={`border rounded-lg p-3 mb-3 ${riskRecord.litigation.status === 'restriction_recorded' ? 'border-red-300 bg-red-50' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-800">Court / Litigation Status</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        riskRecord.litigation.status === 'restriction_recorded' ? 'bg-red-100 text-red-800 border-red-200' :
                        riskRecord.litigation.status === 'no_entry_found' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {riskRecord.litigation.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    {riskRecord.litigation.status === 'restriction_recorded' && (
                      <div className="flex items-start gap-2 text-xs text-red-800 bg-red-100 rounded p-2 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        Court-related restriction is recorded. Consult a qualified lawyer. The effect depends on the specific order.
                      </div>
                    )}
                    {riskRecord.litigation.caseReference && <p className="text-xs text-gray-600">Case Ref: {riskRecord.litigation.caseReference}</p>}
                    {riskRecord.litigation.courtName && <p className="text-xs text-gray-500">Court: {riskRecord.litigation.courtName}</p>}
                    <p className="text-xs text-amber-700 mt-1 italic">{riskRecord.litigation.notes}</p>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="default"
                className="w-full bg-[#1e3a5f]"
                onClick={() => navigate(`/land-records/${propertyId}/encumbrance`)}
              >
                <Shield className="h-4 w-4 mr-2" />
                View Full Encumbrance & Legal Risk Report
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-2">No Encumbrance Data Available</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">No encumbrance information is available in the demonstration dataset for this property. This does not mean the property has no encumbrances.</p>
                <p className="text-xs text-amber-700 mt-3 font-medium">Always obtain a current Encumbrance Certificate from the Sub-Registrar Office before any property transaction.</p>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 italic text-center">
            {riskRecord?.disclaimer || 'Demonstration dataset only. Obtain official records from the competent authority.'}
          </p>
        </div>
      )}
    </div>
  )
}
