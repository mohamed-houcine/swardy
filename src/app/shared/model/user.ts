export enum UserType {
  PERSONAL = 'Personal',
  BUSINESS = 'Business'
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
}

