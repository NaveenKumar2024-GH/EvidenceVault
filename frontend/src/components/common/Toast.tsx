import React, { useEffect } from 'react'
import { CheckCircle, AlertTriangle, X } from '../icons'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  description?: string
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  )
}

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 4500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const getTheme = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'rgba(6, 40, 30, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          iconColor: '#10b981',
          icon: <CheckCircle size={20} />,
        }
      case 'error':
        return {
          bg: 'rgba(50, 15, 15, 0.95)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          iconColor: '#ef4444',
          icon: <AlertTriangle size={20} />,
        }
      case 'info':
      default:
        return {
          bg: 'rgba(15, 25, 45, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          iconColor: '#06b6d4',
          icon: <CheckCircle size={20} />,
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: theme.bg,
        border: theme.border,
        borderRadius: '10px',
        padding: '14px 16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        color: '#f8fafc',
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      <div style={{ color: theme.iconColor, marginTop: '2px', flexShrink: 0 }}>
        {theme.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: toast.description ? '2px' : 0 }}>
          {toast.title}
        </div>
        {toast.description && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {toast.description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  )
}
