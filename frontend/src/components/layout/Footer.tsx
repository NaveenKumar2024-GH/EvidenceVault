import React from 'react'
import { Lock, Shield, Hash } from '../icons'

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.95)',
        padding: '24px 28px',
        fontSize: '12px',
        color: 'var(--text-dim)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Lock size={14} color="#06b6d4" />
            <span>SHA-256 Integrity Verification</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Shield size={14} color="#10b981" />
            <span>Tamper-Evident Chain of Custody Log</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Hash size={14} color="#f59e0b" />
            <span>ISO 8601 Evidence Timestamping</span>
          </div>
        </div>

        <div>
          <span>EvidenceVault Forensics System • v1.0</span>
        </div>
      </div>
    </footer>
  )
}
