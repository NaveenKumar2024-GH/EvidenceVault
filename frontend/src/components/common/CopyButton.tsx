import React, { useState } from 'react'
import { Copy, Check } from '../icons'

interface CopyButtonProps {
  text: string
  label?: string
  title?: string
  className?: string
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  title = 'Copy to clipboard',
  className = '',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      aria-label={title}
      className={`btn btn-secondary ${className}`}
      style={{
        padding: label ? '4px 10px' : '4px 6px',
        fontSize: '12px',
        lineHeight: 1,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
        color: copied ? '#34d399' : 'var(--text-muted)',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  )
}
