import type { LandParcel, OwnershipEvent, LandDiscrepancy, CorrectionRequest, DocumentChecklistItem } from '@/types'

// ============================================================
// SAMPLE LAND PARCELS — Karnataka Demonstration Dataset
// All data is illustrative and fictional. Not official records.
// ============================================================

export const SAMPLE_PARCELS: LandParcel[] = [
  {
    id: 'KA-BLR-KEN-001',
    surveyNumber: '42/3',
    subdivisionNumber: '3',
    village: 'Kengeri',
    taluk: 'Bengaluru South',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 1.25,
    areaUnit: 'Acres',
    classification: 'Agricultural (Wet)',
    currentRecordedOwner: 'Ramesh Kumar Gowda',
    verificationStatus: 'discrepancy',
    lastUpdated: '2024-03-15',
    geometry: [
      [12.9150, 77.4850], [12.9160, 77.4870], [12.9145, 77.4880],
      [12.9135, 77.4865], [12.9140, 77.4850]
    ],
    documents: ['RTC Extract 2024', 'Sale Deed 2016 (Reg. No. BLR/2016/4521)', 'Mutation Entry 2016'],
    discrepancyIds: ['DISC-001', 'DISC-002']
  },
  {
    id: 'KA-BLR-KEN-002',
    surveyNumber: '43/1',
    subdivisionNumber: '1',
    village: 'Kengeri',
    taluk: 'Bengaluru South',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.75,
    areaUnit: 'Acres',
    classification: 'Residential Site',
    currentRecordedOwner: 'Lakshmi Narayana Rao',
    verificationStatus: 'verified',
    lastUpdated: '2024-01-10',
    geometry: [
      [12.9160, 77.4870], [12.9170, 77.4890], [12.9155, 77.4900],
      [12.9145, 77.4880]
    ],
    documents: ['Khata Certificate 2023', 'Sale Deed 2019 (Reg. No. BLR/2019/7832)', 'Encumbrance Certificate 2024']
  },
  {
    id: 'KA-BLR-YEL-001',
    surveyNumber: '78/2A',
    subdivisionNumber: '2A',
    village: 'Yelahanka',
    taluk: 'Yelahanka',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 2.10,
    areaUnit: 'Acres',
    classification: 'Agricultural (Dry)',
    currentRecordedOwner: 'Ananya Devi Krishnamurthy',
    verificationStatus: 'verified',
    lastUpdated: '2023-11-20',
    geometry: [
      [13.1005, 77.5960], [13.1020, 77.5980], [13.1010, 77.6000],
      [12.9990, 77.5985], [12.9995, 77.5960]
    ],
    documents: ['RTC Extract 2023', 'Patta Certificate', 'Survey Sketch']
  },
  {
    id: 'KA-BLR-YEL-002',
    surveyNumber: '79/1',
    village: 'Yelahanka',
    taluk: 'Yelahanka',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 1.50,
    areaUnit: 'Acres',
    classification: 'Mixed Use',
    currentRecordedOwner: 'Suresh Babu Venkataraman',
    verificationStatus: 'pending',
    lastUpdated: '2024-04-02',
    geometry: [
      [13.1020, 77.5980], [13.1035, 77.6000], [13.1025, 77.6020],
      [13.1010, 77.6000]
    ],
    documents: ['RTC Extract 2024 (Pending Verification)', 'Mutation Application 2024']
  },
  {
    id: 'KA-BLR-WHI-001',
    surveyNumber: '112/5',
    subdivisionNumber: '5',
    village: 'Whitefield',
    taluk: 'Hosakote',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.50,
    areaUnit: 'Acres',
    classification: 'Commercial',
    currentRecordedOwner: 'Priya Sundarajan',
    verificationStatus: 'verified',
    lastUpdated: '2024-02-28',
    geometry: [
      [12.9698, 77.7499], [12.9710, 77.7515], [12.9700, 77.7530],
      [12.9688, 77.7515]
    ],
    documents: ['Khata Certificate', 'Sale Deed 2020', 'Property Tax Receipts 2024']
  },
  {
    id: 'KA-BLR-WHI-002',
    surveyNumber: '113/2',
    village: 'Whitefield',
    taluk: 'Hosakote',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.80,
    areaUnit: 'Acres',
    classification: 'Residential',
    currentRecordedOwner: 'Mohan Das Shenoy',
    verificationStatus: 'disputed',
    lastUpdated: '2024-05-10',
    geometry: [
      [12.9710, 77.7515], [12.9722, 77.7530], [12.9712, 77.7545],
      [12.9700, 77.7530]
    ],
    documents: ['RTC Extract 2024', 'Dispute Notice 2024', 'Court Order (Pending)'],
    discrepancyIds: ['DISC-003']
  },
  {
    id: 'KA-BRU-001',
    surveyNumber: '204/6B',
    subdivisionNumber: '6B',
    village: 'Doddaballapura',
    taluk: 'Doddaballapura',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    area: 3.75,
    areaUnit: 'Acres',
    classification: 'Agricultural (Wet)',
    currentRecordedOwner: 'Gangamma Nanjundappa',
    verificationStatus: 'pending',
    lastUpdated: '2024-01-25',
    geometry: [
      [13.2950, 77.5370], [13.2970, 77.5390], [13.2955, 77.5410],
      [13.2935, 77.5395]
    ],
    documents: ['RTC Extract 2024', 'Inheritance Certificate 2021', 'Death Certificate (Father) 2020']
  },
  {
    id: 'KA-BRU-002',
    surveyNumber: '205/1',
    village: 'Doddaballapura',
    taluk: 'Doddaballapura',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    area: 2.25,
    areaUnit: 'Acres',
    classification: 'Agricultural (Dry)',
    currentRecordedOwner: 'Venkatesh Reddy',
    verificationStatus: 'verified',
    lastUpdated: '2023-09-14',
    geometry: [
      [13.2970, 77.5390], [13.2990, 77.5410], [13.2975, 77.5430],
      [13.2955, 77.5410]
    ],
    documents: ['RTC Extract 2023', 'Sale Deed 2017', 'Encumbrance Certificate']
  },
  {
    id: 'KA-BLR-KEN-003',
    surveyNumber: '44/7',
    subdivisionNumber: '7',
    village: 'Kengeri',
    taluk: 'Bengaluru South',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.35,
    areaUnit: 'Acres',
    classification: 'Residential Site',
    currentRecordedOwner: 'Savitha Murthy',
    verificationStatus: 'discrepancy',
    lastUpdated: '2024-06-01',
    geometry: [
      [12.9145, 77.4880], [12.9155, 77.4900], [12.9140, 77.4910],
      [12.9130, 77.4895]
    ],
    documents: ['RTC Extract 2024', 'Sale Deed 2022 (Disputed)'],
    discrepancyIds: ['DISC-004']
  },
  {
    id: 'KA-BLR-YEL-003',
    surveyNumber: '80/3',
    village: 'Yelahanka',
    taluk: 'Yelahanka',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 1.80,
    areaUnit: 'Acres',
    classification: 'Agricultural (Dry)',
    currentRecordedOwner: 'Rajappa Siddalingaiah',
    verificationStatus: 'verified',
    lastUpdated: '2023-12-05',
    geometry: [
      [13.1035, 77.6000], [13.1050, 77.6020], [13.1040, 77.6040],
      [13.1025, 77.6020]
    ],
    documents: ['RTC Extract 2023', 'Sale Deed 2010', 'Mutation Certificate']
  },
  {
    id: 'KA-BLR-WHI-003',
    surveyNumber: '115/4',
    subdivisionNumber: '4',
    village: 'Whitefield',
    taluk: 'Hosakote',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 1.20,
    areaUnit: 'Acres',
    classification: 'Industrial',
    currentRecordedOwner: 'Karnataka Tech Ventures Pvt Ltd',
    verificationStatus: 'pending',
    lastUpdated: '2024-03-30',
    geometry: [
      [12.9688, 77.7515], [12.9700, 77.7530], [12.9690, 77.7545],
      [12.9678, 77.7530]
    ],
    documents: ['RTC Extract 2024', 'Company Registration Certificate', 'Sale Deed 2023 (Pending Mutation)']
  },
  {
    id: 'KA-BRU-003',
    surveyNumber: '206/2',
    village: 'Doddaballapura',
    taluk: 'Doddaballapura',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    area: 4.50,
    areaUnit: 'Acres',
    classification: 'Agricultural (Wet)',
    currentRecordedOwner: 'Muniswamy Gowda',
    verificationStatus: 'discrepancy',
    lastUpdated: '2024-02-14',
    geometry: [
      [13.2990, 77.5410], [13.3010, 77.5430], [13.2995, 77.5450],
      [13.2975, 77.5430]
    ],
    documents: ['RTC Extract 2024', 'Old Settlement Records 1987', 'Mutation Entry 2024'],
    discrepancyIds: ['DISC-005']
  },
  {
    id: 'KA-BLR-KEN-004',
    surveyNumber: '45/2',
    village: 'Kengeri',
    taluk: 'Bengaluru South',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.60,
    areaUnit: 'Acres',
    classification: 'Residential',
    currentRecordedOwner: 'Manjunath Rao Desai',
    verificationStatus: 'verified',
    lastUpdated: '2023-08-20',
    geometry: [
      [12.9135, 77.4865], [12.9145, 77.4880], [12.9130, 77.4895],
      [12.9120, 77.4880]
    ],
    documents: ['Khata Certificate 2023', 'Sale Deed 2015', 'Property Tax Receipt 2024']
  },
  {
    id: 'KA-BLR-YEL-004',
    surveyNumber: '82/1A',
    subdivisionNumber: '1A',
    village: 'Yelahanka',
    taluk: 'Yelahanka',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.90,
    areaUnit: 'Acres',
    classification: 'Residential Site',
    currentRecordedOwner: 'Nirmala Bai Shankar',
    verificationStatus: 'verified',
    lastUpdated: '2024-01-05',
    geometry: [
      [13.1050, 77.6020], [13.1065, 77.6040], [13.1055, 77.6060],
      [13.1040, 77.6040]
    ],
    documents: ['Khata Certificate 2024', 'Sale Deed 2018', 'Encumbrance Certificate 2024']
  },
  {
    id: 'KA-BLR-WHI-004',
    surveyNumber: '116/8',
    subdivisionNumber: '8',
    village: 'Whitefield',
    taluk: 'Hosakote',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    area: 0.45,
    areaUnit: 'Acres',
    classification: 'Residential',
    currentRecordedOwner: 'Deepa Krishnaswamy',
    verificationStatus: 'disputed',
    lastUpdated: '2024-05-28',
    geometry: [
      [12.9722, 77.7530], [12.9734, 77.7545], [12.9724, 77.7560],
      [12.9712, 77.7545]
    ],
    documents: ['RTC Extract 2024', 'Sale Deed 2021', 'Counter Claim Notice 2024'],
    discrepancyIds: ['DISC-003']
  },
]

