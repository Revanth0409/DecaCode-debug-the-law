// AI Chatbot Service — modular, mock-first design
import { getRequestByToken, getAllParcels, getRiskRecordForParcel } from './dataService'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isMock?: boolean
}

// Intent detection
type Intent = 
  | 'search_records' | 'track_status' | 'checklist_docs' | 'discrepancy_explain'
  | 'submit_request' | 'explain_term' | 'navigate' | 'greeting' | 'ownership_history'
  | 'general_land' | 'encumbrance_risk' | 'akhata_assessment' | 'payment_transparency'
  | 'legal_appeal' | 'report_concern' | 'unknown'

function detectIntent(message: string): Intent {
  const m = message.toLowerCase()
  if (/नमस्|hello|hi|namaskara|greet/i.test(m)) return 'greeting'
  if (/track|token|bhut-|status|application/i.test(m)) return 'track_status'
  if (/encumbrance|mortgage|lien|loan|court|litigation|restriction|bank|risk|safe to buy|due.diligence/i.test(m)) return 'encumbrance_risk'
  if (/akhata|a.khata|khata|regulariz|conversion|dc.convert|layout.approv|betterment|road.width/i.test(m)) return 'akhata_assessment'
  if (/fee|payment|receipt|pay|charge|transparent|bribery|corruption|unofficial|demand/i.test(m)) return 'payment_transparency'
  if (/legal.appeal|printable|generate.document|appeal.letter|representation/i.test(m)) return 'legal_appeal'
  if (/concern|complaint|irregularity|report.*process|report.*concern/i.test(m)) return 'report_concern'
  if (/search|find|look up|survey|parcel|record/i.test(m)) return 'search_records'
  if (/document|checklist|required|need|paper/i.test(m)) return 'checklist_docs'
  if (/discrepancy|alert|inconsisten|mismatch|fraud|dispute/i.test(m)) return 'discrepancy_explain'
  if (/submit|correct|correction|appeal|complaint|request/i.test(m)) return 'submit_request'
  if (/ownership|history|timeline|transfer|mutation|who owned/i.test(m)) return 'ownership_history'
  if (/meaning|term|define|what is|explain|ಅರ್ಥ|ವ್ಯಾಖ್ಯಾನ/i.test(m)) return 'explain_term'
  if (/navigate|go to|where|page|section/i.test(m)) return 'navigate'
  if (/land|property|acre|survey|village|taluk|district|rtc|patta|khata|mutation/i.test(m)) return 'general_land'
  return 'unknown'
}

function extractToken(message: string): string | null {
  const match = message.match(/BHUT-\d{4}-\d{6}/i)
  return match ? match[0].toUpperCase() : null
}

function extractSurveyNumber(message: string): string | null {
  const match = message.match(/\b(\d{2,4}\/\d{1,4}[A-Z]?)\b/i)
  return match ? match[1] : null
}

