import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle, AlertTriangle, XCircle, ChevronRight, ChevronLeft,
  RotateCcw, Printer, FileText, Send, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { saveAkhataAssessment } from '@/services/dataService'
import type {
  AkhataAssessment,
  AkhataConversionStatus,
  AkhataLayoutStatus,
  AkhataBettermentStatus,
  AkhataRoadStatus,
  AkhataOutcome,
} from '@/types'

// ─── Score / assessment logic ─────────────────────────────────────────────────

/**
 * Illustrative scoring function — not an official eligibility decision.
 * Scores represent a relative readiness indicator only.
 */
function calculateAssessment(
  conversion: AkhataConversionStatus,
  layout: AkhataLayoutStatus,
  betterment: AkhataBettermentStatus,
  road: AkhataRoadStatus,
): { score: number; outcome: AkhataOutcome; recommendations: string[]; missingDocuments: string[] } {
  // Illustrative per-factor scores (max 100 total)
  const conversionScore: Record<AkhataConversionStatus, number> = {
    yes_available:   25,
    not_applicable:  20,
    not_sure:        10,
    no_incomplete:    0,
  }
  const layoutScore: Record<AkhataLayoutStatus, number> = {
    yes_available: 30,
    pending:       15,
    not_sure:      10,
    no_unapproved:  0,
  }
  const bettermentScore: Record<AkhataBettermentStatus, number> = {
    yes_paid:       25,
    not_applicable: 20,
    partial:        10,
    not_sure:       10,
    no_unpaid:       0,
  }
  const roadScore: Record<AkhataRoadStatus, number> = {
    meets_requirement:   20,
    requires_verification: 10,
    unknown:               5,
    may_be_insufficient:   0,
  }

  const score =
    conversionScore[conversion] +
    layoutScore[layout] +
    bettermentScore[betterment] +
    roadScore[road]

  const outcome: AkhataOutcome =
    score >= 70 ? 'fewer_issues' :
    score >= 45 ? 'additional_docs' :
    score >= 20 ? 'obstacles' :
    'insufficient_info'

  const recommendations: string[] = []
  const missingDocuments: string[] = []

  if (conversion === 'no_incomplete') {
    recommendations.push('Initiate the DC conversion process with the competent revenue/planning authority.')
    missingDocuments.push('DC Conversion Order / Conversion Certificate')
  }
  if (conversion === 'not_sure') {
    recommendations.push('Verify DC conversion status with the revenue authority or planning office.')
  }
  if (layout === 'no_unapproved') {
    recommendations.push('Determine whether a layout regularization scheme is applicable to your property.')
    missingDocuments.push('Layout Approval / Regularization Certificate from competent authority')
  }
  if (layout === 'pending') {
    recommendations.push('Continue the layout approval process and obtain written confirmation of status.')
    missingDocuments.push('Layout Approval Order (pending)')
  }
  if (layout === 'not_sure') {
    recommendations.push('Verify layout approval status with BDA, BMRDA, BBMP, or the relevant local planning authority.')
  }
  if (betterment === 'no_unpaid') {
    recommendations.push('Contact the relevant planning authority for betterment charge payment details and complete payment.')
    missingDocuments.push('Betterment Charges Receipt / Payment Acknowledgement')
  }
  if (betterment === 'partial') {
    recommendations.push('Resolve the outstanding betterment charge balance or dispute with the authority.')
    missingDocuments.push('Betterment Charges Full Payment Receipt')
  }
  if (road === 'may_be_insufficient') {
    recommendations.push('Verify the applicable minimum road width requirement with the relevant planning authority.')
  }
  if (road === 'unknown') {
    recommendations.push('Obtain documentation of road access details from the relevant authority or survey records.')
    missingDocuments.push('Road Access / Width Documentation')
  }

  // Universal recommendations
  recommendations.push('Obtain a certified copy of the RTC (Record of Rights, Tenancy and Crops) and verify all entries.')
  recommendations.push('Engage a qualified property lawyer to review all documents and advise on A-Khata eligibility.')

  return { score, outcome, recommendations, missingDocuments }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type RadioOption<T extends string> = {
  value: T
  label: string
  description?: string
}

// ─── RadioCard ────────────────────────────────────────────────────────────────

function RadioCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: RadioOption<T>
  selected: boolean
  onSelect: (v: T) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-150 ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        <div>
          <p className={`text-sm font-medium ${selected ? 'text-blue-900' : 'text-gray-800'}`}>{option.label}</p>
          {option.description && <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>}
        </div>
      </div>
    </button>
  )
}

