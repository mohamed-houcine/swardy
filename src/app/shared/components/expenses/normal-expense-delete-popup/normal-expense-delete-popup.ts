// income-delete-popup.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-source-delete-popup',
  standalone: true,
  templateUrl: './normal-expense-delete-popup.html',
  styleUrls: ['./normal-expense-delete-popup.css']
})
export class NormalExpenseDeletePopup {
  constructor(
    private dialogRef: MatDialogRef<NormalExpenseDeletePopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  async confirmDelete(): Promise<void> {
    try {
      await this.dash.deleteNormalExpense(this.data.id, this.data.rowData.receipt);
      
      console.log('Deleting income with ID:', this.data.id);
      
      this.dialogRef.close('deleted'); // Return 'deleted' to refresh the table
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  }
}