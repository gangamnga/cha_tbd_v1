// Shared TypeScript types for admin data models

export type Registration = {
  id: string
  name: string
  phone: string
  num_people: number | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  trip_title: string | null
  trip_dates: string | null
  created_at: string | null
}

export type Intention = {
  id: string
  name: string | null
  location: string | null
  content: string
  categories: string[] | null
  status: 'pending' | 'prayed' | 'cancelled'
  created_at: string | null
}

export type Testimony = {
  id: string
  title: string
  content: string
  name: string | null
  location: string | null
  categories: string[] | null
  status: 'pending' | 'approved' | 'rejected' | 'published'
  created_at: string | null
}
