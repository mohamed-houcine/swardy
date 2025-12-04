export enum ScanType {
  BARCODE = 'barcode',
  MANUAL = 'manual'
}
export enum IncomeType{
  SOURCE='source',
  Product='product'
}

export interface Income {
  id: string;
  name:string;
  amount: number;
  quantity?: number;        
  date: string;             
  scan_type?: ScanType;     
  notes?: string;
  productId?: string;       
  userId: string; 
  type:IncomeType;          
}
