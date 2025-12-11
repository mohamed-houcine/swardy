// income-delete-popup.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-source-delete-popup',
  standalone: true,
  templateUrl: './income-source-delete-popup.html',
  styleUrls: ['./income-source-delete-popup.css']
})
export class IncomeSourceDeletePopup {
  constructor(
    private dialogRef: MatDialogRef<IncomeSourceDeletePopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  async confirmDelete(): Promise<void> {
    try {
      await this.dash.deleteIncomeSource(this.data.id);
      
      console.log('Deleting income with ID:', this.data.id);
      
      this.dialogRef.close('deleted'); // Return 'deleted' to refresh the table
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  }
}