import React, { useEffect, useState } from 'react'
import type { AuditLog, CustodyEvent } from '../../api/types'
import { getAuditLogs, getCustodyHistory } from '../../api/client'
import { Clock, User, Shield, RefreshCw, AlertTriangle } from '../icons'

interface ChainOfCustodyTimelineProps {
  evidenceId: string
}

type TimelineEvent =
  | { kind: 'custody'; data: CustodyEvent }
  | { kind: 'audit'; data: AuditLog }

export const ChainOfCustodyTimeline: React.FC<ChainOfCustodyTimelineProps> = ({
  evidenceId,
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchTimeline() {
      setLoading(true)
      setError(null)

      try {
        const [custodyResult, auditResult] = await Promise.all([
          getCustodyHistory(evidenceId).catch(() => null),
          getAuditLogs(evidenceId).catch(() => null),
        ])

        if (!isMounted) return

        const combined: TimelineEvent[] = []

        if (custodyResult?.custody_events) {
          custodyResult.custody_events.forEach((event) => {
            combined.push({
              kind: 'custody',
              data: event,
            })
          })
        }

        if (auditResult?.audit_logs) {
          auditResult.audit_logs.forEach((event) => {
            combined.push({
              kind: 'audit',
              data: event,
            })
          })
        }

        combined.sort((a, b) => {
          return (
            new Date(a.data.timestamp).getTime() -
            new Date(b.data.timestamp).getTime()
          )
        })

        setEvents(combined)

        if (combined.length === 0) {
          setError('No forensic audit events found for this artifact.')
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Failed to load forensic audit trail'

          setError(msg)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (evidenceId) {
      fetchTimeline()
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
        <span style={{ fontSize: '13px' }}>
          Querying cryptographic audit trail...
        </span>
      </div>
    )
  }

  if (error && events.length === 0) {
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
          <div style={{ fontWeight: 600 }}>Forensic Audit Trail Unavailable</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '28px', margin: '8px 0' }}>
      {/* Continuous vertical timeline track */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          background:
            'linear-gradient(to bottom, #06b6d4, #10b981, rgba(255, 255, 255, 0.1))',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {events.map((evt, idx) => {
          const isAudit = evt.kind === 'audit'

          const action = evt.data.action.replace(/_/g, ' ')

          const isCompromised =
            isAudit &&
            'details' in evt.data &&
            evt.data.details?.toLowerCase().includes('compromised')

          return (
            <div
              key={`${evt.kind}-${evt.data.id}-${idx}`}
              style={{
                position: 'relative',
                background: 'rgba(15, 23, 42, 0.55)',
                border: isCompromised
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '16px 18px',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Timeline node */}
              <div
                style={{
                  position: 'absolute',
                  left: '-28px',
                  top: '18px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0a0f1d',
                  border: `2px solid ${
                    isCompromised ? '#ef4444' : '#06b6d4'
                  }`,
                  boxShadow: `0 0 10px ${
                    isCompromised
                      ? 'rgba(239, 68, 68, 0.4)'
                      : 'rgba(6, 182, 212, 0.4)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompromised ? '#ef4444' : '#06b6d4',
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
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: isCompromised
                        ? 'rgba(239, 68, 68, 0.15)'
                        : isAudit
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(6, 182, 212, 0.15)',
                      color: isCompromised
                        ? '#f87171'
                        : isAudit
                          ? '#c4b5fd'
                          : '#22d3ee',
                      border: `1px solid ${
                        isCompromised
                          ? 'rgba(239, 68, 68, 0.3)'
                          : isAudit
                            ? 'rgba(139, 92, 246, 0.3)'
                            : 'rgba(6, 182, 212, 0.3)'
                      }`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {action}
                  </span>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-dim)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {isAudit ? 'SYSTEM AUDIT' : 'CUSTODY'}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Entry #{evt.data.id}
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
                  <span>{formatDate(evt.data.timestamp)}</span>
                </div>
              </div>

              {/* Examiner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#e2e8f0',
                  marginBottom: isAudit ? '8px' : '0',
                }}
              >
                <User size={14} color="var(--text-dim)" />
                <span style={{ color: 'var(--text-dim)' }}>
                  Authorized Examiner:
                </span>
                <strong
                  style={{
                    fontWeight: 600,
                    color: '#38bdf8',
                  }}
                >
                  {evt.data.performed_by}
                </strong>
              </div>

              {/* IP address for system audit events */}
              {isAudit && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ color: 'var(--text-dim)' }}>
                    Source IP:
                  </span>

                  <span
                    className="font-mono"
                    style={{
                      color: '#a78bfa',
                      background: 'rgba(139, 92, 246, 0.08)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                    }}
                  >
                    {evt.data.ip_address}
                  </span>
                </div>
              )}

              {/* Audit details / custody notes */}
              {isAudit ? (
                evt.data.details && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: isCompromised ? '#fca5a5' : 'var(--text-muted)',
                      background: isCompromised
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'rgba(0, 0, 0, 0.25)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${
                        isCompromised
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(255, 255, 255, 0.04)'
                      }`,
                      lineHeight: 1.5,
                    }}
                  >
                    {evt.data.details}
                  </div>
                )
              ) : (
                evt.data.notes && (
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
                    {evt.data.notes}
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}