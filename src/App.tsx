import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Layout from '@/components/layout/Layout'
import LandingPage from '@/pages/LandingPage'
import LandRecordsPage from '@/pages/LandRecordsPage'
import PropertyDetailsPage from '@/pages/PropertyDetailsPage'
import DiscrepanciesPage from '@/pages/DiscrepanciesPage'
import DocumentChecklistPage from '@/pages/DocumentChecklistPage'
import SubmitRequestPage from '@/pages/SubmitRequestPage'
import TrackApplicationPage from '@/pages/TrackApplicationPage'
import OfficerDashboardPage from '@/pages/OfficerDashboardPage'
import AboutPage from '@/pages/AboutPage'
import EncumbrancePage from '@/pages/EncumbrancePage'
import AkhataAssessmentPage from '@/pages/AkhataAssessmentPage'
import TransparencyPage from '@/pages/TransparencyPage'
import ReportConcernPage from '@/pages/ReportConcernPage'
import LegalAppealPage from '@/pages/LegalAppealPage'
import ChatWidget from '@/components/chat/ChatWidget'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/land-records" element={<LandRecordsPage />} />
          <Route path="/land-records/:propertyId" element={<PropertyDetailsPage />} />
          <Route path="/land-records/:propertyId/encumbrance" element={<EncumbrancePage />} />
          <Route path="/discrepancies" element={<DiscrepanciesPage />} />
          <Route path="/document-checklist" element={<DocumentChecklistPage />} />
          <Route path="/submit-request" element={<SubmitRequestPage />} />
          <Route path="/track-application" element={<TrackApplicationPage />} />
          <Route path="/officer-dashboard" element={<OfficerDashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/akhata-assessment" element={<AkhataAssessmentPage />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/report-process-concern" element={<ReportConcernPage />} />
          <Route path="/legal-appeal/:token" element={<LegalAppealPage />} />
        </Route>
      </Routes>
      <ChatWidget />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
