import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

import { UserRole, UserType, ThemeMode } from '../../shared/model/user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private supabase: SupabaseService, private router: Router) {}

  // ------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  }

  // ------------------------------------------------------
  // SIGNUP (Auth + Insert user profile)
  // ------------------------------------------------------
  async signup(userData: {
    email: string;
    password: string;
    type: UserType;
    role: UserRole;
    first_name: string;
    last_name: string;
    tel_number?: number;
    id_country?: string;
    id_currency?: string;
    username: string;
    language?: string;
    theme?: ThemeMode;
    id_manager?: string;
  }) {
    // 1️⃣ Create Supabase Auth user
    const { data, error } = await this.supabase.client.auth.signUp({
      email: userData.email,
      password: userData.password
    });

    if (error) throw error;

    const authUser = data.user;
    if (!authUser) throw new Error('Signup failed: no user returned');

    // 2️⃣ Insert full profile into "users" table
    const { error: dbError } = await this.supabase.client
      .from('users')
      .insert({
        id: authUser.id,
        type: userData.type,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name,
        tel_number: userData.tel_number ?? null,
        email: userData.email,
        id_country: userData.id_country ?? null,
        id_currency: userData.id_currency ?? null,
        username: userData.username,
        language: userData.language ?? 'en',
        theme: userData.theme ?? ThemeMode.LIGHT,
        id_manager: userData.id_manager ?? null,
      });

    if (dbError) throw dbError;

    return authUser;
  }

  // ------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------
  async logout() {
    await this.supabase.client.auth.signOut();
    this.router.navigate(['/login']);
  }

  // ------------------------------------------------------
  // CHECK IF USER IS LOGGED IN
  // ------------------------------------------------------
  async isLoggedIn(): Promise<boolean> {
    const { data } = await this.supabase.client.auth.getUser();
    return !!data.user;
  }

  // ------------------------------------------------------
  // GET CURRENT USER PROFILE
  // ------------------------------------------------------
  async getProfile() {
    const { data } = await this.supabase.client.auth.getUser();
    const authUser = data.user;

    if (!authUser) return null;

    const { data: profile } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return profile;
  }
}
