import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { User, UserRole, UserType, ThemeMode } from '../../shared/model/user';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';


@Component({
  selector: 'app-profile-page',
  imports: [FormsModule,NgIf,NgClass,RouterLink],
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

  // Enums for template
  UserRole = UserRole;
  UserType = UserType;
  ThemeMode = ThemeMode;

  // Options for dropdowns
  languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' }
  ];

  genders = ['Male', 'Female'];

  constructor(public dashboardService: DashboardService
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.loading = true;
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
    } finally {
      this.loading = false;
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

  getLanguageLabel(code: string): string {
    const lang = this.languages.find(l => l.value === code);
    return lang ? lang.label : code;
  }

  getThemeIcon(): string {
    return this.user?.theme === ThemeMode.DARK ? '🌙' : '☀️';
  }

  
  
}
