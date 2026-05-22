import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const { full_name, phone } = await req.json()
    if (!full_name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const supabase = await createClient()
    const { error } = await supabase
      .from('community_signups')
      .insert([{ full_name: full_name.trim(), phone: phone.trim() }])
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
