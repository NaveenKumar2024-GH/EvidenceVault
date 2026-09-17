import React, { useState, useMemo } from 'react'
import type { EvidenceRecord, EvidenceStatus, VerifyResponse } from '../../api/types'
import { Badge } from '../common/Badge'
import { CopyButton } from '../common/CopyButton'
import { verifyEvidence } from '../../api/client'
import {
  Search,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Layers,
  RefreshCw,
  FileText,
  Clock,
} from '../icons'

interface EvidenceTableProps {
  records: EvidenceRecord[]
  isLoading: boolean
  onSelectEvidence: (evidence: EvidenceRecord) => void
  onViewCustody: (evidence: EvidenceRecord) => void
  onVerifyResult: (result: VerifyResponse) => void
  onRefresh: () => void
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  records,
  isLoading,
  onSelectEvidence,
  onViewCustody,
  onVerifyResult,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | EvidenceStatus>('ALL')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  // Handle Quick Verify from row
  const handleQuickVerify = async (e: React.MouseEvent, evidenceId: string) => {
    e.stopPropagation()
    setVerifyingId(evidenceId)
    try {
      const res = await verifyEvidence(evidenceId)
      onVerifyResult(res)
    } catch (err) {
      console.error('Verification error:', err)
      alert(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setVerifyingId(null)
    }
  }

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesStatus =
        statusFilter === 'ALL' || rec.status.toUpperCase() === statusFilter

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        rec.evidence_id.toLowerCase().includes(q) ||
        rec.filename.toLowerCase().includes(q) ||
        rec.uploaded_by.toLowerCase().includes(q) ||
        rec.evidence_type.toLowerCase().includes(q) ||
        rec.file_hash.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [records, statusFilter, searchQuery])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const truncateHash = (hash: string) => {
    if (!hash || hash.length <= 16) return hash
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  return (
    <div className="cyber-card" style={{ padding: '24px', overflow: 'hidden' }}>
      {/* Table Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>Evidence Ledger & Audit Log</span>
            <span
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {filteredRecords.length} of {records.length} records
            </span>
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
            Live cryptographic registry verified against physical forensic storage
          </p>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex',
              }}
            >
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search filename, ID, examiner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cyber-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>

          {/* Status Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(10, 15, 29, 0.9)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            {(['ALL', 'REGISTERED', 'VERIFIED', 'COMPROMISED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: statusFilter === st ? '#22d3ee' : 'var(--text-muted)',
                  border: statusFilter === st ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="cyber-table-container">
        <table className="cyber-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Evidence ID</th>
              <th>Artifact / Filename</th>
              <th style={{ width: '110px' }}>Type</th>
              <th>SHA-256 Cryptographic Hash</th>
              <th style={{ width: '90px' }}>Size</th>
              <th>Custodian</th>
              <th style={{ width: '130px' }}>Registered</th>
              <th style={{ width: '120px' }}>Integrity</th>
              <th style={{ textAlign: 'right', width: '180px' }}>Audit Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && records.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <RefreshCw size={24} className="animate-spin" color="#06b6d4" />
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      Synchronizing with EvidenceVault API...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FileText size={32} color="var(--text-dim)" />
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      No matching evidence records found
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                      {searchQuery ? 'Try adjusting your search criteria' : 'Register your first piece of evidence above'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((item) => {
                const isItemVerifying = verifyingId === item.evidence_id
                return (
                  <tr
                    key={item.evidence_id}
                    onClick={() => onSelectEvidence(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* ID */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#38bdf8',
                          }}
                        >
                          {item.evidence_id}
                        </span>
                        <CopyButton text={item.evidence_id} title="Copy Evidence ID" />
                      </div>
                    </td>

                    {/* Filename */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {item.filename}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          padding: '2px 8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        {item.evidence_type}
                      </span>
                    </td>

                    {/* Hash */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="font-mono"
                          title={item.file_hash}
                          style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {truncateHash(item.file_hash)}
                        </span>
                        <CopyButton text={item.file_hash} title="Copy SHA-256 Hash" />
                      </div>
                    </td>

                    {/* Size */}
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {formatFileSize(item.file_size)}
                      </span>
                    </td>

                    {/* Custodian */}
                    <td>
                      <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>
                        {item.uploaded_by}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-dim)' }}>
                        <Clock size={12} />
                        <span>{formatTimestamp(item.uploaded_at)}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <Badge status={item.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Verify Button */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickVerify(e, item.evidence_id)}
                          disabled={isItemVerifying}
                          className="btn btn-verify btn-sm"
                          title="Verify cryptographic integrity against current file"
                        >
                          {isItemVerifying ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : item.status === 'COMPROMISED' ? (
                            <ShieldAlert size={12} />
                          ) : (
                            <ShieldCheck size={12} />
                          )}
                          <span>Verify</span>
                        </button>

                        {/* Chain of Custody */}
                        <button
                          type="button"
                          onClick={() => onViewCustody(item)}
                          className="btn btn-secondary btn-sm"
                          title="Inspect Chain of Custody"
                        >
                          <Layers size={12} />
                          <span>Custody</span>
                        </button>

                        {/* Details */}
                        <button
                          type="button"
                          onClick={() => onSelectEvidence(item)}
                          className="btn btn-secondary btn-sm"
                          title="Open Evidence Dossier"
                          style={{ padding: '5px 8px' }}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with quick refresh */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          fontSize: '12px',
          color: 'var(--text-dim)',
        }}
      >
        <div>
          Showing {filteredRecords.length} records • Click any row for complete forensic dossier
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Sync Vault</span>
        </button>
      </div>
    </div>
  )
}
