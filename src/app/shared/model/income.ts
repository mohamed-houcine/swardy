export enum ScanType {
  BARCODE = 'barcode',
  MANUAL = 'manual'
}

export enum IncomeSourceType {
  PERSONAL = 'personal',
  BUSINESS = 'business'
}

export interface Income {
  id: string;
  amount: number;
  quantity?: number;        
  date: string;             
  scan_type?: ScanType;     
  notes?: string;
  productId?: string;       
  userId: string;           
  source_type: IncomeSourceType;
}
