import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Download, FileText, Printer, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { getRequestByToken, getParcelById, saveGeneratedDocument } from '@/services/dataService'
import type { CorrectionRequest, LandParcel, GeneratedLegalDocument, DocumentType, DocumentLanguage } from '@/types'

// ─── Static config ────────────────────────────────────────────────────────────

const DOC_TYPES: { value: DocumentType; label: string; labelKn: string }[] = [
  { value: 'record_correction',       label: 'Application for Correction of a Land-Record Error',                   labelKn: 'ಭೂ ದಾಖಲೆ ದೋಷ ಸರಿಪಡಿಕೆಗೆ ಅರ್ಜಿ' },
  { value: 'mutation_review',         label: 'Request for Mutation-Status Review',                                   labelKn: 'ಮ್ಯುಟೇಶನ್ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆಗೆ ವಿನಂತಿ' },
  { value: 'ownership_discrepancy',   label: 'Representation Regarding an Ownership-History Discrepancy',           labelKn: 'ಮಾಲೀಕತ್ವ ಇತಿಹಾಸ ವ್ಯತ್ಯಾಸದ ಬಗ್ಗೆ ಮನವಿ' },
  { value: 'encumbrance_verification',label: 'Request for Verification of an Encumbrance-Related Record',           labelKn: 'ಹೊರೆ ದಾಖಲೆ ಪರಿಶೀಲನೆಗೆ ವಿನಂತಿ' },
  { value: 'appeal_representation',   label: 'Appeal or Representation Concerning a Recorded Decision',             labelKn: 'ದಾಖಲಿತ ನಿರ್ಧಾರದ ವಿರುದ್ಧ ಮೇಲ್ಮನವಿ' },
]

const RECIPIENTS = [
  { value: 'Tahsildar',             label: 'The Tahsildar' },
  { value: 'Revenue Inspector',    label: 'The Revenue Inspector' },
  { value: 'Assistant Commissioner', label: 'The Assistant Commissioner (Revenue)' },
  { value: 'Deputy Commissioner',   label: 'The Deputy Commissioner' },
  { value: 'Other',                 label: 'Other Competent Revenue Authority' },
]

const REQUEST_TYPE_TO_DOC: Record<string, DocumentType> = {
  correction:  'record_correction',
  mutation:    'mutation_review',
  discrepancy: 'ownership_discrepancy',
  appeal:      'appeal_representation',
}

const DOC_ENCLOSURES: Record<DocumentType, string[]> = {
  record_correction:        ['Certified copy of the current land record', 'Evidence supporting the claimed correction'],
  mutation_review:          ['Copy of mutation application or reference', 'Relevant ownership documents'],
  ownership_discrepancy:    ['Certified extract of relevant records', 'Title deed or supporting ownership documents'],
  encumbrance_verification: ['RTC / Pahani extract', 'Relevant encumbrance search report if available'],
  appeal_representation:    ['Copy of the order/decision being appealed', 'Grounds of appeal with supporting documents'],
}

// ─── Document content generators ─────────────────────────────────────────────

interface DocParams {
  recipientDesignation: string
  district: string
  date: string
  docTypeLabel: string
  surveyNumber: string
  village: string
  taluk: string
  applicantName: string
  description: string
  token: string
  submittedDate: string
  applicantContact: string
  applicantAddress: string
  place: string
  additionalContext: string
  generatedAt: string
  docType: DocumentType
}