const TERM_GLOSSARY: Record<string, { en: string; kn: string }> = {
  rtc: {
    en: 'RTC (Record of Rights, Tenancy and Crops) is the primary land record document in Karnataka showing ownership, tenancy, and crop details. Also called Pahani.',
    kn: 'ಆರ್‌ಟಿಸಿ (ಹಕ್ಕು, ಗೇಣಿ ಮತ್ತು ಬೆಳೆಗಳ ದಾಖಲೆ) ಕರ್ನಾಟಕದ ಪ್ರಾಥಮಿಕ ಭೂ ದಾಖಲೆ — ಮಾಲೀಕತ್ವ, ಗೇಣಿ ಮತ್ತು ಬೆಳೆ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.'
  },
  mutation: {
    en: 'Mutation (Khata Transfer) is the process of updating land records to reflect a change in ownership. It is required after buying, inheriting, or receiving land as a gift.',
    kn: 'ಮ್ಯುಟೇಶನ್ (ಖಾತಾ ವರ್ಗಾವಣೆ) ಮಾಲೀಕತ್ವ ಬದಲಾವಣೆ ಪ್ರತಿಫಲಿಸಲು ಭೂ ದಾಖಲೆ ಅಪ್‌ಡೇಟ್ ಮಾಡುವ ಪ್ರಕ್ರಿಯೆ.'
  },
  patta: {
    en: 'Patta is a government-issued document that establishes ownership rights over land. It is issued by the Tahsildar and contains details like survey number, owner name, and area.',
    kn: 'ಪಟ್ಟ ಎಂಬುದು ಸರ್ಕಾರ ನೀಡಿದ ದಾಖಲೆ ಭೂ ಮಾಲೀಕತ್ವ ಹಕ್ಕು ಸ್ಥಾಪಿಸುತ್ತದೆ. ತಹಶೀಲ್ದಾರ್ ನೀಡುತ್ತಾರೆ.'
  },
  khata: {
    en: 'Khata is a municipal document (issued by BBMP or other local bodies) that records a property for tax purposes. A-Khata is issued for properties in approved layouts with clear legal status; B-Khata is issued for others pending regularization.',
    kn: 'ಖಾತಾ ಪುರಸಭೆ ದಾಖಲೆ (BBMP ಅಥವಾ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆ ನೀಡಿದ) ತೆರಿಗೆ ಉದ್ದೇಶಕ್ಕಾಗಿ ಆಸ್ತಿ ನೋಂದಣಿ ಮಾಡುತ್ತದೆ.'
  },
  encumbrance: {
    en: 'Encumbrance Certificate (EC) is a document showing whether a property has any financial or legal liabilities — such as mortgages, loans, liens, or court orders — registered against it. Always obtain an EC before buying property.',
    kn: 'ಅಡಮಾನ ಪ್ರಮಾಣಪತ್ರ ಆಸ್ತಿಯ ಮೇಲೆ ಯಾವುದೇ ಆರ್ಥಿಕ ಅಥವಾ ಕಾನೂನು ಹೊಣೆಗಾರಿಕೆ ಇದೆಯೇ ಎಂದು ತೋರಿಸುವ ದಾಖಲೆ.'
  },
  survey: {
    en: 'A survey number is a unique identifier assigned to each piece of land by the Survey & Settlement Department. It helps identify and locate specific land parcels.',
    kn: 'ಸರ್ವೆ ನಂಬರ್ ಸರ್ವೆ ಮತ್ತು ವಸಾಹತು ಇಲಾಖೆ ಪ್ರತಿ ಭೂಮಿ ಭಾಗಕ್ಕೆ ನೀಡಿದ ವಿಶಿಷ್ಟ ಗುರುತಿನ ಸಂಖ್ಯೆ.'
  },
  mortgage: {
    en: 'A mortgage is a legal arrangement where a property is used as security for a loan. If recorded in the Sub-Registrar\'s office, it appears in the Encumbrance Certificate. A property with an active mortgage should not be purchased without obtaining a formal discharge or release from the lender.',
    kn: 'ಅಡಮಾನ (ಮಾರ್ಗೇಜ್) ಒಂದು ಕಾನೂನು ವ್ಯವಸ್ಥೆ ಆಸ್ತಿಯನ್ನು ಸಾಲದ ಭದ್ರತೆಯಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.'
  },
  lien: {
    en: 'A lien is a legal claim on a property by a creditor. Unlike a mortgage (which involves voluntary pledging), a lien may be imposed by law (e.g. tax lien). A lien restricts the owner\'s ability to freely transfer the property.',
    kn: 'ಲಿಯನ್ ಒಂದು ಕಾನೂನು ಹಕ್ಕು ಸಾಲಗಾರನು ಆಸ್ತಿಯ ಮೇಲೆ ಹೊಂದಿರುತ್ತಾನೆ.'
  },
  conversion: {
    en: 'DC Conversion (Deputy Commissioner\'s Conversion) is the process of changing land use from agricultural to non-agricultural (residential, commercial, or industrial). In Karnataka, this is typically required before developing agricultural land. The conversion order is issued by the Deputy Commissioner\'s office.',
    kn: 'ಡಿಸಿ ಪರಿವರ್ತನೆ ಕೃಷಿ ಭೂಮಿಯನ್ನು ಕೃಷಿಯೇತರ ಉದ್ದೇಶಕ್ಕೆ ಬದಲಾಯಿಸುವ ಪ್ರಕ್ರಿಯೆ. ಉಪ ಜಿಲ್ಲಾಧಿಕಾರಿ ಕಚೇರಿ ಪರಿವರ್ತನಾ ಆದೇಶ ನೀಡುತ್ತದೆ.'
  },
  betterment: {
    en: 'Betterment charges are fees levied by a planning authority (such as BDA or BBMP) for improvements to infrastructure — roads, drainage, parks — in an approved layout. Payment of betterment charges is often required before an A-Khata can be issued.',
    kn: 'ಬೆಟರ್‌ಮೆಂಟ್ ಶುಲ್ಕ ಯೋಜನಾ ಪ್ರಾಧಿಕಾರ (BDA ಅಥವಾ BBMP) ಮೂಲಸೌಕರ್ಯ ಸುಧಾರಣೆಗೆ ವಿಧಿಸುವ ಶುಲ್ಕ.'
  },
}

