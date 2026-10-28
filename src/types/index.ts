// Core data types for Bhu-Trace

export type VerificationStatus = 'verified' | 'pending' | 'discrepancy' | 'disputed'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type DiscrepancyCategory = 
  | 'areaMismatch' 
  | 'ownershipChain' 
  | 'duplicateSurvey' 
  | 'mutationDate' 
  | 'missingDocument' 
  | 'classificationConflict' 
  | 'unusualModification' 
  | 'geometryOverlap'
export type ReviewStatus = 'open' | 'underReview' | 'resolved' | 'dismissed'
export type RequestStatus = 
  | 'submitted' 
  | 'preliminary' 
  | 'documents' 
  | 'verification' 
  | 'forwarded' 
  | 'awaiting' 
  | 'resolved' 
  | 'rejected' 
  | 'closed'
export type RequestType = 
  | 'correction' 
  | 'discrepancy' 
  | 'mutation' 
  | 'missing' 
  | 'boundary' 
  | 'duplicate' 
  | 'appeal' 
  | 'other'

export interface LandParcel {
  id: string
  surveyNumber: string
  subdivisionNumber?: string
  village: string
  taluk: string
  district: string
  state: string
  area: number
  areaUnit: string
  classification: string
  currentRecordedOwner: string
  verificationStatus: VerificationStatus
  lastUpdated: string
  geometry: number[][]  // [lat, lng][]
  documents?: string[]
  discrepancyIds?: string[]
}

export interface OwnershipEvent {
  id: string
  parcelId: string
  ownerName: string
  startDate: string
  endDate?: string
  eventType: string
  eventDate: string
  mutationReference?: string
  supportingDocuments?: string[]
  verificationStatus: VerificationStatus
  description: string
  recordedAuthority?: string
}

export interface LandDiscrepancy {
  id: string
  parcelId: string
  surveyNumber: string
  category: DiscrepancyCategory
  severity: Severity
  description: string
  evidence: string
  previousValue: string
  currentValue: string
  recommendedAction: string
  reviewStatus: ReviewStatus
  createdAt: string
  reviewedAt?: string
  reviewNotes?: string
  assignedOfficer?: string
  activityLog?: ActivityEntry[]
}

export interface CorrectionRequest {
  id: string
  token: string
  requestType: RequestType
  propertyId?: string
  surveyNumber?: string
  village?: string
  taluk?: string
  district?: string
  state?: string
  applicantName: string
  applicantContact: string
  preferredLanguage: string
  relationship: string
  description: string
  noticedDate?: string
  expectedCorrection?: string
  status: RequestStatus
  submittedAt: string
  updatedAt: string
  assignedOfficer?: string
  applicantVisibleNotes?: string
  internalNotes?: string
  statusHistory?: RequestStatusEvent[]
  isDemo?: boolean
}

export interface RequestStatusEvent {
  id: string
  requestId: string
  status: RequestStatus
  timestamp: string
  publicNote?: string
  internalNote?: string
  changedBy?: string
}

export interface DocumentChecklistItem {
  id: string
  serviceType: string
  documentName: string
  documentNameKn: string
  requirementType: 'required' | 'conditional' | 'optional'
  description: string
  descriptionKn: string
  condition?: string
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  entityType: string
  entityId: string
  timestamp: string
  changeSummary: string
}

export interface ActivityEntry {
  id: string
  actor: string
  action: string
  timestamp: string
  note?: string
}

// ============================================================
// NEW TYPES — Advanced Modules
// ============================================================

export type RiskStatus =
  | 'no_issues_found'
  | 'encumbrance_detected'
  | 'court_restriction'
  | 'verification_required'
  | 'data_unavailable'

export type RiskSourceType =
  | 'verified_external'
  | 'uploaded_document'
  | 'demonstration_dataset'
  | 'no_source'

export type MortgageStatus =
  | 'active_mortgage'
  | 'mortgage_released'
  | 'no_entry_found'
  | 'verification_required'
  | 'data_unavailable'

export type LitigationStatus =
  | 'restriction_recorded'
  | 'reference_found_needs_verification'
  | 'no_entry_found'
  | 'verification_required'
  | 'data_unavailable'

