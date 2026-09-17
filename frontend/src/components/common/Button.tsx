import React from 'react'
import { RefreshCw } from '../icons'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'verify' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  let variantClass = 'btn-primary'
  if (variant === 'secondary') variantClass = 'btn-secondary'
  if (variant === 'verify') variantClass = 'btn-verify'
  if (variant === 'danger') variantClass = 'badge-compromised'
  if (variant === 'ghost') variantClass = ''

  const sizeClass = size === 'sm' ? 'btn-sm' : ''

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <RefreshCw size={14} className="animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
