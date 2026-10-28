import { useTranslation } from 'react-i18next'
import type { VerificationStatus, Severity, RequestStatus } from '@/types'

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { t } = useTranslation()
  const styles: Record<VerificationStatus, string> = {
    verified: 'bg-green-100 text-green-800 border border-green-200',
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    discrepancy: 'bg-red-100 text-red-800 border border-red-200',
    disputed: 'bg-purple-100 text-purple-800 border border-purple-200',
  }
  const labels: Record<VerificationStatus, string> = {
    verified: t('common.verified'), pending: t('common.pending'),
    discrepancy: t('common.discrepancy'), disputed: t('common.disputed'),
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation()
  const styles: Record<Severity, string> = {
    low: 'bg-blue-100 text-blue-800 border border-blue-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    high: 'bg-orange-100 text-orange-800 border border-orange-200',
    critical: 'bg-red-100 text-red-800 border border-red-200',
  }
  const labels: Record<Severity, string> = { low: t('common.low'), medium: t('common.medium'), high: t('common.high'), critical: t('common.critical') }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[severity]}`}>{labels[severity]}</span>
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { t } = useTranslation()
  const styles: Record<RequestStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 border border-blue-200',
    preliminary: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    documents: 'bg-amber-100 text-amber-800 border border-amber-200',
    verification: 'bg-purple-100 text-purple-800 border border-purple-200',
    forwarded: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    awaiting: 'bg-orange-100 text-orange-800 border border-orange-200',
    resolved: 'bg-green-100 text-green-800 border border-green-200',
    rejected: 'bg-red-100 text-red-800 border border-red-200',
    closed: 'bg-gray-100 text-gray-800 border border-gray-200',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{t(`track.status.${status}`)}</span>
}

