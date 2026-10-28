import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  AlertTriangle, CheckCircle, Search, ArrowLeft, Shield, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createProcessConcern, getConcernByToken } from '@/services/dataService'
import type { ConcernType, ProcessConcern } from '@/types'
import { useToast } from '@/hooks/use-toast'

const CONCERN_TYPES: { value: ConcernType; label: string; labelKn: string }[] = [
  { value: 'unclear_fee',              label: 'Unclear Fee Request',                        labelKn: 'ಅಸ್ಪಷ್ಟ ಶುಲ್ಕ ವಿನಂತಿ' },
  { value: 'missing_receipt',          label: 'Missing Payment Receipt',                   labelKn: 'ಪಾವತಿ ರಶೀದಿ ಕಾಣೆ' },
  { value: 'payment_not_updated',      label: 'Payment Status Not Updated',                labelKn: 'ಪಾವತಿ ಸ್ಥಿತಿ ನವೀಕರಿಸಿಲ್ಲ' },
  { value: 'unexplained_delay',        label: 'Unexplained Application Delay',             labelKn: 'ವಿವರಿಸದ ಅರ್ಜಿ ವಿಳಂಬ' },
  { value: 'incorrect_status',         label: 'Incorrect Status Update',                   labelKn: 'ತಪ್ಪು ಸ್ಥಿತಿ ನವೀಕರಣ' },
  { value: 'unofficial_payment_demand',label: 'Concern About Unofficial Payment Request',  labelKn: 'ಅನಧಿಕೃತ ಪಾವತಿ ವಿನಂತಿ ಬಗ್ಗೆ ಕಳವಳ' },
  { value: 'other',                    label: 'Other Process Concern',                     labelKn: 'ಇತರ ಪ್ರಕ್ರಿಯಾ ಕಳವಳ' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received:     { label: 'Received',     color: 'bg-amber-100 text-amber-800 border-amber-200' },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  reviewed:     { label: 'Reviewed',     color: 'bg-green-100 text-green-800 border-green-200' },
  closed:       { label: 'Closed',       color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export default function ReportConcernPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // Form state
  const [relatedToken, setRelatedToken] = useState('')
  const [concernType, setConcernType] = useState<ConcernType | ''>('')
  const [description, setDescription] = useState('')
  const [relevantDate, setRelevantDate] = useState('')
  const [preferredContact, setPreferredContact] = useState('')
  const [evidenceNote, setEvidenceNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Submission result
  const [submitted, setSubmitted] = useState(false)
  const [submittedConcern, setSubmittedConcern] = useState<ProcessConcern | null>(null)

  // Token lookup
  const [lookupToken, setLookupToken] = useState('')
  const [lookedUpConcern, setLookedUpConcern] = useState<ProcessConcern | null>(null)
  const [lookupNotFound, setLookupNotFound] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    if (!concernType) errs.concernType = 'Please select a concern type.'
    if (!description.trim() || description.trim().length < 20)
      errs.description = 'Please describe the concern in at least 20 characters.'
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    const concern = createProcessConcern({
      relatedRequestId: relatedToken.trim() || undefined,
      concernType: concernType as ConcernType,
      description: description.trim(),
      relevantDate: relevantDate || undefined,
      preferredContact: preferredContact.trim() || undefined,
      supportingEvidenceReference: evidenceNote.trim() || undefined,
    })
    setSubmittedConcern(concern)
    setSubmitted(true)
    toast({ title: 'Concern submitted', description: `Reference: ${concern.concernToken}` })
  }

  function handleReset() {
    setRelatedToken(''); setConcernType(''); setDescription('')
    setRelevantDate(''); setPreferredContact(''); setEvidenceNote('')
    setErrors({}); setSubmitted(false); setSubmittedConcern(null)
  }

  function handleLookup() {
    if (!lookupToken.trim()) return
    const found = getConcernByToken(lookupToken.trim().toUpperCase())
    if (found) { setLookedUpConcern(found); setLookupNotFound(false) }
    else { setLookedUpConcern(null); setLookupNotFound(true) }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted && submittedConcern) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Concern Logged</h1>
          <p className="text-gray-500">Your process concern has been recorded in the demonstration review queue.</p>
        </div>

        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Your Concern Reference Token</p>
              <div className="font-mono text-2xl font-bold text-[#1e3a5f] bg-white border-2 border-green-300 rounded-lg px-6 py-3 inline-block mb-3">
                {submittedConcern.concernToken}
              </div>
              <p className="text-xs text-gray-500">Keep this reference to track your concern.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base text-[#1e3a5f]">What Happens Next</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
              <p>Your concern has been logged in the demonstration officer dashboard transparency review queue.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
              <p>In a real implementation, the designated review team would be notified. This prototype does not contact any external authority.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
              <p>Use the reference token <strong>{submittedConcern.concernToken}</strong> to track your concern using the lookup below, or in the Officer Dashboard.</p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-900">
          <strong>Prototype Notice:</strong> This is a demonstration. No real government authority, anti-corruption body, or external organisation has been notified. This prototype does not provide legal anonymity or whistleblower protection.
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleReset} variant="default" className="bg-[#1e3a5f]">Submit Another Concern</Button>
          <Button onClick={() => navigate('/officer-dashboard')} variant="outline">View Officer Dashboard</Button>
          <Button onClick={() => navigate('/track-application')} variant="outline">Track Application</Button>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#1e3a5f] flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />Home
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Report a Process Concern</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">Report a Payment or Process Concern</h1>
        <p className="text-gray-500 text-sm">Use this form to flag unclear fees, missing receipts, unexplained delays, or other process issues.</p>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Important — Please Read</p>
          <p>Use neutral language when describing your concern. Submitting this form does not automatically trigger an investigation by an external authority. This is a demonstration prototype — concerns are routed to the demo officer dashboard only.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f] text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />Concern Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Related token */}
          <div>
            <Label htmlFor="relatedToken">Related Application Token <span className="text-gray-400 font-normal">(Optional)</span></Label>
            <Input
              id="relatedToken"
              placeholder="e.g. BHUT-2026-000001"
              value={relatedToken}
              onChange={e => setRelatedToken(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">If your concern is related to a specific application, enter its tracking token here.</p>
          </div>

          {/* Concern type */}
          <div>
            <Label htmlFor="concernType">Concern Type <span className="text-red-500">*</span></Label>
            <Select value={concernType} onValueChange={v => setConcernType(v as ConcernType)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select concern type…" />
              </SelectTrigger>
              <SelectContent>
                {CONCERN_TYPES.map(ct => (
                  <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.concernType && <p className="text-xs text-red-600 mt-1">{errors.concernType}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder="Describe the concern clearly and factually. Use neutral language. Minimum 20 characters."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              className="mt-1"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description
                ? <p className="text-xs text-red-600">{errors.description}</p>
                : <p className="text-xs text-gray-400">Describe what happened factually, without assumptions about intent.</p>
              }
              <span className="text-xs text-gray-400">{description.length} chars</span>
            </div>
          </div>

          {/* Relevant date */}
          <div>
            <Label htmlFor="relevantDate">Relevant Date <span className="text-gray-400 font-normal">(Optional)</span></Label>
            <Input
              id="relevantDate"
              type="date"
              value={relevantDate}
              onChange={e => setRelevantDate(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Preferred contact */}
          <div>
            <Label htmlFor="preferredContact">Preferred Contact Method <span className="text-gray-400 font-normal">(Optional)</span></Label>
            <Input
              id="preferredContact"
              placeholder="e.g. Email: your@email.com (only if you want to be contacted)"
              value={preferredContact}
              onChange={e => setPreferredContact(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Evidence note */}
          <div>
            <Label htmlFor="evidenceNote">Supporting Evidence Note <span className="text-gray-400 font-normal">(Optional)</span></Label>
            <Textarea
              id="evidenceNote"
              placeholder="Describe any supporting evidence you have (do not upload sensitive personal documents)."
              value={evidenceNote}
              onChange={e => setEvidenceNote(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Privacy Notice</p>
            <p>Your submission is stored in this browser's demo localStorage only. In a real implementation, access would be restricted to authorised reviewers. This prototype does not provide legal anonymity or whistleblower protection. Submit only information you are comfortable sharing in a demo environment. No data is sent to any server.</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-[#1e3a5f] hover:bg-[#152440] text-white py-3"
        size="lg"
      >
        Submit Concern
      </Button>

      {/* ── Track a concern ───────────────────────────────────────────────── */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-lg font-bold text-[#1e3a5f] mb-1">Track Your Concern</h2>
        <p className="text-sm text-gray-500 mb-4">Enter a concern reference token (BHUC-2026-XXXXXX) to check its status.</p>

        <div className="flex gap-3">
          <Input
            placeholder="e.g. BHUC-2026-000001"
            value={lookupToken}
            onChange={e => setLookupToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            className="font-mono"
          />
          <Button variant="outline" onClick={handleLookup} className="flex items-center gap-2">
            <Search className="h-4 w-4" />Track
          </Button>
        </div>

        {lookupNotFound && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            No concern found with that reference. Please check the token — it should look like BHUC-2026-000001.
          </div>
        )}

        {lookedUpConcern && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-[#1e3a5f]">{lookedUpConcern.concernToken}</CardTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_LABELS[lookedUpConcern.reviewStatus]?.color || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABELS[lookedUpConcern.reviewStatus]?.label || lookedUpConcern.reviewStatus}
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Concern Type</p>
                  <p className="font-medium">{CONCERN_TYPES.find(c => c.value === lookedUpConcern.concernType)?.label || lookedUpConcern.concernType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p>{new Date(lookedUpConcern.createdAt).toLocaleDateString()}</p>
                </div>
                {lookedUpConcern.relatedRequestId && (
                  <div>
                    <p className="text-xs text-gray-400">Related Application</p>
                    <p className="font-mono text-xs">{lookedUpConcern.relatedRequestId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Last Updated</p>
                  <p>{new Date(lookedUpConcern.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              {lookedUpConcern.reviewNotes && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-gray-500 mb-1">Review Notes</p>
                  <p className="text-sm text-gray-800">{lookedUpConcern.reviewNotes}</p>
                </div>
              )}
              {lookedUpConcern.reviewStatus === 'received' && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Your concern has been received and is in the review queue.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-4 text-xs text-gray-400">
          Demo reference: <span className="font-mono text-blue-600">BHUC-2026-000001</span>
        </div>
      </div>
    </div>
  )
}