function generateMockResponse(message: string, lang: 'en' | 'kn'): string {
  const intent = detectIntent(message)
  const token = extractToken(message)
  const surveyNum = extractSurveyNumber(message)

  // Token lookup — uses real data
  if (token || intent === 'track_status') {
    if (token) {
      const req = getRequestByToken(token)
      if (req) {
        const statusMap: Record<string, string> = {
          submitted: 'Submitted — awaiting preliminary review',
          preliminary: 'Under Preliminary Review',
          documents: 'Additional Documents Required',
          verification: 'Under Verification',
          forwarded: 'Forwarded to Relevant Authority',
          awaiting: 'Awaiting Decision',
          resolved: 'Resolved ✓',
          rejected: 'Rejected',
          closed: 'Closed'
        }
        const statusDisplay = statusMap[req.status] || req.status
        if (lang === 'kn') {
          return `ಟೋಕನ್ **${token}** ಕೋರಿಕೆ ಸ್ಥಿತಿ:\n\n` +
            `• ಸ್ಥಿತಿ: **${statusDisplay}**\n` +
            `• ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ: ${new Date(req.submittedAt).toLocaleDateString('kn-IN')}\n` +
            `• ಅರ್ಜಿ ವಿಧ: ${req.requestType}\n` +
            (req.applicantVisibleNotes ? `• ಅಧಿಕಾರಿ ಟಿಪ್ಪಣಿ: ${req.applicantVisibleNotes}` : '') +
            `\n\nಸಂಪೂರ್ಣ ಸ್ಥಿತಿ ಕಾಲರೇಖೆ ನೋಡಲು ಟ್ರ್ಯಾಕ್ ಅರ್ಜಿ ಪುಟಕ್ಕೆ ಹೋಗಿ. ಕಾನೂನು ಮೇಲ್ಮನವಿ ದಾಖಲೆ ರಚಿಸಲು **ಕಾನೂನು ಮೇಲ್ಮನವಿ ರಚಿಸಿ** ಬಟನ್ ಬಳಸಿ.`
        }
        return `Here is the status for token **${token}**:\n\n` +
          `• **Status:** ${statusDisplay}\n` +
          `• **Submitted:** ${new Date(req.submittedAt).toLocaleDateString()}\n` +
          `• **Request Type:** ${req.requestType}\n` +
          (req.applicantVisibleNotes ? `• **Officer Note:** ${req.applicantVisibleNotes}` : '') +
          `\n\nVisit the **Track Application** page for the full activity timeline. You can also **Generate a Printable Legal Appeal** from that page.`
      } else {
        return lang === 'kn'
          ? `ಕ್ಷಮಿಸಿ, **${token}** ಟೋಕನ್‌ಗೆ ಯಾವುದೇ ಕೋರಿಕೆ ಕಂಡುಬಂದಿಲ್ಲ. ಟೋಕನ್ ಸರಿಯಾಗಿ ನಮೂದಿಸಲಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ. ಉದಾ: BHUT-2026-000001`
          : `I could not find a request with token **${token}**. Please check the token — it should look like BHUT-2026-000001. You can also visit the **Track Application** page.`
      }
    }
    return lang === 'kn'
      ? 'ಅರ್ಜಿ ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಟ್ರ್ಯಾಕಿಂಗ್ ಟೋಕನ್ ನೀಡಿ (ಉದಾ: BHUT-2026-000001). ಅಥವಾ ಟ್ರ್ಯಾಕ್ ಅರ್ಜಿ ಪುಟಕ್ಕೆ ಹೋಗಿ.'
      : 'To track your application status, please provide your tracking token (e.g. BHUT-2026-000001). You can also visit the **Track Application** page.'
  }

  // Encumbrance / risk
  if (intent === 'encumbrance_risk') {
    // Check if a survey number was mentioned — look up real risk data
    if (surveyNum) {
      const allParcels = getAllParcels()
      const parcel = allParcels.find(p => p.surveyNumber.toLowerCase() === surveyNum.toLowerCase())
      if (parcel) {
        const risk = getRiskRecordForParcel(parcel.id)
        if (risk) {
          const statusLabels: Record<string, string> = {
            no_issues_found: 'No known issues found in the demonstration dataset',
            encumbrance_detected: 'A potential encumbrance has been detected',
            court_restriction: 'A court-related restriction is flagged',
            verification_required: 'Verification is required',
            data_unavailable: 'Data is unavailable',
          }
          return lang === 'kn'
            ? `ಸರ್ವೆ ನಂ. **${surveyNum}** (${parcel.village}) ಅಪಾಯ ಸ್ಥಿತಿ:\n\n` +
              `• ಒಟ್ಟಾರೆ: ${statusLabels[risk.overallStatus] || risk.overallStatus}\n` +
              `• ಅಡಮಾನ: ${risk.mortgage.status.replace(/_/g, ' ')}\n` +
              `• ನ್ಯಾಯಾಲಯ: ${risk.litigation.status.replace(/_/g, ' ')}\n\n` +
              `⚠️ **ಮುಖ್ಯ:** ಇದು ಪ್ರದರ್ಶನ ಡೇಟಾ. ಆಸ್ತಿ ಖರೀದಿ ಮೊದಲು ಸಬ್-ರಿಜಿಸ್ಟ್ರಾರ್ ಕಚೇರಿಯಿಂದ ಅಧಿಕೃತ EC ಪಡೆಯಿರಿ. ಅರ್ಹ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.\n\n` +
              `ಪೂರ್ಣ ವರದಿಗಾಗಿ: ಆಸ್ತಿ ಪುಟ → **ಹೊಣೆಗಾರಿಕೆ ಮತ್ತು ಕಾನೂನು ಅಪಾಯ** ಟ್ಯಾಬ್.`
            : `Risk assessment for Survey No. **${surveyNum}** (${parcel.village}, ${parcel.district}):\n\n` +
              `• **Overall:** ${statusLabels[risk.overallStatus] || risk.overallStatus}\n` +
              `• **Mortgage:** ${risk.mortgage.status.replace(/_/g, ' ')}\n` +
              `• **Litigation:** ${risk.litigation.status.replace(/_/g, ' ')}\n` +
              `• **Risk Indicators:** ${risk.riskIndicatorCount}\n\n` +
              `⚠️ **Important:** This is demonstration data — no real bank or court database was queried. Always obtain a current Encumbrance Certificate from the Sub-Registrar Office before any property transaction. Consult a qualified lawyer.\n\n` +
              `View the full report: open the property page → **Encumbrance & Legal Risk** tab, or visit **/land-records/${parcel.id}/encumbrance**.`
        }
      }
    }
    return lang === 'kn'
      ? `**ಹೊಣೆಗಾರಿಕೆ ಮತ್ತು ಕಾನೂನು ಅಪಾಯ** ಬಗ್ಗೆ:\n\n` +
        `**ಅಡಮಾನ (ಮಾರ್ಗೇಜ್):** ಸಾಲಕ್ಕೆ ಆಸ್ತಿ ಭದ್ರತೆಯಾಗಿ ಬಳಸಲಾಗಿದ್ದರೆ ಸಬ್-ರಿಜಿಸ್ಟ್ರಾರ್ ದಾಖಲೆಗಳಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗುತ್ತದೆ.\n` +
        `**ನ್ಯಾಯಾಲಯ ನಿರ್ಬಂಧ:** ವ್ಯಾಜ್ಯ ಆಸ್ತಿ ಮಾರಾಟಕ್ಕೆ ನ್ಯಾಯಾಲಯ ತಡೆ ಹಾಕಬಹುದು.\n\n` +
        `ಆಸ್ತಿ ಖರೀದಿ ಮೊದಲು ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಅಡಮಾನ ಪ್ರಮಾಣಪತ್ರ (EC) ಪಡೆಯಿರಿ ಮತ್ತು ಅರ್ಹ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.\n\n` +
        `ಪ್ರದರ್ಶನ ಅಪಾಯ ವರದಿ ನೋಡಲು: ಆಸ್ತಿ ಪುಟ → **ಹೊಣೆಗಾರಿಕೆ ಟ್ಯಾಬ್** ಕ್ಲಿಕ್ ಮಾಡಿ.`
      : `**Encumbrance & Legal Risk** helps you identify:\n\n` +
        `• **Active Mortgage:** A loan secured against the property registered at the Sub-Registrar's office\n` +
        `• **Bank Lien:** A financial charge placed by a creditor\n` +
        `• **Court Litigation:** A civil dispute or order restricting the property\n\n` +
        `⚠️ **Critical rule:** Never assume a property is free from encumbrances just because no issue appears in a basic land record. Always obtain a current **Encumbrance Certificate** from the Sub-Registrar Office and consult a qualified lawyer.\n\n` +
        `To check encumbrance data: open any property → **Encumbrance & Legal Risk** tab, or add **/encumbrance** to the property URL.\n\nAsk me about a specific survey number (e.g. "Survey 42/3 encumbrance") for the demo data.`
  }

  // A-Khata
  if (intent === 'akhata_assessment') {
    return lang === 'kn'
      ? `**ಎ-ಖಾತ ಸಿದ್ಧತೆ ಪರಿಶೀಲನೆ** ಬಗ್ಗೆ:\n\n` +
        `A-Khata ನಾಲ್ಕು ಮುಖ್ಯ ಅಂಶಗಳನ್ನು ಅವಲಂಬಿಸಿದೆ:\n` +
        `1. **ಡಿಸಿ ಪರಿವರ್ತನೆ** — ಕೃಷಿ ಭೂಮಿ ಪರಿವರ್ತನಾ ಆದೇಶ\n` +
        `2. **ಲೇಔಟ್ ಅನುಮೋದನೆ** — BDA/BMRDA/BBMP ಅನುಮೋದನೆ\n` +
        `3. **ಬೆಟರ್‌ಮೆಂಟ್ ಶುಲ್ಕ** — ಸಂಬಂಧಿತ ಶುಲ್ಕ ಪಾವತಿ\n` +
        `4. **ರಸ್ತೆ ಅಗಲ** — ಅಗತ್ಯ ಅಗಲ ಪೂರೈಸುತ್ತದೆಯೇ\n\n` +
        `⚠️ ಇದು ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆ ಮಾತ್ರ. ಅಂತಿಮ ಅರ್ಹತೆ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ ನಿರ್ಧರಿಸುತ್ತದೆ.\n\n` +
        `ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಲು: **ಎ-ಖಾತ ಸಿದ್ಧತೆ ಪರಿಶೀಲನೆ** ಪುಟಕ್ಕೆ ಹೋಗಿ.`
      : `**A-Khata Readiness Check** — 4 key factors:\n\n` +
        `1. **DC Conversion:** Has the land been converted from agricultural to non-agricultural use (if required)? The conversion order is issued by the Deputy Commissioner.\n` +
        `2. **Layout Approval:** Is the layout approved by the relevant authority — BDA, BMRDA, BBMP, or another competent body?\n` +
        `3. **Betterment Charges:** Have applicable betterment charges to the planning authority been paid?\n` +
        `4. **Road Width:** Does the road providing access to the property meet the documented requirement?\n\n` +
        `⚠️ **Important:** This is a **preliminary screening tool only** — not an official eligibility determination. Final A-Khata issuance depends on the applicable statutory framework, planning authority, and current government rules.\n\n` +
        `Start the check: visit the **A-Khata Readiness Check** page from the navigation.`
  }

  // Payment transparency
  if (intent === 'payment_transparency') {
    return lang === 'kn'
      ? `**ಪಾವತಿ ಪಾರದರ್ಶಕತೆ** ಬಗ್ಗೆ:\n\n` +
        `• ಪ್ರತಿ ಸೇವೆಗೆ ಅಧಿಕೃತ ಶುಲ್ಕ ಇದೆ — ಅನಧಿಕೃತ ಅಥವಾ ದಾಖಲಿಸದ ಶುಲ್ಕ ಎಂದಿಗೂ ಪಾವತಿಸಬೇಡಿ\n` +
        `• ಎಲ್ಲ ಪಾವತಿಗಳಿಗೆ ಅಧಿಕೃತ ರಶೀದಿ ಕೇಳಿ\n` +
        `• ಅಸ್ಪಷ್ಟ ಶುಲ್ಕ ವಿನಂತಿ ಅಥವಾ ದಾಖಲಿಸದ ಪಾವತಿ ಬೇಡಿಕೆ ಇದ್ದರೆ ದೂರು ನೀಡಿ\n\n` +
        `ಪ್ರದರ್ಶನ ಶುಲ್ಕ ಮಾಹಿತಿ: **ಪಾರದರ್ಶಕ ಪ್ರಕ್ರಿಯೆ** ಪುಟಕ್ಕೆ ಹೋಗಿ.\n` +
        `ದೂರು ನೀಡಲು: **ಪ್ರಕ್ರಿಯಾ ಕಳವಳ ವರದಿ** ಪುಟ ಬಳಸಿ.`
      : `**Transparent Payments & Process:**\n\n` +
        `• Every land-record service has an official government fee — verify it before paying anything\n` +
        `• Never pay unofficial or undocumented fees to any individual\n` +
        `• Always demand an official receipt for every payment\n` +
        `• Payment status is tracked and visible in the **Transparency** section\n\n` +
        `**Demo payment simulator:** Visit the **Transparent Process & Payments** page to see illustrative fee schedules, simulate a demo payment, and view payment records.\n\n` +
        `**Report a concern:** If you experience an unclear fee request, missing receipt, or other process issue, use the **Report a Process Concern** page. You will receive a unique concern reference token.`
  }

  // Legal appeal
  if (intent === 'legal_appeal') {
    return lang === 'kn'
      ? `**ಕಾನೂನು ಮೇಲ್ಮನವಿ ದಾಖಲೆ** ರಚಿಸಲು:\n\n` +
        `1. **ಟ್ರ್ಯಾಕ್ ಅರ್ಜಿ** ಪುಟ ತೆರೆಯಿರಿ\n` +
        `2. ನಿಮ್ಮ BHUT- ಟೋಕನ್ ನಮೂದಿಸಿ\n` +
        `3. **ಮುದ್ರಣಯೋಗ್ಯ ಕಾನೂನು ಮೇಲ್ಮನವಿ ರಚಿಸಿ** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ\n` +
        `4. ದಾಖಲೆ ವಿಧ, ಸ್ವೀಕರಿಸುವ ಅಧಿಕಾರಿ ಮತ್ತು ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ\n` +
        `5. ಪೂರ್ವಾವಲೋಕನ ನೋಡಿ ಸಹಿ ಮಾಡಿ ಸಲ್ಲಿಸಿ\n\n` +
        `⚠️ ರಚಿಸಿದ ದಾಖಲೆ ಸಾಮಾನ್ಯ ಟೆಂಪ್ಲೇಟ್. ನಿಗದಿತ ಶಾಸನಬದ್ಧ ನಮೂನೆ ಅಲ್ಲ. ಸಲ್ಲಿಸುವ ಮೊದಲು ಅರ್ಹ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.`
      : `**Generate a Printable Legal Appeal / Representation:**\n\n` +
        `1. Go to the **Track Application** page\n` +
        `2. Enter your BHUT- token\n` +
        `3. Click **Generate Printable Legal Appeal**\n` +
        `4. Select document type, recipient authority, and language (English / Kannada / Both)\n` +
        `5. Preview, review all details, then download or print\n\n` +
        `You can generate:\n` +
        `• Application for correction of a land-record error\n` +
        `• Request for mutation-status review\n` +
        `• Ownership-history discrepancy representation\n` +
        `• Appeal concerning a recorded decision\n\n` +
        `⚠️ The generated document is a general administrative template, not a prescribed statutory form. Review with a qualified professional before submitting to any authority.`
  }

  // Report concern
  if (intent === 'report_concern') {
    return lang === 'kn'
      ? `**ಪ್ರಕ್ರಿಯಾ ಕಳವಳ ವರದಿ:**\n\n` +
        `ಅಸ್ಪಷ್ಟ ಶುಲ್ಕ, ರಶೀದಿ ಇಲ್ಲದ ಪಾವತಿ, ವಿವರಿಸದ ವಿಳಂಬ, ಅಥವಾ ಅನಧಿಕೃತ ಪಾವತಿ ಬೇಡಿಕೆ ಇದ್ದರೆ:\n\n` +
        `1. **ಪ್ರಕ್ರಿಯಾ ಕಳವಳ ವರದಿ** ಪುಟಕ್ಕೆ ಹೋಗಿ\n` +
        `2. ಕಳವಳ ವಿಧ ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ವಿವರಿಸಿ\n` +
        `3. ಸಲ್ಲಿಸಿದ ನಂತರ BHUC- ಉಲ್ಲೇಖ ಟೋಕನ್ ಸ್ವೀಕರಿಸಿ\n\n` +
        `⚠️ ಇದು ಪ್ರದರ್ಶನ ಅಕ್ಷೇಪ ವ್ಯವಸ್ಥೆ. ಯಾವುದೇ ಬಾಹ್ಯ ಅಧಿಕಾರಿಗಳಿಗೆ ತಿಳಿಸಲಾಗುವುದಿಲ್ಲ.`
      : `**Report a Payment or Process Concern:**\n\n` +
        `If you experience an unclear fee request, missing receipt, unexplained delay, or concern about an unofficial payment demand:\n\n` +
        `1. Visit the **Report a Process Concern** page (under "More" in navigation)\n` +
        `2. Select the concern type and describe it clearly\n` +
        `3. Optionally provide your related application token\n` +
        `4. You will receive a unique **BHUC-** concern reference token\n` +
        `5. Track your concern using that token\n\n` +
        `⚠️ This is a demonstration concern-tracking system. In a real implementation, concerns would be reviewed by a designated team. This prototype does not notify any external authority.`
  }

  // Term glossary
  if (intent === 'explain_term') {
    for (const [term, def] of Object.entries(TERM_GLOSSARY)) {
      if (message.toLowerCase().includes(term)) {
        return lang === 'kn' ? def.kn : def.en
      }
    }
    return lang === 'kn'
      ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಸ್ಪಷ್ಟಪಡಿಸಿ. ಉದಾ: RTC, ಪಟ್ಟ, ಖಾತ, ಮ್ಯುಟೇಶನ್, ಅಡಮಾನ ಪ್ರಮಾಣಪತ್ರ, ಸರ್ವೆ ನಂಬರ್, ಅಡಮಾನ, ಲಿಯನ್, ಪರಿವರ್ತನೆ, ಬೆಟರ್‌ಮೆಂಟ್.'
      : 'Please specify which term you need explained. Common terms include: RTC, Patta, Khata, Mutation, Encumbrance Certificate, Mortgage, Lien, DC Conversion, Betterment Charges, Survey Number.'
  }

  switch (intent) {
    case 'greeting':
      return lang === 'kn'
        ? 'ನಮಸ್ಕಾರ! ಭೂ-ಟ್ರೇಸ್‌ಗೆ ಸ್ವಾಗತ. ಭೂ ದಾಖಲೆ ಹುಡುಕುವುದು, ಅರ್ಜಿ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು, ಹೊಣೆಗಾರಿಕೆ ಪರಿಶೀಲನೆ, ಎ-ಖಾತ ಸಿದ್ಧತೆ, ಕಾನೂನು ಮೇಲ್ಮನವಿ ರಚಿಸುವುದು ಅಥವಾ ದಾಖಲೆ ಪಟ್ಟಿ ಪಡೆಯಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.'
        : 'Namaskara! Welcome to Bhu-Trace. I can help you:\n• Search land records\n• Track your application\n• Check encumbrance & legal risk\n• Assess A-Khata readiness\n• Generate a printable legal appeal\n• Understand discrepancy alerts\n• Find required documents\n\nWhat would you like to do today?'
    case 'search_records':
      return lang === 'kn'
        ? 'ಭೂ ದಾಖಲೆ ಹುಡುಕಲು:\n1. ಮೆನುವಿನಿಂದ "ಭೂ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ" ಕ್ಲಿಕ್ ಮಾಡಿ\n2. ಸರ್ವೆ ನಂಬರ್, ಮಾಲೀಕರ ಹೆಸರು, ಗ್ರಾಮ, ತಾಲೂಕ್ ಅಥವಾ ಜಿಲ್ಲೆ ನಮೂದಿಸಿ\n3. ಡೆಮೋಗಾಗಿ: ಸರ್ವೆ ನಂಬರ್ 42/3 ಅಥವಾ ಗ್ರಾಮ Kengeri ಪ್ರಯತ್ನಿಸಿ'
        : 'To search land records:\n1. Click **Search Land Records** in the navigation\n2. Enter a survey number, owner name, village, taluk, or district\n3. For the demo, try survey number **42/3** or village **Kengeri**\n\nOnce you open a property, you can check its encumbrance status, ownership timeline, and discrepancy alerts.'
    case 'checklist_docs':
      return lang === 'kn'
        ? 'ದಾಖಲೆ ಪಟ್ಟಿ ಪಡೆಯಲು:\n1. "ದಾಖಲೆ ಪಟ್ಟಿ" ಪುಟಕ್ಕೆ ಹೋಗಿ\n2. ಸೇವಾ ವಿಧ ಆಯ್ಕೆ ಮಾಡಿ (ಉದಾ: ಮ್ಯುಟೇಶನ್, ನೋಂದಣಿ, ಉತ್ತರಾಧಿಕಾರ)\n3. ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ\n4. ಅನುಗುಣ ಪಟ್ಟಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರಚಿಸಲಾಗುತ್ತದೆ.'
        : 'To get a document checklist:\n1. Go to the **Document Checklist** page\n2. Select the service type (e.g. Mutation, Registration, Inheritance, Encumbrance verification)\n3. Choose your state and district\n4. A tailored checklist will be generated\n\nCommon documents for mutation include: RTC extract, registered sale deed, and identity proof of the new owner.'
    case 'discrepancy_explain':
      return lang === 'kn'
        ? 'ವ್ಯತ್ಯಾಸ ಎಚ್ಚರಿಕೆ ಎಂಬುದು ಭೂ ದಾಖಲೆಗಳಲ್ಲಿ ಸಂಭಾವ್ಯ ಅಸಂಗತತೆ ಪತ್ತೆ ಮಾಡಿದಾಗ ರಚಿಸಲಾಗುತ್ತದೆ.\n\nಎಚ್ಚರಿಕೆ ಅರ್ಥ: ಮತ್ತಷ್ಟು ಪರಿಶೀಲನೆ ಅಗತ್ಯ — ವ್ಯಕ್ತಿ ಮೋಸ ಮಾಡಿದ್ದಾರೆ ಎಂಬ ನಿರ್ಧಾರ ಅಲ್ಲ. ಯಾವಾಗಲೂ ಸಂಬಂಧಿತ ರೆವಿನ್ಯೂ ಕಚೇರಿಯ ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ ಅಗತ್ಯ.'
        : 'A **discrepancy alert** is generated when the system detects a potential inconsistency in land records — such as:\n• Area recorded differently in two documents\n• An ownership change without a supporting document reference\n• Multiple rapid changes to the same record\n\n⚠️ **Important:** An alert means verification is recommended — it does not mean fraud has occurred. All alerts require human review by a qualified revenue officer. Visit the **Discrepancy Detection** page to explore the sample alerts.'
    case 'submit_request':
      return lang === 'kn'
        ? 'ಸರಿಪಡಿಕೆ ಅಥವಾ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಲು:\n1. "ವರದಿ / ಸಲ್ಲಿಸಿ" ಪುಟಕ್ಕೆ ಹೋಗಿ\n2. ಕೋರಿಕೆ ವಿಧ ಆಯ್ಕೆ ಮಾಡಿ\n3. ಆಸ್ತಿ ಮಾಹಿತಿ ಮತ್ತು ಸಮಸ್ಯೆ ವಿವರಣೆ ನೀಡಿ\n4. ಸಲ್ಲಿಸಿದ ನಂತರ BHUT- ಪ್ರಾರಂಭದ ಟ್ರ್ಯಾಕಿಂಗ್ ಟೋಕನ್ ಸ್ವೀಕರಿಸುತ್ತೀರಿ'
        : 'To submit a correction request or appeal:\n1. Go to **Report / Submit** in the navigation\n2. Select the request type (correction, mutation issue, appeal, etc.)\n3. Provide property details and describe the issue\n4. After submission, you will receive a **BHUT-2026-XXXXXX** tracking token\n\nFrom the tracking page, you can also generate a **Printable Legal Appeal** document for your request.'
    case 'ownership_history':
      return lang === 'kn'
        ? 'ಮಾಲೀಕತ್ವ ಇತಿಹಾಸ ನೋಡಲು:\n1. ಭೂ ದಾಖಲೆ ಹುಡುಕಿ ಆಸ್ತಿ ಆಯ್ಕೆ ಮಾಡಿ\n2. ಆಸ್ತಿ ವಿವರ ಪುಟದಲ್ಲಿ "ಮಾಲೀಕತ್ವ ಕಾಲರೇಖೆ" ವಿಭಾಗ ನೋಡಿ\n\nಗಮನ: ಕಾಲರೇಖೆ ನೋಂದಾಯಿತ ಬದಲಾವಣೆಗಳನ್ನು ತೋರಿಸುತ್ತದೆ — ಕಾನೂನು ಮಾಲೀಕತ್ವ ನಿರ್ಧರಿಸುವುದಿಲ್ಲ.'
        : 'To view ownership history:\n1. Search for the property using the **Search Land Records** page\n2. Open the property details\n3. Click the **Ownership Timeline** tab\n\n**Note:** The timeline shows recorded changes in the dataset and does not conclusively determine legal ownership. For official records, contact the relevant Tahsildar\'s office.'
    case 'general_land':
      return lang === 'kn'
        ? 'ಭೂ-ಟ್ರೇಸ್ ಈ ಕೆಳಗಿನ ಸೇವೆಗಳನ್ನು ನೀಡುತ್ತದೆ:\n• ಭೂ ದಾಖಲೆ ಹುಡುಕಿ\n• ಮಾಲೀಕತ್ವ ಇತಿಹಾಸ ನೋಡಿ\n• ಹೊಣೆಗಾರಿಕೆ ಮತ್ತು ಅಪಾಯ ಪರಿಶೀಲಿಸಿ\n• ಎ-ಖಾತ ಸಿದ್ಧತೆ ಪರಿಶೀಲಿಸಿ\n• ವ್ಯತ್ಯಾಸ ಪರಿಶೀಲಿಸಿ\n• ದಾಖಲೆ ಪಟ್ಟಿ ಪಡೆಯಿರಿ\n• ಸರಿಪಡಿಕೆ ಸಲ್ಲಿಸಿ\n• ಅರ್ಜಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ\n• ಕಾನೂನು ಮೇಲ್ಮನವಿ ರಚಿಸಿ'
        : 'Bhu-Trace provides:\n• **Search** land records by survey number, owner, or location\n• **View** ownership histories with chronological timelines\n• **Check** encumbrance & legal risk for any property\n• **Assess** A-Khata readiness with a 4-question diagnostic\n• **Detect** discrepancies in land records\n• **Generate** document checklists for 12 services\n• **Submit** correction requests or appeals\n• **Track** your application with a unique token\n• **Generate** printable legal appeal documents\n\nFor specific help, ask me about any of these features!'
    default:
      return lang === 'kn'
        ? 'ನಾನು ಭೂ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ — ಭೂ ದಾಖಲೆ ಹುಡುಕುವುದು, ಹೊಣೆಗಾರಿಕೆ ಪರಿಶೀಲನೆ, ಎ-ಖಾತ, ಅರ್ಜಿ ಟ್ರ್ಯಾಕಿಂಗ್, ದಾಖಲೆ ಪಟ್ಟಿ, ಅಥವಾ ವ್ಯತ್ಯಾಸ ವಿವರಣೆ. ಹೆಚ್ಚು ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ ಕೇಳಿ.\n\n⚠️ ಭೂ-ಅಸಿಸ್ಟ್ ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಮಾತ್ರ ನೀಡುತ್ತದೆ — ಕಾನೂನು ಸಲಹೆ ಅಲ್ಲ.'
        : 'I can help with land record searches, encumbrance & risk checks, A-Khata readiness, application tracking, document checklists, discrepancy explanations, legal appeal generation, and common land-record terminology. Could you be more specific about what you need?\n\n⚠️ Bhu-Assist provides general information only — not formal legal advice. For official guidance, contact the relevant revenue office or a qualified legal professional.'
  }
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  lang: 'en' | 'kn' = 'en'
): Promise<ChatMessage> {
  const id = `msg-${Date.now()}`
  const timestamp = new Date().toISOString()

  // Simulate a small delay for realism
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400))

  const content = generateMockResponse(message, lang)
  return {
    id,
    role: 'assistant',
    content,
    timestamp,
    isMock: true
  }
}
