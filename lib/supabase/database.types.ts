export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          role: "user" | "admin"
          credits: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          role?: "user" | "admin"
          credits?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
          role?: "user" | "admin"
          credits?: number
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string
          category: "resume" | "cv" | "portfolio"
          thumbnail_url: string
          html_structure: string
          css_styles: string
          is_premium: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: "resume" | "cv" | "portfolio"
          thumbnail_url: string
          html_structure: string
          css_styles: string
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          category?: "resume" | "cv" | "portfolio"
          thumbnail_url?: string
          html_structure?: string
          css_styles?: string
          is_premium?: boolean
          is_active?: boolean
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          template_id: string
          name: string
          type: "resume" | "cv" | "portfolio"
          content: Json
          public_url: string | null
          is_public: boolean
          view_count: number
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          name: string
          type: "resume" | "cv" | "portfolio"
          content: Json
          public_url?: string | null
          is_public?: boolean
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          template_id?: string
          name?: string
          type?: "resume" | "cv" | "portfolio"
          content?: Json
          public_url?: string | null
          is_public?: boolean
          view_count?: number
          download_count?: number
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          company_name: string
          job_title: string
          job_description: string | null
          job_url: string | null
          location: string | null
          salary_range: string | null
          application_date: string
          status: string
          notes: string | null
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id?: string | null
          company_name: string
          job_title: string
          job_description?: string | null
          job_url?: string | null
          location?: string | null
          salary_range?: string | null
          application_date?: string
          status?: string
          notes?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          document_id?: string | null
          company_name?: string
          job_title?: string
          job_description?: string | null
          job_url?: string | null
          location?: string | null
          salary_range?: string | null
          application_date?: string
          status?: string
          notes?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          updated_at?: string
        }
      }
      job_application_activities: {
        Row: {
          id: string
          job_application_id: string
          activity_type: string
          activity_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_application_id: string
          activity_type: string
          activity_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          job_application_id?: string
          activity_type?: string
          activity_date?: string
          notes?: string | null
        }
      }
      job_application_reminders: {
        Row: {
          id: string
          job_application_id: string
          reminder_date: string
          title: string
          description: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_application_id: string
          reminder_date: string
          title: string
          description?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          job_application_id?: string
          reminder_date?: string
          title?: string
          description?: string | null
          is_completed?: boolean
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          title: string
          company_name: string
          company_logo_url: string | null
          description: string
          requirements: string | null
          location: string | null
          salary_range: string | null
          job_type: string
          experience_level: string | null
          posted_by: string
          is_active: boolean
          featured: boolean
          views_count: number
          applications_count: number
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          company_name: string
          company_logo_url?: string | null
          description: string
          requirements?: string | null
          location?: string | null
          salary_range?: string | null
          job_type: string
          experience_level?: string | null
          posted_by: string
          is_active?: boolean
          featured?: boolean
          views_count?: number
          applications_count?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          title?: string
          company_name?: string
          company_logo_url?: string | null
          description?: string
          requirements?: string | null
          location?: string | null
          salary_range?: string | null
          job_type?: string
          experience_level?: string | null
          posted_by?: string
          is_active?: boolean
          featured?: boolean
          views_count?: number
          applications_count?: number
          updated_at?: string
          expires_at?: string | null
        }
      }
      job_categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
        }
      }
      job_posting_categories: {
        Row: {
          job_posting_id: string
          category_id: string
        }
        Insert: {
          job_posting_id: string
          category_id: string
        }
        Update: {
          job_posting_id?: string
          category_id?: string
        }
      }
      document_collaborators: {
        Row: {
          id: string
          document_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          document_id?: string
          user_id?: string
          role?: string
          updated_at?: string
        }
      }
      document_edit_history: {
        Row: {
          id: string
          document_id: string
          user_id: string
          content: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          content: Json
          created_at?: string
        }
        Update: {
          document_id?: string
          user_id?: string
          content?: Json
          created_at?: string
        }
      }
      ai_settings: {
        Row: {
          id: string
          default_provider: "openai"
          openai_enabled: boolean
          gemini_enabled: boolean
          free_tier_credits: number
          pro_tier_credits: number
          enterprise_tier_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          default_provider?: "openai"
          openai_enabled?: boolean
          gemini_enabled?: boolean
          free_tier_credits?: number
          pro_tier_credits?: number
          enterprise_tier_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          default_provider?: "openai"
          openai_enabled?: boolean
          gemini_enabled?: boolean
          free_tier_credits?: number
          pro_tier_credits?: number
          enterprise_tier_credits?: number
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          user_id: string
          name: string
          original_url: string
          optimized_url: string
          mime_type: string
          size: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          original_url: string
          optimized_url: string
          mime_type: string
          size: number
          created_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          original_url?: string
          optimized_url?: string
          mime_type?: string
          size?: number
        }
      }
    }
  }
}
