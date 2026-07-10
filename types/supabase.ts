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
          created_at?: string
          updated_at?: string
        }
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
      }
    }
    Views: {}
    Functions: {}
  }
}
