export enum UserType {
  PERSONAL = 'personal',
  BUSINESS = 'business'
}

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface User {
  id: string;          
  type: UserType;
  role: UserRole;
  first_name: string;
  last_name: string;
  tel_number: number;
  email: string;       
  id_country: string;
  id_currency: string;
  username: string;
  language: string;
  theme: ThemeMode;
  id_manager?: string;
}
