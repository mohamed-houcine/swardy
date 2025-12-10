import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit(event: Event) {
  event.preventDefault();
  this.error = '';

  try {
    const user = await this.auth.login(this.email, this.password);

    // Get full profile (role)
    const profile = await this.auth.getProfile();

    if (!profile) {
      this.error = 'Profile not found';
      return;
    }

    // Redirect based on role
    if (profile.role === 'Employee') {
      this.router.navigate(['/employee']);
    } else {
      this.router.navigate(['/']); // Admin or other roles
    }

  } catch (err: any) {
    this.error = err.message;
  }
}

}
