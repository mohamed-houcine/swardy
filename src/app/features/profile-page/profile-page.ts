import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { User, UserRole, UserType, ThemeMode } from '../../shared/model/user';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Country } from '../../shared/model/country';
import { Currency } from '../../shared/model/currency';


@Component({
  selector: 'app-profile-page',
  imports: [FormsModule,NgIf,NgFor,NgClass,RouterLink],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
user: User | null = null;
  formData: Partial<User> = {};
  loading = true;
  editing = false;
  saving = false;
  uploadingAvatar = false;
  error: string | null = null;
  successMessage: string | null = null;
  countries!: Country[];
  currencies!: Currency[];

  // Enums for template
  UserRole = UserRole;
  UserType = UserType;
  ThemeMode = ThemeMode;


  genders = ['Male', 'Female'];

  constructor(public dashboardService: DashboardService
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
    const [countries, currencies] = await Promise.all([
      this.dashboardService.fetchCountries(),
      this.dashboardService.fetchCurrencies()
    ]);
    this.countries = countries;
    this.currencies = currencies;

    const matchedCountry = countries.find(
      c => c.name === this.user?.country
    );

    // Set the model value to the category id so the <select> preselects
    if (matchedCountry) {
      this.formData.country = matchedCountry.id;
      console.log(this.formData.country);
    }

    const matchedCurrency = currencies.find(
      c => c.name === this.user?.currency
    );

    // Set the model value to the category id so the <select> preselects
    if (matchedCurrency) {
      this.formData.currency = matchedCurrency.id;
      console.log(this.formData.currency);
    }
    
    this.loading = false;
  }

  async loadUserProfile() {
    try {
      this.error = null;
      
      const userData = await this.dashboardService.loadCurrentUser(true);
      
      if (userData) {
        this.user = userData;
        this.formData = { ...userData };
      } else {
        this.error = 'Unable to load user profile';
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      this.error = 'An error occurred while loading your profile';
    }
  }

  startEditing() {
    this.editing = true;
    this.formData = { ...this.user };
    this.error = null;
    this.successMessage = null;
  }

  cancelEditing() {
    this.editing = false;
    this.formData = { ...this.user };
    this.error = null;
    this.successMessage = null;
  }

  async saveProfile() {
    try {
      this.saving = true;
      this.error = null;
      this.successMessage = null;

      // Validate required fields
      if (!this.formData.first_name?.trim()) {
        this.error = 'First name is required';
        return;
      }
      if (!this.formData.last_name?.trim()) {
        this.error = 'Last name is required';
        return;
      }
      if (!this.formData.email?.trim()) {
        this.error = 'Email is required';
        return;
      }

      // Call update service
      await this.dashboardService.updateUserProfile(this.formData);

      // Reload user data
      await this.loadUserProfile();
      
      this.editing = false;
      this.successMessage = 'Profile updated successfully!';

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);

    } catch (err) {
      console.error('Error saving profile:', err);
      this.error = 'An error occurred while saving your profile';
    } finally {
      this.saving = false;
    }
  }

  // Handle avatar upload
  async onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file';
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.error = 'Image size must be less than 2MB';
      return;
    }

    try {
      this.uploadingAvatar = true;
      this.error = null;

      const avatarUrl = await this.dashboardService.uploadAvatar(file);
      
      if (avatarUrl) {
        // Update user profile with new avatar
        await this.dashboardService.updateUserProfile({ avatar_url: avatarUrl });
        
        // Reload profile to show new avatar
        await this.loadUserProfile();
        
        this.successMessage = 'Avatar updated successfully!';
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      this.error = 'Failed to upload avatar. Please try again.';
    } finally {
      this.uploadingAvatar = false;
    }
  }

  // Trigger file input click
  triggerAvatarUpload() {
    const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'badge-admin';
      case UserRole.EMPLOYEE:
        return 'badge-employee';
      default:
        return 'badge-default';
    }
  }

  getTypeBadgeClass(type: UserType): string {
    return type === UserType.BUSINESS ? 'badge-business' : 'badge-personal';
  }

  getInitials(): string {
    if (!this.user) return '';
    return `${this.user.first_name[0]}${this.user.last_name[0]}`.toUpperCase();
  }

  getAvatarUrl(): string {
    return this.user?.avatar_url || '';
  }

  hasAvatar(): boolean {
    return !!this.user?.avatar_url;
  }

  getThemeIcon(): string {
    return this.user?.theme === ThemeMode.DARK ? '🌙' : '☀️';
  }

  
  
}
