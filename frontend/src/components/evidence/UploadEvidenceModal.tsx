import React, { useState, useRef } from 'react'
import type { UploadResponse } from '../../api/types'
import { uploadEvidence } from '../../api/client'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { CopyButton } from '../common/CopyButton'
import {
  UploadCloud,
  FileText,
  User,
  HardDrive,
  Hash,
  AlertTriangle,
  CheckCircle,
} from '../icons'

interface UploadEvidenceModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: (response: UploadResponse) => void
}

const EVIDENCE_TYPES = [
  'Forensic Disk Image',
  'Memory / RAM Dump',
  'Network Capture (PCAP)',
  'System Event Logs',
  'Text Document',
  'Mobile Device Extraction',
  'Audio / Video Recording',
  'Malware Sample / Binary',
  'Database Export',
  'Other Digital Artifact',
]

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [evidenceType, setEvidenceType] = useState<string>(EVIDENCE_TYPES[0])
  const [customType, setCustomType] = useState<string>('')
  const [uploadedBy, setUploadedBy] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<UploadResponse | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    setFile(null)
    setUploadedBy('')
    setError(null)
    setSuccessResult(null)
    setEvidenceType(EVIDENCE_TYPES[0])
    setCustomType('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select or drag an evidence file to upload.')
      return
    }

    const finalExaminer = uploadedBy.trim()
    if (!finalExaminer) {
      setError('Please provide the custodian / examiner name.')
      return
    }

    const finalType = evidenceType === 'Other Digital Artifact' && customType.trim() ? customType.trim() : evidenceType

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await uploadEvidence(file, finalType, finalExaminer)
      setSuccessResult(response)
      onUploadSuccess(response)
    } catch (err: unknown) {
      console.error('Upload error:', err)
      const msg = err instanceof Error ? err.message : 'Upload failed. Please check backend connection.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Secure Digital Evidence Ingestion"
      subtitle="Upload artifact, compute SHA-256 fingerprint, and initialize chain of custody"
      icon={<UploadCloud size={20} />}
      maxWidth="md"
    >
      <div>
        {/* Success View */}
        {successResult ? (
          <div>
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>
                  {successResult.message || 'Evidence Successfully Ingested'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Cryptographic identity generated and registered in SQLite audit database.
                </div>
              </div>
            </div>

            {/* Ingested Details Card */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-medium)',
                borderRadius: '10px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Generated Evidence ID
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
                    {successResult.evidence_id}
                  </span>
                  <CopyButton text={successResult.evidence_id} label="Copy ID" />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Artifact Filename
                </span>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '14px' }}>
                  {successResult.filename}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Forensic Type
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {successResult.evidence_type}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Initial Status
                </span>
                <Badge status={successResult.status} size="sm" />
              </div>

              <div style={{ marginTop: '4px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    SHA-256 Fingerprint
                  </span>
                  <CopyButton text={successResult.sha256} label="Copy Hash" />
                </div>
                <div
                  className="font-mono"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#34d399',
                    wordBreak: 'break-all',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  {successResult.sha256}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={handleReset}>
                Register Another File
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Done & View in Vault
              </Button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                }}
              >
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop File Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#06b6d4' : file ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '12px',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging
                  ? 'rgba(6, 182, 212, 0.08)'
                  : file
                  ? 'rgba(16, 185, 129, 0.04)'
                  : 'rgba(15, 23, 42, 0.4)',
                transition: 'all 0.2s ease',
                marginBottom: '20px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={24} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#f8fafc' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatFileSize(file.size)} • Click to choose a different file
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.12)',
                      color: '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UploadCloud size={24} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#f8fafc' }}>
                    Drag and drop evidence artifact here
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    or browse files from local machine
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    All formats supported (RAW, PCAP, ISO, TXT, LOG, IMG, BIN)
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Type */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginBottom: '6px',
                }}
              >
                <HardDrive size={14} color="#06b6d4" />
                <span>Forensic Evidence Type *</span>
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="cyber-select"
              >
                {EVIDENCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {evidenceType === 'Other Digital Artifact' && (
                <input
                  type="text"
                  placeholder="Specify custom artifact classification..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="cyber-input"
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            {/* Custodian / Examiner */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                  marginBottom: '6px',
                }}
              >
                <User size={14} color="#06b6d4" />
                <span>Investigator / Custodian Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Det. Alex Rivera / Lead Forensics Examiner"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="cyber-input"
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                This identity will be stamped into the cryptographic chain-of-custody audit log.
              </span>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon={<Hash size={16} />}
              >
                {isSubmitting ? 'Hashing & Registering...' : 'Ingest & Sign Evidence'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
