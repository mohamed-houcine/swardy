// signup.ts - Without username field

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserType } from '../../shared/model/user';
import { Country } from '../../shared/model/country';
import { Currency } from '../../shared/model/currency';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  UserType = UserType;
  UserRole = UserRole;

  // Form fields (WITHOUT username)
  model = {
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    tel_number: null,
    country: "",
    currency: "",
    accountType: UserType.PERSONAL
  }
  countries!: Country[];
  currencies!: Currency[];

  // UI state
  showPassword = false;
  showConfirmPassword = false;
  agreeTerms = false;
  error: string | null = null;
  isLoading = false;
  successMessage: string | null = null;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private dash: DashboardService
  ) {}

  async ngOnInit() {
    const [countries, currencies] = await Promise.all([
      this.dash.fetchCountries(),
      this.dash.fetchCurrencies()
    ]);
    this.countries = countries;
    this.currencies = currencies;
  }

  checkPasswordMismatch(): boolean {
    return this.model.password !== '' && 
           this.model.confirmPassword !== '' && 
           this.model.password !== this.model.confirmPassword;
  }

  validateForm(): string | null {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.model.email)) {
      return 'Please enter a valid email address';
    }

    // Password strength validation
    if (this.model.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    // Password match validation
    if (this.model.password !== this.model.confirmPassword) {
      return 'Passwords do not match';
    }

    // Name validation
    if (this.model.first_name.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }

    if (this.model.last_name.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }

    // Terms acceptance
    if (!this.agreeTerms) {
      return 'You must accept the Terms of Service and Privacy Policy';
    }

    // Country selection
    if(this.model.country === "") {
      return 'You must select a Country';
    }

    // Currency Selection
    if(this.model.currency === "") {
      return 'You must select a Currency';
    }

    // Gender selection
    if(this.model.gender === "") {
      return 'You must select your Gender';
    }

    return null;
  }

  async onSubmit(f: any) {
    // Reset messages
    this.error = null;
    this.successMessage = null;

    // Basic form validation
    if (f.invalid) {
      this.error = 'Please fill all required fields correctly';
      return;
    }

    // Custom validation
    const validationError = this.validateForm();
    if (validationError) {
      this.error = validationError;
      return;
    }

    try {
      this.isLoading = true;
      this.error = null;

      console.log('📝 Submitting signup with data:', {
        email: this.model.email,
        first_name: this.model.first_name,
        last_name: this.model.last_name,
        type: this.model.accountType,
        role: UserRole.ADMIN,
        tel_number: this.model.tel_number
      });

      // Call signup WITHOUT username
      await this.auth.signup({
        email: this.model.email.trim(),
        password: this.model.password,
        first_name: this.model.first_name.trim(),
        last_name: this.model.last_name.trim(),
        tel_number: this.model.tel_number,
        type: this.model.accountType,
        role: UserRole.ADMIN,
        country: this.model.country,
        currency: this.model.currency,
        gender: this.model.gender
      });

      // Show success message
      this.successMessage = 'Account created successfully! Redirecting to login...';
      console.log('✅ Signup successful!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Handle specific error types
      if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
        this.error = 'This email is already registered. Please login instead.';
      } else if (err.message?.includes('Invalid email')) {
        this.error = 'Please enter a valid email address';
      } else if (err.message?.includes('Password')) {
        this.error = 'Password must be at least 6 characters';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        this.error = 'Network error. Please check your connection and try again.';
      } else {
        this.error = err.message || 'Signup failed. Please try again.';
      }
      
      this.isLoading = false;
    }
  }

  // Helper method to get password strength
  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    if (this.model.password.length === 0) return 'weak';
    if (this.model.password.length < 6) return 'weak';
    if (this.model.password.length < 10) return 'medium';
    
    // Check for complexity
    const hasUpperCase = /[A-Z]/.test(this.model.password);
    const hasLowerCase = /[a-z]/.test(this.model.password);
    const hasNumbers = /\d/.test(this.model.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.model.password);
    
    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    if (complexityScore >= 3) return 'strong';
    if (complexityScore >= 2) return 'medium';
    return 'weak';
  }
}