function buildEnglishLines(p: DocParams): string[] {
  const enclosures = DOC_ENCLOSURES[p.docType] || []
  const lines: string[] = [
    `To,`,
    `${p.recipientDesignation}`,
    `District Revenue Office, ${p.district}, Karnataka`,
    ``,
    `Date: ${p.date}`,
    ``,
    `Subject: ${p.docTypeLabel} — Survey No. ${p.surveyNumber || '(not specified)'}, ${p.village || ''}, ${p.taluk || ''}, ${p.district || ''}`,
    ``,
    `Respected Sir/Madam,`,
    ``,
    `I, ${p.applicantName}, am submitting this representation regarding the land parcel identified as Survey No. ${p.surveyNumber || '(not specified)'}, situated at ${[p.village, p.taluk, p.district, 'Karnataka'].filter(Boolean).join(', ')}.`,
    ``,
    `The issue concerns: ${p.description}`,
    ``,
    p.token ? `My related application reference is ${p.token}, submitted on ${p.submittedDate}.` : '',
    ``,
  ]
  if (p.additionalContext.trim()) {
    lines.push(`Additional context: ${p.additionalContext.trim()}`)
    lines.push(``)
  }
  lines.push(
    `I respectfully request that the relevant records and supporting documents be examined and that appropriate action be taken in accordance with the applicable procedures.`,
    ``,
    `The relevant supporting documents are enclosed with this representation:`,
    `1. Copy of application token acknowledgement (Ref: ${p.token || 'N/A'})`,
    ...enclosures.map((e, i) => `${i + 2}. ${e}`),
    `${enclosures.length + 2}. [Any additional supporting documents]`,
    ``,
    `I request acknowledgement of this representation and information regarding any additional documentation or steps required.`,
    ``,
    `Thank you for your consideration.`,
    ``,
    `Yours faithfully,`,
    ``,
    p.applicantName,
    p.applicantContact ? p.applicantContact : '',
    p.applicantAddress ? p.applicantAddress : '',
    ``,
    `Place: ${p.place || '[Place]'}`,
    `Date:  ${p.date}`,
    ``,
    `Signature: ____________________`,
    ``,
    `Enclosures: As listed above.`,
    ``,
    `─────────────────────────────────────────────────────────────────────────────`,
    `IMPORTANT NOTICE: This document was generated using the Bhu-Trace demonstration`,
    `platform for informational purposes. It is not a prescribed statutory form.`,
    `The appropriate authority, format, procedure, and supporting documents may vary.`,
    `Consult the relevant revenue office or a qualified legal professional before submitting.`,
    `─────────────────────────────────────────────────────────────────────────────`,
    `Application Reference: ${p.token || 'N/A'} | Generated: ${p.generatedAt} | Template Version: 1.0`,
  )
  return lines.filter(l => l !== undefined) as string[]
}

