import React from 'react';
import { ChevronDown, X } from 'lucide-react';

/* ============================================================================
   UNIFIED DESIGN SYSTEM COMPONENT LIBRARY (Atoms & Molecules)
   ============================================================================ */

export interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger' | 'soft';
  size?: 'xs' | 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const DSButton: React.FC<DSButtonProps> = ({
  variant = 'secondary',
  size = 'sm',
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] rounded-[var(--ds-radius-xs)] gap-1',
    sm: 'px-3.5 py-1.5 text-xs rounded-[var(--ds-radius-sm)] gap-1.5',
    md: 'px-4 py-2 text-xs rounded-[var(--ds-radius-sm)] gap-2',
  }[size];

  const variantClasses = {
    primary:
      'bg-[var(--ds-primary)] hover:bg-[var(--ds-primary-hover)] text-white font-semibold shadow-[var(--ds-shadow-xs)]',
    cta: 'bg-[var(--ds-cta)] hover:bg-[var(--ds-cta-hover)] text-white font-semibold shadow-[var(--ds-shadow-xs)]',
    secondary:
      'bg-[var(--ds-surface)] hover:bg-[var(--ds-surface-muted)] text-[var(--ds-ink-secondary)] border border-[var(--ds-border-base)] font-medium',
    soft: 'bg-[var(--ds-surface-muted)] hover:bg-slate-200/80 text-[var(--ds-ink-secondary)] font-medium',
    ghost: 'bg-transparent hover:bg-[var(--ds-surface-muted)] text-[var(--ds-ink-secondary)] font-medium',
    danger: 'bg-[var(--ds-danger-soft)] hover:bg-rose-100 text-[var(--ds-danger)] font-semibold',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center transition-colors whitespace-nowrap shrink-0 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-primary)] ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
};

export interface DSIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: 'sm' | 'md';
  badgeCount?: number;
  badgeTone?: 'primary' | 'cta';
}

export const DSIconButton: React.FC<DSIconButtonProps> = ({
  active = false,
  size = 'md',
  badgeCount,
  badgeTone = 'primary',
  children,
  className = '',
  ...props
}) => {
  const dim = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-full';
  const stateStyle = active
    ? 'bg-[var(--ds-ink-primary)] text-white'
    : 'text-[var(--ds-ink-secondary)] hover:bg-[var(--ds-surface-muted)] hover:text-[var(--ds-ink-primary)]';

  const badgeBg =
    badgeTone === 'cta' ? 'bg-[var(--ds-cta)] text-white' : 'bg-[var(--ds-primary)] text-white';

  return (
    <button
      className={`relative inline-flex items-center justify-center transition-colors shrink-0 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[var(--ds-primary)] ${dim} ${stateStyle} ${className}`}
      {...props}
    >
      {children}
      {typeof badgeCount === 'number' && badgeCount > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold rounded-full flex items-center justify-center tabular-nums ring-2 ring-white ${badgeBg}`}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
};

export interface DSBadgeProps {
  children: React.ReactNode;
  tone?: 'primary' | 'neutral' | 'cta' | 'success';
  className?: string;
}

export const DSBadge: React.FC<DSBadgeProps> = ({
  children,
  tone = 'primary',
  className = '',
}) => {
  const styles = {
    primary: 'bg-[var(--ds-primary)] text-white',
    neutral: 'bg-slate-500 text-white',
    cta: 'bg-[var(--ds-cta)] text-white',
    success: 'bg-emerald-600 text-white',
  }[tone];

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-bold rounded-full tabular-nums shrink-0 ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

export interface DSAvatarProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  selected?: boolean;
}

export const DSAvatar: React.FC<DSAvatarProps> = ({
  code,
  size = 'md',
  online = false,
  selected = false,
}) => {
  const sizeMap = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
  }[size];

  return (
    <div className="relative shrink-0 select-none">
      <div
        className={`rounded-full font-bold flex items-center justify-center transition-colors ${sizeMap} ${
          selected
            ? 'bg-[var(--ds-primary)] text-white'
            : 'bg-slate-200/90 text-[var(--ds-ink-secondary)]'
        }`}
      >
        {code}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--ds-success)] ring-2 ring-white"
          title="В сети"
        />
      )}
    </div>
  );
};

export interface DSSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
}

export const DSSelect: React.FC<DSSelectProps> = ({
  compact = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="relative inline-flex items-center w-full">
      <select
        className={`w-full appearance-none bg-[var(--ds-surface)] hover:bg-[var(--ds-surface-subtle)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-sm)] text-xs font-medium text-[var(--ds-ink-primary)] focus:outline-none focus:border-[var(--ds-primary)] transition-colors cursor-pointer truncate ${
          compact ? 'pl-2.5 pr-7 py-1.5' : 'pl-3 pr-8 py-2'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-[var(--ds-ink-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export interface DSContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  tone?: 'default' | 'primary' | 'warning' | 'danger';
  rightMeta?: string;
}

export const DSContextMenuItem: React.FC<DSContextMenuItemProps> = ({
  icon,
  tone = 'default',
  rightMeta,
  children,
  className = '',
  ...props
}) => {
  const toneClasses = {
    default: 'text-[var(--ds-ink-primary)] hover:bg-[var(--ds-surface-muted)] font-medium',
    primary: 'bg-blue-50/80 hover:bg-blue-100/80 text-[var(--ds-primary)] font-semibold',
    warning: 'text-amber-800 hover:bg-amber-50 font-medium',
    danger: 'text-[var(--ds-danger)] hover:bg-[var(--ds-danger-soft)] font-medium',
  }[tone];

  return (
    <button
      className={`w-full px-2.5 py-2 rounded-[var(--ds-radius-sm)] text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${toneClasses} ${className}`}
      {...props}
    >
      <span className="flex items-center gap-2.5 truncate">
        {icon}
        <span className="truncate">{children}</span>
      </span>
      {rightMeta && <span className="text-[10px] font-mono opacity-75 shrink-0">{rightMeta}</span>}
    </button>
  );
};

export interface DSModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const DSModal: React.FC<DSModalProps> = ({
  title,
  onClose,
  children,
  maxWidthClass = 'max-w-md',
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[var(--ds-surface)] border border-[var(--ds-border-base)] rounded-[var(--ds-radius-lg)] w-full ${maxWidthClass} p-5 space-y-4 shadow-[var(--ds-shadow-floating)]`}
      >
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--ds-border-subtle)]">
          <h3 className="text-sm font-bold text-[var(--ds-ink-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[var(--ds-surface-muted)] text-[var(--ds-ink-muted)] hover:text-[var(--ds-ink-primary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
