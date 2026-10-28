import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  AlertTriangle, CheckCircle, Clock, IndianRupee, FileText,
  TrendingUp, MessageSquareWarning, Printer, Download, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  getAllRequests, getAllPayments, getAllConcerns,
  getActivityEventsForRequest, updatePaymentStatus,
} from '@/services/dataService'
import type {
  CorrectionRequest, PaymentRecord, ProcessConcern,
  ApplicationActivityEvent, PaymentStatus,
} from '@/types'
import { toast } from '@/hooks/use-toast'

// ─── Fee Schedule (Illustrative Only) ────────────────────────────────────────
const FEE_SCHEDULE = [
  { service: 'Record Correction', jurisdiction: 'Karnataka', amount: 50, category: 'Government Fee', source: 'Illustrative Fee Schedule', effectiveDate: '2024-01-01', isIllustrative: true },
  { service: 'Mutation Processing', jurisdiction: 'Karnataka', amount: 30, category: 'Government Fee', source: 'Illustrative Fee Schedule', effectiveDate: '2024-01-01', isIllustrative: true },
  { service: 'Encumbrance Certificate', jurisdiction: 'Karnataka', amount: 25, category: 'Registration Charge', source: 'Illustrative Fee Schedule', effectiveDate: '2024-01-01', isIllustrative: true },
  { service: 'Survey / Boundary Verification', jurisdiction: 'Karnataka', amount: 200, category: 'Survey Charge', source: 'Illustrative Fee Schedule', effectiveDate: '2024-01-01', isIllustrative: true },
  { service: 'Appeal Processing', jurisdiction: 'Karnataka', amount: 100, category: 'Government Fee', source: 'Illustrative Fee Schedule', effectiveDate: '2024-01-01', isIllustrative: true },
  { service: 'Certified Record Copy', jurisdiction: 'Karnataka', amount: 20, category: 'Administrative Charge', source: 'Illustrative Fee Schedule', effectiveDate: '2024-01-01', isIllustrative: true },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function paymentStatusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    payment_successful:       { label: 'Successful',       className: 'bg-green-100 text-green-700 border-green-200' },
    awaiting_payment:         { label: 'Awaiting Payment', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    payment_initiated:        { label: 'Initiated',        className: 'bg-blue-100 text-blue-700 border-blue-200' },
    payment_failed:           { label: 'Failed',           className: 'bg-red-100 text-red-700 border-red-200' },
    not_required:             { label: 'Not Required',     className: 'bg-gray-100 text-gray-600 border-gray-200' },
    awaiting_fee_verification:{ label: 'Awaiting Verification', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    refund_requested:         { label: 'Refund Requested', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    refunded:                 { label: 'Refunded',         className: 'bg-teal-100 text-teal-700 border-teal-200' },
    under_reconciliation:     { label: 'Reconciling',      className: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function concernStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    received:     { label: 'Received',     className: 'bg-amber-100 text-amber-700 border-amber-200' },
    under_review: { label: 'Under Review', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    reviewed:     { label: 'Reviewed',     className: 'bg-green-100 text-green-700 border-green-200' },
    closed:       { label: 'Closed',       className: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function formatEventType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ReceiptData {
  receiptId: string
  transactionRef: string
  amount: number
  date: string
  service: string
  token: string
}

function ReceiptDialog({ data, open, onClose }: { data: ReceiptData | null; open: boolean; onClose: () => void }) {
  if (!data) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Demo Payment Receipt
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm" id="receipt-content">
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs text-amber-800 font-semibold text-center">
            DEMO PAYMENT — No real money transferred
          </div>
          <div className="border rounded-lg divide-y">
            {[
              ['Receipt ID', data.receiptId],
              ['Transaction Ref', data.transactionRef],
              ['Service', data.service],
              ['Application Token', data.token],
              ['Amount', `₹${data.amount}`],
              ['Date & Time', new Date(data.date).toLocaleString()],
              ['Recipient', 'Karnataka Revenue Department (Demo)'],
              ['Status', 'DEMO PAYMENT — Completed'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-3 py-2 text-xs">
                <span className="text-gray-500 w-36 flex-shrink-0">{label}</span>
                <span className="font-medium text-gray-800 text-right">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            This is a demonstration receipt. No actual payment was processed.
            Do not use this as proof of payment to any government authority.
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" />Print
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => {
            const text = `BHU-TRACE DEMO RECEIPT\n\nReceipt ID: ${data.receiptId}\nTransaction Ref: ${data.transactionRef}\nService: ${data.service}\nToken: ${data.token}\nAmount: ₹${data.amount}\nDate: ${new Date(data.date).toLocaleString()}\nStatus: DEMO PAYMENT\n\nNo real money was transferred.`
            const blob = new Blob([text], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `receipt-${data.receiptId}.txt`
            a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download className="h-4 w-4 mr-1.5" />Download
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityPaymentsTab() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [concerns, setConcerns] = useState<ProcessConcern[]>([])
  const [selectedReqId, setSelectedReqId] = useState<string>('')
  const [activityEvents, setActivityEvents] = useState<ApplicationActivityEvent[]>([])

  const reload = useCallback(() => {
    const reqs = getAllRequests()
    setRequests(reqs)
    setPayments(getAllPayments())
    setConcerns(getAllConcerns())
    if (!selectedReqId && reqs.length > 0) setSelectedReqId(reqs[0].id)
  }, [selectedReqId])

  useEffect(() => { reload() }, [])

  useEffect(() => {
    if (selectedReqId) {
      setActivityEvents(getActivityEventsForRequest(selectedReqId))
    }
  }, [selectedReqId])

  // Build lookup: requestId → token
  const reqMap = Object.fromEntries(requests.map(r => [r.id, r]))

  // Stats
  const stats = [
    { label: 'Total Requests', value: requests.length, color: 'text-[#1e3a5f]', icon: <FileText className="h-5 w-5" /> },
    { label: 'Payments Pending', value: payments.filter(p => p.paymentStatus === 'awaiting_payment' || p.paymentStatus === 'payment_initiated').length, color: 'text-amber-600', icon: <Clock className="h-5 w-5" /> },
    { label: 'Concerns Submitted', value: concerns.length, color: 'text-orange-600', icon: <MessageSquareWarning className="h-5 w-5" /> },
    { label: 'Concerns Reviewed', value: concerns.filter(c => c.reviewStatus === 'reviewed' || c.reviewStatus === 'closed').length, color: 'text-green-600', icon: <CheckCircle className="h-5 w-5" /> },
  ]

  // Bar chart data
  const statusCounts: Record<string, number> = {}
  requests.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1 })
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }))

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${s.color} opacity-80`}>{s.icon}</div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-gray-500 leading-tight">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />Requests by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#1e3a5f" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Records Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              Simulated Demo — No Real Money Transferred. All amounts are illustrative.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Request Token', 'Service', 'Amount (INR)', 'Status', 'Fee Source', 'Simulated?'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map(p => {
                  const req = reqMap[p.requestId]
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-[#1e3a5f]">
                          {req?.token ?? p.requestId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{p.serviceType}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800">₹{p.amount}</td>
                      <td className="px-4 py-3">{paymentStatusBadge(p.paymentStatus)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.feeSource}</td>
                      <td className="px-4 py-3">
                        {p.isSimulated
                          ? <span className="text-[10px] px-2 py-0.5 rounded-full border bg-orange-100 text-orange-700 border-orange-200 font-medium">Simulated</span>
                          : <span className="text-xs text-gray-400">—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Process Concerns Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4" />Process Concerns
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Token', 'Type', 'Status', 'Related Request', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {concerns.map(c => {
                  const related = c.relatedRequestId ? reqMap[c.relatedRequestId] : undefined
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-[#1e3a5f]">{c.concernToken}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 capitalize">{c.concernType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">{concernStatusBadge(c.reviewStatus)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {related?.token ?? (c.relatedRequestId ? c.relatedRequestId : '—')}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
                {concerns.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No concerns submitted.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base text-[#1e3a5f]">Activity Timeline</CardTitle>
            <Select value={selectedReqId} onValueChange={id => {
              setSelectedReqId(id)
              setActivityEvents(getActivityEventsForRequest(id))
            }}>
              <SelectTrigger className="w-64 h-8 text-xs">
                <SelectValue placeholder="Select a request…" />
              </SelectTrigger>
              <SelectContent>
                {requests.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <span className="font-mono text-xs">{r.token}</span>
                    <span className="ml-2 text-gray-400 text-xs capitalize">{r.requestType}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {activityEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity events found for this request.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {activityEvents.map((ev, idx) => (
                  <div key={ev.id} className="relative pl-10">
                    <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${idx === activityEvents.length - 1 ? 'bg-[#1e3a5f]' : 'bg-gray-300'}`}>
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className={`rounded-lg p-3 border text-xs ${idx === activityEvents.length - 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <span className="font-semibold text-[#1e3a5f]">{formatEventType(ev.eventType)}</span>
                        <span className="text-gray-400 text-[10px]">{new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 mb-1">{ev.applicantVisibleDescription}</p>
                      <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500">
                        <span>Actor: <span className="font-medium">{ev.actorRole}</span></span>
                        {ev.previousStatus && ev.newStatus && (
                          <span className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 bg-gray-200 rounded">{ev.previousStatus}</span>
                            <ChevronRight className="h-3 w-3" />
                            <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded">{ev.newStatus}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Fee Info Tab ─────────────────────────────────────────────────────────────
function FeeInfoTab() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [selectedPayId, setSelectedPayId] = useState<string>('')
  const [simulating, setSimulating] = useState(false)
  const [simProgress, setSimProgress] = useState(0)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  useEffect(() => {
    const reqs = getAllRequests()
    setRequests(reqs)
    const pays = getAllPayments()
    setPayments(pays)
    const eligible = pays.filter(p => p.paymentStatus !== 'payment_successful')
    if (eligible.length > 0) setSelectedPayId(eligible[0].id)
  }, [])

  const reqMap = Object.fromEntries(requests.map(r => [r.id, r]))
  const eligiblePayments = payments.filter(p => p.paymentStatus !== 'payment_successful')
  const selectedPay = payments.find(p => p.id === selectedPayId)
  const selectedReq = selectedPay ? reqMap[selectedPay.requestId] : undefined

  function handleInitiatePayment() {
    if (!selectedPay) return
    setSimulating(true)
    setSimProgress(0)
    const interval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
    setTimeout(() => {
      clearInterval(interval)
      setSimProgress(100)
      const txnRef = `DEMO-TXN-${Date.now()}`
      const updated = updatePaymentStatus(selectedPay.id, 'payment_successful', txnRef)
      if (updated) {
        const receipt: ReceiptData = {
          receiptId: updated.receiptId || `RCPT-2026-${String(Date.now()).slice(-6)}`,
          transactionRef: txnRef,
          amount: updated.amount,
          date: updated.paidAt || new Date().toISOString(),
          service: updated.serviceType,
          token: selectedReq?.token ?? updated.requestId,
        }
        setReceiptData(receipt)
        setReceiptOpen(true)
        // Refresh
        const pays = getAllPayments()
        setPayments(pays)
        const eligible = pays.filter(p => p.paymentStatus !== 'payment_successful')
        setSelectedPayId(eligible.length > 0 ? eligible[0].id : '')
        toast({ title: 'Demo Payment Completed', description: `Transaction Ref: ${txnRef}` })
      }
      setSimulating(false)
    }, 2200)
  }

  return (
    <div className="space-y-8">
      {/* Fee Cards */}
      <div>
        <h2 className="text-base font-semibold text-[#1e3a5f] mb-1">Service Fee Schedule</h2>
        <p className="text-xs text-gray-500 mb-4">All amounts below are illustrative only.</p>
        <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium">
            Illustrative amount only — not an official government fee schedule. Verify with the competent authority before making any payment.
            Do not pay any unofficial or undocumented fees.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEE_SCHEDULE.map(fee => (
            <Card key={fee.service} className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight">{fee.service}</h3>
                  <span className="text-lg font-bold text-[#1e3a5f] whitespace-nowrap">₹{fee.amount}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{fee.category}</Badge>
                  <span className="text-[10px] text-gray-400">{fee.jurisdiction}</span>
                </div>
                <div className="text-[10px] text-gray-500 space-y-0.5">
                  <p>Source: {fee.source}</p>
                  <p>Effective: {fee.effectiveDate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Payment Simulator */}
      <Card className="border-2 border-dashed border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1e3a5f] flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />Demo Payment Simulator
          </CardTitle>
          <p className="text-xs text-gray-500">Select an application with a pending payment to simulate a demo payment.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-800">
            <strong>Simulated Demo Only.</strong> No real money is transferred. This simulator demonstrates what a payment flow might look like.
          </div>

          {eligiblePayments.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4 border rounded-lg">
              All payments are completed. Reset demo data to try again.
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">Select Application (pending payment)</label>
                <Select value={selectedPayId} onValueChange={setSelectedPayId}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder="Choose an application…" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligiblePayments.map(p => {
                      const r = reqMap[p.requestId]
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="font-mono text-xs">{r?.token ?? p.requestId}</span>
                          <span className="ml-2 text-gray-400 text-xs">₹{p.amount} — {p.paymentStatus}</span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedPay && (
                <div className="bg-gray-50 border rounded-lg divide-y text-sm">
                  {[
                    ['Application Token', selectedReq?.token ?? selectedPay.requestId],
                    ['Service', selectedPay.serviceType],
                    ['Amount', `₹${selectedPay.amount}`],
                    ['Recipient', 'Karnataka Revenue Department (Demo)'],
                    ['Current Status', selectedPay.paymentStatus],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between px-3 py-2 text-xs">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {simulating && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Processing demo payment…</span>
                    <span>{simProgress}%</span>
                  </div>
                  <Progress value={simProgress} className="h-2" />
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleInitiatePayment}
                disabled={simulating || !selectedPayId}
              >
                {simulating ? 'Processing…' : 'Initiate Demo Payment'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ReceiptDialog data={receiptData} open={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TransparencyPage() {
  const [activeTab, setActiveTab] = useState<'activity' | 'fees'>('activity')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Transparent Process &amp; Payments</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track payment records, activity timelines, process concerns, and fee information.
        </p>
        <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> All fee amounts and payment records on this page are illustrative sample data for demonstration purposes.
            No real payments are processed. Do not make any payment based solely on this information.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {([
          { id: 'activity', label: 'Activity & Payments' },
          { id: 'fees',     label: 'Fee Information' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'activity' ? <ActivityPaymentsTab /> : <FeeInfoTab />}
    </div>
  )
}