function buildKannadaLines(p: DocParams): string[] {
  const docLabelKn = DOC_TYPES.find(d => d.value === p.docType)?.labelKn || p.docTypeLabel
  return [
    `ಮಾನ್ಯರಿಗೆ,`,
    `${p.recipientDesignation}`,
    `${p.district}, ಕರ್ನಾಟಕ`,
    ``,
    `ದಿನಾಂಕ: ${p.date}`,
    ``,
    `ವಿಷಯ: ${docLabelKn} — ಸರ್ವೆ ನಂ. ${p.surveyNumber || '(ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ)'}, ${p.village || ''}, ${p.taluk || ''}, ${p.district || ''}`,
    ``,
    `ಗೌರವಾನ್ವಿತ ಮಹೋದಯ/ಮಹೋದಯಿ,`,
    ``,
    `ನಾನು, ${p.applicantName}, ಸರ್ವೆ ನಂ. ${p.surveyNumber || '(ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ)'}, ${[p.village, p.taluk, p.district, 'ಕರ್ನಾಟಕ'].filter(Boolean).join(', ')} ಗ್ರಾಮದ ಭೂಮಿ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ಈ ಮನವಿ ಸಲ್ಲಿಸುತ್ತಿದ್ದೇನೆ.`,
    ``,
    `ಸಮಸ್ಯೆ: ${p.description}`,
    ``,
    p.token ? `ಸಂಬಂಧಿತ ಅರ್ಜಿ ಸಂಖ್ಯೆ ${p.token}, ದಿನಾಂಕ ${p.submittedDate} ರಂದು ಸಲ್ಲಿಸಲಾಗಿದೆ.` : '',
    ``,
    p.additionalContext.trim() ? `ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ: ${p.additionalContext.trim()}` : '',
    p.additionalContext.trim() ? `` : '',
    `ಸಂಬಂಧಿತ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಅಗತ್ಯ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಲು ವಿನಂತಿಸುತ್ತೇನೆ.`,
    ``,
    `ತಮ್ಮ ವಿಶ್ವಾಸಿ,`,
    ``,
    p.applicantName,
    p.applicantContact ? p.applicantContact : '',
    p.applicantAddress ? p.applicantAddress : '',
    ``,
    `ಸ್ಥಳ: ${p.place || '[ಸ್ಥಳ]'}`,
    `ದಿನಾಂಕ: ${p.date}`,
    ``,
    `ಸಹಿ: ____________________`,
    ``,
    `ಲಗತ್ತುಗಳು: ಮೇಲೆ ಪಟ್ಟಿ ಮಾಡಿದಂತೆ.`,
    ``,
    `─────────────────────────────────────────────────────────────────────────────`,
    `ಪ್ರಮುಖ ಸೂಚನೆ: ಈ ದಾಖಲೆಯನ್ನು Bhu-Trace ಪ್ರಾತ್ಯಕ್ಷಿಕ ವೇದಿಕೆ ಬಳಸಿ ರಚಿಸಲಾಗಿದೆ.`,
    `ಇದು ಶಾಸನಬದ್ಧ ನಮೂನೆಯಲ್ಲ. ಸಲ್ಲಿಸುವ ಮೊದಲು ಕಂದಾಯ ಕಚೇರಿ ಅಥವಾ ಅರ್ಹ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.`,
    `─────────────────────────────────────────────────────────────────────────────`,
    `Application Reference: ${p.token || 'N/A'} | Generated: ${p.generatedAt} | Template Version: 1.0`,
  ].filter(l => l !== undefined) as string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LegalAppealPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  // Data
  const [request, setRequest] = useState<CorrectionRequest | null>(null)
  const [parcel, setParcel] = useState<LandParcel | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Config
  const [docType, setDocType] = useState<DocumentType>('record_correction')
  const [recipientKey, setRecipientKey] = useState<string>('')
  const [language, setLanguage] = useState<DocumentLanguage>('en')

  // Editable fields
  const [applicantAddress, setApplicantAddress] = useState('')
  const [place, setPlace] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-GB'))
  const [additionalContext, setAdditionalContext] = useState('')
  const [rawDate, setRawDate] = useState(() => new Date().toISOString().split('T')[0])

  // Preview state
  const [previewActive, setPreviewActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const printRef = useRef<HTMLDivElement>(null)

  // Load request
  useEffect(() => {
    if (!token) { setNotFound(true); return }
    const req = getRequestByToken(token)
    if (!req) { setNotFound(true); return }
    setRequest(req)
    // Auto-select doc type
    setDocType(REQUEST_TYPE_TO_DOC[req.requestType] || 'record_correction')
    // Load parcel
    if (req.propertyId) {
      const p = getParcelById(req.propertyId)
      if (p) setParcel(p)
    }
  }, [token])

  // ── Derived values ────────────────────────────────────────────────────────

  const recipientLabel = RECIPIENTS.find(r => r.value === recipientKey)?.label || ''
  const docTypeLabel = DOC_TYPES.find(d => d.value === docType)?.label || ''

  const surveyNumber = request?.surveyNumber || parcel?.surveyNumber || ''
  const village = request?.village || parcel?.village || ''
  const taluk = request?.taluk || parcel?.taluk || ''
  const district = request?.district || parcel?.district || ''
  const state = request?.state || parcel?.state || 'Karnataka'
  const submittedDate = request ? new Date(request.submittedAt).toLocaleDateString('en-GB') : ''
  const generatedAt = new Date().toLocaleString('en-GB')

  const docParams: DocParams = {
    recipientDesignation: recipientLabel,
    district,
    date: selectedDate,
    docTypeLabel,
    surveyNumber,
    village,
    taluk,
    applicantName: request?.applicantName || '',
    description: request?.description || '',
    token: token || '',
    submittedDate,
    applicantContact: request?.applicantContact || '',
    applicantAddress,
    place,
    additionalContext,
    generatedAt,
    docType,
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: string[] = []
    if (!request?.applicantName?.trim()) errs.push('Applicant name is missing from the request.')
    if (!surveyNumber && !token) errs.push('Survey number or application token is required.')
    if (!docType) errs.push('Please select a document type.')
    if (!recipientKey) errs.push('Please select a recipient designation.')
    setValidationErrors(errs)
    return errs.length === 0
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  function handlePreview() {
    if (!validate()) return
    setPreviewActive(true)

    // Persist document metadata
    if (request) {
      const doc: GeneratedLegalDocument = {
        id: `LDOC-${Date.now()}`,
        requestId: request.id,
        documentType: docType,
        recipientDesignation: recipientKey,
        language,
        generatedAt: new Date().toISOString(),
        templateVersion: '1.0',
        documentStatus: 'draft',
      }
      saveGeneratedDocument(doc)
    }
  }

  // ── Print ─────────────────────────────────────────────────────────────────

  function handlePrint() {
    window.print()
  }

  // ── PDF download ──────────────────────────────────────────────────────────

  async function handleDownloadPDF(lang: DocumentLanguage) {
    if (lang === 'kn') {
      alert('For Kannada PDF with proper character rendering, use the Print option and save as PDF from your browser for best Unicode Kannada support.')
      return
    }
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('p', 'mm', 'a4')
    const margin = 20
    const pageWidth = 210
    const usableWidth = pageWidth - margin * 2
    const lineHeight = 6
    let y = margin

    const lines = buildEnglishLines(docParams)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    for (const line of lines) {
      if (line.startsWith('Subject:') || line.startsWith('To,')) {
        doc.setFont('helvetica', 'bold')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      if (line.startsWith('─') || line === '') {
        // separator or blank
        if (line.startsWith('─')) {
          doc.setDrawColor(180, 180, 180)
          doc.line(margin, y, margin + usableWidth, y)
        }
        y += lineHeight * 0.6
      } else {
        const wrapped = doc.splitTextToSize(line, usableWidth) as string[]
        for (const wl of wrapped) {
          if (y > 275) { doc.addPage(); y = margin }
          doc.text(wl, margin, y)
          y += lineHeight
        }
      }
    }

    doc.save(`bhu-trace-appeal-${token || 'doc'}-${lang}.pdf`)
  }

  // ── Rendered document HTML ────────────────────────────────────────────────

  function DocumentText({ lines }: { lines: string[] }) {
    return (
      <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
        {lines.map((line, i) => {
          if (line.startsWith('─────')) {
            return <hr key={i} className="my-2 border-gray-400" />
          }
          if (line.startsWith('Subject:') || line.startsWith('ವಿಷಯ:')) {
            return <p key={i} className="font-bold">{line}</p>
          }
          if (line === '') return <br key={i} />
          return <p key={i}>{line}</p>
        })}
      </div>
    )
  }

  const englishLines = buildEnglishLines(docParams)
  const kannadaLines = buildKannadaLines(docParams)

  // ── Not found state ───────────────────────────────────────────────────────

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-red-800 mb-2">Token Not Found</h1>
        <p className="text-gray-600 mb-2">
          No application found for token: <span className="font-mono font-medium">{token}</span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Tokens look like <span className="font-mono">BHUT-2026-000001</span>. Please verify your token and try again.
        </p>
        <Button onClick={() => navigate('/track-application')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Track Application
        </Button>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-gray-500">
        Loading…
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      {/* Print-only view — only the document div is visible when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-document, #print-document * { visibility: visible !important; }
          #print-document {
            position: fixed !important;
            top: 0; left: 0;
            width: 100%;
            padding: 24mm 20mm;
            background: white;
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.6;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/track-application')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#1e3a5f]">Generate Legal Appeal / Representation</h1>
            <p className="text-sm text-gray-500">Token: <span className="font-mono">{token}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Configuration panel ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Document type */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-[#1e3a5f]">Document Type</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DOC_TYPES.map(dt => (
                  <button
                    key={dt.value}
                    onClick={() => setDocType(dt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${docType === dt.value ? 'border-[#1e3a5f] bg-blue-50 font-medium' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {dt.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Recipient */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-[#1e3a5f]">Recipient</CardTitle></CardHeader>
              <CardContent>
                <Select value={recipientKey} onValueChange={setRecipientKey}>
                  <SelectTrigger><SelectValue placeholder="Select authority…" /></SelectTrigger>
                  <SelectContent>
                    {RECIPIENTS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Language */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-[#1e3a5f]">Language</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {([
                  { value: 'en', label: 'English' },
                  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                  { value: 'both', label: 'Both Languages (Combined)' },
                ] as { value: DocumentLanguage; label: string }[]).map(l => (
                  <label key={l.value} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="language"
                      value={l.value}
                      checked={language === l.value}
                      onChange={() => setLanguage(l.value)}
                      className="accent-[#1e3a5f]"
                    />
                    {l.label}
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Completion fields */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-[#1e3a5f]">Completion Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Applicant Address</Label>
                  <Textarea
                    value={applicantAddress}
                    onChange={e => setApplicantAddress(e.target.value)}
                    placeholder="[Enter applicant address]"
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Place of Signing</Label>
                  <Input
                    value={place}
                    onChange={e => setPlace(e.target.value)}
                    placeholder="[Enter city/village]"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={rawDate}
                    onChange={e => {
                      setRawDate(e.target.value)
                      if (e.target.value) {
                        setSelectedDate(new Date(e.target.value).toLocaleDateString('en-GB'))
                      }
                    }}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Additional Context <span className="text-gray-400">(optional)</span></Label>
                  <Textarea
                    value={additionalContext}
                    onChange={e => setAdditionalContext(e.target.value)}
                    placeholder="Add any additional context for the document…"
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Preview + pre-filled fields ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Pre-filled fields preview */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-[#1e3a5f]">Pre-filled from Application</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ['Applicant Name', request.applicantName],
                    ['Contact', request.applicantContact || '—'],
                    ['Survey Number', surveyNumber || '—'],
                    ['Village', village || '—'],
                    ['Taluk', taluk || '—'],
                    ['District', district || '—'],
                    ['State', state],
                    ['Application Token', token || '—'],
                    ['Submitted Date', submittedDate],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-gray-500">{k}</p>
                      <p className="font-medium text-xs">{v}</p>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Issue Description</p>
                    <p className="text-xs text-gray-700 bg-gray-50 rounded p-2 mt-0.5">{request.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
              <strong>⚠ Review before use:</strong> Review all details before signing or submitting this document.
              The appropriate authority, prescribed format, applicable procedure, and supporting documents may vary.
              This generated document is not a guarantee of legal validity or acceptance.
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Please fix the following before generating:</p>
                <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                  {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {/* Generate button */}
            {!previewActive && (
              <Button onClick={handlePreview} className="w-full" size="lg">
                <Eye className="h-4 w-4 mr-2" />
                Preview Document
              </Button>
            )}

            {/* Document preview */}
            {previewActive && (
              <>
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1.5" />Print Document
                  </Button>
                  {(language === 'en' || language === 'both') && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF('en')}>
                      <Download className="h-4 w-4 mr-1.5" />Download English PDF
                    </Button>
                  )}
                  {language === 'kn' && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF('kn')}>
                      <Download className="h-4 w-4 mr-1.5" />Download Kannada PDF
                    </Button>
                  )}
                  {language === 'both' && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF('kn')}>
                      <FileText className="h-4 w-4 mr-1.5" />Kannada PDF Note
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setPreviewActive(false)}>
                    Edit Configuration
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/track-application')}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to Track Application
                  </Button>
                </div>

                {/* A4-style document preview */}
                <div
                  id="print-document"
                  ref={printRef}
                  className="bg-white border border-gray-300 shadow-md rounded-lg p-8 print:shadow-none print:border-none"
                  style={{ minHeight: '297mm', fontFamily: "'Times New Roman', Times, serif" }}
                >
                  {(language === 'en' || language === 'both') && (
                    <div className={language === 'both' ? 'mb-12 pb-12 border-b-2 border-gray-400' : ''}>
                      {language === 'both' && (
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-sans">— English Version —</p>
                      )}
                      <DocumentText lines={englishLines} />
                    </div>
                  )}

                  {(language === 'kn' || language === 'both') && (
                    <div className={language === 'both' ? 'mt-12' : ''}>
                      {language === 'both' && (
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-sans">— ಕನ್ನಡ ಆವೃತ್ತಿ (Kannada Version) —</p>
                      )}
                      <DocumentText lines={kannadaLines} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
