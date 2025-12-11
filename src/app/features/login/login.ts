import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  error = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private auth: AuthService,
    private dash: DashboardService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Clear any existing cache
    this.dash['_cachedUser'] = undefined;
  }

  async submit(event: Event) {
    event.preventDefault();
    this.error = '';

    try {
      // Clear cache before login
      this.dash['_cachedUser'] = undefined;
      
      // Login
      const user = await this.auth.login(this.email, this.password);

      // Force fresh profile load
      const profile = await this.dash.loadCurrentUser(true);

      if (!profile) {
        this.error = 'Profile not found';
        return;
      }

      console.log('Logged in user:', profile);

      // Redirect based on role
      if (profile.role === 'Employee') {
        this.router.navigate(['/employee']);
      } else {
        this.router.navigate(['/']);
      }

    } catch (err: any) {
      this.error = err.message || 'Login failed';
      console.error('Login error:', err);
    }
  }
}