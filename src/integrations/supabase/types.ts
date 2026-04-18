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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          reason: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          reason?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_request_responses: {
        Row: {
          created_at: string
          id: string
          message: string | null
          request_id: string
          responder_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          request_id: string
          responder_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          request_id?: string
          responder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_request_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string | null
          contact_phone: string
          created_at: string
          hospital: string
          id: string
          is_active: boolean
          is_urgent: boolean
          lat: number | null
          lng: number | null
          notes: string | null
          patient_name: string
          requester_id: string
          units_needed: number
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city?: string | null
          contact_phone: string
          created_at?: string
          hospital: string
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          lat?: number | null
          lng?: number | null
          notes?: string | null
          patient_name: string
          requester_id: string
          units_needed?: number
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          city?: string | null
          contact_phone?: string
          created_at?: string
          hospital?: string
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          lat?: number | null
          lng?: number | null
          notes?: string | null
          patient_name?: string
          requester_id?: string
          units_needed?: number
        }
        Relationships: []
      }
      doctors: {
        Row: {
          city: string | null
          consultation_fee: number | null
          created_at: string
          full_name: string
          id: string
          is_available: boolean
          lat: number | null
          lng: number | null
          qualification: string | null
          rating: number | null
          specialization: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          consultation_fee?: number | null
          created_at?: string
          full_name: string
          id?: string
          is_available?: boolean
          lat?: number | null
          lng?: number | null
          qualification?: string | null
          rating?: number | null
          specialization: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          consultation_fee?: number | null
          created_at?: string
          full_name?: string
          id?: string
          is_available?: boolean
          lat?: number | null
          lng?: number | null
          qualification?: string | null
          rating?: number | null
          specialization?: string
          user_id?: string | null
        }
        Relationships: []
      }
      medicines: {
        Row: {
          created_at: string
          form: string | null
          generic_name: string | null
          id: string
          manufacturer: string | null
          mrp: number | null
          name: string
          strength: string | null
        }
        Insert: {
          created_at?: string
          form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          mrp?: number | null
          name: string
          strength?: string | null
        }
        Update: {
          created_at?: string
          form?: string | null
          generic_name?: string | null
          id?: string
          manufacturer?: string | null
          mrp?: number | null
          name?: string
          strength?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          med_id: string | null
          med_name: string
          order_id: string
          qty: number
          unit_price: number
        }
        Insert: {
          id?: string
          med_id?: string | null
          med_name: string
          order_id: string
          qty: number
          unit_price: number
        }
        Update: {
          id?: string
          med_id?: string | null
          med_name?: string
          order_id?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string
          id: string
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          pharmacy_id: string
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          id?: string
          patient_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pharmacy_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          id?: string
          patient_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pharmacy_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          is_open: boolean
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          rating: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          city?: string
          created_at?: string
          id?: string
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pharmacy_inventory: {
        Row: {
          id: string
          med_id: string
          pharmacy_id: string
          price: number
          stock_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          med_id: string
          pharmacy_id: string
          price: number
          stock_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          med_id?: string
          pharmacy_id?: string
          price?: number
          stock_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_inventory_med_id_fkey"
            columns: ["med_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_inventory_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          extracted: Json | null
          id: string
          image_url: string | null
          ocr_text: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          extracted?: Json | null
          id?: string
          image_url?: string | null
          ocr_text?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          extracted?: Json | null
          id?: string
          image_url?: string | null
          ocr_text?: string | null
          patient_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          lat: number | null
          lng: number | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          created_at: string
          id: string
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "pharmacy" | "doctor" | "admin"
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "held" | "released" | "refunded"
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
    Enums: {
      app_role: ["patient", "pharmacy", "doctor", "admin"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "held", "released", "refunded"],
    },
  },
} as const
