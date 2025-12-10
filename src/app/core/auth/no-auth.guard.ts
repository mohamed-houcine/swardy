import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { UserRole } from '../../shared/model/user';
@Injectable({ providedIn: 'root' })
export class NoAuthGuard {

  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const { data } = await this.supabase.client.auth.getUser();
    console.log("user",data.user);
    console.log("role",data.user?.role);
    if (data.user) {
      if(data.user?.role==UserRole.EMPLOYEE){  
        this.router.navigate(['/employee']);
        console.log("role1",data.user?.role);
        console.log("user1",data.user);
      }else{
    
      this.router.navigate(['/']);
      console.log("role2",data.user?.role);
      console.log("user2",data.user);
    }
      return false;
    }

    return true;
  }
}
