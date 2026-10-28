import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle, Eye, MessageSquare, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SeverityBadge } from '@/components/layout/StatusBadge'
import { getAllDiscrepancies, updateDiscrepancyStatus } from '@/services/dataService'
import type { LandDiscrepancy, Severity, DiscrepancyCategory, ReviewStatus } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const CATEGORY_LABELS: Record<DiscrepancyCategory, string> = {
  areaMismatch: 'Area Mismatch',
  ownershipChain: 'Ownership Chain',
  duplicateSurvey: 'Duplicate Survey',
  mutationDate: 'Mutation Date Conflict',
  missingDocument: 'Missing Document',
  classificationConflict: 'Classification Conflict',
  unusualModification: 'Unusual Modification',
  geometryOverlap: 'Geometry Overlap',
}
const SEVERITY_COLORS: Record<Severity, string> = { low: '#3b82f6', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }
const REVIEW_COLORS: Record<ReviewStatus, string> = { open: '#ef4444', underReview: '#f59e0b', resolved: '#22c55e', dismissed: '#6b7280' }

export default function DiscrepanciesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [discrepancies, setDiscrepancies] = useState<LandDiscrepancy[]>([])
  const [selected, setSelected] = useState<LandDiscrepancy | null>(null)
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [reviewNote, setReviewNote] = useState('')
  const [officerName, setOfficerName] = useState('Demo Officer')

  useEffect(() => { setDiscrepancies(getAllDiscrepancies()) }, [])

  const filtered = discrepancies.filter(d => {
    if (filterSeverity !== 'all' && d.severity !== filterSeverity) return false
    if (filterStatus !== 'all' && d.reviewStatus !== filterStatus) return false
    if (filterCategory !== 'all' && d.category !== filterCategory) return false
    return true
  })

  function handleStatusChange(id: string, status: ReviewStatus) {
    const updated = updateDiscrepancyStatus(id, status, reviewNote || undefined, officerName)
    if (updated) {
      setDiscrepancies(getAllDiscrepancies())
      setSelected(updated)
      setReviewNote('')
      toast({ title: 'Status Updated', description: `Alert ${id} marked as ${status}` })
    }
  }

  // Chart data
  const severityData = (['low', 'medium', 'high', 'critical'] as Severity[]).map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: discrepancies.filter(d => d.severity === s).length,
    fill: SEVERITY_COLORS[s],
  }))

  const categoryData = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    name: label.split(' ').slice(0, 2).join(' '),
    count: discrepancies.filter(d => d.category === key).length,
  })).filter(d => d.count > 0)

  const stats = {
    total: discrepancies.length,
    open: discrepancies.filter(d => d.reviewStatus === 'open').length,
    underReview: discrepancies.filter(d => d.reviewStatus === 'underReview').length,
    resolved: discrepancies.filter(d => d.reviewStatus === 'resolved').length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('discrepancy.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('discrepancy.subtitle')}</p>
        <div className="mt-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-3 py-1.5 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {t('discrepancy.aiNote')}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Records Analysed', value: 15, color: 'text-[#1e3a5f]' },
          { label: 'Flagged', value: stats.total, color: 'text-red-600' },
          { label: 'Open Alerts', value: stats.open, color: 'text-amber-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">Alerts by Severity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Alerts">
                  {severityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Alerts by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Review Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="underReview">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-500 flex items-center">{filtered.length} of {discrepancies.length} alerts</span>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map(d => (
          <Card key={d.id} className={`hover:shadow-md transition-shadow cursor-pointer ${d.severity === 'critical' ? 'border-red-300' : d.severity === 'high' ? 'border-orange-300' : ''}`}
            onClick={() => setSelected(d)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <SeverityBadge severity={d.severity} />
                    <span className="text-xs font-medium text-gray-700">{CATEGORY_LABELS[d.category]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${d.reviewStatus === 'open' ? 'bg-red-100 text-red-700' : d.reviewStatus === 'underReview' ? 'bg-amber-100 text-amber-700' : d.reviewStatus === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {d.reviewStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">Survey {d.surveyNumber} · Alert ID: {d.id}</div>
                  <p className="text-sm text-gray-700 line-clamp-2">{d.description}</p>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0 h-8 text-xs">
                  <Eye className="h-3.5 w-3.5 mr-1" />View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No alerts match the selected filters.</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Discrepancy: {CATEGORY_LABELS[selected.category]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={selected.severity} />
                <span className={`text-xs px-2 py-0.5 rounded-full border ${selected.reviewStatus === 'open' ? 'bg-red-100 text-red-700 border-red-200' : selected.reviewStatus === 'underReview' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                  {selected.reviewStatus}
                </span>
                <span className="text-xs text-gray-500">Survey {selected.surveyNumber} · {selected.id}</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-gray-800">Description</p>
                <p className="text-gray-700 leading-relaxed">{selected.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Previous Value</p>
                  <p className="text-sm text-red-900">{selected.previousValue}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1">Current Value</p>
                  <p className="text-sm text-orange-900">{selected.currentValue}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">Evidence</p>
                <p className="text-sm text-blue-900">{selected.evidence}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Recommended Steps</p>
                <p className="text-sm text-green-900">{selected.recommendedAction}</p>
              </div>

              {selected.activityLog && selected.activityLog.length > 0 && (
                <div>
                  <p className="font-medium text-gray-800 mb-2">Activity Log</p>
                  <div className="space-y-2">
                    {selected.activityLog.map(a => (
                      <div key={a.id} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                        <span className="font-medium">{a.actor}</span> — {a.action}
                        <span className="text-gray-400 ml-2">{new Date(a.timestamp).toLocaleString()}</span>
                        {a.note && <p className="mt-1 text-gray-500">{a.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review actions */}
              {selected.reviewStatus !== 'resolved' && (
                <div className="border-t pt-4">
                  <p className="font-medium text-gray-800 mb-2">Review Actions</p>
                  <Textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Add a review note (optional)…" className="text-xs mb-3" rows={2} />
                  <div className="flex flex-wrap gap-2">
                    {selected.reviewStatus === 'open' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(selected.id, 'underReview')}>
                        <UserCheck className="h-3.5 w-3.5 mr-1" />Mark for Review
                      </Button>
                    )}
                    <Button size="sm" variant="forest" onClick={() => handleStatusChange(selected.id, 'resolved')}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Mark Resolved
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-500" onClick={() => handleStatusChange(selected.id, 'dismissed')}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {selected.reviewStatus === 'resolved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                  ✓ This alert has been marked as resolved. {selected.reviewNotes && `Note: ${selected.reviewNotes}`}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

