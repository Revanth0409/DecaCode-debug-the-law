import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, CheckCircle, Clock, AlertCircle, XCircle, ChevronRight, FileText, Info, Activity, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RequestStatusBadge } from '@/components/layout/StatusBadge'
import { getRequestByToken, getActivityEventsForRequest } from '@/services/dataService'
import type { CorrectionRequest, RequestStatus, ApplicationActivityEvent } from '@/types'

const DEMO_TOKENS = [
  { token: 'BHUT-2026-000001', desc: 'Record Correction — Under Verification' },
  { token: 'BHUT-2026-000002', desc: 'Appeal — Forwarded to Authority' },
  { token: 'BHUT-2026-000003', desc: 'Mutation — Additional Documents Required' },
  { token: 'BHUT-2026-000004', desc: 'Correction — Resolved ✓' },
  { token: 'BHUT-2026-000005', desc: 'Boundary Survey — Awaiting Decision' },
]

const STATUS_ORDER: RequestStatus[] = [
  'submitted', 'preliminary', 'documents', 'verification',
  'forwarded', 'awaiting', 'resolved', 'rejected', 'closed',
]

const STATUS_ICONS: Record<RequestStatus, React.ReactNode> = {
  submitted: <CheckCircle className="h-4 w-4 text-blue-500" />,
  preliminary: <Clock className="h-4 w-4 text-indigo-500" />,
  documents: <AlertCircle className="h-4 w-4 text-amber-500" />,
  verification: <Search className="h-4 w-4 text-purple-500" />,
  forwarded: <ChevronRight className="h-4 w-4 text-cyan-500" />,
  awaiting: <Clock className="h-4 w-4 text-orange-500" />,
  resolved: <CheckCircle className="h-4 w-4 text-green-600" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  closed: <XCircle className="h-4 w-4 text-gray-400" />,
}

