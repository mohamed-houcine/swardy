import { Component } from '@angular/core';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { DashboardService } from '../../../../services/dashboard.service';
import { NgFor, NgIf } from '@angular/common';
import { addIncomeCategoryPopup } from '../../add-category/income-category/add-income-category-popup';

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
  }

  animateAdd() {
    this.addClicked = true;
    setTimeout(() => this.addClicked = false, 700);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  async onSubmit(f: NgForm): Promise<void> {
    if (!this.checkValidity(f)) return;

    try {
      await this.dash.addIncomeSource(this.model);
      f.reset(this.resetModel());
      this.model = this.resetModel();
      this.errorMessage = "";
      this.animateAdd();
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
      width: '800px',
      panelClass: 'popup'
    });

    dialogRef.afterClosed().subscribe(result => this.updateCategories());
  }

  async updateCategories() {
    this.categories = await this.dash.fetchCategoriesByType('income');
  }

  resetModel() {
    return {name: "", category: "", amount: 0, notes: '', date: new Date().toISOString().split('T')[0]};
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.amount != 0 && this.model.name != '' && !this.isDateInFuture() && this.model.category != '';
  }
}