// ============================================================
// OWNERSHIP HISTORY
// ============================================================

export const SAMPLE_OWNERSHIP_EVENTS: OwnershipEvent[] = [
  // KA-BLR-KEN-001 history
  {
    id: 'OWN-001-01',
    parcelId: 'KA-BLR-KEN-001',
    ownerName: 'Ananya Rao',
    startDate: '2010-04-12',
    endDate: '2016-08-20',
    eventType: 'Initial Record Entry',
    eventDate: '2010-04-12',
    mutationReference: 'MUT/2010/KEN/0042',
    supportingDocuments: ['Settlement Records 1987', 'Patta Certificate 2010'],
    verificationStatus: 'verified',
    description: 'Initial ownership recorded in land register. Property classified as agricultural wet land.',
    recordedAuthority: 'Tahsildar Office, Bengaluru South'
  },
  {
    id: 'OWN-001-02',
    parcelId: 'KA-BLR-KEN-001',
    ownerName: 'Ramesh Kumar Gowda',
    startDate: '2016-08-20',
    eventType: 'Registered Transfer',
    eventDate: '2016-08-20',
    mutationReference: 'MUT/2016/KEN/0198',
    supportingDocuments: ['Sale Deed 2016 (Reg. No. BLR/2016/4521)', 'Mutation Entry 2016'],
    verificationStatus: 'verified',
    description: 'Ownership transferred to Ramesh Kumar Gowda via registered sale deed.',
    recordedAuthority: 'Sub-Registrar Office, Kengeri'
  },
  {
    id: 'OWN-001-03',
    parcelId: 'KA-BLR-KEN-001',
    ownerName: 'Ramesh Kumar Gowda',
    startDate: '2021-03-10',
    eventType: 'Record Update',
    eventDate: '2021-03-10',
    mutationReference: 'MUT/2021/KEN/0089',
    supportingDocuments: ['RTC Extract 2021'],
    verificationStatus: 'pending',
    description: 'Mutation entry recorded. Area updated from 1.25 acres to 1.42 acres in entry — discrepancy noted with original survey records.',
    recordedAuthority: 'Revenue Inspector, Kengeri Hobli'
  },
  {
    id: 'OWN-001-04',
    parcelId: 'KA-BLR-KEN-001',
    ownerName: 'Ramesh Kumar Gowda',
    startDate: '2024-03-15',
    eventType: 'Discrepancy Flagged',
    eventDate: '2024-03-15',
    supportingDocuments: ['RTC Extract 2024', 'Area Comparison Report'],
    verificationStatus: 'discrepancy',
    description: 'System detected inconsistent recorded areas between 2016 and 2021 mutation entries. Flagged for verification.',
    recordedAuthority: 'Bhu-Trace AI Detection System (Demo)'
  },

  // KA-BLR-KEN-002 history
  {
    id: 'OWN-002-01',
    parcelId: 'KA-BLR-KEN-002',
    ownerName: 'Srinivasa Rao',
    startDate: '2005-06-14',
    endDate: '2019-11-08',
    eventType: 'Initial Record Entry',
    eventDate: '2005-06-14',
    mutationReference: 'MUT/2005/KEN/0115',
    supportingDocuments: ['Patta Certificate 2005'],
    verificationStatus: 'verified',
    description: 'Property recorded as residential site. Classified conversion from agricultural land.',
    recordedAuthority: 'Tahsildar Office, Bengaluru South'
  },
  {
    id: 'OWN-002-02',
    parcelId: 'KA-BLR-KEN-002',
    ownerName: 'Lakshmi Narayana Rao',
    startDate: '2019-11-08',
    eventType: 'Registered Transfer',
    eventDate: '2019-11-08',
    mutationReference: 'MUT/2019/KEN/0342',
    supportingDocuments: ['Sale Deed 2019 (Reg. No. BLR/2019/7832)', 'Encumbrance Certificate 2024'],
    verificationStatus: 'verified',
    description: 'Property transferred to son through registered sale deed.',
    recordedAuthority: 'Sub-Registrar Office, Kengeri'
  },

  // KA-BLR-YEL-001 history
  {
    id: 'OWN-003-01',
    parcelId: 'KA-BLR-YEL-001',
    ownerName: 'Krishnamurthy S.',
    startDate: '1998-01-10',
    endDate: '2015-09-22',
    eventType: 'Initial Record Entry',
    eventDate: '1998-01-10',
    mutationReference: 'MUT/1998/YEL/0032',
    supportingDocuments: ['Old Patta Records'],
    verificationStatus: 'verified',
    description: 'Original ownership recorded. Agricultural land, dry classification.',
    recordedAuthority: 'Tahsildar Office, Yelahanka'
  },
  {
    id: 'OWN-003-02',
    parcelId: 'KA-BLR-YEL-001',
    ownerName: 'Ananya Devi Krishnamurthy',
    startDate: '2015-09-22',
    eventType: 'Inheritance',
    eventDate: '2015-09-22',
    mutationReference: 'MUT/2015/YEL/0198',
    supportingDocuments: ['Death Certificate (Krishnamurthy S.) 2015', 'Legal Heir Certificate', 'Succession Certificate'],
    verificationStatus: 'verified',
    description: 'Ownership transferred to daughter following owner\'s demise. Inheritance mutation completed.',
    recordedAuthority: 'Tahsildar Office, Yelahanka'
  },

  // KA-BLR-WHI-002 disputed history
  {
    id: 'OWN-006-01',
    parcelId: 'KA-BLR-WHI-002',
    ownerName: 'George D\'Souza',
    startDate: '2008-03-12',
    endDate: '2021-07-15',
    eventType: 'Initial Record Entry',
    eventDate: '2008-03-12',
    mutationReference: 'MUT/2008/WHI/0076',
    supportingDocuments: ['Sale Deed 2008'],
    verificationStatus: 'verified',
    description: 'Initial recorded ownership.',
    recordedAuthority: 'Sub-Registrar Office, Whitefield'
  },
  {
    id: 'OWN-006-02',
    parcelId: 'KA-BLR-WHI-002',
    ownerName: 'Mohan Das Shenoy',
    startDate: '2021-07-15',
    eventType: 'Contested Transfer',
    eventDate: '2021-07-15',
    mutationReference: 'MUT/2021/WHI/0412',
    supportingDocuments: ['Sale Deed 2021', 'Dispute Notice 2024', 'Counter Claim 2024'],
    verificationStatus: 'disputed',
    description: 'Transfer recorded but currently under legal dispute. Previous owner\'s heir has filed a counter-claim. Matter pending before civil court.',
    recordedAuthority: 'Sub-Registrar Office, Whitefield'
  },

  // KA-BRU-001 history
  {
    id: 'OWN-007-01',
    parcelId: 'KA-BRU-001',
    ownerName: 'Nanjundappa H.',
    startDate: '1985-07-04',
    endDate: '2020-11-30',
    eventType: 'Initial Record Entry',
    eventDate: '1985-07-04',
    mutationReference: 'MUT/1985/DOD/0021',
    supportingDocuments: ['Settlement Records 1985'],
    verificationStatus: 'verified',
    description: 'Agricultural wet land. Original settlement record.',
    recordedAuthority: 'Tahsildar Office, Doddaballapura'
  },
  {
    id: 'OWN-007-02',
    parcelId: 'KA-BRU-001',
    ownerName: 'Gangamma Nanjundappa',
    startDate: '2021-02-10',
    eventType: 'Inheritance (Pending Verification)',
    eventDate: '2021-02-10',
    mutationReference: 'MUT/2021/DOD/0089',
    supportingDocuments: ['Death Certificate 2020', 'Legal Heir Certificate', 'Inheritance Certificate 2021'],
    verificationStatus: 'pending',
    description: 'Inheritance mutation application submitted following husband\'s demise. Pending final verification by Tahsildar.',
    recordedAuthority: 'Tahsildar Office, Doddaballapura'
  },

  // KA-BLR-KEN-003 discrepancy
  {
    id: 'OWN-009-01',
    parcelId: 'KA-BLR-KEN-003',
    ownerName: 'Raju Swamy',
    startDate: '2012-05-18',
    endDate: '2022-04-02',
    eventType: 'Initial Record Entry',
    eventDate: '2012-05-18',
    mutationReference: 'MUT/2012/KEN/0201',
    supportingDocuments: ['Conversion Order 2012', 'Patta Certificate'],
    verificationStatus: 'verified',
    description: 'Site formed from agricultural land conversion.',
    recordedAuthority: 'Tahsildar Office, Bengaluru South'
  },
  {
    id: 'OWN-009-02',
    parcelId: 'KA-BLR-KEN-003',
    ownerName: 'Savitha Murthy',
    startDate: '2022-04-02',
    eventType: 'Registered Transfer (Disputed Area)',
    eventDate: '2022-04-02',
    mutationReference: 'MUT/2022/KEN/0374',
    supportingDocuments: ['Sale Deed 2022'],
    verificationStatus: 'discrepancy',
    description: 'Transfer registered but area in sale deed (0.35 acres) does not match original patta records (0.28 acres). Flagged for area discrepancy verification.',
    recordedAuthority: 'Sub-Registrar Office, Kengeri'
  },
]

