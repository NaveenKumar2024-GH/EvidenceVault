import React from 'react'
import type { VerifyResponse } from '../../api/types'
import { Modal } from '../common/Modal'
import { Badge } from '../common/Badge'
import { CopyButton } from '../common/CopyButton'
import { ShieldCheck, ShieldAlert, Hash } from '../icons'

interface VerifyResultModalProps {
  isOpen: boolean
  onClose: () => void
  result: VerifyResponse | null
}

export const VerifyResultModal: React.FC<VerifyResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!result) return null

  const isVerified = result.status === 'VERIFIED'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cryptographic Integrity Audit Report"
      subtitle={`Artifact ID: ${result.evidence_id}`}
      icon={isVerified ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
      maxWidth="lg"
    >
      <div>
        {/* Status Highlight Banner */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '12px',
            background: isVerified
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)',
            border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.5)'}`,
            boxShadow: isVerified ? '0 0 25px rgba(16, 185, 129, 0.2)' : '0 0 25px rgba(239, 68, 68, 0.25)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)',
                color: isVerified ? '#34d399' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.5)'}`,
              }}
            >
              {isVerified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isVerified ? '#34d399' : '#f87171',
                }}
              >
                {result.message}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isVerified
                  ? 'SHA-256 re-verification passed — current file hash matches the registered fingerprint.'
                  : 'SHA-256 mismatch detected — the file has been altered since it was registered.'}
              </div>
            </div>
          </div>

          <Badge status={result.status} size="md" />
        </div>

        {/* SHA-256 Comparison Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {/* Original Stored Hash */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid var(--border-medium)',
              borderRadius: '10px',
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                <Hash size={16} color="#06b6d4" />
                <span>Original Registered SHA-256 Fingerprint</span>
              </div>
              <CopyButton text={result.original_sha256} label="Copy Hash" />
            </div>
            <div
              className="font-mono"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#38bdf8',
                wordBreak: 'break-all',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {result.original_sha256}
            </div>
          </div>

          {/* Current Recalculated Hash */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
              borderRadius: '10px',
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                <Hash size={16} color={isVerified ? '#10b981' : '#ef4444'} />
                <span>Current Re-calculated SHA-256 Fingerprint</span>
              </div>
              <CopyButton text={result.current_sha256} label="Copy Hash" />
            </div>
            <div
              className="font-mono"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                color: isVerified ? '#34d399' : '#f87171',
                wordBreak: 'break-all',
                border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              }}
            >
              {result.current_sha256}
            </div>
          </div>
        </div>

        {/* Audit Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Status updated in backend database: <strong style={{ color: 'var(--text-muted)' }}>{result.status}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 20px' }}
          >
            Close Report
          </button>
        </div>
      </div>
    </Modal>
  )
}
