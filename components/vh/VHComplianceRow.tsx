import { differenceInDays } from 'date-fns'
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff, Upload } from 'lucide-react'
import { VHBadge } from './VHBadge'
import type { ComplianceDoc, ComplianceStatus } from '@/types'

function getStatus(doc: ComplianceDoc): ComplianceStatus {
  if (!doc.expiry_date) return doc.status
  const days = differenceInDays(new Date(doc.expiry_date), new Date())
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring_soon'
  return 'valid'
}

const STATUS_ICON = {
  valid:          { Icon: ShieldCheck, color: 'text-[#2E5A40]' },
  expiring_soon:  { Icon: ShieldAlert, color: 'text-amber-500' },
  expired:        { Icon: ShieldX,     color: 'text-red-500' },
  missing:        { Icon: ShieldOff,   color: 'text-gray-400' },
}

const DOC_LABELS: Record<string, string> = {
  coi:     'Certificate of Insurance',
  license: 'Business License',
  w9:      'W-9 Form',
  bond:    'Surety Bond',
  other:   'Document',
}

interface VHComplianceRowProps {
  doc: ComplianceDoc
  onUpload?: (docId: string) => void
}

export function VHComplianceRow({ doc, onUpload }: VHComplianceRowProps) {
  const status = getStatus(doc)
  const { Icon, color } = STATUS_ICON[status]
  const daysLeft = doc.expiry_date
    ? differenceInDays(new Date(doc.expiry_date), new Date())
    : null

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#EDE6D8] last:border-0">
      <Icon className={`h-5 w-5 shrink-0 ${color}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E3829]">
          {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
        </p>
        <p className="text-xs text-gray-500 truncate">{doc.file_name}</p>
      </div>

      <div className="flex items-center gap-3">
        {daysLeft !== null && (
          <span className={`text-xs ${status === 'expired' ? 'text-red-500' : status === 'expiring_soon' ? 'text-amber-600' : 'text-gray-400'}`}>
            {status === 'expired'
              ? `Expired ${Math.abs(daysLeft)}d ago`
              : `${daysLeft}d left`}
          </span>
        )}
        <VHBadge variant={status} />
        {onUpload && (status === 'expired' || status === 'expiring_soon' || status === 'missing') && (
          <button
            onClick={() => onUpload(doc.id)}
            className="flex items-center gap-1 rounded border border-[#C4A35A] px-2 py-1 text-xs text-[#C4A35A] hover:bg-[#C4A35A]/10 transition-colors"
          >
            <Upload className="h-3 w-3" />
            Update
          </button>
        )}
      </div>
    </div>
  )
}