// ============================================================
// DISCREPANCY ALERTS
// ============================================================

export const SAMPLE_DISCREPANCIES: LandDiscrepancy[] = [
  {
    id: 'DISC-001',
    parcelId: 'KA-BLR-KEN-001',
    surveyNumber: '42/3',
    category: 'areaMismatch',
    severity: 'high',
    description: 'The recorded area for Survey No. 42/3 differs between the 2016 sale deed (1.25 acres) and the 2021 mutation entry (1.42 acres). This 0.17 acre discrepancy requires verification against original survey records.',
    evidence: 'Sale Deed 2016 records area as 1.25 acres. Mutation Entry MUT/2021/KEN/0089 records area as 1.42 acres. Original survey sketch shows 1.25 acres.',
    previousValue: '1.25 Acres (Sale Deed 2016)',
    currentValue: '1.42 Acres (Mutation Entry 2021)',
    recommendedAction: 'Obtain original survey sketch from Survey & Settlement Department. Verify with Revenue Inspector. If discrepancy confirmed, initiate correction mutation.',
    reviewStatus: 'open',
    createdAt: '2024-03-15T10:30:00Z',
    activityLog: []
  },
  {
    id: 'DISC-002',
    parcelId: 'KA-BLR-KEN-001',
    surveyNumber: '42/3',
    category: 'missingDocument',
    severity: 'medium',
    description: 'The 2021 mutation entry for Survey No. 42/3 lacks a supporting registered document reference. Only an RTC extract is referenced, without a corresponding deed or court order.',
    evidence: 'Mutation Entry MUT/2021/KEN/0089 lists only "RTC Extract 2021" as supporting document. No sale deed, court order, or gift deed is referenced.',
    previousValue: 'Complete document set (Sale Deed + RTC)',
    currentValue: 'Only RTC Extract referenced in mutation',
    recommendedAction: 'Verify with Revenue Inspector whether additional supporting documents were submitted. Request certified copies of all documents registered with the Sub-Registrar for this survey number.',
    reviewStatus: 'underReview',
    createdAt: '2024-03-15T10:35:00Z',
    reviewedAt: '2024-04-01T14:20:00Z',
    reviewNotes: 'Officer contacted Revenue Inspector. Documents being retrieved.',
    assignedOfficer: 'Revenue Inspector Kavitha S.',
    activityLog: [
      {
        id: 'ACT-001',
        actor: 'Revenue Inspector Kavitha S.',
        action: 'Assigned and Under Review',
        timestamp: '2024-04-01T14:20:00Z',
        note: 'Contacting Revenue Inspector. Documents being retrieved from record room.'
      }
    ]
  },
  {
    id: 'DISC-003',
    parcelId: 'KA-BLR-WHI-002',
    surveyNumber: '113/2',
    category: 'ownershipChain',
    severity: 'critical',
    description: 'Survey No. 113/2 (Whitefield) has two conflicting ownership claims. Both Mohan Das Shenoy and the heir of George D\'Souza claim ownership. This affects two registered survey entries and requires court resolution.',
    evidence: 'MUT/2021/WHI/0412 records Mohan Das Shenoy as owner. Counter-claim filed 2024 by legal heir of George D\'Souza alleging sale deed irregularity. Dispute Notice issued by Tahsildar.',
    previousValue: 'George D\'Souza (2008–2021)',
    currentValue: 'Disputed: Mohan Das Shenoy (claimed) vs Legal Heir of D\'Souza (counter-claim)',
    recommendedAction: 'Do not treat either ownership claim as confirmed until court order is obtained. Record the dispute in the land register. Notify both parties. Await judicial resolution.',
    reviewStatus: 'underReview',
    createdAt: '2024-05-10T09:00:00Z',
    reviewedAt: '2024-05-15T11:00:00Z',
    reviewNotes: 'Matter referred to legal cell. Both parties notified.',
    assignedOfficer: 'Tahsildar Office, Hosakote',
    activityLog: [
      {
        id: 'ACT-002',
        actor: 'Tahsildar Office',
        action: 'Referred to Legal Cell',
        timestamp: '2024-05-15T11:00:00Z',
        note: 'Both claimants notified. Matter under civil court jurisdiction.'
      }
    ]
  },
  {
    id: 'DISC-004',
    parcelId: 'KA-BLR-KEN-003',
    surveyNumber: '44/7',
    category: 'areaMismatch',
    severity: 'high',
    description: 'Sale Deed 2022 records area of Survey No. 44/7 as 0.35 acres, but original Patta Certificate and conversion order record the site as 0.28 acres. Difference of 0.07 acres.',
    evidence: 'Patta Certificate (2012): 0.28 acres. Conversion Order (2012): 0.28 acres. Sale Deed 2022: 0.35 acres. Mutation MUT/2022/KEN/0374 adopted sale deed figures without verification against original records.',
    previousValue: '0.28 Acres (Patta Certificate 2012)',
    currentValue: '0.35 Acres (Sale Deed 2022)',
    recommendedAction: 'Request fresh survey by Survey & Settlement Department. Compare with original conversion order. File area correction mutation if survey confirms 0.28 acres.',
    reviewStatus: 'open',
    createdAt: '2024-06-01T08:15:00Z',
    activityLog: []
  },
  {
    id: 'DISC-005',
    parcelId: 'KA-BRU-003',
    surveyNumber: '206/2',
    category: 'unusualModification',
    severity: 'medium',
    description: 'Survey No. 206/2 (Doddaballapura) shows three separate record modifications within a 45-day period in early 2024 — classification change, area adjustment, and owner name correction. Multiple rapid changes merit verification.',
    evidence: 'Mutation MUT/2024/DOD/0201: Classification changed from Dry to Wet (Jan 14, 2024). MUT/2024/DOD/0215: Area adjusted from 4.50 to 4.38 acres (Jan 28, 2024). MUT/2024/DOD/0230: Owner name spelling corrected (Feb 28, 2024).',
    previousValue: 'Agricultural (Dry), 4.50 acres, "Muniswamy Gowda"',
    currentValue: 'Agricultural (Wet), 4.38 acres, "Muniswamy Gowda" (corrected spelling)',
    recommendedAction: 'Verify each modification against the supporting documents submitted at the time. Confirm classification change was supported by a revenue survey or court order. Verify area adjustment.',
    reviewStatus: 'open',
    createdAt: '2024-02-14T13:45:00Z',
    activityLog: []
  },
]