export interface PropertyRiskRecord {
  id: string
  propertyId: string
  overallStatus: RiskStatus
  riskIndicatorCount: number
  lastCheckedAt: string
  mortgage: {
    status: MortgageStatus
    lender?: string
    referenceNumber?: string
    recordDate?: string
    amount?: string
    dischargeStatus?: string
    lastUpdated?: string
    sourceType: RiskSourceType
    sourceName: string
    verificationStatus: 'verified' | 'unverified' | 'simulated'
    notes?: string
  }
  lien: {
    hasLien: boolean
    reference?: string
    sourceDocument?: string
    recordDate?: string
    status?: string
    recommendedSteps?: string
    sourceType: RiskSourceType
    sourceName: string
    notes?: string
  }
  litigation: {
    status: LitigationStatus
    courtName?: string
    caseReference?: string
    caseCategory?: string
    orderDate?: string
    latestCaseStatus?: string
    sourceType: RiskSourceType
    sourceName: string
    verificationStatus: 'verified' | 'unverified' | 'simulated'
    notes?: string
  }
  disclaimer: string
}

export type AkhataConversionStatus = 'yes_available' | 'no_incomplete' | 'not_sure' | 'not_applicable'
export type AkhataLayoutStatus = 'yes_available' | 'no_unapproved' | 'pending' | 'not_sure'
export type AkhataBettermentStatus = 'yes_paid' | 'no_unpaid' | 'partial' | 'not_sure' | 'not_applicable'
export type AkhataRoadStatus = 'meets_requirement' | 'may_be_insufficient' | 'unknown' | 'requires_verification'
export type AkhataOutcome = 'fewer_issues' | 'additional_docs' | 'obstacles' | 'insufficient_info'

export interface AkhataAssessment {
  id: string
  propertyId?: string
  surveyNumber?: string
  village?: string
  taluk?: string
  district?: string
  conversionStatus: AkhataConversionStatus
  layoutApprovalStatus: AkhataLayoutStatus
  bettermentChargeStatus: AkhataBettermentStatus
  roadAccessStatus: AkhataRoadStatus
  documentedRoadWidth?: string
  assessmentOutcome: AkhataOutcome
  assessmentScore: number
  ruleVersion: string
  recommendations: string[]
  missingDocuments: string[]
  createdAt: string
}

export type PaymentStatus =
  | 'not_required'
  | 'awaiting_fee_verification'
  | 'awaiting_payment'
  | 'payment_initiated'
  | 'payment_successful'
  | 'payment_failed'
  | 'refund_requested'
  | 'refunded'
  | 'under_reconciliation'

export interface PaymentRecord {
  id: string
  requestId: string
  receiptId?: string
  transactionReference?: string
  serviceType: string
  amount: number
  currency: string
  feeSource: string
  feeSourceNote: string
  paymentMode?: string
  paymentStatus: PaymentStatus
  isSimulated: boolean
  createdAt: string
  updatedAt: string
  paidAt?: string
}

export type ActivityEventType =
  | 'submitted'
  | 'preliminary_review'
  | 'document_requested'
  | 'assigned'
  | 'forwarded'
  | 'verification_started'
  | 'decision_recorded'
  | 'resolved'
  | 'rejected'
  | 'status_changed'
  | 'note_added'
  | 'payment_verified'
  | 'concern_flagged'

export interface ApplicationActivityEvent {
  id: string
  requestId: string
  eventType: ActivityEventType
  previousStatus?: RequestStatus
  newStatus: RequestStatus
  actorRole: string
  actorId?: string
  applicantVisibleDescription: string
  internalDescription?: string
  reason?: string
  timestamp: string
  referenceNumber?: string
}

export type ConcernType =
  | 'unclear_fee'
  | 'missing_receipt'
  | 'payment_not_updated'
  | 'unexplained_delay'
  | 'incorrect_status'
  | 'unofficial_payment_demand'
  | 'other'

export type ConcernReviewStatus = 'received' | 'under_review' | 'reviewed' | 'closed'

export interface ProcessConcern {
  id: string
  concernToken: string
  relatedRequestId?: string
  relatedToken?: string
  submitterName?: string
  concernType: ConcernType
  description: string
  supportingEvidenceReference?: string
  relevantDate?: string
  preferredContact?: string
  reviewStatus: ConcernReviewStatus
  reviewNotes?: string
  officerResponse?: string
  createdAt: string
  updatedAt: string
  isDemo?: boolean
}

export type DocumentType =
  | 'record_correction'
  | 'mutation_review'
  | 'ownership_discrepancy'
  | 'encumbrance_verification'
  | 'appeal_representation'

export type DocumentLanguage = 'en' | 'kn' | 'both'

export interface GeneratedLegalDocument {
  id: string
  requestId: string
  documentType: DocumentType
  recipientDesignation: string
  language: DocumentLanguage
  generatedAt: string
  templateVersion: string
  documentStatus: 'draft' | 'finalised' | 'downloaded'
}
