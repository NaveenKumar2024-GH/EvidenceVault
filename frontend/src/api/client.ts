import type {
  AuditLogResponse,
  CustodyHistoryResponse,
  EvidenceListResponse,
  EvidenceRecord,
  UploadResponse,
  VerifyResponse,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}: ${res.statusText}`
    try {
      const data = await res.json()
      if (data && typeof data.detail === 'string') {
        errorMessage = data.detail
      } else if (data && typeof data.message === 'string') {
        errorMessage = data.message
      }
    } catch {
      // Ignore json parse error and keep statusText
    }
    throw new ApiError(errorMessage, res.status)
  }
  return res.json()
}

/**
 * Fetch all evidence records
 * GET /evidence
 */
export async function getAllEvidence(): Promise<EvidenceListResponse> {
  const res = await fetch(`${API_BASE}/evidence`, {
    headers: { Accept: 'application/json' },
  })
  return handleResponse<EvidenceListResponse>(res)
}

/**
 * Fetch specific evidence record
 * GET /evidence/{evidence_id}
 */
export async function getEvidenceById(evidenceId: string): Promise<EvidenceRecord> {
  const res = await fetch(`${API_BASE}/evidence/${encodeURIComponent(evidenceId)}`, {
    headers: { Accept: 'application/json' },
  })
  return handleResponse<EvidenceRecord>(res)
}

/**
 * Fetch chain of custody for specific evidence
 * GET /evidence/{evidence_id}/custody
 */
export async function getCustodyHistory(evidenceId: string): Promise<CustodyHistoryResponse> {
  const res = await fetch(`${API_BASE}/evidence/${encodeURIComponent(evidenceId)}/custody`, {
    headers: { Accept: 'application/json' },
  })
  return handleResponse<CustodyHistoryResponse>(res)
}

/**
 * Verify cryptographic hash integrity of evidence
 * POST /evidence/{evidence_id}/verify
 */
/**
 * Fetch system audit logs for specific evidence
 * GET /evidence/{evidence_id}/audit
 */
export async function getAuditLogs(evidenceId: string): Promise<AuditLogResponse> {
  const res = await fetch(`${API_BASE}/evidence/${encodeURIComponent(evidenceId)}/audit`, {
    headers: { Accept: 'application/json' },
  })

  return handleResponse<AuditLogResponse>(res)
}

export async function verifyEvidence(evidenceId: string): Promise<VerifyResponse> {
  const res = await fetch(`${API_BASE}/evidence/${encodeURIComponent(evidenceId)}/verify`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })
  return handleResponse<VerifyResponse>(res)
}

/**
 * Upload new evidence file with metadata
 * POST /evidence/upload (multipart/form-data)
 */
export async function uploadEvidence(
  file: File,
  evidenceType: string,
  uploadedBy: string
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('evidence_type', evidenceType)
  formData.append('uploaded_by', uploadedBy)

  const res = await fetch(`${API_BASE}/evidence/upload`, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  })
  return handleResponse<UploadResponse>(res)
}

/**
 * Check backend health status
 * GET /health
 */
export async function checkBackendHealth(): Promise<{
  status: string
  integrity_watcher: 'running' | 'stopped'
}> {
  const res = await fetch(`${API_BASE}/health`, {
    headers: { Accept: 'application/json' },
  })

  return handleResponse<{
    status: string
    integrity_watcher: 'running' | 'stopped'
  }>(res)
}