import React from 'react'
import { Shield, RefreshCw, UploadCloud, Database } from '../icons'

interface HeaderProps {
  onUploadClick: () => void
  onRefreshClick: () => void
  isRefreshing: boolean
  isBackendConnected: boolean
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onRefreshClick,
  isRefreshing,
  isBackendConnected,
}) => {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 29, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '14px 28px',
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
        {/* Brand & Forensic Classification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(2, 132, 199, 0.1) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)',
              color: '#06b6d4',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                EvidenceVault
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  color: '#22d3ee',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  textTransform: 'uppercase',
                }}
              >
                v1.0 • Forensics Core
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Immutable Digital Evidence Management & Cryptographic Chain of Custody
              </span>
            </div>
          </div>
        </div>

        {/* System Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Backend Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: isBackendConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${isBackendConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
              fontSize: '12px',
              fontWeight: 500,
              color: isBackendConnected ? '#34d399' : '#f87171',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isBackendConnected ? '#10b981' : '#ef4444',
                boxShadow: isBackendConnected ? '0 0 10px #10b981' : '0 0 10px #ef4444',
              }}
            />
            <Database size={13} />
            <span>{isBackendConnected ? 'FastAPI 127.0.0.1:8000' : 'Backend Disconnected'}</span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefreshClick}
            disabled={isRefreshing}
            className="btn btn-secondary"
            title="Refresh evidence data"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span style={{ fontSize: '13px' }}>Sync</span>
          </button>

          {/* Upload CTA */}
          <button
            type="button"
            onClick={onUploadClick}
            className="btn btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <UploadCloud size={16} />
            <span>Register Evidence</span>
          </button>
        </div>
      </div>
    </header>
  )
}
