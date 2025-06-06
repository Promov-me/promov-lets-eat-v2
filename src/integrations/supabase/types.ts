export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      configuracao_campanha: {
        Row: {
          created_at: string | null
          id: string
          series_numericas: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          series_numericas?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          series_numericas?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      numeros_sorte: {
        Row: {
          created_at: string | null
          documento: string | null
          id: string
          numero: number
          obs: string | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          id?: string
          numero: number
          obs?: string | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          id?: string
          numero?: number
          obs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "numeros_sorte_documento_fkey"
            columns: ["documento"]
            isOneToOne: false
            referencedRelation: "numeros_cada_participante"
            referencedColumns: ["documento"]
          },
          {
            foreignKeyName: "numeros_sorte_documento_fkey"
            columns: ["documento"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["documento"]
          },
        ]
      }
      participantes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          data_cadastro: string | null
          documento: string
          email: string | null
          genero: string | null
          id: string
          nome: string | null
          numero: string | null
          rua: string | null
          senha: string | null
          telefone: string | null
          uf: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          data_cadastro?: string | null
          documento: string
          email?: string | null
          genero?: string | null
          id?: string
          nome?: string | null
          numero?: string | null
          rua?: string | null
          senha?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          data_cadastro?: string | null
          documento?: string
          email?: string | null
          genero?: string | null
          id?: string
          nome?: string | null
          numero?: string | null
          rua?: string | null
          senha?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      numeros_cada_participante: {
        Row: {
          cep: string | null
          cidade: string | null
          complemento: string | null
          documento: string | null
          email: string | null
          id: string | null
          nome: string | null
          numero: string | null
          numeros_sorte: number[] | null
          quantidade_numeros: number | null
          rua: string | null
          senha: string | null
          telefone: string | null
          uf: string | null
        }
        Relationships: []
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
