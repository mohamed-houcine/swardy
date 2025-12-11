// income-details-popup.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DashboardService } from '../../../../services/dashboard.service';

@Component({
  selector: 'app-income-details-popup',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './normal-expense-details-popup.html',
  styleUrls: ['./normal-expense-details-popup.css'],
})
export class NormalExpenseDetailsPopup {
  isEditMode: boolean = false;
  saveClicked: boolean = false;
  errorMessage: string = "";
  categories: any[] = [];

  selectedFile: File | null = null;

  model: any = {
    id: '',
    name: '',
    category: '',
    amount: 0,
    date: '',
    notes: ''
  };

  constructor(
    private dialogRef: MatDialogRef<NormalExpenseDetailsPopup>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; rowData: any },
    private dash: DashboardService
  ) {
    // Initialize model with row data
    this.model = { ...data.rowData };
    this.loadCategories();
  }

  async loadCategories() {
    try {
      this.categories = await this.dash.fetchCategoriesByType('expense');

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
      const newUrl = await this.dash.updateNormalExpense(this.model, this.selectedFile);

      this.errorMessage = "";
      this.animateSave();
      
      // Update the original data
      this.data.rowData = { ...this.model, receipt: newUrl};
      
      setTimeout(() => {
        // Map category ID to name
        const categoryName = this.categories.find(c => c.id === this.model.category)?.name || 'Uncategorized';

        // Close the dialog and pass the updated row with category name
        this.dialogRef.close({ 
          updatedRow: { 
            ...this.model,
            receipt: newUrl,
            category: categoryName
          }
        });
      }, 700);
      console.log(this.data.rowData.receipt);
    } catch (error: any) {
      console.error('Error updating income:', error);
      this.errorMessage = error.message || "Failed to update income";
    }
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.amount != 0 && this.model.name != '' && !this.isDateInFuture() && this.model.category != '' && this.isValidImage(this.selectedFile);
  }

  isDateInFuture(): boolean {
    const inputDate = new Date(this.model.date);
    const today = new Date();

    // Remove time part (compare only dates)
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  isValidImage(file: File | null): boolean {
    if(file === null) return true;
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? allowedExtensions.includes(fileExtension) : false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
}