// ============================================================
// CORRECTION REQUESTS (Demo Seed Data)
// ============================================================

export const SAMPLE_REQUESTS: CorrectionRequest[] = [
  {
    id: 'REQ-001',
    token: 'BHUT-2026-000001',
    requestType: 'correction',
    propertyId: 'KA-BLR-KEN-001',
    surveyNumber: '42/3',
    village: 'Kengeri',
    taluk: 'Bengaluru South',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    applicantName: 'Ramesh Kumar Gowda',
    applicantContact: 'ramesh.k.g@example.com',
    preferredLanguage: 'en',
    relationship: 'Recorded Owner',
    description: 'The area recorded in the 2021 mutation entry (1.42 acres) does not match the original sale deed area (1.25 acres). Requesting correction of the mutation entry to reflect the correct area of 1.25 acres as per the registered sale deed.',
    noticedDate: '2024-03-10',
    expectedCorrection: 'Update mutation entry MUT/2021/KEN/0089 to reflect area as 1.25 acres.',
    status: 'verification',
    submittedAt: '2024-03-20T09:15:00Z',
    updatedAt: '2024-04-05T14:30:00Z',
    assignedOfficer: 'Revenue Inspector Kavitha S.',
    applicantVisibleNotes: 'Your request has been assigned to the Revenue Inspector for verification. Please provide original survey sketch if available.',
    internalNotes: 'Area discrepancy confirmed. Mutation record under review. Original survey sketch requested.',
    isDemo: true,
    statusHistory: [
      {
        id: 'SH-001-01',
        requestId: 'REQ-001',
        status: 'submitted',
        timestamp: '2024-03-20T09:15:00Z',
        publicNote: 'Request received and tracking token generated.',
        changedBy: 'System'
      },
      {
        id: 'SH-001-02',
        requestId: 'REQ-001',
        status: 'preliminary',
        timestamp: '2024-03-22T11:00:00Z',
        publicNote: 'Your request is under preliminary review.',
        changedBy: 'Front Desk Officer'
      },
      {
        id: 'SH-001-03',
        requestId: 'REQ-001',
        status: 'verification',
        timestamp: '2024-04-05T14:30:00Z',
        publicNote: 'Request assigned to Revenue Inspector for field verification.',
        internalNote: 'Assigned to Kavitha S. Area discrepancy confirmed in initial review.',
        changedBy: 'Revenue Inspector Kavitha S.'
      }
    ]
  },
  {
    id: 'REQ-002',
    token: 'BHUT-2026-000002',
    requestType: 'appeal',
    propertyId: 'KA-BLR-WHI-002',
    surveyNumber: '113/2',
    village: 'Whitefield',
    taluk: 'Hosakote',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    applicantName: 'Angela D\'Souza',
    applicantContact: 'angela.dsouza@example.com',
    preferredLanguage: 'en',
    relationship: 'Legal Heir of Deceased Owner',
    description: 'Appeal against the mutation entry recording Mohan Das Shenoy as owner of Survey No. 113/2. The sale deed used for the transfer is alleged to be irregular. Requesting stay of mutation and investigation.',
    noticedDate: '2024-04-30',
    expectedCorrection: 'Reversal of mutation MUT/2021/WHI/0412 pending legal inquiry.',
    status: 'forwarded',
    submittedAt: '2024-05-05T10:00:00Z',
    updatedAt: '2024-05-20T16:00:00Z',
    assignedOfficer: 'Tahsildar Office, Hosakote',
    applicantVisibleNotes: 'Your appeal has been forwarded to the Tahsildar\'s office and to the legal cell. The matter is under official review. Please retain all original documents.',
    isDemo: true,
    statusHistory: [
      {
        id: 'SH-002-01',
        requestId: 'REQ-002',
        status: 'submitted',
        timestamp: '2024-05-05T10:00:00Z',
        publicNote: 'Appeal received.',
        changedBy: 'System'
      },
      {
        id: 'SH-002-02',
        requestId: 'REQ-002',
        status: 'preliminary',
        timestamp: '2024-05-08T09:30:00Z',
        publicNote: 'Appeal under preliminary review.',
        changedBy: 'Front Desk Officer'
      },
      {
        id: 'SH-002-03',
        requestId: 'REQ-002',
        status: 'documents',
        timestamp: '2024-05-10T12:00:00Z',
        publicNote: 'Please provide certified copies of the original sale deed (George D\'Souza, 2008) and legal heir certificate.',
        changedBy: 'Revenue Inspector'
      },
      {
        id: 'SH-002-04',
        requestId: 'REQ-002',
        status: 'forwarded',
        timestamp: '2024-05-20T16:00:00Z',
        publicNote: 'Your appeal has been forwarded to the Tahsildar\'s office and to the legal cell.',
        changedBy: 'Tahsildar Office'
      }
    ]
  },
  {
    id: 'REQ-003',
    token: 'BHUT-2026-000003',
    requestType: 'mutation',
    propertyId: 'KA-BRU-001',
    surveyNumber: '204/6B',
    village: 'Doddaballapura',
    taluk: 'Doddaballapura',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    applicantName: 'Gangamma Nanjundappa',
    applicantContact: 'gangamma.n@example.com',
    preferredLanguage: 'kn',
    relationship: 'Heir / Spouse of Deceased Owner',
    description: 'Requesting completion of inheritance mutation following husband\'s demise in November 2020. Application submitted in February 2021 but final mutation has not been completed. Requesting status update and completion.',
    noticedDate: '2021-02-10',
    expectedCorrection: 'Complete inheritance mutation and update RTC to reflect Gangamma Nanjundappa as owner.',
    status: 'documents',
    submittedAt: '2024-04-15T08:30:00Z',
    updatedAt: '2024-04-25T10:15:00Z',
    assignedOfficer: 'Tahsildar Office, Doddaballapura',
    applicantVisibleNotes: 'Please provide (1) Original Death Certificate of husband, (2) Legal Heir Certificate issued by the competent authority, (3) Affidavit of heirship, and (4) Identity proof. You may submit these documents in person at the Tahsildar\'s office or upload them here.',
    isDemo: true,
    statusHistory: [
      {
        id: 'SH-003-01',
        requestId: 'REQ-003',
        status: 'submitted',
        timestamp: '2024-04-15T08:30:00Z',
        publicNote: 'Request received.',
        changedBy: 'System'
      },
      {
        id: 'SH-003-02',
        requestId: 'REQ-003',
        status: 'preliminary',
        timestamp: '2024-04-18T09:00:00Z',
        publicNote: 'Under preliminary review.',
        changedBy: 'Front Desk Officer'
      },
      {
        id: 'SH-003-03',
        requestId: 'REQ-003',
        status: 'documents',
        timestamp: '2024-04-25T10:15:00Z',
        publicNote: 'Additional documents required. Please see officer notes.',
        changedBy: 'Tahsildar Office, Doddaballapura'
      }
    ]
  },
  {
    id: 'REQ-004',
    token: 'BHUT-2026-000004',
    requestType: 'correction',
    propertyId: 'KA-BLR-YEL-001',
    surveyNumber: '78/2A',
    village: 'Yelahanka',
    taluk: 'Yelahanka',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    applicantName: 'Ananya Devi Krishnamurthy',
    applicantContact: 'ananya.dk@example.com',
    preferredLanguage: 'en',
    relationship: 'Recorded Owner',
    description: 'Minor spelling error in owner name in Khata Certificate — recorded as "Ananya D Krishnamurthy" instead of "Ananya Devi Krishnamurthy". Requesting name correction.',
    noticedDate: '2023-10-05',
    expectedCorrection: 'Correct name to "Ananya Devi Krishnamurthy" in all records.',
    status: 'resolved',
    submittedAt: '2023-10-15T11:00:00Z',
    updatedAt: '2023-12-20T15:30:00Z',
    assignedOfficer: 'Revenue Inspector, Yelahanka',
    applicantVisibleNotes: 'Your name correction request has been completed. Updated Khata Certificate has been issued. Please collect from the BBMP ward office.',
    isDemo: true,
    statusHistory: [
      {
        id: 'SH-004-01',
        requestId: 'REQ-004',
        status: 'submitted',
        timestamp: '2023-10-15T11:00:00Z',
        publicNote: 'Request received.',
        changedBy: 'System'
      },
      {
        id: 'SH-004-02',
        requestId: 'REQ-004',
        status: 'verification',
        timestamp: '2023-10-20T09:00:00Z',
        publicNote: 'Name correction under verification.',
        changedBy: 'Revenue Inspector'
      },
      {
        id: 'SH-004-03',
        requestId: 'REQ-004',
        status: 'resolved',
        timestamp: '2023-12-20T15:30:00Z',
        publicNote: 'Name correction completed. Updated certificate issued.',
        changedBy: 'Revenue Inspector, Yelahanka'
      }
    ]
  },
  {
    id: 'REQ-005',
    token: 'BHUT-2026-000005',
    requestType: 'boundary',
    propertyId: 'KA-BRU-002',
    surveyNumber: '205/1',
    village: 'Doddaballapura',
    taluk: 'Doddaballapura',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    applicantName: 'Venkatesh Reddy',
    applicantContact: 'venkatesh.r@example.com',
    preferredLanguage: 'en',
    relationship: 'Recorded Owner',
    description: 'Neighbouring farmer has encroached approximately 0.08 acres on the eastern boundary of Survey No. 205/1. Requesting boundary verification and survey.',
    noticedDate: '2024-02-20',
    expectedCorrection: 'Fresh boundary survey and demarcation of Survey No. 205/1.',
    status: 'awaiting',
    submittedAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-05-15T11:00:00Z',
    assignedOfficer: 'Survey Inspector, Doddaballapura',
    applicantVisibleNotes: 'Survey inspection has been completed. Report is being prepared. Decision is expected within 30 days.',
    isDemo: true,
    statusHistory: [
      {
        id: 'SH-005-01',
        requestId: 'REQ-005',
        status: 'submitted',
        timestamp: '2024-03-01T14:00:00Z',
        publicNote: 'Request received.',
        changedBy: 'System'
      },
      {
        id: 'SH-005-02',
        requestId: 'REQ-005',
        status: 'verification',
        timestamp: '2024-03-15T10:00:00Z',
        publicNote: 'Survey inspection scheduled.',
        changedBy: 'Survey Inspector'
      },
      {
        id: 'SH-005-03',
        requestId: 'REQ-005',
        status: 'awaiting',
        timestamp: '2024-05-15T11:00:00Z',
        publicNote: 'Survey completed. Awaiting final decision.',
        changedBy: 'Survey Inspector, Doddaballapura'
      }
    ]
  },
]

