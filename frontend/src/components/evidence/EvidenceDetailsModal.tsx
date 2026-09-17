import React, { useState } from 'react'
import type { EvidenceRecord, VerifyResponse } from '../../api/types'
import { verifyEvidence } from '../../api/client'
import { Modal } from '../common/Modal'
import { Badge } from '../common/Badge'
import { CopyButton } from '../common/CopyButton'
import { Button } from '../common/Button'
import { ChainOfCustodyTimeline } from './ChainOfCustodyTimeline'
import {
  FileText,
  Hash,
  Clock,
  User,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Layers,
} from '../icons'

interface EvidenceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  evidence: EvidenceRecord | null
  onVerifySuccess: (result: VerifyResponse) => void
}

export const EvidenceDetailsModal: React.FC<EvidenceDetailsModalProps> = ({
  isOpen,
  onClose,
  evidence,
  onVerifySuccess,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'metadata' | 'custody'>('metadata')

  if (!evidence) return null

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const res = await verifyEvidence(evidence.evidence_id)
      onVerifySuccess(res)
    } catch (err) {
      console.error('Verification failed:', err)
      alert(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evidence Dossier & Custody Record"
      subtitle={`Artifact: ${evidence.filename}`}
      icon={<FileText size={20} />}
      maxWidth="lg"
    >
      <div>
        {/* Top Header Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                }}
              >
                {evidence.evidence_id}
              </span>
              <CopyButton text={evidence.evidence_id} label="Copy ID" />
              <Badge status={evidence.status} size="md" />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Forensic Type: <strong style={{ color: '#e2e8f0' }}>{evidence.evidence_type}</strong> • Size:{' '}
              <strong style={{ color: '#e2e8f0' }}>{formatFileSize(evidence.file_size)}</strong>
            </div>
          </div>

          <Button
            variant="verify"
            onClick={handleVerify}
            isLoading={isVerifying}
            icon={evidence.status === 'COMPROMISED' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
          >
            <span>Verify Integrity Now</span>
          </Button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            paddingBottom: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('metadata')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'metadata' ? '2px solid #06b6d4' : '2px solid transparent',
              color: activeTab === 'metadata' ? '#06b6d4' : 'var(--text-muted)',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <FileText size={16} />
            <span>Forensic Metadata</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custody')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'custody' ? '2px solid #06b6d4' : '2px solid transparent',
              color: activeTab === 'custody' ? '#06b6d4' : 'var(--text-muted)',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={16} />
            <span>Chain of Custody History</span>
          </button>
        </div>

        {/* Tab 1: Metadata Grid */}
        {activeTab === 'metadata' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* SHA-256 Fingerprint Box */}
            <div
              style={{
                background: 'rgba(10, 15, 29, 0.95)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '10px',
                padding: '16px 18px',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                  <Hash size={16} />
                  <span>SHA-256 Cryptographic Fingerprint</span>
                </div>
                <CopyButton text={evidence.file_hash} label="Copy Full Hash" />
              </div>
              <div
                className="font-mono"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#e2e8f0',
                  wordBreak: 'break-all',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  letterSpacing: '0.04em',
                }}
              >
                {evidence.file_hash}
              </div>
            </div>

            {/* Metadata Fields Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Filename */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  <FileText size={13} />
                  <span>File Name</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginTop: '6px', wordBreak: 'break-all' }}>
                  {evidence.filename}
                </div>
              </div>

              {/* Evidence Type */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  <HardDrive size={13} />
                  <span>Evidence Type</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginTop: '6px' }}>
                  {evidence.evidence_type}
                </div>
              </div>

              {/* Uploaded By */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  <User size={13} />
                  <span>Custodian / Examiner</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8', marginTop: '6px' }}>
                  {evidence.uploaded_by}
                </div>
              </div>

              {/* Uploaded At */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  <Clock size={13} />
                  <span>Ingestion Timestamp</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc', marginTop: '6px' }}>
                  {formatTimestamp(evidence.uploaded_at)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Chain of Custody */}
        {activeTab === 'custody' && (
          <div>
            <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Cryptographic audit log fetched directly from <code style={{ color: '#22d3ee' }}>/evidence/{evidence.evidence_id}/custody</code>:
            </div>
            <ChainOfCustodyTimeline evidenceId={evidence.evidence_id} />
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
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
            Close Dossier
          </button>
        </div>
      </div>
    </Modal>
  )
}
