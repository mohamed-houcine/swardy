import { Component } from '@angular/core';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { DashboardService } from '../../../../services/dashboard.service';
import { NgFor, NgIf } from '@angular/common';
import { addIncomeCategoryPopup } from '../../add-category/income-category/add-income-category-popup';

@Component({
  selector: 'app-add-income-source-popup',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './add-expense-product-popup.html',
  styleUrl: './add-expense-product-popup.css'
})
export class addExpenseProductPopup {
  addClicked: boolean = false;
  model = {
    product: "",
    category: "",
    quantity: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  };
  selectedFile: File | null = null;
  errorMessage: string = "";

  categories!: {id: string, name: string}[];
  products!: {id: string, name: string}[];

  constructor(private dialogRef: MatDialogRef<addExpenseProductPopup>, private catDiagRef: MatDialog, private dash: DashboardService) {}

  async ngOnInit() {
    this.categories = await this.dash.fetchCategoriesByType('product');
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
      await this.dash.addExpenseProduct(
        this.model,
        this.selectedFile
      );
      f.reset(this.resetModel());
      this.model = this.resetModel();
      this.errorMessage = "";
      this.animateAdd();
    } catch(err) {
      this.errorMessage = "An Error occured while adding expense";
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
    this.categories = await this.dash.fetchCategoriesByType('expense');
  }

  async onCategoryChange(category: string) {
    try {
      this.products = await this.dash.fetchProductsByCategory(category);
      console.log(this.products);
    } catch(err) {
      console.log(err);
    }
  }

  resetModel() {
    return {product: "", category: "", quantity: 0, notes: '', date: new Date().toISOString().split('T')[0]};
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.quantity != 0 && this.model.product != '' && !this.isDateInFuture() && this.model.category != '' && this.isValidImage(this.selectedFile);
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