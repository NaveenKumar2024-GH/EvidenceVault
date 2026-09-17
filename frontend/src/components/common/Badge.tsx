import React from 'react'
import type { EvidenceStatus } from '../../api/types'
import { ShieldCheck, ShieldAlert, Clock } from '../icons'

interface BadgeProps {
  status: EvidenceStatus | string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({ status, showIcon = true, size = 'md' }) => {
  const normalized = status.toUpperCase()

  const getStyleClass = () => {
    switch (normalized) {
      case 'VERIFIED':
        return 'badge-verified'
      case 'COMPROMISED':
        return 'badge-compromised'
      case 'REGISTERED':
      default:
        return 'badge-registered'
    }
  }

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14
    switch (normalized) {
      case 'VERIFIED':
        return <ShieldCheck size={iconSize} />
      case 'COMPROMISED':
        return <ShieldAlert size={iconSize} />
      case 'REGISTERED':
      default:
        return <Clock size={iconSize} />
    }
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? '11px' : '12px'

  return (
    <span
      className={getStyleClass()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        transition: 'all 0.2s ease',
      }}
    >
      {showIcon && getIcon()}
      <span>{normalized}</span>
    </span>
  )
}
