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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      incident_details: {
        Row: {
          agency_source: string | null
          body_part: string | null
          id: number
          immediate_cause: string | null
          incident_id: number
          mechanism: string | null
          nature_of_injury: string | null
        }
        Insert: {
          agency_source?: string | null
          body_part?: string | null
          id?: number
          immediate_cause?: string | null
          incident_id: number
          mechanism?: string | null
          nature_of_injury?: string | null
        }
        Update: {
          agency_source?: string | null
          body_part?: string | null
          id?: number
          immediate_cause?: string | null
          incident_id?: number
          mechanism?: string | null
          nature_of_injury?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_details_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          activity: string | null
          contractor_id: string | null
          critical_level: string | null
          date: string
          description: string | null
          id: number
          incident_name: string | null
          inserted_at: string | null
          place: string | null
          severity_level: number | null
          time: string | null
          type: string | null
        }
        Insert: {
          activity?: string | null
          contractor_id?: string | null
          critical_level?: string | null
          date: string
          description?: string | null
          id?: number
          incident_name?: string | null
          inserted_at?: string | null
          place?: string | null
          severity_level?: number | null
          time?: string | null
          type?: string | null
        }
        Update: {
          activity?: string | null
          contractor_id?: string | null
          critical_level?: string | null
          date?: string
          description?: string | null
          id?: number
          incident_name?: string | null
          inserted_at?: string | null
          place?: string | null
          severity_level?: number | null
          time?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          date: string
          id: number
          inserted_at: string | null
          inspector: string | null
          score: number | null
          type: string | null
        }
        Insert: {
          date: string
          id?: number
          inserted_at?: string | null
          inspector?: string | null
          score?: number | null
          type?: string | null
        }
        Update: {
          date?: string
          id?: number
          inserted_at?: string | null
          inspector?: string | null
          score?: number | null
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          conductor: string | null
          date: string
          id: number
          inserted_at: string | null
          no_of_attendees: number | null
          topic: string | null
          type: string | null
        }
        Insert: {
          conductor?: string | null
          date: string
          id?: number
          inserted_at?: string | null
          no_of_attendees?: number | null
          topic?: string | null
          type?: string | null
        }
        Update: {
          conductor?: string | null
          date?: string
          id?: number
          inserted_at?: string | null
          no_of_attendees?: number | null
          topic?: string | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: { sql: string }
        Returns: undefined
      }
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
