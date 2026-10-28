import type { PropertyRiskRecord, PaymentRecord, ProcessConcern } from '@/types'

// ============================================================
// PROPERTY RISK RECORDS — Demonstration Dataset
// All entries are fictional and clearly labelled.
// These do not represent actual bank, court, or government records.
// ============================================================

export const SAMPLE_RISK_RECORDS: PropertyRiskRecord[] = [
  // Scenario 1: Active mortgage recorded
  {
    id: 'RISK-001',
    propertyId: 'KA-BLR-KEN-001',
    overallStatus: 'encumbrance_detected',
    riskIndicatorCount: 2,
    lastCheckedAt: '2024-06-01T10:00:00Z',
    mortgage: {
      status: 'active_mortgage',
      lender: 'Karnataka Grameen Bank (Illustrative)',
      referenceNumber: 'KGB/MOR/2016/04521',
      recordDate: '2016-09-05',
      amount: '₹12,00,000 (Illustrative)',
      dischargeStatus: 'Not Discharged — No Release Entry Found in Available Dataset',
      lastUpdated: '2024-01-15',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Encumbrance Dataset (Demo)',
      verificationStatus: 'simulated',
      notes: 'This is a fictional mortgage entry for demonstration purposes only. No actual bank record has been queried. Verify with the relevant registration authority and the lender before acting on this information.',
    },
    lien: {
      hasLien: true,
      reference: 'LIEN/2016/KEN/00892',
      sourceDocument: 'Registered Mortgage Deed 2016 (Illustrative)',
      recordDate: '2016-09-05',
      status: 'Active — No Release Recorded in Available Dataset',
      recommendedSteps: 'Request a current Encumbrance Certificate from the Sub-Registrar. Confirm with the lender whether the loan has been repaid and a formal discharge or release is available.',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      notes: 'Illustrative record only.',
    },
    litigation: {
      status: 'no_entry_found',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'No matching court-related entry found in the demonstration dataset. Absence of a matching entry does not confirm that no litigation exists.',
    },
    disclaimer: 'This is a demonstration dataset entry. No actual bank, court, or government database has been queried. Verify all encumbrance information through official channels including the Sub-Registrar Office and relevant lender before making any property decision.',
  },

  // Scenario 2: Mortgage released
  {
    id: 'RISK-002',
    propertyId: 'KA-BLR-KEN-002',
    overallStatus: 'no_issues_found',
    riskIndicatorCount: 0,
    lastCheckedAt: '2024-06-01T10:00:00Z',
    mortgage: {
      status: 'mortgage_released',
      lender: 'State Bank of India — Kengeri Branch (Illustrative)',
      referenceNumber: 'SBI/MOR/2010/KEN/0234',
      recordDate: '2010-07-12',
      amount: '₹8,50,000 (Illustrative)',
      dischargeStatus: 'Mortgage Release Recorded — Deed of Release Ref: SBI/REL/2019/0445 (Illustrative)',
      lastUpdated: '2019-12-01',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Encumbrance Dataset (Demo)',
      verificationStatus: 'simulated',
      notes: 'A mortgage release entry is recorded in the illustrative dataset. Confirm the release deed is correctly registered with the Sub-Registrar before treating the property as free from this specific encumbrance.',
    },
    lien: {
      hasLien: false,
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      notes: 'No lien entry found in the demonstration dataset.',
    },
    litigation: {
      status: 'no_entry_found',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'No litigation entry in the demonstration dataset.',
    },
    disclaimer: 'Demonstration dataset only. Absence of an encumbrance entry in this dataset does not confirm that no encumbrance, mortgage, lien, or litigation currently affects the property. Obtain a current Encumbrance Certificate from the Sub-Registrar Office.',
  },

  // Scenario 3: Court-related restriction
  {
    id: 'RISK-003',
    propertyId: 'KA-BLR-WHI-002',
    overallStatus: 'court_restriction',
    riskIndicatorCount: 2,
    lastCheckedAt: '2024-06-01T10:00:00Z',
    mortgage: {
      status: 'verification_required',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'Mortgage status could not be confirmed in the demonstration dataset due to the existence of ongoing litigation. Obtain a current EC from the Sub-Registrar.',
    },
    lien: {
      hasLien: false,
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      notes: 'No separate lien entry found in the demonstration dataset.',
    },
    litigation: {
      status: 'restriction_recorded',
      courtName: 'City Civil Court, Bengaluru (Illustrative)',
      caseReference: 'OS No. 1842/2024 (Illustrative)',
      caseCategory: 'Civil Dispute — Contested Ownership',
      orderDate: '2024-05-18',
      latestCaseStatus: 'Pending — Interim Stay on Transfer Reported (Illustrative)',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'This is a fictional court-related entry for demonstration. The existence of litigation does not automatically prohibit a transaction — the actual effect depends on the specific court order and applicable law. Consult a qualified lawyer.',
    },
    disclaimer: 'This property has a fictional court-related restriction in the demonstration dataset. This does not represent an actual court order. Verify the current status of any litigation through the relevant court records and consult a qualified property lawyer before proceeding.',
  },

  // Scenario 4: Incomplete information
  {
    id: 'RISK-004',
    propertyId: 'KA-BRU-001',
    overallStatus: 'verification_required',
    riskIndicatorCount: 1,
    lastCheckedAt: '2024-06-01T10:00:00Z',
    mortgage: {
      status: 'verification_required',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'Incomplete encumbrance information in the demonstration dataset. The property has a pending inheritance mutation (as noted in ownership records), and no encumbrance information is available for verification. Obtain a fresh EC from the Sub-Registrar.',
    },
    lien: {
      hasLien: false,
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      notes: 'Insufficient data to determine lien status. Verification recommended.',
    },
    litigation: {
      status: 'verification_required',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'Pending inheritance mutation may be subject to inter-family dispute. Verify through appropriate records.',
    },
    disclaimer: 'Incomplete encumbrance data is available in the demonstration dataset for this property. This does not mean the property has no encumbrances — it means the available data is insufficient to assess risk. Obtain a current Encumbrance Certificate from the Sub-Registrar.',
  },

  // Scenario 5: No encumbrance entry found
  {
    id: 'RISK-005',
    propertyId: 'KA-BLR-YEL-001',
    overallStatus: 'no_issues_found',
    riskIndicatorCount: 0,
    lastCheckedAt: '2024-06-01T10:00:00Z',
    mortgage: {
      status: 'no_entry_found',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'No mortgage entry found in the demonstration dataset. This does not confirm the property is mortgage-free. Verify through the Sub-Registrar Office.',
    },
    lien: {
      hasLien: false,
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      notes: 'No lien entry found in the demonstration dataset.',
    },
    litigation: {
      status: 'no_entry_found',
      sourceType: 'demonstration_dataset',
      sourceName: 'Bhu-Trace Illustrative Dataset',
      verificationStatus: 'simulated',
      notes: 'No litigation entry found in the demonstration dataset.',
    },
    disclaimer: 'No matching encumbrance entries were found in this demonstration dataset. This does not confirm that the property is legally free from mortgages, liens, court orders, or other encumbrances. Always obtain a current Encumbrance Certificate from the competent Sub-Registrar Office before any property transaction.',
  },
]

