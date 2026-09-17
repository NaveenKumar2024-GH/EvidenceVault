import { useState, useEffect, useCallback } from 'react'
import type {
  EvidenceRecord,
  SystemStats,
  VerifyResponse,
  UploadResponse,
} from './api/types'
import { getAllEvidence, checkBackendHealth } from './api/client'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { StatsOverview } from './components/dashboard/StatsOverview'
import { EvidenceTable } from './components/dashboard/EvidenceTable'
import { EvidenceDetailsModal } from './components/evidence/EvidenceDetailsModal'
import { CustodyHistoryModal } from './components/evidence/CustodyHistoryModal'
import { VerifyResultModal } from './components/evidence/VerifyResultModal'
import { UploadEvidenceModal } from './components/evidence/UploadEvidenceModal'
import { ToastContainer, type ToastMessage } from './components/common/Toast'
import { Shield, Lock, AlertTriangle } from './components/icons'

export function App() {
  const [records, setRecords] = useState<EvidenceRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true)
  const [backendError, setBackendError] = useState<string | null>(null)

  // Modals state
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null)
  const [custodyEvidence, setCustodyEvidence] = useState<EvidenceRecord | null>(null)
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false)

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setToasts((prev) => [...prev, { id, type, title, description }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Initial mount load
 useEffect(() => {
  let ignore = false

  async function loadEvidence() {
    try {
      const [evidenceData] = await Promise.all([
        getAllEvidence(),
        checkBackendHealth().catch(() => null),
      ])

      if (!ignore) {
        setRecords(evidenceData.evidence || [])
        setIsBackendConnected(true)
        setIsLoading(false)
      }
    } catch (err: unknown) {
      if (!ignore) {
        setIsBackendConnected(false)

        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to connect to EvidenceVault API'

        setBackendError(msg)
        setIsLoading(false)
      }
    }
  }

  // Initial load
  loadEvidence()

  // Refresh dashboard every 5 seconds
  const interval = window.setInterval(() => {
    loadEvidence()
  }, 5000)

  return () => {
    ignore = true
    window.clearInterval(interval)
  }
}, [])
  // Manual refresh callback
  const refreshRecords = useCallback(async () => {
    setIsRefreshing(true)
    setBackendError(null)

    try {
      const [evidenceData] = await Promise.all([
        getAllEvidence(),
        checkBackendHealth().catch(() => null),
      ])
      setRecords(evidenceData.evidence || [])
      setIsBackendConnected(true)
      addToast('success', 'Vault Synchronized', `Refreshed ${evidenceData.evidence.length} cryptographic records.`)
    } catch (err: unknown) {
      console.error('Failed to refresh evidence:', err)
      setIsBackendConnected(false)
      const msg = err instanceof Error ? err.message : 'Unable to connect to EvidenceVault API'
      setBackendError(msg)
      addToast('error', 'API Connection Error', 'Ensure FastAPI backend is running at http://127.0.0.1:8000')
    } finally {
      setIsRefreshing(false)
    }
  }, [addToast])

  

  // Background reload after mutations
  const silentReload = useCallback(async () => {
    try {
      const evidenceData = await getAllEvidence()
      setRecords(evidenceData.evidence || [])
      setIsBackendConnected(true)
    } catch (err) {
      console.error('Failed to reload evidence:', err)
    }
  }, [])

  // Compute stats
  const stats: SystemStats = {
    total: records.length,
    registered: records.filter((r) => r.status.toUpperCase() === 'REGISTERED').length,
    verified: records.filter((r) => r.status.toUpperCase() === 'VERIFIED').length,
    compromised: records.filter((r) => r.status.toUpperCase() === 'COMPROMISED').length,
    integrityPercentage:
      records.length > 0
        ? Math.round((records.filter((r) => r.status.toUpperCase() === 'VERIFIED').length / records.length) * 100)
        : 100,
  }

  // Handle successful verify response
  const handleVerifyResult = (result: VerifyResponse) => {
    // Update the record in state immediately
    setRecords((prev) =>
      prev.map((rec) =>
        rec.evidence_id === result.evidence_id
          ? { ...rec, status: result.status }
          : rec
      )
    )

    // Also update selectedEvidence if open
    setSelectedEvidence((prev) =>
      prev && prev.evidence_id === result.evidence_id
        ? { ...prev, status: result.status }
        : prev
    )

    // Open verification result modal
    setVerifyResult(result)

    if (result.status === 'VERIFIED') {
      addToast(
        'success',
        `Evidence ${result.evidence_id} Verified`,
        'SHA-256 fingerprint matches original registration.'
      )
    } else {
      addToast(
        'error',
        `CRITICAL: Evidence ${result.evidence_id} Compromised!`,
        'Hash mismatch detected! Cryptographic integrity compromised.'
      )
    }
  }

  // Handle successful upload response
  const handleUploadSuccess = (newEvidence: UploadResponse) => {
    addToast(
      'success',
      `Evidence Ingested: ${newEvidence.evidence_id}`,
      `File ${newEvidence.filename} hashed and stored securely.`
    )
    // Reload full list to get updated ordering and complete record
    silentReload()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Header */}
      <Header
        onUploadClick={() => setIsUploadOpen(true)}
        onRefreshClick={refreshRecords}
        isRefreshing={isRefreshing}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '28px',
        }}
      >
        {/* Backend Connection Warning Banner */}
        {!isBackendConnected && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} />
              <div>
                <strong style={{ fontSize: '15px' }}>FastAPI Backend Unavailable</strong>
                <div style={{ fontSize: '13px', color: '#fca5a5', marginTop: '2px' }}>
                  {backendError || 'Unable to connect to http://127.0.0.1:8000. Please ensure the backend server is running.'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshRecords}
              className="btn btn-secondary"
              style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#f87171' }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Hero Forensics Dashboard Banner */}
        <div
          className="cyber-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '24px 28px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(14, 19, 31, 0.9) 0%, rgba(19, 27, 46, 0.7) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
          }}
        >
          {/* Subtle Cyber Scanner Effect */}
          <div className="scanner-line" />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ maxWidth: '780px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#22d3ee',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '10px',
                }}
              >
                <Lock size={12} />
                <span>SHA-256 Integrity & Chain of Custody</span>
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                Digital Evidence Integrity & Custody Vault
              </h1>
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                Tamper-evident verification platform for digital forensics. Every uploaded piece of evidence is
                fingerprinted using SHA-256, logged with a tamper-evident custody trail, and can be re-verified
                on demand to detect unauthorized file modifications.
              </p>
            </div>

            {/* Quick action button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <Shield size={16} />
                <span>Upload & Fingerprint Evidence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time System Statistics */}
        <StatsOverview stats={stats} />

        {/* Main Evidence Ledger Table */}
        <EvidenceTable
          records={records}
          isLoading={isLoading}
          onSelectEvidence={(evidence) => setSelectedEvidence(evidence)}
          onViewCustody={(evidence) => setCustodyEvidence(evidence)}
          onVerifyResult={handleVerifyResult}
          onRefresh={refreshRecords}
        />
      </main>

      {/* Modals */}
      {/* 1. Evidence Dossier Details Modal */}
      <EvidenceDetailsModal
        isOpen={Boolean(selectedEvidence)}
        onClose={() => setSelectedEvidence(null)}
        evidence={selectedEvidence}
        onVerifySuccess={handleVerifyResult}
      />

      {/* 2. Chain of Custody History Modal */}
      <CustodyHistoryModal
        isOpen={Boolean(custodyEvidence)}
        onClose={() => setCustodyEvidence(null)}
        evidence={custodyEvidence}
      />

      {/* 3. Verification Report Modal */}
      <VerifyResultModal
        isOpen={Boolean(verifyResult)}
        onClose={() => setVerifyResult(null)}
        result={verifyResult}
      />

      {/* 4. Upload Evidence Modal */}
      <UploadEvidenceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
