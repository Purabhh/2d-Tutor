export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tutors: {
        Row: {
          id: string
          user_id: string
          name: string
          soul_md: string
          voice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          soul_md?: string
          voice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          soul_md?: string
          voice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tutors_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      sources: {
        Row: {
          id: string
          tutor_id: string
          name: string
          type: string
          storage_path: string | null
          original_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          name: string
          type: string
          storage_path?: string | null
          original_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          name?: string
          type?: string
          storage_path?: string | null
          original_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sources_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['id']
          }
        ]
      }
      chunks: {
        Row: {
          id: string
          source_id: string
          tutor_id: string
          content: string
          embedding: string | null
          chunk_index: number
          created_at: string
        }
        Insert: {
          id?: string
          source_id: string
          tutor_id: string
          content: string
          embedding?: string | null
          chunk_index: number
          created_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          tutor_id?: string
          content?: string
          embedding?: string | null
          chunk_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chunks_source_id_fkey'
            columns: ['source_id']
            isOneToOne: false
            referencedRelation: 'sources'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chunks_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          tutor_id: string
          role: string
          content: string
          image_url: string | null
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          role: string
          content: string
          image_url?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          role?: string
          content?: string
          image_url?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_tutor_id_fkey'
            columns: ['tutor_id']
            isOneToOne: false
            referencedRelation: 'tutors'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: string
          match_tutor_id: string
          match_count?: number
          match_threshold?: number
        }
        Returns: {
          id: string
          source_id: string
          content: string
          chunk_index: number
          similarity: number
        }[]
        SetofOptions: undefined
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tutor = Database['public']['Tables']['tutors']['Row']
export type Source = Database['public']['Tables']['sources']['Row']
export type Chunk = Database['public']['Tables']['chunks']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
