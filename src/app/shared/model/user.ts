export enum UserType {
  PERSONAL = 'personal',
  BUSINESS = 'business'
}

export enum UserRole {
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee'
}

export enum ThemeMode {
  LIGHT = 'Light',
  DARK = 'Dark'
}

export interface User {
  id: string;
  type: UserType;
  role: UserRole;
  first_name: string;
  last_name: string;
  gender: string;
  tel_number: number;
  email: string;
  country: string;
  currency: string;
  language: string;
  theme: ThemeMode;
  id_manager?:string;
  avatar_url?: string| null;
  goal?: number;

}

