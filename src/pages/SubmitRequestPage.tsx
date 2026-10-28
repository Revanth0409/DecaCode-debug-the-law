import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Copy, ArrowRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createRequest } from '@/services/dataService'
import type { RequestType, CorrectionRequest } from '@/types'
import { toast } from '@/hooks/use-toast'

const STEPS = ['Select Request Type', 'Property Information', 'Applicant Information', 'Describe the Issue', 'Review & Submit']
const REQUEST_TYPES: { value: RequestType; label: string; labelKn: string }[] = [
  { value: 'correction', label: 'Record Correction', labelKn: 'ದಾಖಲೆ ಸರಿಪಡಿಕೆ' },
  { value: 'discrepancy', label: 'Ownership Discrepancy', labelKn: 'ಮಾಲೀಕತ್ವ ವ್ಯತ್ಯಾಸ' },
  { value: 'mutation', label: 'Mutation-Related Issue', labelKn: 'ಮ್ಯುಟೇಶನ್ ಸಮಸ್ಯೆ' },
  { value: 'missing', label: 'Missing Record', labelKn: 'ದಾಖಲೆ ಕಾಣೆ' },
  { value: 'boundary', label: 'Boundary / Survey Concern', labelKn: 'ಗಡಿ / ಸರ್ವೆ ಕಾಳಜಿ' },
  { value: 'duplicate', label: 'Duplicate Record', labelKn: 'ನಕಲು ದಾಖಲೆ' },
  { value: 'appeal', label: 'Appeal', labelKn: 'ಮೇಲ್ಮನವಿ' },
  { value: 'other', label: 'Other Land-Record Issue', labelKn: 'ಇತರ ಸಮಸ್ಯೆ' },
]

interface FormData {
  requestType: RequestType | ''
  surveyNumber: string; village: string; taluk: string; district: string; state: string
  applicantName: string; applicantContact: string; preferredLanguage: string; relationship: string
  description: string; noticedDate: string; expectedCorrection: string
}

const INIT: FormData = {
  requestType: '', surveyNumber: '', village: '', taluk: '', district: 'Bengaluru Urban', state: 'Karnataka',
  applicantName: '', applicantContact: '', preferredLanguage: 'en', relationship: '',
  description: '', noticedDate: '', expectedCorrection: '',
}

