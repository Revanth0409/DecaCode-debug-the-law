import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Shield, FileText, Landmark, Scale,
  Info, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getRiskRecordForParcel, getParcelById } from '@/services/dataService'
import type { LandParcel, PropertyRiskRecord, RiskStatus, RiskSourceType, MortgageStatus, LitigationStatus } from '@/types'

// ─── helper: overall status ──────────────────────────────────────────────────

function OverallStatusBadge({ status }: { status: RiskStatus }) {
  const config: Record<RiskStatus, { label: string; className: string; icon: React.ReactNode }> = {
    no_issues_found: {
      label: 'No Known Issues in Available Records',
      className: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle className="h-4 w-4" />,
    },
    encumbrance_detected: {
      label: 'Potential Encumbrance Detected',
      className: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    court_restriction: {
      label: 'Court-Related Restriction Flagged',
      className: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle className="h-4 w-4" />,
    },
    verification_required: {
      label: 'Verification Required',
      className: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Clock className="h-4 w-4" />,
    },
    data_unavailable: {
      label: 'Information Unavailable',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: <Info className="h-4 w-4" />,
    },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${c.className}`}>
      {c.icon}{c.label}
    </span>
  )
}

// ─── helper: source type badge ────────────────────────────────────────────────

function SourceBadge({ sourceType, sourceName }: { sourceType: RiskSourceType; sourceName: string }) {
  const cfg: Record<RiskSourceType, { label: string; className: string }> = {
    verified_external:   { label: 'Verified External Source', className: 'bg-green-100 text-green-800 border-green-300' },
    uploaded_document:   { label: 'Uploaded Document',        className: 'bg-blue-100 text-blue-800 border-blue-300' },
    demonstration_dataset: { label: 'Demonstration Dataset', className: 'bg-amber-100 text-amber-800 border-amber-300' },
    no_source:           { label: 'No Source',                className: 'bg-gray-100 text-gray-700 border-gray-300' },
  }
  const c = cfg[sourceType]
  return (
    <div className="space-y-1 mt-2">
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${c.className}`}>{c.label}</span>
      <p className="text-xs text-gray-500">{sourceName}</p>
    </div>
  )
}

// ─── helper: mortgage status badge ───────────────────────────────────────────

