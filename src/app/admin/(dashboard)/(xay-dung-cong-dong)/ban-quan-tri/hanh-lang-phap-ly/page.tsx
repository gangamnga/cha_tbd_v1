import { Scale } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { AdminCard } from '@/components/admin/AdminCard'
import { LegalTab } from '../_components/LegalTab'

/*
  Supabase migration — chạy một lần trong SQL editor:

  CREATE TABLE bqt_legal_docs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT        NOT NULL,
    doc_type    TEXT        NOT NULL DEFAULT 'khac',
    doc_number  TEXT,
    issued_by   TEXT,
    issued_date DATE,
    valid_until DATE,
    status      TEXT        NOT NULL DEFAULT 'active',
    file_url    TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  ALTER TABLE bqt_legal_docs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "admin_all" ON bqt_legal_docs FOR ALL USING (true);
*/

export default async function HanhLangPhapLyPage() {
  const supabase = await createClient()

  const { data: docs } = await supabase
    .from('bqt_legal_docs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto">
      <AdminCard title="Hành Lang Pháp Lý" icon={<Scale size={18} strokeWidth={2.5} />}>
        <div className="flex-1 p-2">
          <LegalTab initial={docs ?? []} />
        </div>
      </AdminCard>
    </div>
  )
}
