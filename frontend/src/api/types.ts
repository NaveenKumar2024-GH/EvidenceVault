export type EvidenceStatus = 'REGISTERED' | 'VERIFIED' | 'COMPROMISED'

export interface EvidenceRecord {
  id: number
  evidence_id: string
  filename: string
  evidence_type: string
  file_hash: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  status: EvidenceStatus
}

export interface EvidenceListResponse {
  count: number
  evidence: EvidenceRecord[]
}

export interface CustodyEvent {
  id: number
  evidence_id: string
  action: string
  performed_by: string
  timestamp: string
  notes: string | null
}

export interface CustodyHistoryResponse {
  evidence_id: string
  custody_events: CustodyEvent[]
}

export interface AuditLog {
  id: number
  evidence_id: string
  action: string
  performed_by: string
  ip_address: string
  timestamp: string
  details: string | null
}

export interface AuditLogResponse {
  evidence_id: string
  audit_logs: AuditLog[]
}

export interface VerifyResponse {
  evidence_id: string
  original_sha256: string
  current_sha256: string
  status: EvidenceStatus
  message: string
}

export interface UploadResponse {
  message: string
  evidence_id: string
  filename: string
  evidence_type: string
  sha256: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  status: EvidenceStatus
}

export interface SystemStats {
  total: number
  registered: number
  verified: number
  compromised: number
  integrityPercentage: number
}

export interface BackendHealth {
  status: string
  integrity_watcher: 'running' | 'stopped'
}