export default function SubmitRequestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INIT)
  const [submitted, setSubmitted] = useState<CorrectionRequest | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isKn = t('nav.home') === 'ಮುಖಪುಟ'

  function set(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {}
    if (step === 0 && !form.requestType) errs.requestType = 'Please select a request type'
    if (step === 1) {
      if (!form.surveyNumber && !form.village) errs.surveyNumber = 'Provide at least a survey number or village'
    }
    if (step === 2) {
      if (!form.applicantName.trim()) errs.applicantName = 'Name is required'
      if (!form.relationship.trim()) errs.relationship = 'Relationship is required'
    }
    if (step === 3 && !form.description.trim()) errs.description = 'Please describe the issue'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() { if (validateStep()) setStep(s => Math.min(s + 1, 4)) }
  function prev() { setStep(s => Math.max(s - 1, 0)) }

  function submit() {
    if (!validateStep()) return
    const req = createRequest({
      requestType: form.requestType as RequestType,
      surveyNumber: form.surveyNumber || undefined,
      village: form.village || undefined,
      taluk: form.taluk || undefined,
      district: form.district,
      state: form.state,
      applicantName: form.applicantName,
      applicantContact: form.applicantContact,
      preferredLanguage: form.preferredLanguage,
      relationship: form.relationship,
      description: form.description,
      noticedDate: form.noticedDate || undefined,
      expectedCorrection: form.expectedCorrection || undefined,
      isDemo: false,
    })
    setSubmitted(req)
    toast({ title: 'Request Submitted!', description: `Token: ${req.token}` })
  }

  function copyToken() {
    if (submitted) { navigator.clipboard.writeText(submitted.token); toast({ title: 'Token copied!' }) }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Request Submitted Successfully</h1>
          <p className="text-gray-500">Your request has been received and a tracking token has been generated.</p>
        </div>

        <Card className="mb-6 border-[#1e3a5f]/20">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-1">Your Tracking Token</p>
              <div className="text-3xl font-mono font-bold text-[#1e3a5f] bg-blue-50 rounded-xl px-6 py-3 inline-block">{submitted.token}</div>
            </div>
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 text-center mb-4">
              Save this token — you will need it to track your request status.
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-gray-500 text-xs">Request Type</span><p className="font-medium">{submitted.requestType}</p></div>
              <div><span className="text-gray-500 text-xs">Status</span><p className="font-medium text-blue-700">Submitted</p></div>
              <div><span className="text-gray-500 text-xs">Submitted</span><p className="font-medium">{new Date(submitted.submittedAt).toLocaleString()}</p></div>
              <div><span className="text-gray-500 text-xs">Reference</span><p className="font-medium">{submitted.surveyNumber || submitted.village || '—'}</p></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyToken}><Copy className="h-4 w-4 mr-2" />Copy Token</Button>
              <Button className="flex-1" onClick={() => navigate(`/track-application?token=${submitted.token}`)}>
                Track Request <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <p className="font-medium mb-2">Next Steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Save your token: <span className="font-mono font-medium">{submitted.token}</span></li>
            <li>Gather the required supporting documents</li>
            <li>Track your request status on the Track Application page</li>
            <li>Respond to any requests for additional documents promptly</li>
          </ol>
        </div>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => { setSubmitted(null); setForm(INIT); setStep(0) }}>Submit Another Request</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">{t('submit.title')}</h1>
      <p className="text-gray-500 text-sm mb-6">{t('submit.subtitle')}</p>

      {/* Progress steps */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <div className="ml-1.5 mr-3">
              <span className={`text-xs ${i === step ? 'font-semibold text-[#1e3a5f]' : 'text-gray-500'} hidden sm:inline`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-8 mr-3 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base text-[#1e3a5f]">Step {step + 1}: {STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Request type */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUEST_TYPES.map(rt => (
                <button key={rt.value} onClick={() => set('requestType', rt.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${form.requestType === rt.value ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-medium text-sm text-gray-800">{isKn ? rt.labelKn : rt.label}</div>
                  {isKn && <div className="text-xs text-gray-500 mt-0.5">{rt.label}</div>}
                </button>
              ))}
              {errors.requestType && <p className="col-span-2 text-xs text-red-600">{errors.requestType}</p>}
            </div>
          )}

          {/* Step 1: Property */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">{t('search.surveyNumber')}</Label>
                <Input value={form.surveyNumber} onChange={e => set('surveyNumber', e.target.value)} placeholder="e.g. 42/3" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">{t('search.village')}</Label>
                <Input value={form.village} onChange={e => set('village', e.target.value)} placeholder="e.g. Kengeri" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">{t('search.taluk')}</Label>
                <Input value={form.taluk} onChange={e => set('taluk', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">{t('search.district')}</Label>
                <Select value={form.district} onValueChange={v => set('district', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Tumakuru', 'Hassan'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {errors.surveyNumber && <p className="col-span-2 text-xs text-red-600">{errors.surveyNumber}</p>}
            </div>
          )}

          {/* Step 2: Applicant */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{t('submit.applicantName')} *</Label>
                  <Input value={form.applicantName} onChange={e => set('applicantName', e.target.value)} className="mt-1" />
                  {errors.applicantName && <p className="text-xs text-red-600 mt-1">{errors.applicantName}</p>}
                </div>
                <div>
                  <Label className="text-xs">{t('submit.contact')} <span className="text-gray-400">(optional)</span></Label>
                  <Input value={form.applicantContact} onChange={e => set('applicantContact', e.target.value)} className="mt-1" placeholder="Email or phone" />
                </div>
                <div>
                  <Label className="text-xs">{t('submit.relationship')} *</Label>
                  <Select value={form.relationship} onValueChange={v => set('relationship', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {['Recorded Owner', 'Legal Heir', 'Purchaser', 'Legal Representative', 'Neighbour / Adjacent Owner', 'Other'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.relationship && <p className="text-xs text-red-600 mt-1">{errors.relationship}</p>}
                </div>
                <div>
                  <Label className="text-xs">{t('submit.language')}</Label>
                  <Select value={form.preferredLanguage} onValueChange={v => set('preferredLanguage', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 border rounded p-2">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-500" />
                Do not enter Aadhaar numbers, banking details, or other sensitive identifiers. This is a demo prototype.
              </div>
            </div>
          )}

          {/* Step 3: Issue */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">{t('submit.issueDescription')} *</Label>
                <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the land-record issue in detail…" rows={4} className="mt-1" />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">{t('submit.noticedDate')}</Label>
                  <Input type="date" value={form.noticedDate} onChange={e => set('noticedDate', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">{t('submit.expectedCorrection')}</Label>
                  <Input value={form.expectedCorrection} onChange={e => set('expectedCorrection', e.target.value)} className="mt-1" placeholder="What correction do you expect?" />
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded p-2">
                In a production system, you could upload supporting documents here. For this prototype, document upload is noted but not stored on a production server.
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Review Your Submission</h3>
                {[
                  ['Request Type', form.requestType], ['Survey Number', form.surveyNumber || '—'],
                  ['Village', form.village || '—'], ['District', form.district],
                  ['Applicant', form.applicantName], ['Relationship', form.relationship],
                  ['Language', form.preferredLanguage === 'en' ? 'English' : 'ಕನ್ನಡ'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-gray-500 text-xs">{k}</span>
                    <span className="font-medium text-xs text-right">{v}</span>
                  </div>
                ))}
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-500 mb-1">Issue Description</p>
                  <p className="text-sm text-gray-800">{form.description}</p>
                </div>
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                By submitting, you confirm that the information provided is accurate to the best of your knowledge. A unique tracking token will be generated.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={prev} disabled={step === 0}>{t('common.back')}</Button>
            {step < 4
              ? <Button onClick={next}>{t('common.next')} →</Button>
              : <Button onClick={submit} variant="saffron">{t('submit.confirmSubmit')}</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

