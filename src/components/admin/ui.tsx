'use client'

import React, { useRef, useEffect, useState } from 'react'
import { X, ChevronDown, Check, AlertCircle, Loader2, Upload, ImageOff, ImagePlus, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'

// ── AdminButton ───────────────────────────────────────────────────────────────
// Standard admin action button. Use variant + size; pass className for layout
// concerns only (w-full, flex-1, shrink-0, mt-N, etc.).

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'destructive' | 'confirm' | 'publish'
type ButtonSize = 'default' | 'compact'

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary:     'bg-vatican-blue text-white hover:bg-vatican-blue-dark disabled:opacity-60',
  secondary:   'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50',
  danger:      'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 disabled:opacity-50',
  destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
  confirm:     'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50',
  publish:     'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 disabled:opacity-50',
}

const BUTTON_SIZE: Record<ButtonSize, string> = {
  default: 'h-9 px-4 text-[14px]',
  compact: 'py-1.5 px-3 text-[13px]',
}

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function AdminButton({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors',
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ── AdminIconButton ───────────────────────────────────────────────────────────
// Square icon-only button for row actions (edit, delete, etc.). Always w-8 h-8.

type IconButtonVariant = 'ghost' | 'danger' | 'edit'

const ICON_BUTTON_VARIANT: Record<IconButtonVariant, string> = {
  ghost:  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
  edit:   'text-gray-400 hover:text-vatican-blue hover:bg-gray-100',
  danger: 'text-gray-400 hover:text-red-500 hover:bg-red-50',
}

type AdminIconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant
}

export function AdminIconButton({
  variant = 'ghost',
  className = '',
  children,
  ...props
}: AdminIconButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors disabled:opacity-50',
        ICON_BUTTON_VARIANT[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ── AdminInput ────────────────────────────────────────────────────────────────

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function AdminInput({ className = '', ...props }: AdminInputProps) {
  return (
    <input
      className={cn(
        'w-full border border-gray-200 rounded-lg px-3 h-9 text-[15px] text-vatican-dark bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vatican-blue/30 focus:border-vatican-blue transition-colors disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

// ── AdminTextarea ─────────────────────────────────────────────────────────────

type AdminTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function AdminTextarea({ className = '', ...props }: AdminTextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full border border-gray-200 rounded-lg px-3 py-2 text-[15px] text-vatican-dark bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vatican-blue/30 focus:border-vatican-blue transition-colors resize-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

// ── AdminSelect ───────────────────────────────────────────────────────────────

export type AdminSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type AdminSelectProps = {
  value: string
  onChange: (value: string) => void
  options: AdminSelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = '— Chọn —',
  className = '',
  disabled = false,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }

  useEffect(() => {
    if (open) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedOption = options.find(o => o.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  return (
    <div className={cn('relative flex-1 min-w-0', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full h-9 px-3 flex items-center justify-between gap-2 rounded-lg border text-[15px] transition-colors bg-white text-left disabled:opacity-50 disabled:bg-gray-50',
          open
            ? 'border-vatican-blue ring-2 ring-vatican-blue/20'
            : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <span
          className={cn(
            'truncate',
            selectedOption ? 'text-vatican-dark font-medium' : 'text-gray-300 font-normal'
          )}
        >
          {displayLabel}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            'text-gray-400 shrink-0 transition-transform duration-200',
            open ? 'rotate-180 text-vatican-blue' : ''
          )}
        />
      </button>

      {open && rect && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
          className="border border-gray-200 rounded-xl bg-white overflow-y-auto max-h-60 py-1"
        >
          {placeholder && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
            >
              <span
                className={cn(
                  'text-[15px]',
                  value === '' ? 'font-bold text-vatican-blue' : 'font-medium text-gray-300'
                )}
              >
                {placeholder}
              </span>
              {value === '' && <Check size={13} className="text-vatican-blue shrink-0" />}
            </button>
          )}
          {options.map(o => {
            const isSelected = value === o.value
            return (
              <button
                key={o.value}
                type="button"
                disabled={o.disabled}
                onClick={() => {
                  if (!o.disabled) {
                    onChange(o.value)
                    setOpen(false)
                  }
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors',
                  o.disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50/30'
                    : 'hover:bg-gray-50'
                )}
              >
                <span
                  className={cn(
                    'text-[15px] truncate pr-2',
                    isSelected
                      ? 'font-bold text-vatican-blue'
                      : o.disabled
                      ? 'font-medium text-gray-400'
                      : 'font-medium text-gray-700'
                  )}
                >
                  {o.label}
                </span>
                {isSelected && <Check size={13} className="text-vatican-blue shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── AdminNativeSelect ─────────────────────────────────────────────────────────
// Wraps a native <select> with the same visual style as AdminInput.
// Use when you need <option> elements (not the custom AdminSelect dropdown).

type AdminNativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function AdminNativeSelect({ className = '', children, ...props }: AdminNativeSelectProps) {
  return (
    <select
      className={cn(
        'w-full border border-gray-200 rounded-lg px-3 h-9 text-[15px] text-vatican-dark bg-white focus:outline-none focus:ring-2 focus:ring-vatican-blue/30 focus:border-vatican-blue transition-colors disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// ── AdminLabel ────────────────────────────────────────────────────────────────

type AdminLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export function AdminLabel({ className = '', children, ...props }: AdminLabelProps) {
  return (
    <label
      className={cn(
        'text-[13px] font-bold uppercase tracking-widest text-gray-400 block mb-1.5',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}

// ── AdminBadge ────────────────────────────────────────────────────────────────

export type BadgeColor = 'blue' | 'amber' | 'red' | 'green' | 'gray'

const BADGE_COLOR: Record<BadgeColor, string> = {
  blue:  'bg-vatican-blue/10 text-vatican-blue border border-vatican-blue/20',
  amber: 'bg-amber-50 text-amber-600 border border-amber-200',
  red:   'bg-red-50 text-red-500 border border-red-200',
  green: 'bg-green-50 text-green-600 border border-green-200',
  gray:  'bg-gray-100 text-gray-500 border border-gray-200',
}

type AdminBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  color?: BadgeColor
}

export function AdminBadge({ color = 'gray', className = '', children, ...props }: AdminBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[13px] font-bold',
        BADGE_COLOR[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// ── AdminStatusBadgeSelect ───────────────────────────────────────────────────
// Premium interactive status badge select with fixed position menu.
// Unified with AdminBadge and AdminSelect styling.

export type BadgeSelectOption = {
  value: string
  label: string
  color: BadgeColor
}

type AdminStatusBadgeSelectProps = {
  value: string
  onChange: (value: string) => void
  options: BadgeSelectOption[]
  className?: string
  disabled?: boolean
}

export function AdminStatusBadgeSelect({
  value,
  onChange,
  options,
  className = '',
  disabled = false,
}: AdminStatusBadgeSelectProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }

  useEffect(() => {
    if (open) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedOption = options.find(o => o.value === value) || options[0]
  const colorClass = BADGE_COLOR[selectedOption?.color || 'gray']

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(v => !v)
        }}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none',
          colorClass,
          open ? 'ring-2 ring-vatican-blue/20 brightness-95' : 'hover:brightness-95'
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={11}
          className={cn(
            'opacity-60 transition-transform duration-200 shrink-0',
            open ? 'rotate-180' : ''
          )}
        />
      </button>

      {open && rect && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            minWidth: Math.max(rect.width, 140),
            zIndex: 9999,
          }}
          className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-y-auto max-h-60 py-1"
        >
          {options.map(o => {
            const isSelected = value === o.value
            return (
              <button
                key={o.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(o.value)
                  setOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <span
                  className={cn(
                    'text-[13px] truncate pr-2',
                    isSelected
                      ? 'font-bold text-vatican-blue'
                      : 'font-semibold text-gray-600'
                  )}
                >
                  {o.label}
                </span>
                {isSelected && <Check size={11} className="text-vatican-blue shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── AdminCheckbox ─────────────────────────────────────────────────────────────

type AdminCheckboxProps = {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  className?: string
}

export function AdminCheckbox({ checked, indeterminate, onChange, className = '' }: AdminCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn(
        'w-[15px] h-[15px] rounded accent-vatican-blue cursor-pointer shrink-0',
        className
      )}
    />
  )
}

// ── ModalHeader ───────────────────────────────────────────────────────────────

type ModalHeaderProps = {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  onClose: () => void
  disabled?: boolean
  className?: string
}

export function ModalHeader({ title, subtitle, icon, onClose, disabled, className = '' }: ModalHeaderProps) {
  return (
    <div className={cn(
      'px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0',
      className
    )}>
      <div className={cn('flex items-center', icon ? 'gap-2.5' : '')}>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-vatican-blue/10 flex items-center justify-center shrink-0 text-vatican-blue">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[15px] font-black text-vatican-dark uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={disabled ? undefined : onClose}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <X size={18} />
      </button>
    </div>
  )
}

// ── ModalFooter ───────────────────────────────────────────────────────────────
// Standard modal footer with error message + cancel/submit buttons.
// Pass the submit button (and any extra actions) as children.

type ModalFooterProps = {
  error?: string | null
  onCancel: () => void
  cancelLabel?: string
  submitting?: boolean
  children: React.ReactNode
  className?: string
}

export function ModalFooter({
  error,
  onCancel,
  cancelLabel = 'Hủy',
  submitting,
  children,
  className = '',
}: ModalFooterProps) {
  return (
    <div className={cn(
      'border-t border-gray-100 bg-gray-50/50 px-6 py-4 shrink-0 flex items-center justify-between',
      className
    )}>
      {error && (
        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-red-600 flex-1">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      <div className="ml-auto flex items-center gap-2">
        <AdminButton type="button" onClick={onCancel} variant="secondary" disabled={submitting}>
          {cancelLabel}
        </AdminButton>
        {children}
      </div>
    </div>
  )
}

// ── ModalStatusToggle ──────────────────────────────────────────────────────────

type ModalStatusToggleProps = {
  active: boolean
  onChange: (v: boolean) => void
  activeLabel?: string
  inactiveLabel?: string
}

export function ModalStatusToggle({
  active,
  onChange,
  activeLabel = 'Đang áp dụng',
  inactiveLabel = 'Không áp dụng',
}: ModalStatusToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 select-none shrink-0 border border-gray-200 w-full h-9 items-center">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'flex-1 h-8 rounded-md text-[13px] font-bold transition-all border outline-none',
          active
            ? 'bg-emerald-100 text-emerald-700 border-black/5 shadow-none'
            : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/30 border-transparent shadow-none'
        )}
      >
        {activeLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'flex-1 h-8 rounded-md text-[13px] font-bold transition-all border outline-none',
          !active
            ? 'bg-amber-100 text-amber-700 border-black/5 shadow-none'
            : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200/30 border-transparent shadow-none'
        )}
      >
        {inactiveLabel}
      </button>
    </div>
  )
}

// ── AdminImagePicker ──────────────────────────────────────────────────────────
// Standard image selection and upload component.
// Handles automatic Supabase storage upload, progress state, and raw URL input.

type AdminImagePickerProps = {
  value: string
  onChange: (url: string) => void
  bucket: string
  aspectRatio?: '16:9' | '3:4'
  disabled?: boolean
  className?: string
}

export function AdminImagePicker({
  value,
  onChange,
  bucket,
  aspectRatio = '16:9',
  disabled = false,
  className = '',
}: AdminImagePickerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `img-${Date.now()}.${ext}`
      const supabase = createClient()

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true })

      if (uploadErr) {
        setError('Lỗi tải ảnh: ' + uploadErr.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onChange(publicUrl)
    } catch (err: any) {
      setError('Lỗi hệ thống: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError(null)
  }

  const is169 = aspectRatio === '16:9'

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
        {/* Preview Box */}
        <div
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          className={cn(
            'relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-vatican-blue transition-colors bg-white shrink-0 flex items-center justify-center cursor-pointer select-none',
            is169 ? 'w-[140px] aspect-video' : 'w-[150px] h-[200px]'
          )}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                disabled={disabled}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={12} />
              </button>
            </>
          ) : uploading ? (
            <Loader2 size={24} className="animate-spin text-vatican-blue" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-gray-300 px-3 text-center">
              <ImagePlus size={is169 ? 20 : 28} strokeWidth={1.5} />
              <span className="text-[13px] font-medium text-gray-400 leading-tight">
                {is169 ? 'Tỷ lệ 16:9' : 'Tỷ lệ 3:4'}
              </span>
            </div>
          )}
        </div>

        {/* Info & Url Input */}
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="flex flex-col gap-1">
            <AdminButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              variant="secondary"
              size="compact"
              className="w-fit h-8"
            >
              <Upload size={13} />
              {value ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
            </AdminButton>
            <p className="text-[12px] text-gray-400 mt-1">
              • JPG, PNG, WebP (Tối đa 5 MB)
            </p>
          </div>

          <AdminInput
            type="text"
            value={value}
            disabled={disabled || uploading}
            placeholder="Hoặc nhập liên kết ảnh (https://...)"
            onChange={e => onChange(e.target.value)}
            className="h-8 px-3 text-[13px] bg-white border-gray-200"
          />
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-red-600">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

// ── AdminViewToggle ──────────────────────────────────────────────────────────
// Unified grid / list view switcher.

type AdminViewToggleProps = {
  view: 'grid' | 'list'
  onChange: (view: 'grid' | 'list') => void
  disabled?: boolean
  className?: string
}

export function AdminViewToggle({
  view,
  onChange,
  disabled = false,
  className = '',
}: AdminViewToggleProps) {
  return (
    <div className={cn('flex items-center rounded-lg border border-gray-200 overflow-hidden bg-white h-9 shrink-0', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('grid')}
        className={cn(
          'flex items-center justify-center w-9 h-9 transition-colors',
          view === 'grid'
            ? 'bg-vatican-blue text-white'
            : 'text-gray-400 hover:bg-gray-100 disabled:opacity-50'
        )}
      >
        <LayoutGrid size={14} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('list')}
        className={cn(
          'flex items-center justify-center w-9 h-9 transition-colors',
          view === 'list'
            ? 'bg-vatican-blue text-white'
            : 'text-gray-400 hover:bg-gray-100 disabled:opacity-50'
        )}
      >
        <List size={14} />
      </button>
    </div>
  )
}