export default function TrackApplicationPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tokenInput, setTokenInput] = useState(searchParams.get('token') || '')
  const [result, setResult] = useState<CorrectionRequest | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    if (t) { setTokenInput(t); doSearch(t) }
  }, [])

  function doSearch(token?: string) {
    const tok = (token || tokenInput).trim().toUpperCase()
    if (!tok) return
    const found = getRequestByToken(tok)
    setSearched(true)
    if (found) { setResult(found); setNotFound(false) }
    else { setResult(null); setNotFound(true) }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch()
  }

  const currentStatusIdx = result ? STATUS_ORDER.indexOf(result.status) : -1

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('track.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('track.subtitle')}</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">{t('track.tokenLabel')}</label>
              <Input
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value.toUpperCase())}
                placeholder={t('track.tokenPlaceholder')}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-10">
                <Search className="h-4 w-4 mr-2" />{t('track.trackBtn')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Demo tokens panel */}
      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />{t('track.demoTokens')} (click to try):
          </p>
          <div className="space-y-1.5">
            {DEMO_TOKENS.map(dt => (
              <button key={dt.token} onClick={() => { setTokenInput(dt.token); doSearch(dt.token) }}
                className="flex items-center gap-2 w-full text-left hover:bg-amber-100 rounded px-2 py-1 transition-colors">
                <span className="font-mono text-xs font-medium text-[#1e3a5f]">{dt.token}</span>
                <span className="text-xs text-amber-700">— {dt.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Not found */}
      {notFound && searched && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-semibold text-red-800 mb-1">{t('track.invalidToken')}</h3>
            <p className="text-sm text-red-600 mb-1">Token entered: <span className="font-mono font-medium">{tokenInput}</span></p>
            <p className="text-xs text-red-500 mb-4">Tokens look like: BHUT-2026-000001</p>
            <Button variant="outline" className="text-sm" onClick={() => navigate('/submit-request')}>
              Submit a New Request →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          {/* Status card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-[#1e3a5f] font-mono text-lg">{result.token}</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5 capitalize">{result.requestType} Request</p>
                </div>
                <RequestStatusBadge status={result.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                <div><p className="text-xs text-gray-500">Submitted</p><p className="font-medium">{new Date(result.submittedAt).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-gray-500">Last Updated</p><p className="font-medium">{new Date(result.updatedAt).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-gray-500">Property Ref</p><p className="font-medium">{result.surveyNumber || result.village || '—'}</p></div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  {['Submitted', 'Review', 'Verification', 'Decision', 'Resolved'].map((s, i) => (
                    <div key={s} className={`text-center flex-1 ${i > 0 ? 'border-l border-gray-200' : ''}`}>
                      <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${currentStatusIdx >= i * 1.5 ? 'bg-[#1e3a5f]' : 'bg-gray-200'}`} />
                      <span className="text-[9px] text-gray-500 hidden sm:block">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e3a5f] rounded-full transition-all" style={{ width: `${Math.min(100, (currentStatusIdx / (STATUS_ORDER.length - 1)) * 100)}%` }} />
                </div>
              </div>

              {/* Officer notes */}
              {result.applicantVisibleNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Officer Notes</p>
                  <p className="text-sm text-blue-800">{result.applicantVisibleNotes}</p>
                </div>
              )}

              {/* Documents required */}
              {result.status === 'documents' && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Additional Documents Required</p>
                  <p className="text-sm text-amber-700">Please check the officer notes above and submit the required documents.</p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs h-7" onClick={() => navigate('/document-checklist')}>
                    <FileText className="h-3.5 w-3.5 mr-1" />View Document Checklist
                  </Button>
                </div>
              )}

              {result.status === 'resolved' && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-green-800 mb-1">✓ Request Resolved</p>
                  <p className="text-sm text-green-700">{result.applicantVisibleNotes || 'Your request has been successfully processed.'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base text-[#1e3a5f]">{t('track.timeline')}</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {(result.statusHistory || []).map((event, idx) => (
                    <div key={event.id} className="relative pl-10">
                      <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${idx === (result.statusHistory || []).length - 1 ? 'bg-[#1e3a5f]' : 'bg-gray-400'}`}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      <div className={`rounded-lg p-3 border ${idx === (result.statusHistory || []).length - 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {STATUS_ICONS[event.status]}
                            <RequestStatusBadge status={event.status} />
                          </div>
                          <span className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        {event.publicNote && <p className="text-xs text-gray-600 mt-1">{event.publicNote}</p>}
                        {event.changedBy && <p className="text-[10px] text-gray-400 mt-1">By: {event.changedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <ActivityTimeline requestId={result.id} />

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="default"
              className="bg-[#1e3a5f] hover:bg-[#152440] flex items-center gap-2"
              onClick={() => navigate(`/legal-appeal/${result.token}`)}
            >
              <Scale className="h-4 w-4" />
              Generate Printable Legal Appeal
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/report-process-concern')}
            >
              <AlertCircle className="h-4 w-4" />
              Report a Process Concern
            </Button>
          </div>

          <div className="text-xs text-gray-400 text-center bg-gray-50 rounded p-2">
            For queries about your application, contact the relevant revenue office with your token number. This is a demonstration prototype.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Activity Timeline sub-component ─────────────────────────────────────────

function ActivityTimeline({ requestId }: { requestId: string }) {
  const [events, setEvents] = useState<ApplicationActivityEvent[]>([])

  useEffect(() => {
    setEvents(getActivityEventsForRequest(requestId))
  }, [requestId])

  if (events.length === 0) return null

  const EVENT_TYPE_LABELS: Record<string, string> = {
    submitted:          'Application Submitted',
    preliminary_review: 'Preliminary Review',
    document_requested: 'Documents Requested',
    assigned:           'Assigned to Officer',
    forwarded:          'Forwarded',
    verification_started: 'Verification Started',
    decision_recorded:  'Decision Recorded',
    resolved:           'Resolved',
    rejected:           'Rejected',
    status_changed:     'Status Updated',
    note_added:         'Note Added',
    payment_verified:   'Payment Verified',
    concern_flagged:    'Concern Flagged',
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Application Activity Log
        </CardTitle>
        <p className="text-xs text-gray-400 mt-0.5">
          Chronological record of all actions on this application. Only applicant-visible information is shown.
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-3">
            {events.map((ev, idx) => (
              <div key={ev.id} className="relative pl-10">
                <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center
                  ${idx === events.length - 1 ? 'bg-[#1e3a5f]' : 'bg-gray-300'}`}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <div className={`rounded-lg p-3 border ${idx === events.length - 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        {EVENT_TYPE_LABELS[ev.eventType] || ev.eventType}
                      </span>
                      {ev.previousStatus && ev.newStatus && ev.previousStatus !== ev.newStatus && (
                        <span className="ml-2 text-xs text-gray-400">
                          {ev.previousStatus} → {ev.newStatus}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {ev.applicantVisibleDescription}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Actor: {ev.actorRole}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

