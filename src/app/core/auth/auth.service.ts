// auth.service.ts - Fixed version without username

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { UserRole, UserType } from '../../shared/model/user';

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  tel_number?: number;
  type: UserType;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  }

  async signup(signupData: SignupData) {
    try {
      console.log('🔵 Starting signup process...');

      // ÉTAPE 1: Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await this.supabase.client
        .from('users')
        .select('id, email')
        .eq('email', signupData.email)
        .single();

      if (existingUser) {
        throw new Error('This email is already registered. Please login instead.');
      }

      // ÉTAPE 2: Créer l'utilisateur auth
      console.log('📤 Creating auth user...');
      
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.first_name,
            last_name: signupData.last_name,
            type: signupData.type,
            role: signupData.role
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user - no user returned');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // ÉTAPE 3: Attendre un peu pour que le trigger s'exécute
      await new Promise(resolve => setTimeout(resolve, 500));

      // ÉTAPE 4: Vérifier si le profil a été créé par le trigger
      const { data: profileCheck, error: checkError } = await this.supabase.client
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!profileCheck || checkError) {
        console.warn('⚠️ Profile not created by trigger, creating manually...');

        // ÉTAPE 5: Créer le profil manuellement
        const profileData: any = {
          id: authData.user.id,
          email: signupData.email,
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          type: signupData.type,
          role: signupData.role,
          language: 'en',
          theme: 'light'
        };

        // Only add tel_number if it exists
        if (signupData.tel_number) {
          profileData.tel_number = signupData.tel_number;
        }

        console.log('📝 Inserting profile data:', profileData);

        const { data: insertedData, error: profileError } = await this.supabase.client
          .from('users')
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile creation error:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
          
          // ⚠️ Note: Cannot delete auth user from client side
          // The user will remain in auth.users without a profile
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        console.log('✅ Profile created manually:', insertedData);
      } else {
        console.log('✅ Profile created by trigger');
      }

      return authData.user;
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  async logout() {
    // Clear Supabase session
    await this.supabase.client.auth.signOut();
    
    // Clear any cached data
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  async getProfile() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase.client
      .from('users')
      .select('role, type')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('getProfile error:', error);
      return null;
    }

    return data;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    return !!user;
  }
}