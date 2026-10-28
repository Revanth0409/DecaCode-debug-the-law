import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Circle, Download, Printer, Save, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { getChecklistForService } from '@/services/dataService'
import type { DocumentChecklistItem } from '@/types'
import { toast } from '@/hooks/use-toast'

const SERVICES = [
  { value: 'registration', labelKey: 'checklist.services.registration' },
  { value: 'mutation', labelKey: 'checklist.services.mutation' },
  { value: 'correction', labelKey: 'checklist.services.correction' },
  { value: 'inheritance', labelKey: 'checklist.services.inheritance' },
  { value: 'appeal', labelKey: 'checklist.services.appeal' },
]

const DISTRICTS = ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Tumakuru', 'Hassan', 'Shivamogga', 'Mangaluru', 'Ballari']
const REQ_COLORS: Record<string, string> = {
  required: 'bg-red-50 border-l-4 border-l-red-400',
  conditional: 'bg-amber-50 border-l-4 border-l-amber-400',
  optional: 'bg-blue-50 border-l-4 border-l-blue-400',
}
const REQ_LABELS: Record<string, string> = { required: 'Required', conditional: 'Conditional', optional: 'Optional' }

export default function DocumentChecklistPage() {
  const { t } = useTranslation()
  const [serviceType, setServiceType] = useState('')
  const [district, setDistrict] = useState('')
  const [locationType, setLocationType] = useState('urban')
  const [propertyType, setPropertyType] = useState('individual')
  const [generated, setGenerated] = useState(false)
  const [items, setItems] = useState<DocumentChecklistItem[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>({})
  const isKn = t('nav.home') === 'ಮುಖಪುಟ'

  function generateChecklist() {
    if (!serviceType) { toast({ title: 'Select a service type', variant: 'destructive' }); return }
    let items = getChecklistForService(serviceType)
    if (propertyType === 'inherited') items = getChecklistForService('inheritance').concat(items)
    setItems(items)
    setChecked(new Set())
    setGenerated(true)
    toast({ title: 'Checklist Generated', description: `${items.length} items for ${serviceType}` })
  }

  function toggleItem(id: string) {
    setChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function saveProgress() {
    const state = { serviceType, district, items: items.map(i => i.id), checked: Array.from(checked), notes }
    localStorage.setItem('bhu-trace-checklist', JSON.stringify(state))
    toast({ title: 'Checklist Saved', description: 'Progress saved to your browser.' })
  }

  function printChecklist() {
    window.print()
  }

  const progress = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0
  const requiredCount = items.filter(i => i.requirementType === 'required').length
  const requiredChecked = items.filter(i => i.requirementType === 'required' && checked.has(i.id)).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">{t('checklist.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('checklist.subtitle')}</p>
      </div>

      {/* Form */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checklist.selectService')} *</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger><SelectValue placeholder="Select service…" /></SelectTrigger>
                <SelectContent>
                  {SERVICES.map(s => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checklist.selectDistrict')}</label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger><SelectValue placeholder="Select district…" /></SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checklist.locationType')}</label>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">{t('checklist.urban')}</SelectItem>
                  <SelectItem value="rural">{t('checklist.rural')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t('checklist.propertyType')}</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">{t('checklist.individual')}</SelectItem>
                  <SelectItem value="inherited">{t('checklist.inherited')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateChecklist} className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />{t('checklist.generateChecklist')}
          </Button>
        </CardContent>
      </Card>

      {generated && items.length > 0 && (
        <>
          {/* Progress */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t('checklist.progress')}</span>
                <span className="text-sm text-gray-600">{checked.size}/{items.length} {t('checklist.documentsChecked')}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{progress}% complete</span>
                <span className="text-green-600 font-medium">{requiredChecked}/{requiredCount} required items available</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={saveProgress}><Save className="h-3.5 w-3.5 mr-1" />{t('common.save')}</Button>
            <Button variant="outline" size="sm" onClick={printChecklist}><Printer className="h-3.5 w-3.5 mr-1" />{t('common.print')}</Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            {t('checklist.disclaimer')}
          </div>

          {/* Checklist items */}
          <div className="space-y-3 no-print">
            {(['required', 'conditional', 'optional'] as const).map(reqType => {
              const typeItems = items.filter(i => i.requirementType === reqType)
              if (typeItems.length === 0) return null
              return (
                <div key={reqType}>
                  <h3 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${reqType === 'required' ? 'bg-red-500' : reqType === 'conditional' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                    {REQ_LABELS[reqType]} Documents ({typeItems.length})
                  </h3>
                  <div className="space-y-2">
                    {typeItems.map(item => (
                      <div key={item.id} className={`rounded-lg p-4 ${REQ_COLORS[item.requirementType]}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleItem(item.id)} className="mt-0.5 flex-shrink-0">
                            {checked.has(item.id)
                              ? <CheckCircle className="h-5 w-5 text-green-600" />
                              : <Circle className="h-5 w-5 text-gray-400" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-800">
                              {isKn ? item.documentNameKn : item.documentName}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {isKn ? item.descriptionKn : item.description}
                            </div>
                            {isKn && (
                              <div className="text-xs text-gray-500 mt-0.5 font-kannada">{item.documentNameKn}</div>
                            )}
                            <textarea
                              placeholder="Add notes…"
                              value={notes[item.id] || ''}
                              onChange={e => setNotes(n => ({ ...n, [item.id]: e.target.value }))}
                              className="mt-2 w-full text-xs border rounded px-2 py-1 text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                              rows={1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Print-only view */}
          <div className="hidden print-only mt-4">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-[#1e3a5f]">BHU-TRACE</div>
              <div className="text-sm">Document Checklist — {serviceType}</div>
              <div className="text-xs text-gray-500">Generated: {new Date().toLocaleDateString()}</div>
              {district && <div className="text-xs text-gray-500">District: {district}</div>}
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-2 text-sm border-b py-2">
                  <span className="w-4 h-4 border border-gray-400 rounded mt-0.5 inline-block flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.documentName}</div>
                    <div className="text-xs text-gray-600">{item.description}</div>
                    <div className="text-xs text-gray-400">[{item.requirementType}]</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-xs text-gray-500 border-t pt-3">
              Disclaimer: This checklist is for general guidance only. Requirements may vary. Verify with the relevant revenue or registration office. Bhu-Trace is a hackathon prototype — not an official government system.
            </div>
          </div>
        </>
      )}
    </div>
  )
}

