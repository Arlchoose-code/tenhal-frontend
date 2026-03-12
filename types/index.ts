export interface Country {
  id: number
  name: string
  code: string
  flag_url: string
}

export interface Job {
  id: number
  title: string
  slug: string
  type: "job" | "internship"
  sector: string
  country: Country
  country_id: number
  city: string
  salary: string
  salary_currency: string
  description: string
  requirements: string
  thumbnail_url: string
  is_active: boolean
  form_template_id: number | null
  form_template?: FormTemplate
  expired_at: string | null
  created_at: string
  updated_at: string
}

export interface FormField {
  id: number
  label: string
  field_name: string
  field_type: string
  placeholder: string
  options: string       // JSON string, e.g. '["Opsi A","Opsi B"]'
  is_required: boolean
  step_number: number
  sort_order: number
}

export interface FormTemplate {
  id: number
  name: string
  description: string
  fields: FormField[]
}

export interface Applicant {
  id: number
  job_id: number | null
  job_title: string        // snapshot, tetap ada walau job dihapus
  job?: Job
  full_name: string
  email: string
  phone: string
  cv_file_url: string
  status: "pending" | "reviewed" | "accepted" | "rejected"
  sheet_row_id: string
  answers: SubmissionAnswer[]
  form_template_snapshot: string  // JSON snapshot of form fields
  created_at: string
  updated_at: string
}

export interface SubmissionAnswer {
  id: number
  applicant_id: number
  form_field_id: number | null   // nullable, field bisa dihapus
  field_name: string             // snapshot label
  field_type?: string
  value: string
  file_url: string
  created_at: string
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
}

export interface BlogTag {
  id: number
  name: string
  slug: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnail_url: string
  category: BlogCategory | null
  category_id: number | null
  category_name: string          // snapshot, tetap ada walau category dihapus
  author: { id: number; name: string }
  tags: BlogTag[]
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  name: string
  position: string
  photo_url: string
  order: number
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone: string
  message: string
  created_at: string
}

export interface PageContent {
  id: number
  page: string
  section: string
  title: string
  subtitle: string
  content: string
  image_url: string
}

export interface SiteSetting {
  key: string
  value: string
  file_url: string
}

export interface LanguageClassRegistration {
  id: number
  full_name: string
  email: string
  phone: string
  language: string
  level: string
  status: string
  created_at: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}