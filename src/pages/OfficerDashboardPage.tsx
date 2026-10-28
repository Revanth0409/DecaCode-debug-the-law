import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, AlertTriangle, CheckCircle, Clock, FileText, Eye, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RequestStatusBadge, SeverityBadge } from '@/components/layout/StatusBadge'
import {
  getAllRequests, getAllDiscrepancies, updateRequestStatus, updateDiscrepancyStatus, resetDemoData,
  getAllConcerns, updateConcernStatus
} from '@/services/dataService'
import type { CorrectionRequest, LandDiscrepancy, RequestStatus, ProcessConcern, ConcernReviewStatus } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

const ALL_STATUSES: RequestStatus[] = [
  'submitted', 'preliminary', 'documents', 'verification',
  'forwarded', 'awaiting', 'resolved', 'rejected', 'closed',
]

export default function OfficerDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [discrepancies, setDiscrepancies] = useState<LandDiscrepancy[]>([])
  const [concerns, setConcerns] = useState<ProcessConcern[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedReq, setSelectedReq] = useState<CorrectionRequest | null>(null)
  const [newStatus, setNewStatus] = useState<RequestStatus>('preliminary')
  const [publicNote, setPublicNote] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [officerName, setOfficerName] = useState('Demo Officer')
  const [activeTab, setActiveTab] = useState<'requests' | 'discrepancies' | 'concerns'>('requests')

  function reload() {
    setRequests(getAllRequests())
    setDiscrepancies(getAllDiscrepancies())
    setConcerns(getAllConcerns())
  }

  useEffect(() => { reload() }, [])

  function handleReset() {
    resetDemoData()
    reload()
    toast({ title: 'Demo data reset', description: 'All sample records restored.' })
  }

  function handleStatusUpdate() {
    if (!selectedReq) return
    updateRequestStatus(selectedReq.id, newStatus, publicNote || undefined, internalNote || undefined, officerName)
    toast({ title: 'Status Updated', description: `${selectedReq.token} → ${newStatus}` })
    setPublicNote(''); setInternalNote('')
    reload()
    const updated = getAllRequests().find(r => r.id === selectedReq.id)
    if (updated) setSelectedReq(updated)
  }

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.token.includes(search.toUpperCase()) || r.applicantName.toLowerCase().includes(search.toLowerCase()) || (r.surveyNumber || '').includes(search)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: requests.length,
    awaiting: requests.filter(r => r.status === 'submitted' || r.status === 'preliminary').length,
    docs: requests.filter(r => r.status === 'documents').length,
    verification: requests.filter(r => r.status === 'verification').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    openAlerts: discrepancies.filter(d => d.reviewStatus === 'open').length,
    openConcerns: concerns.filter(c => c.reviewStatus === 'received' || c.reviewStatus === 'under_review').length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('officer.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('officer.subtitle')}</p>
          <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1 inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            Simulated officer view — authentication not required for this demo
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />{t('common.resetDemo')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {[
          { label: t('officer.totalRequests'), value: stats.total, color: 'text-[#1e3a5f]' },
          { label: t('officer.awaitingReview'), value: stats.awaiting, color: 'text-amber-600' },
          { label: t('officer.docsRequired'), value: stats.docs, color: 'text-orange-600' },
          { label: t('officer.underVerification'), value: stats.verification, color: 'text-purple-600' },
          { label: t('officer.resolvedRequests'), value: stats.resolved, color: 'text-green-600' },
          { label: t('officer.openAlerts'), value: stats.openAlerts, color: 'text-red-600' },
          { label: 'Open Concerns', value: stats.openConcerns, color: 'text-orange-700' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {(['requests', 'discrepancies', 'concerns'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab === 'requests'
              ? `${t('officer.requestTable')} (${requests.length})`
              : tab === 'discrepancies'
              ? `${t('officer.discrepancyPanel')} (${discrepancies.length})`
              : `Process Concerns (${concerns.length})`}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token, applicant…" className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Token', 'Type', 'Applicant', 'Survey/Village', 'Submitted', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-[#1e3a5f]">{req.token}</span>
                      {req.isDemo && <span className="ml-1.5 text-[9px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5">demo</span>}
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-gray-700">{req.requestType}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{req.applicantName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{req.surveyNumber || req.village || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(req.submittedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><RequestStatusBadge status={req.status} /></td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedReq(req); setNewStatus(req.status) }}>
                        <Eye className="h-3 w-3 mr-1" />Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No requests match the filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Discrepancies Tab */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-3">
          {discrepancies.map(d => (
            <Card key={d.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <SeverityBadge severity={d.severity} />
                      <span className="text-xs font-medium text-gray-700">{d.category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${d.reviewStatus === 'open' ? 'bg-red-100 text-red-700 border-red-200' : d.reviewStatus === 'underReview' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                        {d.reviewStatus}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Survey {d.surveyNumber} · {d.id}</div>
                    <p className="text-xs text-gray-700 line-clamp-2">{d.description}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {d.reviewStatus !== 'resolved' && (
                      <>
                        {d.reviewStatus === 'open' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { updateDiscrepancyStatus(d.id, 'underReview', '', 'Demo Officer'); reload(); toast({ title: 'Marked for Review' }) }}>
                            Mark Review
                          </Button>
                        )}
                        <Button size="sm" variant="forest" className="h-7 text-xs" onClick={() => { updateDiscrepancyStatus(d.id, 'resolved', 'Verified by officer', 'Demo Officer'); reload(); toast({ title: 'Resolved' }) }}>
                          Resolve
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate('/discrepancies')}>
                      <Eye className="h-3 w-3 mr-1" />Details
                    </Button>
                  </div>
                </div>
                {d.activityLog && d.activityLog.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Latest activity:</p>
                    {d.activityLog.slice(-1).map(a => (
                      <div key={a.id} className="text-xs text-gray-600">
                        <span className="font-medium">{a.actor}</span>: {a.action}
                        <span className="text-gray-400 ml-2">{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Process Concerns Tab */}
      {activeTab === 'concerns' && (
        <div className="space-y-3">
          {concerns.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No process concerns submitted yet.</div>
          )}
          {concerns.map(concern => (
            <Card key={concern.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[#1e3a5f] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {concern.concernToken}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        concern.reviewStatus === 'received' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        concern.reviewStatus === 'under_review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        concern.reviewStatus === 'reviewed' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {concern.reviewStatus === 'received' ? 'Received' :
                         concern.reviewStatus === 'under_review' ? 'Under Review' :
                         concern.reviewStatus === 'reviewed' ? 'Reviewed' : 'Closed'}
                      </span>
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded">
                        {concern.concernType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium">{concern.submitterName || 'Anonymous'}</span>
                      {concern.relatedRequestId && <span className="ml-2 text-blue-600">Re: {concern.relatedRequestId}</span>}
                      <span className="ml-2">{new Date(concern.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{concern.description}</p>
                    {concern.officerResponse && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                        <span className="font-semibold">Officer response: </span>{concern.officerResponse}
                      </div>
                    )}
                    {concern.reviewNotes && !concern.officerResponse && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                        <span className="font-semibold">Notes: </span>{concern.reviewNotes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    {concern.reviewStatus === 'received' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => {
                          updateConcernStatus(concern.id, 'under_review', '', 'Demo Officer')
                          reload()
                          toast({ title: 'Marked Under Review', description: concern.concernToken })
                        }}>
                        <Clock className="h-3 w-3 mr-1" />Start Review
                      </Button>
                    )}
                    {(concern.reviewStatus === 'received' || concern.reviewStatus === 'under_review') && (
                      <Button size="sm" variant="forest" className="h-7 text-xs"
                        onClick={() => {
                          const response = prompt('Enter officer response (visible to submitter):')
                          if (response !== null) {
                            updateConcernStatus(concern.id, 'reviewed', response, 'Demo Officer')
                            reload()
                            toast({ title: 'Concern Reviewed', description: concern.concernToken })
                          }
                        }}>
                        <CheckCircle className="h-3 w-3 mr-1" />Mark Reviewed
                      </Button>
                    )}
                    {concern.reviewStatus !== 'closed' && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:text-red-700"
                        onClick={() => {
                          updateConcernStatus(concern.id, 'closed', 'Concern reviewed and closed.', 'Demo Officer')
                          reload()
                          toast({ title: 'Concern Closed', description: concern.concernToken })
                        }}>
                        Close
                      </Button>
                    )}
                    {concern.relatedRequestId && (
                      <Button size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={() => navigate(`/track-application?token=${concern.relatedRequestId}`)}>
                        <ExternalLink className="h-3 w-3 mr-1" />View Request
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request detail dialog */}
      {selectedReq && (
        <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1e3a5f]" />
                Request: {selectedReq.token}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              {/* Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {[
                  ['Type', selectedReq.requestType], ['Status', selectedReq.status],
                  ['Applicant', selectedReq.applicantName], ['Contact', selectedReq.applicantContact || '—'],
                  ['Relationship', selectedReq.relationship], ['Survey', selectedReq.surveyNumber || '—'],
                  ['Village', selectedReq.village || '—'], ['District', selectedReq.district || '—'],
                  ['Submitted', new Date(selectedReq.submittedAt).toLocaleString()],
                  ['Assigned To', selectedReq.assignedOfficer || 'Unassigned'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-4">
                    <span className="text-xs text-gray-500 w-24 flex-shrink-0">{k}</span>
                    <span className="text-xs font-medium text-gray-800 flex-1">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Issue Description</p>
                <p className="text-sm text-blue-900">{selectedReq.description}</p>
              </div>

              {selectedReq.applicantVisibleNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">{t('officer.publicNote')}</p>
                  <p className="text-sm text-green-900">{selectedReq.applicantVisibleNotes}</p>
                </div>
              )}

              {selectedReq.internalNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">{t('officer.internalNote')}</p>
                  <p className="text-sm text-amber-900">{selectedReq.internalNotes}</p>
                </div>
              )}

              {/* Status history */}
              {selectedReq.statusHistory && selectedReq.statusHistory.length > 0 && (
                <div>
                  <p className="font-medium text-gray-800 mb-2 text-xs uppercase tracking-wider">Status History</p>
                  <div className="space-y-1.5">
                    {selectedReq.statusHistory.map(h => (
                      <div key={h.id} className="text-xs bg-gray-50 rounded p-2 border">
                        <div className="flex items-center justify-between">
                          <RequestStatusBadge status={h.status} />
                          <span className="text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                        {h.publicNote && <p className="text-gray-600 mt-1">{h.publicNote}</p>}
                        {h.changedBy && <p className="text-gray-400 mt-0.5">By: {h.changedBy}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update form */}
              <div className="border-t pt-4">
                <p className="font-medium text-gray-800 mb-3">{t('officer.updateStatus')}</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">New Status</label>
                    <Select value={newStatus} onValueChange={v => setNewStatus(v as RequestStatus)}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">{t('officer.publicNote')} (visible to applicant)</label>
                    <Textarea value={publicNote} onChange={e => setPublicNote(e.target.value)} placeholder="Message for the applicant…" rows={2} className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">{t('officer.internalNote')} (not visible to applicant)</label>
                    <Textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} placeholder="Internal officer note…" rows={2} className="text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Officer Name</label>
                    <Input value={officerName} onChange={e => setOfficerName(e.target.value)} className="text-sm" />
                  </div>
                  <Button onClick={handleStatusUpdate} className="w-full">Update Status</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

