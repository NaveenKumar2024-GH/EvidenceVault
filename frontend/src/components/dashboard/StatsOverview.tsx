import React from 'react'
import type { SystemStats } from '../../api/types'
import { Database, Clock, ShieldCheck, ShieldAlert, Activity } from '../icons'

interface StatsOverviewProps {
  stats: SystemStats
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Evidence',
      value: stats.total,
      subtitle: 'Tracked digital assets',
      icon: <Database size={22} />,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.12)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
    },
    {
      title: 'Registered Evidence',
      value: stats.registered,
      subtitle: 'Awaiting re-verification',
      icon: <Clock size={22} />,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    {
      title: 'Verified Evidence',
      value: stats.verified,
      subtitle: 'Cryptographically intact',
      icon: <ShieldCheck size={22} />,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    {
      title: 'Compromised Evidence',
      value: stats.compromised,
      subtitle: stats.compromised > 0 ? 'Hash mismatch detected!' : 'Zero tampering detected',
      icon: <ShieldAlert size={22} />,
      color: '#ef4444',
      bgGlow: stats.compromised > 0 ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.08)',
      borderColor: stats.compromised > 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.2)',
      alert: stats.compromised > 0,
    },
  ]

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* 4 Primary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="cyber-card"
            style={{
              padding: '20px 22px',
              border: `1px solid ${card.borderColor}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {card.alert && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 10px #ef4444',
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {card.title}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: card.bgGlow,
                  color: card.color,
                  border: `1px solid ${card.borderColor}`,
                }}
              >
                {card.icon}
              </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.02em',
                }}
              >
                {card.value}
              </span>
            </div>

            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: card.alert ? '#f87171' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: card.alert ? 600 : 400,
              }}
            >
              {card.alert && <Activity size={12} />}
              <span>{card.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
