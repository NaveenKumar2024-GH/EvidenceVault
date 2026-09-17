import React from 'react'
import type { EvidenceRecord } from '../../api/types'
import { Modal } from '../common/Modal'
import { Badge } from '../common/Badge'
import { CopyButton } from '../common/CopyButton'
import { ChainOfCustodyTimeline } from './ChainOfCustodyTimeline'
import { Layers } from '../icons'

interface CustodyHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  evidence: EvidenceRecord | null
}

export const CustodyHistoryModal: React.FC<CustodyHistoryModalProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  if (!evidence) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chain of Custody Audit Trail"
      subtitle={`Tamper-evident log for ${evidence.filename}`}
      icon={<Layers size={20} />}
      maxWidth="lg"
    >
      <div>
        {/* Evidence Summary Header */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className="font-mono"
              style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}
            >
              {evidence.evidence_id}
            </span>
            <CopyButton text={evidence.evidence_id} label="Copy ID" />
            <Badge status={evidence.status} size="sm" />
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Custodian: <strong style={{ color: '#ffffff' }}>{evidence.uploaded_by}</strong>
          </div>
        </div>

        {/* Timeline */}
        <ChainOfCustodyTimeline evidenceId={evidence.evidence_id} />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 20px' }}
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </Modal>
  )
}
