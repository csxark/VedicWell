export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dosha_assessments: {
        Row: {
          answers: Json
          claimed_at: string | null
          confidence: number | null
          created_at: string
          dominant_dosha: string
          guest_session_id: string | null
          id: string
          kapha_score: number
          key_traits: Json | null
          original_guest_session_id: string | null
          pitta_score: number
          prediction_source: string | null
          secondary_confidence: number | null
          secondary_dosha: string | null
          user_id: string | null
          vata_score: number
        }
        Insert: {
          answers?: Json
          claimed_at?: string | null
          confidence?: number | null
          created_at?: string
          dominant_dosha: string
          guest_session_id?: string | null
          id?: string
          kapha_score?: number
          key_traits?: Json | null
          original_guest_session_id?: string | null
          pitta_score?: number
          prediction_source?: string | null
          secondary_confidence?: number | null
          secondary_dosha?: string | null
          user_id?: string | null
          vata_score?: number
        }
        Update: {
          answers?: Json
          claimed_at?: string | null
          confidence?: number | null
          created_at?: string
          dominant_dosha?: string
          guest_session_id?: string | null
          id?: string
          kapha_score?: number
          key_traits?: Json | null
          original_guest_session_id?: string | null
          pitta_score?: number
          prediction_source?: string | null
          secondary_confidence?: number | null
          secondary_dosha?: string | null
          user_id?: string | null
          vata_score?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dominant_dosha: string | null
          full_name: string | null
          id: string
          kapha_percentage: number | null
          pitta_percentage: number | null
          updated_at: string
          user_id: string
          vata_percentage: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dominant_dosha?: string | null
          full_name?: string | null
          id?: string
          kapha_percentage?: number | null
          pitta_percentage?: number | null
          updated_at?: string
          user_id: string
          vata_percentage?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dominant_dosha?: string | null
          full_name?: string | null
          id?: string
          kapha_percentage?: number | null
          pitta_percentage?: number | null
          updated_at?: string
          user_id?: string
          vata_percentage?: number | null
        }
        Relationships: []
      }
      symptom_history: {
        Row: {
          additional_context: string | null
          ai_response: string | null
          created_at: string
          dosha_type: string | null
          id: string
          symptoms: string
          user_id: string
        }
        Insert: {
          additional_context?: string | null
          ai_response?: string | null
          created_at?: string
          dosha_type?: string | null
          id?: string
          symptoms: string
          user_id: string
        }
        Update: {
          additional_context?: string | null
          ai_response?: string | null
          created_at?: string
          dosha_type?: string | null
          id?: string
          symptoms?: string
          user_id?: string
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