// ─── StepProgress ─────────────────────────────────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  const steps = ['DC Conversion', 'Layout Approval', 'Betterment Charges', 'Road Access']
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((label, i) => {
          const stepNum = i + 1
          const done = stepNum < current
          const active = stepNum === current
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                done ? 'bg-green-600 text-white' :
                active ? 'bg-[#1e3a5f] text-white ring-4 ring-blue-200' :
                'bg-gray-200 text-gray-500'
              }`}>
                {done ? <CheckCircle className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`text-xs text-center hidden sm:block ${active ? 'text-[#1e3a5f] font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={`absolute hidden`} />
              )}
            </div>
          )
        })}
      </div>
      <Progress value={(Math.min(current - 1, total) / total) * 100} className="h-1.5 mt-1" />
    </div>
  )
}

// ─── ExplanationBox ───────────────────────────────────────────────────────────

function ExplanationBox({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 mb-4">
      <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800">{text}</p>
    </div>
  )
}

// ─── OutcomeBadge ─────────────────────────────────────────────────────────────

function OutcomeBadge({ outcome }: { outcome: AkhataOutcome }) {
  const cfg: Record<AkhataOutcome, { label: string; className: string; icon: React.ReactNode }> = {
    fewer_issues:     { label: 'Fewer Immediate Issues Identified',       className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="h-5 w-5" /> },
    additional_docs:  { label: 'Additional Documentation Recommended',    className: 'bg-amber-100 text-amber-800 border-amber-300', icon: <AlertTriangle className="h-5 w-5" /> },
    obstacles:        { label: 'Potential Regularization Obstacles',       className: 'bg-orange-100 text-orange-800 border-orange-300', icon: <AlertTriangle className="h-5 w-5" /> },
    insufficient_info:{ label: 'Insufficient Information',                 className: 'bg-gray-100 text-gray-700 border-gray-300', icon: <Info className="h-5 w-5" /> },
  }
  const c = cfg[outcome]
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 ${c.className} text-base font-semibold`}>
      {c.icon}{c.label}
    </div>
  )
}

// ─── AnswerRow ────────────────────────────────────────────────────────────────

function AnswerRow({
  question,
  answer,
  impact,
  positive,
}: {
  question: string
  answer: string
  impact?: string
  positive: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {positive ? (
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{question}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{answer}</p>
        {impact && <p className="text-xs text-gray-600 mt-1 italic">{impact}</p>}
      </div>
    </div>
  )
}

// ─── Per-answer impact texts ──────────────────────────────────────────────────

function getConversionImpact(status: AkhataConversionStatus): string | undefined {
  if (status === 'no_incomplete') return 'Land conversion has not been completed. This is likely to be a significant requirement depending on property type and applicable rules. Obtain legal advice on whether conversion is required for your property.'
  if (status === 'not_sure') return 'Conversion status is uncertain. Verify with the competent revenue authority or planning office.'
  return undefined
}
function getLayoutImpact(status: AkhataLayoutStatus): string | undefined {
  if (status === 'no_unapproved') return 'The layout appears unapproved. This may be a significant obstacle to A-Khata issuance. Verify whether a regularization scheme is applicable.'
  if (status === 'pending') return 'Layout approval is pending. Continue the approval process and obtain confirmation of status.'
  return undefined
}
function getBettermentImpact(status: AkhataBettermentStatus): string | undefined {
  if (status === 'no_unpaid') return 'Betterment charges appear unpaid. Contact the relevant planning authority for payment details.'
  if (status === 'partial') return 'Betterment charges are partially paid or under dispute. Resolve the outstanding amount or dispute with the authority.'
  return undefined
}
function getRoadImpact(status: AkhataRoadStatus): string | undefined {
  if (status === 'may_be_insufficient') return 'The road width may not meet the requirement. Verify the applicable minimum with the relevant authority.'
  if (status === 'unknown') return 'Road access status is undocumented. Obtain documentation from the relevant authority.'
  return undefined
}

function isPositiveConversion(s: AkhataConversionStatus) { return s === 'yes_available' || s === 'not_applicable' }
function isPositiveLayout(s: AkhataLayoutStatus) { return s === 'yes_available' }
function isPositiveBetterment(s: AkhataBettermentStatus) { return s === 'yes_paid' || s === 'not_applicable' }
function isPositiveRoad(s: AkhataRoadStatus) { return s === 'meets_requirement' }

// ─── label helpers ────────────────────────────────────────────────────────────

const CONVERSION_LABELS: Record<AkhataConversionStatus, string> = {
  yes_available:  'Yes — Conversion documentation is available',
  no_incomplete:  'No — Conversion has not been completed',
  not_sure:       'Not sure',
  not_applicable: 'Not applicable / Requires authority verification',
}
const LAYOUT_LABELS: Record<AkhataLayoutStatus, string> = {
  yes_available: 'Yes — Approval documentation is available',
  no_unapproved: 'No — The layout appears to be unapproved',
  pending:       'Pending approval or regularization',
  not_sure:      'Not sure',
}
const BETTERMENT_LABELS: Record<AkhataBettermentStatus, string> = {
  yes_paid:       'Yes — Payment evidence is available',
  no_unpaid:      'No — Payment has not been completed',
  partial:        'Partially paid or under dispute',
  not_sure:       'Not sure',
  not_applicable: 'Not applicable / Requires verification',
}
const ROAD_LABELS: Record<AkhataRoadStatus, string> = {
  meets_requirement:    'Documented width meets the applicable requirement',
  may_be_insufficient:  'Documented width may be insufficient',
  unknown:              'Width is unknown or undocumented',
  requires_verification:'Access or road status requires verification',
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AkhataAssessmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Pre-fill from URL params
  const prefillPropertyId  = searchParams.get('propertyId') ?? ''
  const prefillSurveyNumber = searchParams.get('surveyNumber') ?? ''
  const prefillVillage     = searchParams.get('village') ?? ''
  const prefillTaluk       = searchParams.get('taluk') ?? ''
  const prefillDistrict    = searchParams.get('district') ?? ''

  // Step: 1-4 = form, 5 = results
  const [step, setStep] = useState(1)

  // Form answers
  const [conversion, setConversion]   = useState<AkhataConversionStatus | null>(null)
  const [layout, setLayout]           = useState<AkhataLayoutStatus | null>(null)
  const [betterment, setBetterment]   = useState<AkhataBettermentStatus | null>(null)
  const [road, setRoad]               = useState<AkhataRoadStatus | null>(null)
  const [roadWidth, setRoadWidth]     = useState('')
  const [roadWidthUnit, setRoadWidthUnit] = useState<'meters' | 'feet'>('meters')

  // Assessment result
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number
    outcome: AkhataOutcome
    recommendations: string[]
    missingDocuments: string[]
    savedId: string
  } | null>(null)

  const canProceed = (): boolean => {
    if (step === 1) return conversion !== null
    if (step === 2) return layout !== null
    if (step === 3) return betterment !== null
    if (step === 4) return road !== null
    return false
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(s => s + 1)
    } else if (step === 4 && conversion && layout && betterment && road) {
      // Calculate and save
      const { score, outcome, recommendations, missingDocuments } = calculateAssessment(conversion, layout, betterment, road)
      const docWidth = roadWidth ? `${roadWidth} ${roadWidthUnit}` : undefined
      const now = new Date().toISOString()
      const id = `AKHATA-${Date.now()}`
      const assessment: AkhataAssessment = {
        id,
        propertyId: prefillPropertyId || undefined,
        surveyNumber: prefillSurveyNumber || undefined,
        village: prefillVillage || undefined,
        taluk: prefillTaluk || undefined,
        district: prefillDistrict || undefined,
        conversionStatus: conversion,
        layoutApprovalStatus: layout,
        bettermentChargeStatus: betterment,
        roadAccessStatus: road,
        documentedRoadWidth: docWidth,
        assessmentOutcome: outcome,
        assessmentScore: score,
        ruleVersion: '1.0-illustrative',
        recommendations,
        missingDocuments,
        createdAt: now,
      }
      saveAkhataAssessment(assessment)
      setAssessmentResult({ score, outcome, recommendations, missingDocuments, savedId: id })
      setStep(5)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleReset = () => {
    setStep(1)
    setConversion(null)
    setLayout(null)
    setBetterment(null)
    setRoad(null)
    setRoadWidth('')
    setRoadWidthUnit('meters')
    setAssessmentResult(null)
  }

  // ── Step content ──────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <ExplanationBox text="Land conversion refers to the process of changing land use from agricultural to non-agricultural (residential, commercial, industrial). The requirement and documentation vary by property type and applicable rules." />
            <div className="space-y-2.5">
              {([
                { value: 'yes_available',  label: 'Yes — Conversion documentation is available' },
                { value: 'no_incomplete',  label: 'No — Conversion has not been completed' },
                { value: 'not_sure',       label: 'Not sure' },
                { value: 'not_applicable', label: 'Not applicable / Requires authority verification' },
              ] as RadioOption<AkhataConversionStatus>[]).map(opt => (
                <RadioCard key={opt.value} option={opt} selected={conversion === opt.value} onSelect={setConversion} />
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <ExplanationBox text="The competent planning authority varies by location — BDA (Bangalore Development Authority), BMRDA, BBMP, or other local planning authority. Check which authority has jurisdiction over your property." />
            <div className="space-y-2.5">
              {([
                { value: 'yes_available', label: 'Yes — Approval documentation is available' },
                { value: 'no_unapproved', label: 'No — The layout appears to be unapproved' },
                { value: 'pending',       label: 'Pending approval or regularization' },
                { value: 'not_sure',      label: 'Not sure' },
              ] as RadioOption<AkhataLayoutStatus>[]).map(opt => (
                <RadioCard key={opt.value} option={opt} selected={layout === opt.value} onSelect={setLayout} />
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <ExplanationBox text="Betterment charges are fees levied by the planning authority for the improvement of infrastructure in a layout. Payment requirements vary by authority and property." />
            <div className="space-y-2.5">
              {([
                { value: 'yes_paid',       label: 'Yes — Payment evidence is available' },
                { value: 'no_unpaid',      label: 'No — Payment has not been completed' },
                { value: 'partial',        label: 'Partially paid or under dispute' },
                { value: 'not_sure',       label: 'Not sure' },
                { value: 'not_applicable', label: 'Not applicable / Requires verification' },
              ] as RadioOption<AkhataBettermentStatus>[]).map(opt => (
                <RadioCard key={opt.value} option={opt} selected={betterment === opt.value} onSelect={setBetterment} />
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Road width requirements vary by property type and planning authority. No single threshold applies to all properties.
                Verify the applicable requirement with the relevant authority.
              </p>
            </div>
            <div className="space-y-2.5">
              {([
                { value: 'meets_requirement',    label: 'Documented width meets the applicable requirement' },
                { value: 'may_be_insufficient',  label: 'Documented width may be insufficient' },
                { value: 'unknown',              label: 'Width is unknown or undocumented' },
                { value: 'requires_verification',label: 'Access or road status requires verification' },
              ] as RadioOption<AkhataRoadStatus>[]).map(opt => (
                <RadioCard key={opt.value} option={opt} selected={road === opt.value} onSelect={setRoad} />
              ))}
            </div>
            {/* Optional road width input */}
            <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Enter documented road width (optional)</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 9"
                  value={roadWidth}
                  onChange={e => setRoadWidth(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={roadWidthUnit}
                  onChange={e => setRoadWidthUnit(e.target.value as 'meters' | 'feet')}
                  className="border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meters">Meters</option>
                  <option value="feet">Feet</option>
                </select>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const stepTitles: Record<number, string> = {
    1: 'DC Conversion Status',
    2: 'Layout Approval',
    3: 'Betterment Charges',
    4: 'Road Access',
  }

  const stepQuestions: Record<number, string> = {
    1: 'Has the land been converted for the intended non-agricultural use, where required?',
    2: 'Is the layout approved by the relevant planning authority?',
    3: 'Have the applicable betterment charges or other relevant local charges been paid?',
    4: 'What is the recorded or documented road width providing access to the property?',
  }

  // ── Results view ──────────────────────────────────────────────────────────

  if (step === 5 && assessmentResult && conversion && layout && betterment && road) {
    const { score, outcome, recommendations, missingDocuments } = assessmentResult

    const scoreBarColor =
      outcome === 'fewer_issues' ? 'bg-green-500' :
      outcome === 'additional_docs' ? 'bg-amber-500' :
      outcome === 'obstacles' ? 'bg-orange-500' : 'bg-gray-400'

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl print:py-4">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">A-Khata Eligibility Assessment</h1>
          <span className="text-xs text-gray-500">Results</span>
        </div>

        {/* Pre-fill info */}
        {(prefillSurveyNumber || prefillVillage) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800 space-y-0.5">
            {prefillSurveyNumber && <p><span className="font-semibold">Survey No:</span> {prefillSurveyNumber}</p>}
            {prefillVillage && <p><span className="font-semibold">Village:</span> {prefillVillage}</p>}
            {prefillTaluk && <p><span className="font-semibold">Taluk:</span> {prefillTaluk}</p>}
            {prefillDistrict && <p><span className="font-semibold">District:</span> {prefillDistrict}</p>}
          </div>
        )}

        {/* Outcome badge */}
        <Card className="mb-4 border-2 border-gray-200">
          <CardContent className="pt-5 space-y-4">
            <OutcomeBadge outcome={outcome} />

            {/* Score bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500 font-medium">Illustrative Readiness Score — Not an Official Eligibility Decision</p>
                <span className="text-lg font-bold text-[#1e3a5f]">{score}/100</span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreBarColor}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-answer rows */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#1e3a5f]">Assessment Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <AnswerRow
              question="DC Conversion Status"
              answer={CONVERSION_LABELS[conversion]}
              impact={getConversionImpact(conversion)}
              positive={isPositiveConversion(conversion)}
            />
            <AnswerRow
              question="Layout Approval"
              answer={LAYOUT_LABELS[layout]}
              impact={getLayoutImpact(layout)}
              positive={isPositiveLayout(layout)}
            />
            <AnswerRow
              question="Betterment Charges"
              answer={BETTERMENT_LABELS[betterment]}
              impact={getBettermentImpact(betterment)}
              positive={isPositiveBetterment(betterment)}
            />
            <AnswerRow
              question="Road Access"
              answer={`${ROAD_LABELS[road]}${roadWidth ? ` (${roadWidth} ${roadWidthUnit})` : ''}`}
              impact={getRoadImpact(road)}
              positive={isPositiveRoad(road)}
            />
          </CardContent>
        </Card>

        {/* Missing documents */}
        {missingDocuments.length > 0 && (
          <Card className="mb-4 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />Documents to Obtain or Verify
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {missingDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <FileText className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="mb-4 bg-[#1e3a5f] border-[#1e3a5f]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#f97316]" />Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-100">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#f97316] flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-2">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">Important Disclaimer</p>
            <p className="text-sm text-red-700">
              This assessment is preliminary only. Final eligibility depends on the applicable statutory framework, property category,
              planning authority, documentary evidence, and current government rules. Consult the competent authority.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
          <Button
            className="bg-[#f97316] hover:bg-[#ea6c0a] text-white col-span-2 sm:col-span-1"
            onClick={() => navigate('/document-checklist')}
          >
            <FileText className="h-4 w-4 mr-1" />Generate Checklist
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/submit-request')}
          >
            <Send className="h-4 w-4 mr-1" />Submit Request
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-1" />New Assessment
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-1" />Print
          </Button>
        </div>
      </div>
    )
  }

  // ── Form view ─────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">A-Khata Eligibility Pre-Assessment</h1>
        <p className="text-sm text-gray-500">
          A 4-step diagnostic to help identify potential gaps before an A-Khata application.
          This is not an official determination of eligibility.
        </p>
      </div>

      {/* Pre-fill notice */}
      {(prefillSurveyNumber || prefillVillage) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800">
          <p className="font-semibold mb-1">Pre-filled from property record:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {prefillSurveyNumber && <span>Survey No: <strong>{prefillSurveyNumber}</strong></span>}
            {prefillVillage && <span>Village: <strong>{prefillVillage}</strong></span>}
            {prefillTaluk && <span>Taluk: <strong>{prefillTaluk}</strong></span>}
            {prefillDistrict && <span>District: <strong>{prefillDistrict}</strong></span>}
          </div>
        </div>
      )}

      {/* Step progress */}
      <StepProgress current={step} total={4} />

      {/* Step card */}
      <Card className="border-2 border-[#1e3a5f]/20 shadow-sm">
        <CardHeader className="bg-[#1e3a5f] rounded-t-xl pb-3 pt-4 px-5">
          <div className="flex items-center gap-2">
            <span className="bg-[#f97316] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
              {step}
            </span>
            <CardTitle className="text-white text-base">{stepTitles[step]}</CardTitle>
          </div>
          <p className="text-blue-200 text-sm mt-2">{stepQuestions[step]}</p>
        </CardHeader>
        <CardContent className="pt-5 px-5 pb-5">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-5">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-[#1e3a5f] hover:bg-[#162e4d] text-white flex items-center gap-1"
        >
          {step === 4 ? 'View Results' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-center text-gray-400 mt-4">
        Step {step} of 4 — Your answers are not submitted until you complete all steps.
      </p>
    </div>
  )
}
