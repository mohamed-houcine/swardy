import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase!: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://hgangjgiinkgrradsltn.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYW5namdpaW5rZ3JyYWRzbHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzAzMDQsImV4cCI6MjA4MDQ0NjMwNH0.z0XizNGezA3UIUSPwkPMSs82hgKqa9WYIgsrFvi7UU8',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          // Add these options:
          storageKey: 'sb-auth-token', // Simplified key
          storage: window.localStorage,
        },
        global: {
          headers: {
            'x-client-info': 'supabase-js-web'
          }
        }
      }
    );
  }

  get client() {
    return this.supabase;
  }
}
