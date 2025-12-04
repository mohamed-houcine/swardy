import { IncomeType } from "./income";

export enum Type {
  INCOME = 'income',
  EXPENSE = 'expense'
}


export interface Transaction {
  amount: number;
  date: string;            
  name: string;   
  type:Type;
  incomeType?:IncomeType;

 
}
