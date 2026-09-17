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
            <span>FIPS 180-4 SHA-256 Cryptographic Integrity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Shield size={14} color="#10b981" />
            <span>Immutable Chain of Custody Audit Trail</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Hash size={14} color="#f59e0b" />
            <span>RFC 3161 Evidence Timestamping</span>
          </div>
        </div>

        <div>
          <span>EvidenceVault Forensics System • Hackathon Edition</span>
        </div>
      </div>
    </footer>
  )
}