function MortgageStatusBadge({ status }: { status: MortgageStatus }) {
  const cfg: Record<MortgageStatus, { label: string; className: string }> = {
    active_mortgage:      { label: 'Active Mortgage', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    mortgage_released:    { label: 'Mortgage Released', className: 'bg-green-100 text-green-800 border-green-300' },
    no_entry_found:       { label: 'No Entry Found', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    verification_required:{ label: 'Verification Required', className: 'bg-amber-100 text-amber-800 border-amber-300' },
    data_unavailable:     { label: 'Data Unavailable', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${c.className}`}>{c.label}</span>
  )
}

// ─── helper: litigation status badge ─────────────────────────────────────────

function LitigationStatusBadge({ status }: { status: LitigationStatus }) {
  const cfg: Record<LitigationStatus, { label: string; className: string }> = {
    restriction_recorded:           { label: 'Restriction Recorded', className: 'bg-red-100 text-red-800 border-red-300' },
    reference_found_needs_verification: { label: 'Reference Found — Needs Verification', className: 'bg-amber-100 text-amber-800 border-amber-300' },
    no_entry_found:                 { label: 'No Entry Found', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    verification_required:          { label: 'Verification Required', className: 'bg-amber-100 text-amber-800 border-amber-300' },
    data_unavailable:               { label: 'Data Unavailable', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${c.className}`}>{c.label}</span>
  )
}

// ─── expandable section ───────────────────────────────────────────────────────

function ExpandableSource({ sourceType, sourceName }: { sourceType: RiskSourceType; sourceName: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-[#1e3a5f] hover:underline flex items-center gap-1 font-medium"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        View Evidence &amp; Source
      </button>
      {open && (
        <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1 font-medium">Data Source</p>
          <SourceBadge sourceType={sourceType} sourceName={sourceName} />
          {sourceType === 'demonstration_dataset' && (
            <p className="text-xs text-amber-700 mt-2 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              This record is from the demonstration dataset and does not represent actual registered data.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4">
      <span className="text-xs text-gray-500 sm:w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
  borderColor = 'border-gray-200',
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  borderColor?: string
}) {
  const [expanded, setExpanded] = useState(true)
  return (
    <Card className={`border ${borderColor}`}>
      <CardHeader className="pb-3">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-[#1e3a5f] text-base flex items-center gap-2">
            {icon}{title}
          </CardTitle>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  )
}

// ─── Recommended action list ──────────────────────────────────────────────────

function ActionList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1e3a5f] flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

// ─── No-data fallback ─────────────────────────────────────────────────────────

function NoDataState({ propertyId }: { propertyId: string }) {
  const navigate = useNavigate()
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/land-records" className="hover:text-[#1e3a5f] flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />Search Results
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Encumbrance &amp; Legal Risk</span>
      </div>

      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-[#1e3a5f] flex items-center gap-2">
            <Shield className="h-5 w-5" />Encumbrance &amp; Legal Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 font-medium mb-1">No Data Available in Demonstration Dataset</p>
            <p className="text-sm text-gray-600">
              No encumbrance data is available in the demonstration dataset for Property ID <span className="font-mono font-medium">{propertyId}</span>.
              This does not mean the property has no encumbrances.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-semibold mb-1">Important</p>
            <p className="text-sm text-red-700">
              Obtain a current Encumbrance Certificate from the Sub-Registrar Office. An Encumbrance Certificate (EC) is the
              authoritative record of charges, mortgages, and transactions registered against a property.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">General Recommended Steps</p>
            <ActionList items={[
              'Visit the Sub-Registrar Office (SRO) having jurisdiction over the property to apply for an Encumbrance Certificate.',
              'Apply online via the state registration portal where available, specifying the survey/property details and the required period.',
              'Engage a qualified property lawyer to interpret the EC and identify any encumbrances.',
              'Verify whether any court cases reference the property through eCourts or relevant court records.',
              'Check with the relevant bank or financial institution if you have reason to believe a loan exists.',
            ]} />
          </div>

          <Button variant="outline" onClick={() => navigate(`/land-records/${propertyId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Property Details
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EncumbrancePage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [parcel, setParcel] = useState<LandParcel | null>(null)
  const [riskRecord, setRiskRecord] = useState<PropertyRiskRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    const p = getParcelById(propertyId)
    const r = getRiskRecordForParcel(propertyId)
    setParcel(p ?? null)
    setRiskRecord(r ?? null)
    setLoading(false)
  }, [propertyId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-400">
        <p>Loading encumbrance data…</p>
      </div>
    )
  }

  if (!riskRecord) {
    return <NoDataState propertyId={propertyId ?? ''} />
  }

  const { mortgage, lien, litigation } = riskRecord

  // Mortgage recommended actions
  const mortgageActions: string[] = (() => {
    if (mortgage.status === 'active_mortgage') return [
      'Obtain a certified copy of the mortgage deed from the Sub-Registrar Office.',
      'Verify the outstanding loan amount and discharge conditions with the lender.',
      'Consult a property lawyer before proceeding with any purchase or transfer.',
      'Ensure the seller obtains a No-Objection Certificate (NOC) from the lender before sale.',
    ]
    if (mortgage.status === 'mortgage_released') return [
      'Obtain the discharge deed or release certificate from the Sub-Registrar Office.',
      'Confirm the discharge is registered and reflected in the Encumbrance Certificate.',
      'Verify with the lender that no residual charge remains.',
    ]
    if (mortgage.status === 'verification_required') return [
      'Apply for an Encumbrance Certificate covering the relevant period from the Sub-Registrar Office.',
      'Consult a property lawyer to verify the mortgage status.',
    ]
    return [
      'Obtain a current Encumbrance Certificate to confirm absence of registered mortgage.',
      'Verify directly with any known lenders if transaction history suggests a loan.',
    ]
  })()

  // Lien recommended steps
  const lienActions: string[] = lien.hasLien ? [
    lien.recommendedSteps || '',
    'Consult a qualified property lawyer to understand the nature and extent of the lien.',
    'Obtain certified copies of any referenced lien instruments from the Sub-Registrar Office.',
    'Ensure the lien is discharged before completing any property transaction.',
  ].filter(Boolean) as string[] : [
    'Obtain a current Encumbrance Certificate to confirm no lien is registered.',
    'Verify with any known creditors or financial institutions.',
  ]

  // Litigation recommended steps
  const litigationActions: string[] = (() => {
    if (litigation.status === 'restriction_recorded') return [
      'Consult a qualified lawyer immediately before proceeding with any transaction.',
      'Obtain copies of the court order through eCourts or the relevant court registry.',
      'Verify whether the restriction applies to the specific portion you intend to transact.',
      'Do not complete any registration or transfer until the legal position is clarified.',
    ]
    if (litigation.status === 'reference_found_needs_verification') return [
      'Search eCourts (ecourts.gov.in) using property details, survey number, and party names.',
      'Consult a property lawyer to interpret any references found.',
      'Obtain a litigation search certificate from a lawyer if required for due diligence.',
    ]
    return [
      'Conduct an independent litigation search through eCourts.',
      'Engage a lawyer to perform a title search covering the relevant period.',
    ]
  })()

  // Overall recommended actions
  const overallActions: string[] = [
    'Obtain a current Encumbrance Certificate (EC) from the Sub-Registrar Office covering at least the past 30 years.',
    'Commission a title investigation by a qualified property lawyer before any transaction.',
    'Search the eCourts portal (ecourts.gov.in) for any litigation referencing the survey number or owners.',
    'Verify the property tax payment status with the local authority.',
    ...(riskRecord.overallStatus === 'encumbrance_detected' || riskRecord.overallStatus === 'court_restriction'
      ? ['Do not proceed with registration or payment until all encumbrances are resolved.']
      : []),
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/land-records" className="hover:text-[#1e3a5f] flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />Search Results
        </Link>
        <span>/</span>
        {parcel && (
          <>
            <Link to={`/land-records/${propertyId}`} className="hover:text-[#1e3a5f]">
              Survey {parcel.surveyNumber}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-800 font-medium">Encumbrance &amp; Legal Risk</span>
      </div>

      {/* Demo notice */}
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mb-6 flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        {t('common.sampleDataNotice')} Property ID: {propertyId}
      </div>

      {/* Risk Summary Card */}
      <Card className="mb-6 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#1e3a5f] flex items-center gap-2">
            <Shield className="h-5 w-5" />Encumbrance &amp; Legal Risk Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {parcel && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <InfoRow label="Survey Number" value={parcel.surveyNumber} />
              <InfoRow label="Property ID" value={parcel.id} />
              <InfoRow label="Village" value={parcel.village} />
              <InfoRow label="District" value={parcel.district} />
              <InfoRow label="Recorded Owner" value={parcel.currentRecordedOwner} />
              <InfoRow label="Last Checked" value={new Date(riskRecord.lastCheckedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Overall Status</p>
              <OverallStatusBadge status={riskRecord.overallStatus} />
            </div>
            <div className="sm:ml-auto text-right">
              <p className="text-xs text-gray-500">Risk Indicators</p>
              <p className="text-2xl font-bold text-[#1e3a5f]">{riskRecord.riskIndicatorCount}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Important Disclaimer: </span>
              {riskRecord.disclaimer || 'Absence of an entry in this dataset does not confirm the property is free from encumbrances. Always obtain a current Encumbrance Certificate from the Sub-Registrar Office.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card A: Mortgage */}
      <div className="space-y-4 mb-6">
        <SectionCard
          icon={<Landmark className="h-5 w-5 text-[#1e3a5f]" />}
          title="Bank Loan / Mortgage Status"
          borderColor={mortgage.status === 'active_mortgage' ? 'border-orange-200' : 'border-gray-200'}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MortgageStatusBadge status={mortgage.status} />
              {mortgage.verificationStatus === 'simulated' && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">Simulated Data</span>
              )}
            </div>

            <div className="space-y-2">
              <InfoRow label="Lender" value={mortgage.lender} />
              <InfoRow label="Reference Number" value={mortgage.referenceNumber} />
              <InfoRow label="Record Date" value={mortgage.recordDate} />
              <InfoRow label="Loan Amount" value={mortgage.amount} />
              <InfoRow label="Discharge Status" value={mortgage.dischargeStatus} />
              <InfoRow label="Last Updated" value={mortgage.lastUpdated} />
            </div>

            {mortgage.notes && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100 italic">{mortgage.notes}</p>
            )}

            <Separator />

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Recommended Actions</p>
              <ActionList items={mortgageActions} />
            </div>

            <ExpandableSource sourceType={mortgage.sourceType} sourceName={mortgage.sourceName} />
          </div>
        </SectionCard>

        {/* Card B: Lien */}
        <SectionCard
          icon={<FileText className="h-5 w-5 text-[#1e3a5f]" />}
          title="Bank Lien / Financial Charge"
          borderColor={lien.hasLien ? 'border-orange-200' : 'border-gray-200'}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${lien.hasLien ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                {lien.hasLien ? 'Lien Detected' : 'No Lien Entry Found'}
              </span>
            </div>

            <div className="space-y-2">
              <InfoRow label="Reference" value={lien.reference} />
              <InfoRow label="Source Document" value={lien.sourceDocument} />
              <InfoRow label="Record Date" value={lien.recordDate} />
              <InfoRow label="Status" value={lien.status} />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <span className="font-semibold">Note: </span>
              A lien and a mortgage are legally distinct instruments. Verify with a qualified property lawyer to understand the
              nature, extent, and priority of any charge recorded against the property.
            </div>

            {lien.notes && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100 italic">{lien.notes}</p>
            )}

            <Separator />

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Recommended Steps</p>
              <ActionList items={lienActions} />
            </div>

            <ExpandableSource sourceType={lien.sourceType} sourceName={lien.sourceName} />
          </div>
        </SectionCard>

        {/* Card C: Litigation */}
        <SectionCard
          icon={<Scale className="h-5 w-5 text-[#1e3a5f]" />}
          title="Court Litigation / Civil Injunction"
          borderColor={litigation.status === 'restriction_recorded' ? 'border-red-300' : 'border-gray-200'}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LitigationStatusBadge status={litigation.status} />
              {litigation.verificationStatus === 'simulated' && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">Simulated Data</span>
              )}
            </div>

            {litigation.status === 'restriction_recorded' && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Warning: </span>
                  A court-related restriction is recorded. Consult a qualified lawyer before proceeding with any
                  transaction. The effect depends on the specific order and applicable law.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <InfoRow label="Court Name" value={litigation.courtName} />
              <InfoRow label="Case Reference" value={litigation.caseReference} />
              <InfoRow label="Case Category" value={litigation.caseCategory} />
              <InfoRow label="Order Date" value={litigation.orderDate} />
              <InfoRow label="Latest Case Status" value={litigation.latestCaseStatus} />
            </div>

            {litigation.notes && (
              <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-100 italic">{litigation.notes}</p>
            )}

            <Separator />

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Recommended Steps</p>
              <ActionList items={litigationActions} />
            </div>

            <ExpandableSource sourceType={litigation.sourceType} sourceName={litigation.sourceName} />
          </div>
        </SectionCard>
      </div>

      {/* Recommended Actions Summary */}
      <Card className="mb-6 bg-[#1e3a5f] text-white border-[#1e3a5f]">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-[#f97316]" />Overall Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {overallActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-blue-100">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#f97316] flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-blue-800 text-xs text-blue-300">
            <ExternalLink className="h-3 w-3 inline mr-1" />
            eCourts portal: ecourts.gov.in | Karnataka Registration Department: karigr.karnataka.gov.in
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white"
          onClick={() => navigate('/document-checklist?service=encumbrance')}
        >
          <FileText className="h-4 w-4 mr-2" />Generate Property Due-Diligence Checklist
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/land-records/${propertyId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Property Details
        </Button>
      </div>
    </div>
  )
}