// ============================================================
// DEMO PAYMENT RECORDS
// ============================================================

export const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-001',
    requestId: 'REQ-001',
    receiptId: 'RCPT-2026-000001',
    transactionReference: 'DEMO-TXN-20240320-001',
    serviceType: 'Record Correction',
    amount: 50,
    currency: 'INR',
    feeSource: 'Illustrative Fee Schedule',
    feeSourceNote: 'This is a sample illustrative fee. The actual fee may vary. Check with the competent authority.',
    paymentMode: 'Demo Online Payment',
    paymentStatus: 'payment_successful',
    isSimulated: true,
    createdAt: '2024-03-20T09:20:00Z',
    updatedAt: '2024-03-20T09:25:00Z',
    paidAt: '2024-03-20T09:25:00Z',
  },
  {
    id: 'PAY-002',
    requestId: 'REQ-002',
    serviceType: 'Appeal Processing',
    amount: 100,
    currency: 'INR',
    feeSource: 'Illustrative Fee Schedule',
    feeSourceNote: 'Illustrative fee only. Verify with the Tahsildar Office.',
    paymentStatus: 'awaiting_payment',
    isSimulated: true,
    createdAt: '2024-05-05T10:05:00Z',
    updatedAt: '2024-05-05T10:05:00Z',
  },
  {
    id: 'PAY-003',
    requestId: 'REQ-003',
    serviceType: 'Mutation Processing',
    amount: 30,
    currency: 'INR',
    feeSource: 'Illustrative Fee Schedule',
    feeSourceNote: 'Illustrative fee only.',
    paymentStatus: 'not_required',
    isSimulated: true,
    createdAt: '2024-04-15T08:35:00Z',
    updatedAt: '2024-04-15T08:35:00Z',
  },
]

// ============================================================
// DEMO PROCESS CONCERNS
// ============================================================

export const SAMPLE_CONCERNS: ProcessConcern[] = [
  {
    id: 'CON-001',
    concernToken: 'BHUC-2026-000001',
    relatedRequestId: 'REQ-003',
    concernType: 'unexplained_delay',
    description: 'The inheritance mutation application has been pending for over three months without any update beyond the document request. No contact has been received from the office.',
    relevantDate: '2024-07-15',
    reviewStatus: 'under_review',
    reviewNotes: 'Delay noted. Applicant contacted. Processing resumed.',
    createdAt: '2024-07-16T09:00:00Z',
    updatedAt: '2024-07-18T11:00:00Z',
    isDemo: true,
  },
]

