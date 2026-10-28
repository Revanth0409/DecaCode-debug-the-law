// Local storage-backed data service — no external database required
import type {
  LandParcel, OwnershipEvent, LandDiscrepancy, CorrectionRequest,
  RequestStatus, ReviewStatus, RequestStatusEvent,
  PropertyRiskRecord, AkhataAssessment, PaymentRecord,
  ApplicationActivityEvent, ProcessConcern, GeneratedLegalDocument,
  PaymentStatus, ConcernType, ConcernReviewStatus,
} from '@/types'
import {
  SAMPLE_PARCELS,
  SAMPLE_OWNERSHIP_EVENTS,
  SAMPLE_DISCREPANCIES,
  SAMPLE_REQUESTS,
  DOCUMENT_CHECKLIST_ITEMS,
} from '@/data/sampleData'
import { SAMPLE_RISK_RECORDS, SAMPLE_PAYMENTS, SAMPLE_CONCERNS } from '@/data/riskData'

const KEYS = {
  parcels: 'bhu-trace-parcels',
  events: 'bhu-trace-events',
  discrepancies: 'bhu-trace-discrepancies',
  requests: 'bhu-trace-requests',
  auditLog: 'bhu-trace-audit',
  initialized: 'bhu-trace-initialized',
  // New keys
  riskRecords: 'bhu-trace-risk',
  akhataAssessments: 'bhu-trace-akhata',
  payments: 'bhu-trace-payments',
  activityEvents: 'bhu-trace-activity',
  concerns: 'bhu-trace-concerns',
  legalDocuments: 'bhu-trace-legaldocs',
}

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save<T>(key: string, data: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

export function initializeData(force = false): void {
  if (!force && localStorage.getItem(KEYS.initialized)) return
  save(KEYS.parcels, SAMPLE_PARCELS)
  save(KEYS.events, SAMPLE_OWNERSHIP_EVENTS)
  save(KEYS.discrepancies, SAMPLE_DISCREPANCIES)
  save(KEYS.requests, SAMPLE_REQUESTS)
  save(KEYS.auditLog, [])
  save(KEYS.riskRecords, SAMPLE_RISK_RECORDS)
  save(KEYS.akhataAssessments, [])
  save(KEYS.payments, SAMPLE_PAYMENTS)
  save(KEYS.activityEvents, generateInitialActivityEvents())
  save(KEYS.concerns, SAMPLE_CONCERNS)
  save(KEYS.legalDocuments, [])
  localStorage.setItem(KEYS.initialized, '1')
}

export function resetDemoData(): void {
  const requests = load<CorrectionRequest>(KEYS.requests)
  const userRequests = requests.filter(r => !r.isDemo)
  save(KEYS.parcels, SAMPLE_PARCELS)
  save(KEYS.events, SAMPLE_OWNERSHIP_EVENTS)
  save(KEYS.discrepancies, SAMPLE_DISCREPANCIES)
  save(KEYS.requests, [...SAMPLE_REQUESTS, ...userRequests])
  save(KEYS.auditLog, [])
  save(KEYS.riskRecords, SAMPLE_RISK_RECORDS)
  save(KEYS.akhataAssessments, [])
  save(KEYS.payments, SAMPLE_PAYMENTS)
  save(KEYS.activityEvents, generateInitialActivityEvents())
  save(KEYS.concerns, SAMPLE_CONCERNS)
  save(KEYS.legalDocuments, [])
}

// Generate activity events from the existing status history of demo requests
function generateInitialActivityEvents(): ApplicationActivityEvent[] {
  const events: ApplicationActivityEvent[] = []
  for (const req of SAMPLE_REQUESTS) {
    const history = req.statusHistory || []
    for (let i = 0; i < history.length; i++) {
      const ev = history[i]
      events.push({
        id: `ACT-INIT-${req.id}-${i}`,
        requestId: req.id,
        eventType: ev.status === 'submitted' ? 'submitted'
          : ev.status === 'preliminary' ? 'preliminary_review'
          : ev.status === 'documents' ? 'document_requested'
          : ev.status === 'verification' ? 'verification_started'
          : ev.status === 'forwarded' ? 'forwarded'
          : ev.status === 'resolved' ? 'resolved'
          : ev.status === 'rejected' ? 'rejected'
          : 'status_changed',
        previousStatus: i > 0 ? history[i - 1].status : undefined,
        newStatus: ev.status,
        actorRole: ev.changedBy || 'System',
        applicantVisibleDescription: ev.publicNote || `Status updated to ${ev.status}`,
        internalDescription: ev.internalNote,
        timestamp: ev.timestamp,
      })
    }
  }
  return events
}

// ============================================================
// LAND PARCELS
// ============================================================

export function getAllParcels(): LandParcel[] {
  return load<LandParcel>(KEYS.parcels)
}

export function getParcelById(id: string): LandParcel | undefined {
  return load<LandParcel>(KEYS.parcels).find(p => p.id === id)
}

export function searchParcels(query: {
  surveyNumber?: string
  ownerName?: string
  village?: string
  taluk?: string
  district?: string
  classification?: string
  status?: string
}): LandParcel[] {
  const parcels = load<LandParcel>(KEYS.parcels)
  return parcels.filter(p => {
    const q = query
    if (q.surveyNumber && !p.surveyNumber.toLowerCase().includes(q.surveyNumber.toLowerCase())) return false
    if (q.ownerName && !p.currentRecordedOwner.toLowerCase().includes(q.ownerName.toLowerCase())) return false
    if (q.village && !p.village.toLowerCase().includes(q.village.toLowerCase())) return false
    if (q.taluk && !p.taluk.toLowerCase().includes(q.taluk.toLowerCase())) return false
    if (q.district && !p.district.toLowerCase().includes(q.district.toLowerCase())) return false
    if (q.classification && !p.classification.toLowerCase().includes(q.classification.toLowerCase())) return false
    if (q.status && p.verificationStatus !== q.status) return false
    return true
  })
}

// ============================================================
// OWNERSHIP EVENTS
// ============================================================

export function getOwnershipEvents(parcelId: string): OwnershipEvent[] {
  return load<OwnershipEvent>(KEYS.events)
    .filter(e => e.parcelId === parcelId)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
}

// ============================================================
// DISCREPANCIES
// ============================================================

export function getAllDiscrepancies(): LandDiscrepancy[] {
  return load<LandDiscrepancy>(KEYS.discrepancies)
}

export function getDiscrepancyById(id: string): LandDiscrepancy | undefined {
  return load<LandDiscrepancy>(KEYS.discrepancies).find(d => d.id === id)
}

export function getDiscrepanciesForParcel(parcelId: string): LandDiscrepancy[] {
  return load<LandDiscrepancy>(KEYS.discrepancies).filter(d => d.parcelId === parcelId)
}

export function updateDiscrepancy(id: string, updates: Partial<LandDiscrepancy>): LandDiscrepancy | null {
  const discs = load<LandDiscrepancy>(KEYS.discrepancies)
  const idx = discs.findIndex(d => d.id === id)
  if (idx === -1) return null
  discs[idx] = { ...discs[idx], ...updates }
  save(KEYS.discrepancies, discs)
  addAuditLog('Demo Officer', `Updated discrepancy ${id}`, 'discrepancy', id, JSON.stringify(updates))
  return discs[idx]
}

export function updateDiscrepancyStatus(id: string, status: ReviewStatus, note?: string, officer?: string): LandDiscrepancy | null {
  const discs = load<LandDiscrepancy>(KEYS.discrepancies)
  const idx = discs.findIndex(d => d.id === id)
  if (idx === -1) return null
  const entry = {
    id: `ACT-${Date.now()}`,
    actor: officer || 'Demo Officer',
    action: status,
    timestamp: new Date().toISOString(),
    note,
  }
  discs[idx] = {
    ...discs[idx],
    reviewStatus: status,
    reviewedAt: new Date().toISOString(),
    reviewNotes: note || discs[idx].reviewNotes,
    assignedOfficer: officer || discs[idx].assignedOfficer,
    activityLog: [...(discs[idx].activityLog || []), entry],
  }
  save(KEYS.discrepancies, discs)
  addAuditLog(officer || 'Demo Officer', `Changed discrepancy ${id} to ${status}`, 'discrepancy', id, note || '')
  return discs[idx]
}

// ============================================================
// CORRECTION REQUESTS
// ============================================================

export function getAllRequests(): CorrectionRequest[] {
  return load<CorrectionRequest>(KEYS.requests)
}

export function getRequestByToken(token: string): CorrectionRequest | undefined {
  return load<CorrectionRequest>(KEYS.requests).find(r => r.token === token)
}

export function getRequestById(id: string): CorrectionRequest | undefined {
  return load<CorrectionRequest>(KEYS.requests).find(r => r.id === id)
}

function generateToken(): string {
  const requests = load<CorrectionRequest>(KEYS.requests)
  const maxNum = requests.reduce((max, r) => {
    const match = r.token.match(/BHUT-\d+-(\d+)/)
    if (match) return Math.max(max, parseInt(match[1], 10))
    return max
  }, 0)
  const next = String(maxNum + 1).padStart(6, '0')
  return `BHUT-2026-${next}`
}

export function createRequest(data: Omit<CorrectionRequest, 'id' | 'token' | 'status' | 'submittedAt' | 'updatedAt' | 'statusHistory'>): CorrectionRequest {
  const now = new Date().toISOString()
  const id = `REQ-${Date.now()}`
  const token = generateToken()
  const request: CorrectionRequest = {
    ...data,
    id,
    token,
    status: 'submitted',
    submittedAt: now,
    updatedAt: now,
    statusHistory: [
      {
        id: `SH-${Date.now()}`,
        requestId: id,
        status: 'submitted',
        timestamp: now,
        publicNote: 'Request received and tracking token generated.',
        changedBy: 'System'
      }
    ]
  }
  const requests = load<CorrectionRequest>(KEYS.requests)
  save(KEYS.requests, [...requests, request])
  addAuditLog('Citizen', `Submitted new request ${token}`, 'request', id, `Type: ${data.requestType}`)
  // Add initial activity event
  addActivityEvent({
    requestId: id,
    eventType: 'submitted',
    newStatus: 'submitted',
    actorRole: 'System',
    applicantVisibleDescription: 'Your request was received and a unique tracking token was generated.',
    timestamp: now,
  })
  return request
}

export function updateRequestStatus(
  id: string,
  status: RequestStatus,
  publicNote?: string,
  internalNote?: string,
  officer?: string,
  reason?: string
): CorrectionRequest | null {
  const requests = load<CorrectionRequest>(KEYS.requests)
  const idx = requests.findIndex(r => r.id === id)
  if (idx === -1) return null
  const now = new Date().toISOString()
  const previousStatus = requests[idx].status
  const event: RequestStatusEvent = {
    id: `SH-${Date.now()}`,
    requestId: id,
    status,
    timestamp: now,
    publicNote,
    internalNote,
    changedBy: officer || 'Demo Officer'
  }
  requests[idx] = {
    ...requests[idx],
    status,
    updatedAt: now,
    assignedOfficer: officer || requests[idx].assignedOfficer,
    applicantVisibleNotes: publicNote || requests[idx].applicantVisibleNotes,
    internalNotes: internalNote || requests[idx].internalNotes,
    statusHistory: [...(requests[idx].statusHistory || []), event]
  }
  save(KEYS.requests, requests)
  addAuditLog(officer || 'Demo Officer', `Updated request ${id} to ${status}`, 'request', id, publicNote || '')
  // Add activity event
  addActivityEvent({
    requestId: id,
    eventType: 'status_changed',
    previousStatus,
    newStatus: status,
    actorRole: officer || 'Demo Officer',
    applicantVisibleDescription: publicNote || `Your application status has been updated to ${status}.`,
    internalDescription: internalNote,
    reason,
    timestamp: now,
  })
  return requests[idx]
}

// ============================================================
// DOCUMENT CHECKLIST
// ============================================================

export function getChecklistForService(serviceType: string) {
  return DOCUMENT_CHECKLIST_ITEMS.filter(d => d.serviceType === serviceType)
}

// ============================================================
// AUDIT LOG
// ============================================================

export function addAuditLog(actor: string, action: string, entityType: string, entityId: string, changeSummary: string) {
  const logs = load<any>(KEYS.auditLog)
  logs.push({ id: `AUD-${Date.now()}`, actor, action, entityType, entityId, timestamp: new Date().toISOString(), changeSummary })
  save(KEYS.auditLog, logs)
}

export function getAuditLog() {
  return load<any>(KEYS.auditLog)
}

// ============================================================
// RISK RECORDS
// ============================================================

export function getRiskRecordForParcel(propertyId: string): PropertyRiskRecord | undefined {
  return load<PropertyRiskRecord>(KEYS.riskRecords).find(r => r.propertyId === propertyId)
}

export function getAllRiskRecords(): PropertyRiskRecord[] {
  return load<PropertyRiskRecord>(KEYS.riskRecords)
}

// ============================================================
// A-KHATA ASSESSMENTS
// ============================================================

export function saveAkhataAssessment(assessment: AkhataAssessment): AkhataAssessment {
  const assessments = load<AkhataAssessment>(KEYS.akhataAssessments)
  const idx = assessments.findIndex(a => a.id === assessment.id)
  if (idx >= 0) {
    assessments[idx] = assessment
  } else {
    assessments.push(assessment)
  }
  save(KEYS.akhataAssessments, assessments)
  return assessment
}

export function getAkhataAssessmentsForProperty(propertyId: string): AkhataAssessment[] {
  return load<AkhataAssessment>(KEYS.akhataAssessments).filter(a => a.propertyId === propertyId)
}

export function getAllAkhataAssessments(): AkhataAssessment[] {
  return load<AkhataAssessment>(KEYS.akhataAssessments)
}

// ============================================================
// PAYMENTS
// ============================================================

export function getPaymentsForRequest(requestId: string): PaymentRecord[] {
  return load<PaymentRecord>(KEYS.payments).filter(p => p.requestId === requestId)
}

export function getAllPayments(): PaymentRecord[] {
  return load<PaymentRecord>(KEYS.payments)
}

export function createPaymentRecord(data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): PaymentRecord {
  const now = new Date().toISOString()
  const record: PaymentRecord = {
    ...data,
    id: `PAY-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  const payments = load<PaymentRecord>(KEYS.payments)
  save(KEYS.payments, [...payments, record])
  return record
}

export function updatePaymentStatus(id: string, status: PaymentStatus, transactionRef?: string): PaymentRecord | null {
  const payments = load<PaymentRecord>(KEYS.payments)
  const idx = payments.findIndex(p => p.id === id)
  if (idx === -1) return null
  const now = new Date().toISOString()
  payments[idx] = {
    ...payments[idx],
    paymentStatus: status,
    updatedAt: now,
    paidAt: status === 'payment_successful' ? now : payments[idx].paidAt,
    transactionReference: transactionRef || payments[idx].transactionReference,
    receiptId: status === 'payment_successful'
      ? (payments[idx].receiptId || `RCPT-2026-${String(Date.now()).slice(-6)}`)
      : payments[idx].receiptId,
  }
  save(KEYS.payments, payments)
  addAuditLog('System', `Payment ${id} updated to ${status}`, 'payment', id, '')
  return payments[idx]
}

// ============================================================
// ACTIVITY EVENTS
// ============================================================

export function getActivityEventsForRequest(requestId: string): ApplicationActivityEvent[] {
  return load<ApplicationActivityEvent>(KEYS.activityEvents)
    .filter(e => e.requestId === requestId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function addActivityEvent(data: Omit<ApplicationActivityEvent, 'id'>): ApplicationActivityEvent {
  const event: ApplicationActivityEvent = {
    ...data,
    id: `ACT-${Date.now()}`,
  }
  const events = load<ApplicationActivityEvent>(KEYS.activityEvents)
  save(KEYS.activityEvents, [...events, event])
  return event
}

// ============================================================
// PROCESS CONCERNS
// ============================================================

export function getAllConcerns(): ProcessConcern[] {
  return load<ProcessConcern>(KEYS.concerns)
}

export function getConcernByToken(token: string): ProcessConcern | undefined {
  return load<ProcessConcern>(KEYS.concerns).find(c => c.concernToken === token)
}

function generateConcernToken(): string {
  const concerns = load<ProcessConcern>(KEYS.concerns)
  const maxNum = concerns.reduce((max, c) => {
    const match = c.concernToken.match(/BHUC-\d+-(\d+)/)
    if (match) return Math.max(max, parseInt(match[1], 10))
    return max
  }, 0)
  const next = String(maxNum + 1).padStart(6, '0')
  return `BHUC-2026-${next}`
}

export function createProcessConcern(data: {
  relatedRequestId?: string
  concernType: ConcernType
  description: string
  relevantDate?: string
  preferredContact?: string
  supportingEvidenceReference?: string
}): ProcessConcern {
  const now = new Date().toISOString()
  const concern: ProcessConcern = {
    id: `CON-${Date.now()}`,
    concernToken: generateConcernToken(),
    ...data,
    reviewStatus: 'received',
    createdAt: now,
    updatedAt: now,
  }
  const concerns = load<ProcessConcern>(KEYS.concerns)
  save(KEYS.concerns, [...concerns, concern])
  addAuditLog('Citizen', `Submitted process concern ${concern.concernToken}`, 'concern', concern.id, data.concernType)
  return concern
}

export function updateConcernStatus(id: string, status: ConcernReviewStatus, notes?: string, changedBy?: string): ProcessConcern | null {
  const concerns = load<ProcessConcern>(KEYS.concerns)
  const idx = concerns.findIndex(c => c.id === id)
  if (idx === -1) return null
  concerns[idx] = {
    ...concerns[idx],
    reviewStatus: status,
    reviewNotes: notes || concerns[idx].reviewNotes,
    officerResponse: (status === 'reviewed' || status === 'closed') ? (notes || concerns[idx].officerResponse) : concerns[idx].officerResponse,
    updatedAt: new Date().toISOString(),
  }
  save(KEYS.concerns, concerns)
  addAuditLog(changedBy || 'System', `Updated concern ${id} to ${status}`, 'concern', id, notes || '')
  return concerns[idx]
}

// ============================================================
// LEGAL DOCUMENTS
// ============================================================

export function getAllLegalDocuments(): GeneratedLegalDocument[] {
  return load<GeneratedLegalDocument>(KEYS.legalDocuments)
}

export function getLegalDocumentsForRequest(requestId: string): GeneratedLegalDocument[] {
  return load<GeneratedLegalDocument>(KEYS.legalDocuments).filter(d => d.requestId === requestId)
}

export function saveGeneratedDocument(doc: GeneratedLegalDocument): GeneratedLegalDocument {
  const docs = load<GeneratedLegalDocument>(KEYS.legalDocuments)
  const idx = docs.findIndex(d => d.id === doc.id)
  if (idx >= 0) {
    docs[idx] = doc
  } else {
    docs.push(doc)
  }
  save(KEYS.legalDocuments, docs)
  return doc
}
