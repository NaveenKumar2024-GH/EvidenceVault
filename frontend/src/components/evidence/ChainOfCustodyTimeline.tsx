import React, { useEffect, useState } from 'react'
import type { CustodyEvent } from '../../api/types'
import { getCustodyHistory } from '../../api/client'
import { Clock, User, Shield, RefreshCw, AlertTriangle } from '../icons'

interface ChainOfCustodyTimelineProps {
  evidenceId: string
}

export const ChainOfCustodyTimeline: React.FC<ChainOfCustodyTimelineProps> = ({ evidenceId }) => {
  const [events, setEvents] = useState<CustodyEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCustody() {
      setLoading(true)
      setError(null)
      try {
        const data = await getCustodyHistory(evidenceId)
        if (isMounted) {
          setEvents(data.custody_events || [])
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load chain of custody'
          setError(msg)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (evidenceId) {
      fetchCustody()
    }

    return () => {
      isMounted = false
    }
  }, [evidenceId])

  const formatDate = (isoString: string) => {
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

  if (loading) {
    return (
      <div
        style={{
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <RefreshCw size={24} className="animate-spin" color="#06b6d4" />
        <span style={{ fontSize: '13px' }}>Querying cryptographic audit trail...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#f87171',
          fontSize: '13px',
        }}
      >
        <AlertTriangle size={20} />
        <div>
          <div style={{ fontWeight: 600 }}>Custody Log Unavailable</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{error}</div>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '13px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '10px',
          border: '1px dashed var(--border-medium)',
        }}
      >
        No chain of custody events recorded for this artifact.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '28px', margin: '8px 0' }}>
      {/* Continuous vertical timeline track line */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          background: 'linear-gradient(to bottom, #06b6d4, #10b981, rgba(255, 255, 255, 0.1))',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {events.map((evt, idx) => (
          <div
            key={evt.id || idx}
            style={{
              position: 'relative',
              background: 'rgba(15, 23, 42, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '16px 18px',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Timeline node icon */}
            <div
              style={{
                position: 'absolute',
                left: '-28px',
                top: '18px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#0a0f1d',
                border: '2px solid #06b6d4',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
                fontSize: '10px',
              }}
            >
              <Shield size={12} />
            </div>

            {/* Event Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#22d3ee',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    textTransform: 'uppercase',
                  }}
                >
                  {evt.action.replace(/_/g, ' ')}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Entry #{evt.id}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <Clock size={13} />
                <span>{formatDate(evt.timestamp)}</span>
              </div>
            </div>

            {/* Custodian Performed By */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#e2e8f0',
                marginBottom: evt.notes ? '8px' : '0',
              }}
            >
              <User size={14} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-dim)' }}>Authorized Examiner:</span>
              <strong style={{ fontWeight: 600, color: '#38bdf8' }}>{evt.performed_by}</strong>
            </div>

            {/* Notes */}
            {evt.notes && (
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  lineHeight: 1.5,
                }}
              >
                {evt.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
