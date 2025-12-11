
import { NgFor, NgClass, CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from "@angular/router";
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-interf-options',
  imports: [NgFor, RouterLink, CommonModule],
  templateUrl: './interf-options.html',
  styleUrls: ['./interf-options.css'],
})
export class InterfOptions implements OnInit {
  @Input() showini!: boolean;
  @Output() selectedOption = new EventEmitter<{ key: number; name: string }>();

  interfOptions = [
    { key: 0, name: 'Dashboard', iconUrl: '/assets/icons/dashboard_0.svg', activeIconUrl: '/assets/icons/dashboard_1.svg', path: "" },
    { key: 1, name: 'Income', iconUrl: '/assets/icons/income_0.svg', activeIconUrl: '/assets/icons/income_1.svg', path: "/income" },
    { key: 2, name: 'Expenses', iconUrl: '/assets/icons/expense_0.svg', activeIconUrl: '/assets/icons/expense_1.svg', path: "/expenses" },
    { key: 4, name: 'Products', iconUrl: '/assets/icons/products_0.svg', activeIconUrl: '/assets/icons/products_1.svg', path: "/products" },
    { key: 3, name: 'Employees', iconUrl: '/assets/icons/employees_0.svg', activeIconUrl: '/assets/icons/employees_1.svg', path: "/employees" }
  ];

  activeinterfOptionsKey = 0;
  avatarUrl: string | null = null;
  userName = 'User';

  constructor(
    private auth: AuthService,
    private router: Router,
    private dash: DashboardService
  ) {}

  async ngOnInit() {
    // Load user info for avatar
    const user = await this.dash.loadCurrentUser();
    if (user) {
      this.avatarUrl = user.avatar_url || null;
      this.userName = `${user.first_name} ${user.last_name}`;
    }

    // Adjust options based on showini input
    if (!this.showini) {
      this.interfOptions = this.interfOptions.filter(opt => [0, 1, 2].includes(opt.key));
    }

    // Set active option based on current route
    this.updateActiveOption(this.router.url);

    // Listen to route changes to update active option
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveOption(event.url);
    });
  }

  updateActiveOption(url: string) {
    // Check if we're on profile page
    if (url.includes('/profile')) {
      this.activeinterfOptionsKey = -1;
      return;
    }

    // Find matching option by path
    const matchingOption = this.interfOptions.find(opt => {
      if (opt.path === "" && url === "/") return true;
      if (opt.path !== "" && url.includes(opt.path)) return true;
      return false;
    });

    if (matchingOption) {
      this.activeinterfOptionsKey = matchingOption.key;
    }
  }

  setActiveByUrl(url: string) {
  const activeOption = this.interfOptions.find(f => f.path === url);
    if (activeOption) {
      this.activeinterfOptionsKey = activeOption.key;
      this.selectedOption.emit(activeOption);
    } else {
      this.activeinterfOptionsKey = 0; // default
    }
  }

  setActiveinterfOptionsKey(key: number) {
    this.activeinterfOptionsKey = key;
    const selected = this.interfOptions.find(f => f.key === key);
    if (selected) this.selectedOption.emit(selected);
  }

  getAvatarUrl(): string {
    return this.avatarUrl || '/assets/images/default-avatar.png';
  }

  hasAvatar(): boolean {
    return !!this.avatarUrl;
  }

  getInitials(): string {
    const names = this.userName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }

logout() {
    // Clear dashboard service cache
    this.dash['_cachedUser'] = undefined;
    
    // Logout via auth service (which clears everything)
    this.auth.logout();
  }

}
