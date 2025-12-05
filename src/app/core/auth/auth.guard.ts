import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const { data } = await this.supabase.client.auth.getUser();

    if (!data.user) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