// ============================================================
// DOCUMENT CHECKLIST TEMPLATES
// ============================================================

export const DOCUMENT_CHECKLIST_ITEMS: DocumentChecklistItem[] = [
  // Registration / Transfer
  { id: 'DOC-REG-01', serviceType: 'registration', documentName: 'Identity Proof (Aadhaar / PAN / Voter ID)', documentNameKn: 'ಗುರುತಿನ ಚೀಟಿ (ಆಧಾರ್ / ಪ್ಯಾನ್ / ಮತದಾರ ಐಡಿ)', requirementType: 'required', description: 'Valid government-issued photo identity of both buyer and seller.', descriptionKn: 'ಕ್ರೇತಾ ಮತ್ತು ಮಾರಾಟಗಾರ ಇಬ್ಬರ ಅಧಿಕೃತ ಭಾವಚಿತ್ರ ಗುರುತಿನ ಚೀಟಿ.' },
  { id: 'DOC-REG-02', serviceType: 'registration', documentName: 'Address Proof', documentNameKn: 'ವಿಳಾಸ ಪ್ರಮಾಣ', requirementType: 'required', description: 'Current address proof for all parties.', descriptionKn: 'ಎಲ್ಲ ಪಕ್ಷಕಾರರ ಪ್ರಸ್ತುತ ವಿಳಾಸ ಪ್ರಮಾಣ.' },
  { id: 'DOC-REG-03', serviceType: 'registration', documentName: 'Land Record Extract (RTC / Pahani)', documentNameKn: 'ಭೂ ದಾಖಲೆ ಸಾರ (ಆರ್‌ಟಿಸಿ / ಪಹಣಿ)', requirementType: 'required', description: 'Current RTC (Record of Rights, Tenancy and Crops) extract from the Bhoomi portal.', descriptionKn: 'ಭೂಮಿ ಪೋರ್ಟಲ್‌ನಿಂದ ಪ್ರಸ್ತುತ ಆರ್‌ಟಿಸಿ ಸಾರ.' },
  { id: 'DOC-REG-04', serviceType: 'registration', documentName: 'Encumbrance Certificate (EC)', documentNameKn: 'ಅಡಮಾನ ಪ್ರಮಾಣಪತ್ರ (ಇಸಿ)', requirementType: 'required', description: 'EC for minimum 13 years, confirming no pending charges on the property.', descriptionKn: 'ಕನಿಷ್ಠ 13 ವರ್ಷಗಳ ಅಡಮಾನ ಪ್ರಮಾಣಪತ್ರ.' },
  { id: 'DOC-REG-05', serviceType: 'registration', documentName: 'Draft Sale Deed', documentNameKn: 'ಕರಡು ಮಾರಾಟ ಪತ್ರ', requirementType: 'required', description: 'Prepared sale deed, reviewed by both parties and their legal representatives.', descriptionKn: 'ಎರಡೂ ಪಕ್ಷಗಳು ಪರಿಶೀಲಿಸಿದ ಕರಡು ಮಾರಾಟ ಪತ್ರ.' },
  { id: 'DOC-REG-06', serviceType: 'registration', documentName: 'Survey Sketch / Property Map', documentNameKn: 'ಸರ್ವೆ ನಕ್ಷೆ / ಆಸ್ತಿ ನಕ್ಷೆ', requirementType: 'required', description: 'Sketch from Survey & Settlement Department showing boundaries.', descriptionKn: 'ಸರ್ವೆ ಮತ್ತು ವಸಾಹತು ಇಲಾಖೆಯಿಂದ ಗಡಿ ತೋರಿಸುವ ನಕ್ಷೆ.' },
  { id: 'DOC-REG-07', serviceType: 'registration', documentName: 'Property Tax Receipt', documentNameKn: 'ಆಸ್ತಿ ತೆರಿಗೆ ರಶೀದಿ', requirementType: 'conditional', description: 'Latest property tax receipt, if applicable (typically for urban properties).', descriptionKn: 'ತಾಜಾ ಆಸ್ತಿ ತೆರಿಗೆ ರಶೀದಿ (ನಗರ ಆಸ್ತಿಗಳಿಗೆ).' },
  { id: 'DOC-REG-08', serviceType: 'registration', documentName: 'NOC from Housing Society / Authority', documentNameKn: 'ವಾಸ ಸಮಾಜ ಅನಾಪತ್ತಿ ಪ್ರಮಾಣ', requirementType: 'conditional', description: 'Required if property is in a registered layout or housing society.', descriptionKn: 'ನೋಂದಾಯಿತ ಲೇಔಟ್ ಅಥವಾ ವಸತಿ ಸಮಾಜದಲ್ಲಿದ್ದರೆ ಅಗತ್ಯ.' },

  // Mutation
  { id: 'DOC-MUT-01', serviceType: 'mutation', documentName: 'Application Form (Prescribed Format)', documentNameKn: 'ಅರ್ಜಿ ನಮೂನೆ', requirementType: 'required', description: 'Mutation application in the prescribed format from the Tahsildar\'s office.', descriptionKn: 'ತಹಶೀಲ್ದಾರ್ ಕಚೇರಿಯ ನಿಗದಿತ ನಮೂನೆಯಲ್ಲಿ ಮ್ಯುಟೇಶನ್ ಅರ್ಜಿ.' },
  { id: 'DOC-MUT-02', serviceType: 'mutation', documentName: 'Registered Sale Deed / Gift Deed / Court Order', documentNameKn: 'ನೋಂದಾಯಿತ ಮಾರಾಟ ಪತ್ರ / ದಾನ ಪತ್ರ / ನ್ಯಾಯಾಲಯ ಆದೇಶ', requirementType: 'required', description: 'The document evidencing the transfer that requires mutation.', descriptionKn: 'ಮ್ಯುಟೇಶನ್ ಅಗತ್ಯಪಡಿಸುವ ವರ್ಗಾವಣೆ ಸಾಬೀತುಪಡಿಸುವ ದಾಖಲೆ.' },
  { id: 'DOC-MUT-03', serviceType: 'mutation', documentName: 'Current RTC Extract', documentNameKn: 'ಪ್ರಸ್ತುತ ಆರ್‌ಟಿಸಿ ಸಾರ', requirementType: 'required', description: 'Current land record extract.', descriptionKn: 'ಪ್ರಸ್ತುತ ಭೂ ದಾಖಲೆ ಸಾರ.' },
  { id: 'DOC-MUT-04', serviceType: 'mutation', documentName: 'Identity Proof of New Owner', documentNameKn: 'ಹೊಸ ಮಾಲೀಕರ ಗುರುತಿನ ಚೀಟಿ', requirementType: 'required', description: 'Valid identity proof of the person requesting mutation.', descriptionKn: 'ಮ್ಯುಟೇಶನ್ ಕೋರುತ್ತಿರುವ ವ್ಯಕ್ತಿಯ ಅಧಿಕೃತ ಗುರುತಿನ ಚೀಟಿ.' },

  // Correction
  { id: 'DOC-COR-01', serviceType: 'correction', documentName: 'Application for Record Correction', documentNameKn: 'ದಾಖಲೆ ಸರಿಪಡಿಕೆ ಅರ್ಜಿ', requirementType: 'required', description: 'Written application describing the error and the correct information.', descriptionKn: 'ದೋಷ ಮತ್ತು ಸರಿಯಾದ ಮಾಹಿತಿ ವಿವರಿಸುವ ಲಿಖಿತ ಅರ್ಜಿ.' },
  { id: 'DOC-COR-02', serviceType: 'correction', documentName: 'Original Document with Correct Information', documentNameKn: 'ಸರಿಯಾದ ಮಾಹಿತಿ ಇರುವ ಮೂಲ ದಾಖಲೆ', requirementType: 'required', description: 'Original registered deed, patta, or other document containing the correct information.', descriptionKn: 'ಸರಿಯಾದ ಮಾಹಿತಿ ಇರುವ ಮೂಲ ನೋಂದಾಯಿತ ಪತ್ರ ಅಥವಾ ಪಟ್ಟ.' },
  { id: 'DOC-COR-03', serviceType: 'correction', documentName: 'Current RTC Extract', documentNameKn: 'ಪ್ರಸ್ತುತ ಆರ್‌ಟಿಸಿ ಸಾರ', requirementType: 'required', description: 'Current land record extract showing the error to be corrected.', descriptionKn: 'ಸರಿಪಡಿಸಬೇಕಾದ ದೋಷ ತೋರಿಸುವ ಪ್ರಸ್ತುತ ಭೂ ದಾಖಲೆ ಸಾರ.' },
  { id: 'DOC-COR-04', serviceType: 'correction', documentName: 'Affidavit / Declaration', documentNameKn: 'ಪ್ರಮಾಣಪತ್ರ / ಘೋಷಣೆ', requirementType: 'conditional', description: 'Affidavit may be required for name corrections or significant changes.', descriptionKn: 'ಹೆಸರು ಸರಿಪಡಿಕೆ ಅಥವಾ ಮಹತ್ವದ ಬದಲಾವಣೆಗಳಿಗೆ ಪ್ರಮಾಣಪತ್ರ ಅಗತ್ಯ.' },
  { id: 'DOC-COR-05', serviceType: 'correction', documentName: 'Survey Sketch (for area corrections)', documentNameKn: 'ಸರ್ವೆ ನಕ್ಷೆ (ಕ್ಷೇತ್ರ ಸರಿಪಡಿಕೆಗಾಗಿ)', requirementType: 'conditional', description: 'Required if the correction relates to recorded area or boundaries.', descriptionKn: 'ದಾಖಲಾದ ವಿಸ್ತೀರ್ಣ ಅಥವಾ ಗಡಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಸರಿಪಡಿಕೆಗೆ ಅಗತ್ಯ.' },

  // Inheritance
  { id: 'DOC-INH-01', serviceType: 'inheritance', documentName: 'Death Certificate of Deceased Owner', documentNameKn: 'ಮೃತ ಮಾಲೀಕರ ಮರಣ ಪ್ರಮಾಣಪತ್ರ', requirementType: 'required', description: 'Death certificate issued by the competent authority.', descriptionKn: 'ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ನೀಡಿದ ಮರಣ ಪ್ರಮಾಣಪತ್ರ.' },
  { id: 'DOC-INH-02', serviceType: 'inheritance', documentName: 'Legal Heir Certificate', documentNameKn: 'ಕಾನೂನು ಉತ್ತರಾಧಿಕಾರಿ ಪ್ರಮಾಣಪತ್ರ', requirementType: 'required', description: 'Legal heir certificate from the Tahsildar or competent court.', descriptionKn: 'ತಹಶೀಲ್ದಾರ್ ಅಥವಾ ಸಕ್ಷಮ ನ್ಯಾಯಾಲಯದಿಂದ ಕಾನೂನು ಉತ್ತರಾಧಿಕಾರಿ ಪ್ರಮಾಣಪತ್ರ.' },
  { id: 'DOC-INH-03', serviceType: 'inheritance', documentName: 'Succession Certificate (if required)', documentNameKn: 'ಉತ್ತರಾಧಿಕಾರ ಪ್ರಮಾಣಪತ್ರ (ಅಗತ್ಯವಿದ್ದರೆ)', requirementType: 'conditional', description: 'Court-issued succession certificate, required for certain assets.', descriptionKn: 'ಕೆಲವು ಆಸ್ತಿಗಳಿಗೆ ನ್ಯಾಯಾಲಯ ನೀಡಿದ ಉತ್ತರಾಧಿಕಾರ ಪ್ರಮಾಣಪತ್ರ.' },
  { id: 'DOC-INH-04', serviceType: 'inheritance', documentName: 'Affidavit of Heirship', documentNameKn: 'ಉತ್ತರಾಧಿಕಾರ ಪ್ರಮಾಣಪತ್ರ', requirementType: 'required', description: 'Notarised affidavit confirming relationship to the deceased.', descriptionKn: 'ಮೃತ ವ್ಯಕ್ತಿಯೊಂದಿಗಿನ ಸಂಬಂಧ ದೃಢೀಕರಿಸುವ ನೋಟರೈಸ್ ಪ್ರಮಾಣಪತ್ರ.' },
  { id: 'DOC-INH-05', serviceType: 'inheritance', documentName: 'Current RTC Extract', documentNameKn: 'ಪ್ರಸ್ತುತ ಆರ್‌ಟಿಸಿ ಸಾರ', requirementType: 'required', description: 'RTC in the deceased\'s name.', descriptionKn: 'ಮೃತ ವ್ಯಕ್ತಿಯ ಹೆಸರಿನಲ್ಲಿ ಆರ್‌ಟಿಸಿ.' },
  { id: 'DOC-INH-06', serviceType: 'inheritance', documentName: 'Will (if applicable)', documentNameKn: 'ಉಯಿಲು (ಅನ್ವಯಿಸಿದರೆ)', requirementType: 'conditional', description: 'Registered or probated will, if the deceased left one.', descriptionKn: 'ಮೃತ ವ್ಯಕ್ತಿ ಉಯಿಲು ಬಿಟ್ಟಿದ್ದರೆ ನೋಂದಾಯಿತ ಅಥವಾ ಪ್ರೊಬೇಟ್ ಉಯಿಲು.' },

  // Appeal
  { id: 'DOC-APP-01', serviceType: 'appeal', documentName: 'Written Appeal Application', documentNameKn: 'ಲಿಖಿತ ಮೇಲ್ಮನವಿ ಅರ್ಜಿ', requirementType: 'required', description: 'Clearly stating the decision being appealed and the grounds for appeal.', descriptionKn: 'ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸುವ ನಿರ್ಧಾರ ಮತ್ತು ಮೇಲ್ಮನವಿ ಕಾರಣ ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಬೇಕು.' },
  { id: 'DOC-APP-02', serviceType: 'appeal', documentName: 'Copy of Original Decision / Order', documentNameKn: 'ಮೂಲ ನಿರ್ಧಾರ / ಆದೇಶದ ಪ್ರತಿ', requirementType: 'required', description: 'Certified copy of the decision being appealed.', descriptionKn: 'ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಲಾಗುತ್ತಿರುವ ನಿರ್ಧಾರದ ಪ್ರಮಾಣಿತ ಪ್ರತಿ.' },
  { id: 'DOC-APP-03', serviceType: 'appeal', documentName: 'Evidence Supporting the Appeal', documentNameKn: 'ಮೇಲ್ಮನವಿ ಬೆಂಬಲಿಸುವ ಸಾಕ್ಷ್ಯ', requirementType: 'required', description: 'Documents, records, or evidence supporting the grounds for appeal.', descriptionKn: 'ಮೇಲ್ಮನವಿ ಕಾರಣಗಳನ್ನು ಬೆಂಬಲಿಸುವ ದಾಖಲೆಗಳು ಅಥವಾ ಸಾಕ್ಷ್ಯ.' },
]

