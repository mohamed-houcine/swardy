import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserType, ThemeMode } from '../../shared/model/user';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
 UserType = UserType;
  UserRole = UserRole;
  // Form fields
  email = '';
  password = '';
  first_name = '';
  last_name = '';
  username = '';
  tel_number?: number;

  type: UserType = UserType.PERSONAL;
  role: UserRole = UserRole.ADMIN;

  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    try {
      await this.auth.signup({
        email: this.email,
        password: this.password,
        first_name: this.first_name,
        last_name: this.last_name,
        username: this.username,
        tel_number: this.tel_number,
        type: this.type,
        role: this.role,
      });

      this.router.navigate(['/']); // redirect to home/dashboard
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
