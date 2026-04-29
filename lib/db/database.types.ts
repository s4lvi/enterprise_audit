export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          actor_id: string | null;
          id: number;
          new_data: Json | null;
          occurred_at: string;
          old_data: Json | null;
          operation: string;
          row_id: string | null;
          table_name: string;
        };
        Insert: {
          actor_id?: string | null;
          id?: number;
          new_data?: Json | null;
          occurred_at?: string;
          old_data?: Json | null;
          operation: string;
          row_id?: string | null;
          table_name: string;
        };
        Update: {
          actor_id?: string | null;
          id?: number;
          new_data?: Json | null;
          occurred_at?: string;
          old_data?: Json | null;
          operation?: string;
          row_id?: string | null;
          table_name?: string;
        };
        Relationships: [];
      };
      audits: {
        Row: {
          audited_on: string;
          auditor_id: string;
          capability_score: number;
          created_at: string;
          enterprise_id: string;
          feasibility_score: number;
          id: string;
          progress_score: number;
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          audited_on?: string;
          auditor_id: string;
          capability_score: number;
          created_at?: string;
          enterprise_id: string;
          feasibility_score: number;
          id?: string;
          progress_score: number;
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          audited_on?: string;
          auditor_id?: string;
          capability_score?: number;
          created_at?: string;
          enterprise_id?: string;
          feasibility_score?: number;
          id?: string;
          progress_score?: number;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audits_auditor_id_fkey";
            columns: ["auditor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audits_enterprise_id_fkey";
            columns: ["enterprise_id"];
            isOneToOne: false;
            referencedRelation: "enterprises";
            referencedColumns: ["id"];
          },
        ];
      };
      chapters: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      enterprise_check_items: {
        Row: {
          archived: boolean;
          created_at: string;
          description: string | null;
          id: string;
          label: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          archived?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          label: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          archived?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          label?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      enterprise_checks: {
        Row: {
          check_item_id: string;
          created_at: string;
          enterprise_id: string;
        };
        Insert: {
          check_item_id: string;
          created_at?: string;
          enterprise_id: string;
        };
        Update: {
          check_item_id?: string;
          created_at?: string;
          enterprise_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enterprise_checks_check_item_id_fkey";
            columns: ["check_item_id"];
            isOneToOne: false;
            referencedRelation: "enterprise_check_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enterprise_checks_enterprise_id_fkey";
            columns: ["enterprise_id"];
            isOneToOne: false;
            referencedRelation: "enterprises";
            referencedColumns: ["id"];
          },
        ];
      };
      enterprise_members: {
        Row: {
          created_at: string;
          enterprise_id: string;
          profile_id: string;
          role: Database["public"]["Enums"]["enterprise_member_role"];
        };
        Insert: {
          created_at?: string;
          enterprise_id: string;
          profile_id: string;
          role?: Database["public"]["Enums"]["enterprise_member_role"];
        };
        Update: {
          created_at?: string;
          enterprise_id?: string;
          profile_id?: string;
          role?: Database["public"]["Enums"]["enterprise_member_role"];
        };
        Relationships: [
          {
            foreignKeyName: "enterprise_members_enterprise_id_fkey";
            columns: ["enterprise_id"];
            isOneToOne: false;
            referencedRelation: "enterprises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enterprise_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      enterprise_relationships: {
        Row: {
          created_at: string;
          created_by: string | null;
          from_id: string;
          id: string;
          notes: string | null;
          to_id: string;
          type: Database["public"]["Enums"]["relationship_type"];
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          from_id: string;
          id?: string;
          notes?: string | null;
          to_id: string;
          type: Database["public"]["Enums"]["relationship_type"];
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          from_id?: string;
          id?: string;
          notes?: string | null;
          to_id?: string;
          type?: Database["public"]["Enums"]["relationship_type"];
        };
        Relationships: [
          {
            foreignKeyName: "enterprise_relationships_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enterprise_relationships_from_id_fkey";
            columns: ["from_id"];
            isOneToOne: false;
            referencedRelation: "enterprises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enterprise_relationships_to_id_fkey";
            columns: ["to_id"];
            isOneToOne: false;
            referencedRelation: "enterprises";
            referencedColumns: ["id"];
          },
        ];
      };
      enterprises: {
        Row: {
          business_plan_notes: string | null;
          business_plan_url: string | null;
          category: string | null;
          chapter_id: string;
          contact_external: string | null;
          contact_member_id: string | null;
          created_at: string;
          created_by: string | null;
          founded_on: string | null;
          id: string;
          lat: number | null;
          lng: number | null;
          location_name: string | null;
          name: string;
          outline: string | null;
          resources_needed: string | null;
          stage: Database["public"]["Enums"]["enterprise_stage"];
          updated_at: string;
        };
        Insert: {
          business_plan_notes?: string | null;
          business_plan_url?: string | null;
          category?: string | null;
          chapter_id: string;
          contact_external?: string | null;
          contact_member_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          founded_on?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          location_name?: string | null;
          name: string;
          outline?: string | null;
          resources_needed?: string | null;
          stage?: Database["public"]["Enums"]["enterprise_stage"];
          updated_at?: string;
        };
        Update: {
          business_plan_notes?: string | null;
          business_plan_url?: string | null;
          category?: string | null;
          chapter_id?: string;
          contact_external?: string | null;
          contact_member_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          founded_on?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          location_name?: string | null;
          name?: string;
          outline?: string | null;
          resources_needed?: string | null;
          stage?: Database["public"]["Enums"]["enterprise_stage"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enterprises_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enterprises_contact_member_id_fkey";
            columns: ["contact_member_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enterprises_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          chapter_id: string | null;
          created_at: string;
          display_name: string;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          chapter_id?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          chapter_id?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_chapter_id: { Args: never; Returns: string };
      current_user_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin: { Args: never; Returns: boolean };
      is_auditor_or_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      enterprise_member_role: "founder" | "lead" | "contributor" | "advisor";
      enterprise_stage: "idea" | "validating" | "building" | "launched" | "scaling" | "paused";
      relationship_type: "partner" | "supplier" | "customer" | "competitor" | "parent" | "spinoff";
      user_role: "admin" | "auditor" | "chapter_exec" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      enterprise_member_role: ["founder", "lead", "contributor", "advisor"],
      enterprise_stage: ["idea", "validating", "building", "launched", "scaling", "paused"],
      relationship_type: ["partner", "supplier", "customer", "competitor", "parent", "spinoff"],
      user_role: ["admin", "auditor", "chapter_exec", "member"],
    },
  },
} as const;
