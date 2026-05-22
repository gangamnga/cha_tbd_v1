'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, X, ImageIcon } from 'lucide-react'
import { AdminButton, AdminInput } from '@/components/admin/ui'

export function PortraitEditor({ initialUrl }: { initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl)
  const [input, setInput] = useState(initialUrl)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!input.trim()) return
    setSaving(true)
    await createClient()
      .from('site_settings')
      .upsert({ key: 'bio_portrait_url', value: input.trim(), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    setUrl(input.trim())
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="w-[200px] sm:w-[360px] mx-auto sm:mx-0 shrink-0">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Chân dung Cha Trương Bửu Diệp" className="w-full h-full object-cover object-top" />
      </div>

      {!editing ? (
        <AdminButton
          variant="secondary"
          size="compact"
          onClick={() => setEditing(true)}
          className="mt-2 w-full justify-center"
        >
          <ImageIcon size={12} />Đổi ảnh
        </AdminButton>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5">
          <AdminInput
            placeholder="URL ảnh hoặc /images/..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full"
            autoFocus
          />
          <div className="flex gap-1">
            <AdminButton
              variant="primary"
              size="compact"
              onClick={save}
              disabled={saving || !input.trim()}
              className="flex-1 justify-center"
            >
              <Save size={11} />{saving ? '...' : 'Lưu'}
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="compact"
              onClick={() => { setInput(url); setEditing(false) }}
              className="px-2.5"
            >
              <X size={11} />
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  )
}
