// Supabase Database Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          location: string
          phone: string
          company: string
          initials: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: string
          location?: string
          phone: string
          company: string
          initials?: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          location?: string
          phone?: string
          company?: string
          initials?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          name: string
          location: string
          type: string
          total_units: number
          occupied_units: number
          monthly_revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          location: string
          type: string
          total_units: number
          occupied_units: number
          monthly_revenue: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          location?: string
          type?: string
          total_units?: number
          occupied_units?: number
          monthly_revenue?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          id: string
          owner_id: string
          name: string
          initials: string
          unit: string
          property_id: string
          property_name: string
          rent: number
          lease_start: string
          lease_end: string
          status: string
          email: string
          phone: string
          nrc: string
          sex: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          initials: string
          unit: string
          property_id: string
          property_name: string
          rent: number
          lease_start: string
          lease_end: string
          status: string
          email: string
          phone: string
          nrc: string
          sex: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          initials?: string
          unit?: string
          property_id?: string
          property_name?: string
          rent?: number
          lease_start?: string
          lease_end?: string
          status?: string
          email?: string
          phone?: string
          nrc?: string
          sex?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          id: string
          owner_id: string
          property_id: string
          unit_name: string
          unit_number: string | null
          floor: string | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          rent_amount: number
          status: string
          tenant_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          property_id: string
          unit_name: string
          unit_number?: string | null
          floor?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          rent_amount?: number
          status?: string
          tenant_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string
          unit_name?: string
          unit_number?: string | null
          floor?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          rent_amount?: number
          status?: string
          tenant_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          owner_id: string
          tenant_id: string
          tenant: string
          unit: string
          amount: number
          method: string
          ref: string
          status: string
          date: string
          period: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          tenant_id: string
          tenant: string
          unit: string
          amount: number
          method: string
          ref: string
          status: string
          date: string
          period: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          tenant_id?: string
          tenant?: string
          unit?: string
          amount?: number
          method?: string
          ref?: string
          status?: string
          date?: string
          period?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_issues: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          tenant: string
          tenant_id: string
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          tenant: string
          tenant_id: string
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          tenant?: string
          tenant_id?: string
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          tenant: string
          tenant_id: string
          unit: string
          category: string
          status: string
          priority: string
          date: string
          assignee: string | null
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          tenant: string
          tenant_id: string
          unit: string
          category: string
          status: string
          priority: string
          date: string
          assignee?: string | null
          icon: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          tenant?: string
          tenant_id?: string
          unit?: string
          category?: string
          status?: string
          priority?: string
          date?: string
          assignee?: string | null
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity: {
        Row: {
          id: string
          owner_id: string
          type: string
          icon: string
          text: string
          time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          type: string
          icon: string
          text: string
          time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          type?: string
          icon?: string
          text?: string
          time?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      revenue_data: {
        Row: {
          id: string
          owner_id: string
          month: string
          cbd: number
          ndola: number
          parklands: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          month: string
          cbd: number
          ndola: number
          parklands: number
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          month?: string
          cbd?: number
          ndola?: number
          parklands?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          owner_id: string
          type: string
          title: string
          message: string
          time: string
          read: boolean
          link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          type: string
          title: string
          message: string
          time: string
          read?: boolean
          link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          type?: string
          title?: string
          message?: string
          time?: string
          read?: boolean
          link?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
  }
}
