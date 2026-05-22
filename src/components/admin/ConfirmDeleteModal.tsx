'use client'

import { Trash2 } from 'lucide-react'
import { AdminModal } from '@/components/admin/AdminModal'
import { ModalHeader, AdminButton } from '@/components/admin/ui'

type Props = {
  title: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDeleteModal({ title, description, onConfirm, onCancel, loading }: Props) {
  return (
    <AdminModal onClose={onCancel} maxWidth="max-w-[380px]" disabled={loading}>
      <ModalHeader title={title} subtitle={description} onClose={onCancel} />
      <div className="flex gap-2 px-5 py-4">
        <AdminButton
          variant="destructive"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 justify-center"
        >
          <Trash2 size={14} />
          {loading ? 'Đang xóa...' : 'Xóa'}
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 justify-center"
        >
          Hủy
        </AdminButton>
      </div>
    </AdminModal>
  )
}
