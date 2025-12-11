// income-details-popup.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-details-popup',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './income-source-details-popup.html',
  styleUrls: ['./income-source-details-popup.css'],
})
export class IncomeSourceDetailsPopup {
  isEditMode: boolean = false;
  saveClicked: boolean = false;
  errorMessage: string = "";
  categories: any[] = [];

  model: any = {
    id: '',
    name: '',
    category: '',
    amount: 0,
    date: '',
    notes: ''
  };

  constructor(
    private dialogRef: MatDialogRef<IncomeSourceDetailsPopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {
    // Initialize model with row data
    this.model = { ...data.rowData };
    this.loadCategories();
  }

  async loadCategories() {
    try {
      this.categories = await this.dash.fetchCategoriesByType('income');

      // After categories load, match the model's category name to its id
      const matched = this.categories.find(
        c => c.name === this.model.category
      );

      // Set the model value to the category id so the <select> preselects
      if (matched) {
        this.model.category = matched.id;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset to original data if cancelled
      this.model = { ...this.data.rowData };
      // After categories load, match the model's category name to its id
      const matched = this.categories.find(
        c => c.name === this.model.category
      );

      // Set the model value to the category id so the <select> preselects
      if (matched) {
        this.model.category = matched.id;
      }
      this.errorMessage = "";
    }
  }

  animateSave() {
    this.saveClicked = true;
    setTimeout(() => this.saveClicked = false, 700);
  }

  async onSubmit(f: NgForm): Promise<void> {
    if (!this.checkValidity(f)) return;

    try {
      await this.dash.updateIncomeSource(this.model);
      this.errorMessage = "";
      this.animateSave();
      

      const categoryName = this.categories.find(c => c.id === this.model.category)?.name || 'Uncategorized';
      // Update the original data
      this.data.rowData = { ...this.model };
      
      setTimeout(() => {
        // Map category ID to name
        const categoryName = this.categories.find(c => c.id === this.model.category)?.name || 'Uncategorized';

        // Close the dialog and pass the updated row with category name
        this.dialogRef.close({ 
          updatedRow: { 
            ...this.model, 
            category: categoryName 
          } 
        });
      }, 700);
    } catch (error: any) {
      console.error('Error updating income:', error);
      this.errorMessage = error.message || "Failed to update income";
    }
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.name !== '' && this.model.amount > 0;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}