import { Component, Inject, input, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { IncomeSource } from '../../../model/income_source';
import { DashboardService } from '../../../../services/dashboard.service';
import { NgFor, NgIf } from '@angular/common';
import { addIncomeCategoryPopup } from '../../add-category/add-income-category-popup';

@Component({
  selector: 'app-add-income-source-popup',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './add-income-source-popup.html',
  styleUrl: './add-income-source-popup.css'
})
export class addIncomeSourcePopup {
  addClicked: boolean = false;
  model = {
    name: "",
    category: "",
    amount: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  };
  errorMessage: string = "";

  categories!: {id: string, name: string}[];

  constructor(private dialogRef: MatDialogRef<addIncomeSourcePopup>, private catDiagRef: MatDialog, private dash: DashboardService) {}

  async ngOnInit() {
    this.categories = await this.dash.fetchCategoriesByType('income');
    this.model.category = this.categories[0].id;
  }

  animateAdd() {
    this.addClicked = true;
    setTimeout(() => this.addClicked = false, 700);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  async onSubmit(f: NgForm): Promise<void> {
    if (f.invalid) return;

    console.log(this.model);

    try {
      await this.dash.addIncomeSource(this.model);
      f.reset();
      this.errorMessage = "";
    } catch(err) {
      this.errorMessage = "An Error occured while adding income source";
    }
  }

  isDateInFuture(): boolean {
    const inputDate = new Date(this.model.date);
    const today = new Date();

    // Remove time part (compare only dates)
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today;
  }

  openAddCategoryPopup() {
    const dialogRef = this.catDiagRef.open(addIncomeCategoryPopup, {
      width: '400px',
      panelClass: 'add-income-category-dialog'
    });

    dialogRef.afterClosed().subscribe(result => this.updateCategories());
  }

  async updateCategories() {
    this.categories = await this.dash.fetchCategoriesByType('income');
  }
}
